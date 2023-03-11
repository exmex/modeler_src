import { Link, withRouter } from "react-router-dom";
import React, { Component } from "react";

import { bindActionCreators } from "redux";
import { clearAddToSelection } from "../actions/selections";
import { connect } from "react-redux";
import { getHistoryState } from "../helpers/history/history";
import { pathByObjecType } from "./url_navigation";
import { setForcedRender } from "../actions/ui";

class ObjLink extends Component {
  constructor(props) {
    super(props);
    this.clearAddToSelection = this.clearAddToSelection.bind(this);
  }

  clearAddToSelection() {
    const { item, objectType } = this.props.linkedItem;
    this.props.clearAddToSelection(objectType, item.id);
    this.props.setForcedRender({ domToModel: false });
  }

  render() {
    const activeId =
      this.props.match.params.id ||
      this.props.match.params.nid ||
      this.props.match.params.oid ||
      this.props.match.params.lid ||
      this.props.match.params.rid;
    const { item, objectType } = this.props.linkedItem;
    return (
      <>
        <div>
          {this.props.caption === "Name" ? (
            `${this.props.caption}:`
          ) : (
            <div className="im-text-secondary">{this.props.caption}:</div>
          )}
        </div>

        <Link
          className="im-link"
          to={pathByObjecType(
            getHistoryState(this.props.match),
            objectType,
            item
          )}
          onClick={this.clearAddToSelection}
        >
          {item.name}
        </Link>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        clearAddToSelection,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(connect(null, mapDispatchToProps)(ObjLink));
