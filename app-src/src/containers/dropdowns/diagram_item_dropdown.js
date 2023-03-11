import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuWrapper
} from "../../components/common/context_menu";
import {
  DROPDOWN_MENU,
  DROPDOWN_MENU_SOURCE,
  closeDropDownMenu,
  setCopiedFormat,
  toggleAddToAnotherDiagramModal,
  toggleConfirmDelete,
  toggleNoteModal,
  toggleOtherObjectModal,
  toggleTableModal
} from "../../actions/ui";
import {
  Features,
  isFeatureAvailable,
  isPerseid
} from "../../helpers/features/features";
import { ModelTypes, ObjectType } from "../../enums/enums";
import React, { Component } from "react";
import {
  addDiagramItems,
  addReferencedDiagramItems,
  applyFormatToItems,
  deleteDiagramItems,
  updateDiagramItemProperty
} from "../../actions/diagrams";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../actions/undoredo";
import {
  getActiveDiagramItems,
  getActiveDiagramObject
} from "../../selectors/selector_diagram";

import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createDiagramItem } from "../../classes/factory/class_diagram_item_factory";
import { getHistoryContext } from "../../helpers/history/history";
import onClickOutside from "react-onclickoutside";
import { setObjectsCopyList } from "../../actions/objects_copies";
import { switchLockDimensions } from "../../actions/diagram_manipulation";
import { updateNoteProperty } from "../../actions/notes";
import { updateOtherObjectProperty } from "../../actions/other_objects";
import { updateTableProperty } from "../../actions/tables";
import { withRouter } from "react-router-dom";

const TABLE = "table";
const NOTE = "note";
const OTHER_OBJECT = "other_object";
class DiagramItemDropDown extends Component {
  VISIBLE_PROPERTY = "visible";

  isVisible = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.type === DROPDOWN_MENU.DIAGRAM_ITEM;

  isDiagramSource = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.source === DROPDOWN_MENU_SOURCE.DIAGRAM;

  id = () =>
    this.props.match.params.id ||
    this.props.match.params.oid ||
    this.props.match.params.nid;
  objectById = (id) =>
    this.props.tables[id] ||
    this.props.notes[id] ||
    this.props.otherObjects[id];
  itemById = (id) => this.props.activeDiagramItems[id];
  object = () => this.objectById(this.id());
  diagramItem = () =>
    this.props.activeDiagramObject &&
    this.props.activeDiagramObject.diagramItems[this.id()];

  isMainDiagram = () =>
    this.props.activeDiagramObject && this.props.activeDiagramObject.main;
  isItemOnDiagram = () =>
    (this.isMainDiagram() && this.object() && this.object().visible) ||
    (!this.isMainDiagram() && this.diagramItem());
  isSelected = () => _.size(this.props.selections) > 0;
  isMultipleSelection = () => _.size(this.props.selections) > 1;
  containsTables = () =>
    _.find(this.props.selections, ["objectType", "table"]) !== undefined;

  selectionToObjects = () =>
    _.map(this.props.selections, (item) => ({
      item: this.objectById(item.objectId),
      objectType: item.objectType
    }));
  selectionToDiagramItems = () =>
    _.reduce(
      this.props.selections,
      (r, item) => {
        const foundDiagramItem = this.itemById(item.objectId);
        return foundDiagramItem ? [...r, foundDiagramItem] : r;
      },
      []
    );

  isDeletable() {
    return (
      (isPerseid(this.props.profile) &&
        !JsonSchemaHelpers.isSchema(this.object())) ||
      !isPerseid(this.props.profile)
    );
  }

  isNotJsonSchemaType = () =>
    !JsonSchemaHelpers.isPerseidModelType(this.props.type);

  isColumn = () => this.props.match.params.cid !== undefined;

  notOnDiagramItems = () =>
    _.map(
      _.filter(
        this.props.selections,
        ({ objectId }) =>
          (!this.isMainDiagram() && !this.itemById(objectId)) ||
          (this.isMainDiagram() && this.objectById(objectId)
            ? !this.objectById(objectId).visible
            : false)
      ),
      (item) => ({
        item: this.objectById(item.objectId),
        objectType: item.objectType
      })
    );

