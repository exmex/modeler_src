import { CONNECTION_SELECTED } from "../actions/connections";

export default function(state = null, action) {
  switch (action.type) {
    case CONNECTION_SELECTED:
      return action.payload;
    default:
      return state;
  }
}
