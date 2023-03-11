import { TYPE, addNotificationSimple } from "../../actions/notifications";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  initBrowserSettings,
  setActiveTask,
  setDiagramLoading
} from "../../actions/ui";
import { loadModel, updateModelProperty } from "../../actions/model";

import { UndoRedoDef } from "../history/undo_redo_transaction_defs";
import _ from "lodash";
import { throwInternalError } from "../../actions/internalError";
import { v4 as uuidv4 } from "uuid";

export class ModelLoader {
  constructor(historyContext, ipcContext, parameters) {
    this.historyContext = historyContext;
    this.ipcContext = ipcContext;
    this.parameters = parameters;
    this.transactionToken = uuidv4();
    this.showProgress = this.showProgress.bind(this);
  }

  load() {
    return async (dispatch) => {
      if (this.ipcContext.isElectron()) {
        await dispatch(this.openLoading());
        await dispatch(this.subscribeProgressEvent());
        await dispatch(this.subscribeModelLoadEvent());
        this.sendModelLoadEvent();
      }
    };
  }

  sendModelLoadEvent() {
    this.ipcContext.send(this.ipcContext.action.startEvent, {
      ...this.parameters,
      token: this.transactionToken
    });
  }

  subscribeModelLoadEvent() {
    return (dispatch) => {
      this.ipcContext.once(
        this.ipcContext.action.finishEvent,
        async (event, result) => {
          this.unsubscribeProgressEvent();

          if (result === undefined) {
            await dispatch(this.stopLoading());
          } else if (result.error === undefined) {
            if (this.parameters.autolayout === true) {
              await dispatch(this.executeAutolayout(result));
            } else {
              await dispatch(this.processResult(result, result.modelData));
            }
          } else {
            await dispatch(this.stopLoading());
            if (result.internal) {
              await dispatch(
                throwInternalError({
                  message: result.error,
                  stack: result.stack
                })
              );
            } else if (!result.cancel) {
              await dispatch(
                addNotificationSimple(
                  `Loading of the project failed. ${result.error}`,
                  TYPE.ERROR,
                  false,
                  null,
                  null,
                  false
                )
              );
            }
          }
        }
      );
    };
  }

  unsubscribeProgressEvent() {
    this.ipcContext.removeListener(
      this.ipcContext.ipcProgressEvent,
      this.showProgress
    );
  }

  generateMongoDBActiveTask(progressInfo) {
    const info = Object.keys(progressInfo.parts)
      .map((key) => progressInfo.parts[key])
      .reduce(
        (result, item) => ({
          taskDone: result.taskDone + (item.current === item.total ? 1 : 0),
          taskTotal: result.taskTotal + 1,
          itemsDone: result.itemsDone + item.current,
          totalItems: result.totalItems + item.total
        }),
        {
          taskDone: 0,
          taskTotal: 0,
          itemsDone: 0,
          totalItems: 0
        }
      );
    return {
      token: this.transactionToken,
      caption: `${this.ipcContext.action.caption} - collections ${info.taskDone}/${info.taskTotal} - documents ${info.itemsDone}/${info.totalItems}`,
      warning:
        progressInfo.missingReferences > 5
          ? [
              ` The schema contains ${progressInfo.missingReferences} ObjectId fields referencing unknown collections.`,
              `Change the connection settings and set the Reference option to First or None or`,
              `lower the data limit for better performance.`
            ]
          : undefined
    };
  }

  generateGenericActiveTask() {
    return {
      token: this.transactionToken,
      caption: this.ipcContext.action.caption
    };
  }

  generateActiveTask(progressInfo) {
    if (progressInfo.modelType === "MONGODB") {
      return this.generateMongoDBActiveTask(progressInfo);
    }
    return this.generateGenericActiveTask();
  }

  showProgress(event, progressInfo) {
    return (dispatch) => {
      if (this.parameters.cancelable === true) {
        const activeTask = this.generateActiveTask(progressInfo);
        dispatch(setActiveTask(activeTask));
      }
    };
  }

