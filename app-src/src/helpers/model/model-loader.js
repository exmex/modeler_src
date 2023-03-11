import { DEV_DEBUG, isDebug } from "../../web_env";
import { TYPE, addNotificationSimple } from "../../actions/notifications";
import {
  checkBreakableChanges,
  loadModel,
  updateModelProperty
} from "../../actions/model";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../actions/undoredo";
import { getProductByPlatform, isSupportedModelType } from "../../app_config";
import {
  initBrowserSettings,
  setActiveTask,
  setBackupModelDialog,
  setDiagramLoading,
  toggleBackupModelModal,
  toggleReverseStatsModal
} from "../../actions/ui";

import { DeltaCalculator } from "../history/delta_calculator";
import { UndoRedoDef } from "../history/undo_redo_transaction_defs";
import _ from "lodash";
import { filterModelSettings } from "../settings_helper";
import { getAppTitle } from "common";
import { getReportDiff } from "../../actions/diff_html_report";
import { importReverseStats } from "../../actions/reverseStats";
import { navigateToDiagramUrl } from "../../components/url_navigation";
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

  getCompatibleProductText(id) {
    const product = getProductByPlatform(id);
    return product ? ` Open the file in the ${getAppTitle(product)}` : ``;
  }

  subscribeModelLoadEvent() {
    return (dispatch, getState) => {
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
              const isModelSupported = isSupportedModelType(
                result.modelData.model.type
              );
              if (!isModelSupported) {
                const compatibleProductText = this.getCompatibleProductText(
                  result.modelData.model.type
                );
                await dispatch(this.stopLoading());
                await dispatch(
                  addNotificationSimple(
                    `Loading of the project failed. Model type is not supported.${compatibleProductText}`,
                    TYPE.ERROR,
                    false,
                    null,
                    null,
                    false
                  )
                );
                this.ipcContext.ipcRenderer.send("modelSettings:save", {});
                return;
              } else {
                await dispatch(
                  this.processResult(result, result.modelData, this.parameters)
                );
              }
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
              this.ipcContext.ipcRenderer.send("modelSettings:save", {});
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
              this.ipcContext.ipcRenderer.send("modelSettings:save", {});
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

      const diagramId =
        _.find(result.modelData.diagrams, (diagram) => diagram.main)?.id ??
        result.modelData.model.activeDiagram;

      this.ipcContext.send("model:runAutolayout", {
        autoLayoutData: {
          model: JSON.stringify(result.modelData, null, "\t"),
          modelType: result.modelData.model.type,
          layoutType: "simple-grid",
          autosize: true,
          expandNested: true,
          diagramId
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
              autoLayoutResult.error ? result.modelData : autoLayoutResult,
              this.parameters
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

  processResult(result, newModel, parameters) {
    return async (dispatch, getState) => {
      await dispatch(
        setActiveTask({ token: undefined, caption: "Loading project..." })
      );
      setTimeout(async () => {
        const shouldClearModel = !parameters.modelToUpdate;
        await dispatch(
          startTransaction(this.historyContext, UndoRedoDef.MODEL__LOADER)
        );
        try {
          await dispatch(
            loadModel(newModel, this.historyContext, shouldClearModel)
          );
          navigateToDiagramUrl(
            this.historyContext.state.url,
            this.historyContext.history,
            newModel.model.id,
            newModel.model.activeDiagram
          );
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
          getCurrentHistoryTransaction().addResizeRequest({
            domToModel: true,
            operation: "model loader"
          });
          this.ipcContext.ipcRenderer.send(
            "modelSettings:save",
            filterModelSettings(newModel.model)
          );

          const reverseStats = !!newModel
            ? this.updateReverseStats(
                newModel,
                newModel.originalModel,
                parameters
              )
            : undefined;

          await dispatch(importReverseStats(reverseStats ?? {}));
          if (!_.isEmpty(reverseStats) && !!newModel.originalModel) {
            await dispatch(toggleReverseStatsModal());
          }
        } finally {
          await dispatch(finishTransaction(shouldClearModel));
        }
      }, 200);
    };
  }

  updateReverseStats(newModel, originalModel, parameters) {
    // console.log({ newModel, originalModel, parameters });
    this.logModelDifference(newModel, originalModel);
    return !!originalModel && !!newModel
      ? getReportDiff(newModel, originalModel)
      : undefined;
  }

  logModelDifference(newModel, originalModel) {
    if (isDebug([DEV_DEBUG])) {
      const updatedModel = newModel;
      const modelUpdateDiff = originalModel
        ? new DeltaCalculator(originalModel, updatedModel).calculate()
        : undefined;
      console.log({
        modelUpdateDiff,
        originalModel,
        updatedModel
      });
    }
  }
}
