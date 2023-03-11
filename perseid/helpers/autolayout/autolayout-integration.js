import { TYPE, addNotificationSimple } from "../../actions/notifications";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction,
} from "../../actions/undoredo";
import { loadModelFromJson, updateModelProperty } from "../../actions/model";
import { setActiveTask, setDiagramLoading } from "../../actions/ui";

import { UndoRedoDef } from "../history/undo_redo_transaction_defs";
import { getHistoryContext } from "../history/history";
import { v4 as uuidv4 } from "uuid";

class AutolayoutIntegration {
  constructor(match, history, ipcContext, parameters) {
    this.match = match;
    this.history = history;
    this.ipcContext = ipcContext;
    this.parameters = parameters;
  }

  loadModel(result) {
    return async (dispatch) => {
      await new Promise((resolve) => {
        setTimeout(async () => {
          await dispatch(
            startTransaction(
              getHistoryContext(this.history, this.match),
              UndoRedoDef.AUTOLAYOUT_INTEGRATION
            )
          );
          try {
            await dispatch(
              loadModelFromJson(
                result,
                getCurrentHistoryTransaction().historyContext
              )
            );
            await dispatch(
              updateModelProperty(result.model.id, true, "isDirty")
            );
            await dispatch(setDiagramLoading(false));
            await dispatch(setActiveTask(null));
          } finally {
            await dispatch(finishTransaction());
          }
          resolve();
        }, 0);
      });
    };
  }

  execute() {
    return async (dispatch) => {
      const token = uuidv4();
      await dispatch(
        setActiveTask({ token, caption: this.ipcContext.action.caption })
      );
      await dispatch(setDiagramLoading(true));
      this.ipcContext.once(
        this.ipcContext.action.finishEvent,
        async (event, result) => {
          if (result.error) {
            await dispatch(setDiagramLoading(false));
            await dispatch(setActiveTask(null));
            await dispatch(
              addNotificationSimple(
                `Autolayout failed. ${result.error}`,
                TYPE.ERROR,
                false,
                null,
                null,
                false
              )
            );
          } else {
            await dispatch(
              setActiveTask({ token: undefined, caption: "Loading model..." })
            );
            await dispatch(this.loadModel(result));
            await dispatch(
              addNotificationSimple(
                `Autolayout finished.`,
                TYPE.INFO,
                true,
                null,
                null,
                false
              )
            );
          }
        }
      );
      this.ipcContext.send(this.ipcContext.action.startEvent, {
        autoLayoutData: {
          model: this.parameters.model,
          layoutType: this.parameters.layoutType,
          diagramId: this.parameters.diagramId,
          autosize: false,
          expandNested: false,
        },
        token,
      });
    };
  }
}

export default AutolayoutIntegration;

export function autolayoutExecute(autolayoutIntegration) {
  return async (dispatch) => {
    dispatch(autolayoutIntegration.execute());
  };
}
