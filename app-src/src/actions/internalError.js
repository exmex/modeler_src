
export const THROW_INTERNAL_ERROR = "throw_internal_error";

export function throwInternalError(error) {
  return (dispatch) => {
    dispatch({
      type: THROW_INTERNAL_ERROR,
      payload: error
    });
  };
}
