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
  toggleConfirmDeleteRelation,
  toggleRelationModal
} from "../../actions/ui";
import React, { Component } from "react";

import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteRelation } from "../../actions/relations";
import { getActiveDiagramItems } from "../../selectors/selector_diagram";
import onClickOutside from "react-onclickoutside";
import { withRouter } from "react-router-dom";

class RelationDropDown extends Component {
  isDiagramSource = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.source === DROPDOWN_MENU_SOURCE.DIAGRAM;

  isVisible = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.type === DROPDOWN_MENU.RELATION;
  handleClickOutside = (evt) => {
    if (this.isVisible()) {
      this.props.closeDropDownMenu();
    }
  };

  linkById = () => this.props.relations[this.props.match.params.rid];
  objectById = (id) => getActiveDiagramItems(this.props)[id];

  isLinkInDiagram() {
    const link = this.linkById();
    const parent = this.objectById(link.parent);
    const child = this.objectById(link.child);

    return !!parent && !!child;
  }

  findLinkInDiagram() {
    const link = this.linkById();
    const parent = this.objectById(link.parent);
    const child = this.objectById(link.child);
    if (!!parent && !!child) {
      this.props.findLinkInDiagramAndScrollToPosition(parent, child);
      this.props.closeDropDownMenu();
    }
  }

  onEditClick() {
    if (this.props.match.params.rid) this.props.toggleRelationModal();
    this.props.closeDropDownMenu();
  }
  onDeleteClick() {
    if (this.props.match.params.rid) {
      this.props.toggleConfirmDeleteRelation();
    }
    this.props.closeDropDownMenu();
  }

  onShowDropDownClick() {
    this.props.closeDropDownMenu();
  }
  render() {
    if (this.isVisible()) {
      if (this.props.match.params.rid) {
        return (
          <ContextMenuWrapper
            id="im-dropdown-relation"
            top={this.props.dropDownMenu.position.y}
            left={this.props.dropDownMenu.position.x}
            dataTestId={TEST_ID.DROPDOWNS.RELATION}
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
    dropDownMenu: state.ui.dropDownMenu,
    relations: state.relations,
    diagrams: state.diagrams,
    model: state.model,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        closeDropDownMenu,
        toggleRelationModal,
        deleteRelation,
        toggleConfirmDeleteRelation,
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
  )(onClickOutside(RelationDropDown, clickOutsideConfig))
);
