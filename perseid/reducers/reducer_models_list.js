import {
  ADD_MODEL_LIST_ITEM,
  DELETE_MODEL_LIST_ITEM,
  FETCH_MODELS_LIST,
  FETCH_MODELS_LIST_ITEM
} from "../actions/models_list";

import _ from "lodash";

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_MODELS_LIST:
      return _.mapKeys(action.payload, "filePath");
    case FETCH_MODELS_LIST_ITEM:
      return { ...state, [action.payload.id]: action.payload };
    case ADD_MODEL_LIST_ITEM:
      return { ...state, [action.payload.id]: action.payload };
    case DELETE_MODEL_LIST_ITEM:
      return _.omit(state, action.payload);
    default:
      return state;
  }
}
