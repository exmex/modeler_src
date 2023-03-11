import { Features, isFeatureAvailable } from "../helpers/features/features";
import { addNote, updateNoteProperty } from "./notes";
import { addOtherObject, updateOtherObjectProperty } from "./other_objects";
import { addTable, updateTableProperty } from "./tables";

import { ClassDiagram } from "../classes/class_diagram";
import { ModelTypes } from "../enums/enums";
import _ from "lodash";
import { createDiagramItem } from "../classes/factory/class_diagram_item_factory";
import { getCurrentHistoryTransaction } from "./undoredo";
import { setForcedRender } from "./ui";
import { showDiagram } from "./model";
import { v4 as uuidv4 } from "uuid";

export const FETCH_DIAGRAM = "fetch_diagram";
export const ADD_DIAGRAM = "add_diagram";

export const DELETE_DIAGRAM = "delete_diagram";
export const CREATE_DIAGRAM = "create_diagram";

export const DELETE_DIAGRAM_ITEMS = "delete_diagram_items";
export const ADD_DIAGRAM_ITEMS = "add_diagram_items";

export const CLEAR_DIAGRAMS = "clear_diagrams";
export const IMPORT_DIAGRAMS = "import_diagrams";

export const UPDATE_DIAGRAM_PROPERTY = "update_diagram_property";
export const SET_DIAGRAM_ZOOM = "set_diagram_zoom";

export const UPDATE_DIAGRAM_ITEM_PROPERTIES = "update_diagram_item_properties";
export const DELETE_ALL_DIAGRAM_ITEMS = "delete_all_diagram_items";

export const ADD_TABLE_WITH_DIAGRAM_ITEM = "add_table_with_diagram_item";
export const ADD_OTHER_OBJECT_WITH_DIAGRAM_ITEM =
  "add_other_object_with_diagram_item";
export const ADD_NOTE_WITH_DIAGRAM_ITEM = "add_note_with_diagram_item";
export const SET_DIAGRAM_SCROLL = "set_diagram_scroll";

const CONTAINER_MYSQL_FAMILY = "Databases";
const CONTAINER_PG = "Schemas";

const ROW_HEIGHT = 18;
const TITLE_HEIGHT_AND_COLS_PADDING = 28;

function getObjectById(getState, id) {
  return (
    getState().tables[id] || getState().notes[id] || getState().otherObjects[id]
  );
}

export function createNewDiagramsFromSelection(
  newDiagram,
  selections,
  historyContext
) {
  return async (dispatch, getState) => {
    await dispatch(addDiagram(newDiagram));
    await dispatch(
      addDiagramItems(
        newDiagram.id,
        _.map(
          _.filter(selections, () => true),
          (item, index) => createDiagramItemOnPosition(getState, item, index)
        )
      )
    );
    await dispatch(
      showDiagram(
        historyContext.state.modelId,
        newDiagram.id,
        false,
        historyContext
      )
    );
  };
}

export function getCurrentScroll() {
  const mainArea = document.getElementById("main-area");
  if (!mainArea) {
    return { left: 0, top: 0 };
  }
  return {
    x: mainArea.scrollLeft,
    y: mainArea.scrollTop
  };
}

export function addSelectionToExistingDiagram(id, selections, historyContext) {
  return async (dispatch, getState) => {
    const diagram = _.find(getState().diagrams, ["id", id]);
    if (diagram) {
      if (diagram.main === true) {
        const selectionsObjects = _.map(selections, (item) => ({
          item: getObjectById(getState, item.objectId),
          objectType: item.objectType
        }));
        const invisible = _.map(
          _.filter(selectionsObjects, (item) => item.item.visible === false),
          (item) => ({ objectId: item.item.id, objectType: item.objectType })
        );
        await dispatch(updateDiagramItemsVisibility(invisible));
      } else {
        const x = _.filter(
          selections,
          (item) => !diagram.diagramItems[item.objectId]
        );
        const y = _.map(x, (item, index) =>
          createDiagramItemOnPosition(getState, item, index)
        );
        await dispatch(addDiagramItems(id, y));
      }
      await dispatch(
        showDiagram(
          historyContext.state.modelId,
          diagram.id,
          false,
          historyContext
        )
      );
    }
  };
}

