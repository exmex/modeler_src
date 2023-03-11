import {
  ACTION_APPQUIT,
  ACTION_TOGGLE_NEW_MODEL_MODAL,
  onToggleVisibilityClick,
  setActiveTask,
  setDiagramAreaMode,
  setDiagramLoading,
  setDisplayMode,
  setForcedRender,
  setReportIsRendered,
  setUnsavedChangesModalAction,
  toggleAsideLeft,
  toggleAsideRight,
  toggleBuyProModal,
  toggleColumnModal,
  toggleConfirmDelete,
  toggleConfirmDeleteLine,
  toggleConfirmDeleteRelation,
  toggleEulaModal,
  toggleFeedbackModal,
  toggleFinder,
  toggleIndexAssistantModal,
  toggleLineModal,
  toggleNewModelModal,
  toggleNoteModal,
  toggleOtherObjectModal,
  toggleRelationModal,
  toggleReportModal,
  toggleRestoreModelModal,
  toggleSqlModal,
  toggleTableModal,
  toggleTextEditorModal,
  toggleTipsModal,
  toggleTrialModal,
  toggleUnsavedChangesModal
} from "../actions/ui";
import { DEV_DEBUG, isDebug } from "../web_env";
import { DiagramAreaMode, ModelTypes } from "../enums/enums";
import {
  Features,
  isBasic,
  isFeatureAvailable,
  isFreeware,
  isInvalidLicense,
  isMeteor,
  isPerseid
} from "../helpers/features/features";
import { IPCContext, openFromCommandLineAction } from "../helpers/ipc/ipc";
import React, { Component } from "react";
import {
  addJsonSchemaGlobalObject,
  addTable,
  clearTables,
  fetchTable,
  onAddClick,
  onAddCompositeClick,
  onAddEmbeddableClick,
  onAddInputClick,
  onAddInterfaceClick,
  onAddUnionClick,
  updateTableProperty
} from "../actions/tables";
import {
  alignItems,
  resizeItems,
  switchLockDimensions,
  updateDiagramProperty
} from "../actions/diagrams";
import {
  clearModel,
  executeOpenAction,
  fetchModel,
  provideModel,
  saveModel,
  updateModelProperty
} from "../actions/model";
import {
  deleteRelation,
  fetchRelation,
  fetchRelations
} from "../actions/relations";
import {
  fetchAppLatestVersion,
  fetchProfileAppInfo,
  fetchProfileFeatures,
  fetchProfileLicense
} from "../actions/profile";
import { fetchNote, updateNoteProperty } from "../actions/notes";
import {
  fetchOtherObject,
  updateOtherObjectProperty
} from "../actions/other_objects";
import {
  fetchSettings,
  storeSettings,
  updateSettingsProperty
} from "../actions/settings";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  redo,
  startTransaction,
  undo
} from "../actions/undoredo";

