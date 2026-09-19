import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { OfflinePlace } from '../offline/searchIndex';
import type { BrowserCapabilities } from '../platform/capabilities';
import { buildEllipsoidSurface } from './ellipsoidSurface';
import { countryBoundaryRings } from './countryGeometry';
import { buildGlobeLabels, declutterProjectedLabels } from './globeLabels';
import type { GlobeLayerVisibility } from './globeLayers';
import { localGeodeticToEcef } from './offlineWgs84';
import { GLOBE_CLIP_SCALE, WGS84_POLAR_RATIO, clampLatitude, clampReferenceZoom, latLonToEllipsoid, draggedYaw, geoPointToViewAngles, normalizeLongitude, projectGeoToScreen, referenceViewMode, screenPointToGeo, type ReferenceGeoPoint } from './referenceMath';

type Props = {
  capabilities: BrowserCapabilities;
  locale: 'ar' | 'en';
  onPoint?: (point: ReferenceGeoPoint) => void;
  focusPoint?: ReferenceGeoPoint | null;
  selectionPoint: ReferenceGeoPoint | null;
  selectionLabel?: string;
  layers?: GlobeLayerVisibility;
  layerPlaces?: OfflinePlace[];
};

type DragState = { pointerId:number; x: number; y: number; yaw: number; pitch: number } | null;
type BoxZoomState={pointerId:number;startX:number;startY:number;currentX:number;currentY:number}|null;
type PinchState={distance:number;zoom:number}|null;
type FallbackDragState={pointerId:number;x:number;y:number;center:ReferenceGeoPoint}|null;
const DEFAULT_YAW=-0.55,DEFAULT_PITCH=0.28;

const vertexShaderSource = `#version 300 es
in vec3 a_position;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_sx;
uniform float u_sy;
uniform float u_point_size;
out highp float v_facing;
void main() {
  float cy = cos(u_yaw);
  float sy = sin(u_yaw);
  vec3 p = vec3(cy * a_position.x + sy * a_position.z, a_position.y, -sy * a_position.x + cy * a_position.z);
  float cp = cos(u_pitch);
  float sp = sin(u_pitch);
  p = vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);
  vec3 n = vec3(a_position.x, a_position.y / ${WGS84_POLAR_RATIO ** 2}, a_position.z);
  float nz = -sy * n.x + cy * n.z;
  v_facing = sp * n.y + cp * nz;
  gl_Position = vec4(-p.x * u_sx, p.y * u_sy, -p.z * ${GLOBE_CLIP_SCALE}, 1.0);
  gl_PointSize = u_point_size;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec4 u_color;
uniform bool u_surface;
in highp float v_facing;
out vec4 outColor;
void main() {
  if (v_facing <= 0.0) discard;
  // View-relative display shading only; this is not a solar day/night model.
  float shade = u_surface ? 0.55 + 0.45 * clamp(v_facing, 0.0, 1.0) : 1.0;
  outColor = vec4(u_color.rgb * shade, u_color.a);
}
`;

function pushEllipsoid(target: number[], lat: number, lon: number): void {
  target.push(...latLonToEllipsoid({ latitude: lat, longitude: lon }));
}

function buildGrid(): Float32Array {
  const vertices: number[] = [];
  for (let lat = -75; lat <= 75; lat += 15) for (let lon = -180; lon < 180; lon += 5) { pushEllipsoid(vertices, lat, lon); pushEllipsoid(vertices, lat, lon + 5); }
  for (let lon = -180; lon < 180; lon += 15) for (let lat = -90; lat < 90; lat += 5) { pushEllipsoid(vertices, lat, lon); pushEllipsoid(vertices, lat + 5, lon); }
  return new Float32Array(vertices);
}

