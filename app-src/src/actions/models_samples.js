import axios from "axios";
export const FETCH_MODELS_SAMPLES = "fetch_models_samples";

const ROOT_URL = "https://www.datensen.com/samples/samples.json";

export function fetchModelsSamples() {
  const request = axios.get(ROOT_URL);

  return dispatch => {
    request
      .then(({ data }) => {
        if (data) {
          dispatch({
            type: FETCH_MODELS_SAMPLES,
            payload: data
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
}
