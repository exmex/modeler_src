import {
  CLEAR_MODEL,
  CREATE_MODEL,
  FETCH_MODEL,
  IMPORT_MODEL,
  LOAD_MODEL,
  SHOW_DIAGRAM,
  UPDATE_MODEL_PROPERTY
} from "../actions/model";

const INITIAL_STATE = {
  zoom: 100,
  def_freezeTableName: true,
  def_timestamps: true,
  def_paranoid: true,
  def_type: "na",
  def_collation: "",
  def_charset: "",
  isDirty: false,
  background: "transparent",
  lineColor: "transparent",
  writeFileParam: true,
  sideSelections: true,
  customDataTypes: [],
  activeDiagram: null,
  schemaContainerIsDisplayed: false,
  embeddedInParentsIsDisplayed: true,
  cardinalityIsDisplayed: false,
  estimatedSizeIsDisplayed: false
};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case IMPORT_MODEL:
      return action.payload;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    case LOAD_MODEL:
      return action.payload;
    case UPDATE_MODEL_PROPERTY:
      return {
        ...state,
        [action.payload.pName]: action.payload.newValue
      };
    case CREATE_MODEL:
      return action.payload;
    case FETCH_MODEL:
      return action.payload;
    case SHOW_DIAGRAM:
      return { ...state, activeDiagram: action.payload };
    default:
      return state;
  }
}
