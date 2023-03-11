import { TYPE, addNotification, addNotificationSimple } from "./notifications";
import { clearAddMultipleToSelection, clearSelection } from "./selections";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "./undoredo";

import { FETCH_TABLES } from "./tables";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "common";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addDiagramItems } from "./diagrams";
import { createDiagramItem } from "../classes/factory/class_diagram_item_factory";
import { fetchLine } from "./lines";
import { fetchNote } from "./notes";
import { fetchOtherObject } from "./other_objects";
import { fetchRelation } from "./relations";
import { getHistoryContext } from "../helpers/history/history";
import moment from "moment";
import { navigateByObjectType } from "../components/url_navigation";
import { setDiagramLoading } from "./ui";
import { updateOrderForNewObject } from "./order";
import { v4 as uuidv4 } from "uuid";

const clipboard = window?.clipboard;

function findNotEmbedabbleParent(table, tables) {
  if (!table.embeddable) {
    return table;
  }
  const foundTable = _.find(tables, (alltable) =>
    _.find(alltable.cols, (col) => col.datatype === table.id)
  );
  if (!foundTable) {
    return undefined;
  }
  if (!foundTable.embeddable) {
    return foundTable;
  } else if (foundTable.embeddable) {
    return findNotEmbedabbleParent(foundTable, tables);
  }
}