function updateDiagramItemsVisibility(invisible) {
  return (dispatch, getState) => {
    _.map(invisible, async (s) => {
      if (s.objectType === "table") {
        await dispatch(
          updateTableProperty(
            s.objectId,
            !getState().tables[s.objectId].visible,
            "visible"
          )
        );
      }
      if (s.objectType === "note") {
        await dispatch(
          updateNoteProperty(
            s.objectId,
            !getState().notes[s.objectId].visible,
            "visible"
          )
        );
      }
      if (s.objectType === "other_object") {
        await dispatch(
          updateOtherObjectProperty(
            s.objectId,
            !getState().otherObjects[s.objectId].visible,
            "visible"
          )
        );
      }
    });
  };
}

export function deleteAllDiagramItems(id) {
  return {
    type: DELETE_ALL_DIAGRAM_ITEMS,
    payload: id
  };
}

export function importDiagrams(diagrams) {
  return {
    type: IMPORT_DIAGRAMS,
    payload: diagrams
  };
}

export function fetchDiagram(diagram) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_DIAGRAM,
      payload: diagram
    });
  };
}

export function addDiagram(diagram) {
  return {
    type: ADD_DIAGRAM,
    payload: diagram
  };
}

function getExistingDiagramItemProperty(referencedItemId, state, propName) {
  const diagramWithDiagramItem = Object.keys(state.diagrams)
    .map((key) => state.diagrams[key])
    .find((diagram) => !!diagram.diagramItems[referencedItemId]);

  return diagramWithDiagramItem &&
    diagramWithDiagramItem.diagramItems[referencedItemId]
    ? diagramWithDiagramItem.diagramItems[referencedItemId][propName]
    : undefined;
}

export function addDiagramItems(diagramId, diagramItemsToAdd) {
  return async (dispatch, getState) => {
    const propertiesToChange = [
      { propname: "gHeight" },
      { propname: "gWidth" },
      { propname: "color" },
      { propname: "background" }
    ];

    const changes = diagramItemsToAdd.reduce((result, di) => {
      return [
        ...result,
        ...propertiesToChange
          .map((prop) => ({
            id: di.referencedItemId,
            diagramId,
            propname: prop.propname,
            propvalue: getExistingDiagramItemProperty(
              di.referencedItemId,
              getState(),
              prop.propname
            )
          }))
          .filter((prop) => prop.propvalue !== undefined)
      ];
    }, []);

    await dispatch({
      type: ADD_DIAGRAM_ITEMS,
      payload: { diagramItems: diagramItemsToAdd, diagramId }
    });

    const newValues = {
      changes
    };
    await dispatch(updateDiagramItemProperties(newValues));
  };
}

export function deleteDiagram(diagramId) {
  return async (dispatch, getState) => {
    await dispatch({
      type: DELETE_DIAGRAM,
      payload: diagramId
    });
  };
}

export function deleteDiagramItems(diagramId, ids) {
  return async (dispatch, getState) => {
    await dispatch({
      type: DELETE_DIAGRAM_ITEMS,
      payload: { diagramId, ids }
    });
  };
}

export function clearDiagrams() {
  return {
    type: CLEAR_DIAGRAMS
  };
}

export function updateDiagramProperty(diagramId, newValue, pName) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_DIAGRAM_PROPERTY,
      payload: { diagramId, newValue, pName }
    });
  };
}

export function updateDiagramItemProperties(newDiagramItemProperties) {
  return async (dispatch) => {
    await dispatch({
      type: UPDATE_DIAGRAM_ITEM_PROPERTIES,
      payload: newDiagramItemProperties
    });
  };
}

export function updateDiagramItemProperty(
  diagramId,
  diagramItemId,
  newValue,
  pName
) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_DIAGRAM_ITEM_PROPERTIES,
      payload: {
        diagramId,
        changes: [
          { id: diagramItemId, propname: pName, propvalue: newValue, diagramId }
        ]
      }
    });
  };
}

export function addTableWithDiagramItem(diagramId, obj, diagramItem) {
  return async (dispatch, getState) => {
    await dispatch(addTable(obj));
    await dispatch(addDiagramItems(diagramId, [diagramItem]));
    await dispatch(addDiagramItemToMainDiagram(diagramId, diagramItem, obj));
  };
}

function addDiagramItemToMainDiagram(diagramId, diagramItem, obj) {
  return async (dispatch, getState) => {
    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    if (mainDiagram && diagramId !== mainDiagram.id) {
      await dispatch(addDiagramItems(mainDiagram.id, [diagramItem]));
    }
  };
}

