import {
  ADD_LINE,
  CLEAR_LINES,
  DELETE_LINE,
  DELETE_LINES,
  FETCH_LINE,
  FETCH_LINES,
  IMPORT_LINES,
  UPDATE_LINE_PROPERTY
} from "../actions/lines";

import { CLEAR_MODEL } from "../actions/model";
import _ from "lodash";

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case IMPORT_LINES:
      return action.payload;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case CLEAR_LINES:
      return INITIAL_STATE;
    case DELETE_LINE:
      return _.omit(state, action.payload);
    case DELETE_LINES:
      return _.omit(state, action.payload);
    case ADD_LINE:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_LINE:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_LINES:
      return _.mapKeys(action.payload, "id");
    case UPDATE_LINE_PROPERTY:
      return {
        ...state,
        [action.payload.lineId]: {
          ...state[action.payload.lineId],
          [action.payload.pName]: action.payload.newValue
        }
      };
    default:
      return state;
  }
}
