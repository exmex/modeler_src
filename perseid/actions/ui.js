import { DiagramAreaMode, getPlatformProperty } from "../enums/enums";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "./undoredo";
import { openFromUrl, openModel, reopenModel } from "./model";

import { SET_DIAGRAM_ZOOM } from "./diagrams";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { getHistoryContext } from "../helpers/history/history";
import { updateNoteProperty } from "./notes";
import { updateOtherObjectProperty } from "./other_objects";
import { updateTableProperty } from "./tables";
import { zoomFit } from "../helpers/zoom/zoom-visible";

export const ACTION_PROVIDE_MODEL_CALL = "action:provideModelCall";
export const ACTION_REOPEN_MODEL = "action:reopenModel";
export const ACTION_OPEN_FROM_URL = "action:openFromUrl";

export const ACTION_APPQUIT = "action:appquit";
export const ACTION_TOGGLE_NEW_MODEL_MODAL = "action:toggleNewModelModal";
export const ACTION_TOGGLE_OPEN_FROM_URL_MODAL =
  "action:toggleOpenFromURLModel";
export const ACTION_TOGGLE_IMPORT_FROM_URL_MODAL =
  "action:toggleImportFromURLModel";

export const TOGGLE_TABLE_MODAL = "toggle_table_modal";
export const TOGGLE_ADD_TO_ANOTHER_DIAGRAM_MODAL =
  "toggle_add_to_another_diagram_modal";
export const TOGGLE_BUY_PRO_MODAL = "toggle_buy_pro_modal";
export const TOGGLE_RELATION_MODAL = "toggle_relation_modal";
export const TOGGLE_INDEX_ASSISTANT_MODAL = "toggle_index_assistant_modal";
export const TOGGLE_LINE_MODAL = "toggle_line_modal";
export const TOGGLE_NOTE_MODAL = "toggle_note_modal";
export const TOGGLE_OTHER_OBJECT_MODAL = "toggle_other_object_modal";
export const TOGGLE_MODEL_MODAL = "toggle_model_modal";
export const TOGGLE_TIPS_MODAL = "toggle_tips_modal";
export const TOGGLE_DIAGRAM_MODAL = "toggle_diagram_modal";
export const TOGGLE_DIAGRAM_ITEMS_MODAL = "toggle_diagram_items_modal";
export const TOGGLE_ORDER_ITEMS_MODAL = "toggle_order_items_modal";
export const TOGGLE_ADD_DIAGRAMS_BY_CONTAINERS_MODAL =
  "toggle_add_diagrams_by_containers_modal";
export const TOGGLE_NEW_MODEL_MODAL = "toggle_new_model_modal";
export const TOGGLE_REPORT_MODAL = "toggle_report_modal";
export const TOGGLE_OPEN_FROM_URL_MODAL = "toggle_open_from_url_modal";
export const TOGGLE_IMPORT_FROM_URL_MODAL = "toggle_import_from_url_modal";
export const TOGGLE_NEW_CONNECTION_MODAL = "toggle_new_connection_modal";
export const TOGGLE_CONNECTION_MODAL = "toggle_connection_modal";
export const TOGGLE_SQL_MODAL = "toggle_sql_modal";
export const TOGGLE_FEEDBACK_MODAL = "toggle_feedback_modal";
export const TOGGLE_PROXY_MODAL = "toggle_proxy_modal";
export const TOGGLE_TRIAL_MODAL = "toggle_trial_modal";
export const TOGGLE_EULA_MODAL = "toggle_eula_modal";
export const TOGGLE_UNSAVED_CHANGES_MODAL = "toggle_unsaved_changes_modal";
export const TOGGLE_RESTORE_MODEL_MODAL = "toggle_restore_model_modal";
export const TOGGLE_BROWSER_SETTINGS_MODAL = "toggle_browser_settings_modal";
export const TOGGLE_COLUMN_MODAL = "toggle_column_modal";
export const SET_DIAGRAM_AREA_MODE = "set_diagram_area_mode";
export const SET_DISPLAY_MODE = "set_display_mode";