export function addOtherObjectWithDiagramItem(diagramId, obj, diagramItem) {
  return async (dispatch) => {
    await dispatch(addOtherObject(obj));
    await dispatch(addDiagramItems(diagramId, [diagramItem]));

    await dispatch(addDiagramItemToMainDiagram(diagramId, diagramItem, obj));
  };
}

export function addNoteWithDiagramItem(obj, diagramItem, diagramId) {
  return async (dispatch) => {
    await dispatch(addNote(obj));
    await dispatch(addDiagramItems(diagramId, [diagramItem]));

    await dispatch(addDiagramItemToMainDiagram(diagramId, diagramItem, obj));
  };
}

export function addDiagramsByContainers(containers) {
  return async (dispatch, getState) => {
    containers.forEach(async (container) => {
      let diagram = _.find(
        getState().diagrams,
        (item) => item.name === container
      );
      if (!diagram) {
        diagram = new ClassDiagram(uuidv4(), container, "", false);
        await dispatch(addDiagram(diagram));
      }

      const containersTables = _.filter(
        getState().tables,
        (table) =>
          getContainerByModelType(getState().model, table) === container
      );
      const tablesNotOnDiagram = _.filter(containersTables, (table) => {
        const currentDiagram = getState().diagrams[diagram.id];
        return currentDiagram ? !currentDiagram.diagramItems[table.id] : false;
      });
      const selection = _.map(tablesNotOnDiagram, (item) => ({
        objectId: item.id,
        objectType: "table"
      }));

      await dispatch(
        addDiagramItems(
          diagram.id,
          _.map(selection, (item, index) =>
            createDiagramItemOnPosition(getState, item, index)
          )
        )
      );
    });
  };
}

function createDiagramItemOnPosition(getState, item, index) {
  return createDiagramItem(
    getObjectById(getState, item.objectId),
    item.objectType,
    100,
    100 * (index + 1)
  );
}

export function isToggleAddDiagramsByContainersActionVisible(type, profile) {
  return (
    (type === ModelTypes.MARIADB ||
      type === ModelTypes.MYSQL ||
      type === ModelTypes.PG) &&
    isFeatureAvailable(
      profile.availableFeatures,
      Features.MULTIDIAGRAMS,
      profile
    )
  );
}

export function isToggleAddDiagramsByContainersActionEnabled(type, tables) {
  return Object.keys(getContainersTablesCount(type, tables)).length > 0;
}

export function getContainerName(type) {
  return type === ModelTypes.MARIADB || type === ModelTypes.MYSQL
    ? CONTAINER_MYSQL_FAMILY
    : CONTAINER_PG;
}

function getAddContainerCounter(result, container) {
  if (container) {
    return {
      ...result,
      [container]: {
        name: container,
        count: (result[container] ? result[container].count : 0) + 1
      }
    };
  }
  return result;
}

export function getContainersTablesCount(type, tables) {
  return _.reduce(
    tables,
    (result, table) =>
      getAddContainerCounter(result, getContainerByModelType(type, table)),
    {}
  );
}

function getContainerByModelType(type, table) {
  return type === ModelTypes.MARIADB || type === ModelTypes.MYSQL
    ? table.database
    : table.pg?.schema;
}

function diagramItems(state) {
  return state.diagrams[state.model.activeDiagram].diagramItems;
}

export function alignItems(side, value, isMax) {
  return async (dispatch, getState) => {
    if (_.size(getState().selections) > 0) {
      const changes = _.filter(
        _.map(getState().selections, (sel) => {
          const list = diagramItems(getState());
          if (list) {
            const obj = list[sel.objectId];
            if (obj) {
              return createChanges(sel, side, obj, getState, value, isMax);
            }
          }
          return {};
        }),
        (item) => item.newState
      );

      await dispatch(executeChanges(changes));
    }
  };
}

function createChanges(selection, side, obj, getState, value, isMax) {
  const originalState = {
    id: selection.objectId,
    propname: side,
    propvalue: side === "x" ? obj.x : obj.y,
    diagramId: getState().model.activeDiagram
  };
  const newValue = calculateNewValue(value, isMax, side, obj);
  return originalState.propvalue !== newValue
    ? {
        newState: {
          id: selection.objectId,
          propname: side,
          propvalue: newValue,
          diagramId: getState().model.activeDiagram
        },
        originalState
      }
    : {};
}

