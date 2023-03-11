import { ObjectType } from "../enums/enums";

export const OTHER_OBJECT = "other_object";
export const NOTE = "note";
export const TABLE = "table";
export const LINE = "line";
export const RELATION = "relation";
export const INDEX = "index";
export const PROJECT = "project";

export const navigateToDiagramUrl = (
  currentUrl,
  history,
  modelId,
  diagramId
) => {
  const newUrl = pathToDiagram(modelId, diagramId);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const pathToDiagram = (mid, did) => {
  return `/model/${mid}/diagram/${did}`;
};

export const navigateToProjectUrl = (currentUrl, history, mid, did) => {
  const newUrl = pathToProject(mid, did);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const pathToProject = (mid, did) => {
  return `/model/${mid}/diagram/${did}/project/${mid}`;
};

export const navigateToOtherObjectUrl = (
  currentUrl,
  history,
  modelId,
  diagramId,
  otherId
) => {
  const newUrl = pathToOtherObject(modelId, diagramId, otherId);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const pathToOtherObject = (mid, did, oid) => {
  return `/model/${mid}/diagram/${did}/other/${oid}`;
};

export const navigateToNoteUrl = (
  currentUrl,
  history,
  modelId,
  diagramId,
  noteId
) => {
  const newUrl = pathToNote(modelId, diagramId, noteId);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};
export const pathToNote = (mid, did, nid) => {
  return `/model/${mid}/diagram/${did}/note/${nid}`;
};

export const navigateToItemUrl = (
  currentUrl,
  history,
  modelId,
  diagramId,
  tableId,
  embeddable
) => {
  const newUrl = pathToItem(modelId, diagramId, tableId, embeddable);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const navigateToIndexUrl = (
  currentUrl,
  history,
  modelId,
  diagramId,
  tableId,
  embeddable,
  indexId
) => {
  const newUrl = pathToIndex(modelId, diagramId, tableId, embeddable, indexId);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const pathToItem = (mid, did, id, embeddable) => {
  const tableType = embeddable === true ? `emb` : `item`;
  return `/model/${mid}/diagram/${did}/${tableType}/${id}`;
};

export const pathToIndex = (mid, did, id, embeddable, indexId) => {
  const tableType = embeddable === true ? `emb` : `item`;
  return `/model/${mid}/diagram/${did}/${tableType}/${id}/ix/${indexId}`;
};

export const navigateToRelationUrl = (currentUrl, history, mid, did, rid) => {
  const newUrl = pathToRelation(mid, did, rid);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const pathToRelation = (mid, did, rid) => {
  return `/model/${mid}/diagram/${did}/relation/${rid}`;
};

export const navigateToLineUrl = (
  currentUrl,
  history,
  modelId,
  diagramId,
  lineId
) => {
  const newUrl = pathToLine(modelId, diagramId, lineId);
  if (currentUrl !== newUrl) {
    history.push(newUrl);
  }
};

export const pathToLine = (mid, did, lid) => {
  return `/model/${mid}/diagram/${did}/line/${lid}`;
};

const objUrl = (historyState, objectType, obj, parentObj) => {
  const diagramPath = `model/${historyState.modelId}/diagram/${historyState.diagramId}`;
  const objectPath = convertObjectTypeToPath(objectType, obj.embeddable);
  const completeObjectPath = objectPath ? `${objectPath}/${obj.id}` : undefined;
  if (parentObj) {
    const parentObjectPath = `${convertObjectTypeToPath(
      ObjectType.TABLE,
      parentObj.embeddable
    )}/${parentObj.id}`;

    return completeObjectPath
      ? `/${diagramPath}/${parentObjectPath}/${completeObjectPath}`
      : `/${diagramPath}/${parentObjectPath}`;
  }
  return `/${diagramPath}/${completeObjectPath}`;
};

const defaultUrl = (historyState) => {
  return `/model/${historyState.modelId}/diagram/${historyState.diagramId}`;
};

export const pathByObjecType = (historyState, objectType, obj, parentObj) => {
  return obj
    ? objUrl(historyState, objectType, obj, parentObj)
    : defaultUrl(historyState);
};

export const navigateByObjectType = (
  historyContext,
  objectType,
  obj,
  parentObj
) => {
  const newUrl = pathByObjecType(
    historyContext.state,
    objectType,
    obj,
    parentObj
  );
  if (newUrl !== historyContext.state.url) {
    historyContext.history.push(newUrl);
  }
};

const UrlParts = {
  EMBEDDABLE: "emb",
  ITEM: "item",
  NOTE: "note",
  LINE: "line",
  RELATION: "relation",
  OTHER: "other",
  PROJECT: "project",
  COLUMN: "col",
  INDEX: "ix"
};

const convertObjectTypeToPath = (objectType, embeddable) => {
  if (embeddable) {
    return UrlParts.EMBEDDABLE;
  }
  switch (objectType) {
    case ObjectType.TABLE:
      return UrlParts.ITEM;
    case ObjectType.NOTE:
      return UrlParts.NOTE;
    case ObjectType.LINE:
      return UrlParts.LINE;
    case ObjectType.RELATION:
      return UrlParts.RELATION;
    case ObjectType.OTHER_OBJECT:
      return UrlParts.OTHER;
    case ObjectType.MODEL:
      return UrlParts.PROJECT;
    case ObjectType.COLUMN:
      return UrlParts.COLUMN;
    case ObjectType.INDEX:
      return UrlParts.INDEX;
  }
};
