import _ from "lodash";

const clipboard = window?.clipboard;

export const SET_OBJECTS_COPY_LIST = "set_objects_copy_list";

function objectInDiagram(list, diagram) {
  return _.map(
    _.filter(list, (item) => diagram.diagramItems[item.id]),
    (item) => diagram.diagramItems[item.id]
  );
}

function getHierarchyTables(table, alltables) {
  const embeddables = _.filter(table.cols, (col) => {
    return alltables[col.datatype]?.embeddable;
  });
  return _.map(embeddables, (col) => alltables[col.datatype]);
}

function addAllHierarchyTables(tbl, allTables) {
  return _.reduce(
    getHierarchyTables(tbl, allTables),
    (r, i) => ({ ...r, [i.id]: i }),
    {}
  );
}

export function setObjectsCopyList() {
  return (dispatch, getState) => {
    var toCopyTables = {};
    var toCopyRelations = {};
    var toCopyLines = {};
    var toCopyNotes = {};
    var toCopyOtherObjects = {};
    var modelpart = {};
    var nt;

    const allTables = getState().tables;

    _.map(getState().selections, (x) => {
      if (x.objectType === "table") {
        var tbl = getState().tables[x.objectId];
        toCopyTables = {
          ...toCopyTables,
          [tbl.id]: tbl,
          ...addAllHierarchyTables(tbl, allTables)
        };
        if (_.size(tbl.relations) > 0) {
          _.map(tbl.relations, (r) => {
            toCopyRelations = {
              ...toCopyRelations,
              [r]: getState().relations[r]
            };
          });
        }
        if (_.size(tbl.lines) > 0) {
          _.map(tbl.lines, (l) => {
            toCopyLines = {
              ...toCopyLines,
              [l]: getState().lines[l]
            };
          });
        }
      } else if (x.objectType === "note") {
        nt = getState().notes[x.objectId];
        toCopyNotes = { ...toCopyNotes, [nt.id]: nt };
        if (_.size(nt.lines) > 0) {
          _.map(nt.lines, (l) => {
            toCopyLines = {
              ...toCopyLines,
              [l]: getState().lines[l]
            };
          });
        }
      } else if (x.objectType === "other_object") {
        nt = getState().otherObjects[x.objectId];
        toCopyOtherObjects = { ...toCopyOtherObjects, [nt.id]: nt };
        if (_.size(nt.lines) > 0) {
          _.map(nt.lines, (l) => {
            toCopyLines = {
              ...toCopyLines,
              [l]: getState().lines[l]
            };
          });
        }
      }
    });

    const diagramObject = getState().diagrams[getState().model.activeDiagram];

    modelpart.type = getState().model.type;
    modelpart.tables = toCopyTables;
    modelpart.relations = toCopyRelations;
    modelpart.lines = toCopyLines;
    modelpart.notes = toCopyNotes;
    modelpart.otherObjects = toCopyOtherObjects;
    modelpart.sourceDiagram = getState().model.activeDiagram;
    modelpart.diagramItems = [
      ...objectInDiagram(toCopyTables, diagramObject),
      ...objectInDiagram(toCopyNotes, diagramObject),
      ...objectInDiagram(toCopyOtherObjects, diagramObject)
    ].reduce((r, i) => {
      r[i.referencedItemId] = i;
      return r;
    }, {});

    if (clipboard) {
      clipboard.writeText(JSON.stringify(modelpart));
    } else {
    }
    dispatch({
      type: SET_OBJECTS_COPY_LIST,
      payload: modelpart
    });
  };
}