  handleClickOutside = (evt) => {
    if (this.isVisible()) {
      this.props.closeDropDownMenu();
    }
  };

  editClick() {
    if (this.props.match.params.id) {
      if (!this.props.match.params.cid) {
        this.props.toggleTableModal();
      }
    } else if (this.props.match.params.nid) {
      this.props.toggleNoteModal();
    } else if (this.props.match.params.oid) {
      this.props.toggleOtherObjectModal();
    }
    this.props.closeDropDownMenu();
  }

  deleteClick() {
    if (this.selectionToObjects().length > 0) {
      this.props.toggleConfirmDelete();
    }
    this.props.closeDropDownMenu();
  }

  copyFormatClick() {
    this.props.setCopiedFormat({
      background: this.diagramItem().background,
      color: this.diagramItem().color
    });
    this.props.closeDropDownMenu();
  }

  async applyFormatClick() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_APPLY_FORMAT
    );
    try {
      if (
        this.props.copiedFormat?.background !== undefined &&
        this.props.copiedFormat?.color !== undefined
      ) {
        if (this.selectionToObjects().length > 0) {
          this.props.applyFormatToItems({
            background: this.props.copiedFormat?.background,
            color: this.props.copiedFormat?.color
          });
        }
      }
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  async deleteDiagramItemClick() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_DELETE_DIAGRAM_ITEMS
    );
    try {
      await this.props.deleteDiagramItems(
        this.props.match.params.did,
        _.map(this.selectionToDiagramItems(), (item) => item.referencedItemId)
      );
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  async addDiagramItemClick() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_ADD_DIAGRAM_ITEMS
    );
    try {
      const itemsToAdd = this.notOnDiagramItems();
      for (const index of itemsToAdd.keys()) {
        const { item, objectType } = itemsToAdd[index];
        const di = createDiagramItem(item, objectType, 100, 100 * (index + 1));
        await this.props.addDiagramItems(this.props.match.params.did, [di]);
      }
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  addToAnotherDiagramClick() {
    this.props.toggleAddToAnotherDiagramModal();
    this.props.closeDropDownMenu();
  }

  async toggleVisibilityClick() {
    const modified = [];
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_TOGGLE_VISIBILITY
    );
    try {
      await Promise.all(
        this.selectionToObjects().map(async ({ item, objectType }) => {
          switch (objectType) {
            case TABLE: {
              await this.props.updateTableProperty(
                item.id,
                !item.visible,
                this.VISIBLE_PROPERTY
              );
              modified.push(item.id);
              break;
            }
            case NOTE: {
              await this.props.updateNoteProperty(
                item.id,
                !item.visible,
                this.VISIBLE_PROPERTY
              );
              modified.push(item.id);
              break;
            }
            case OTHER_OBJECT: {
              await this.props.updateOtherObjectProperty(
                item.id,
                !item.visible,
                this.VISIBLE_PROPERTY
              );
              modified.push(item.id);
              break;
            }
            default:
              break;
          }
        })
      );
      getCurrentHistoryTransaction().addResizeRequest({
        operation: "toggleVisibilityClick",
        domToModel: true,
        objects: modified
      });
    } finally {
      await this.props.finishTransaction();
    }

    this.props.closeDropDownMenu();
  }

  findInDiagram() {
    UIHelpers.findItemInDiagramAndScrollToPosition(this.id(), this.props.zoom);
    this.props.closeDropDownMenu();
  }

  copySelection() {
    this.props.setObjectsCopyList();
    this.props.closeDropDownMenu();
  }

  async autoSizeClick() {
    if (_.size(this.props.selections) > 0) {
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_SWITCH_LOCK_DIMENSIONS
      );
      try {
        const selected = _.map(this.props.selections, (obj) => obj.objectId);
        await this.props.switchLockDimensions(selected, true);
      } finally {
        await this.props.finishTransaction();
      }
    }
    this.props.closeDropDownMenu();
  }

  async lockDimensionsClick() {
    if (_.size(this.props.selections) > 0) {
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_SWITCH_LOCK_DIMENSIONS
      );
      try {
        const selected = _.map(this.props.selections, (obj) => obj.objectId);
        await this.props.switchLockDimensions(selected, false);
      } finally {
        await this.props.finishTransaction();
      }
    }
    this.props.closeDropDownMenu();
  }

  showDropDownClick() {
    this.props.closeDropDownMenu();
  }

  async addReferencedDiagramItems(
    referencedParentChildOrAll,
    objectsToIterate
  ) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_ITEM_DROPDOWN_ADD_DIAGRAM_ITEMS
    );
    try {
      await this.props.addReferencedDiagramItems(
        referencedParentChildOrAll,
        objectsToIterate
      );
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  isTableInSelection() {
    var toReturn = false;
    _.map(this.props.selections, (item) => {
      if (item.objectType === ObjectType.TABLE) {
        toReturn = true;
      }
    });
    return toReturn;
  }

  renderAddReferenced() {
    if (this.isTableInSelection()) {
      return (
        <ContextMenu>
          <ContextMenuSeparator />
          <ContextMenuItem
            fn={this.addReferencedDiagramItems.bind(
              this,
              "parents",
              this.props.selections
            )}
            icon="ShowChildren"
            caption="Add referenced parents"
          />
          <ContextMenuItem
            fn={this.addReferencedDiagramItems.bind(
              this,
              "children",
              this.props.selections
            )}
            icon="ShowParents"
            caption="Add referenced children"
          />
          <ContextMenuItem
            fn={this.addReferencedDiagramItems.bind(
              this,
              "all",
              this.props.selections
            )}
            icon=""
            caption="Add referenced objects"
          />
        </ContextMenu>
      );
    }
  }

  render() {
    if (this.isVisible() && this.isSelected()) {
      return (
        <ContextMenuWrapper
          id="im-dropdown-diagram-item"
          top={this.props.dropDownMenu.position.y}
          left={this.props.dropDownMenu.position.x}
          dataTestId={TEST_ID.DROPDOWNS.DIAGRAM_ITEM}
        >
          <>
            <ContextMenu>
              {!this.isMultipleSelection() && !this.isColumn() ? (
                <ContextMenuItem
                  fn={this.editClick.bind(this)}
                  icon="Edit16"
                  caption="Edit"
                />
              ) : undefined}
              {this.isNotJsonSchemaType() ? (
                <ContextMenuSeparator />
              ) : undefined}
              {this.isNotJsonSchemaType() &&
              this.selectionToObjects().length > 0 ? (
                <ContextMenuItem
                  fn={this.copySelection.bind(this)}
                  icon="Copy"
                  caption="Copy"
                />
              ) : undefined}
              {this.isNotJsonSchemaType() ? (
                <ContextMenuItem
                  fn={this.copyFormatClick.bind(this)}
                  icon="Empty"
                  caption="Copy format"
                />
              ) : undefined}
              {this.isNotJsonSchemaType() ? (
                <ContextMenuItem
                  fn={this.applyFormatClick.bind(this)}
                  icon="Empty"
                  caption="Apply format"
                />
              ) : undefined}
              {this.isNotJsonSchemaType() ? (
                <ContextMenuSeparator />
              ) : undefined}
              {this.isNotJsonSchemaType() &&
              !this.isDiagramSource() &&
              this.isItemOnDiagram() &&
              !this.isMultipleSelection() ? (
                <ContextMenuItem
                  fn={this.findInDiagram.bind(this)}
                  icon="Search16"
                  caption="Find in diagram"
                />
              ) : undefined}
              {(this.isNotJsonSchemaType() &&
                this.selectionToDiagramItems().length > 0) ||
              _.find(this.selectionToObjects(), ["visible", true]) !==
                undefined ? (
                <ContextMenuItem
                  fn={this.autoSizeClick.bind(this)}
                  icon=""
                  caption="Auto size"
                />
              ) : undefined}
              {this.isNotJsonSchemaType() &&
              (this.selectionToDiagramItems().length > 0 ||
                _.find(this.selectionToObjects(), ["visible", true]) !==
                  undefined) ? (
                <ContextMenuItem
                  fn={this.lockDimensionsClick.bind(this)}
                  icon=""
                  caption="Lock dimensions"
                />
              ) : undefined}

              {this.isNotJsonSchemaType() &&
              this.isMainDiagram() &&
              this.notOnDiagramItems ? (
                <ContextMenuItem
                  fn={this.toggleVisibilityClick.bind(this)}
                  icon="Visibility16"
                  caption="Show/Hide"
                />
              ) : undefined}
              {isFeatureAvailable(
                this.props.availableFeatures,
                Features.MULTIDIAGRAMS
              ) && <ContextMenuSeparator />}
              {!this.isMainDiagram() &&
              this.notOnDiagramItems().length > 0 &&
              !this.isDiagramSource() &&
              isFeatureAvailable(
                this.props.availableFeatures,
                Features.MULTIDIAGRAMS
              ) ? (
                <ContextMenuItem
                  fn={this.addDiagramItemClick.bind(this)}
                  icon="AddToDiagram"
                  caption="Add to diagram"
                />
              ) : undefined}
              {this.selectionToObjects().length > 0 &&
              isFeatureAvailable(
                this.props.availableFeatures,
                Features.MULTIDIAGRAMS
              ) ? (
                <ContextMenuItem
                  fn={this.addToAnotherDiagramClick.bind(this)}
                  icon="AddToDiagram"
                  caption="Add to another diagram"
                  dataTestId={
                    TEST_ID.DIAGRAM.ITEM.DROPDOWN_ADD_TO_ANOTHER_DIAGRAM
                  }
                />
              ) : undefined}

              {!this.isMainDiagram() &&
              this.selectionToDiagramItems().length > 0 &&
              isFeatureAvailable(
                this.props.availableFeatures,
                Features.MULTIDIAGRAMS
              )
                ? this.renderAddReferenced()
                : undefined}

              {!this.isMainDiagram() &&
              this.selectionToDiagramItems().length > 0 &&
              isFeatureAvailable(
                this.props.availableFeatures,
                Features.MULTIDIAGRAMS
              ) ? (
                <ContextMenuItem
                  fn={this.deleteDiagramItemClick.bind(this)}
                  icon="RemoveFromDiagram"
                  caption="Remove from diagram"
                />
              ) : undefined}

              {this.isDeletable() && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    fn={this.deleteClick.bind(this)}
                    icon="Trash16"
                    caption="Delete"
                  />
                </>
              )}
            </ContextMenu>
          </>
        </ContextMenuWrapper>
      );
    }
    return "";
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    notes: state.notes,
    otherObjects: state.otherObjects,
    dropDownMenu: state.ui.dropDownMenu,
    copiedFormat: state.ui.copiedFormat,
    zoom: state.ui.zoom,
    selections: state.selections,
    activeDiagramObject: getActiveDiagramObject(state),
    activeDiagramItems: getActiveDiagramItems(state),
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile,
    type: state.model.type,
    diagrams: state.diagrams
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        closeDropDownMenu,
        toggleTableModal,
        toggleNoteModal,
        toggleOtherObjectModal,
        toggleAddToAnotherDiagramModal,
        toggleConfirmDelete,
        deleteDiagramItems,
        addDiagramItems,
        updateDiagramItemProperty,
        updateTableProperty,
        updateNoteProperty,
        updateOtherObjectProperty,
        setObjectsCopyList,
        setCopiedFormat,
        applyFormatToItems,
        finishTransaction,
        startTransaction,
        switchLockDimensions,
        addReferencedDiagramItems
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
  )(onClickOutside(DiagramItemDropDown, clickOutsideConfig))
);
