import { IMPORT_ORDER, REMOVE_FROM_ORDER, SET_ORDER } from "../actions/order";

import { CLEAR_MODEL } from "../actions/model";

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case SET_ORDER:
      return action.payload;
    case REMOVE_FROM_ORDER:
      return state.filter(id => id !== action.payload);
    case CLEAR_MODEL:
      return [];
    case IMPORT_ORDER:
      return action.payload;
    default:
      return state;
  }
}
