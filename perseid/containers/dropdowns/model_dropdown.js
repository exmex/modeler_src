import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSubMenu,
  ContextMenuWrapper
} from "../../components/common/context_menu";
import {
  DROPDOWN_MENU,
  closeDropDownMenu,
  setDiagramAreaMode,
  setForcedRender,
  toggleAddDiagramsByContainersModal,
  toggleBrowserSettingsModal,
  toggleDiagramItemsModal,
  toggleModelModal
} from "../../actions/ui";
import { DiagramAreaMode, ModelTypes } from "../../enums/enums";
import { Features, isFeatureAvailable } from "../../helpers/features/features";
import React, { Component } from "react";
import {
  addJsonSchemaGlobalObject,
  updateTableProperty
} from "../../actions/tables";
import {
  addVisibleObjectsToSelection,
  clearSelection
} from "../../actions/selections";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  getContainerName,
  isToggleAddDiagramsByContainersActionEnabled,
  isToggleAddDiagramsByContainersActionVisible
} from "../../actions/diagrams";
import { hideAllEmbeddable, updateModelProperty } from "../../actions/model";

import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { OtherObjectTypes } from "../../classes/class_other_object";
import { TEST_ID } from "common";
import { TableObjectTypesJson } from "../../platforms/jsonschema/class_table_jsonschema";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addNotification } from "../../actions/notifications";
import { bindActionCreators } from "redux";
import { checkLimit } from "../../components/license_limitation";
import { connect } from "react-redux";
import { copySelectedTables } from "../../actions/copy";
import { getActiveDiagramObject } from "../../selectors/selector_diagram";
import { getHistoryContext } from "../../helpers/history/history";
import isElectron from "is-electron";
import moment from "moment";
import onClickOutside from "react-onclickoutside";
import { setObjectsCopyList } from "../../actions/objects_copies";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class ModelDropDown extends Component {
  constructor(props) {
    super(props);
    this.openDiagramItems = this.openDiagramItems.bind(this);
    this.toggleBrowserSettingsModal =
      this.toggleBrowserSettingsModal.bind(this);
  }

  isVisible = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu?.type === DROPDOWN_MENU.PROJECT;

  handleClickOutside = () => {
    if (this.isVisible()) {
      this.props.closeDropDownMenu();
    }
  };

  onEditClick() {
    this.props.toggleModelModal();
    this.props.closeDropDownMenu();
  }

  toggleBrowserSettingsModal() {
    this.props.toggleBrowserSettingsModal();
    this.props.closeDropDownMenu();
  }

  async toggleSelectionSide() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DROPDOWN__UPDATE_MODEL_PROPERTY_SIDE_SELECTION
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        !this.props.sideSelections,
        "sideSelections"
      );
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  selectAll() {
    this.props.addVisibleObjectsToSelection(
      this.props.match.url,
      this.props.history,
      this.props.match.params.mid,
      this.props.match.params.did
    );
    this.props.closeDropDownMenu();
  }

  deselectAll() {
    this.props.clearSelection(true);
    this.props.setForcedRender({ domToModel: false });
    this.props.closeDropDownMenu();
  }

  renderNewObjectsMenu() {
    if (
      this.props.type === ModelTypes.MARIADB ||
      this.props.type === ModelTypes.MYSQL
    ) {
      return this.renderNewObjectsMenuMySQLFamily();
    }
    if (this.props.type === "SQLITE") {
      return this.renderNewObjectsMenuSQLite();
    }
    if (this.props.type === "PG") {
      return this.renderNewObjectsMenuPG();
    }
    if (this.props.type === "MONGODB") {
      return this.renderNewObjectsMenuMongoDB();
    }
    if (this.props.type === "MONGOOSE") {
      return this.renderNewObjectsMenuMongoose();
    }
    if (this.props.type === "SEQUELIZE") {
      return this.renderNewObjectsMenuSequelize();
    }
    if (this.props.type === "GRAPHQL") {
      return this.renderNewObjectsMenuGraphQl();
    }
    if (this.props.type === "LOGICAL") {
      return this.renderNewObjectsMenuLogical();
    }
    if (this.props.type === ModelTypes.JSONSCHEMA) {
      return this.renderNewObjectsMenuJsonSchema();
    }
    if (this.props.type === ModelTypes.FULLJSON) {
      return this.renderNewObjectsMenuJsonSchema();
    }
  }

  renderNewObjectsMenuMongoose() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick(DiagramAreaMode.ADD_TABLE)}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick(DiagramAreaMode.ADD_DOCUMENT)}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Enum)}
                caption={OtherObjectTypes.Enum}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuMongoDB() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick(DiagramAreaMode.ADD_TABLE)}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick(DiagramAreaMode.ADD_DOCUMENT)}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.View)}
                caption={OtherObjectTypes.View}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Function)}
                caption={OtherObjectTypes.Function}
              />

              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuGraphQl() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick("addTable")}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addInput")}
                caption={_.upperFirst(this.props.localization.L_INPUT)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addInterface")}
                caption={_.upperFirst(this.props.localization.L_INTERFACE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addUnion")}
                caption={_.upperFirst(this.props.localization.L_UNION)}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Enum)}
                caption={OtherObjectTypes.Enum}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Scalar)}
                caption={OtherObjectTypes.Scalar}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Mutation)}
                caption={OtherObjectTypes.Mutation}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Query)}
                caption={OtherObjectTypes.Query}
              />

              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuSequelize() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick("addTable")}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuMySQLFamily() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick("addTable")}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addDocument")}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
              />

              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.View)}
                caption={OtherObjectTypes.View}
              />

              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Function)}
                caption={OtherObjectTypes.Function}
              />
              <ContextMenuItem
                fn={() =>
                  this.onAddOtherObjectClick(OtherObjectTypes.Procedure)
                }
                caption={OtherObjectTypes.Procedure}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Trigger)}
                caption={OtherObjectTypes.Trigger}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuSQLite() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick("addTable")}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addDocument")}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.View)}
                caption={OtherObjectTypes.View}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Trigger)}
                caption={OtherObjectTypes.Trigger}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuLogical() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick("addTable")}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addDocument")}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuJsonSchema() {
    return (
      <ContextMenu>
        <>
          <ContextMenuItem
            fn={this.addJsonSchemaGlobalObject.bind(
              this,
              TableObjectTypesJson.OBJECT
            )}
            caption={"New subschema"}
          />
          <ContextMenuItem
            fn={this.addJsonSchemaGlobalObject.bind(
              this,
              TableObjectTypesJson.REF
            )}
            caption={"New external ref"}
          />
          <ContextMenuSeparator />
        </>
      </ContextMenu>
    );
  }

  renderNewObjectsMenuPG() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSubMenu
            subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
              this.props.dropDownMenu?.position?.x,
              200
            )}
            caption="Add new"
          >
            <>
              <ContextMenuItem
                fn={() => this.onAddClick("addTable")}
                caption={_.upperFirst(this.props.localization.L_TABLE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addComposite")}
                caption={_.upperFirst(this.props.localization.L_COMPOSITE)}
              />
              <ContextMenuItem
                fn={() => this.onAddClick("addDocument")}
                caption={_.upperFirst(
                  this.props.localization.L_TABLE_EMBEDDABLE
                )}
              />

              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.View)}
                caption={OtherObjectTypes.View}
              />

              <ContextMenuItem
                fn={() =>
                  this.onAddOtherObjectClick(OtherObjectTypes.MaterializedView)
                }
                caption={_.upperFirst(
                  this.props.localization.L_MATERIALIZED_VIEW
                )}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Domain)}
                caption={OtherObjectTypes.Domain}
              />
              <ContextMenuItem
                fn={() =>
                  this.onAddOtherObjectClick(OtherObjectTypes.TypeOther)
                }
                caption={_.upperFirst(this.props.localization.L_TYPE)}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Enum)}
                caption={OtherObjectTypes.Enum}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Function)}
                caption={OtherObjectTypes.Function}
              />

              <ContextMenuItem
                fn={() =>
                  this.onAddOtherObjectClick(OtherObjectTypes.Procedure)
                }
                caption={OtherObjectTypes.Procedure}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Rule)}
                caption={OtherObjectTypes.Rule}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Policy)}
                caption={OtherObjectTypes.Policy}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Sequence)}
                caption={OtherObjectTypes.Sequence}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Trigger)}
                caption={OtherObjectTypes.Trigger}
              />
              <ContextMenuItem
                fn={() => this.onAddOtherObjectClick(OtherObjectTypes.Other)}
                caption={OtherObjectTypes.Other}
              />
              <ContextMenuSeparator />
              <ContextMenuItem
                fn={() => this.onAddNoteClick()}
                caption="Note"
              />
            </>
          </ContextMenuSubMenu>
        </>
      </ContextMenu>
    );
  }

  toggleAddDiagramsByContainers(enabled) {
    if (enabled === true) {
      this.props.toggleAddDiagramsByContainersModal();
      this.props.closeDropDownMenu();
    }
  }

  renderAddDiagramsByContainersMenu() {
    const enabled = isToggleAddDiagramsByContainersActionEnabled(
      this.props.type,
      this.props.tables
    );
    const disabledText = enabled === true ? "" : " im-disabled";
    const containersName = getContainerName(this.props.type);

    return (
      isToggleAddDiagramsByContainersActionVisible(
        this.props.type,
        this.props.profile
      ) === true && (
        <ContextMenu>
          <ContextMenuSeparator />
          <ContextMenuItem
            fn={this.toggleAddDiagramsByContainers.bind(this, enabled)}
            icon="AddToDiagram"
            caption={`Add diagrams by ${containersName}`}
            divClassName={disabledText}
            dataTestId={TEST_ID.DIAGRAM.DROPDOWN_ADD_DIAGRAMS_BY_CONTAINERS}
          />
        </ContextMenu>
      )
    );
  }

  async hideAllEmbeddable(hide) {
    await this.props.hideAllEmbeddable(
      this.props.history,
      this.props.match,
      hide
    );
    await this.props.closeDropDownMenu();
  }

  renderEmbeddableObjectsMenu() {
    return (
      this.props.type !== "GRAPHQL" &&
      !JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
        <ContextMenu>
          <ContextMenuSeparator />
          <ContextMenuItem
            fn={this.hideAllEmbeddable.bind(this, false)}
            icon="Hidden16"
            caption={`Hide all ${this.props.localization.L_TABLES_EMBEDDABLE}`}
          />
          <ContextMenuItem
            fn={this.hideAllEmbeddable.bind(this, true)}
            icon="Visibility16"
            caption={`Show all ${this.props.localization.L_TABLES_EMBEDDABLE}`}
          />
        </ContextMenu>
      )
    );
  }

  renderSelectionMenu() {
    return (
      <ContextMenu>
        <ContextMenuSeparator />
        <ContextMenuItem
          fn={this.selectAll.bind(this)}
          icon="CheckBoxChecked"
          caption="Select all"
        />
        <ContextMenuItem
          fn={this.deselectAll.bind(this)}
          icon="CheckBox"
          caption="Clear selection"
          dataTestId={TEST_ID.DIAGRAM.DROPDOWN_DESELECT_ALL}
        />
      </ContextMenu>
    );
  }

  renderDiagramItemsMenu() {
    return (
      isFeatureAvailable(
        this.props.availableFeatures,
        Features.MULTIDIAGRAMS,
        this.props.profile
      ) && (
        <ContextMenu>
          <ContextMenuSeparator />
          <ContextMenuItem
            fn={this.openDiagramItems}
            icon="Edit16"
            caption="Manage diagram items"
          />
        </ContextMenu>
      )
    );
  }

  isPasteEnabled() {
    const isDiagram = this.props.match.params.mid ? true : false;
    return isDiagram && _.size(this.props.objectsCopyList) >= 1;
  }

  async paste() {
    if (this.props.objectsCopyList && this.isPasteEnabled()) {
      await this.props.copySelectedTables(
        this.props.objectsCopyList,
        this.props
      );
      await this.props.closeDropDownMenu();
    }
  }
  renderBrowserSettingsMenu() {
    return (
      <ContextMenu>
        <>
          <ContextMenuItem
            fn={this.toggleBrowserSettingsModal}
            icon=""
            caption="Side navigation settings"
          />
        </>
      </ContextMenu>
    );
  }

  renderPasteMenu() {
    return (
      <ContextMenu>
        <>
          <ContextMenuSeparator />
          <ContextMenuItem
            fn={this.paste.bind(this)}
            icon="Paste"
            caption="Paste"
            divClassName={this.isPasteEnabled() === true ? "" : "im-disabled"}
          />
        </>
      </ContextMenu>
    );
  }

  openDiagramItems() {
    this.props.toggleDiagramItemsModal();
    this.props.closeDropDownMenu();
  }

  async addJsonSchemaGlobalObject(objectType) {
    await await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DROPDOWN__ADD_JSON_SCHEMA_GLOBAL_OBJECT
    );
    try {
      this.props.addJsonSchemaGlobalObject(objectType);
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  onAddClick(modeName) {
    this.props.setDiagramAreaMode(modeName);
    if (isElectron) {
      if (checkLimit(this.props.profile, this.props.tables, true) === true) {
        this.props.addNotification({
          id: uuidv4(),
          datepast: moment().startOf("minute").fromNow(),
          datesort: moment().unix(),
          date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
          message: this.props.localization.TEXTS.FREEWARE_TABLES,
          model: this.props.name,
          type: "info",
          autohide: true,
          urlCaption: null,
          urlToOpen: null,
          urlIsExternal: false
        });
      }
    }
    this.props.closeDropDownMenu();
  }

  onAddOtherObjectClick(otherObjectType) {
    this.props.setDiagramAreaMode("add" + otherObjectType);
    this.props.closeDropDownMenu();
  }

  onAddNoteClick() {
    this.props.setDiagramAreaMode(DiagramAreaMode.ADD_NOTE);
    this.props.closeDropDownMenu();
  }

  render() {
    const isMainDiagram =
      this.props.activeDiagramObject && this.props.activeDiagramObject.main;
    if (this.isVisible()) {
      return (
        <ContextMenuWrapper
          id="im-dropdown-model"
          top={this.props.dropDownMenu.position.y}
          left={this.props.dropDownMenu.position.x}
          dataTestId={TEST_ID.DROPDOWNS.MODEL}
        >
          <>
            {this.renderNewObjectsMenu()}
            {isMainDiagram ? this.renderAddDiagramsByContainersMenu() : <></>}
            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
              this.renderSelectionMenu()}
            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
              this.renderPasteMenu()}
            {isMainDiagram
              ? this.renderEmbeddableObjectsMenu()
              : this.renderDiagramItemsMenu()}
            {this.renderBrowserSettingsMenu()}
          </>
        </ContextMenuWrapper>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    dropDownMenu: state.ui.dropDownMenu,
    localization: state.localization,
    name: state.model.name,
    type: state.model.type,
    tables: state.tables,
    profile: state.profile,
    activeDiagramObject: getActiveDiagramObject(state),
    availableFeatures: state.profile.availableFeatures,
    objectsCopyList: state.objectsCopyList
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        closeDropDownMenu,
        toggleModelModal,
        clearSelection,
        addVisibleObjectsToSelection,
        updateModelProperty,
        setDiagramAreaMode,
        addNotification,
        updateTableProperty,
        toggleDiagramItemsModal,
        toggleAddDiagramsByContainersModal,
        setObjectsCopyList,
        finishTransaction,
        startTransaction,
        hideAllEmbeddable,
        toggleBrowserSettingsModal,
        addJsonSchemaGlobalObject,
        copySelectedTables,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

var clickOutsideConfig = {
  excludeScrollbar: true
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(onClickOutside(ModelDropDown, clickOutsideConfig))
);
