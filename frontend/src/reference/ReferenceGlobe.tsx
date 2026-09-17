import { useEffect, useMemo, useRef, useState } from 'react';
import type { BrowserCapabilities } from '../platform/capabilities';
import { geoPointToViewAngles, referenceViewMode, screenPointToGeo, type ReferenceGeoPoint } from './referenceMath';

type Props = {
  capabilities: BrowserCapabilities;
  locale: 'ar' | 'en';
  onPoint?: (point: ReferenceGeoPoint) => void;
  focusPoint?: ReferenceGeoPoint | null;
  focusLabel?: string;
};

type DragState = { x: number; y: number; yaw: number; pitch: number } | null;

const vertexShaderSource = `#version 300 es
in vec3 a_position;
uniform mat4 u_matrix;
void main() { gl_Position = u_matrix * vec4(a_position, 1.0); }
`;
const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() { outColor = vec4(0.42, 0.78, 0.92, 0.95); }
`;
function multiply(a:number[],b:number[]){const out=new Array(16).fill(0);for(let r=0;r<4;r+=1)for(let c=0;c<4;c+=1)for(let k=0;k<4;k+=1)out[r*4+c]+=a[r*4+k]*b[k*4+c];return out;}
function rotationMatrix(yaw:number,pitch:number){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);return multiply([1,0,0,0,0,cp,-sp,0,0,sp,cp,0,0,0,0,1],[cy,0,sy,0,0,1,0,0,-sy,0,cy,0,0,0,0,1]);}
function buildGrid(){const vertices:number[]=[];const polar=6356752.314245179/6378137;const push=(lat:number,lon:number)=>{const phi=lat*Math.PI/180,lam=lon*Math.PI/180,c=Math.cos(phi);vertices.push(c*Math.cos(lam),polar*Math.sin(phi),c*Math.sin(lam));};for(let lat=-75;lat<=75;lat+=15)for(let lon=-180;lon<180;lon+=5){push(lat,lon);push(lat,lon+5);}for(let lon=-180;lon<180;lon+=15)for(let lat=-90;lat<90;lat+=5){push(lat,lon);push(lat+5,lon);}return new Float32Array(vertices);}
function compile(gl:WebGL2RenderingContext,type:number,source:string){const shader=gl.createShader(type);if(!shader)throw new Error('Unable to create shader');gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)??'Shader compile failed');return shader;}

export function ReferenceGlobe({ capabilities, locale, onPoint, focusPoint, focusLabel }: Props) {
  const mode=useMemo(()=>referenceViewMode(capabilities),[capabilities]);
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const [yaw,setYaw]=useState(-0.55); const [pitch,setPitch]=useState(0.28);
  const [selected,setSelected]=useState<ReferenceGeoPoint>({latitude:25.2854,longitude:51.531});
  const drag=useRef<DragState>(null);

  useEffect(()=>{if(!focusPoint)return;setSelected(focusPoint);const view=geoPointToViewAngles(focusPoint);setYaw(view.yaw);setPitch(view.pitch);onPoint?.(focusPoint);},[focusPoint?.latitude,focusPoint?.longitude]);

  useEffect(()=>{if(mode!=='webgl3d')return;const canvas=canvasRef.current;if(!canvas)return;const gl=canvas.getContext('webgl2',{antialias:true,alpha:false});if(!gl)return;const program=gl.createProgram();if(!program)return;const vs=compile(gl,gl.VERTEX_SHADER,vertexShaderSource),fs=compile(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)??'Program link failed');const position=gl.getAttribLocation(program,'a_position'),matrix=gl.getUniformLocation(program,'u_matrix'),buffer=gl.createBuffer(),grid=buildGrid();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,grid,gl.STATIC_DRAW);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);const render=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.025,.07,.12,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(program);const aspect=canvas.width/canvas.height,sx=aspect>=1?.78/aspect:.78,sy=aspect>=1?.78:.78*aspect;gl.uniformMatrix4fv(matrix,false,new Float32Array(multiply([sx,0,0,0,0,sy,0,0,0,0,.78,0,0,0,0,1],rotationMatrix(yaw,pitch))));gl.drawArrays(gl.LINES,0,grid.length/3);};render();const observer=new ResizeObserver(render);observer.observe(canvas);return()=>{observer.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};},[mode,yaw,pitch]);

  const choose=(point:ReferenceGeoPoint)=>{setSelected(point);onPoint?.(point);};
  if(mode==='fallback2d')return <section className="reference-card" data-mode="fallback2d"><div className="reference-card__head"><div><strong>WGS84 Reference</strong><span>2D fallback · EPSG:4979</span></div><span className="evidence-badge">REFERENCE_RESULT</span></div><div className="reference-fallback" role="img" aria-label="WGS84 2D fallback"><svg viewBox="0 0 360 180" onClick={(event)=>{const rect=event.currentTarget.getBoundingClientRect();choose({latitude:90-((event.clientY-rect.top)/rect.height)*180,longitude:((event.clientX-rect.left)/rect.width)*360-180});}}><rect width="360" height="180" rx="8"/>{[-120,-60,0,60,120].map((x)=><line key={`v${x}`} x1={x+180} x2={x+180} y1="0" y2="180"/>)}{[-60,-30,0,30,60].map((y)=><line key={`h${y}`} x1="0" x2="360" y1={90-y} y2={90-y}/>)}{focusPoint&&<circle cx={(focusPoint.longitude+180)} cy={(90-focusPoint.latitude)} r="4" className="reference-focus-marker"/>}</svg></div><ReferenceReadout locale={locale} point={selected} mode="2D fallback" label={focusLabel}/></section>;
  return <section className="reference-card" data-mode="webgl3d"><div className="reference-card__head"><div><strong>WGS84 Reference</strong><span>Interactive WebGL2 ellipsoid · EPSG:4979</span></div><span className="evidence-badge">REFERENCE_RESULT</span></div><div className="reference-globe-wrap"><canvas ref={canvasRef} className="reference-globe" onPointerDown={(e)=>{drag.current={x:e.clientX,y:e.clientY,yaw,pitch};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={(e)=>{if(!drag.current)return;setYaw(drag.current.yaw+(e.clientX-drag.current.x)*.008);setPitch(Math.max(-1.25,Math.min(1.25,drag.current.pitch+(e.clientY-drag.current.y)*.008)));}} onPointerUp={(e)=>{const start=drag.current;drag.current=null;if(!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)return;const rect=e.currentTarget.getBoundingClientRect(),point=screenPointToGeo(e.clientX-rect.left,e.clientY-rect.top,rect.width,rect.height,yaw,pitch);if(point)choose(point);}}/>{focusPoint&&<span className="reference-focus-dot" aria-label="selected Phase 3 place"/>}</div><ReferenceReadout locale={locale} point={selected} mode="WebGL2 3D" label={focusLabel}/></section>;
}
function ReferenceReadout({locale,point,mode,label}:{locale:'ar'|'en';point:ReferenceGeoPoint;mode:string;label?:string}){return <div className="reference-readout"><span>{locale==='ar'?'الوضع':'Mode'}: {mode}</span>{label&&<span>{locale==='ar'?'المكان':'Place'}: {label}</span>}<span>Lat {point.latitude.toFixed(6)}°</span><span>Lon {point.longitude.toFixed(6)}°</span><span>WGS 84</span></div>;}
