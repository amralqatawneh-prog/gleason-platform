import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import CircleGeometry from 'ol/geom/Circle.js';
import VectorLayer from 'ol/layer/Vector.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import VectorSource from 'ol/source/Vector.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import View from 'ol/View.js';
import { aeForward, AE_CODE } from '../models/ae';
import { gleasonAdapter } from '../comparison/adapters/gleasonAdapter';
import { aeAdapter } from '../comparison/adapters/aeAdapter';
import type { GeoPoint } from '../models/projectionTypes';
import { GLEASON_CODE, registerPhase2Projections } from './registerProjections';
import { worldCountriesGeoJson } from './worldData';

export type Phase2MapModel = 'gleason' | 'ae';
interface Props { model: Phase2MapModel; locale: 'ar' | 'en'; onPoint: (model: Phase2MapModel, point: GeoPoint) => void;
  selectionPoint: GeoPoint | null; selectionLabel?: string; }
const landStyle = new Style({ fill: new Fill({ color: 'rgba(197, 210, 198, 0.34)' }), stroke: new Stroke({ color: '#8ca39a', width: 0.8 }) });
const boundaryStyle = new Style({ fill: new Fill({ color: 'rgba(0,0,0,0)' }), stroke: new Stroke({ color: '#d6b66f', width: 1.5 }) });

export function ProjectionMap({ model, locale, onPoint, selectionPoint, selectionLabel }: Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  useEffect(() => {
    if (!targetRef.current) return;
    registerPhase2Projections();
    const projection = model === 'gleason' ? GLEASON_CODE : AE_CODE;
    const features = new GeoJSON().readFeatures(worldCountriesGeoJson(), { dataProjection: 'EPSG:4326', featureProjection: projection });
    const countryLayer = new VectorLayer({ source: new VectorSource({ features }), style: landStyle });
    const south = aeForward({ latitude: -90, longitude: 0 });
    const radius = model === 'gleason' ? 1 : Math.hypot(south.x, south.y);
    const boundaryLayer = new VectorLayer({ source: new VectorSource({ features: [new Feature(new CircleGeometry([0, 0], radius))] }), style: boundaryStyle });
    const view = new View({ projection, center: [0, 0] });
    const map = new Map({ target: targetRef.current, layers: [countryLayer, boundaryLayer], view, controls: [] });
    const marker = document.createElement('span');
    marker.className = 'projection-selection-marker'; marker.setAttribute('aria-hidden', 'true');
    Object.assign(marker.style, {display:'block',width:'14px',height:'14px',border:'2px solid white',borderRadius:'50%',background:'#f4c95d',boxShadow:'0 0 0 2px #172b36',pointerEvents:'none'});
    const overlay = new Overlay({ element: marker, positioning: 'center-center', stopEvent: false });
    map.addOverlay(overlay); overlayRef.current = overlay;
    view.fit([-radius, -radius, radius, radius], { size: map.getSize(), padding: [22,22,22,22], maxZoom: 4 });
    map.on('singleclick', (event) => {
      try {
        const adapter = model === 'gleason' ? gleasonAdapter : aeAdapter;
        const point = adapter.inverse({ kind: 'plane', modelId: adapter.metadata.modelId,
          modelVersion: adapter.metadata.modelVersion, units: adapter.metadata.units,
          x: event.coordinate[0], y: event.coordinate[1] }).value;
        if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180) onPoint(model, point);
      } catch { /* outside historical circumference */ }
    });
    return () => { overlayRef.current = null; map.removeOverlay(overlay); map.setTarget(undefined); };
  }, [model, onPoint]);
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (!selectionPoint) { overlay.setPosition(undefined); return; }
    const adapter = model === 'gleason' ? gleasonAdapter : aeAdapter;
    const projected = adapter.forward(selectionPoint).value;
    overlay.setPosition([projected.x, projected.y]);
    // Selection changes only marker position; cameras and zoom remain independent.
  }, [selectionPoint, model, onPoint]);
  const title = model === 'gleason' ? (locale === 'ar' ? 'إعادة بناء جليسون التاريخية' : 'Gleason historical reconstruction') : (locale === 'ar' ? 'الإسقاط السمتي متساوي البعد AE' : 'Azimuthal Equidistant reference');
  return <section className="projection-card" data-model={model} data-selected-latitude={selectionPoint?.latitude} data-selected-longitude={selectionPoint?.longitude}>
    <div className="projection-card__head"><strong>{title}</strong><span>{model === 'gleason' ? 'DERIVED · GH-0.2.0' : 'REFERENCE · AE-0.2.0'}</span></div>
    <div ref={targetRef} className="projection-map" aria-label={title} />
    {selectionPoint&&<div className="projection-selection-readout" dir="ltr"><span>{selectionLabel ?? (locale==='ar'?'نقطة مختارة':'Selected point')}</span> · Lat {selectionPoint.latitude.toFixed(6)}° · Lon {selectionPoint.longitude.toFixed(6)}°</div>}
  </section>;
}