function calculateNewValue(value, isMax, side, obj) {
  if (isMax === true) {
    return side === "x" ? value - obj.gWidth : value - obj.gHeight;
  } else if (isMax === "middle") {
    return side === "x" ? value - obj.gWidth / 2 : value - obj.gHeight / 2;
  }
  return value;
}

function executeChanges(changes) {
  return async (dispatch, getState) => {
    if (changes.length > 0) {
      await dispatch(
        updateDiagramItemProperties({
          changes: changes.map((change) => change.newState)
        })
      );
    }
  };
}

export function resizeItems(side, newValue) {
  return (dispatch, getState) => {
    const propname = side === "width" ? "gWidth" : "gHeight";
    if (_.size(getState().selections) > 0) {
      const result = _.map(getState().selections, (sel) => {
        const diagramItem =
          getState().diagrams[getState().model.activeDiagram].diagramItems[
            sel.objectId
          ];
        const currentValue = diagramItem[propname];
        return [
          ...(currentValue !== newValue
            ? [
                {
                  newState: {
                    id: sel.objectId,
                    propname,
                    propvalue: newValue,
                    diagramId: getState().model.activeDiagram
                  }
                }
              ]
            : []),
          ...(currentValue !== newValue && !currentValue.resized
            ? [
                {
                  newState: {
                    id: sel.objectId,
                    propname: "resized",
                    propvalue: !currentValue.resized,
                    diagramId: getState().model.activeDiagram
                  }
                }
              ]
            : [])
        ];
      }).reduce((r, i) => (i ? [...r, ...i] : r), []);

      if (result.length > 0) {
        dispatch(
          updateDiagramItemProperties({
            changes: result.map((change) => change.newState)
          })
        );
      }
    }
  };
}

export function applyFormatToItems(newValue) {
  return (dispatch, getState) => {
    const propBackground = "background";
    const propColor = "color";
    if (_.size(getState().selections) > 0) {
      const result = _.map(getState().selections, (sel) => {
        const diagramItem =
          getState().diagrams[getState().model.activeDiagram].diagramItems[
            sel.objectId
          ];
        const currentValueBackground = diagramItem[propBackground];
        const currentValueColor = diagramItem[propColor];

        return [
          ...(currentValueBackground !== newValue
            ? [
                {
                  newState: {
                    id: sel.objectId,
                    propname: "background",
                    propvalue: newValue[propBackground],
                    diagramId: getState().model.activeDiagram
                  }
                }
              ]
            : []),
          ...[
            {
              newState: {
                id: sel.objectId,
                propname: "color",
                propvalue: newValue[propColor],
                diagramId: getState().model.activeDiagram
              }
            }
          ]
        ];
      }).reduce((r, i) => (i ? [...r, ...i] : r), []);

      if (result.length > 0) {
        dispatch(
          updateDiagramItemProperties({
            changes: result.map((change) => change.newState)
          })
        );
      }
    }
  };
}

function getColCountWithAllNested(child, tables, showEmbeddable) {
  const onlyVisibleCols = _.filter(
    child.cols,
    (o) => o.name !== "FakeIdForInternalUse"
  );

  const THIS_COL_COUNT = 1;

  return _.reduce(
    onlyVisibleCols,
    (result, col) => {
      const linkedTable = _.find(tables, ["id", col.datatype]);
      const visibleLinkedTableColCount =
        showEmbeddable === true && linkedTable?.embeddable === true
          ? getColCountWithAllNested(linkedTable, tables, true)
          : 0;
      return result + THIS_COL_COUNT + visibleLinkedTableColCount;
    },
    0
  );
}

function getTableHeight(tableId, tables, showEmbeddable) {
  const table = tables[tableId];
  const allTableColumnsCount = table
    ? getColCountWithAllNested(table, tables, showEmbeddable)
    : 0;
  return allTableColumnsCount * ROW_HEIGHT + TITLE_HEIGHT_AND_COLS_PADDING;
}

