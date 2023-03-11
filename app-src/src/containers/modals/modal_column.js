import React, { Component } from "react";

import { CSSTransition } from "react-transition-group";
import ColumnDetail from "../column_detail";
import Draggable from "react-draggable";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleColumnModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalColumn extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.columnModalIsDisplayed === true) {
        this.props.toggleColumnModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  onShowModalClick() {
    this.props.toggleColumnModal();
  }

  noChange() {
    return null;
  }

  render() {
    if (this.props.columnModalIsDisplayed === true) {
      if (
        this.props.tables &&
        this.props.match.params.id &&
        this.props.match.params.cid &&
        this.props.tables[this.props.match.params.id] !== undefined
      ) {
        const col = JsonSchemaHelpers.getColumnById(
          this.props.tables,
          this.props.match.params.id,
          this.props.match.params.cid
        );

        return !!col ? (
          <CSSTransition
            in={this.props.columnModalIsDisplayed}
            key="modalColumn"
            classNames="fade"
            unmountOnExit
            timeout={{ enter: 500, exit: 100 }}
          >
            <Draggable handle=".modal-header">
              <div className="modal" data-testid={TEST_ID.MODALS.COLUMN}>
                <div className="modal-header">Details - {col.name}</div>
                <div className="modal-content">
                  <ColumnDetail />
                </div>
                <div className="modal-footer">
                  <button
                    autoFocus
                    id="im-close"
                    className="im-btn-default"
                    onClick={this.onShowModalClick.bind(this)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Draggable>
          </CSSTransition>
        ) : (
          <></>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    columnModalIsDisplayed: state.ui.columnModalIsDisplayed,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleColumnModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalColumn)
);
