import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import OrderItems from "../order_items";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { getOrderedObjects } from "../../selectors/selector_order";
import { resetOrder } from "../../actions/order";
import { toggleOrderItemsModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalOrderItems extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.state = {};
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.orderItemsModalIsDisplayed === true) {
        this.props.toggleOrderItemsModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  close() {
    this.props.toggleOrderItemsModal();
  }

  async reset() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODAL_ORDER_ITEMS__RESET_ORDER
    );
    try {
      await this.props.resetOrder(this.props.type);
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (this.props.orderItemsModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.orderItemsModalIsDisplayed}
          key="ModalOrderItems"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal"
                data-testid={TEST_ID.MODALS.ORDER_ITEMS}
              >
                <div className="modal-header im-relative">Order items</div>

                <div className="modal-content modal-content-notabs">
                  <OrderItems />
                </div>

                <div className="modal-footer">
                  <button
                    className="im-btn-default im-margin-right"
                    onClick={this.reset.bind(this)}
                  >
                    Reset
                  </button>
                  <button
                    autoFocus
                    className="im-btn-default im-margin-right"
                    onClick={this.close.bind(this)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Draggable>
          </div>
        </CSSTransition>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    orderItemsModalIsDisplayed: state.ui.orderItemsModalIsDisplayed,
    type: state.model.type,
    orderedObjects:
      state.ui.orderItemsModalIsDisplayed &&
      getOrderedObjects(state.model.type)(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleOrderItemsModal,
        resetOrder,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalOrderItems)
);
