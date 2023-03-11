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
  findLinkInDiagramAndScrollToPosition,
  toggleConfirmDeleteLine,
  toggleLineModal
} from "../../actions/ui";
import React, { Component } from "react";

import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramItems } from "../../selectors/selector_diagram";
import onClickOutside from "react-onclickoutside";
import { withRouter } from "react-router-dom";

class LineDropDown extends Component {
  isDiagramSource = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.source === DROPDOWN_MENU_SOURCE.DIAGRAM;

  isVisible = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.type === DROPDOWN_MENU.LINE;

  handleClickOutside = (evt) => {
    if (this.isVisible()) {
      this.props.closeDropDownMenu();
    }
  };

  linkById = () => this.props.lines[this.props.match.params.lid];
  activeDiagramItems = (id) => this.props.activeDiagramItems[id];

  isLinkInDiagram() {
    const link = this.linkById();
    const parent = link && this.activeDiagramItems(link.parent);
    const child = link && this.activeDiagramItems(link.child);
    return !!parent && !!child;
  }

  findLinkInDiagram() {
    const link = this.linkById();
    const parent = link && this.activeDiagramItems(link.parent);
    const child = link && this.activeDiagramItems(link.child);
    if (!!parent && !!child) {
      this.props.findLinkInDiagramAndScrollToPosition(parent, child);
      this.props.closeDropDownMenu();
    }
  }

  onEditClick() {
    if (this.props.match.params.lid) {
      this.props.toggleLineModal();
    }

    this.props.closeDropDownMenu();
  }

  onDeleteClick() {
    if (this.props.match.params.lid) {
      this.props.toggleConfirmDeleteLine();
    }
    this.props.closeDropDownMenu();
  }

  onShowDropDownClick() {
    this.props.closeDropDownMenu();
  }

  render() {
    if (this.isVisible()) {
      if (this.props.match.params.lid) {
        return (
          <ContextMenuWrapper
            id="im-dropdown-line"
            top={this.props.dropDownMenu.position.y}
            left={this.props.dropDownMenu.position.x}
            dataTestId={TEST_ID.DROPDOWNS.LINE}
          >
            <>
              <ContextMenu>
                <ContextMenuItem
                  fn={this.onEditClick.bind(this)}
                  icon="Edit16"
                  caption="Edit"
                />
                <ContextMenuSeparator />
                <ContextMenuItem
                  fn={this.onDeleteClick.bind(this)}
                  icon="Trash16"
                  caption="Delete"
                />
                {this.isLinkInDiagram() && !this.isDiagramSource() ? (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      fn={this.findLinkInDiagram.bind(this)}
                      icon="Search16"
                      caption="Find in diagram"
                    />
                  </>
                ) : (
                  <></>
                )}
              </ContextMenu>
            </>
          </ContextMenuWrapper>
        );
      } else {
        return "";
      }
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramItems: getActiveDiagramItems(state),
    lines: state.lines,
    dropDownMenu: state.ui.dropDownMenu
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        closeDropDownMenu,
        toggleLineModal,
        toggleConfirmDeleteLine,
        findLinkInDiagramAndScrollToPosition
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
  )(onClickOutside(LineDropDown, clickOutsideConfig))
);