function getStoreChangesOfHeight(
  diagram,
  diagramItem,
  objectType,
  state,
  { isModifiedByUser, autoExpand }
) {
  const G_HEIGHT = "gHeight";

  const changes = [];
  const original = [];

  const height = diagramItem?.gHeight;
  const domHeight = getDiagramItemElement(
    diagramItem.referencedItemId
  )?.clientHeight;

  let newHeight = domHeight;

  if (
    objectType === "table" &&
    diagramItem.resized === true &&
    diagramItem.autoExpand === true
  ) {
    const autoCalculatedHeight = getTableHeight(
      diagramItem.referencedItemId,
      state.tables,
      state.model.embeddedInParentsIsDisplayed !== false
    );
    newHeight = getNewHeight(diagramItem, autoCalculatedHeight, domHeight, {
      isModifiedByUser,
      autoExpand
    });
  }

  if (height !== newHeight) {
    changes.push({
      id: diagramItem.referencedItemId,
      propname: G_HEIGHT,
      propvalue: newHeight,
      diagramId: diagram.id
    });
    if (height) {
      original.push({
        id: diagramItem.referencedItemId,
        propname: G_HEIGHT,
        propvalue: height,
        diagramId: diagram.id
      });
    }
  }
  return { changes, original };
}

function changedWidths(diagramId, diagramItemId, state, newgWidth) {
  const G_WIDTH = "gWidth";
  const changes = [];
  const original = [];

  if (
    state.diagrams[diagramId] &&
    state.diagrams[diagramId].diagramItems[diagramItemId]
  ) {
    const currentgWidth =
      state.diagrams[diagramId].diagramItems[diagramItemId][G_WIDTH];
    if (currentgWidth !== newgWidth) {
      changes.push({
        id: diagramItemId,
        diagramId,
        propname: G_WIDTH,
        propvalue: newgWidth
      });
      if (currentgWidth) {
        original.push({
          id: diagramItemId,
          diagramId,
          propname: G_WIDTH,
          propvalue: currentgWidth
        });
      }
    }
  }
  return { changes, original };
}

function diffDOMvsStoreHeightsOnAllDiagrams(
  diagram,
  state,
  diagramItemIds,
  { isModifiedByUser, autoExpand }
) {
  const changesOriginal = diagramItemIds.map(({ id, objectType }) => {
    const diagramItem = diagram.diagramItems[id];

    return getStoreChangesOfHeight(diagram, diagramItem, objectType, state, {
      isModifiedByUser,
      autoExpand
    });
  });

  return {
    changes: changesOriginal.reduce((r, i) => [...r, ...i.changes], []),
    original: changesOriginal.reduce((r, i) => [...r, ...i.original], [])
  };
}
function diffDOMvsStoreWidthsOnAllDiagrams(
  diagramId,
  state,
  diagramItemIds,
  newWidth
) {
  return {
    changes: diagramItemIds
      .map((id) => changedWidths(diagramId, id, state, newWidth))
      .reduce((r, i) => [...r, ...i.changes], []),
    original: diagramItemIds
      .map((id) => changedWidths(diagramId, id, state, newWidth))
      .reduce((r, i) => [...r, ...i.original], [])
  };
}

export function updateWidthsOnAllDiagrams(diagramItemIds, newWidth) {
  return async (dispatch, getState) => {
    const state = getState();
    return diffDOMvsStoreWidthsOnAllDiagrams(
      state.model.activeDiagram,
      state,
      diagramItemIds,
      newWidth
    );
  };
}

function getDiagramItemElement(id) {
  return document.querySelector("#content" + id);
}

function mergeChangesOriginal(r, i) {
  return {
    ...r,
    changes: [...(r.changes ?? []), ...(i.changes ?? [])],
    original: [...(r.original ?? []), ...(i.original ?? [])]
  };
}

