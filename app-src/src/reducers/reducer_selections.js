import {
  ADD_ALL_NOTES_TO_SELECTION,
  ADD_ALL_OTHER_OBJECTS_TO_SELECTION,
  ADD_ALL_TABLES_TO_SELECTION,
  ADD_TO_SELECTION,
  ADD_VISIBLE_OTHER_OBJECTS_TO_SELECTION,
  ADD_VISIBLE_TABLES_TO_SELECTION,
  CLEAR_ADD_MULTIPLE_TO_SELECTION,
  CLEAR_ADD_TO_SELECTION,
  CLEAR_SELECTION,
  DELETE_SELECTION,
  REMOVE_FROM_SELECTION
} from "../actions/selections";

import { CLEAR_MODEL } from "../actions/model";
import _ from "lodash";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case ADD_VISIBLE_TABLES_TO_SELECTION: {
      let s = {};
      for (let t of action.payload) {
        let obj = { objectType: "table", objectId: t };
        s = { ...s, [t]: obj };
      }
      return s;
    }
    case ADD_VISIBLE_OTHER_OBJECTS_TO_SELECTION: {
      let s = {};
      for (let t of action.payload) {
        let obj = { objectType: "other_object", objectId: t };
        s = { ...s, [t]: obj };
      }
      return s;
    }
    case ADD_ALL_OTHER_OBJECTS_TO_SELECTION:
      for (var t of action.payload) {
        let obj = { objectType: "other_object", objectId: t };
        state = { ...state, [t]: obj };
      }
      return { ...state };
    case ADD_ALL_TABLES_TO_SELECTION:
      for (let t of action.payload) {
        let obj = { objectType: "table", objectId: t };
        state = { ...state, [t]: obj };
      }
      return { ...state };
    case ADD_ALL_NOTES_TO_SELECTION:
      //var s = {};
      for (let t of action.payload) {
        let obj = { objectType: "note", objectId: t };
        state = { ...state, [t]: obj };
      }
      return { ...state };
    case ADD_TO_SELECTION:
      return { ...state, [action.payload.objectId]: action.payload };
    case CLEAR_ADD_TO_SELECTION:
      return { [action.payload.objectId]: action.payload };
    case CLEAR_ADD_MULTIPLE_TO_SELECTION:
      return { ...action.payload };
    case REMOVE_FROM_SELECTION:
      return _.omit(state, action.payload);
    case CLEAR_SELECTION:
      return INITIAL_STATE;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case DELETE_SELECTION:
      return INITIAL_STATE;
    default:
      return state;
  }
}
