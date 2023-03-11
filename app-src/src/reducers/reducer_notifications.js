import { ADD_NOTIFICATION } from "../actions/notifications";

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return { ...state, [action.payload.id]: action.payload };
    default:
      return state;
  }
}
