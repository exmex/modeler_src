import React, { Component } from "react";

import { CSSTransition } from "react-transition-group";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { togglePanelExpanded } from "../actions/ui";

class CollapsiblePanel extends Component {
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

  render() {
    if (this.props.panelIsExpanded === "false") {
    }

    let classNameList = "im-list im-expanded ";
    if (this.state.isExpanded === true) {
      classNameList = "im-list im-collapsed im-h-100";
    }

    var classNameExpanded = "im-icon-Collapse16 im-normal";
    var classNameCollapsed = "im-icon-Collapse16 im-rotate";

    return (
      <div className={"im-collapsible-wrapper " + this.props.customCss}>
        <div className="im-cat-header" onClick={this.togglePanel.bind(this)}>
          <div
            onClick={this.togglePanel.bind(this)}
            className="im-cat-icon im-pointer im-no-border"
          >
            <i
              className={
                this.state.isExpanded
                  ? classNameExpanded + " im-icon-16"
                  : classNameCollapsed + " im-icon-16"
              }
            />
          </div>
          <div className="im-cat-text">{this.props.panelTitle}</div>
          <div className="im-cat-icon" />
          <div
            className="im-cat-icon"
            onClick={this.props.onClick ? this.props.onClick : this.doNothing()}
          >
            {this.props.icon ? this.props.icon : ""}
          </div>
        </div>

        <ul className={classNameList}>
          <CSSTransition
            in={this.state.isExpanded}
            classNames="example"
            key={this.props.panelKey}
            unmountOnExit
            timeout={{ enter: 500, exit: 300 }}
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

export default connect(null, mapDispatchToProps)(CollapsiblePanel);

CollapsiblePanel.propTypes = {
  panelTitle: PropTypes.string,
  panelKey: PropTypes.string,
  panelIsExpanded: PropTypes.bool
};
