import { selectFreePoint, selectPlace, type GeographicPosition, type GeographicSelection, type SelectionModel } from './geographicSelection.js';
import type { PlaceSelection } from '../search/placeSelection';

export interface SelectionState { readonly selection: GeographicSelection | null; readonly revision: number; }
export type SelectionAction = { type: 'place'; place: PlaceSelection }
  | { type: 'point'; model: SelectionModel; point: GeographicPosition };
export const INITIAL_SELECTION_STATE: SelectionState = Object.freeze({ selection: null, revision: 0 });
/** Only user selection actions enter here. Rendering a marker never dispatches an action. */
export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  const selection = action.type === 'place' ? selectPlace(action.place) : selectFreePoint(action.model, action.point);
  return Object.freeze({ selection, revision: state.revision + 1 });
}
