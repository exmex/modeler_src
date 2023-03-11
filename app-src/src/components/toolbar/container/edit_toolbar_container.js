import { DEV_DEBUG, isDebug } from "../../../web_env";
import { ModelTypes, TEST_ID } from "common";
import { collapseAll, expandAll } from "../../../actions/treediagram";
import { deleteFromDiagram, edit } from "../../../actions/modals";
import { isMeteor, isMoon } from "../../../helpers/features/features";

import AlignDropdown from "../dropdown/align_dropdown";
import { Component } from "react";
import React from "react";
import ResizeDropdown from "../dropdown/resize_dropdown";
import ToolbarButton from "../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copySelectedTables } from "../../../actions/copy";
import { getActiveDiagramObject } from "../../../selectors/selector_diagram";
import { getHistoryContext } from "../../../helpers/history/history";
import { onToggleVisibilityClick } from "../../../actions/ui";
import { setObjectsCopyList } from "../../../actions/objects_copies";
import { undo } from "../../../actions/undoredo";
import { withRouter } from "react-router";

class EditToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderERDDiagramAlignResizeButtons() {
    return (
      <div className="toolbar-wrapper">
        <AlignDropdown toolbarOptions={this.props.toolbarOptions} />
        <ResizeDropdown toolbarOptions={this.props.toolbarOptions} />
      </div>
    );
  }

  renderTreeDiagramDisclosureButtons() {
    return (
      <>
        <div className="toolbar-wrapper">
          {this.renderExpandAll()}
          {this.renderCollapseAll()}
        </div>
      </>
    );
  }

  renderCollapseAll() {
    const availableInTreeDiagram =
      this.props.activeDiagramObject?.type === "treediagram"
        ? " "
        : " im-disabled";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Collapse all"
        onClick={this.props.collapseAll.bind(this)}
        icon="im-icon-MinusCircle16"
        isEnabled={true}
        customCss={
          this.props.toolbarOptions.missingModel + availableInTreeDiagram
        }
        tooltip={"Collapse all"}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.COLLAPSE_ALL}
      />
    );
  }

  renderExpandAll() {
    const availableInTreeDiagram =
      this.props.activeDiagramObject?.type === "treediagram"
        ? " "
        : " im-disabled";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Expand all"
        onClick={this.props.expandAll.bind(this)}
        icon="im-icon-PlusCircle16"
        isEnabled={true}
        customCss={
          this.props.toolbarOptions.missingModel + availableInTreeDiagram
        }
        tooltip={"Expand all"}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.EXPAND_ALL}
      />
    );
  }

  renderUndoButton() {
    const isUndo = this.props.pivotUndo >= 0;
    const enabledIconStateCssUndo = isUndo === false ? " im-disabled" : "";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={
          isDebug([DEV_DEBUG])
            ? this.props.pivotUndo + "," + this.props.pivotRedo
            : "Undo"
        }
        onClick={this.props.undo.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        icon="im-icon-Undo"
        isEnabled={isUndo && this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel + " " + enabledIconStateCssUndo
        }
        tooltip={"Undo actions"}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.UNDO}
      />
    );
  }

  renderToggleVisibilityButton() {
    const isMainDiagram = this.props.activeDiagramObject?.main === true;
    const enabledIconStateCssMainDiagram =
      (this.props.match.params.id ||
        this.props.match.params.oid ||
        this.props.match.params.nid) &&
      isMainDiagram
        ? " "
        : " im-disabled";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Show"
        onClick={this.props.onToggleVisibilityClick.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        icon="im-icon-Visibility"
        isEnabled={
          isMainDiagram &&
          this.props.toolbarOptions.selectionExists &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssMainDiagram +
          this.props.toolbarOptions.hideSmall
        }
        tooltip={"Show or hide selected object"}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.SHOW_HIDE}
      />
    );
  }

  async paste() {
    if (this.props.objectsCopyList) {
      await this.props.copySelectedTables(
        this.props.objectsCopyList,
        this.props
      );
    }
  }

  renderPasteButton() {
    const enabledIconStateCssPaste =
      !this.props.toolbarOptions.isEnabledToolbarItem === true
        ? " im-disabled"
        : "";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Paste"
        onClick={this.paste.bind(this)}
        icon="im-icon-Paste"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssPaste +
          this.props.toolbarOptions.hideSmall
        }
        tooltip={"Paste objects from clipboard to model"}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.PASTE}
      />
    );
  }

  renderCopyButton() {
    const isCopy = _.size(this.props.selections) >= 1 && !this.props.match.params.cid;
    const enabledIconStateCssCopy =
      _.size(this.props.selections) < 1 || this.props.match.params.cid ? " im-disabled" : "";

    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Copy"
        onClick={this.props.setObjectsCopyList.bind(this)}
        icon="im-icon-Copy"
        isEnabled={isCopy && this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssCopy +
          this.props.toolbarOptions.hideSmall
        }
        tooltip={"Copy objects to clipboard"}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.COPY}
      />
    );
  }

  renderDeleteButton() {
    const enabledIconStateCssTableRel = this.props.toolbarOptions
      .isNotActiveEditableObject
      ? " im-disabled"
      : " ";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Delete"
        onClick={this.props.deleteFromDiagram.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        icon="im-icon-Trash"
        isEnabled={
          this.props.toolbarOptions.isActiveEditableObject &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssTableRel
        }
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
    );
  }

  renderEditButton() {
    const enabledIconStateCssTableRel = this.props.toolbarOptions
      .isNotActiveEditableObject
      ? " im-disabled"
      : " ";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Edit"
        onClick={this.props.edit.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        icon="im-icon-Edit"
        isEnabled={
          this.props.toolbarOptions.isActiveEditableObject &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssTableRel
        }
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
    );
  }

  render() {
    const isDeleteCopyPasteVisibileEnabled =
      this.props.type === ModelTypes.LOGICAL ||
      this.props.type === ModelTypes.GRAPHQL ||
      this.props.type === ModelTypes.SEQUELIZE ||
      this.props.type === ModelTypes.PG ||
      this.props.type === ModelTypes.MARIADB ||
      this.props.type === ModelTypes.MYSQL ||
      this.props.type === ModelTypes.SQLITE ||
      this.props.type === ModelTypes.MSSQL ||
      this.props.type === ModelTypes.MONGODB ||
      this.props.type === ModelTypes.MONGOOSE;

    const isERDDiagram = this.props.activeDiagramObject?.type === "erd";
    const isTreeDiagram =
      this.props.activeDiagramObject?.type === "treediagram";
    return (
      <div className="toolbar-container toolbar-container-edit">
        <div className="toolbar-wrapper">
          {this.renderEditButton()}

          {isDeleteCopyPasteVisibileEnabled && (
            <>
              {this.renderDeleteButton()}
              {this.renderCopyButton()}
              {this.renderPasteButton()}
              {this.renderToggleVisibilityButton()}
            </>
          )}
          {this.renderUndoButton()}
        </div>
        <div className="toolbar-item-divider" />
        {isERDDiagram && (
          <>
            {this.renderERDDiagramAlignResizeButtons()}
            <div className="toolbar-item-divider" />
          </>
        )}

        {isTreeDiagram && this.renderTreeDiagramDisclosureButtons()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    localization: state.localization,
    activeDiagramObject: getActiveDiagramObject(state),
    pivotUndo: state.undoRedo.pivotUndo,
    pivotRedo: state.undoRedo.pivotRedo,
    selections: state.selections,
    objectsCopyList: state.objectsCopyList,
    profile: state.profile,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        collapseAll,
        expandAll,
        edit,
        deleteFromDiagram,
        setObjectsCopyList,
        onToggleVisibilityClick,
        undo,
        copySelectedTables
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditToolbarContainer)
);
