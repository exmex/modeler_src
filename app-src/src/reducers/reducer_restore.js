import { FETCH_RESTORE } from "../actions/restore";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case FETCH_RESTORE:
      return action.payload;
    default:
      return state;
  }
}
