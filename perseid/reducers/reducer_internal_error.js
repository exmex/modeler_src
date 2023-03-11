
import {
  THROW_INTERNAL_ERROR
} from "../actions/internalError";

export default function (state = null, action) {
  switch (action.type) {
    case THROW_INTERNAL_ERROR:
      return action.payload;
    default:
      return state;
  }
}
