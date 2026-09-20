import type { GeographicSelection } from '../comparison/geographicSelection.js';
import {
  MeasurementContractError,
  measurementEndpointFromSelection,
  type MeasurementEndpoint,
} from './contracts.js';

export const ORDERED_ROUTE_STATE_VERSION = 1 as const;
export const ORDERED_ROUTE_MAX_POINTS = 50 as const;

export interface OrderedRoutePoint {
  readonly pointId: string;
  readonly endpoint: Readonly<MeasurementEndpoint>;
}

export interface OrderedRouteSegment {
  readonly segmentId: string;
  readonly index: number;
  readonly fromPointId: string;
  readonly toPointId: string;
}

export type OrderedRouteErrorCode =
  | MeasurementContractError['code']
  | 'route-full'
  | null;

export interface OrderedRouteState {
  readonly schemaVersion: typeof ORDERED_ROUTE_STATE_VERSION;
  readonly routeId: 'transient-route';
  readonly points: readonly Readonly<OrderedRoutePoint>[];
  readonly segments: readonly Readonly<OrderedRouteSegment>[];
  readonly history: readonly (readonly Readonly<OrderedRoutePoint>[])[];
  readonly nextPointOrdinal: number;
  readonly revision: number;
  readonly lastError: OrderedRouteErrorCode;
}

export type OrderedRouteAction =
  | { readonly type: 'add-selection'; readonly selection: GeographicSelection }
  | { readonly type: 'remove'; readonly pointId: string }
  | { readonly type: 'move'; readonly pointId: string; readonly direction: 'up' | 'down' }
  | { readonly type: 'undo' }
  | { readonly type: 'clear' }
  | { readonly type: 'dismiss-error' };

const EMPTY_POINTS = Object.freeze([]) as readonly Readonly<OrderedRoutePoint>[];
const EMPTY_SEGMENTS = Object.freeze([]) as readonly Readonly<OrderedRouteSegment>[];
const EMPTY_HISTORY = Object.freeze([]) as readonly (readonly Readonly<OrderedRoutePoint>[])[];

export const INITIAL_ORDERED_ROUTE_STATE: OrderedRouteState = Object.freeze({
  schemaVersion: ORDERED_ROUTE_STATE_VERSION,
  routeId: 'transient-route',
  points: EMPTY_POINTS,
  segments: EMPTY_SEGMENTS,
  history: EMPTY_HISTORY,
  nextPointOrdinal: 1,
  revision: 0,
  lastError: null,
});

function freezePoints(points: readonly Readonly<OrderedRoutePoint>[]): readonly Readonly<OrderedRoutePoint>[] {
  return Object.freeze([...points]);
}

export function orderedRouteSegments(
  points: readonly Readonly<OrderedRoutePoint>[],
): readonly Readonly<OrderedRouteSegment>[] {
  const segments: OrderedRouteSegment[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const fromPointId = points[index].pointId;
    const toPointId = points[index + 1].pointId;
    segments.push(Object.freeze({
      segmentId: `route-segment:${fromPointId}->${toPointId}`,
      index,
      fromPointId,
      toPointId,
    }));
  }
  return Object.freeze(segments);
}

function pushHistory(
  history: readonly (readonly Readonly<OrderedRoutePoint>[])[],
  points: readonly Readonly<OrderedRoutePoint>[],
): readonly (readonly Readonly<OrderedRoutePoint>[])[] {
  const next = [...history, freezePoints(points)];
  // P6.2 is transient UI state; cap undo snapshots so long sessions do not grow unbounded.
  return Object.freeze(next.slice(-ORDERED_ROUTE_MAX_POINTS));
}

function committed(
  state: OrderedRouteState,
  points: readonly Readonly<OrderedRoutePoint>[],
  nextPointOrdinal = state.nextPointOrdinal,
): OrderedRouteState {
  const frozenPoints = freezePoints(points);
  return Object.freeze({
    schemaVersion: ORDERED_ROUTE_STATE_VERSION,
    routeId: 'transient-route',
    points: frozenPoints,
    segments: orderedRouteSegments(frozenPoints),
    history: pushHistory(state.history, state.points),
    nextPointOrdinal,
    revision: state.revision + 1,
    lastError: null,
  });
}

function rejected(state: OrderedRouteState, code: Exclude<OrderedRouteErrorCode, null>): OrderedRouteState {
  return Object.freeze({ ...state, lastError: code });
}

export function orderedRouteReducer(
  state: OrderedRouteState,
  action: OrderedRouteAction,
): OrderedRouteState {
  if (action.type === 'dismiss-error') {
    return state.lastError === null ? state : Object.freeze({ ...state, lastError: null });
  }

  if (action.type === 'add-selection') {
    if (state.points.length >= ORDERED_ROUTE_MAX_POINTS) return rejected(state, 'route-full');
    const pointId = `route-point-${state.nextPointOrdinal}`;
    try {
      const endpoint = measurementEndpointFromSelection(pointId, action.selection);
      const routePoint = Object.freeze({ pointId, endpoint });
      return committed(state, [...state.points, routePoint], state.nextPointOrdinal + 1);
    } catch (error) {
      if (error instanceof MeasurementContractError) return rejected(state, error.code);
      throw error;
    }
  }

  if (action.type === 'remove') {
    const index = state.points.findIndex(point => point.pointId === action.pointId);
    if (index < 0) return state;
    return committed(state, state.points.filter(point => point.pointId !== action.pointId));
  }

  if (action.type === 'move') {
    const index = state.points.findIndex(point => point.pointId === action.pointId);
    if (index < 0) return state;
    const target = action.direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= state.points.length) return state;
    const points = [...state.points];
    [points[index], points[target]] = [points[target], points[index]];
    return committed(state, points);
  }

  if (action.type === 'clear') {
    return state.points.length === 0 ? state : committed(state, []);
  }

  if (action.type === 'undo') {
    if (state.history.length === 0) return state;
    const previous = state.history[state.history.length - 1];
    const history = Object.freeze(state.history.slice(0, -1));
    const points = freezePoints(previous);
    return Object.freeze({
      schemaVersion: ORDERED_ROUTE_STATE_VERSION,
      routeId: 'transient-route',
      points,
      segments: orderedRouteSegments(points),
      history,
      // Point IDs are never reused after undo; identity remains monotonic in-session.
      nextPointOrdinal: state.nextPointOrdinal,
      revision: state.revision + 1,
      lastError: null,
    });
  }

  return state;
}
