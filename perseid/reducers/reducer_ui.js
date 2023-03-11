import {
  CHANGE_BROWSER_DISCLOSURE,
  CHANGE_BROWSER_SETTINGS,
  CLEAR_CHANGE_SCROLL,
  CLEAR_UNSAVED_CHANGES_MODAL_ACTION,
  CLOSE_DROPDOWN_MENU,
  INIT_BROWSER_DISCLOSURE,
  INIT_BROWSER_SETTINGS,
  OPEN_DROPDOWN_MENU,
  SET_ACTIVE_TASK,
  SET_CHANGE_SCROLL,
  SET_COL_HEIGHT,
  SET_COPIED_FORMAT,
  SET_DIAGRAM_AREA_MODE,
  SET_DIAGRAM_LOADING,
  SET_DISPLAY_MODE,
  SET_FORCED_RENDER,
  SET_LEFT_ASIDE_WIDTH,
  SET_MOVEMENT,
  SET_RELATION_CLICKS,
  SET_REPORT_ERROR,
  SET_REPORT_IS_RENDERED,
  SET_RIGHT_ASIDE_WIDTH,
  SET_SEARCH_TERM,
  SET_UI_ZOOM,
  SET_UNSAVED_CHANGES_MODAL_ACTION,
  SET_ZOOM,
  SET_ZOOM_SCROLL,
  TOGGLE_ADD_DIAGRAMS_BY_CONTAINERS_MODAL,
  TOGGLE_ADD_TO_ANOTHER_DIAGRAM_MODAL,
  TOGGLE_ASIDE_LEFT,
  TOGGLE_ASIDE_RIGHT,
  TOGGLE_BROWSER_SETTINGS_MODAL,
  TOGGLE_BUY_PRO_MODAL,
  TOGGLE_COLUMN_MODAL,
  TOGGLE_CONFIRM_DELETE,
  TOGGLE_CONFIRM_DELETE_CONNECTION,
  TOGGLE_CONFIRM_DELETE_DIAGRAM,
  TOGGLE_CONFIRM_DELETE_LINE,
  TOGGLE_CONFIRM_DELETE_RELATION,
  TOGGLE_CONNECTION_MODAL,
  TOGGLE_DIAGRAM_ITEMS_MODAL,
  TOGGLE_DIAGRAM_MODAL,
  TOGGLE_EULA_MODAL,
  TOGGLE_FEEDBACK_MODAL,
  TOGGLE_FINDER,
  TOGGLE_IMPORT_FROM_URL_MODAL,
  TOGGLE_INDEX_ASSISTANT_MODAL,
  TOGGLE_LINE_MODAL,
  TOGGLE_MODEL_MODAL,
  TOGGLE_NEW_CONNECTION_MODAL,
  TOGGLE_NEW_MODEL_MODAL,
  TOGGLE_NOTE_MODAL,
  TOGGLE_OPEN_FROM_URL_MODAL,
  TOGGLE_ORDER_ITEMS_MODAL,
  TOGGLE_OTHER_OBJECT_MODAL,
  TOGGLE_PANEL_EXPANDED,
  TOGGLE_PROXY_MODAL,
  TOGGLE_RELATION_MODAL,
  TOGGLE_REPORT_MODAL,
  TOGGLE_RESTORE_MODEL_MODAL,
  TOGGLE_SQL_MODAL,
  TOGGLE_TABLE_MODAL,
  TOGGLE_TEXT_EDITOR_MODAL,
  TOGGLE_TIPS_MODAL,
  TOGGLE_TRIAL_MODAL,
  TOGGLE_UI_PROPERTY,
  TOGGLE_UNSAVED_CHANGES_MODAL,
  UPDATE_UI_PROPERTY
} from "../actions/ui";

import { DiagramAreaMode } from "../enums/enums";
import _ from "lodash";

const tableModalIsDisplayed = false;
const uiZoom = 1;
const reportIsRendered = false;