export function copySelectedTables(copiedTables, props) {
  return async (dispatch, getState) => {
    var modelpart;
    if (clipboard) {
      try {
        modelpart = JSON.parse(clipboard.readText());
      } catch (e) {
        await dispatch(setDiagramLoading(false));
        await dispatch(
          addNotificationSimple(
            "Unsupported clipboard format",
            TYPE.ERROR,
            false
          )
        );
        return;
      }
    } else {
      modelpart = copiedTables;
    }

    if (!isCopySupported(modelpart.type)) {
      await dispatch(
        addNotification({
          id: uuidv4(),
          datepast: moment().startOf("minute").fromNow(),
          datesort: moment().unix(),
          date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
          message: `Copy and paste operations are not supported for the ${modelpart.type} project type`,
          model: getState().model.name,
          type: "warning",
          autohide: false
        })
      );
      return;
    }

    if (modelpart !== undefined && modelpart.type === getState().model.type) {
      const activeDiagram = getState().diagrams[getState().model.activeDiagram];
      const mainDiagram = _.find(getState().diagrams, ["main", true]);

      await dispatch(setDiagramLoading(true));
      setTimeout(async () => {
        await dispatch(
          startTransaction(
            getHistoryContext(props.history, props.match),
            UndoRedoDef.COPY_PASTE
          )
        );
        try {
          modelpart.tables = _.map(
            _.filter(
              modelpart.tables,
              (table) => !!findNotEmbedabbleParent(table, modelpart.tables)
            ),
            (table) => {
              if (table.embeddable) {
                table.name =
                  getState().model.type === ModelTypes.MONGOOSE
                    ? "Object"
                    : "object";
              }
              return table;
            }
          );

          //process tables
          var tablesToReplace = [];
          var relsToReplace = [];
          var relsToDispatch = [];
          var relsToDelete = [];
          var tablesToDispatch = [];
          var colsToReplace = [];

          var keysToReplace = [];
          var linesToReplace = [];
          var linesToDispatch = [];
          var linesToDelete = [];

          var notesToReplace = [];
          var notesToDispatch = [];

          var otherObjectsToReplace = [];
          var otherObjectsToDispatch = [];

          var diagramItemsToDispatch = [];

          // prepare all objects that can be connected by relation or line
          var allObjectsArray = {
            ...modelpart.tables,
            ...modelpart.notes,
            ...modelpart.otherObjects
          };

          // prepare relations
          const rels = _.map(modelpart.relations, (rel) => rel);
          for (const rel of rels) {
            var newRelId = uuidv4();
            var newRel = _.cloneDeep(rel);
            newRel.id = newRelId;
            relsToReplace = [...relsToReplace, { old: rel.id, new: newRelId }];
            relsToDispatch = { ...relsToDispatch, [newRelId]: newRel };

            if (
              _.find(modelpart.tables, ["id", rel.child]) === undefined ||
              _.find(modelpart.tables, ["id", rel.parent]) === undefined
            ) {
              relsToDelete = [...relsToDelete, newRelId];
            }
          }

          // prepare lines
          const lines = _.map(modelpart.lines, (line) => line);
          for (const line of lines) {
            var newLineId = uuidv4();
            var newLine = _.cloneDeep(line);
            newLine.id = newLineId;
            linesToReplace = [
              ...linesToReplace,
              { old: line.id, new: newLineId }
            ];
            linesToDispatch = { ...linesToDispatch, [newLineId]: newLine };

            if (
              _.find(allObjectsArray, ["id", line.child]) === undefined ||
              _.find(allObjectsArray, ["id", line.parent]) === undefined
            ) {
              linesToDelete = [...linesToDelete, newLineId];
            }
          }

          // prepare notes
          const notes = _.map(modelpart.notes, (note) => note);
          for (const note of notes) {
            var newNoteId = uuidv4();
            var newNote = _.cloneDeep(note);
            newNote.id = newNoteId;

            diagramItemsToDispatch = createDiagramItemOnDefaultPosition(
              modelpart,
              "note",
              note.id,
              newNote,
              diagramItemsToDispatch,
              activeDiagram,
              mainDiagram
            );

            var objectLines = [];

            for (const l of note.lines) {
              var xlinech = _.filter(linesToDispatch, ["child", note.id]);
              if (xlinech !== undefined) {
                for (let xlinechitem of xlinech) {
                  xlinechitem.child = newNoteId;
                  linesToDispatch = {
                    ...linesToDispatch,
                    [xlinechitem.id]: xlinechitem
                  };
                }
              }
              var xlinep = _.filter(linesToDispatch, ["parent", note.id]);
              if (xlinep !== undefined) {
                for (let xlinepitem of xlinep) {
                  xlinepitem.parent = newNoteId;
                  linesToDispatch = {
                    ...linesToDispatch,
                    [xlinepitem.id]: xlinepitem
                  };
                }
              }
              var newObjectLine = _.find(linesToReplace, ["old", l]);
              if (newObjectLine !== undefined) {
                objectLines = [...objectLines, newObjectLine.new];
              }
            }

            newNote.lines = objectLines;

            notesToReplace = [
              ...notesToReplace,
              { old: note.id, new: newNoteId }
            ];
            notesToDispatch = { ...notesToDispatch, [newNoteId]: newNote };

            newNote = null;
          }

          // prepare other objects
          const otherObjects = _.map(
            modelpart.otherObjects,
            (otherObject) => otherObject
          );
          for (const otherObject of otherObjects) {
            var newOtherObjectId = uuidv4();
            var newOtherObject = _.cloneDeep(otherObject);
            newOtherObject.id = newOtherObjectId;

            diagramItemsToDispatch = createDiagramItemOnDefaultPosition(
              modelpart,
              "other_object",
              otherObject.id,
              newOtherObject,
              diagramItemsToDispatch,
              activeDiagram,
              mainDiagram
            );

            var objectLines = [];

            for (const l of otherObject.lines) {
              var xlinech = _.filter(linesToDispatch, [
                "child",
                otherObject.id
              ]);
              if (xlinech !== undefined) {
                for (let xlinechitem of xlinech) {
                  xlinechitem.child = newOtherObjectId;
                  linesToDispatch = {
                    ...linesToDispatch,
                    [xlinechitem.id]: xlinechitem
                  };
                }
              }
              var xlinep = _.filter(linesToDispatch, [
                "parent",
                otherObject.id
              ]);
              if (xlinep !== undefined) {
                for (let xlinepitem of xlinep) {
                  xlinepitem.parent = newOtherObjectId;
                  linesToDispatch = {
                    ...linesToDispatch,
                    [xlinepitem.id]: xlinepitem
                  };
                }
              }
              var newObjectLine = _.find(linesToReplace, ["old", l]);
              if (newObjectLine !== undefined) {
                objectLines = [...objectLines, newObjectLine.new];
              }
            }

            newOtherObject.lines = objectLines;

            otherObjectsToReplace = [
              ...otherObjectsToReplace,
              { old: otherObject.id, new: newOtherObjectId }
            ];
            otherObjectsToDispatch = {
              ...otherObjectsToDispatch,
              [newOtherObjectId]: newOtherObject
            };

            newOtherObject = null;
          }

          // prepare tables
          const tables = _.map(modelpart.tables, (table) => table);

          for (const x of tables) {
            var tableRels = [];
            var tableLines = [];
            var newTblId = uuidv4();
            tablesToReplace = [
              ...tablesToReplace,
              { old: x.id, new: newTblId }
            ];
            var newObj = _.cloneDeep(x);
            if (newObj) {
              newObj.id = newTblId;
              if (!newObj.embeddable) {
                newObj.name += "_copy";
              }
              // copy only non graphic info
              //newObj.x += 40;
              //newObj.y += 40;

              diagramItemsToDispatch = createDiagramItemOnDefaultPosition(
                modelpart,
                "table",
                x.id,
                newObj,
                diagramItemsToDispatch,
                activeDiagram,
                mainDiagram
              );

              for (let c of newObj.cols) {
                var newColId = uuidv4();
                colsToReplace = [
                  ...colsToReplace,
                  { old: c.id, new: newColId }
                ];

                for (let k of newObj.keys) {
                  var newKeyId = uuidv4();
                  keysToReplace = [
                    ...keysToReplace,
                    { old: k.id, new: newKeyId }
                  ];
                  k.id = newKeyId;
                }

                /*
                //var newColId = uuidv4();
                for (let k of newObj.keys) {
                  for (let colInKey of k.cols) {
                    if (colInKey.colid === c.id) {
                      colInKey.colid = newColId;
                    }
                  }
                }
                for (let ix of newObj.indexes) {
                  for (let colInIx of ix.cols) {
                    if (colInIx.colid === c.id) {
                      colInIx.colid = newColId;
                    }
                  }
                }
                */
                //c.id = newColId;
                //c.fk = false;
              }

              if (_.size(x.relations) > 0) {
                _.map(x.relations, (r) => {
                  var xrelch = _.filter(relsToDispatch, ["child", x.id]);
                  if (xrelch !== undefined) {
                    for (let xrelchitem of xrelch) {
                      xrelchitem.child = newTblId;
                      relsToDispatch = {
                        ...relsToDispatch,
                        [xrelchitem.id]: xrelchitem
                      };
                    }
                  }
                  var xrelp = _.filter(relsToDispatch, ["parent", x.id]);
                  if (xrelp !== undefined) {
                    for (let xrelpitem of xrelp) {
                      xrelpitem.parent = newTblId;
                      relsToDispatch = {
                        ...relsToDispatch,
                        [xrelpitem.id]: xrelpitem
                      };
                    }
                  }
                  var newTableRel = _.find(relsToReplace, ["old", r]);
                  if (newTableRel !== undefined) {
                    tableRels = [...tableRels, newTableRel.new];
                  }
                });
              }

              if (_.size(x.lines) > 0) {
                _.map(x.lines, (l) => {
                  var xlinech = _.filter(linesToDispatch, ["child", x.id]);
                  if (xlinech !== undefined) {
                    for (let xlinechitem of xlinech) {
                      xlinechitem.child = newTblId;
                      linesToDispatch = {
                        ...linesToDispatch,
                        [xlinechitem.id]: xlinechitem
                      };
                    }
                  }
                  var xlinep = _.filter(linesToDispatch, ["parent", x.id]);
                  if (xlinep !== undefined) {
                    for (let xlinepitem of xlinep) {
                      xlinepitem.parent = newTblId;
                      linesToDispatch = {
                        ...linesToDispatch,
                        [xlinepitem.id]: xlinepitem
                      };
                    }
                  }
                  var newTableLine = _.find(linesToReplace, ["old", l]);
                  if (newTableLine !== undefined) {
                    tableLines = [...tableLines, newTableLine.new];
                  }
                });
              }

              newObj.relations = tableRels;
              newObj.lines = tableLines;

              tablesToDispatch = { ...tablesToDispatch, [newTblId]: newObj };

              newObj = null;
            }
          }

          /* TODO replace datatype with table id """""""""" */

          // process relations
          const relsToDispatchArray = _.map(relsToDispatch, (r) => r);
          for (const rtd of relsToDispatchArray) {
            var keyToReplaceP = _.find(keysToReplace, ["old", rtd.parent_key]);
            if (keyToReplaceP !== undefined) {
              rtd.parent_key = keyToReplaceP.new;
            }

            for (const c of rtd.cols) {
              var colToReplaceP = _.find(tablesToReplace, ["old", c.parentcol]);
              var colToReplaceCh = _.find(tablesToReplace, ["old", c.childcol]);
              if (colToReplaceP !== undefined) {
                c.parentcol = colToReplaceP.new;
              }
              if (colToReplaceCh !== undefined) {
                c.childcol = colToReplaceCh.new;
              }
            }

            if (relsToDelete.includes(rtd.id)) {
              var childTable = _.cloneDeep(tablesToDispatch[rtd.child]);
              var parentTable = _.cloneDeep(tablesToDispatch[rtd.parent]);

              if (childTable !== undefined) {
                // remove FK from child
                for (let col2 of rtd.cols) {
                  // spocitej jestli je mozne smazat, pokud existuje i v jine relaci, tak nechat. cnt udava pocet vyskytu, ma byt prave jeden.
                  var cnt2 = 0;
                  for (let r2 of childTable.relations) {
                    var rObj2 = getState().relations[r2];
                    if (rObj2) {
                      cnt2 += _.size(
                        _.filter(rObj2.cols, ["childcol", col2.childcol])
                      );
                    }
                  }
                  const isInKey =
                    _.filter(childTable.keys, {
                      cols: [{ colid: col2.childcol }]
                    }).length > 0;

                  if (cnt2 < 2) {
                    if (!isInKey) {
                      // musi byt jedna, jen pokud rel neexistuje (dusledek kopirovani), tak muze byt 0. Proto check na <2
                      childTable.cols = _.reject(childTable.cols, {
                        id: col2.childcol
                      });
                    } else {
                      const childCol = _.find(childTable.cols, [
                        "id",
                        col2.childcol
                      ]);
                      if (childCol) {
                        childCol.fk = false;
                        childCol.ref = "";
                      }
                    }
                  }
                }
                _.pull(childTable.relations, rtd.id);
                tablesToDispatch = {
                  ...tablesToDispatch,
                  [childTable.id]: childTable
                };
              }

              if (parentTable !== undefined) {
                _.pull(parentTable.relations, rtd.id);
                tablesToDispatch = {
                  ...tablesToDispatch,
                  [parentTable.id]: parentTable
                };
              }
            } else {
              await dispatch(fetchRelation(rtd));
            }
          }

          // process lines

          const linesToDispatchArray = _.map(linesToDispatch, (l) => l);
          for (const ltd of linesToDispatchArray) {
            if (linesToDelete.includes(ltd.id)) {
              var allObjectsArrayToDispatch = {
                ...tablesToDispatch,
                ...notesToDispatch,
                ...otherObjectsToDispatch
              };

              var childObject = _.cloneDeep(
                allObjectsArrayToDispatch[ltd.child]
              );
              var parentObject = _.cloneDeep(
                allObjectsArrayToDispatch[ltd.parent]
              );

              if (childObject !== undefined) {
                _.pull(childObject.lines, ltd.id);

                if (
                  _.find(tablesToDispatch, ["id", childObject.id]) !== undefined
                ) {
                  tablesToDispatch = {
                    ...tablesToDispatch,
                    [childObject.id]: childObject
                  };
                }
                if (
                  _.find(notesToDispatch, ["id", childObject.id]) !== undefined
                ) {
                  notesToDispatch = {
                    ...notesToDispatch,
                    [childObject.id]: childObject
                  };
                }
                if (
                  _.find(otherObjectsToDispatch, ["id", childObject.id]) !==
                  undefined
                ) {
                  otherObjectsToDispatch = {
                    ...otherObjectsToDispatch,
                    [childObject.id]: childObject
                  };
                }
              }

              if (parentObject !== undefined) {
                _.pull(parentObject.lines, ltd.id);

                if (
                  _.find(tablesToDispatch, ["id", parentObject.id]) !==
                  undefined
                ) {
                  tablesToDispatch = {
                    ...tablesToDispatch,
                    [parentObject.id]: parentObject
                  };
                }
                if (
                  _.find(notesToDispatch, ["id", parentObject.id]) !== undefined
                ) {
                  notesToDispatch = {
                    ...notesToDispatch,
                    [parentObject.id]: parentObject
                  };
                }
                if (
                  _.find(otherObjectsToDispatch, ["id", parentObject.id]) !==
                  undefined
                ) {
                  otherObjectsToDispatch = {
                    ...otherObjectsToDispatch,
                    [parentObject.id]: parentObject
                  };
                }
              }
            } else {
              await dispatch(fetchLine(ltd));
            }
          }

          // process tables
          const tablesToDispatchArray = _.map(tablesToDispatch, (t) => t);
          const tablesToFetch = _.map(tablesToDispatchArray, (ttd) => {
            for (const c of ttd.cols) {
              var colToReplace = _.find(tablesToReplace, ["old", c.datatype]);
              if (colToReplace !== undefined) {
                c.datatype = colToReplace.new;
              }
            }

            //ttd.resized = false;
            return ttd;
          });

          await dispatch({
            type: FETCH_TABLES,
            payload: {
              tables: [..._.map(getState().tables, (t) => t), ...tablesToFetch],
              profile: getState().profile
            }
          });

          // process notes
          const notesToDispatchArray = _.map(notesToDispatch, (n) => n);
          for (const nt of notesToDispatchArray) {
            nt.name += "_copy";
            // skip graphic info
            // nt.x += 40;
            // nt.y += 40;
            await dispatch(fetchNote(nt));
          }

          // process other objects
          const otherObjectsToDispatchArray = _.map(
            otherObjectsToDispatch,
            (o) => o
          );
          for (const oo of otherObjectsToDispatchArray) {
            oo.name += "_copy";
            // skip graphic info
            // oo.x += 40;
            // oo.y += 40;
            await dispatch(fetchOtherObject(oo));
          }
          await dispatch(
            selectNewObjects(
              getCurrentHistoryTransaction().historyContext,
              tablesToFetch,
              notesToDispatch,
              otherObjectsToDispatch
            )
          );
          await dispatch(updateOrderForNewObject(getState().model.type));
          await dispatch(deployDiagramItems(diagramItemsToDispatch));

          await dispatch(setDiagramLoading(false));
        } finally {
          await dispatch(finishTransaction());
        }
      }, 0);
    } else {
      await dispatch(
        addNotification({
          id: uuidv4(),
          datepast: moment().startOf("minute").fromNow(),
          datesort: moment().unix(),
          date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
          message:
            "Different source or target platform. You can copy and paste objects from/to the same platform.",
          model: getState().model.name,
          type: "warning",
          autohide: false
        })
      );
    }
  };
}

