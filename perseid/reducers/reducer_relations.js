import {
  ADD_RELATION,
  CLEAR_RELATIONS,
  DELETE_RELATION,
  DELETE_RELATION_KEY_COLUMN_PAIR,
  FETCH_RELATION,
  FETCH_RELATIONS,
  FETCH_RELATION_KEY_COLUMN_PAIR,
  IMPORT_RELATIONS,
  UPDATE_RELATION_PROPERTY
} from "../actions/relations";

import { CLEAR_MODEL } from "../actions/model";
import _ from "lodash";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case FETCH_RELATION_KEY_COLUMN_PAIR:
      return {
        ...state,
        [action.payload.relationId]: {
          ...state[action.payload.relationId],
          cols: [
            //...state[action.payload.relationId].cols,
            //action.payload.column
            ...state[action.payload.relationId].cols.slice(
              0,
              action.payload.position
            ),
            action.payload.pair,
            ...state[action.payload.relationId].cols.slice(
              action.payload.position
            )
          ]
        }
      };
    case DELETE_RELATION_KEY_COLUMN_PAIR:
      return {
        ...state,
        [action.payload.relationId]: {
          ...state[action.payload.relationId],
          cols: [
            ...state[action.payload.relationId].cols.slice(
              0,
              action.payload.position
            ),
            ...state[action.payload.relationId].cols.slice(
              action.payload.position + 1
            )
          ]
        }
      };
    case IMPORT_RELATIONS:
      return action.payload;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case CLEAR_RELATIONS:
      return INITIAL_STATE;
    case DELETE_RELATION:
      return _.omit(state, action.payload);
    case ADD_RELATION:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_RELATION:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_RELATIONS:
      return _.mapKeys(action.payload, "id");
    case UPDATE_RELATION_PROPERTY:
      return {
        ...state,
        [action.payload.relationId]: {
          ...state[action.payload.relationId],
          [action.payload.pName]: action.payload.newValue
        }
      };
    default:
      return state;
  }
}
