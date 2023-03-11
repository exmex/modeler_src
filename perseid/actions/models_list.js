export const FETCH_MODELS_LIST = "fetch_models_list";
export const FETCH_MODELS_LIST_ITEM = "fetch_models_list_item";
export const ADD_MODEL_LIST_ITEM = "add_model_list_item";
export const DELETE_MODEL_LIST_ITEM = "delete_model_list_item";

export function fetchModelsList(modelsList) {
  return {
    type: FETCH_MODELS_LIST,
    payload: modelsList
  };
}

export function fetchModelsListItem(modelListItem) {
  return {
    type: FETCH_MODELS_LIST_ITEM,
    payload: modelListItem
  };
}

export function addModelsListItem(modelListItem) {
  return {
    type: ADD_MODEL_LIST_ITEM,
    payload: modelListItem
  };
}

export function deleteModelsListItem(modelListItemId) {
  return {
    type: DELETE_MODEL_LIST_ITEM,
    payload: modelListItemId
  };
}
