import { ModelTypes } from "../enums/enums";
import _ from "lodash";
import { createSelector } from "reselect";

/** Common */
const getDiagramItemsArray = (items) => {
  return _.values(items);
  //return Object.keys(items).map((key) => items[key]);
};

const diagramItemsArraySelector = (state) => {
  return state.model.activeDiagram && state.diagrams[state.model.activeDiagram]
    ? getDiagramItemsArray(
        state.diagrams[state.model.activeDiagram].diagramItems
      )
    : [];
};
const diagramItemsSelector = (state) => {
  return state.model.activeDiagram && state.diagrams[state.model.activeDiagram]
    ? state.diagrams[state.model.activeDiagram].diagramItems
    : [];
};
const tablesSelector = (state) => state.tables;
const otherObjectsSelector = (state) => state.otherObjects;
const notesSelector = (state) => state.notes;
const linesSelector = (state) => state.lines;
const relationsSelector = (state) => {
  return state.model.type === ModelTypes.GRAPHQL
    ? _.filter(state.relations, (rel) => rel.type !== "identifying")
    : state.relations;
};
const implementsSelector = (state) =>
  state.model.type === ModelTypes.GRAPHQL
    ? _.filter(state.relations, (rel) => rel.type === "identifying")
    : [];
const showAllObjectsInListSelector = (state) =>
  state.settings.showAllObjectsInList;

/** Active Diagram Objects */
export const getActiveDiagramObject = (state) =>
  state.model.activeDiagram && state.diagrams[state.model.activeDiagram];

function activeDiagramObjects(diagramItems, objects, activeDiagram) {
  return diagramItems
    .filter(
      (item) =>
        objects[item.referencedItemId] &&
        (objects[item.referencedItemId].visible || !activeDiagram.main)
    )
    .map((item) => ({ ...objects[item.referencedItemId], ...item }))
    .reduce((r, i) => {
      r[i.id] = i;
      return r;
    }, {});
}

export const getActiveDiagramItems = (state) =>
  state.model.activeDiagram && state.diagrams[state.model.activeDiagram]
    ? state.diagrams[state.model.activeDiagram].diagramItems
    : {};

export const getActiveDiagramTables = createSelector(
  diagramItemsArraySelector,
  tablesSelector,
  getActiveDiagramObject,
  activeDiagramObjects
);

export const getActiveDiagramOtherObjects = createSelector(
  diagramItemsArraySelector,
  otherObjectsSelector,
  getActiveDiagramObject,
  activeDiagramObjects
);

export const getActiveDiagramNotes = createSelector(
  diagramItemsArraySelector,
  notesSelector,
  getActiveDiagramObject,
  activeDiagramObjects
);

/** Active Diagram Available Objects */
function activeDiagramAvailableObjects(
  diagramItems,
  objects,
  activeDiagram,
  showAllObjectsInList
) {
  return activeDiagram
    ? activeNonEmptyDiagramAvaiableObjects(
        activeDiagram,
        objects,
        showAllObjectsInList,
        diagramItems
      )
    : [];
}

export const getActiveDiagramAvailableTables = createSelector(
  diagramItemsSelector,
  tablesSelector,
  getActiveDiagramObject,
  showAllObjectsInListSelector,
  activeDiagramAvailableObjects
);

export const getActiveDiagramAvailableOtherObjects = createSelector(
  diagramItemsSelector,
  otherObjectsSelector,
  getActiveDiagramObject,
  showAllObjectsInListSelector,
  activeDiagramAvailableObjects
);

export const getActiveDiagramAvailableNotes = createSelector(
  diagramItemsSelector,
  notesSelector,
  getActiveDiagramObject,
  showAllObjectsInListSelector,
  activeDiagramAvailableObjects
);

function activeNonEmptyDiagramAvaiableObjects(
  activeDiagram,
  objects,
  showAllObjectsInList,
  diagramItems
) {
  return activeDiagram.main
    ? activeMainDiagramAvailableObjects(objects)
    : activeNonMainDiagramAvailableObjects(
        objects,
        showAllObjectsInList,
        diagramItems
      );
}

function activeNonMainDiagramAvailableObjects(
  objects,
  showAllObjectsInList,
  diagramItems
) {
  return _.filter(
    objects,
    (obj) => showAllObjectsInList || diagramItems[obj.id]
  )
    .map((obj) => ({ ...obj, onDiagram: !!diagramItems[obj.id] }))
    .reduce((r, i) => {
      r[i.id] = i;
      return r;
    }, {});
}

function activeMainDiagramAvailableObjects(objects) {
  return _.map(objects, (obj) => ({ ...obj, onDiagram: true })).reduce(
    (r, i) => {
      r[i.id] = i;
      return r;
    },
    {}
  );
}

function endpointVisibleOnMain(obj, tables, otherObjects, notes) {
  const parent =
    tables[obj.parent] || otherObjects[obj.parent] || notes[obj.parent];
  const child =
    tables[obj.child] || otherObjects[obj.child] || notes[obj.child];
  return parent && child && parent.visible && child.visible;
}

/** Active Diagram Available Links */
function activeDiagramAvailableLinks(
  diagramItems,
  links,
  tables,
  otherObjects,
  notes,
  activeDiagram,
  showAllObjectsInList
) {
  return activeDiagram
    ? activeDiagram.main
      ? _.map(links, (obj) => ({
          ...obj,
          onDiagram: endpointVisibleOnMain(obj, tables, otherObjects, notes)
        })).reduce((r, i) => {
          r[i.id] = i;
          return r;
        }, {})
      : _.filter(
          links,
          (link) =>
            showAllObjectsInList ||
            (!!diagramItems[link.parent] && !!diagramItems[link.child])
        )
          .map((link) => ({
            ...link,
            onDiagram: !!diagramItems[link.parent] && !!diagramItems[link.child]
          }))
          .reduce((r, i) => {
            r[i.id] = i;
            return r;
          }, {})
    : [];
}

export const getActiveDiagramAvailableLines = createSelector(
  diagramItemsSelector,
  linesSelector,
  tablesSelector,
  otherObjectsSelector,
  notesSelector,
  getActiveDiagramObject,
  showAllObjectsInListSelector,
  activeDiagramAvailableLinks
);

export const getActiveDiagramAvailableRelations = createSelector(
  diagramItemsSelector,
  relationsSelector,
  tablesSelector,
  otherObjectsSelector,
  notesSelector,
  getActiveDiagramObject,
  showAllObjectsInListSelector,
  activeDiagramAvailableLinks
);

export const getActiveDiagramAvailableImplements = createSelector(
  diagramItemsSelector,
  implementsSelector,
  tablesSelector,
  otherObjectsSelector,
  notesSelector,
  getActiveDiagramObject,
  showAllObjectsInListSelector,
  activeDiagramAvailableLinks
);
