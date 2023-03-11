import {
  ACTION_APPQUIT,
  setUnsavedChangesModalAction,
  toggleColumnModal,
  toggleEulaModal,
  toggleFeedbackModal,
  toggleIndexAssistantModal,
  toggleNewModelModal,
  toggleRelationModal,
  toggleTableModal,
  toggleTipsModal,
  toggleUnsavedChangesModal
} from "../actions/ui";
import { APP_NAME, ModelTypes } from "common";
import { IPCContext, openFromCommandLineAction } from "../helpers/ipc/ipc";
import React, { Component } from "react";
import {
  addAppTestProperty,
  fetchAppLatestVersion,
  fetchProfileFeatures,
  fetchProfileLicense,
  fetchProfileTrialInfo,
  getFeaturesForProfile
} from "../actions/profile";
import { fetchRestore, saveBackupModel } from "../actions/restore";
import {
  fetchSettings,
  storeSettings,
  updateSettingsProperty
} from "../actions/settings";
import {
  importModelProperites,
  provideModel,
  updateModelProperty
} from "../actions/model";
import {
  showAccount,
  showConfig,
  showConnections,
  showModels
} from "../actions/modals";

import _ from "lodash";
import { addNotification } from "../actions/notifications";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchConnections } from "../actions/connections";
import { fetchModelsList } from "../actions/models_list";
import { fetchModelsSamples } from "../actions/models_samples";
import { filterModelSettings } from "../helpers/settings_helper";
import { getHistoryContext } from "../helpers/history/history";
import { getSupportedModelTypes } from "../app_config";
import { initNewUndefinedProperties } from "../helpers/connection/connection_upgrade";
import { isInvalidLicense } from "../helpers/features/features";
import moment from "moment";
import { setLocalization } from "../actions/localization";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router";

const ipcRenderer = window?.ipcRenderer;

class AppInit extends Component {
  async componentDidMount() {
    this.setDefaultLocalization();
    this.props.fetchAppLatestVersion();

    if (!!ipcRenderer) {
      ipcRenderer.on("app:test", (event, data) => {
        this.props.addAppTestProperty({
          name: "mockNow",
          value: data.MOCK_NOW
        });
      });
      ipcRenderer.on("appLifespan:updated", (event, { content }) => {
        this.props.fetchProfileTrialInfo(content);
        this.props.fetchProfileFeatures(
          getFeaturesForProfile(this.props.profile)
        );

        ipcRenderer.send("license:load");
      });
      ipcRenderer.send("appLifespan:load");

      ipcRenderer.on("restore:backupTick", (event, { timestamp }) => {
        this.props.saveBackupModel(ipcRenderer, timestamp);
      });

      ipcRenderer.on("restore:updated", (event, data) => {
        this.props.fetchRestore(data.content);
      });

      ipcRenderer.send("restore:load");

      ipcRenderer.on("modelSettings:updated", (event, data) => {
        const isChanged = !_.isEqual(
          data.content,
          filterModelSettings(this.props.model)
        );
        if (isChanged) {
          this.props.importModelProperites({
            ...this.props.model,
            ...data.content
          });
          this.props.updateModelProperty(this.props.model.id, true, "isDirty");
        }
      });

      ipcRenderer.once("settings:updated", (event, settings) => {
        this.updateSettingsOnStart(settings);
        this.props.fetchModelsSamples();
      });

      ipcRenderer.on("settings:updated", (event, settings) => {
        this.props.fetchSettings(settings);
      });

      ipcRenderer.on("encryptedSettings:updated", (event, settings) => {
        this.props.fetchSettings(settings);
      });

      ipcRenderer.send("settings:load");
      ipcRenderer.send("encryptedSettings:load");

      ipcRenderer.on("license:updated", (event, result) => {
        if (result.content) {
          const licenseData = result.content;
          if (isInvalidLicense(licenseData)) {
            return;
          }
          this.props.fetchProfileLicense(licenseData);
          this.props.fetchProfileFeatures(
            getFeaturesForProfile(this.props.profile)
          );
        }
      });

      ipcRenderer.on("app:close", async (event, result) => {
        if (this.props.isDirty === true) {
          await this.props.setUnsavedChangesModalAction({
            name: ACTION_APPQUIT
          });
          if (this.props.unsavedChangesModalIsDisplayed === false) {
            this.props.toggleUnsavedChangesModal();
          }
        } else {
          ipcRenderer.send("app:quit", "just quit");
        }
      });

      ipcRenderer.on("page:connections", (event, result) => {
        this.props.showConnections(this.props.history);
      });

      ipcRenderer.on("page:settings", (event, result) => {
        showConfig(this.props.history);
      });

      ipcRenderer.on("page:projects", (event, result) => {
        this.props.showModels(this.props.history);
      });

      ipcRenderer.on("page:account", (event, result) => {
        showAccount(this.props.history);
      });

      ipcRenderer.on("notification:newMessage", (event, result) => {
        this.props.addNotification({
          id: uuidv4(),
          datepast: moment().startOf("minute").fromNow(),
          datesort: moment().unix(),
          date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
          message: result.message,
          model: this.props.name,
          type: result.type,
          autohide: result.autohide,
          urlCaption: result.urlCaption,
          urlToOpen: result.urlToOpen,
          urlIsExternal: result.urlIsExternal
        });
      });

      ipcRenderer.on("feedback:toggle", (event, message) => {
        this.props.toggleFeedbackModal();
      });

      ipcRenderer.on("modal:tipsModal", async (event, message) => {
        await this.props.updateSettingsProperty(true, "showTips");
        await this.props.storeSettings();
        if (this.props.tipsModalIsDisplayed === false) {
          this.props.toggleTipsModal();
        }
      });

      this.loadConnections();

      await this.checkCommandLine();
    }

    this.showModels();
  }

