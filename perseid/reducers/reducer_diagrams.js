import {
  ADD_DIAGRAM,
  ADD_DIAGRAM_ITEMS,
  CLEAR_DIAGRAMS,
  CREATE_DIAGRAM,
  DELETE_ALL_DIAGRAM_ITEMS,
  DELETE_DIAGRAM,
  DELETE_DIAGRAM_ITEMS,
  FETCH_DIAGRAM,
  IMPORT_DIAGRAMS,
  SET_DIAGRAM_SCROLL,
  SET_DIAGRAM_ZOOM,
  UPDATE_DIAGRAM_ITEM_PROPERTIES,
  UPDATE_DIAGRAM_PROPERTY
} from "../actions/diagrams";

import { CLEAR_MODEL } from "../actions/model";
import _ from "lodash";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case CREATE_DIAGRAM:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_DIAGRAM:
      return { ...state, [action.payload.id]: action.payload };
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case IMPORT_DIAGRAMS:
      return action.payload;
    case CLEAR_DIAGRAMS:
      return INITIAL_STATE;
    case DELETE_DIAGRAM:
      return _.omit(state, action.payload);
    case ADD_DIAGRAM:
      return { ...state, [action.payload.id]: action.payload };
    case SET_DIAGRAM_ZOOM:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          zoom: action.payload.zoom
        }
      };
    case SET_DIAGRAM_SCROLL:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          scroll: action.payload.scroll
        }
      };
    case UPDATE_DIAGRAM_PROPERTY:
      return {
        ...state,
        [action.payload.diagramId]: {
          ...state[action.payload.diagramId],
          [action.payload.pName]: action.payload.newValue
        }
      };

    case UPDATE_DIAGRAM_ITEM_PROPERTIES:
      return {
        ...action.payload.changes.reduce(
          (r, propertyChange) => ({
            ...r,
            [propertyChange.diagramId]: {
              ...r[propertyChange.diagramId],
              diagramItems: {
                ...r[propertyChange.diagramId].diagramItems,
                [propertyChange.id]: {
                  ...r[propertyChange.diagramId].diagramItems[
                    propertyChange.id
                  ],
                  [propertyChange.propname]: propertyChange.propvalue
                }
              }
            }
          }),
          state
        )
      };

    case DELETE_ALL_DIAGRAM_ITEMS:
      return Object.keys(state)
        .map((key) => state[key])
        .map((diagram) => ({
          ...diagram,
          diagramItems: Object.keys(diagram.diagramItems)
            .map((key) => diagram.diagramItems[key])
            .map((item) => {
              return item;
            })
            .filter((item) => item.referencedItemId !== action.payload)
            .reduce((r, i) => {
              r[i.referencedItemId] = i;
              return r;
            }, {})
        }))
        .reduce((r, i) => {
          r[i.id] = i;
          return r;
        }, {});

    case DELETE_DIAGRAM_ITEMS:
      return {
        ...state,
        [action.payload.diagramId]: {
          ...state[action.payload.diagramId],
          diagramItems: Object.keys(
            state[action.payload.diagramId].diagramItems
          )
            .map((key) => state[action.payload.diagramId].diagramItems[key])
            .map((item) => {
              return item;
            })
            .filter(
              (item) => !action.payload.ids.includes(item.referencedItemId)
            )
            .reduce((r, i) => {
              r[i.referencedItemId] = i;
              return r;
            }, {})
        }
      };

    case ADD_DIAGRAM_ITEMS:
      return {
        ...state,
        [action.payload.diagramId]: {
          ...state[action.payload.diagramId],
          diagramItems: {
            ...state[action.payload.diagramId].diagramItems,
            ...action.payload.diagramItems.reduce((r, i) => {
              r[i.referencedItemId] = i;
              return r;
            }, {})
          }
        }
      };

    default:
      return state;
  }
}