import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { OtherObjectTypes } from "../classes/class_other_object";
import { TEST_ID } from "common";
import { TableObjectTypesJson } from "../platforms/jsonschema/class_table_jsonschema";
import ToolbarButton from "./toolbar_button";
import ToolbarDropdown from "./toolbar_dropdown";
import TreeDiagramHelpers from "../helpers/tree_diagram/tree_diagram_helpers";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addNotification } from "../actions/notifications";
import { autolayout } from "../actions/autolayout";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copySelectedTables } from "../actions/copy";
import { fetchConnections } from "../actions/connections";
import { fetchModelsList } from "../actions/models_list";
import { fetchModelsSamples } from "../actions/models_samples";
import { getHistoryContext } from "../helpers/history/history";
import { initNewUndefinedProperties } from "../helpers/connection/connection_upgrade";
import isElectron from "is-electron";
import moment from "moment";
import { setObjectsCopyList } from "../actions/objects_copies";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class Toolbar extends Component {
  async componentDidMount() {
    this.props.fetchAppLatestVersion();

    if (isElectron()) {
      if (_.size(this.props.modelsSamples) < 1) {
        this.props.fetchModelsSamples();
      }
      ipcRenderer.on("license:loaded", (event, result) => {
        if (result.license) {
          const licenseData = JSON.parse(result.license);
          if (isInvalidLicense(licenseData)) {
            return false;
          }
          this.props.fetchProfileLicense(licenseData);
          if (isPerseid(this.props.profile)) {
            this.props.fetchProfileFeatures([
              Features.IMPORT_JSONSCHEMA,
              Features.REPORTS
            ]);
          } else if (isMeteor(this.props.profile)) {
            this.props.fetchProfileFeatures([]);
          } else if (isFreeware(this.props.profile)) {
            this.props.fetchProfileFeatures([Features.DISABLED_CONNECTIONS]);
          } else if (isBasic(this.props.profile)) {
            this.props.fetchProfileFeatures([Features.CONNECTIONS]);
          } else {
            this.props.fetchProfileFeatures([
              Features.SSH,
              Features.TLS,
              Features.MULTIDIAGRAMS,
              Features.REPORTS,
              Features.CONNECTIONS
            ]);
          }
        }
        return true;
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

      ipcRenderer.on("license:appinfo", (event, result) => {
        this.props.fetchProfileAppInfo(JSON.parse(result));
        if (isPerseid(this.props.profile)) {
          this.props.fetchProfileFeatures([
            Features.IMPORT_JSONSCHEMA,
            Features.REPORTS
          ]);
        } else if (isMeteor(this.props.profile)) {
          this.props.fetchProfileFeatures([]);
        } else if (isFreeware(this.props.profile)) {
          this.props.fetchProfileFeatures([Features.DISABLED_CONNECTIONS]);
        } else if (isBasic(this.props.profile)) {
          this.props.fetchProfileFeatures([Features.CONNECTIONS]);
        } else {
          this.props.fetchProfileFeatures([
            Features.SSH,
            Features.TLS,
            Features.MULTIDIAGRAMS,
            Features.REPORTS,
            Features.CONNECTIONS
          ]);
        }
      });

      ipcRenderer.on("license:no", (event, result) => {});

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

      ipcRenderer.once("settings:loaded", (event, settingsToProcess) => {
        this.props.fetchSettings(settingsToProcess);

        if (settingsToProcess.showTips) {
          this.props.toggleTipsModal();
        }

        if (
          settingsToProcess.eula !== undefined &&
          settingsToProcess.eula !== false &&
          this.props.eulaModalIsDisplayed === true
        ) {
          this.props.toggleEulaModal();
        }

        if (
          !!settingsToProcess.unsavedModel &&
          settingsToProcess?.unsavedModel?.model?.id !== this.props.id
        ) {
          this.props.toggleRestoreModelModal();
        }
        return true;
      });
      ipcRenderer.send("settings:load");

      ipcRenderer.on("page:settings", (event, message) => {
        this.showConfig();
      });

      ipcRenderer.on("page:account", (event, message) => {
        this.showAccount();
      });

      ipcRenderer.on("page:connections", (event, message) => {
        this.showConnections();
      });

      ipcRenderer.on("page:projects", (event, message) => {
        this.props.history.push("/models");
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

      ipcRenderer.send("connectionsList:getConnectionsListFromFile");
      ipcRenderer.once(
        "connectionsList:fetchConnectionsList",
        (event, message) => {
          var connectionsToProcess = JSON.parse(message);
          const fixedConnections =
            this.upgradeConnections(connectionsToProcess);
          this.props.fetchConnections(fixedConnections);
        }
      );

      await this.checkCommandLine();
    }

    this.showModels();
  }

  async checkCommandLine() {
    await this.props.provideModel(
      getHistoryContext(this.props.history, this.props.match),
      this.props.isDirty,
      new IPCContext(openFromCommandLineAction()),
      {}
    );
  }

  showConfig() {
    this.props.history.push("/config");
  }

  expandAll() {
    TreeDiagramHelpers.expandOrCollapseNodes(".tree__item__sub", null, true);
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
    this.props.updateModelProperty(this.props.id, true, "isDirty");
  }

  collapseAll() {
    TreeDiagramHelpers.expandOrCollapseNodes(".tree__item__sub", null, false);
    UIHelpers.scrollToXandY(0, 0);
    this.props.updateModelProperty(this.props.id, true, "isDirty");
  }

  async exportToPdf() {
    let multiCoef = 263.6;

    var d = document.getElementById("diagram");
    await this.props.setReportIsRendered(true);

    if (d !== null) {
      const pdfOptions = {
        width: d.scrollWidth * multiCoef + 25 * multiCoef,
        height: d.scrollHeight * multiCoef + 25 * multiCoef,
        printBackground: true, //this.props.settings.printColors,
        filename: this.props.name
      };
      ipcRenderer &&
        ipcRenderer.once("app:exportToPdfFinished", async () => {
          await this.props.setReportIsRendered(false);
        });
      ipcRenderer && ipcRenderer.send("app:exportToPdf", pdfOptions);
    }
  }

  showAccount() {
    this.props.history.push("/account");
  }

  showConnections() {
    if (this.props.tableModalIsDisplayed) {
      this.props.toggleTableModal();
    }
    if (this.props.relationModalIsDisplayed) {
      this.props.toggleRelationModal();
    }
    if (this.props.newModelModalIsDisplayed) {
      this.props.toggleNewModelModal();
    }
    if (this.props.tipsModalIsDisplayed) {
      this.props.toggleTipsModal();
    }
    if (this.props.columnModalIsDisplayed) {
      this.props.toggleColumnModal();
    }
    if (this.props.textEditorModalIsDisplayed) {
      this.props.toggleTextEditorModal();
    }
    this.props.history.push("/connections");
  }

  upgradeConnections(connectionsToProcess) {
    return Object.keys(connectionsToProcess)
      .map((key) => connectionsToProcess[key])
      .map((item) => initNewUndefinedProperties(item))
      .reduce((r, i) => {
        r[i.id] = i;
        return r;
      }, {});
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
      ipcRenderer.send("modelsList:getModelsListFromFile");
      ipcRenderer.once("modelsList:fetchModelsList", async (event, message) => {
        var dataToProcess = JSON.parse(message);
        await this.props.fetchModelsList(dataToProcess);
      });
    } else {
      const modelsListData = localStorage.getItem("dataxmodels");
      await this.props.fetchModelsList(JSON.parse(modelsListData));
    }
  }

  async handleChangeModelLineGraphics() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__CHANGE_MODEL_LINE_GRAPHICS
    );
    try {
      const linegraphics =
        this.props.activeDiagramObject &&
        this.props.activeDiagramObject.linegraphics;
      var lg = "basic";
      if (linegraphics === "basic") {
        lg = "detailed";
      }
      await this.props.updateDiagramProperty(
        this.props.match.params.did,
        lg,
        "linegraphics"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async toggleFinder() {
    await this.props.toggleFinder();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
    if (this.props.finderIsDisplayed) {
      TreeDiagramHelpers.focusFindOnDiagramInput();
    }
  }

  toggleSqlModal() {
    this.props.toggleSqlModal();
  }

  toggleReportModal() {
    if (isDebug([DEV_DEBUG])) {
      this.props.toggleReportModal();
    } else {
      if (
        isFeatureAvailable(
          this.props.profile.availableFeatures,
          Features.REPORTS,
          this.props.profile
        )
      ) {
        this.props.toggleReportModal();
      } else {
        this.props.toggleBuyProModal();
      }
    }
  }

  async onUndoClick() {
    await this.props.undo(
      getHistoryContext(this.props.history, this.props.match)
    );
  }

  onCopyClick() {
    this.props.setObjectsCopyList();
  }

  async onPasteClick() {
    if (this.props.objectsCopyList) {
      await this.props.copySelectedTables(
        this.props.objectsCopyList,
        this.props
      );
    }
  }

  diagramItems() {
    return this.props.activeDiagramObject.diagramItems;
  }

  async alignItems(alignTo) {
    if (_.size(this.props.selections) > 0) {
      var side = "x";
      var value = 50;
      var xleft = [];
      var xright = [];
      var ytop = [];
      var ybottom = [];
      var isMax = false;

      _.forEach(this.props.selections, (sel) => {
        const list = this.diagramItems();
        const obj = list[sel.objectId];
        if (obj) {
          xleft = [...xleft, obj.x];
          xright = [...xright, obj.x + obj.gWidth];
          ytop = [...ytop, obj.y];
          ybottom = [...ybottom, obj.y + obj.gHeight];
        }
      });

      if (alignTo === "left") {
        side = "x";
        value = Math.min(...xleft);
      } else if (alignTo === "right") {
        side = "x";
        value = Math.max(...xright);
        isMax = true;
      } else if (alignTo === "top") {
        side = "y";
        value = Math.min(...ytop);
      } else if (alignTo === "hcenter") {
        side = "x";
        value =
          Math.min(...xleft) + (Math.max(...xright) - Math.min(...xleft)) / 2;
        isMax = "middle";
      } else if (alignTo === "vcenter") {
        side = "y";
        value =
          Math.min(...ytop) + (Math.max(...ybottom) - Math.min(...ytop)) / 2;
        isMax = "middle";
      } else {
        side = "y";
        value = Math.max(...ybottom);
        isMax = true;
      }

      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.TOOLBAR__ALIGN_ITEMS
      );
      try {
        await this.props.alignItems(side, value, isMax);
      } finally {
        await this.props.finishTransaction();
      }
    }
  }

  async resizeItems(prop, minMax) {
    if (_.size(this.props.selections) > 0) {
      var gw = [];
      var gh = [];
      var value;

      _.map(this.props.selections, (sel) => {
        gw = [
          ...gw,
          this.props.activeDiagramObject.diagramItems[sel.objectId].gWidth
        ];
        gh = [
          ...gh,
          this.props.activeDiagramObject.diagramItems[sel.objectId].gHeight
        ];
      });
      if (prop === "width") {
        if (minMax === "max") {
          value = Math.max(...gw);
        } else {
          value = Math.min(...gw);
        }
      } else {
        if (minMax === "max") {
          value = Math.max(...gh);
        } else {
          value = Math.min(...gh);
        }
      }
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.TOOLBAR__RESIZE_ITEMS
      );
      try {
        await this.props.resizeItems(prop, value);
      } finally {
        await this.props.finishTransaction();
      }
    }
  }

  async autoSize() {
    if (_.size(this.props.selections) > 0) {
      const selected = _.map(this.props.selections, (obj) => obj.objectId);
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.TOOLBAR__SWITCH_LOCK_DIMENSIONS
      );
      try {
        await this.props.switchLockDimensions(selected, true);
      } finally {
        await this.props.finishTransaction();
      }
    }
  }

  async lockDimensions() {
    if (_.size(this.props.selections) > 0) {
      const selected = _.map(this.props.selections, (obj) => obj.objectId);
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.TOOLBAR__SWITCH_LOCK_DIMENSIONS
      );
      try {
        await this.props.switchLockDimensions(selected, false);
      } finally {
        await this.props.finishTransaction();
      }
    }
  }

  onSelectionClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
  }

  async onShowModalClick() {
    if (
      JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
      this.props.match.params.cid
    ) {
      await this.props.toggleColumnModal();
    }
    if (this.props.match.params.id && !this.props.columnModalIsDisplayed)
      this.props.toggleTableModal();
    if (this.props.match.params.rid) this.props.toggleRelationModal();
    if (this.props.match.params.nid) this.props.toggleNoteModal();
    if (this.props.match.params.oid) this.props.toggleOtherObjectModal();
    if (this.props.match.params.lid) this.props.toggleLineModal();
  }

  onAddNoteClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ADD_NOTE);
  }

  onAddOtherObjectClick(otherObjectType) {
    this.props.setDiagramAreaMode("add" + otherObjectType);
  }

  changeDisplayMode(mode) {
    this.props.setDisplayMode(mode);
  }

  async changeSchemaDisplay() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__SCHEMA_DISPLAY
    );
    try {
      await this.props.updateModelProperty(this.props.id, true, "isDirty");
      await this.props.updateModelProperty(
        this.props.id,
        !this.props.schemaContainerIsDisplayed,
        "schemaContainerIsDisplayed"
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "schemaContainerIsDisplayed",
        byUser: false
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  async toggleDisplayProperty(propName) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__DISPLAY_TOGGLE_PROPERTY
    );
    try {
      await this.props.updateModelProperty(this.props.id, true, "isDirty");
      await this.props.updateModelProperty(
        this.props.id,
        !this.props[propName],
        propName
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "toggleDisplayProperty",
        byUser: false
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  async changeCardinalityDisplay() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__CARDINALITY_DISPLAY
    );
    try {
      await this.props.updateModelProperty(this.props.id, true, "isDirty");

      await this.props.updateModelProperty(
        this.props.id,
        !this.props.cardinalityIsDisplayed,
        "cardinalityIsDisplayed"
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "cardinalityIsDisplayed",
        byUser: false
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  async changeEstimatedSizeDisplay() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__ESTIMATED_SIZE_DISPLAY
    );
    try {
      await this.props.updateModelProperty(this.props.id, true, "isDirty");

      await this.props.updateModelProperty(
        this.props.id,
        !this.props.estimatedSizeIsDisplayed,
        "estimatedSizeIsDisplayed"
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "estimatedSizeIsDisplayed",
        byUser: false
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  async changeDisplayEmbeddedInParents() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__DISPLAY_ENBEDDED_IN_PARENTS
    );
    try {
      await this.props.updateModelProperty(this.props.id, true, "isDirty");
      await this.props.updateModelProperty(
        this.props.id,
        !this.props.embeddedInParentsIsDisplayed,
        "embeddedInParentsIsDisplayed"
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "embeddedInParentsIsDisplayed",
        byUser: false
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  onAddRelationClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ADD_RELATION);
  }

  onAddImplementsClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ADD_IMPLEMENTS);
  }

  onAddLineClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ADD_LINE);
  }

  onAddRelationHasClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ADD_RELATION_BELONGS);
  }

  async newModel() {
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_TOGGLE_NEW_MODEL_MODAL
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      await this.props.toggleNewModelModal();
    }
  }

  onDeleteClick() {
    // Delete table
    if (this.props.match.params.id) {
      this.props.toggleConfirmDelete();
    }
    // Delete relation
    if (this.props.match.params.rid) {
      this.props.toggleConfirmDeleteRelation();
    }
    if (this.props.match.params.lid) {
      this.props.toggleConfirmDeleteLine();
    }
    if (this.props.match.params.nid) {
      this.props.toggleConfirmDelete();
    }
    if (this.props.match.params.oid) {
      this.props.toggleConfirmDelete();
    }
  }

  showButtonCaption(caption) {
    if (!this.props.showButtonCaptions) {
      return <div className="im-toolbar-caption">{caption}</div>;
    } else {
      return "";
    }
  }

  showActiveFlag(param) {
    if (param) {
      return <i className="im-icon-FullCircle im-toolbar-item-selected" />;
    } else {
      return "";
    }
  }

  disableForMissingModel() {
    return;
  }

  async addJsonSchemaGlobalObject(type) {
    await await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__ADD_JSON_SCHEMA_GLOBAL_OBJECT
    );
    try {
      await this.props.addJsonSchemaGlobalObject(type);
    } finally {
      await this.props.finishTransaction();
    }
  }

  renderPerseidTreeDiagramDisplay({
    isEnabledToolbarItem,
    missingModel,
    hideSmall
  }) {
    return (
      this.props.activeDiagramObject?.type === "treediagram" && (
        <>
          <ToolbarButton
            showCaption={this.props.settings.showToolbarCaptions}
            caption={`Display descriptions`}
            onClick={this.toggleDisplayProperty.bind(this, "showDescriptions")}
            isEnabled={isEnabledToolbarItem}
            customCss={missingModel + hideSmall}
            isSelected={this.props.showDescriptions !== false}
            tooltipClass="im-tooltip-right"
            data-testid={TEST_ID.TOOLBAR.DISPLAY.SHOW_DESCRIPTIONS}
          />
          <ToolbarButton
            showCaption={this.props.settings.showToolbarCaptions}
            caption={`Display specifications`}
            onClick={this.toggleDisplayProperty.bind(
              this,
              "showSpecifications"
            )}
            isEnabled={isEnabledToolbarItem}
            customCss={missingModel + hideSmall}
            isSelected={this.props.showSpecifications !== false}
            tooltipClass="im-tooltip-right"
            data-testid={TEST_ID.TOOLBAR.DISPLAY.SHOW_SPECIFICATIONS}
          />
        </>
      )
    );
  }

  renderPerseidDisplay({ isEnabledToolbarItem, missingModel, hideSmall }) {
    return (
      <>
        {JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
          <div className="toolbar-container  toolbar-container-display">
            <div className="toolbar-wrapper">
              <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
                <ToolbarButton
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Display"
                  icon="im-icon-DisplayMode"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel + hideSmall + " im-relative "}
                  tooltip={"Select display mode"}
                  isSelected={false}
                  tooltipClass="im-tooltip-right"
                  data-testid={TEST_ID.TOOLBAR.DISPLAY.DROPDOWN}
                />
                <div className="toolbar-dropdown-area drop">
                  {this.renderPerseidTreeDiagramDisplay({
                    isEnabledToolbarItem,
                    missingModel,
                    hideSmall
                  })}
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={`Display locally referenced`}
                    onClick={this.toggleDisplayProperty.bind(
                      this,
                      "showLocallyReferenced"
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    isSelected={this.props.showLocallyReferenced !== false}
                    tooltipClass="im-tooltip-right"
                    data-testid={
                      TEST_ID.TOOLBAR.DISPLAY.SHOW_LOCALLY_REFERENCED
                    }
                  />
                </div>
              </ToolbarDropdown>
            </div>
          </div>
        )}
      </>
    );
  }

  render() {
    const isEnabledToolbarItem = this.props.match.params.mid ? true : false;
    const missingModel = this.props.match.params.mid ? "" : " im-disabled";
    const isMainDiagram =
      this.props.activeDiagramObject && this.props.activeDiagramObject.main;

    const isTreeDiagram =
      this.props.activeDiagramObject &&
      this.props.activeDiagramObject.type &&
      this.props.activeDiagramObject.type === "treediagram";

    const enabledIconStateCssMainDiagram =
      (this.props.match.params.id ||
        this.props.match.params.oid ||
        this.props.match.params.nid) &&
      isMainDiagram
        ? " "
        : " im-disabled";
    const enabledIconStateCssSubItem =
      _.size(_.filter(this.props.selections, ["objectType", "table"])) > 0
        ? " "
        : " im-disabled";

    const availableInTreeDiagram =
      this.props.activeDiagramObject?.type === "treediagram"
        ? " "
        : " im-disabled";

    const selectionExists = _.size(this.props.selections) > 0;
    const multiSelectionExists = _.size(this.props.selections) >= 2;

    const isNotActiveEditableObject =
      !this.props.match.params.id &&
      !this.props.match.params.rid &&
      !this.props.match.params.oid &&
      !this.props.match.params.lid &&
      !this.props.match.params.nid &&
      _.size(this.props.selections) < 1;
    const enabledIconStateCssTableRel = isNotActiveEditableObject
      ? " im-disabled"
      : " ";
    const isActiveEditableObject = !isNotActiveEditableObject;
    const canBeSaved = this.props.isDirty;

    const enabledIconStateCanBeSaved = this.props.isDirty
      ? " "
      : " im-disabled";

    const isCopy = _.size(this.props.selections) >= 1;
    const enabledIconStateCssCopy =
      _.size(this.props.selections) < 1 ? " im-disabled" : "";

    const enabledIconStateCssPaste =
      !isEnabledToolbarItem === true ? " im-disabled" : "";

    const isUndo = this.props.pivotUndo >= 0;
    const enabledIconStateCssUndo = isUndo === false ? " im-disabled" : "";
    const enabledIconStateCssAlign = !multiSelectionExists
      ? " im-disabled"
      : "";
    const enabledIconStateCssResize = !multiSelectionExists
      ? " im-disabled"
      : "";
    const hideSmall = " im-hide-small";

    var toolbarHeight = { padding: "5px" };
    return (
      <div tabIndex={0} className="toolbar" style={toolbarHeight}>
        {(isFeatureAvailable(
          this.props.profile.availableFeatures,
          Features.CONNECTIONS,
          this.props.profile
        ) ||
          isFeatureAvailable(
            this.props.profile.availableFeatures,
            Features.DISABLED_CONNECTIONS,
            this.props.profile
          )) && (
          <div className="toolbar-container toolbar-container-connections">
            <>
              <div className="toolbar-wrapper">
                <ToolbarButton
                  id="toolbar-btn-connections"
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Connections"
                  tooltip="Show existing connections"
                  onClick={this.showConnections.bind(this)}
                  icon="im-icon-ShowData16"
                  isEnabled={true}
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.CONNECTIONS}
                />
              </div>
              <div className="toolbar-item-divider" />
            </>
          </div>
        )}
        <div className="toolbar-container toolbar-container-projects">
          <div className="toolbar-wrapper">
            <ToolbarButton
              id="toolbar-btn-projects"
              showCaption={this.props.settings.showToolbarCaptions}
              caption="Projects"
              tooltip="Show existing projects"
              onClick={this.showModels.bind(this)}
              icon="im-icon-Projects"
              isEnabled={true}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.PROJECTS}
            />

            <ToolbarButton
              id="toolbar-btn-new-project"
              showCaption={this.props.settings.showToolbarCaptions}
              caption="New"
              tooltip={"Create new " + this.props.localization.L_MODEL}
              onClick={this.newModel.bind(this)}
              icon="im-icon-New"
              isEnabled={true}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.NEW}
            />

            {isElectron() ? (
              <ToolbarButton
                id="toolbar-btn-open-project"
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Open"
                tooltip={
                  "Open " + this.props.localization.L_MODEL + " from file"
                }
                onClick={() =>
                  this.props.executeOpenAction(
                    this.props.history,
                    this.props.match
                  )
                }
                icon="im-icon-Open"
                isEnabled={true}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.OPEN}
              />
            ) : (
              ""
            )}

            <ToolbarButton
              id="toolbar-btn-save-project"
              showCaption={this.props.settings.showToolbarCaptions}
              caption="Save"
              tooltip={" Save " + this.props.localization.L_MODEL + " to file"}
              onClick={() =>
                this.props.saveModel(ipcRenderer, false, () => {
                  // testing purpose
                })
              }
              icon="im-icon-Save"
              isEnabled={canBeSaved}
              customCss={enabledIconStateCanBeSaved}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.SAVE}
            />

            <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
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
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Export diagram to PDF"
                  onClick={this.exportToPdf.bind(this)}
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.GENERATE_PDF}
                />
                {this.props.type !== ModelTypes.SEQUELIZE && (
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Generate HTML report"
                    onClick={this.toggleReportModal.bind(this)}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel}
                    tooltipClass="im-tooltip-left"
                    data-testid={TEST_ID.TOOLBAR.GENERATE_HTML_REPORT}
                  />
                )}
              </div>
            </ToolbarDropdown>
          </div>
          <div className="toolbar-item-divider" />
        </div>
        <div className="toolbar-container toolbar-container-objects">
          <div className="toolbar-wrapper">
            <ToolbarButton
              showCaption={this.props.settings.showToolbarCaptions}
              caption="Select"
              onClick={this.onSelectionClick.bind(this)}
              icon="im-icon-Arrow"
              isEnabled={isEnabledToolbarItem}
              customCss={missingModel}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.SELECTION}
              //tooltip={"Use CTRL + mouse to select mutliple objects"}
            />
            {this.props.type === "GRAPHQL" ? (
              <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
                <ToolbarButton
                  data-testid={TEST_ID.TOOLBAR.ADD_FROM_SUBMENU}
                  onClick={this.onSelectionClick.bind(this)}
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Add item"
                  icon="im-icon-Add"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltipClass="im-tooltip-right"
                  isSelected={
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_TABLE ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_INPUT ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_INTERFACE ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_UNION ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_ENUM ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_SCALAR ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_MUTATION ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_QUERY ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_OTHER
                  }
                />
                <div className="toolbar-dropdown-area-left drop">
                  <ToolbarButton
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_TABLE
                    }
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={_.upperFirst(this.props.localization.L_TABLE)}
                    onClick={this.props.onAddClick.bind(this)}
                    icon="im-icon-Table"
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel}
                    tooltipClass="im-tooltip-left"
                    data-testid={TEST_ID.TOOLBAR.TYPE}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={_.upperFirst(this.props.localization.L_INPUT)}
                    onClick={this.props.onAddInputClick.bind(this)}
                    isEnabled={isEnabledToolbarItem}
                    icon="im-icon-Type"
                    customCss={missingModel + hideSmall}
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_INPUT
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.INPUT}
                  />

                  <ToolbarButton
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_INTERFACE
                    }
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={_.upperFirst(this.props.localization.L_INTERFACE)}
                    onClick={this.props.onAddInterfaceClick.bind(this)}
                    icon="im-icon-Interface"
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel}
                    tooltipClass="im-tooltip-left"
                    data-testid={TEST_ID.TOOLBAR.INTERFACE}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={_.upperFirst(this.props.localization.L_UNION)}
                    onClick={this.props.onAddUnionClick.bind(
                      this,
                      OtherObjectTypes.Union
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    icon="im-icon-Union"
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_UNION
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.UNION}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={OtherObjectTypes.Enum}
                    onClick={this.onAddOtherObjectClick.bind(
                      this,
                      OtherObjectTypes.Enum
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_ENUM
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.OTHER.ENUM}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={OtherObjectTypes.Scalar}
                    onClick={this.onAddOtherObjectClick.bind(
                      this,
                      OtherObjectTypes.Scalar
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_SCALAR
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.OTHER.SCALAR}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={OtherObjectTypes.Mutation}
                    onClick={this.onAddOtherObjectClick.bind(
                      this,
                      OtherObjectTypes.Mutation
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_MUTATION
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.OTHER.MUTATION}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={OtherObjectTypes.Query}
                    onClick={this.onAddOtherObjectClick.bind(
                      this,
                      OtherObjectTypes.Query
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_QUERY
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.OTHER.QUERY}
                  />
                </div>
              </ToolbarDropdown>
            ) : (
              ""
            )}

            {JsonSchemaHelpers.isJSONSchemaModelType(this.props.type) ? (
              <>
                <ToolbarButton
                  isSelected={false}
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption={"Subschema"}
                  onClick={this.addJsonSchemaGlobalObject.bind(
                    this,
                    TableObjectTypesJson.OBJECT
                  )}
                  icon="im-icon-Table"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltip={"Click to define new subschema "}
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.OBJECT}
                />
                <ToolbarButton
                  isSelected={false}
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption={"External ref"}
                  onClick={this.addJsonSchemaGlobalObject.bind(
                    this,
                    TableObjectTypesJson.REF
                  )}
                  icon="im-icon-Type"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltip={"Click to create a new external ref "}
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.REF}
                />
              </>
            ) : (
              ""
            )}

            {this.props.type !== "GRAPHQL" &&
            !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_TABLE
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
                onClick={this.props.onAddClick.bind(this)}
                icon="im-icon-Table"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click diagram area to create a new " +
                  this.props.localization.L_TABLE
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.TABLE}
              />
            ) : (
              ""
            )}

            {this.props.type === "PG" ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_COMPOSITE
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(this.props.localization.L_COMPOSITE)}
                onClick={this.props.onAddCompositeClick.bind(this)}
                icon="im-icon-Table"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click diagram area to create a new " +
                  this.props.localization.L_COMPOSITE
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.COMPOSITE}
              />
            ) : (
              ""
            )}

            {this.props.type === "MONGODB" ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_DOCUMENT
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
                onClick={this.props.onAddEmbeddableClick.bind(this)}
                icon="im-icon-Type"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click diagram area to create a new " +
                  this.props.localization.L_TABLE_EMBEDDABLE
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.DOCUMENT}
              />
            ) : (
              ""
            )}

            {this.props.type === "MONGOOSE" ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_DOCUMENT
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
                onClick={this.props.onAddEmbeddableClick.bind(this)}
                icon="im-icon-Type"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click diagram area to create a new " +
                  this.props.localization.L_TABLE_EMBEDDABLE
                }
                tooltipClass="im-toonAddClickoltip-left"
                data-testid={TEST_ID.TOOLBAR.NESTED_TYPE}
              />
            ) : (
              ""
            )}

            {this.props.type === ModelTypes.MARIADB ||
            this.props.type === ModelTypes.MYSQL ||
            this.props.type === ModelTypes.LOGICAL ||
            this.props.type === "SQLITE" ||
            this.props.type === "PG" ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_DOCUMENT
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
                onClick={this.props.onAddEmbeddableClick.bind(this)}
                icon="im-icon-Type"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click diagram area to create a new " +
                  this.props.localization.L_TABLE_EMBEDDABLE
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.JSON}
              />
            ) : (
              ""
            )}

            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_RELATION
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(
                  this.props.localization.L_RELATION_BUTTON
                )}
                onClick={this.onAddRelationClick.bind(this)}
                icon="im-icon-Relation"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click parent " +
                  this.props.localization.L_TABLE +
                  ", then child " +
                  this.props.localization.L_TABLE +
                  " to create a new " +
                  this.props.localization.L_RELATION
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.RELATION}
              />
            )}

            {this.props.type === "GRAPHQL" ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_IMPLEMENTS
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(
                  this.props.localization.L_IMPLEMENTS_BUTTON
                )}
                onClick={this.onAddImplementsClick.bind(this)}
                icon="im-icon-RelationDashed"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click on interface, then on target " +
                  this.props.localization.L_TABLE
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.IMPLEMENTS}
              />
            ) : (
              ""
            )}

            {this.props.type === "SEQUELIZE" ? (
              <ToolbarButton
                isSelected={
                  this.props.currentDiagramAreaMode ===
                  DiagramAreaMode.ADD_RELATION_BELONGS
                }
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(
                  this.props.localization.L_RELATION_BUTTON2
                )}
                onClick={this.onAddRelationHasClick.bind(this)}
                icon="im-icon-RelationDashed"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={
                  "Click parent " +
                  this.props.localization.L_TABLE +
                  ", then child " +
                  this.props.localization.L_TABLE +
                  " to create a new " +
                  this.props.localization.L_RELATION
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.RELATION_BELONGS}
              />
            ) : (
              ""
            )}

            {!isTreeDiagram && (
              <>
                <ToolbarButton
                  isSelected={
                    this.props.currentDiagramAreaMode ===
                    DiagramAreaMode.ADD_LINE
                  }
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption={_.upperFirst(this.props.localization.L_LINE_BUTTON)}
                  onClick={this.onAddLineClick.bind(this)}
                  icon="im-icon-Line"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltip={
                    "Click one object and then another " +
                    " to create a new " +
                    this.props.localization.L_LINE
                  }
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.LINE}
                />

                <ToolbarButton
                  isSelected={
                    this.props.currentDiagramAreaMode ===
                    DiagramAreaMode.ADD_NOTE
                  }
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Note"
                  onClick={this.onAddNoteClick.bind(this)}
                  icon="im-icon-Note"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltip="Click diagram area to create a new note "
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.NOTE}
                />
              </>
            )}

            {this.props.type !== "GRAPHQL" &&
            !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
              <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
                <ToolbarButton
                  onClick={this.onSelectionClick.bind(this)}
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Other"
                  icon="im-icon-Script"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltip={"Click diagram area to create a new item"}
                  tooltipClass="im-tooltip-right"
                  isSelected={
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_OTHER ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_VIEW ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_FUNCTION ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_PROCEDURE ||
                    this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_TRIGGER
                  }
                  data-testid={TEST_ID.TOOLBAR.OTHER.DROPDOWN}
                />
                <div className="toolbar-dropdown-area drop">
                  {this.props.type === ModelTypes.MARIADB ||
                  this.props.type === ModelTypes.MYSQL ||
                  this.props.type === "SQLITE" ||
                  this.props.type === "PG" ||
                  this.props.type === "MONGODB" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add " + OtherObjectTypes.View}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.View
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_VIEW
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.VIEW}
                    />
                  ) : (
                    ""
                  )}

                  {this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add Materialized View"}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.MaterializedView
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_MATERIALIZED_VIEW
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.MATERIALIZED_VIEW}
                    />
                  ) : (
                    ""
                  )}

                  {this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add Domain"}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Domain
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_DOMAIN
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.DOMAIN}
                    />
                  ) : (
                    ""
                  )}
                  {this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add Type"}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.TypeOther
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_TYPE_OTHER
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.OTHER_TYPE}
                    />
                  ) : (
                    ""
                  )}
                  {this.props.type === "PG" ||
                  this.props.type === ModelTypes.MONGOOSE ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add Enum"}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Enum
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_ENUM
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.ENUM}
                    />
                  ) : (
                    ""
                  )}
                  {this.props.type === ModelTypes.MARIADB ||
                  this.props.type === ModelTypes.MYSQL ||
                  this.props.type === "PG" ||
                  this.props.type === "MONGODB" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add " + OtherObjectTypes.Function}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Function
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_FUNCTION
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.FUNCTION}
                    />
                  ) : (
                    ""
                  )}
                  {this.props.type === ModelTypes.MARIADB ||
                  this.props.type === ModelTypes.MYSQL ||
                  this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add " + OtherObjectTypes.Procedure}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Procedure
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_PROCEDURE
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.PROCEDURE}
                    />
                  ) : (
                    ""
                  )}

                  {this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add " + OtherObjectTypes.Rule}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Rule
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_RULE
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.RULE}
                    />
                  ) : (
                    ""
                  )}

                  {this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add Policy"}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Policy
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_POLICY
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.POLICY}
                    />
                  ) : (
                    ""
                  )}

                  {this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add " + OtherObjectTypes.Sequence}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Sequence
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_SEQUENCE
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.SEQUENCE}
                    />
                  ) : (
                    ""
                  )}

                  {this.props.type === ModelTypes.MARIADB ||
                  this.props.type === ModelTypes.MYSQL ||
                  this.props.type === "SQLITE" ||
                  this.props.type === "PG" ? (
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption={"Add " + OtherObjectTypes.Trigger}
                      onClick={this.onAddOtherObjectClick.bind(
                        this,
                        OtherObjectTypes.Trigger
                      )}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDiagramAreaMode ===
                        DiagramAreaMode.ADD_TRIGGER
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.OTHER.TRIGGER}
                    />
                  ) : (
                    ""
                  )}
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption={"Add " + OtherObjectTypes.Other}
                    onClick={this.onAddOtherObjectClick.bind(
                      this,
                      OtherObjectTypes.Other
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    isSelected={
                      this.props.currentDiagramAreaMode ===
                      DiagramAreaMode.ADD_OTHER
                    }
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.OTHER.OTHER}
                  />
                </div>
              </ToolbarDropdown>
            ) : (
              ""
            )}
          </div>
          <div className="toolbar-item-divider" />
        </div>

        <div className="toolbar-container toolbar-container-edit">
          <div className="toolbar-wrapper">
            <ToolbarButton
              showCaption={this.props.settings.showToolbarCaptions}
              caption="Edit"
              onClick={this.onShowModalClick.bind(this)}
              icon="im-icon-Edit"
              isEnabled={isActiveEditableObject && isEnabledToolbarItem}
              customCss={missingModel + " " + enabledIconStateCssTableRel}
              tooltip={
                "Edit selected " +
                this.props.localization.L_TABLE +
                ", " +
                this.props.localization.L_RELATION +
                " or note"
              }
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.EDIT}
            />

            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Delete"
                onClick={this.onDeleteClick.bind(this)}
                icon="im-icon-Trash"
                isEnabled={isActiveEditableObject && isEnabledToolbarItem}
                customCss={missingModel + " " + enabledIconStateCssTableRel}
                tooltip={
                  "Delete selected " +
                  this.props.localization.L_TABLE +
                  ", " +
                  this.props.localization.L_TABLE_EMBEDDABLE +
                  ", " +
                  this.props.localization.L_RELATION +
                  " or note"
                }
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.DELETE}
              />
            )}

            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Copy"
                onClick={this.onCopyClick.bind(this)}
                icon="im-icon-Copy"
                isEnabled={isCopy && isEnabledToolbarItem}
                customCss={
                  missingModel + " " + enabledIconStateCssCopy + hideSmall
                }
                tooltip={"Copy objects to clipboard"}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.COPY}
              />
            )}

            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Paste"
                onClick={this.onPasteClick.bind(this)}
                icon="im-icon-Paste"
                isEnabled={isEnabledToolbarItem}
                customCss={
                  missingModel + " " + enabledIconStateCssPaste + hideSmall
                }
                tooltip={"Paste objects from clipboard to model"}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.PASTE}
              />
            )}

            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Show"
                onClick={this.props.onToggleVisibilityClick.bind(
                  this,
                  this.props.history,
                  this.props.match
                )}
                icon="im-icon-Visibility"
                isEnabled={
                  isMainDiagram && selectionExists && isEnabledToolbarItem
                }
                customCss={
                  missingModel +
                  " " +
                  enabledIconStateCssMainDiagram +
                  hideSmall
                }
                tooltip={"Show or hide selected object"}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.SHOW_HIDE}
              />
            )}

            <ToolbarButton
              showCaption={this.props.settings.showToolbarCaptions}
              caption={
                isDebug([DEV_DEBUG])
                  ? this.props.pivotUndo + "," + this.props.pivotRedo
                  : "Undo"
              }
              onClick={this.onUndoClick.bind(this)}
              icon="im-icon-Undo"
              isEnabled={isUndo && isEnabledToolbarItem}
              customCss={missingModel + " " + enabledIconStateCssUndo}
              tooltip={"Undo actions"}
              tooltipClass="im-tooltip-left"
              data-testid={TEST_ID.TOOLBAR.UNDO}
            />
          </div>
          <div className="toolbar-item-divider" />
          {!isTreeDiagram && (
            <>
              <div className="toolbar-wrapper">
                <ToolbarDropdown isEnabled={multiSelectionExists}>
                  <ToolbarButton
                    id="toolbar-btn-align-left"
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Align"
                    icon="im-icon-AlignLeft"
                    isEnabled={multiSelectionExists && isEnabledToolbarItem}
                    customCss={
                      missingModel +
                      " " +
                      enabledIconStateCssAlign +
                      hideSmall +
                      " im-relative "
                    }
                    tooltip={"Align items"}
                    isSelected={false}
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.ALIGN.DROPDOWN}
                  />
                  <div className="toolbar-dropdown-area drop">
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Left"
                      onClick={this.alignItems.bind(this, "left")}
                      icon="im-icon-AlignLeft16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.ALIGN.LEFT}
                    />

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Right"
                      onClick={this.alignItems.bind(this, "right")}
                      icon="im-icon-AlignRight16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.ALIGN.RIGHT}
                    />

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Top"
                      onClick={this.alignItems.bind(this, "top")}
                      icon="im-icon-AlignTop16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.ALIGN.TOP}
                    />

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Bottom"
                      onClick={this.alignItems.bind(this, "bottom")}
                      icon="im-icon-AlignBottom16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.ALIGN.BOTTOM}
                    />
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Vertical center"
                      onClick={this.alignItems.bind(this, "hcenter")}
                      icon="im-icon-AlignVerticalCenter16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.ALIGN.HCENTER}
                    />
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Horizontal center"
                      onClick={this.alignItems.bind(this, "vcenter")}
                      icon="im-icon-AlignHorizontalCenter16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.ALIGN.VCENTER}
                    />
                  </div>
                </ToolbarDropdown>

                <ToolbarDropdown isEnabled={multiSelectionExists}>
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Resize"
                    icon="im-icon-SameWidth16"
                    isEnabled={multiSelectionExists && isEnabledToolbarItem}
                    customCss={
                      missingModel +
                      " " +
                      enabledIconStateCssResize +
                      hideSmall +
                      " im-relative "
                    }
                    tooltip={"Set equal size"}
                    isSelected={false}
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.RESIZE.DROPDOWN}
                  />
                  <div className="toolbar-dropdown-area drop">
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Max width"
                      onClick={this.resizeItems.bind(this, "width", "max")}
                      icon="im-icon-SameWidth16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.RESIZE.MAX_WIDTH}
                    />

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Max height"
                      onClick={this.resizeItems.bind(this, "height", "max")}
                      icon="im-icon-SameHeight16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.RESIZE.MAX_HEIGHT}
                    />

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Min width"
                      onClick={this.resizeItems.bind(this, "width", "min")}
                      icon="im-icon-SameWidth16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.RESIZE.MIN_WIDTH}
                    />

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Min height"
                      onClick={this.resizeItems.bind(this, "height", "min")}
                      icon="im-icon-SameHeight16"
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.RESIZE.MIN_HEIGHT}
                    />
                    <div className="toolbar-separator-wrapper">
                      <div className="toolbar-separator" />
                    </div>
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Auto size"
                      onClick={this.autoSize.bind(this)}
                      icon="im-icon-ShowChildren16"
                      isEnabled={selectionExists && isEnabledToolbarItem}
                      customCss={
                        missingModel +
                        " " +
                        enabledIconStateCssSubItem +
                        hideSmall
                      }
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.RESIZE.AUTOSIZE}
                    />
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Lock dimensions"
                      onClick={this.lockDimensions.bind(this)}
                      icon="im-icon-ShowChildren16"
                      isEnabled={selectionExists && isEnabledToolbarItem}
                      customCss={
                        missingModel +
                        " " +
                        enabledIconStateCssSubItem +
                        hideSmall
                      }
                      isSelected={false}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.RESIZE.LOCK_DIMENSIONS}
                    />
                  </div>
                </ToolbarDropdown>
              </div>
              <div className="toolbar-item-divider" />
            </>
          )}

          {isTreeDiagram && (
            <div className="toolbar-wrapper">
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Expand all"
                onClick={this.expandAll.bind(this)}
                icon="im-icon-PlusCircle16"
                isEnabled={true}
                customCss={missingModel + availableInTreeDiagram}
                tooltip={"Expand all"}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.EXPAND_ALL}
              />
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Collapse all"
                onClick={this.collapseAll.bind(this)}
                icon="im-icon-MinusCircle16"
                isEnabled={true}
                customCss={missingModel + availableInTreeDiagram}
                tooltip={"Collapse all"}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.COLLAPSE_ALL}
              />
            </div>
          )}
        </div>

        {isTreeDiagram && (
          <div className="toolbar-container toolbar-container-find">
            <div className="toolbar-wrapper">
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Find"
                onClick={this.toggleFinder.bind(this)}
                icon="im-icon-Search16"
                isEnabled={true}
                customCss={missingModel + availableInTreeDiagram}
                tooltip={"Find on diagram (CTRL+F)"}
                isSelected={isTreeDiagram && this.props.finderIsDisplayed}
                tooltipClass="im-tooltip-left"
                data-testid={TEST_ID.TOOLBAR.FINDER}
              />
            </div>
          </div>
        )}

        {this.props.type !== ModelTypes.LOGICAL ? (
          <div className="toolbar-container toolbar-container-code">
            <div className="toolbar-wrapper">
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption={_.upperFirst(this.props.localization.L_SCRIPT)}
                onClick={this.toggleSqlModal.bind(this)}
                icon="im-icon-ShowDescription"
                isEnabled={isEnabledToolbarItem}
                customCss={missingModel}
                tooltip={"Generate " + this.props.localization.L_SCRIPT}
                tooltipClass="im-tooltip-right"
                data-testid={TEST_ID.TOOLBAR.SCRIPT}
              />
            </div>
          </div>
        ) : (
          ""
        )}

        {this.renderPerseidDisplay({
          isEnabledToolbarItem,
          missingModel,
          hideSmall,
          isTreeDiagram
        })}

        {!isTreeDiagram && (
          <div className="toolbar-container  toolbar-container-display">
            <div className="toolbar-wrapper">
              <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
                <ToolbarButton
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Layout"
                  icon="im-icon-Layout"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel + hideSmall + " im-relative "}
                  tooltip={"Rearrange the diagram"}
                  isSelected={false}
                  tooltipClass="im-tooltip-right"
                  data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.DROPDOWN}
                />
                <div className="toolbar-dropdown-area drop">
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Parent-Child Layout"
                    onClick={this.props.autolayout.bind(
                      this,
                      "parent-children-grid",
                      this.props.match,
                      this.props.history
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.PARENT_CHILD}
                  />
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Grid Layout"
                    onClick={this.props.autolayout.bind(
                      this,
                      "simple-grid",
                      this.props.match,
                      this.props.history
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.GRID}
                  />

                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Tree Layout"
                    onClick={this.props.autolayout.bind(
                      this,
                      "simple-tree",
                      this.props.match,
                      this.props.history
                    )}
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall}
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.TREE}
                  />
                </div>
              </ToolbarDropdown>

              {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                <ToolbarButton
                  showCaption={this.props.settings.showToolbarCaptions}
                  caption="Line mode"
                  onClick={this.handleChangeModelLineGraphics.bind(this)}
                  icon="im-icon-LineMode"
                  isEnabled={isEnabledToolbarItem}
                  customCss={missingModel}
                  tooltip={"Change line mode"}
                  isSelected={
                    !!this.props.activeDiagramObject &&
                    this.props.activeDiagramObject.linegraphics === "basic"
                  }
                  tooltipClass="im-tooltip-left"
                  data-testid={TEST_ID.TOOLBAR.LINE_MODE}
                />
              )}

              {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                <ToolbarDropdown isEnabled={isEnabledToolbarItem}>
                  <ToolbarButton
                    showCaption={this.props.settings.showToolbarCaptions}
                    caption="Display"
                    icon="im-icon-DisplayMode"
                    isEnabled={isEnabledToolbarItem}
                    customCss={missingModel + hideSmall + " im-relative "}
                    tooltip={"Select display mode"}
                    isSelected={false}
                    tooltipClass="im-tooltip-right"
                    data-testid={TEST_ID.TOOLBAR.DISPLAY.DROPDOWN}
                  />
                  <div className="toolbar-dropdown-area drop">
                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Metadata"
                      onClick={this.changeDisplayMode.bind(this, "metadata")}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={this.props.currentDisplayMode === "metadata"}
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.DISPLAY.METADATA}
                    />
                    {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                      <ToolbarButton
                        showCaption={this.props.settings.showToolbarCaptions}
                        caption="Sample data"
                        onClick={this.changeDisplayMode.bind(this, "data")}
                        isEnabled={isEnabledToolbarItem}
                        customCss={missingModel + hideSmall}
                        isSelected={this.props.currentDisplayMode === "data"}
                        tooltipClass="im-tooltip-right"
                        data-testid={TEST_ID.TOOLBAR.DISPLAY.DATA}
                      />
                    )}

                    <ToolbarButton
                      showCaption={this.props.settings.showToolbarCaptions}
                      caption="Description"
                      onClick={this.changeDisplayMode.bind(this, "description")}
                      isEnabled={isEnabledToolbarItem}
                      customCss={missingModel + hideSmall}
                      isSelected={
                        this.props.currentDisplayMode === "description"
                      }
                      tooltipClass="im-tooltip-right"
                      data-testid={TEST_ID.TOOLBAR.DISPLAY.DESCRIPTION}
                    />
                    {!JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
                      this.props.type !== ModelTypes.LOGICAL &&
                      this.props.type !== ModelTypes.GRAPHQL &&
                      this.props.type !== ModelTypes.MONGOOSE && (
                        <ToolbarButton
                          showCaption={this.props.settings.showToolbarCaptions}
                          caption="Indexes"
                          onClick={this.changeDisplayMode.bind(this, "indexes")}
                          isEnabled={isEnabledToolbarItem}
                          customCss={missingModel + hideSmall}
                          isSelected={
                            this.props.currentDisplayMode === "indexes"
                          }
                          tooltipClass="im-tooltip-right"
                          data-testid={TEST_ID.TOOLBAR.DISPLAY.INDEXES}
                        />
                      )}

                    <div className="toolbar-separator-wrapper">
                      <div className="toolbar-separator" />
                    </div>

                    {this.props.type !== ModelTypes.SEQUELIZE &&
                      !isTreeDiagram && (
                        <ToolbarButton
                          showCaption={this.props.settings.showToolbarCaptions}
                          caption={`Display nested objects`}
                          onClick={this.changeDisplayEmbeddedInParents.bind(
                            this
                          )}
                          isEnabled={isEnabledToolbarItem}
                          customCss={missingModel + hideSmall}
                          isSelected={
                            this.props.embeddedInParentsIsDisplayed !== false
                          }
                          tooltipClass="im-tooltip-right"
                          data-testid={TEST_ID.TOOLBAR.DISPLAY.NESTED_OBJECTS}
                        />
                      )}

                    {(this.props.type === ModelTypes.PG ||
                      this.props.type === ModelTypes.MARIADB ||
                      this.props.type === ModelTypes.MYSQL) && (
                      <>
                        <ToolbarButton
                          showCaption={this.props.settings.showToolbarCaptions}
                          caption={`Display ${
                            this.props.type === ModelTypes.PG
                              ? "schema"
                              : "database"
                          }`}
                          onClick={this.changeSchemaDisplay.bind(this)}
                          isEnabled={isEnabledToolbarItem}
                          customCss={missingModel + hideSmall}
                          isSelected={
                            this.props.schemaContainerIsDisplayed !== false
                          }
                          tooltipClass="im-tooltip-right"
                          data-testid={TEST_ID.TOOLBAR.DISPLAY.SCHEMA}
                        />
                      </>
                    )}

                    {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                      <ToolbarButton
                        showCaption={this.props.settings.showToolbarCaptions}
                        caption={`Display cardinality captions`}
                        onClick={this.changeCardinalityDisplay.bind(this)}
                        isEnabled={isEnabledToolbarItem}
                        customCss={missingModel + hideSmall}
                        isSelected={this.props.cardinalityIsDisplayed === true}
                        tooltipClass="im-tooltip-right"
                        data-testid={
                          TEST_ID.TOOLBAR.DISPLAY.CARDINALITY_CAPTIONS
                        }
                      />
                    )}

                    {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                      <ToolbarButton
                        showCaption={this.props.settings.showToolbarCaptions}
                        caption={`Display estimated sizes`}
                        onClick={this.changeEstimatedSizeDisplay.bind(this)}
                        isEnabled={isEnabledToolbarItem}
                        customCss={missingModel + hideSmall}
                        isSelected={
                          this.props.estimatedSizeIsDisplayed === true
                        }
                        tooltipClass="im-tooltip-right"
                        data-testid={TEST_ID.TOOLBAR.DISPLAY.ESTIMATED_SIZES}
                      />
                    )}
                  </div>
                </ToolbarDropdown>
              )}
            </div>

            <div className="toolbar-item-divider" />
          </div>
        )}
        <div className="toolbar-item-spacer" />
        <div className="toolbar-container toolbar-container-settings">
          <div className="toolbar-wrapper">
            <ToolbarButton
              showCaption={this.props.settings.showToolbarCaptions}
              caption="Settings"
              onClick={this.showConfig.bind(this)}
              icon="im-icon-Configuration"
              isEnabled={true}
              tooltip="Change application settings"
              tooltipClass="im-tooltip-right"
              data-testid={TEST_ID.TOOLBAR.SETTINGS}
            />
          </div>

          {isElectron() && <div className="toolbar-item-divider" />}
          {isElectron() && (
            <div className="toolbar-wrapper">
              <ToolbarButton
                showCaption={this.props.settings.showToolbarCaptions}
                caption="Account"
                onClick={this.showAccount.bind(this)}
                icon="im-icon-User"
                isEnabled={true}
                tooltip="Set user information"
                tooltipClass="im-tooltip-right"
                data-testid={TEST_ID.TOOLBAR.ACCOUNT}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: state.diagrams[state.model.activeDiagram],
    relations: state.relations,
    selections: state.selections,
    objectsCopyList: state.objectsCopyList,
    notes: state.notes,
    lines: state.lines,
    otherObjects: state.otherObjects,
    localization: state.localization,
    settings: state.settings,
    profile: state.profile,
    modelsSamples: state.modelsSamples,
    unsavedChangesModalIsDisplayed: state.ui.unsavedChangesModalIsDisplayed,
    eulaModalIsDisplayed: state.ui.eulaModalIsDisplayed,
    tipsModalIsDisplayed: state.ui.tipsModalIsDisplayed,
    tableModalIsDisplayed: state.ui.tableModalIsDisplayed,
    columnModalIsDisplayed: state.ui.columnModalIsDisplayed,
    relationModalIsDisplayed: state.ui.relationModalIsDisplayed,
    newModelModalIsDisplayed: state.ui.newModelModalIsDisplayed,
    indexAssistantModalIsDisplayed: state.ui.indexAssistantModalIsDisplayed,
    zoom: state.ui.zoom,
    showButtonCaptions: state.ui.showButtonCaptions,
    currentDiagramAreaMode: state.ui.currentDiagramAreaMode,
    pivotUndo: state.undoRedo.pivotUndo,
    pivotRedo: state.undoRedo.pivotRedo,
    isDirty: state.model.isDirty,
    name: state.model.name,
    id: state.model.id,
    schemaContainerIsDisplayed: state.model.schemaContainerIsDisplayed,
    cardinalityIsDisplayed: state.model.cardinalityIsDisplayed,
    estimatedSizeIsDisplayed: state.model.estimatedSizeIsDisplayed,
    embeddedInParentsIsDisplayed: state.model.embeddedInParentsIsDisplayed,
    type: state.model.type,
    currentDisplayMode: state.ui.currentDisplayMode,
    textEditorModalIsDisplayed: state.ui.textEditorModalIsDisplayed,
    finderIsDisplayed: state.ui.finderIsDisplayed,
    showDescriptions: state.model.showDescriptions,
    showSpecifications: state.model.showSpecifications,
    showLocallyReferenced: state.model.showLocallyReferenced
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleTableModal: toggleTableModal,
        toggleRelationModal: toggleRelationModal,
        toggleSqlModal: toggleSqlModal,
        fetchTable: fetchTable,
        addTable: addTable,
        fetchRelation: fetchRelation,
        deleteRelation: deleteRelation,
        setDiagramAreaMode: setDiagramAreaMode,
        setDisplayMode: setDisplayMode,
        fetchModel: fetchModel,
        toggleAsideRight: toggleAsideRight,
        toggleAsideLeft: toggleAsideLeft,
        toggleFeedbackModal: toggleFeedbackModal,
        clearTables: clearTables,
        clearModel: clearModel,
        toggleConfirmDelete: toggleConfirmDelete,
        toggleConfirmDeleteRelation: toggleConfirmDeleteRelation,
        toggleConfirmDeleteLine: toggleConfirmDeleteLine,
        toggleEulaModal: toggleEulaModal,
        fetchRelations: fetchRelations,
        toggleNewModelModal: toggleNewModelModal,
        toggleTipsModal: toggleTipsModal,
        setDiagramLoading: setDiagramLoading,
        setActiveTask: setActiveTask,
        undo: undo,
        redo: redo,
        setObjectsCopyList: setObjectsCopyList,
        copySelectedTables: copySelectedTables,
        fetchModelsList: fetchModelsList,
        fetchModelsSamples: fetchModelsSamples,
        toggleNoteModal: toggleNoteModal,
        updateModelProperty: updateModelProperty,
        updateSettingsProperty: updateSettingsProperty,
        fetchProfileLicense: fetchProfileLicense,
        fetchProfileAppInfo: fetchProfileAppInfo,
        toggleTrialModal: toggleTrialModal,
        fetchSettings: fetchSettings,
        toggleUnsavedChangesModal: toggleUnsavedChangesModal,
        addNotification: addNotification,
        updateTableProperty: updateTableProperty,
        updateNoteProperty: updateNoteProperty,
        fetchAppLatestVersion: fetchAppLatestVersion,
        fetchNote: fetchNote,
        alignItems: alignItems,
        resizeItems: resizeItems,
        updateOtherObjectProperty: updateOtherObjectProperty,
        fetchOtherObject: fetchOtherObject,
        toggleLineModal: toggleLineModal,
        toggleOtherObjectModal: toggleOtherObjectModal,
        fetchConnections: fetchConnections,
        provideModel: provideModel,
        updateDiagramProperty: updateDiagramProperty,
        setUnsavedChangesModalAction: setUnsavedChangesModalAction,
        fetchProfileFeatures: fetchProfileFeatures,
        toggleReportModal: toggleReportModal,
        toggleBuyProModal: toggleBuyProModal,
        toggleRestoreModelModal: toggleRestoreModelModal,
        isFeatureAvailable: isFeatureAvailable,
        switchLockDimensions: switchLockDimensions,
        toggleIndexAssistantModal: toggleIndexAssistantModal,
        setReportIsRendered: setReportIsRendered,
        finishTransaction,
        startTransaction,
        storeSettings,
        saveModel,
        autolayout,
        onAddClick,
        onAddCompositeClick,
        onAddEmbeddableClick,
        onAddInterfaceClick,
        onAddUnionClick,
        onAddInputClick,
        onToggleVisibilityClick,
        executeOpenAction,
        addJsonSchemaGlobalObject,
        setForcedRender,
        toggleColumnModal,
        toggleTextEditorModal,
        toggleFinder
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Toolbar)
);