  subscribeProgressEvent() {
    return (dispatch) => {
      this.ipcContext.on(
        this.ipcContext.action.progressEvent,
        (event, progressInfo) => {
          dispatch(this.showProgress(event, progressInfo));
        }
      );
    };
  }

  openLoading() {
    return async (dispatch) => {
      if (this.parameters.cancelable === true) {
        await dispatch(
          setActiveTask({
            token: this.transactionToken,
            caption: this.ipcContext.action.caption
          })
        );
      }
      await dispatch(setDiagramLoading(true));
    };
  }

  executeAutolayout(result) {
    return async (dispatch) => {
      const autolayoutToken = uuidv4();
      if (this.parameters.cancelable === true) {
        await dispatch(
          setActiveTask({
            token: autolayoutToken,
            caption: "Computing layout..."
          })
        );
      }
      await dispatch(this.subscribeAutolayoutCompletedEvent(result));
      this.ipcContext.send("model:runAutolayout", {
        autoLayoutData: {
          model: JSON.stringify(result.modelData, null, "\t"),
          layoutType: "simple-grid",
          autosize: true,
          expandNested: true,
          diagramId: result.modelData.model.activeDiagram
        },
        token: autolayoutToken
      });
    };
  }

  subscribeAutolayoutCompletedEvent(result) {
    return async (dispatch, getState) => {
      this.ipcContext.once(
        "model:autolayoutCompleted",
        (event, autoLayoutResult) => {
          dispatch(
            this.processResult(
              result,
              autoLayoutResult.error ? result.modelData : autoLayoutResult
            )
          );
        }
      );
    };
  }

  stopLoading() {
    return async (dispatch) => {
      await dispatch(setActiveTask(null));
      await dispatch(setDiagramLoading(false));
    };
  }

  updateModelProperties(result, newModel) {
    return async (dispatch) => {
      await dispatch(
        updateModelProperty(newModel.id, result.filePath, "filePath")
      );
      await dispatch(
        updateModelProperty(newModel.id, result.lastSaveDay, "lastSaved")
      );
      await dispatch(
        updateModelProperty(
          newModel.id,
          result.isDirty === true ? true : false,
          "isDirty"
        )
      );
    };
  }

  getWarningDetails(warnings) {
    return _.reduce(
      warnings,
      (result, warning, index) => {
        if (+index === 0) {
          return `${warning.message}`;
        } else if (+index < 5) {
          return `${result}, ${warning.message}`;
        } else if (+index === 5) {
          return `${result}...`;
        } else {
          return result;
        }
      },
      ""
    );
  }

  getWarnings(newModel) {
    const warningsCount = _.size(newModel.warnings);
    if (warningsCount === 1) {
      return `The project was loaded, but 1 object was skipped. Details: ${this.getWarningDetails(
        newModel.warnings
      )}`;
    } else if (warningsCount > 1) {
      return `The project was loaded, but ${warningsCount} objects were skipped. Details: ${this.getWarningDetails(
        newModel.warnings
      )}`;
    } else {
      return "";
    }
  }

  hasWarnings(newModel) {
    return _.size(newModel.warnings) > 0;
  }

  processResult(result, newModel) {
    return async (dispatch) => {
      await dispatch(
        setActiveTask({ token: undefined, caption: "Loading project..." })
      );
      setTimeout(async () => {
        await dispatch(
          startTransaction(this.historyContext, UndoRedoDef.MODEL__LOADER)
        );
        try {
          await dispatch(loadModel(newModel, this.historyContext));
          await dispatch(this.updateModelProperties(result, newModel));
          await dispatch(initBrowserSettings(newModel.model.type));
          await dispatch(this.stopLoading());
          await dispatch(
            addNotificationSimple(
              this.hasWarnings(newModel)
                ? this.getWarnings(newModel)
                : `Project loaded.`,
              this.hasWarnings(newModel) ? TYPE.WARNING : TYPE.INFO,
              true
            )
          );
        } finally {
          await dispatch(finishTransaction(true));
        }
      }, 200);
    };
  }
}
