import React, { Component } from "react";
import { clearBackupModel, executeRestoreModel } from "../actions/restore";
import {
  fetchModel,
  loadModel,
  reopenModel,
  updateModelProperty
} from "../actions/model";
import {
  setUnsavedChangesModalAction,
  toggleNewModelModal,
  toggleUnsavedChangesModal
} from "../actions/ui";

import Helpers from "../helpers/helpers";
import { ModelTypesForHumans } from "../enums/enums";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchModelsList } from "../actions/models_list";
import { getHistoryContext } from "../helpers/history/history";
import { getUnsavedModels } from "../selectors/selector_recovery";
import isElectron from "is-electron";
import { isSupportedModelType } from "../app_config";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class UnsavedModelsList extends Component {
  constructor(props) {
    super(props);
    this.getUnsavedModelsList = this.getUnsavedModelsList.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const isRestoreChanged = !_.isEqual(
      nextProps.unsavedModelsList,
      this.props.unsavedModelsList
    );
    const isProfileChanged = !_.isEqual(nextProps.profile, this.props.profile);
    const isSearchTermChanged = nextProps.searchTerm !== this.props.searchTerm;
    return isRestoreChanged || isProfileChanged || isSearchTermChanged;
  }

  removeFromRestore(sessionId) {
    this.props.clearBackupModel(ipcRenderer, sessionId);
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

  getUnsavedModelsList() {
    let result = this.props.unsavedModelsList;
    if (this.props.searchTerm) {
      result = this.props.unsavedModelsList.filter(
        (unsavedModel) =>
          unsavedModel.modelInfo.model.name
            .toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          ModelTypesForHumans[unsavedModel.modelInfo.model.type]
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          unsavedModel.modelInfo.model.desc
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          unsavedModel.modelInfo.originalModelPath
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          Helpers.formatDate(unsavedModel.modelInfo.model.lastSaved)
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

    return (
      <>
        {_.map(
          _.filter(result, (unsavedModel) =>
            isSupportedModelType(unsavedModel.modelInfo.model.type)
          ),
          (unsavedModel) => {
            return (
              <div key={_.uniqueId()} className="im-grid-row">
                <div className="im-box-title">
                  <div
                    className="im-box-name im-pointer"
                    onClick={this.props.executeRestoreModel.bind(
                      this,
                      getHistoryContext(this.props.history, this.props.match),
                      unsavedModel
                    )}
                  >
                    {unsavedModel.modelInfo.model.name}
                  </div>
                  <div className="im-box-warning">
                    {this.renderFileExistence(true)}
                  </div>
                  <div className="im-box-type">
                    {ModelTypesForHumans[unsavedModel.modelInfo.model.type]}
                  </div>
                  <div
                    className="im-box-cross"
                    onClick={this.removeFromRestore.bind(
                      this,
                      unsavedModel.sessionId
                    )}
                  >
                    <i className="im-icon-16 im-icon-Cross16" />
                  </div>
                </div>
                <div className="im-box-text">
                  {unsavedModel.modelInfo.model.desc}
                </div>
                {!_.isEmpty(unsavedModel.modelInfo.model.lastSaved) ? (
                  <div className="im-box-text">
                    Saved:{" "}
                    {Helpers.formatDate(unsavedModel.modelInfo.model.lastSaved)}
                  </div>
                ) : (
                  <></>
                )}

                <div className="im-box-text">
                  {isElectron() && !!unsavedModel.modelInfo.originalModelPath
                    ? "Source project path: " +
                      unsavedModel.modelInfo.originalModelPath
                    : ""}
                </div>
                <div
                  className="im-box-text"
                  title={
                    isElectron() && !!unsavedModel.modelInfo.path
                      ? unsavedModel.modelInfo.path
                      : ""
                  }
                >
                  {isElectron() && !!unsavedModel.modelInfo.path
                    ? "Restore file path: " +
                      Helpers.shortenString(
                        unsavedModel.modelInfo.path,
                        true,
                        50
                      )
                    : ""}
                </div>

                <div className="im-box-btn">
                  {true === true ? (
                    <div
                      className="im-link"
                      onClick={this.props.executeRestoreModel.bind(
                        this,
                        getHistoryContext(this.props.history, this.props.match),
                        unsavedModel
                      )}
                    >
                      Restore {this.props.localization.L_MODEL}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            );
          }
        )}
        <div className="im-message im-padding-md">
          A list of unsaved projects or files that can be used to restore
          projects.
        </div>
      </>
    );
  }

  filterSupportedModels() {
    return (unsavedModel) => {
      return isSupportedModelType(unsavedModel.modelInfo.model.type);
    };
  }

  render() {
    return (
      <div key={"modelsListKey"}>
        <div className="im-flex-box-items">{this.getUnsavedModelsList()}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    localization: state.localization,
    profile: state.profile,
    unsavedModelsList: getUnsavedModels(state)
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
        toggleNewModelModal,
        clearBackupModel,
        executeRestoreModel
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UnsavedModelsList)
);
