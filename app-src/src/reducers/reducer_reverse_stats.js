import { CLEAR_MODEL } from "../actions/model";
import { IMPORT_REVERSE_STATS } from "../actions/reverseStats";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case CLEAR_MODEL:
      return {};
    case IMPORT_REVERSE_STATS:
      return action.payload;
    default:
      return state;
  }
}
