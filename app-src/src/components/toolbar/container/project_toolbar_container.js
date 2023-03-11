import {
  ACTION_CONVERT_AND_SAVE_TEMP,
  setReportIsRendered,
  setUnsavedChangesModalAction,
  toggleReverseStatsModal,
  toggleUnsavedChangesModal
} from "../../../actions/ui";
import {
  Features,
  isFeatureAvailable
} from "../../../helpers/features/features";
import {
  IPCContext,
  createConvertAndSaveTempAction
} from "../../../helpers/ipc/ipc";
import { ModelTypes, TEST_ID } from "common";
import {
  convertAndSaveTemp,
  executeOpenAction,
  provideModel,
  saveModel
} from "../../../actions/model";
import { finishTransaction, startTransaction } from "../../../actions/undoredo";
import {
  newModel,
  showConnections,
  showConnectionsUpdate,
  showModels,
  toggleDiffHTMLReportModalExecute,
  toggleReportModalExecute
} from "../../../actions/modals";

import { Component } from "react";
import React from "react";
import ToolbarButton from "../../toolbar_button";
import ToolbarDropdown from "../../toolbar_dropdown";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../../helpers/history/history";
import { isMeteor } from "../../../helpers/features/features";
import { reverseAndUpdateModel } from "../../../actions/reverse";
import { withRouter } from "react-router";

const ipcRenderer = window?.ipcRenderer;

class ProjectToolbarContainer extends Component {
  async exportToPdf() {
    const multiCoef = 263.6;

    const diagram = document.getElementById("diagram");
    await this.props.setReportIsRendered(true);

    if (diagram !== null) {
      const pdfOptions = {
        width: diagram.scrollWidth * multiCoef + 25 * multiCoef,
        height: diagram.scrollHeight * multiCoef + 25 * multiCoef,
        printBackground: true, //this.props.settings.printColors,
        filename: this.props.name
      };
      ipcRenderer?.once("app:exportToPdfFinished", () => {
        this.props.setReportIsRendered(false);
      });
      ipcRenderer?.send("app:exportToPdf", pdfOptions);
    }
  }

  async updateWithDefaultConnection() {
    const connection = _.find(
      this.props.connections,
      (connection) => this.props.connectionId === connection.id
    );
    if (connection) {
      await this.props.reverseAndUpdateModel(
        connection,
        getHistoryContext(this.props.history, this.props.match)
      );
    }
  }

