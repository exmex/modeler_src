import {
  ADD_NOTE,
  CLEAR_NOTES,
  COPY_SELECTED_NOTES,
  DELETE_NOTE,
  FETCH_NOTE,
  FETCH_NOTES,
  IMPORT_NOTES,
  UPDATE_NOTE_PROPERTIES,
  UPDATE_NOTE_PROPERTY
} from "../actions/notes";

import { CLEAR_MODEL } from "../actions/model";
import { COPY_SELECTED_TABLES } from "../actions/tables";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case COPY_SELECTED_TABLES:
      var noteCopies = {};
      _.map(action.payload, (sel) => {
        var newObj = _.cloneDeep(state[sel.objectId]);
        if (newObj) {
          newObj.id = uuidv4();
          newObj.name += "_copy";
          newObj.x += 20;
          newObj.y += 20;
          noteCopies = { ...noteCopies, [newObj.id]: newObj };
          newObj = null;
        }
      });

      return { ...state, ...noteCopies };

    case COPY_SELECTED_NOTES:
      var tableCopies = {};
      _.map(action.payload, (sel) => {
        var newObj = _.cloneDeep(state[sel.objectId]);
        newObj.id = uuidv4();
        newObj.name += "_copy";
        newObj.x += 20;
        newObj.y += 20;
        newObj.relations = [];

        for (var c of newObj.cols) {
          var newColId = uuidv4();
          for (var k of newObj.keys) {
            for (var colInKey of k.cols) {
              if (colInKey.colid === c.id) {
                colInKey.colid = newColId;
              }
            }
          }
          for (var ix of newObj.indexes) {
            for (var colInIx of ix.cols) {
              if (colInIx.colid === c.id) {
                colInIx.colid = newColId;
              }
            }
          }

          c.id = newColId;
          c.fk = false;
        }

        tableCopies = { ...tableCopies, [newObj.id]: newObj };
        newObj = null;
      });

      return { ...state, ...tableCopies };

    case IMPORT_NOTES:
      return action.payload;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case CLEAR_NOTES:
      return INITIAL_STATE;
    case DELETE_NOTE:
      return _.omit(state, action.payload);
    case ADD_NOTE:
      return { ...state, [action.payload.id]: action.payload };

    case UPDATE_NOTE_PROPERTY:
      return {
        ...state,
        [action.payload.noteId]: {
          ...state[action.payload.noteId],
          [action.payload.pName]: action.payload.newValue
        }
      };

    case UPDATE_NOTE_PROPERTIES:
      return {
        ...action.payload.reduce(
          (r, propertyChange) => ({
            ...r,
            [propertyChange.id]: {
              ...r[propertyChange.id],
              [propertyChange.propname]: propertyChange.propvalue
            }
          }),
          state
        )
      };

    case FETCH_NOTE:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_NOTES:
      return _.mapKeys(action.payload, "id");
    default:
      return state;
  }
}