const buyProModalIsDisplayed = false;
const noteModalIsDisplayed = false;
const lineModalIsDisplayed = false;
const otherObjectModalIsDisplayed = false;
const trialModalIsDisplayed = true;
const eulaModalIsDisplayed = true;
const relationModalIsDisplayed = false;
const indexAssistantModalIsDisplayed = false;
const newModelModalIsDisplayed = false;
const reportModalIsDisplayed = false;
const openFromUrlModalIsDisplayed = false;
const importFromUrlModalIsDisplayed = false;
const modelModalIsDisplayed = false;
const tipsModalIsDisplayed = false;
const diagramModalIsDisplayed = false;
const diagramItemsModalIsDisplayed = false;
const orderItemsModalIsDisplayed = false;
const addDiagramsByContainersModalIsDisplayed = false;
const newConnectionModalIsDisplayed = false;
const connectionModalIsDisplayed = false;
const sqlModalIsDisplayed = false;
const feedbackModalIsDisplayed = false;
const proxyModalIsDisplayed = false;
const unsavedChangesModalIsDisplayed = false;
const restoreModelModalIsDisplayed = false;
const currentDiagramAreaMode = DiagramAreaMode.ARROW; // arrow, addTable, addRelation
const currentDisplayMode = "metadata"; // metadata, sampledata
const forcedRender = { id: Math.random(), options: {} };
const asideRightIsDisplayed = true;
const asideLeftIsDisplayed = true;
const searchTerm = "";
const diagramLoading = false;
const zoom = 1;
const confirmDeleteIsDisplayed = false;
const confirmDeleteRelationIsDisplayed = false;
const confirmDeleteLineIsDisplayed = false;
const confirmDeleteConnectionIsDisplayed = false;
const confirmDeleteDiagramIsDisplayed = false;
const specificationAssistantModalIsDisplayed = false;
const asideLeftWidth = 200;
const asideRightWidth = 300;
const relationClicks = 0;
const colHeight = 18;
const callbackFn = null;
const changeScroll = { x: 0, y: 0 };
const copiedFormat = { background: undefined, color: undefined };
const browserSettings = {};
const browserDisclosure = {};
const columnModalIsDisplayed = false;
const textEditorModalIsDisplayed = false;
const finderIsDisplayed = false;
const panelsExpanded = {
  pModel: true,
  pDiagram: true,
  pModelExtended: true,
  pModelGraphics: true,
  pTables: true,
  pRelations: true,
  pImplements: true,
  pTypes: true,
  pOtherObjectDetail: true,
  pOtherObjectCode: true,
  pViews: true,
  pNotes: true,
  PLines: true,
  pTableDetail: true,
  pTableExtended: false,
  pTableKeys: true,
  pTableIndexes: false,
  pTableColumns: true,
  pTableRelations: true,
  pTableColors: true,
  pTableSqlCreate: true,
  pTableSqlSelect: false,
  pTableSQLSelect: false,
  pRelationDetail: true,
  pRelationRi: true,
  pRelationReferenced: true,
  pRelationKey: true,
  pRelationCardinality: true,
  pRelationSqlCreate: true,
  pDomainConstraints: true,
  pRelationAssociation: true,
  pModelBeforeAfter: false,
  pTableCustomCode: false,
  pLineCustomCode: false,
  pRelationCustomCode: false,
  pOtherObjectCustomCode: false
};

