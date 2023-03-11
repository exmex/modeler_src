import {
  ADD_CONNECTION,
  DELETE_CONNECTION,
  FETCH_CONNECTION,
  FETCH_CONNECTIONS,
  FETCH_SAMPLE_CONNECTIONS,
  UPDATE_CONNECTION_PROPERTY
} from "../actions/connections";

import _ from "lodash";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case FETCH_CONNECTIONS:
      return _.mapKeys(action.payload, "id");
    case FETCH_SAMPLE_CONNECTIONS:
      return _.mapKeys(action.payload, "id");
    case FETCH_CONNECTION:
      return { ...state, [action.payload.id]: action.payload };
    case ADD_CONNECTION:
      return { ...state, [action.payload.id]: action.payload };
    case DELETE_CONNECTION:
      return _.omit(state, action.payload);
    case UPDATE_CONNECTION_PROPERTY:
      return {
        ...state,
        [action.payload.connectionId]: {
          ...state[action.payload.connectionId],
          [action.payload.pName]: action.payload.newValue
        }
      };
    default:
      return state;
  }
}
