import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import CircleGeometry from 'ol/geom/Circle.js';
import DragZoom from 'ol/interaction/DragZoom.js';
import VectorLayer from 'ol/layer/Vector.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import VectorSource from 'ol/source/Vector.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import View from 'ol/View.js';
import { always } from 'ol/events/condition.js';
import { aeForward, AE_CODE } from '../models/ae';
import { gleasonAdapter } from '../comparison/adapters/gleasonAdapter';
import { aeAdapter } from '../comparison/adapters/aeAdapter';
import type { GeoPoint } from '../models/projectionTypes';
import { GLEASON_CODE, registerPhase2Projections } from './registerProjections';
import { worldCountriesGeoJson } from './worldData';

export type Phase2MapModel = 'gleason' | 'ae';
interface Props {
  model: Phase2MapModel;
  locale: 'ar' | 'en';
  onPoint: (model: Phase2MapModel, point: GeoPoint) => void;
  selectionPoint: GeoPoint | null;
  selectionLabel?: string;
}
type NavState={zoom:number;rotation:number;centerX:number;centerY:number};

const landStyle = new Style({ fill: new Fill({ color: 'rgba(197, 210, 198, 0.34)' }), stroke: new Stroke({ color: '#8ca39a', width: 0.8 }) });
const boundaryStyle = new Style({ fill: new Fill({ color: 'rgba(0,0,0,0)' }), stroke: new Stroke({ color: '#d6b66f', width: 1.5 }) });

