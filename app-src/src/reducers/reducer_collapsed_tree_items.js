import { CLEAR_MODEL } from "../actions/model";
import { CLEAR_TABLES } from "../actions/tables";
import { FETCH_COLLAPSED_TREE_ITEMS } from "../actions/collapsed_tree_items";

const INITIAL_STATE = [];

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case CLEAR_TABLES:
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case FETCH_COLLAPSED_TREE_ITEMS:
      if (action.payload === undefined) {
        return INITIAL_STATE;
      } else return action.payload;
    default:
      return state;
  }
}
