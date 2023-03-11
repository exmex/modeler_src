import ActiveConnection from "./reducer_active_connection";
import CatalogColumns from "./reducer_catalog_columns";
import CollapsedTreeItems from "./reducer_collapsed_tree_items";
import Connections from "./reducer_connections";
import Diagrams from "./reducer_diagrams";
import InternalError from "./reducer_internal_error";
import LinesReducer from "./reducer_lines";
import Localization from "./reducer_localization";
import ModelReducer from "./reducer_model";
import ModelsList from "./reducer_models_list";
import ModelsSamples from "./reducer_models_samples";
import Notes from "./reducer_notes";
import NotificationReducer from "./reducer_notifications";
import ObjectsCopyList from "./reducer_objects_copies";
import Order from "./reducer_order";
import OtherObjects from "./reducer_other_objects";
import Profile from "./reducer_profile";
import RelationsReducer from "./reducer_relations";
import RestoreReducer from "./reducer_restore";
import ReverseStats from "./reducer_reverse_stats";
import SelectionsReducer from "./reducer_selections";
import Settings from "./reducer_settings";
import TablesReducer from "./reducer_tables";
import UiReducer from "./reducer_ui";
import UndoRedo from "./reducer_undoredo";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  tables: TablesReducer,
  relations: RelationsReducer,
  lines: LinesReducer,
  ui: UiReducer,
  model: ModelReducer,
  selections: SelectionsReducer,
  undoRedo: UndoRedo,
  objectsCopyList: ObjectsCopyList,
  modelsList: ModelsList,
  notes: Notes,
  otherObjects: OtherObjects,
  localization: Localization,
  settings: Settings,
  profile: Profile,
  notifications: NotificationReducer,
  modelsSamples: ModelsSamples,
  diagrams: Diagrams,
  connections: Connections,
  activeConnection: ActiveConnection,
  internalError: InternalError,
  order: Order,
  catalogColumns: CatalogColumns,
  collapsedTreeItems: CollapsedTreeItems,
  reverseStats: ReverseStats,
  restore: RestoreReducer
});

export default rootReducer;