  async convertToAnotherPlatform(targetPlatform) {
    const ipcAction = createConvertAndSaveTempAction();
    const parameters = { targetPlatform };
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_CONVERT_AND_SAVE_TEMP,
        parameters,
        ipcAction
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      this.props.convertAndSaveTemp(
        getHistoryContext(this.props.history, this.props.match),
        new IPCContext(ipcAction),
        parameters
      );
    }
  }

  updateSelectConnection() {
    this.props.showConnectionsUpdate(this.props.history);
  }

  showLastUpdateStats() {
    //    console.log({ reverseStats: this.props.reverseStats });
    if (this.props.reverseStats?.updated === true) {
      this.props.toggleReverseStatsModal();
    }
  }

  diffReport() {}

  renderUpdateDropDown() {
    const isEnabledToolbarItem = this.props.match.params.mid ? true : false;
    const missingModel = this.props.match.params.mid ? "" : " im-disabled";
    const isUpdateAvailable =
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.UPDATE
      ) &&
      (this.props.type === ModelTypes.PG ||
        this.props.type === ModelTypes.MYSQL ||
        this.props.type === ModelTypes.MARIADB ||
        this.props.type === ModelTypes.SQLITE ||
        this.props.type === ModelTypes.MSSQL);
    const canUpdateModelWithConnection = !!_.find(
      this.props.connections,
      (connection) => this.props.connectionId === connection.id
    );
    const hasDiffInfo = this.props.reverseStats?.updated === true;

    return isUpdateAvailable ? (
      <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
        <ToolbarButton
          showCaption={this.props.showToolbarCaptions}
          caption="Update"
          icon="im-icon-Update"
          isEnabled={isEnabledToolbarItem}
          customCss={missingModel}
          tooltip="Update"
          tooltipClass="im-tooltip-left"
          data-testid={TEST_ID.TOOLBAR.UPDATE}
        />
        <div className="toolbar-dropdown-area drop">
          {canUpdateModelWithConnection && (
            <ToolbarButton
              showCaption={this.props.showToolbarCaptions}
              caption="Update with default connection"
              onClick={this.updateWithDefaultConnection.bind(this)}
              isEnabled={isEnabledToolbarItem}
              customCss={missingModel}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.UPDATE_DEFAULT_CONNECTION}
            />
          )}
          <ToolbarButton
            showCaption={this.props.showToolbarCaptions}
            caption="Select connection"
            onClick={this.updateSelectConnection.bind(this)}
            isEnabled={isEnabledToolbarItem}
            customCss={missingModel}
            tooltipClass="im-tooltip-left"
            data-testid={TEST_ID.TOOLBAR.UPDATE_SELECT_CONNECTION}
          />
          {hasDiffInfo && (
            <ToolbarButton
              showCaption={this.props.showToolbarCaptions}
              caption="Last project update statistics"
              onClick={this.showLastUpdateStats.bind(this)}
              isEnabled={isEnabledToolbarItem}
              customCss={missingModel}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.SHOW_LAST_UPDATE_STATS}
            />
          )}
        </div>
      </ToolbarDropdown>
    ) : (
      <></>
    );
  }

  renderReportDropDown() {
    const isEnabledToolbarItem = this.props.match.params.mid ? true : false;
    const missingModel = this.props.match.params.mid ? "" : " im-disabled";
    const notMeteor = !isMeteor(this.props.profile);
    return (
      <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
        <ToolbarButton
          showCaption={this.props.showToolbarCaptions}
          caption="Report"
          icon="im-icon-export"
          isEnabled={isEnabledToolbarItem}
          customCss={missingModel}
          tooltip="Export"
          tooltipClass="im-tooltip-left"
          data-testid={TEST_ID.TOOLBAR.REPORT}
        />
        <div className="toolbar-dropdown-area drop">
          <ToolbarButton
            showCaption={this.props.showToolbarCaptions}
            caption="Export diagram to PDF"
            onClick={this.exportToPdf.bind(this)}
            isEnabled={isEnabledToolbarItem}
            customCss={missingModel}
            tooltipClass="im-tooltip-left"
            data-testid={TEST_ID.TOOLBAR.GENERATE_PDF}
          />
          {notMeteor && (
            <ToolbarButton
              showCaption={this.props.showToolbarCaptions}
              caption="Generate HTML report"
              onClick={this.props.toggleReportModalExecute.bind(this)}
              isEnabled={isEnabledToolbarItem}
              customCss={missingModel}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.GENERATE_HTML_REPORT}
            />
          )}
        </div>
      </ToolbarDropdown>
    );
  }

  renderConvertDropDown() {
    const isEnabledToolbarItem = this.props.match.params.mid ? true : false;
    const missingModel = this.props.match.params.mid ? "" : " im-disabled";

    const supportConvert = isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.CONVERT
    );

    const isMongoModel = this.props.type === ModelTypes.MONGODB;

    return isMongoModel && supportConvert ? (
      <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
        <ToolbarButton
          showCaption={this.props.showToolbarCaptions}
          caption="Convert"
          icon="im-icon-Convert"
          isEnabled={isEnabledToolbarItem}
          customCss={missingModel}
          tooltip="Convert"
          tooltipClass="im-tooltip-left"
        />
        <div className="toolbar-dropdown-area drop">
          <ToolbarButton
            showCaption={this.props.showToolbarCaptions}
            caption="Convert to Mongoose"
            onClick={this.convertToAnotherPlatform.bind(
              this,
              ModelTypes.MONGOOSE
            )}
            isEnabled={true}
            customCss={missingModel}
            tooltipClass="im-tooltip-left"
          />
        </div>
      </ToolbarDropdown>
    ) : (
      <></>
    );
  }

  renderSaveButton() {
    const saveTooltip = " Save " + this.props.localization.L_MODEL + " to file";
    const canBeSaved = this.props.isDirty;
    const enabledIconStateCanBeSaved = this.props.isDirty ? "" : " im-disabled";
    return (
      <ToolbarButton
        id="toolbar-btn-save-project"
        showCaption={this.props.showToolbarCaptions}
        caption="Save"
        tooltip={saveTooltip}
        onClick={() =>
          this.props.saveModel(ipcRenderer, false, true, () => {
            // testing purpose
          })
        }
        icon="im-icon-Save"
        isEnabled={canBeSaved}
        customCss={enabledIconStateCanBeSaved}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.SAVE}
      />
    );
  }

  renderOpenButton() {
    const openTooltip =
      "Open " + this.props.localization.L_MODEL + " from file";
    return (
      <ToolbarButton
        id="toolbar-btn-open-project"
        showCaption={this.props.showToolbarCaptions}
        caption="Open"
        tooltip={openTooltip}
        onClick={this.props.executeOpenAction.bind(
          this,
          this.props.history,
          this.props.match
        )}
        icon="im-icon-Open"
        isEnabled={true}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.OPEN}
      />
    );
  }

  renderNewProjectButton() {
    const newProjectTooltip = "Create new " + this.props.localization.L_MODEL;
    return (
      <ToolbarButton
        id="toolbar-btn-new-project"
        showCaption={this.props.showToolbarCaptions}
        caption="New"
        tooltip={newProjectTooltip}
        onClick={this.props.newModel.bind(this)}
        icon="im-icon-New"
        isEnabled={true}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.NEW}
      />
    );
  }

  renderProjectsButton() {
    return (
      <ToolbarButton
        id="toolbar-btn-projects"
        showCaption={this.props.showToolbarCaptions}
        caption="Projects"
        tooltip="Show existing projects"
        onClick={this.props.showModels.bind(this, this.props.history)}
        icon="im-icon-Projects"
        isEnabled={true}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.PROJECTS}
      />
    );
  }

  render() {
    return (
      <div className="toolbar-container toolbar-container-projects">
        <div className="toolbar-wrapper">
          {this.renderProjectsButton()}
          {this.renderNewProjectButton()}
          {!!ipcRenderer && this.renderOpenButton()}
          {this.renderSaveButton()}
          {this.renderReportDropDown()}
          {this.renderConvertDropDown()}
          {this.renderUpdateDropDown()}
        </div>
        <div className="toolbar-item-divider" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    localization: state.localization,
    isDirty: state.model.isDirty,
    profile: state.profile,
    connectionId: state.model.connectionId,
    connections: state.connections,
    type: state.model.type,
    name: state.model.name,
    reverseStats: state.reverseStats
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        showConnections,
        toggleReportModalExecute,
        toggleDiffHTMLReportModalExecute,
        showModels,
        newModel,
        executeOpenAction,
        setReportIsRendered,
        saveModel,
        showConnectionsUpdate,
        startTransaction,
        finishTransaction,
        provideModel,
        reverseAndUpdateModel,
        toggleReverseStatsModal,
        convertAndSaveTemp,
        setUnsavedChangesModalAction,
        toggleUnsavedChangesModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProjectToolbarContainer)
);