  updateSettingsOnStart(payload) {
    const settings = payload.content;
    if (settings.showTips) {
      this.props.toggleTipsModal();
    }

    if (
      settings.eula_im !== undefined &&
      settings.eula_im !== false &&
      this.props.eulaModalIsDisplayed === true
    ) {
      this.props.toggleEulaModal();
    }
  }

  loadConnections() {
    if (ipcRenderer) {
      ipcRenderer.on("connectionList:updated", (event, message) => {
        const fixedConnections = this.upgradeConnections(message.content);
        this.props.fetchConnections(fixedConnections);
      });
      ipcRenderer.send("connectionList:load");
    }
  }

  componentDidUpdate(prevProps) {
    const isProfileChanged = !_.isEqual(prevProps.profile, this.props.profile);
    if (isProfileChanged) {
      this.loadConnections();
    }
  }

  setDefaultLocalization() {
    switch (this.props.profile?.appInfo?.appName) {
      case APP_NAME.PERSEID_APP_NAME: {
        this.props.setLocalization(ModelTypes.JSONSCHEMA);
        return;
      }
      case APP_NAME.METEOR_APP_NAME: {
        this.props.setLocalization(ModelTypes.SEQUELIZE);
        return;
      }
    }
  }

  upgradeConnections(connectionsToProcess) {
    return Object.keys(connectionsToProcess)
      .map((key) => connectionsToProcess[key])
      .map((item) => initNewUndefinedProperties(item))
      .reduce((r, connection) => {
        if (isSupportedConnection(connection)) {
          r[connection.id] = connection;
        }
        return r;
      }, {});
  }

  async checkCommandLine() {
    await this.props.provideModel(
      getHistoryContext(this.props.history, this.props.match),
      this.props.isDirty,
      new IPCContext(openFromCommandLineAction()),
      {}
    );
  }

  async showModels() {
    if (this.props.tableModalIsDisplayed) {
      await this.props.toggleTableModal();
    }
    if (this.props.columnModalIsDisplayed) {
      await this.props.toggleColumnModal();
    }
    if (this.props.relationModalIsDisplayed) {
      await this.props.toggleRelationModal();
    }
    if (this.props.indexAssistantModalIsDisplayed) {
      await this.props.toggleIndexAssistantModal();
    }
    if (this.props.newModelModalIsDisplayed) {
      await this.props.toggleNewModelModal();
    }
    this.props.history.push("/models");

    if (!!ipcRenderer) {
      ipcRenderer.on("modelList:updated", async (event, message) => {
        await this.props.fetchModelsList(message.content);
      });
      ipcRenderer.send("modelList:load");
    } else {
      const modelsListData = localStorage.getItem("dataxmodels");
      await this.props.fetchModelsList(JSON.parse(modelsListData));
    }
  }

  render() {
    return <></>;
  }
}

function isSupportedConnection(connection) {
  return !!_.find(
    getSupportedModelTypes(),
    (type) => type.id === connection.type
  );
}

function mapStateToProps(state) {
  return {
    isDirty: state.model.isDirty,
    profile: state.profile,
    unsavedChangesModalIsDisplayed: state.ui.unsavedChangesModalIsDisplayed,
    model: state.model,
    eulaModalIsDisplayed: state.ui.eulaModalIsDisplayed,
    tipsModalIsDisplayed: state.ui.tipsModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchAppLatestVersion,
        fetchModelsSamples,
        fetchProfileLicense,
        fetchProfileFeatures,
        setUnsavedChangesModalAction,
        toggleUnsavedChangesModal,
        addNotification,
        fetchSettings,
        toggleTipsModal,
        toggleEulaModal,
        toggleFeedbackModal,
        updateSettingsProperty,
        storeSettings,
        fetchConnections,
        initNewUndefinedProperties,
        toggleTableModal,
        toggleColumnModal,
        toggleRelationModal,
        toggleIndexAssistantModal,
        toggleNewModelModal,
        fetchModelsList,
        provideModel,
        setLocalization,
        importModelProperites,
        updateModelProperty,
        showConnections,
        showModels,
        saveBackupModel,
        fetchRestore,
        fetchProfileTrialInfo,
        addAppTestProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AppInit)
);
