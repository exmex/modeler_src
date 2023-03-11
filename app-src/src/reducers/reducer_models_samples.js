import { FETCH_MODELS_SAMPLES } from "../actions/models_samples";
import _ from "lodash";

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_MODELS_SAMPLES: {
      return _.mapKeys(action.payload, "id");
    }
    default:
      return state;
  }
}
