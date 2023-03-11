export const FETCH_CONNECTIONS = "fetch_connections";
export const FETCH_SAMPLE_CONNECTIONS = "fetch_sample_connections";
export const FETCH_CONNECTION = "fetch_connection";
export const ADD_CONNECTION = "add_connection";
export const DELETE_CONNECTION = "delete_connection";
export const CONNECTION_SELECTED = "connection_selected";
export const UPDATE_CONNECTION_PROPERTY = "update_connection_property";

export function fetchConnections(connections) {
  return {
    type: FETCH_CONNECTIONS,
    payload: connections
  };
}

export function fetchConnection(connection) {
  return {
    type: FETCH_CONNECTION,
    payload: connection
  };
}

export function addConnection(connection) {
  return {
    type: ADD_CONNECTION,
    payload: connection
  };
}

export function deleteConnection(connectionId) {
  return {
    type: DELETE_CONNECTION,
    payload: connectionId
  };
}

export function selectConnection(connectionId) {
  return {
    type: CONNECTION_SELECTED,
    payload: connectionId
  };
}

export function updateConnectionProperty(connectionId, newValue, pName) {
  return async (dispatch) => {
    await dispatch({
      type: UPDATE_CONNECTION_PROPERTY,
      payload: { connectionId, newValue, pName }
    });
  };
}