export const TOGGLE_ASIDE_RIGHT = "toggle_aside_right";
export const TOGGLE_ASIDE_LEFT = "toggle_aside_left";
export const SET_SEARCH_TERM = "set_search_term";
export const SET_DIAGRAM_LOADING = "set_diagram_loading";
export const SET_ACTIVE_TASK = "set_active_task";
export const SET_ZOOM = "set_zoom";
export const SET_ZOOM_SCROLL = "set_zoom_scroll";
export const SET_CHANGE_SCROLL = "set_change_scroll";
export const CLEAR_CHANGE_SCROLL = "clear_change_scroll";
export const SET_COPIED_FORMAT = "set_copied_format";
export const SET_UI_ZOOM = "set_ui_zoom";
export const TOGGLE_CONFIRM_DELETE = "toggle_confirm_delete";
export const TOGGLE_CONFIRM_DELETE_RELATION = "toggle_confirm_delete_relation";
export const TOGGLE_CONFIRM_DELETE_LINE = "toggle_confirm_delete_line";
export const TOGGLE_CONFIRM_DELETE_DIAGRAM = "toggle_confirm_delete_diagram";
export const TOGGLE_CONFIRM_DELETE_CONNECTION =
  "toggle_confirm_delete_connection";
export const SET_LEFT_ASIDE_WIDTH = "set_left_aside_width";
export const SET_RIGHT_ASIDE_WIDTH = "set_right_aside_width";
export const TOGGLE_PANEL_EXPANDED = "toggle_panel_expanded";
export const SET_MOVEMENT = "set_movement";
export const SET_RELATION_CLICKS = "set_relation_clicks";
export const SET_COL_HEIGHT = "set_col_height";
export const SET_UNSAVED_CHANGES_MODAL_ACTION =
  "set_unsaved_changes_modal_action";
export const CLEAR_UNSAVED_CHANGES_MODAL_ACTION =
  "clear_unsaved_changes_modal_action";
export const UPDATE_UI_PROPERTY = "update_ui_property";
export const TOGGLE_UI_PROPERTY = "toggle_ui_property";
export const SET_REPORT_ERROR = "set_report_error";
export const SET_REPORT_IS_RENDERED = "set_report_is_rendered";

export const OPEN_DROPDOWN_MENU = "open_dropdown_menu";
export const CLOSE_DROPDOWN_MENU = "close_dropdown_menu";

export const SET_FORCED_RENDER = "set_forced_render";

export const INIT_BROWSER_SETTINGS = "init_browser_settings";
export const CHANGE_BROWSER_SETTINGS = "change_browser_settings";
export const INIT_BROWSER_DISCLOSURE = "init_browser_disclosure";
export const CHANGE_BROWSER_DISCLOSURE = "change_browser_disclosure";
export const TOGGLE_TEXT_EDITOR_MODAL = "toggle_text_editor_modal";
export const TOGGLE_FINDER = "toggle_finder";

export const DROPDOWN_MENU = {
  DIAGRAM_ITEM: "diagram_item",
  PROJECT: "project",
  RELATION: "relation",
  LINE: "line",
  DIAGRAM: "diagram",
  COLUMN: "column"
};

export const DROPDOWN_MENU_SOURCE = {
  LIST: "list",
  DIAGRAM: "diagram"
};

export function setReportIsRendered(reportIsRendered) {
  return (dispatch, getState) => {
    UIHelpers.syncDiagramAndSVGDimensions(getState().zoom, reportIsRendered);

    dispatch({
      type: SET_REPORT_IS_RENDERED,
      payload: reportIsRendered
    });
  };
}

export function updateUiProperty(newValue, pName) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_UI_PROPERTY,
      payload: { newValue, pName }
    });
  };
}

export function toggleUiProperty(pName) {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_UI_PROPERTY,
      payload: { pName }
    });
  };
}

export function setColHeight(height) {
  return {
    type: SET_COL_HEIGHT,
    payload: height
  };
}

export function setLeftAsideWidth(width) {
  return {
    type: SET_LEFT_ASIDE_WIDTH,
    payload: width
  };
}

export function setMovement(movementObject) {
  return {
    type: SET_MOVEMENT,
    payload: movementObject
  };
}

export function setRelationClicks(clicks) {
  return {
    type: SET_RELATION_CLICKS,
    payload: clicks
  };
}

export function setRightAsideWidth(width) {
  return {
    type: SET_RIGHT_ASIDE_WIDTH,
    payload: width
  };
}

export function togglePanelExpanded(panelId, expandedBool) {
  return {
    type: TOGGLE_PANEL_EXPANDED,
    payload: { panelId, expandedBool }
  };
}

export function toggleConfirmDelete() {
  return {
    type: TOGGLE_CONFIRM_DELETE
  };
}
export function toggleConfirmDeleteRelation() {
  return {
    type: TOGGLE_CONFIRM_DELETE_RELATION
  };
}

export function toggleConfirmDeleteLine() {
  return {
    type: TOGGLE_CONFIRM_DELETE_LINE
  };
}