export function ProjectionMap({ model, locale, onPoint, selectionPoint, selectionLabel }: Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const mapRef = useRef<Map | null>(null);
  const viewRef = useRef<View | null>(null);
  const dragZoomRef = useRef<DragZoom | null>(null);
  const fullExtentRef = useRef<[number,number,number,number] | null>(null);
  const zoomAreaActiveRef = useRef(false);
  const [zoomAreaActive,setZoomAreaActive]=useState(false);
  const [nav,setNav]=useState<NavState>({zoom:0,rotation:0,centerX:0,centerY:0});

  useEffect(() => {
    if (!targetRef.current) return;
    registerPhase2Projections();
    const projection = model === 'gleason' ? GLEASON_CODE : AE_CODE;
    const features = new GeoJSON().readFeatures(worldCountriesGeoJson(), { dataProjection: 'EPSG:4326', featureProjection: projection });
    const countryLayer = new VectorLayer({ source: new VectorSource({ features }), style: landStyle });
    const south = aeForward({ latitude: -90, longitude: 0 });
    const radius = model === 'gleason' ? 1 : Math.hypot(south.x, south.y);
    const extent:[number,number,number,number]=[-radius,-radius,radius,radius];
    fullExtentRef.current=extent;
    const boundaryLayer = new VectorLayer({ source: new VectorSource({ features: [new Feature(new CircleGeometry([0, 0], radius))] }), style: boundaryStyle });
    const view = new View({ projection, center: [0, 0], rotation:0 });
    const map = new Map({ target: targetRef.current, layers: [countryLayer, boundaryLayer], view, controls: [] });
    mapRef.current=map;viewRef.current=view;
    const dragZoom=new DragZoom({condition:always,duration:180});
    dragZoom.setActive(false);
    map.addInteraction(dragZoom);dragZoomRef.current=dragZoom;

    const marker = document.createElement('span');
    marker.className = 'projection-selection-marker'; marker.setAttribute('aria-hidden', 'true');
    Object.assign(marker.style, {display:'block',width:'14px',height:'14px',border:'2px solid white',borderRadius:'50%',background:'#f4c95d',boxShadow:'0 0 0 2px #172b36',pointerEvents:'none'});
    const overlay = new Overlay({ element: marker, positioning: 'center-center', stopEvent: false });
    map.addOverlay(overlay); overlayRef.current = overlay;

    const sync=()=>{
      const center=view.getCenter()??[0,0];
      setNav({zoom:view.getZoom()??0,rotation:view.getRotation()??0,centerX:center[0],centerY:center[1]});
    };
    view.fit(extent, { size: map.getSize(), padding: [22,22,22,22], maxZoom: 4 });
    sync();
    map.on('moveend',sync);
    map.on('singleclick', (event) => {
      if(zoomAreaActiveRef.current)return;
      try {
        const adapter = model === 'gleason' ? gleasonAdapter : aeAdapter;
        const point = adapter.inverse({ kind: 'plane', modelId: adapter.metadata.modelId,
          modelVersion: adapter.metadata.modelVersion, units: adapter.metadata.units,
          x: event.coordinate[0], y: event.coordinate[1] }).value;
        if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180) onPoint(model, point);
      } catch { /* outside model circumference */ }
    });
    return () => {
      overlayRef.current = null; mapRef.current=null;viewRef.current=null;dragZoomRef.current=null;fullExtentRef.current=null;
      map.removeOverlay(overlay);map.removeInteraction(dragZoom);map.setTarget(undefined);
    };
  }, [model, onPoint]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (!selectionPoint) { overlay.setPosition(undefined); return; }
    const adapter = model === 'gleason' ? gleasonAdapter : aeAdapter;
    const projected = adapter.forward(selectionPoint).value;
    overlay.setPosition([projected.x, projected.y]);
  }, [selectionPoint, model]);

  const setAreaMode=(active:boolean)=>{
    zoomAreaActiveRef.current=active;setZoomAreaActive(active);dragZoomRef.current?.setActive(active);
  };
  const zoomBy=(delta:number)=>{
    const view=viewRef.current;if(!view)return;
    view.animate({zoom:(view.getZoom()??0)+delta,duration:160});
  };
  const rotateBy=(delta:number)=>{
    const view=viewRef.current;if(!view)return;
    view.animate({rotation:(view.getRotation()??0)+delta,duration:160});
  };
  const resetOrientation=()=>{viewRef.current?.animate({rotation:0,duration:160});};
  const fitFull=()=>{
    const map=mapRef.current,view=viewRef.current,extent=fullExtentRef.current;
    if(!map||!view||!extent)return;
    setAreaMode(false);
    view.fit(extent,{size:map.getSize(),padding:[22,22,22,22],duration:180,maxZoom:4});
  };
  const focusSelected=()=>{
    const view=viewRef.current;if(!view||!selectionPoint)return;
    const adapter=model==='gleason'?gleasonAdapter:aeAdapter;
    const point=adapter.forward(selectionPoint).value;
    setAreaMode(false);
    view.animate({center:[point.x,point.y],zoom:Math.max(view.getZoom()??0,5),duration:220});
  };

  const title = model === 'gleason' ? (locale === 'ar' ? 'إعادة بناء جليسون التاريخية' : 'Gleason historical reconstruction') : (locale === 'ar' ? 'الإسقاط السمتي متساوي البعد AE' : 'Azimuthal Equidistant reference');
  const labels=locale==='ar'?{
    zoomIn:'تقريب',zoomOut:'تبعيد',area:'تكبير إلى منطقة',left:'تدوير يسار',right:'تدوير يمين',
    reset:'إعادة الاتجاه',fit:'إظهار النموذج كاملًا',focus:'التركيز على المحدد',active:'وضع تحديد المنطقة مفعّل'
  }:{
    zoomIn:'Zoom in',zoomOut:'Zoom out',area:'Zoom to area',left:'Rotate left',right:'Rotate right',
    reset:'Reset orientation',fit:'Fit full model',focus:'Focus selected',active:'Area zoom mode active'
  };
  return <section className="projection-card" data-model={model} data-selected-latitude={selectionPoint?.latitude} data-selected-longitude={selectionPoint?.longitude}
    data-view-zoom={nav.zoom.toFixed(4)} data-view-rotation={nav.rotation.toFixed(6)} data-view-center-x={nav.centerX.toFixed(6)} data-view-center-y={nav.centerY.toFixed(6)} data-area-mode={zoomAreaActive?'true':'false'}>
    <div className="projection-card__head"><strong>{title}</strong><span>{model === 'gleason' ? 'DERIVED · GH-0.2.0' : 'REFERENCE · AE-0.2.0'}</span></div>
    <nav className="navigation-toolbar" aria-label={locale==='ar'?'أدوات التنقل':'Navigation tools'}>
      <button type="button" onClick={()=>zoomBy(1)} aria-label={labels.zoomIn} title={labels.zoomIn}>＋</button>
      <button type="button" onClick={()=>zoomBy(-1)} aria-label={labels.zoomOut} title={labels.zoomOut}>－</button>
      <button type="button" className={zoomAreaActive?'active':''} aria-pressed={zoomAreaActive} onClick={()=>setAreaMode(!zoomAreaActive)} aria-label={labels.area} title={zoomAreaActive?labels.active:labels.area}>▭</button>
      <button type="button" onClick={()=>rotateBy(-Math.PI/12)} aria-label={labels.left} title={labels.left}>↺</button>
      <button type="button" onClick={()=>rotateBy(Math.PI/12)} aria-label={labels.right} title={labels.right}>↻</button>
      <button type="button" onClick={resetOrientation} aria-label={labels.reset} title={labels.reset}>0°</button>
      <button type="button" onClick={fitFull} aria-label={labels.fit} title={labels.fit}>⌂</button>
      <button type="button" disabled={!selectionPoint} onClick={focusSelected} aria-label={labels.focus} title={labels.focus}>◎</button>
      <span className="navigation-readout" dir="ltr">z {nav.zoom.toFixed(2)} · θ {(nav.rotation*180/Math.PI).toFixed(1)}°</span>
    </nav>
    <div ref={targetRef} className={'projection-map'+(zoomAreaActive?' zoom-area-mode':'')} dir="ltr" aria-label={title} />
    {selectionPoint&&<div className="projection-selection-readout" dir="ltr"><span>{selectionLabel ?? (locale==='ar'?'نقطة مختارة':'Selected point')}</span> · Lat {selectionPoint.latitude.toFixed(6)}° · Lon {selectionPoint.longitude.toFixed(6)}°</div>}
  </section>;
}