function deployDiagramItems(diagramItemsToDispatch) {
  return async (dispatch) => {
    const groupedByDiagram = _.chain(diagramItemsToDispatch)
      .groupBy("did")
      .map((value, key) => ({ did: key, di: value }))
      .value();

    await Promise.all(
      groupedByDiagram.map((diagramAndItem) => {
        dispatch(
          addDiagramItems(
            diagramAndItem.did,
            diagramAndItem.di.reduce((r, i) => [...r, i.di], [])
          )
        );
      })
    );
  };
}

function createDiagramItemOnDefaultPosition(
  modelpart,
  type,
  oldObjectId,
  newObject,
  diagramItemsToDispatch,
  activeDiagram,
  mainDiagram
) {
  const result = [];
  let newActiveDiagramItem = cloneExistingDiagramItem(
    newObject.id,
    modelpart.diagramItems[oldObjectId]
  );
  if (!newActiveDiagramItem) {
    newActiveDiagramItem = createDiagramItem(newObject, type, 100, 100);
  }
  if (activeDiagram.main) {
    newObject.visible = type === "table" && newObject.embeddable ? false : true;
  }
  result.push({ di: newActiveDiagramItem, did: activeDiagram.id });

  if (!activeDiagram.main) {
    newObject.visible = false;
    result.push({
      di: createDiagramItem(newObject, type, 100, 100),
      did: mainDiagram.id
    });
  }
  return [...diagramItemsToDispatch, ...result];
}