export function toggleConfirmDeleteConnection() {
  return {
    type: TOGGLE_CONFIRM_DELETE_CONNECTION
  };
}

export function toggleUnsavedChangesModal() {
  return {
    type: TOGGLE_UNSAVED_CHANGES_MODAL
  };
}

export function toggleRestoreModelModal() {
  return {
    type: TOGGLE_RESTORE_MODEL_MODAL
  };
}

export function toggleBrowserSettingsModal() {
  return {
    type: TOGGLE_BROWSER_SETTINGS_MODAL
  };
}

export function toggleTableModal() {
  return {
    type: TOGGLE_TABLE_MODAL
  };
}

export function toggleDiagramModal() {
  return {
    type: TOGGLE_DIAGRAM_MODAL
  };
}

export function toggleTextEditorModal(component) {
  return {
    type: TOGGLE_TEXT_EDITOR_MODAL,
    payload: component
  };
}

export function toggleFinder() {
  return {
    type: TOGGLE_FINDER
  };
}

export function toggleDiagramItemsModal() {
  return {
    type: TOGGLE_DIAGRAM_ITEMS_MODAL
  };
}

export function toggleOrderItemsModal() {
  return {
    type: TOGGLE_ORDER_ITEMS_MODAL
  };
}

export function toggleAddDiagramsByContainersModal() {
  return {
    type: TOGGLE_ADD_DIAGRAMS_BY_CONTAINERS_MODAL
  };
}

export function toggleAddToAnotherDiagramModal() {
  return {
    type: TOGGLE_ADD_TO_ANOTHER_DIAGRAM_MODAL
  };
}

export function toggleBuyProModal() {
  return {
    type: TOGGLE_BUY_PRO_MODAL
  };
}

export function toggleTrialModal() {
  return {
    type: TOGGLE_TRIAL_MODAL
  };
}

export function toggleEulaModal() {
  return {
    type: TOGGLE_EULA_MODAL
  };
}

export function toggleNewModelModal() {
  return {
    type: TOGGLE_NEW_MODEL_MODAL
  };
}

export function toggleReportModal() {
  return {
    type: TOGGLE_REPORT_MODAL
  };
}

export function toggleOpenFromUrlModal() {
  return {
    type: TOGGLE_OPEN_FROM_URL_MODAL
  };
}

export function toggleImportFromUrlModal() {
  return {
    type: TOGGLE_IMPORT_FROM_URL_MODAL
  };
}

export function toggleModelModal() {
  return {
    type: TOGGLE_MODEL_MODAL
  };
}

export function toggleTipsModal() {
  return {
    type: TOGGLE_TIPS_MODAL
  };
}

export function toggleNewConnectionModal() {
  return {
    type: TOGGLE_NEW_CONNECTION_MODAL
  };
}

export function toggleConnectionModal() {
  return {
    type: TOGGLE_CONNECTION_MODAL
  };
}

export function toggleRelationModal() {
  return {
    type: TOGGLE_RELATION_MODAL
  };
}

export function toggleIndexAssistantModal() {
  return {
    type: TOGGLE_INDEX_ASSISTANT_MODAL
  };
}

export function toggleNoteModal() {
  return {
    type: TOGGLE_NOTE_MODAL
  };
}

export function toggleLineModal() {
  return {
    type: TOGGLE_LINE_MODAL
  };
}

export function toggleOtherObjectModal() {
  return {
    type: TOGGLE_OTHER_OBJECT_MODAL
  };
}

export function toggleSqlModal() {
  return {
    type: TOGGLE_SQL_MODAL
  };
}

export function toggleFeedbackModal() {
  return {
    type: TOGGLE_FEEDBACK_MODAL
  };
}

export function toggleProxyModal() {
  return {
    type: TOGGLE_PROXY_MODAL
  };
}

export function toggleConfirmDeleteDiagram() {
  return {
    type: TOGGLE_CONFIRM_DELETE_DIAGRAM
  };
}

export function toggleColumnModal() {
  return {
    type: TOGGLE_COLUMN_MODAL
  };
}

export function setDiagramAreaMode(mode) {
  return async (dispatch) => {
    if (
      mode !== DiagramAreaMode.ADD_RELATION ||
      mode !== DiagramAreaMode.ADD_RELATION_BELONGS ||
      mode !== DiagramAreaMode.ADD_IMPLEMENTS
    ) {
      await dispatch(setRelationClicks(0));
    }
    await dispatch({
      type: SET_DIAGRAM_AREA_MODE,
      payload: mode
    });
    await dispatch(setForcedRender({}));
  };
}