export function updateAllTableSizesFromDom(options) {
  return async (dispatch, getState) => {
    const state = getState();
    const tableElementPairs = _.map(
      [
        ..._.map(state.tables, (obj) => ({ obj, objectType: "table" })),
        ..._.map(state.otherObjects, (obj) => ({
          obj,
          objectType: "other_object"
        })),
        ..._.map(state.notes, (obj) => ({ obj, objectType: "note" }))
      ],
      ({ obj, objectType }) => ({
        element: getDiagramItemElement(obj.id),
        diagramItem:
          state.diagrams[state.model.activeDiagram]?.diagramItems[obj.id],
        table: obj,
        objectType
      })
    );
    const tableAssignedElementPairs = _.filter(
      tableElementPairs,
      (tableElementPair) =>
        !!tableElementPair.element && !!tableElementPair.diagramItem
    );
    const allTableChanges = _.map(
      tableAssignedElementPairs,
      (tableAssignedElementPair) => {
        const isModifiedByUser =
          !!options &&
          options.byUser === true &&
          !!options.objects.find(
            (id) => tableAssignedElementPair.table.id === id
          );
        const diffHeights = diffDOMvsStoreHeightsOnAllDiagrams(
          state.diagrams[state.model.activeDiagram],
          state,
          [
            {
              id: tableAssignedElementPair.table.id,
              objectType: tableAssignedElementPair.objectType
            }
          ],
          {
            isModifiedByUser,
            autoExpand:
              (options.autoExpand &&
                !!options.objects?.find(
                  (id) => tableAssignedElementPair.table.id === id
                )) ||
              false
          }
        );
        const diffWidths = diffDOMvsStoreWidthsOnAllDiagrams(
          state.model.activeDiagram,
          state,
          [tableAssignedElementPair.table.id],
          tableAssignedElementPair.element.clientWidth
        );
        const diffResizes =
          isModifiedByUser === true &&
          tableAssignedElementPair.diagramItem.resized === false
            ? {
                changes: [
                  {
                    id: tableAssignedElementPair.table.id,
                    diagramId: state.model.activeDiagram,
                    propname: "resized",
                    propvalue: true
                  }
                ]
              }
            : {};
        return [diffHeights, diffWidths, diffResizes].reduce(
          mergeChangesOriginal,
          {}
        );
      }
    );

    const allChanges = allTableChanges.reduce(mergeChangesOriginal, {
      changes: [],
      original: []
    });

    if (allChanges.changes.length > 0) {
      await dispatch(
        updateDiagramItemProperties({ changes: allChanges.changes })
      );
      await dispatch(setForcedRender({ domToModel: false }));
    }
  };
}

export function switchLockDimensions(selection, autoSize) {
  return async (dispatch, getState) => {
    const state = getState();
    const diagram = state.diagrams[state.model.activeDiagram];
    const selectedDiagramItems = selection
      .filter((id) => !!diagram.diagramItems[id])
      .map((id) => diagram.diagramItems[id]);
    const lockDimensionsItems = selectedDiagramItems.filter(
      (item) => item.resized === autoSize
    );

    const allChanges = lockDimensionsItems
      .map((item) => {
        return {
          changes: [
            {
              id: item.referencedItemId,
              propname: "resized",
              propvalue: !autoSize,
              diagramId: state.model.activeDiagram
            }
          ]
        };
      })
      .reduce(mergeChangesOriginal, {});

    if (allChanges.changes?.length > 0) {
      allChanges.changes.forEach((change) => {
        if (change.propname === "resized") {
          const element = getDiagramItemElement(change.id);
          if (element) {
            if (change.propvalue === true) {
              element.style.width = `${element.clientWidth}px`;
            } else {
              element.style.width = "fit-content";
              element.style.height = "fit-content";
            }
          }
        }
      });
      await dispatch(
        updateDiagramItemProperties({ changes: allChanges.changes })
      );

      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "switchLockDimensions",
        autoExpand: !autoSize,
        objects: [allChanges.changes.map((change) => change.id)]
      });
    }
  };
}

function shouldAutoExpandHeight(
  diagramItem,
  autoCalculatedHeight,
  domHeight,
  autoExpand
) {
  return (
    autoExpand &&
    diagramItem.autoExpand === true &&
    diagramItem.resized === true &&
    domHeight < autoCalculatedHeight
  );
}

function shouldRecalculateHeight(diagramItem) {
  return diagramItem.resized === false;
}

function shouldGetCurrentHeightFromDOM(isModifiedByUser) {
  return isModifiedByUser === true;
}

function getNewHeight(
  diagramItem,
  autoCalculatedHeight,
  domHeight,
  { isModifiedByUser, autoExpand }
) {
  if (shouldGetCurrentHeightFromDOM(isModifiedByUser)) {
    return domHeight;
  }
  if (
    shouldRecalculateHeight(diagramItem) ||
    shouldAutoExpandHeight(
      diagramItem,
      autoCalculatedHeight,
      domHeight,
      autoExpand
    )
  ) {
    return autoCalculatedHeight;
  }
  return domHeight;
}
