import {
  ADD_OTHER_OBJECT,
  CLEAR_OTHER_OBJECTS,
  COPY_SELECTED_OTHER_OBJECTS,
  DELETE_OTHER_OBJECT,
  FETCH_OTHER_OBJECT,
  FETCH_OTHER_OBJECTS,
  IMPORT_OTHER_OBJECTS,
  UPDATE_OTHER_OBJECT_PROPERTIES,
  UPDATE_OTHER_OBJECT_PROPERTY
} from "../actions/other_objects";

import { CLEAR_MODEL } from "../actions/model";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case COPY_SELECTED_OTHER_OBJECTS:
      var otherObjectCopies = {};
      _.map(action.payload, (sel) => {
        var newObj = _.cloneDeep(state[sel.objectId]);
        newObj.id = uuidv4();
        newObj.name += "_copy";
        newObj.x += 20;
        newObj.y += 20;
        otherObjectCopies = { ...otherObjectCopies, [newObj.id]: newObj };
        newObj = null;
      });
      return { ...state, ...otherObjectCopies };

    case IMPORT_OTHER_OBJECTS:
      return action.payload;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case CLEAR_OTHER_OBJECTS:
      return INITIAL_STATE;
    case DELETE_OTHER_OBJECT:
      return _.omit(state, action.payload);
    case ADD_OTHER_OBJECT:
      return { ...state, [action.payload.id]: action.payload };

    case UPDATE_OTHER_OBJECT_PROPERTY:
      return {
        ...state,
        [action.payload.otherObjectId]: {
          ...state[action.payload.otherObjectId],
          [action.payload.pName]: action.payload.newValue
        }
      };

    case UPDATE_OTHER_OBJECT_PROPERTIES:
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

    case FETCH_OTHER_OBJECT:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_OTHER_OBJECTS:
      return _.mapKeys(action.payload, "id");
    default:
      return state;
  }
}