export function setDisplayMode(mode) {
  return async (dispatch) => {
    await dispatch({
      type: SET_DISPLAY_MODE,
      payload: mode
    });
    await dispatch(
      setForcedRender({
        domToModel: true,
        operation: "setDisplayMode"
      })
    );
  };
}

export function setForcedRender(options) {
  return {
    type: SET_FORCED_RENDER,
    payload: options
  };
}

export function initBrowserSettings(modelType) {
  return async (dispatch, getState) => {
    const state = getState();
    const modelProperty = getPlatformProperty(modelType);
    const defaultBrowserSettings =
      state.ui.browserSettings?.[modelProperty] || {};
    await dispatch({
      type: INIT_BROWSER_SETTINGS,
      payload: defaultBrowserSettings
    });
    await dispatch({
      type: INIT_BROWSER_DISCLOSURE,
      payload: defaultBrowserSettings
    });
  };
}

export function changeBrowserSettings(type, property, value) {
  return async (dispatch) => {
    const modelProperty = getPlatformProperty(type);
    await dispatch({
      type: CHANGE_BROWSER_SETTINGS,
      payload: { modelProperty, value, property }
    });
    await dispatch(setForcedRender({ domToModel: false }));
  };
}

export function changeBrowserDisclosure(property, value) {
  return async (dispatch) => {
    await dispatch({
      type: CHANGE_BROWSER_DISCLOSURE,
      payload: { value, property }
    });
  };
}

export function toggleAsideRight() {
  return {
    type: TOGGLE_ASIDE_RIGHT
  };
}

export function toggleAsideLeft() {
  return async (dispatch) => {
    await dispatch({
      type: TOGGLE_ASIDE_LEFT
    });
    await dispatch(setForcedRender({ domToModel: false }));
  };
}

export function setSearchTerm(term) {
  return {
    type: SET_SEARCH_TERM,
    payload: term
  };
}

export function setDiagramLoading(bool) {
  return {
    type: SET_DIAGRAM_LOADING,
    payload: bool
  };
}

export function setActiveTask(activeTask) {
  return {
    type: SET_ACTIVE_TASK,
    payload: activeTask
  };
}

export function setZoom(cssScale, store) {
  return async (dispatch, getState) => {
    if (store) {
      await dispatch({
        type: SET_DIAGRAM_ZOOM,
        payload: {
          id: getState().model.activeDiagram,
          zoom: _.round(cssScale, 1)
        }
      });
    }
    await dispatch({
      type: SET_ZOOM,
      payload: _.round(cssScale, 1)
    });
    await dispatch(setForcedRender({ domToModel: false }));
  };
}

export function findLinkInDiagramAndScrollToPosition(parent, child) {
  return (dispatch, getState) => {
    dispatch(
      zoomFit({
        maxZoom: getState().ui.zoom,
        items: getLinkEndpoints(parent, child)
      })
    );
  };

  function getLinkEndpoints(parentEndpoint, childEndpoint) {
    return {
      items: {
        [parentEndpoint.referencedItemId]: parentEndpoint,
        [childEndpoint.referencedItemId]: childEndpoint
      }
    };
  }
}

export function setZoomScroll({ zoom, changeScroll }) {
  return {
    type: SET_ZOOM_SCROLL,
    payload: { zoom, changeScroll }
  };
}

export function setChangeScroll(scroll) {
  return {
    type: SET_CHANGE_SCROLL,
    payload: scroll
  };
}

export function clearChangeScroll() {
  return {
    type: CLEAR_CHANGE_SCROLL
  };
}

export function setCopiedFormat(format) {
  return {
    type: SET_COPIED_FORMAT,
    payload: format
  };
}

export function setUiZoom(uizoom) {
  return {
    type: SET_UI_ZOOM,
    payload: uizoom
  };
}

export function setUnsavedChangesModalAction(postponedAction) {
  return {
    type: SET_UNSAVED_CHANGES_MODAL_ACTION,
    payload: postponedAction
  };
}

export function clearUnsavedChangesModalAction() {
  return {
    type: CLEAR_UNSAVED_CHANGES_MODAL_ACTION
  };
}

export function callback(callbackFn) {
  return async (dispatch) => {
    await dispatch(callbackFn);
  };
}

export function cancel(parameters, ipcRenderer) {
  return async (dispatch) => {
    await dispatch(setActiveTask(null));
    await dispatch(setDiagramLoading(false));
    ipcRenderer && ipcRenderer.send("task:cancel", parameters);
  };
}

