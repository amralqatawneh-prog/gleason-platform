import { useEffect, useMemo, useRef, useState } from 'react';
import type { OfflinePlace } from '../offline/searchIndex';
import type { BrowserCapabilities } from '../platform/capabilities';
import { countryBoundaryRings } from './countryGeometry';
import { buildGlobeLabels, declutterProjectedLabels } from './globeLabels';
import type { GlobeLayerVisibility } from './globeLayers';
import { localGeodeticToEcef } from './offlineWgs84';
import { GLOBE_CLIP_SCALE, WGS84_POLAR_RATIO, latLonToEllipsoid, fallbackScreenPointToGeo, draggedYaw, geoPointToViewAngles, projectGeoToScreen, referenceViewMode, screenPointToGeo, type ReferenceGeoPoint } from './referenceMath';

type Props = {
  capabilities: BrowserCapabilities;
  locale: 'ar' | 'en';
  onPoint?: (point: ReferenceGeoPoint) => void;
  focusPoint?: ReferenceGeoPoint | null;
  focusLabel?: string;
  layers?: GlobeLayerVisibility;
  layerPlaces?: OfflinePlace[];
};

type DragState = { x: number; y: number; yaw: number; pitch: number } | null;

const vertexShaderSource = `#version 300 es
in vec3 a_position;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_sx;
uniform float u_sy;
uniform float u_point_size;
out float v_facing;
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
in float v_facing;
out vec4 outColor;
void main() { if (v_facing <= 0.0) discard; outColor = u_color; }
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

export function ReferenceGlobe({ capabilities, locale, onPoint, focusPoint, focusLabel, layers, layerPlaces = [] }: Props) {
  const mode = useMemo(() => referenceViewMode(capabilities), [capabilities]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [yaw, setYaw] = useState(-0.55);
  const [pitch, setPitch] = useState(0.28);
  const [selected, setSelected] = useState<ReferenceGeoPoint>({ latitude: 25.2854, longitude: 51.531 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const drag = useRef<DragState>(null);
  const countryVertices = useMemo(() => buildCountries(), []);
  const placeVertices = useMemo(() => buildPlaces(layerPlaces), [layerPlaces]);
  const countryPaths = useMemo(() => countryBoundaryRings().map(fallbackPath), []);
  const labels = useMemo(() => layers ? buildGlobeLabels(layerPlaces, layers, locale) : [], [layerPlaces, layers, locale]);
  const projectedLabels = useMemo(() => declutterProjectedLabels(
    labels.flatMap((label) => {
      const screen = projectGeoToScreen(label, viewport.width, viewport.height, yaw, pitch);
      return screen ? [{ label, screen }] : [];
    }),
    viewport.width,
    viewport.height,
    52,
  ), [labels, viewport, yaw, pitch]);

  useEffect(() => {
    if (!focusPoint) return;
    setSelected(focusPoint);
    const view = geoPointToViewAngles(focusPoint);
    setYaw(view.yaw);
    setPitch(view.pitch);
    onPoint?.(focusPoint);
  }, [focusPoint?.latitude, focusPoint?.longitude]);

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
    const gridBuffer = gl.createBuffer();
    const countryBuffer = gl.createBuffer();
    const placeBuffer = gl.createBuffer();
    const grid = buildGrid();

    const upload = (buffer: WebGLBuffer | null, data: Float32Array) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    };
    upload(gridBuffer, grid); upload(countryBuffer, countryVertices); upload(placeBuffer, placeVertices);
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
      gl.uniform1f(sxUniform, aspect >= 1 ? GLOBE_CLIP_SCALE / aspect : GLOBE_CLIP_SCALE);
      gl.uniform1f(syUniform, aspect >= 1 ? GLOBE_CLIP_SCALE : GLOBE_CLIP_SCALE * aspect);
      draw(gridBuffer, grid, gl.LINES, [0.20, 0.43, 0.58, 0.34]);
      if (layers?.countries !== false) draw(countryBuffer, countryVertices, gl.LINES, [0.86, 0.91, 0.82, 0.98]);
      if (placeVertices.length) draw(placeBuffer, placeVertices, gl.POINTS, [0.98, 0.72, 0.34, 0.98], Math.max(3, 3 * dpr));
    };

    render();
    const observer = new ResizeObserver(render); observer.observe(canvas);
    return () => { observer.disconnect(); gl.deleteBuffer(gridBuffer); gl.deleteBuffer(countryBuffer); gl.deleteBuffer(placeBuffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); };
  }, [mode, yaw, pitch, countryVertices, placeVertices, layers?.countries]);

  const marker = projectGeoToScreen(selected, viewport.width, viewport.height, yaw, pitch);
  const selectedLabel = focusPoint && Math.abs(selected.latitude - focusPoint.latitude) < 1e-9 && Math.abs(selected.longitude - focusPoint.longitude) < 1e-9 ? focusLabel : undefined;
  const choose = (point: ReferenceGeoPoint) => { setSelected(point); onPoint?.(point); };

  if (mode === 'fallback2d') {
    const fallbackLabels = labels.slice(0, 80);
    return <section className="reference-card" data-mode="fallback2d">
      <div className="reference-card__head"><div><strong>WGS84 Reference</strong><span>2D fallback · EPSG:4979</span></div><span className="evidence-badge">REFERENCE_RESULT</span></div>
      <div className="reference-fallback" role="img" aria-label="WGS84 2D fallback"><svg viewBox="0 0 360 180" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const point = fallbackScreenPointToGeo(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height); if (point) choose(point); }}>
        <rect width="360" height="180" rx="8"/>
        {[-120,-60,0,60,120].map((x)=><line key={`v${x}`} x1={x+180} x2={x+180} y1="0" y2="180"/>)}
        {[-60,-30,0,30,60].map((y)=><line key={`h${y}`} x1="0" x2="360" y1={90-y} y2={90-y}/>)}
        {layers?.countries !== false && countryPaths.map((d, index)=><path key={index} d={d} className="reference-country-line"/>)}
        {layerPlaces.filter((place)=>place.category!=='country').map((place)=><circle key={place.id} cx={place.longitude+180} cy={90-place.latitude} r="1.3" className={`reference-place-dot reference-place-${place.category}`}><title>{locale==='ar'&&place.nameAr?place.nameAr:place.name}</title></circle>)}
        {fallbackLabels.map((label)=><text key={label.id} x={label.longitude+180} y={90-label.latitude} className={`reference-map-label reference-map-label-${label.kind}`}><title>{label.provenance}</title>{label.text}</text>)}
        {<circle cx={selected.longitude+180} cy={90-selected.latitude} r="4" className="reference-focus-marker"/>}
      </svg></div>
      <ReferenceReadout locale={locale} point={selected} mode="2D fallback" label={selectedLabel} details={layerPlaces.length}/>
    </section>;
  }

  return <section className="reference-card" data-mode="webgl3d">
    <div className="reference-card__head"><div><strong>WGS84 Reference</strong><span>Interactive WebGL2 ellipsoid · EPSG:4979</span></div><span className="evidence-badge">REFERENCE_RESULT</span></div>
    <div className="reference-globe-wrap">
      <canvas ref={canvasRef} className="reference-globe" onPointerDown={(e)=>{drag.current={x:e.clientX,y:e.clientY,yaw,pitch};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={(e)=>{if(!drag.current)return;setYaw(draggedYaw(drag.current.yaw, e.clientX-drag.current.x));setPitch(Math.max(-1.25,Math.min(1.25,drag.current.pitch+(e.clientY-drag.current.y)*.008)));}} onPointerUp={(e)=>{const start=drag.current;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)return;const rect=e.currentTarget.getBoundingClientRect(),point=screenPointToGeo(e.clientX-rect.left,e.clientY-rect.top,rect.width,rect.height,yaw,pitch);if(point)choose(point);}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}/>
      <div className="reference-label-layer" aria-hidden="true">
        {projectedLabels.map(({label,screen,fontSizePx})=><span key={label.id} className={`reference-globe-label reference-globe-label-${label.kind}`} style={{left:screen.x,top:screen.y,fontSize:`${fontSizePx}px`}} title={label.provenance}>{label.text}</span>)}
      </div>
      {marker?.visible&&<span className="reference-focus-dot" style={{left:marker.x,top:marker.y}} aria-label={locale==='ar'?'النقطة المحددة':'Selected point'}/>}
    </div>
    <ReferenceReadout locale={locale} point={selected} mode="WebGL2 3D" label={selectedLabel} details={layerPlaces.length}/>
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