//export default function(state = {}, action) {  // bez initial value ve store
export default function (
  state = {
    tableModalIsDisplayed,
    otherObjectModalIsDisplayed,
    noteModalIsDisplayed,
    relationModalIsDisplayed,
    indexAssistantModalIsDisplayed,
    newModelModalIsDisplayed,
    reportModalIsDisplayed,
    openFromUrlModalIsDisplayed,
    importFromUrlModalIsDisplayed,
    modelModalIsDisplayed,
    tipsModalIsDisplayed,
    newConnectionModalIsDisplayed,
    connectionModalIsDisplayed,
    sqlModalIsDisplayed,
    feedbackModalIsDisplayed,
    proxyModalIsDisplayed,
    lineModalIsDisplayed,
    unsavedChangesModalIsDisplayed,
    restoreModelModalIsDisplayed,
    currentDiagramAreaMode,
    currentDisplayMode,
    forcedRender,
    asideRightIsDisplayed,
    asideLeftIsDisplayed,
    searchTerm,
    diagramLoading,
    zoom,
    uiZoom,
    buyProModalIsDisplayed,
    confirmDeleteIsDisplayed,
    confirmDeleteRelationIsDisplayed,
    confirmDeleteLineIsDisplayed,
    asideLeftWidth,
    asideRightWidth,
    panelsExpanded,
    relationClicks,
    trialModalIsDisplayed,
    eulaModalIsDisplayed,
    colHeight,
    callbackFn,
    confirmDeleteConnectionIsDisplayed,
    confirmDeleteDiagramIsDisplayed,
    diagramModalIsDisplayed,
    diagramItemsModalIsDisplayed,
    orderItemsModalIsDisplayed,
    addDiagramsByContainersModalIsDisplayed,
    changeScroll,
    reportIsRendered,
    copiedFormat,
    browserSettings,
    browserDisclosure,
    columnModalIsDisplayed,
    specificationAssistantModalIsDisplayed,
    textEditorModalIsDisplayed
  },
  action = {}
) {
  switch (action.type) {
    case UPDATE_UI_PROPERTY:
      return {
        ...state,
        [action.payload.pName]: action.payload.newValue
      };

    case TOGGLE_UI_PROPERTY:
      return {
        ...state,
        [action.payload.pName]: !state[action.payload.pName]
      };

    case TOGGLE_PANEL_EXPANDED:
      return {
        ...state,
        panelsExpanded: {
          ...state.panelsExpanded,
          [action.payload.panelId]: action.payload.expandedBool
        }
      };

    case SET_COPIED_FORMAT:
      return { ...state, copiedFormat: action.payload };
    case SET_LEFT_ASIDE_WIDTH:
      return { ...state, asideLeftWidth: action.payload };
    case SET_RIGHT_ASIDE_WIDTH:
      return { ...state, asideRightWidth: action.payload };
    case SET_ZOOM:
      return { ...state, zoom: action.payload };
    case SET_ZOOM_SCROLL:
      return { ...state, ...action.payload };
    case SET_CHANGE_SCROLL:
      return { ...state, changeScroll: action.payload };
    case CLEAR_CHANGE_SCROLL:
      return _.omit(state, "changeScroll");
    case SET_UI_ZOOM:
      return { ...state, uiZoom: action.payload };
    case TOGGLE_CONFIRM_DELETE:
      return {
        ...state,
        confirmDeleteIsDisplayed: !state.confirmDeleteIsDisplayed
      };

    case TOGGLE_CONFIRM_DELETE_RELATION:
      return {
        ...state,
        confirmDeleteRelationIsDisplayed:
          !state.confirmDeleteRelationIsDisplayed
      };
    case TOGGLE_CONFIRM_DELETE_LINE:
      return {
        ...state,
        confirmDeleteLineIsDisplayed: !state.confirmDeleteLineIsDisplayed
      };
    case TOGGLE_CONFIRM_DELETE_CONNECTION:
      return {
        ...state,
        confirmDeleteConnectionIsDisplayed:
          !state.confirmDeleteConnectionIsDisplayed
      };

    case TOGGLE_CONFIRM_DELETE_DIAGRAM:
      return {
        ...state,
        confirmDeleteDiagramIsDisplayed: !state.confirmDeleteDiagramIsDisplayed
      };
    case TOGGLE_BUY_PRO_MODAL:
      return {
        ...state,
        buyProModalIsDisplayed: !state.buyProModalIsDisplayed
      };
    case TOGGLE_TRIAL_MODAL:
      return { ...state, trialModalIsDisplayed: !state.trialModalIsDisplayed };
    case TOGGLE_EULA_MODAL:
      return { ...state, eulaModalIsDisplayed: !state.eulaModalIsDisplayed };
    case TOGGLE_TABLE_MODAL:
      return { ...state, tableModalIsDisplayed: !state.tableModalIsDisplayed };

    case TOGGLE_NOTE_MODAL:
      return { ...state, noteModalIsDisplayed: !state.noteModalIsDisplayed };

    case TOGGLE_LINE_MODAL:
      return { ...state, lineModalIsDisplayed: !state.lineModalIsDisplayed };

    case TOGGLE_TEXT_EDITOR_MODAL:
      return {
        ...state,
        textEditorModalIsDisplayed: !state.textEditorModalIsDisplayed,
        textEdiorComponent: action.payload
      };

    case TOGGLE_FINDER:
      return { ...state, finderIsDisplayed: !state.finderIsDisplayed };

    case TOGGLE_OTHER_OBJECT_MODAL:
      return {
        ...state,
        otherObjectModalIsDisplayed: !state.otherObjectModalIsDisplayed
      };

    case TOGGLE_NEW_MODEL_MODAL:
      return {
        ...state,
        newModelModalIsDisplayed: !state.newModelModalIsDisplayed
      };
    case TOGGLE_REPORT_MODAL:
      return {
        ...state,
        reportModalIsDisplayed: !state.reportModalIsDisplayed
      };
    case TOGGLE_OPEN_FROM_URL_MODAL:
      return {
        ...state,
        openFromUrlModalIsDisplayed: !state.openFromUrlModalIsDisplayed
      };
    case TOGGLE_IMPORT_FROM_URL_MODAL:
      return {
        ...state,
        importFromUrlModalIsDisplayed: !state.importFromUrlModalIsDisplayed
      };
    case TOGGLE_MODEL_MODAL:
      return {
        ...state,
        modelModalIsDisplayed: !state.modelModalIsDisplayed
      };
    case TOGGLE_TIPS_MODAL:
      return {
        ...state,
        tipsModalIsDisplayed: !state.tipsModalIsDisplayed
      };
    case TOGGLE_NEW_CONNECTION_MODAL:
      return {
        ...state,
        newConnectionModalIsDisplayed: !state.newConnectionModalIsDisplayed
      };
    case TOGGLE_CONNECTION_MODAL:
      return {
        ...state,
        connectionModalIsDisplayed: !state.connectionModalIsDisplayed
      };
    case TOGGLE_UNSAVED_CHANGES_MODAL:
      return {
        ...state,
        unsavedChangesModalIsDisplayed: !state.unsavedChangesModalIsDisplayed
      };
    case TOGGLE_RESTORE_MODEL_MODAL:
      return {
        ...state,
        restoreModelModalIsDisplayed: !state.restoreModelModalIsDisplayed
      };
    case TOGGLE_BROWSER_SETTINGS_MODAL:
      return {
        ...state,
        browserSettingsModalIsDisplayed: !state.browserSettingsModalIsDisplayed
      };
    case TOGGLE_RELATION_MODAL:
      return {
        ...state,
        relationModalIsDisplayed: !state.relationModalIsDisplayed
      };
    case TOGGLE_INDEX_ASSISTANT_MODAL:
      return {
        ...state,
        indexAssistantModalIsDisplayed: !state.indexAssistantModalIsDisplayed
      };
    case TOGGLE_SQL_MODAL:
      return { ...state, sqlModalIsDisplayed: !state.sqlModalIsDisplayed };
    case TOGGLE_FEEDBACK_MODAL:
      return {
        ...state,
        feedbackModalIsDisplayed: !state.feedbackModalIsDisplayed
      };
    case TOGGLE_PROXY_MODAL:
      return {
        ...state,
        proxyModalIsDisplayed: !state.proxyModalIsDisplayed
      };

    case OPEN_DROPDOWN_MENU:
      return {
        ...state,
        dropDownMenu: action.payload
      };

    case CLOSE_DROPDOWN_MENU:
      return {
        ...state,
        dropDownMenu: undefined
      };

    case TOGGLE_DIAGRAM_MODAL:
      return {
        ...state,
        diagramModalIsDisplayed: !state.diagramModalIsDisplayed
      };

    case TOGGLE_DIAGRAM_ITEMS_MODAL:
      return {
        ...state,
        diagramItemsModalIsDisplayed: !state.diagramItemsModalIsDisplayed
      };

    case TOGGLE_ORDER_ITEMS_MODAL:
      return {
        ...state,
        orderItemsModalIsDisplayed: !state.orderItemsModalIsDisplayed
      };

    case TOGGLE_ADD_DIAGRAMS_BY_CONTAINERS_MODAL:
      return {
        ...state,
        addDiagramsByContainersModalIsDisplayed:
          !state.addDiagramsByContainersModalIsDisplayed
      };

    case TOGGLE_ADD_TO_ANOTHER_DIAGRAM_MODAL:
      return {
        ...state,
        addToAnotherDiagramModalIsDisplayed:
          !state.addToAnotherDiagramModalIsDisplayed
      };

    case TOGGLE_COLUMN_MODAL:
      return {
        ...state,
        columnModalIsDisplayed: !state.columnModalIsDisplayed
      };

    case SET_DIAGRAM_AREA_MODE:
      return { ...state, currentDiagramAreaMode: action.payload };
    case SET_DISPLAY_MODE:
      return { ...state, currentDisplayMode: action.payload };

    case SET_FORCED_RENDER:
      return {
        ...state,
        forcedRender: { id: Math.random(), options: action.payload }
      };
    case TOGGLE_ASIDE_RIGHT:
      return { ...state, asideRightIsDisplayed: !state.asideRightIsDisplayed };
    case TOGGLE_ASIDE_LEFT:
      return { ...state, asideLeftIsDisplayed: !state.asideLeftIsDisplayed };
    case SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case SET_MOVEMENT:
      return { ...state, movement: action.payload };
    case SET_DIAGRAM_LOADING:
      return { ...state, diagramLoading: action.payload };
    case SET_ACTIVE_TASK:
      return { ...state, activeTask: action.payload };
    case SET_RELATION_CLICKS:
      return { ...state, relationClicks: action.payload };
    case SET_COL_HEIGHT:
      return { ...state, colHeight: action.payload };
    case CLEAR_UNSAVED_CHANGES_MODAL_ACTION:
      return { ...state, unsavedChangesModalAction: undefined };
    case SET_UNSAVED_CHANGES_MODAL_ACTION:
      return {
        ...state,
        unsavedChangesModalAction: action.payload
      };
    case SET_REPORT_ERROR:
      return { ...state, reportError: action.payload };
    case SET_REPORT_IS_RENDERED: {
      return { ...state, reportIsRendered: action.payload };
    }
    case INIT_BROWSER_SETTINGS: {
      return { ...state, browserSettings: action.payload };
    }
    case INIT_BROWSER_DISCLOSURE: {
      return { ...state, browserDisclosure: action.payload };
    }
    case CHANGE_BROWSER_SETTINGS: {
      return {
        ...state,
        browserSettings: {
          ...state.browserSettings,
          [action.payload.modelProperty]: {
            ...state.browserSettings[action.payload.modelProperty],
            [action.payload.property]: action.payload.value
          }
        }
      };
    }
    case CHANGE_BROWSER_DISCLOSURE: {
      return {
        ...state,
        browserDisclosure: {
          ...state.browserDisclosure,
          [action.payload.property]: action.payload.value
        }
      };
    }
    default:
      return state;
  }
}
