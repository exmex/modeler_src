import { SET_OBJECTS_COPY_LIST } from "../actions/objects_copies";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case SET_OBJECTS_COPY_LIST:
      return action.payload;
    default:
      return state;
  }
}
