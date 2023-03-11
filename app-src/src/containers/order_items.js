import React, { Component } from "react";
import { exchangeOrder, resetOrder } from "../actions/order";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { ModelTypes } from "../enums/enums";
import { OtherObjectTypes } from "common";
import Sortable from "react-sortablejs";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { getOrderedObjects } from "../selectors/selector_order";
import { withRouter } from "react-router-dom";

class OrderItems extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  addSpacesToTypes(type) {
    switch (type) {
      case OtherObjectTypes.MaterializedView:
        return "materialized view";
      case OtherObjectTypes.UserDefinedType:
        return "user data type";
      default:
        return type;
    }
  }

  getObjectTypeCaption(type) {
    return _.upperFirst(this.addSpacesToTypes(type));
  }

  objectAndTypeById(id) {
    let toReturn = {};
    if (this.props.tables[id]) {
      if (this.props.tables[id].objectType === "composite") {
        toReturn = {
          obj: this.props.tables[id],
          type: "composite",
          objectType: "Composite"
        };
      } else {
        let objTypeName = this.props.tables[id].embeddable
          ? _.upperFirst(this.props.localization.L_TABLE_EMBEDDABLE)
          : _.upperFirst(this.props.localization.L_TABLE);
        toReturn = {
          obj: this.props.tables[id],
          type: "table",
          objectType: objTypeName
        };
      }
    } else if (this.props.notes[id]) {
      toReturn = {
        obj: this.props.notes[id],
        type: "note",
        objectType: "Note"
      };
    } else if (this.props.otherObjects[id]) {
      toReturn = {
        obj: this.props.otherObjects[id],
        type: "other_object",
        objectType: this.getObjectTypeCaption(this.props.otherObjects[id].type)
      };
    } else if (this.props.lines[id]) {
      toReturn = {
        obj: this.props.lines[id],
        type: "line",
        objectType: "Line"
      };
    } else if (this.props.relations[id]) {
      toReturn = {
        obj: this.props.relations[id],
        type: "relation",
        objectType: "Relation"
      };
    }
    return toReturn;
  }

  async reset() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.ORDER_ITEMS__RESET_ORDER
    );
    try {
      await this.props.resetOrder(this.props.type);
    } finally {
      await this.props.finishTransaction();
    }
  }

  getContainerHeaderName() {
    return this.props.type === ModelTypes.PG || this.props.type === ModelTypes.MSSQL ? "Schema" : "Database";
  }

  getTableHeaders() {
    return (
      <div className="im-order-items-header">
        <div className="im-cols-header-fixed">Order</div>
        <div className="im-cols-header-fixed">Name</div>
        <div className="im-cols-header-fixed">
          {this.getContainerHeaderName()}
        </div>
        <div className="im-cols-header-fixed">Object type</div>
      </div>
    );
  }

  getObjectContainerName(obj) {
    if (!obj) {
      return "";
    }
    if (obj.pg) {
      return obj.pg.schema;
    }

    if (obj.mssql) {
      return obj.mssql.schema;
    }
    return obj.database;
  }

  getContainerName(objDetails) {
    if (objDetails.objectType === "Relation") {
      return this.getObjectContainerName(
        this.props.tables[objDetails.obj.child]
      );
    }

    return this.getObjectContainerName(objDetails.obj);
  }

  getAllObjects() {
    return _.map(this.props.orderedObjects, (singleObj) => {
      let objDetails = this.objectAndTypeById(singleObj.id);
      return (
        <div className="im-order-items im-items-selection" key={singleObj.id}>
          <div className="handle im-icon-16">&#xe95f;</div>
          <div>{singleObj.name}</div>
          <div>{this.getContainerName(objDetails)}</div>
          <div>{objDetails.objectType}</div>
        </div>
      );
    });
  }

  exchangeOrder = async (order, sortable, evt) => {
    const oldIndex = evt.oldIndex;
    const newIndex = evt.newIndex;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.ORDER_ITEMS__EXCHANGE_ORDER
    );
    try {
      await this.props.exchangeOrder(this.props.type, oldIndex, newIndex);
    } finally {
      await this.props.finishTransaction();
    }
  };

  renderSaveButton(script) {
    return (
      <div className="modal-toolbar">
        <button
          className="im-btn-tertiary im-margin-right"
          onClick={this.reset.bind(this)}
        >
          Reset order
        </button>
      </div>
    );
    /* }*/
  }

  render() {
    return (
      <div>
        {this.renderSaveButton()}
        <div>
          <div className="im-order-items-modal">
            <div className="im-p-sm"></div>
            <div>{this.getTableHeaders()}</div>
          </div>

          <Sortable
            options={{
              handle: ".im-items-selection",
              animation: 150,
              easing: "easeOutBounce",
              dragoverBubble: true
            }}
            onChange={this.exchangeOrder.bind(this)}
          >
            {this.getAllObjects()}
          </Sortable>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagram: state.activeDiagram,
    type: state.model.type,
    tables: state.tables,
    notes: state.notes,
    localization: state.localization,
    otherObjects: state.otherObjects,
    lines: state.lines,
    relations: state.relations,
    orderedObjects: getOrderedObjects(state.model.type)(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        exchangeOrder,
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
  connect(mapStateToProps, mapDispatchToProps)(OrderItems)
);
