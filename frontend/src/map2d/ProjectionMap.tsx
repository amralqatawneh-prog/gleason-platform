import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import CircleGeometry from 'ol/geom/Circle.js';
import VectorLayer from 'ol/layer/Vector.js';
import Map from 'ol/Map.js';
import { transform } from 'ol/proj.js';
import VectorSource from 'ol/source/Vector.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import View from 'ol/View.js';
import { aeForward, AE_CODE } from '../models/ae';
import { GLEASON_UNITS, gleasonInverse } from '../models/gleason';
import type { GeoPoint } from '../models/projectionTypes';
import { GLEASON_CODE, registerPhase2Projections } from './registerProjections';
import { worldCountriesGeoJson } from './worldData';

export type Phase2MapModel = 'gleason' | 'ae';
interface Props { model: Phase2MapModel; locale: 'ar' | 'en'; onPoint: (model: Phase2MapModel, point: GeoPoint) => void; }
const landStyle = new Style({ fill: new Fill({ color: 'rgba(197, 210, 198, 0.34)' }), stroke: new Stroke({ color: '#8ca39a', width: 0.8 }) });
const boundaryStyle = new Style({ fill: new Fill({ color: 'rgba(0,0,0,0)' }), stroke: new Stroke({ color: '#d6b66f', width: 1.5 }) });

export function ProjectionMap({ model, locale, onPoint }: Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);
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
    view.fit([-radius, -radius, radius, radius], { size: map.getSize(), padding: [22,22,22,22], maxZoom: 4 });
    map.on('singleclick', (event) => {
      try {
        let point: GeoPoint;
        if (model === 'gleason') point = gleasonInverse({ x: event.coordinate[0], y: event.coordinate[1], units: GLEASON_UNITS });
        else { const [longitude, latitude] = transform(event.coordinate, AE_CODE, 'EPSG:4326'); point = { latitude, longitude }; }
        if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) onPoint(model, point);
      } catch { /* outside historical circumference */ }
    });
    return () => map.setTarget(undefined);
  }, [model, onPoint]);
  const title = model === 'gleason' ? (locale === 'ar' ? 'إعادة بناء جليسون التاريخية' : 'Gleason historical reconstruction') : (locale === 'ar' ? 'الإسقاط السمتي متساوي البعد AE' : 'Azimuthal Equidistant reference');
  return <section className="projection-card"><div className="projection-card__head"><strong>{title}</strong><span>{model === 'gleason' ? 'DERIVED · GH-0.2.0' : 'REFERENCE · AE-0.2.0'}</span></div><div ref={targetRef} className="projection-map" aria-label={title} /></section>;
}