export function setReportError(reportError) {
  return {
    type: SET_REPORT_ERROR,
    payload: reportError
  };
}

export function openDropDownMenu(type, source, position) {
  return {
    type: OPEN_DROPDOWN_MENU,
    payload: { type, source, position }
  };
}

export function closeDropDownMenu() {
  return {
    type: CLOSE_DROPDOWN_MENU
  };
}

export function executeUnsavedChangesModalAction(
  postponedAction,
  ipcContext,
  historyContext
) {
  return async (dispatch) => {
    switch (postponedAction.name) {
      case ACTION_PROVIDE_MODEL_CALL:
      case ACTION_OPEN_FROM_URL: {
        await dispatch(
          startTransaction(
            historyContext,
            UndoRedoDef.UI__EXECUTE_UNSAVED_CHANGES_MODAL_ACTION_OPEN_MODEL
          )
        );
        try {
          await dispatch(
            openModel(historyContext, ipcContext, postponedAction.parameters)
          );
        } finally {
          await dispatch(finishTransaction());
        }

        return;
      }
      case ACTION_REOPEN_MODEL: {
        await dispatch(
          reopenModel(historyContext, ipcContext, postponedAction.parameters)
        );

        return;
      }

      case ACTION_OPEN_FROM_URL: {
        await dispatch(
          startTransaction(
            historyContext,
            UndoRedoDef.UI__EXECUTE_UNSAVED_CHANGES_MODAL_OPEN_FROM_URL
          )
        );
        try {
          await dispatch(
            openFromUrl(
              historyContext,
              ipcContext,
              postponedAction.parameters,
              () => {
                // testing purpose
              }
            )
          );
        } finally {
          await dispatch(finishTransaction());
        }
        return;
      }

      case ACTION_APPQUIT: {
        ipcContext.send("app:quit", "just quit");
        return;
      }

      case ACTION_TOGGLE_OPEN_FROM_URL_MODAL: {
        await dispatch(toggleOpenFromUrlModal());
        return;
      }

      case ACTION_TOGGLE_IMPORT_FROM_URL_MODAL: {
        await dispatch(toggleImportFromUrlModal());
        return;
      }

      case ACTION_TOGGLE_NEW_MODEL_MODAL: {
        await dispatch(toggleNewModelModal());
        return;
      }

      default:
        return;
    }
  };
}

export function onToggleVisibilityClick(history, match) {
  return async (dispatch, getState) => {
    const state = getState();
    const modified = [];
    if (_.size(state.selections) > 1) {
      await dispatch(
        startTransaction(
          getHistoryContext(history, match),
          UndoRedoDef.UI__TOGGLE_OBJECTS_VISIBLE
        )
      );
      await Promise.all(
        _.map(state.selections, async (s) => {
          if (s.objectType === "table") {
            modified.push(s.objectId);
            await dispatch(
              updateTableProperty(
                s.objectId,
                !state.tables[s.objectId].visible,
                "visible"
              )
            );
          }
          if (s.objectType === "note") {
            modified.push(s.objectId);
            await dispatch(
              updateNoteProperty(
                s.objectId,
                !state.notes[s.objectId].visible,
                "visible"
              )
            );
          }
          if (s.objectType === "other_object") {
            modified.push(s.objectId);
            await dispatch(
              updateOtherObjectProperty(
                s.objectId,
                !state.otherObjects[s.objectId].visible,
                "visible"
              )
            );
          }
        })
      );
    } else {
      await dispatch(
        startTransaction(
          getHistoryContext(history, match),
          UndoRedoDef.UI__TOGGLE_SINGLE_OBJECT_VISIBLE
        )
      );
      if (match.params.id) {
        modified.push(match.params.id);
        await dispatch(
          updateTableProperty(
            match.params.id,
            !state.tables[match.params.id].visible,
            "visible"
          )
        );
      }
      if (match.params.nid) {
        modified.push(match.params.nid);
        await dispatch(
          updateNoteProperty(
            match.params.nid,
            !state.notes[match.params.nid].visible,
            "visible"
          )
        );
      }
      if (match.params.oid) {
        modified.push(match.params.oid);
        await dispatch(
          updateOtherObjectProperty(
            match.params.oid,
            !state.otherObjects[match.params.oid].visible,
            "visible"
          )
        );
      }
    }

    if (modified.length > 0) {
      getCurrentHistoryTransaction().addResizeRequest({
        operation: "onToggleVisibilityClick",
        domToModel: true,
        objects: modified
      });
    }
    await dispatch(finishTransaction());
  };
}