function selectNewObjects(
  historyContext,
  tablesToFetch,
  notesToDispatch,
  otherObjectsToDispatch
) {
  return async (dispatch, getState) => {
    const newSelection = [
      ...addListToSelection(tablesToFetch, "table"),
      ...addListToSelection(notesToDispatch, "note"),
      ...addListToSelection(otherObjectsToDispatch, "other_object")
    ].reduce((r, i) => {
      r[i.objectId] = i;
      return r;
    }, {});
    if (Object.keys(newSelection).length > 0) {
      await dispatch(clearAddMultipleToSelection(newSelection));
    } else {
      dispatch(clearSelection(true));
    }
    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: false,
      operation: "selectNewObjects"
    });
    navigateToObjectFromSelection(newSelection, historyContext, getState);
  };
}

function cloneExistingDiagramItem(newId, di) {
  if (di) {
    const newDi = Object.assign({}, di);
    newDi.referencedItemId = newId;
    newDi.x += 40;
    newDi.y += 40;
    return newDi;
  }
  return undefined;
}

function isCopySupported(modelPartType) {
  return !JsonSchemaHelpers.isPerseidModelType(modelPartType);
}

function addListToSelection(list, objectType) {
  return list
    ? Object.keys(list)
        .map((key) => list[key])
        .map((t) => ({ objectId: t.id, objectType }))
    : [];
}

function navigateToObjectFromSelection(selection, historyContext, getState) {
  const selected =
    selection &&
    Object.keys(selection)
      .map((key) => selection[key])
      .find(() => true);
  if (selected) {
    const selectedObject = getObjectById(getState, selected.objectId);
    if (selectedObject) {
      navigateByObjectType(historyContext, selected.objectType, selectedObject);
    }
  }
}

function getObjectById(getState, id) {
  const state = getState();
  let toReturn = state.tables[id];
  if (toReturn === undefined) toReturn = state.notes[id];
  if (toReturn === undefined) toReturn = state.otherObjects[id];
  if (toReturn === undefined) toReturn = state.relations[id];
  if (toReturn === undefined) toReturn = state.lines[id];
  return toReturn;
}
