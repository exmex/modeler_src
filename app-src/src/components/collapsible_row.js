import React, { Component } from "react";

import { CSSTransition } from "react-transition-group";
import Helpers from "../helpers/helpers";
import PropTypes from "prop-types";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { togglePanelExpanded } from "../actions/ui";
import { v4 as uuidv4 } from "uuid";

class CollapsibleRow extends Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: true };
  }

  togglePanel() {
    this.setState({ isExpanded: !this.state.isExpanded });
    this.props.togglePanelExpanded(this.props.panelKey, !this.state.isExpanded);
  }

  componentDidMount() {
    if (this.props.panelIsExpanded === false) {
      this.setState({ isExpanded: false });
    }
  }

  doNothing() {
    return null;
  }

  renderFromArray(array) {
    return _.map(array, (item) => {
      return (
        <div key={uuidv4()} className="im-collapsible-row-item">
          {Helpers.formatZero(item)}
        </div>
      );
    });
  }

  render() {
    let classNameList = "im-list im-expanded ";
    if (this.state.isExpanded === true) {
      classNameList = "im-list im-collapsed im-h-100";
    }

    var classNameExpanded = "im-icon-Collapse16 im-normal";
    var classNameCollapsed = "im-icon-Collapse16 im-rotate";

    return (
      <div className={"im-collapsible-wrapper " + this.props.customCss}>
        <div
          className="im-updated-items im-items-selection"
          onClick={this.togglePanel.bind(this)}
        >
          <i
            className={
              this.state.isExpanded
                ? classNameExpanded + " im-icon-16"
                : classNameCollapsed + " im-icon-16"
            }
          />
          {this.renderFromArray(this.props.panelCols)}
        </div>

        <ul className={classNameList}>
        <CSSTransition
            in={this.state.isExpanded}
            classNames="example"
            key={this.props.panelKey}
            unmountOnExit
            timeout={{ enter: 0, exit: 0 }}
          >
            {this.props.children}
          </CSSTransition>
          
        </ul>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        togglePanelExpanded: togglePanelExpanded
      },
      dispatch
    ),
    dispatch
  };
}

export default connect(null, mapDispatchToProps)(CollapsibleRow);

CollapsibleRow.propTypes = {
  panelCols: PropTypes.array,
  panelKey: PropTypes.string,
  panelIsExpanded: PropTypes.bool
};
