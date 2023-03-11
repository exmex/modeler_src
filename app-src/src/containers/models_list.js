import {
  ACTION_REOPEN_MODEL,
  setUnsavedChangesModalAction,
  toggleNewModelModal,
  toggleUnsavedChangesModal
} from "../actions/ui";
import { Features, isFeatureAvailable } from "../helpers/features/features";
import { IPCContext, createReopenAction } from "../helpers/ipc/ipc";
import React, { Component } from "react";
import {
  fetchModel,
  loadModel,
  reopenModel,
  updateModelProperty
} from "../actions/model";

import Helpers from "../helpers/helpers";
import { ModelTypesForHumans } from "../enums/enums";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchModelsList } from "../actions/models_list";
import { getHistoryContext } from "../helpers/history/history";
import isElectron from "is-electron";
import { isSupportedModelType } from "../app_config";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModelsList extends Component {
  constructor(props) {
    super(props);
    this.getModelsList = this.getModelsList.bind(this);
    this.getModelsWithFileInfo = this.getModelsWithFileInfo.bind(this);
    this.state = { modelsWithFileInfo: [] };
  }

  async componentDidMount() {
    await this.loadModelsWithFileInfo();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isDirtyChanged = this.props.isDirty !== nextProps.isDirty;
    const localizationChanged =
      this.props.localization !== nextProps.localization;
    const modelsListChanged = !_.isEqual(
      this.props.modelsList,
      nextProps.modelsList
    );
    const profileChanged = !_.isEqual(this.props.profile, nextProps.profile);
    const stateChanged = !_.isEqual(nextState, this.state);
    const isSearchTermChanged = nextProps.searchTerm !== this.props.searchTerm;

    return (
      isDirtyChanged ||
      localizationChanged ||
      modelsListChanged ||
      profileChanged ||
      stateChanged ||
      isSearchTermChanged
    );
  }

  async componentDidUpdate(prevProps) {
    const isModelsListChange = !_.isEqual(
      prevProps.modelsList,
      this.props.modelsList
    );
    const isProfileChanged = !_.isEqual(prevProps.profile, this.props.profile);
    if (isModelsListChange || isProfileChanged) {
      await this.loadModelsWithFileInfo();
    }
  }

  async loadModelsWithFileInfo() {
    this.setState({
      modelsWithFileInfo: await this.getModelsWithFileInfo()
    });
  }

  removeFromModelsList(filePath) {
    if (isElectron()) {
      const modifiedModelList = _.omit(this.props.modelsList, filePath);
      ipcRenderer.send("modelList:save", modifiedModelList);
    } else {
      var modelListInfo = localStorage.getItem("dataxmodels");

      var modelsListContent = JSON.parse(modelListInfo);
      var updatedModelsListContent = _.omit(modelsListContent, filePath);

      localStorage.setItem(
        "dataxmodels",
        JSON.stringify(updatedModelsListContent)
      );

      localStorage.removeItem(filePath);

      const modelsListData = localStorage.getItem("dataxmodels");
      this.props.fetchModelsList(JSON.parse(modelsListData));
    }
  }

  async existsFile(filePath) {
    return (await ipcRenderer?.invoke("app:existsFile", filePath)) ?? true;
  }

  renderFileExistence(exists) {
    if (!exists) {
      return (
        <div className="im-has-tooltip im-relative">
          <i className="im-icon-16 im-icon-Warning16" />{" "}
          <div className={"im-tooltip im-tooltip-right"}>File not found.</div>
        </div>
      );
    }
  }

  async reopenModel(modelsListItem) {
    const ipcAction = createReopenAction();
    const parameters = { filePath: modelsListItem.filePath };
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_REOPEN_MODEL,
        parameters,
        ipcAction
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      await this.props.reopenModel(
        getHistoryContext(this.props.history, this.props.match),
        new IPCContext(ipcAction),
        parameters
      );
    }
  }

  async reopenModelInAnotherInstance(modelsListItem) {
    ipcRenderer?.send("modelList:openModelInAnotherInstance", {
      filePath: modelsListItem.filePath
    });
  }

  async getModelsWithFileInfo() {
    const orderedModelList = _.orderBy(
      this.props.modelsList,
      ["lastSaved"],
      ["desc"]
    );
    return Promise.all(
      _.map(
        _.filter(orderedModelList, this.filterSupportedModels()),
        async (model) => {
          return {
            model,
            exists: await this.existsFile(model.filePath)
          };
        }
      )
    );
  }

  getModelsList() {
    let result = this.state.modelsWithFileInfo;
    if (this.props.searchTerm) {
      result = this.state.modelsWithFileInfo.filter(
        ({ model }) =>
          model.modelName
            .toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          ModelTypesForHumans[model.modelType]
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          model.modelDesc
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          model.filePath
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          Helpers.formatDate(model.lastSaved)
            .toLowerCase()
            .includes(this.props.searchTerm.toLowerCase())
      );
    }

    if (_.size(result) < 1) {
      return (
        <div className="im-message im-padding-md">
          No matches. Try to redefine the search term.
        </div>
      );
    }

    return _.map(result, ({ model: modelsListItem, exists }) => {
      return (
        <div key={_.uniqueId()} className="im-grid-row">
          <div className="im-box-title">
            <div
              className="im-box-name im-pointer"
              onClick={this.reopenModel.bind(this, modelsListItem)}
            >
              {modelsListItem.modelName}
            </div>
            <div className="im-box-warning">
              {this.renderFileExistence(exists)}
            </div>
            <div className="im-box-type">
              {ModelTypesForHumans[modelsListItem.modelType]}
            </div>
            <div
              className="im-box-cross"
              onClick={this.removeFromModelsList.bind(
                this,
                modelsListItem.filePath
              )}
            >
              <i className="im-icon-16 im-icon-Cross16" />
            </div>
          </div>
          <div className="im-box-text">{modelsListItem.modelDesc}</div>
          <div className="im-box-text">
            Saved: {Helpers.formatDate(modelsListItem.lastSaved)}
          </div>
          <div className="im-box-text">
            {isElectron() ? "Path: " + modelsListItem.filePath : ""}
          </div>

          <div className="im-box-btn">
            <div className="im-flex-cols">
              {exists === true ? (
                <div
                  className="im-link im-flex-cols-first-full-width"
                  onClick={this.reopenModel.bind(this, modelsListItem)}
                >
                  Open {this.props.localization.L_MODEL}
                </div>
              ) : (
                <></>
              )}

              {exists === true && this.canRunMultipleInstances() ? (
                <div
                  className="im-link im-display-inline-block"
                  onClick={this.reopenModelInAnotherInstance.bind(
                    this,
                    modelsListItem
                  )}
                >
                  Open in a new window
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      );
    });
  }
  canRunMultipleInstances() {
    return isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.MULTIPLE_INSTANCES
    );
  }

  filterSupportedModels() {
    return (model) => isSupportedModelType(model.modelType);
  }

  render() {
    if (_.size(this.props.modelsList) < 1) {
      return (
        <div
          className="im-grid-row im-pointer"
          onClick={() => this.props.toggleNewModelModal()}
        >
          <div className="im-message im-padding-md">
            <h2>Create your first project.</h2>
          </div>
        </div>
      );
    }

    return (
      <div key={"modelsListKey"}>
        <div className="im-flex-box-items">{this.getModelsList()}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isDirty: state.model.isDirty,
    localization: state.localization,
    modelsList: state.modelsList,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchModel,
        loadModel,
        fetchModelsList,
        updateModelProperty,
        toggleUnsavedChangesModal,
        setUnsavedChangesModalAction,
        reopenModel,
        toggleNewModelModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelsList)
);
