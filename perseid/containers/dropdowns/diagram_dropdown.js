import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuWrapper
} from "../../components/common/context_menu";
import {
  DROPDOWN_MENU,
  closeDropDownMenu,
  toggleAddDiagramsByContainersModal,
  toggleConfirmDeleteDiagram,
  toggleDiagramItemsModal,
  toggleDiagramModal
} from "../../actions/ui";
import { Features, isFeatureAvailable } from "../../helpers/features/features";
import React, { Component } from "react";
import {
  getContainerName,
  isToggleAddDiagramsByContainersActionEnabled,
  isToggleAddDiagramsByContainersActionVisible
} from "../../actions/diagrams";

import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../../selectors/selector_diagram";
import onClickOutside from "react-onclickoutside";
import { withRouter } from "react-router-dom";

class DiagramDropDown extends Component {
  isVisible = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.type === DROPDOWN_MENU.DIAGRAM;

  handleClickOutside = (evt) => {
    if (this.isVisible()) {
      this.props.closeDropDownMenu();
    }
  };

  onEditClick() {
    this.props.toggleDiagramModal();
    this.props.closeDropDownMenu();
  }

  onDiagramItemsClick() {
    this.props.toggleDiagramItemsModal();
    this.props.closeDropDownMenu();
  }

  onDeleteClick() {
    if (this.props.match.params.did !== null) {
      this.props.toggleConfirmDeleteDiagram();
    }
    this.props.closeDropDownMenu();
  }

  isMain() {
    if (this.props.match.params.did) {
      const diagram = this.props.diagrams[this.props.match.params.did];
      return diagram.main;
    }
    return false;
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
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              fn={this.toggleAddDiagramsByContainers.bind(this, enabled)}
              icon="AddToDiagram"
              iconClassName={disabledText}
              caption={`Add diagrams by ${containersName}`}
              divClassName={disabledText}
              dataTestId={
                TEST_ID.DIAGRAM_PANEL.ACTIVE_DIAGRAM
                  .DROPDOWN_ADD_DIAGRAMS_BY_CONTAINERS
              }
            />
          </>
        </ContextMenu>
      )
    );
  }

  render() {
    const isMainDiagram =
      this.props.activeDiagramObject && this.props.activeDiagramObject.main;
    if (this.isVisible()) {
      return (
        <ContextMenuWrapper
          id="im-dropdown-diagram"
          top={this.props.dropDownMenu.position.y}
          left={this.props.dropDownMenu.position.x}
          dataTestId={TEST_ID.DROPDOWNS.DIAGRAM}
        >
          <>
            <ContextMenu>
              <ContextMenuItem
                fn={this.onEditClick.bind(this)}
                dataTestId={TEST_ID.DIAGRAM_PANEL.ACTIVE_DIAGRAM.DROPDOWN_EDIT}
                icon="Edit16"
                caption="Edit"
              />

              {isFeatureAvailable(
                this.props.availableFeatures,
                Features.MULTIDIAGRAMS,
                this.props.profile
              ) &&
                this.isMain() !== true && (
                  <ContextMenuItem
                    fn={this.onDiagramItemsClick.bind(this)}
                    dataTestId={
                      TEST_ID.DIAGRAM_PANEL.ACTIVE_DIAGRAM.DROPDOWN_MANAGE_ITEMS
                    }
                    icon="Configure"
                    caption="Manage items"
                  />
                )}
              {isMainDiagram ? this.renderAddDiagramsByContainersMenu() : <></>}
              {this.isMain() !== true ? (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    fn={this.onDeleteClick.bind(this)}
                    icon="Trash16"
                    caption="Delete"
                    dataTestId={
                      TEST_ID.DIAGRAM_PANEL.ACTIVE_DIAGRAM.DROPDOWN_DELETE
                    }
                  />
                </>
              ) : undefined}
            </ContextMenu>
          </>
        </ContextMenuWrapper>
      );
    } else {
      return "";
    }
  }
}

function mapStateToProps(state) {
  return {
    diagrams: state.diagrams,
    dropDownMenu: state.ui.dropDownMenu,
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile,
    activeDiagramObject: getActiveDiagramObject(state),
    type: state.model.type,
    tables: state.tables
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleConfirmDeleteDiagram,
        toggleDiagramModal,
        toggleDiagramItemsModal,
        toggleAddDiagramsByContainersModal,
        closeDropDownMenu
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
  )(onClickOutside(DiagramDropDown, clickOutsideConfig))
);