function buildCountries(): Float32Array {
  const vertices: number[] = [];
  for (const ring of countryBoundaryRings()) {
    for (let index = 1; index < ring.length; index += 1) {
      const [lonA, latA] = ring[index - 1];
      const [lonB, latB] = ring[index];
      if (Math.abs(lonB - lonA) > 180) continue;
      pushEllipsoid(vertices, latA, lonA);
      pushEllipsoid(vertices, latB, lonB);
    }
  }
  return new Float32Array(vertices);
}

function buildPlaces(places: readonly OfflinePlace[]): Float32Array {
  const vertices: number[] = [];
  for (const place of places) {
    if (place.category === 'country') continue;
    pushEllipsoid(vertices, place.latitude, place.longitude);
  }
  return new Float32Array(vertices);
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile failed');
  return shader;
}

function fallbackPath(ring: readonly [number, number][]): string {
  let path = '';
  let penUp = true;
  let previousLon: number | null = null;
  for (const [lon, lat] of ring) {
    const x = lon + 180;
    const y = 90 - lat;
    if (previousLon != null && Math.abs(lon - previousLon) > 180) penUp = true;
    path += `${penUp ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
    penUp = false;
    previousLon = lon;
  }
  return path.trim();
}

function clampFallbackCenter(center:ReferenceGeoPoint,zoom:number):ReferenceGeoPoint{
  const z=clampReferenceZoom(zoom),halfW=180/z,halfH=90/z;
  const lonLimit=Math.max(0,180-halfW),latLimit=Math.max(0,90-halfH);
  return {latitude:Math.max(-latLimit,Math.min(latLimit,center.latitude)),longitude:Math.max(-lonLimit,Math.min(lonLimit,normalizeLongitude(center.longitude)))};
}
function pointerDistance(points:Map<number,{x:number;y:number}>):number{
  const values=[...points.values()];if(values.length<2)return 0;
  return Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y);
}
function svgClientToGeo(svg:SVGSVGElement,clientX:number,clientY:number):ReferenceGeoPoint|null{
  const matrix=svg.getScreenCTM();if(!matrix)return null;
  const point=svg.createSVGPoint();point.x=clientX;point.y=clientY;
  const local=point.matrixTransform(matrix.inverse());
  if(local.x<0||local.x>360||local.y<0||local.y>180)return null;
  return {latitude:90-local.y,longitude:normalizeLongitude(local.x-180)};
}

export function ReferenceGlobe({ capabilities, locale, onPoint, focusPoint, selectionPoint, selectionLabel, layers, layerPlaces = [] }: Props) {
  const mode = useMemo(() => referenceViewMode(capabilities), [capabilities]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<SVGSVGElement | null>(null);
  const [yaw, setYaw] = useState(DEFAULT_YAW);
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [zoom,setZoom]=useState(1);
  const [areaMode,setAreaMode]=useState(false);
  const [boxZoom,setBoxZoom]=useState<BoxZoomState>(null);
  const [fallbackCenter,setFallbackCenter]=useState<ReferenceGeoPoint>({latitude:0,longitude:0});
  const selected = selectionPoint ?? { latitude: 25.2854, longitude: 51.531 };
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const drag = useRef<DragState>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinch=useRef<PinchState>(null);
  const fallbackDrag=useRef<FallbackDragState>(null);
  const surfaceVertices = useMemo(() => buildEllipsoidSurface(), []);
  const countryVertices = useMemo(() => buildCountries(), []);
  const placeVertices = useMemo(() => buildPlaces(layerPlaces), [layerPlaces]);
  const countryPaths = useMemo(() => countryBoundaryRings().map(fallbackPath), []);
  const labels = useMemo(() => layers ? buildGlobeLabels(layerPlaces, layers, locale) : [], [layerPlaces, layers, locale]);
  const projectedLabels = useMemo(() => declutterProjectedLabels(
    labels.flatMap((label) => {
      const screen = projectGeoToScreen(label, viewport.width, viewport.height, yaw, pitch, zoom);
      return screen ? [{ label, screen }] : [];
    }),
    viewport.width,
    viewport.height,
    52,
  ), [labels, viewport, yaw, pitch, zoom]);

  useEffect(() => {
    if (mode !== 'fallback2d' || !fallbackRef.current) return;
    const svg = fallbackRef.current;
    const measure = () => { const rect = svg.getBoundingClientRect(); setViewport({width:rect.width,height:rect.height}); };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(svg);
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!focusPoint) return;
    if(mode==='fallback2d'){
      setFallbackCenter({latitude:focusPoint.latitude,longitude:normalizeLongitude(focusPoint.longitude)});
    }else{
      const view = geoPointToViewAngles(focusPoint);
      setYaw(view.yaw);
      setPitch(view.pitch);
    }
    // Applying parent state is navigation only; do not echo it as a free-point event.
  }, [focusPoint,mode]);

  useEffect(() => {
    if (mode !== 'webgl3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) return;
    const program = gl.createProgram();
    if (!program) return;
    const vs = compile(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed');

    const position = gl.getAttribLocation(program, 'a_position');
    const yawUniform = gl.getUniformLocation(program, 'u_yaw');
    const pitchUniform = gl.getUniformLocation(program, 'u_pitch');
    const sxUniform = gl.getUniformLocation(program, 'u_sx');
    const syUniform = gl.getUniformLocation(program, 'u_sy');
    const colorUniform = gl.getUniformLocation(program, 'u_color');
    const pointSizeUniform = gl.getUniformLocation(program, 'u_point_size');
    const surfaceUniform = gl.getUniformLocation(program, 'u_surface');
    const surfaceBuffer = gl.createBuffer();
    const gridBuffer = gl.createBuffer();
    const countryBuffer = gl.createBuffer();
    const placeBuffer = gl.createBuffer();
    const grid = buildGrid();

    const upload = (buffer: WebGLBuffer | null, data: Float32Array) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    };
    upload(surfaceBuffer, surfaceVertices); upload(gridBuffer, grid); upload(countryBuffer, countryVertices); upload(placeBuffer, placeVertices);
    gl.enableVertexAttribArray(position);

    const draw = (buffer: WebGLBuffer | null, data: Float32Array, modeValue: number, color: [number, number, number, number], pointSize = 1) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform4f(colorUniform, ...color);
      gl.uniform1f(pointSizeUniform, pointSize);
      gl.drawArrays(modeValue, 0, data.length / 3);
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      setViewport((current) => current.width === width && current.height === height ? current : { width, height });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.025, 0.07, 0.12, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);
      const aspect = canvas.width / canvas.height;
      gl.uniform1f(yawUniform, yaw);
      gl.uniform1f(pitchUniform, pitch);
      gl.uniform1f(sxUniform, (aspect >= 1 ? GLOBE_CLIP_SCALE / aspect : GLOBE_CLIP_SCALE) * zoom);
      gl.uniform1f(syUniform, (aspect >= 1 ? GLOBE_CLIP_SCALE : GLOBE_CLIP_SCALE * aspect) * zoom);
      gl.uniform1i(surfaceUniform, 1);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1);
      draw(surfaceBuffer, surfaceVertices, gl.TRIANGLES, [0.055, 0.25, 0.39, 1]);
      gl.disable(gl.POLYGON_OFFSET_FILL); gl.uniform1i(surfaceUniform, 0);
      // Overlay chords stay visible above the tessellated shell; shader-facing rejection still hides the rear.
      gl.disable(gl.DEPTH_TEST);
      draw(gridBuffer, grid, gl.LINES, [0.20, 0.43, 0.58, 0.34]);
      if (layers?.countries !== false) draw(countryBuffer, countryVertices, gl.LINES, [0.86, 0.91, 0.82, 0.98]);
      if (placeVertices.length) draw(placeBuffer, placeVertices, gl.POINTS, [0.98, 0.72, 0.34, 0.98], Math.max(3, 3 * dpr));
    };

    render();
    const observer = new ResizeObserver(render); observer.observe(canvas);
    return () => { observer.disconnect(); gl.deleteBuffer(surfaceBuffer); gl.deleteBuffer(gridBuffer); gl.deleteBuffer(countryBuffer); gl.deleteBuffer(placeBuffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); };
  }, [mode, yaw, pitch, zoom, surfaceVertices, countryVertices, placeVertices, layers?.countries]);

  const marker = selectionPoint ? projectGeoToScreen(selected, viewport.width, viewport.height, yaw, pitch, zoom) : null;
  const selectedLabel = selectionLabel;
  const choose = (point: ReferenceGeoPoint) => { onPoint?.(point); };
  const zoomBy=(factor:number)=>setZoom(current=>clampReferenceZoom(current*factor));
  const fitFull=()=>{
    setAreaMode(false);setBoxZoom(null);setZoom(1);
    if(mode==='fallback2d')setFallbackCenter({latitude:0,longitude:0});
  };
  const resetOrientation=()=>{
    if(mode==='webgl3d'){setYaw(DEFAULT_YAW);setPitch(DEFAULT_PITCH);}
  };
  const focusSelected=()=>{
    if(!selectionPoint)return;
    setAreaMode(false);setBoxZoom(null);
    if(mode==='fallback2d'){
      const nextZoom=clampReferenceZoom(Math.max(zoom,2));
      setZoom(nextZoom);setFallbackCenter(clampFallbackCenter(selectionPoint,nextZoom));
    }else{
      const view=geoPointToViewAngles(selectionPoint);
      setYaw(view.yaw);setPitch(view.pitch);setZoom(current=>clampReferenceZoom(Math.max(current,1.8)));
    }
  };
  const wheelZoom=(deltaY:number)=>zoomBy(deltaY<0?1.18:1/1.18);
  const boxStyle=boxZoom?{
    left:Math.min(boxZoom.startX,boxZoom.currentX),
    top:Math.min(boxZoom.startY,boxZoom.currentY),
    width:Math.abs(boxZoom.currentX-boxZoom.startX),
    height:Math.abs(boxZoom.currentY-boxZoom.startY),
  }:null;

  if (mode === 'fallback2d') {
    const z=clampReferenceZoom(zoom);
    const center=clampFallbackCenter(fallbackCenter,z);
    const viewWidth=360/z,viewHeight=180/z;
    const viewX=center.longitude+180-viewWidth/2,viewY=90-center.latitude-viewHeight/2;
    const scale=Math.min(viewport.width/viewWidth,viewport.height/viewHeight);
    const offsetX=(viewport.width-viewWidth*scale)/2,offsetY=(viewport.height-viewHeight*scale)/2;
    const fallbackLabels=scale>0?declutterProjectedLabels(labels.flatMap(label=>{
      const px=offsetX+(label.longitude+180-viewX)*scale,py=offsetY+(90-label.latitude-viewY)*scale;
      if(px<0||px>viewport.width||py<0||py>viewport.height)return [];
      return [{label,screen:{x:px,y:py,visible:true,depth:1}}];
    }),viewport.width,viewport.height,40):[];

    const pointerDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
      const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
      e.currentTarget.setPointerCapture(e.pointerId);
      if(areaMode){setBoxZoom({pointerId:e.pointerId,startX:x,startY:y,currentX:x,currentY:y});return;}
      pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.current.size===1)fallbackDrag.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY,center};
      else if(pointers.current.size===2){pinch.current={distance:pointerDistance(pointers.current),zoom:z};fallbackDrag.current=null;}
    };
    const pointerMove=(e:ReactPointerEvent<SVGSVGElement>)=>{
      const rect=e.currentTarget.getBoundingClientRect();
      if(areaMode&&boxZoom?.pointerId===e.pointerId){
        setBoxZoom({...boxZoom,currentX:e.clientX-rect.left,currentY:e.clientY-rect.top});return;
      }
      if(!pointers.current.has(e.pointerId))return;
      pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.current.size>=2){
        const distance=pointerDistance(pointers.current);
        if(!pinch.current)pinch.current={distance,zoom:z};
        if(pinch.current.distance>0)setZoom(clampReferenceZoom(pinch.current.zoom*distance/pinch.current.distance));
        return;
      }
      const state=fallbackDrag.current;if(!state||state.pointerId!==e.pointerId)return;
      const dx=e.clientX-state.x,dy=e.clientY-state.y;
      const next={latitude:state.center.latitude+dy/Math.max(1,rect.height)*viewHeight,longitude:state.center.longitude-dx/Math.max(1,rect.width)*viewWidth};
      setFallbackCenter(clampFallbackCenter(next,z));
    };
    const pointerUp=(e:ReactPointerEvent<SVGSVGElement>)=>{
      const rect=e.currentTarget.getBoundingClientRect();
      if(areaMode&&boxZoom?.pointerId===e.pointerId){
        const currentX=e.clientX-rect.left,currentY=e.clientY-rect.top;
        const width=Math.abs(currentX-boxZoom.startX),height=Math.abs(currentY-boxZoom.startY);
        const mid=svgClientToGeo(e.currentTarget,(e.clientX+rect.left+boxZoom.startX)/2,(e.clientY+rect.top+boxZoom.startY)/2);
        if(width>12&&height>12&&mid){
          const nextZoom=clampReferenceZoom(z*Math.min(rect.width/width,rect.height/height)*0.75);
          setZoom(nextZoom);setFallbackCenter(clampFallbackCenter(mid,nextZoom));
        }
        setBoxZoom(null);setAreaMode(false);
        if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
        return;
      }
      const state=fallbackDrag.current&&fallbackDrag.current.pointerId===e.pointerId?fallbackDrag.current:null;
      const wasPinch=pointers.current.size>1||pinch.current!==null;
      pointers.current.delete(e.pointerId);if(pointers.current.size<2)pinch.current=null;
      fallbackDrag.current=null;
      if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      if(wasPinch||!state||Math.hypot(e.clientX-state.x,e.clientY-state.y)>5)return;
      const point=svgClientToGeo(e.currentTarget,e.clientX,e.clientY);if(point)choose(point);
    };
    return <section className="reference-card" data-mode="fallback2d" data-view-zoom={z.toFixed(4)} data-area-mode={areaMode?'true':'false'} data-selected-latitude={selectionPoint?.latitude} data-selected-longitude={selectionPoint?.longitude}>
      <div className="reference-card__head"><div><strong>WGS84 Reference</strong><span>2D fallback · EPSG:4979 · north-up</span></div><span className="evidence-badge">REFERENCE_RESULT</span></div>
      <ReferenceNavigationToolbar locale={locale} mode={mode} zoom={z} areaMode={areaMode} hasSelection={!!selectionPoint}
        onZoomIn={()=>zoomBy(1.25)} onZoomOut={()=>zoomBy(1/1.25)} onArea={()=>{setAreaMode(!areaMode);setBoxZoom(null);}}
        onRotateLeft={()=>{}} onRotateRight={()=>{}} onPitchUp={()=>{}} onPitchDown={()=>{}} onReset={resetOrientation} onFit={fitFull} onFocus={focusSelected}/>
      <div className="reference-fallback" role="img" aria-label="WGS84 2D fallback">
        <div className="reference-fallback-map-wrap" onWheel={(e)=>{e.preventDefault();wheelZoom(e.deltaY);}}>
          <svg ref={fallbackRef} tabIndex={0} viewBox={viewX+' '+viewY+' '+viewWidth+' '+viewHeight}
            onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}
            onPointerCancel={(e)=>{pointers.current.delete(e.pointerId);pinch.current=null;fallbackDrag.current=null;setBoxZoom(null);}}
            onLostPointerCapture={(e)=>{pointers.current.delete(e.pointerId);pinch.current=null;fallbackDrag.current=null;}}>
            <rect width="360" height="180" rx="8"/>
            {[-120,-60,0,60,120].map((x)=><line key={'v'+x} x1={x+180} x2={x+180} y1="0" y2="180"/>)}
            {[-60,-30,0,30,60].map((y)=><line key={'h'+y} x1="0" x2="360" y1={90-y} y2={90-y}/>)}
            {layers?.countries !== false && countryPaths.map((d, index)=><path key={index} d={d} className="reference-country-line"/>)}
            {layerPlaces.filter((place)=>place.category!=='country').map((place)=><circle key={place.id} cx={place.longitude+180} cy={90-place.latitude} r={Math.max(.4,1.3/Math.max(1,z))} className={'reference-place-dot reference-place-'+place.category}><title>{locale==='ar'&&place.nameAr?place.nameAr:place.name}</title></circle>)}
            {fallbackLabels.map(({label,fontSizePx})=><text key={label.id} x={label.longitude+180} y={90-label.latitude} dominantBaseline="central" style={{fontSize:fontSizePx/scale}} className={'reference-map-label reference-map-label-'+label.kind}><title>{label.provenance}</title>{label.text}</text>)}
            {selectionPoint&&<circle cx={selected.longitude+180} cy={90-selected.latitude} r={Math.max(.8,4/Math.max(1,z))} className="reference-focus-marker"/>}
          </svg>
          {boxStyle&&<span className="navigation-zoom-box" style={boxStyle}/>}
        </div>
      </div>
      {selectionPoint&&<ReferenceReadout locale={locale} point={selected} mode="2D fallback" label={selectedLabel} details={layerPlaces.length}/>}
    </section>;
  }

  const pointerDown=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
    e.currentTarget.setPointerCapture(e.pointerId);
    if(areaMode){setBoxZoom({pointerId:e.pointerId,startX:x,startY:y,currentX:x,currentY:y});return;}
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.current.size===1)drag.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch};
    else if(pointers.current.size===2){pinch.current={distance:pointerDistance(pointers.current),zoom};drag.current=null;}
  };
  const pointerMove=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    if(areaMode&&boxZoom?.pointerId===e.pointerId){
      setBoxZoom({...boxZoom,currentX:e.clientX-rect.left,currentY:e.clientY-rect.top});return;
    }
    if(!pointers.current.has(e.pointerId))return;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.current.size>=2){
      const distance=pointerDistance(pointers.current);
      if(!pinch.current)pinch.current={distance,zoom};
      if(pinch.current.distance>0)setZoom(clampReferenceZoom(pinch.current.zoom*distance/pinch.current.distance));
      return;
    }
    const state=drag.current;if(!state||state.pointerId!==e.pointerId)return;
    setYaw(draggedYaw(state.yaw,e.clientX-state.x));
    setPitch(Math.max(-1.25,Math.min(1.25,state.pitch+(e.clientY-state.y)*.008)));
  };
  const pointerUp=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    if(areaMode&&boxZoom?.pointerId===e.pointerId){
      const currentX=e.clientX-rect.left,currentY=e.clientY-rect.top;
      const width=Math.abs(currentX-boxZoom.startX),height=Math.abs(currentY-boxZoom.startY);
      const centerX=(currentX+boxZoom.startX)/2,centerY=(currentY+boxZoom.startY)/2;
      const point=screenPointToGeo(centerX,centerY,rect.width,rect.height,yaw,pitch,zoom);
      if(width>12&&height>12&&point){
        const view=geoPointToViewAngles(point);setYaw(view.yaw);setPitch(view.pitch);
        setZoom(clampReferenceZoom(zoom*Math.min(rect.width/width,rect.height/height)*0.7));
      }
      setBoxZoom(null);setAreaMode(false);
      if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }
    const state=drag.current&&drag.current.pointerId===e.pointerId?drag.current:null;
    const wasPinch=pointers.current.size>1||pinch.current!==null;
    pointers.current.delete(e.pointerId);if(pointers.current.size<2)pinch.current=null;
    drag.current=null;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    if(wasPinch||!state||Math.hypot(e.clientX-state.x,e.clientY-state.y)>5)return;
    const point=screenPointToGeo(e.clientX-rect.left,e.clientY-rect.top,rect.width,rect.height,yaw,pitch,zoom);if(point)choose(point);
  };

  return <section className="reference-card" data-mode="webgl3d" data-view-yaw={yaw} data-view-pitch={pitch} data-view-zoom={zoom.toFixed(4)} data-area-mode={areaMode?'true':'false'} data-selected-latitude={selectionPoint?.latitude} data-selected-longitude={selectionPoint?.longitude}>
    <div className="reference-card__head"><div><strong>WGS84 Reference</strong><span>Interactive WebGL2 ellipsoid · EPSG:4979</span></div><span className="evidence-badge">REFERENCE_RESULT</span></div>
    <ReferenceNavigationToolbar locale={locale} mode={mode} zoom={zoom} areaMode={areaMode} hasSelection={!!selectionPoint}
      onZoomIn={()=>zoomBy(1.25)} onZoomOut={()=>zoomBy(1/1.25)} onArea={()=>{setAreaMode(!areaMode);setBoxZoom(null);}}
      onRotateLeft={()=>setYaw(current=>current-Math.PI/12)} onRotateRight={()=>setYaw(current=>current+Math.PI/12)}
      onPitchUp={()=>setPitch(current=>Math.min(1.25,current+Math.PI/18))} onPitchDown={()=>setPitch(current=>Math.max(-1.25,current-Math.PI/18))}
      onReset={resetOrientation} onFit={fitFull} onFocus={focusSelected}/>
    <div className="reference-globe-wrap" onWheel={(e)=>{e.preventDefault();wheelZoom(e.deltaY);}}>
      <canvas ref={canvasRef} tabIndex={0} className={'reference-globe'+(areaMode?' zoom-area-mode':'')}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}
        onPointerCancel={(e)=>{pointers.current.delete(e.pointerId);pinch.current=null;drag.current=null;setBoxZoom(null);}}
        onLostPointerCapture={(e)=>{pointers.current.delete(e.pointerId);pinch.current=null;drag.current=null;}}/>
      <div className="reference-label-layer" aria-hidden="true">
        {projectedLabels.map(({label,screen,fontSizePx})=><span key={label.id} className={'reference-globe-label reference-globe-label-'+label.kind} style={{left:screen.x,top:screen.y,fontSize:fontSizePx+'px'}} title={label.provenance}>{label.text}</span>)}
      </div>
      {marker?.visible&&<span className="reference-focus-dot" style={{left:marker.x,top:marker.y}} aria-label={locale==='ar'?'النقطة المحددة':'Selected point'}/>}
      {boxStyle&&<span className="navigation-zoom-box" style={boxStyle}/>}
    </div>
    {selectionPoint&&<ReferenceReadout locale={locale} point={selected} mode="WebGL2 3D" label={selectedLabel} details={layerPlaces.length}/>}
  </section>;
}

function ReferenceReadout({locale,point,mode,label,details}:{locale:'ar'|'en';point:ReferenceGeoPoint;mode:string;label?:string;details:number}) {
  const ecef = localGeodeticToEcef(point);
  return <div className="reference-readout"><span>{locale==='ar'?'الوضع':'Mode'}: {mode}</span>{label&&<span>{locale==='ar'?'المكان':'Place'}: {label}</span>}<span>Lat {point.latitude.toFixed(6)}°</span><span>Lon {point.longitude.toFixed(6)}°</span><span>{locale==='ar'?'معالم':'Features'}: {details}</span><span>WGS 84</span>
    <details><summary>{locale==='ar'?'الإحداثيات الديكارتية ECEF':'ECEF coordinates'}</summary>
      <div dir="ltr">X {ecef.output.x_m.toFixed(3)} m · Y {ecef.output.y_m.toFixed(3)} m · Z {ecef.output.z_m.toFixed(3)} m</div>
      <small>{locale==='ar'?'حساب محلي؛ الارتفاع الإهليلجي 0 م':'Local calculation; ellipsoidal height 0 m'} · EPSG:4978 · {ecef.provenance.implementation} {ecef.provenance.implementation_version} · REFERENCE_RESULT</small>
    </details>
  </div>;
}


function ReferenceNavigationToolbar({locale,mode,zoom,areaMode,hasSelection,onZoomIn,onZoomOut,onArea,onRotateLeft,onRotateRight,onPitchUp,onPitchDown,onReset,onFit,onFocus}:{
  locale:'ar'|'en';mode:'webgl3d'|'fallback2d';zoom:number;areaMode:boolean;hasSelection:boolean;
  onZoomIn:()=>void;onZoomOut:()=>void;onArea:()=>void;onRotateLeft:()=>void;onRotateRight:()=>void;
  onPitchUp:()=>void;onPitchDown:()=>void;onReset:()=>void;onFit:()=>void;onFocus:()=>void;
}){
  const ar=locale==='ar',threeD=mode==='webgl3d';
  const labels=ar?{
    nav:'أدوات تنقل WGS84',zoomIn:'تقريب',zoomOut:'تبعيد',area:'تكبير إلى منطقة',
    left:'تدوير يسار',right:'تدوير يمين',up:'إمالة لأعلى',down:'إمالة لأسفل',
    reset:'إعادة اتجاه العرض',fit:'إظهار النموذج كاملًا',focus:'التركيز على المحدد',
    unavailable:'التدوير والإمالة غير مدعومين في العرض الاحتياطي ثنائي الأبعاد'
  }:{
    nav:'WGS84 navigation',zoomIn:'Zoom in',zoomOut:'Zoom out',area:'Zoom to area',
    left:'Rotate left',right:'Rotate right',up:'Tilt up',down:'Tilt down',
    reset:'Reset view direction',fit:'Fit full model',focus:'Focus selected',
    unavailable:'Rotation and tilt are unavailable in the 2D fallback'
  };
  return <nav className="navigation-toolbar reference-navigation-toolbar" aria-label={labels.nav}>
    <button type="button" onClick={onZoomIn} aria-label={labels.zoomIn} title={labels.zoomIn}>＋</button>
    <button type="button" onClick={onZoomOut} aria-label={labels.zoomOut} title={labels.zoomOut}>－</button>
    <button type="button" className={areaMode?'active':''} aria-pressed={areaMode} onClick={onArea} aria-label={labels.area} title={labels.area}>▭</button>
    <button type="button" disabled={!threeD} onClick={onRotateLeft} aria-label={labels.left} title={threeD?labels.left:labels.unavailable}>↺</button>
    <button type="button" disabled={!threeD} onClick={onRotateRight} aria-label={labels.right} title={threeD?labels.right:labels.unavailable}>↻</button>
    <button type="button" disabled={!threeD} onClick={onPitchUp} aria-label={labels.up} title={threeD?labels.up:labels.unavailable}>↑</button>
    <button type="button" disabled={!threeD} onClick={onPitchDown} aria-label={labels.down} title={threeD?labels.down:labels.unavailable}>↓</button>
    <button type="button" disabled={!threeD} onClick={onReset} aria-label={labels.reset} title={threeD?labels.reset:labels.unavailable}>0°</button>
    <button type="button" onClick={onFit} aria-label={labels.fit} title={labels.fit}>⌂</button>
    <button type="button" disabled={!hasSelection} onClick={onFocus} aria-label={labels.focus} title={labels.focus}>◎</button>
    <span className="navigation-readout" dir="ltr">z {zoom.toFixed(2)}</span>
  </nav>;
}
