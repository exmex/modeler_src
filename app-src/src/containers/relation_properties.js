import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { ModelTypes } from "common";
import PGHelpers from "../platforms/pg/helpers_pg";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateRelationProperty } from "../actions/relations";
import { withRouter } from "react-router-dom";

class RelationProperties extends Component {
  constructor(props) {
    super(props);
    this.state = { relationId: undefined, canResetName: true };
  }

  componentDidMount() {
    this.loadRelation();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.relations !== this.props.relations ||
      prevState.relationId !== this.props.match.params.rid ||
      (!!this.props.nameAutoGeneration &&
        prevProps.nameAutoGeneration.relations !==
          this.props.nameAutoGeneration.relations)
    ) {
      this.loadRelation();
    }
  }

  loadRelation() {
    const relation = this.props.relations[this.props.match.params.rid];
    this.setState({
      relationId: this.props.match.params.rid,
      canResetName:
        this.props.type === ModelTypes.PG &&
        this.props.nameAutoGeneration.relations
          ? PGHelpers.makeRelationName(
              relation,
              this.props.tables,
              this.props.relations
            ) !== relation.name
          : this.defaultRelationName() !== relation.name
    });
  }

  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_PROPERTIES__UPDATE_RELATION_PROPERTY
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async resetRelationName(canResetName) {
    if (!canResetName) {
      return;
    }
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_PROPERTIES__UPDATE_RELATION_PROPERTY_RESET_RELATION_NAME
    );
    try {
      const relation = this.props.relations[this.props.match.params.rid];
      const newName =
        this.props.type === ModelTypes.PG &&
        this.props.nameAutoGeneration.relations
          ? PGHelpers.makeRelationName(
              relation,
              this.props.tables,
              this.props.relations
            )
          : this.defaultRelationName();
      this.props.updateRelationProperty(
        this.props.match.params.rid,
        newName,
        "name"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  defaultRelationName() {
    const relation = this.props.relations[this.props.match.params.rid];
    const parent = this.props.tables[relation.parent];
    const child = this.props.tables[relation.child];
    return `${parent.name}_${child.name}`;
  }

  renderResetName() {
    const className =
      "im-has-tooltip im-relative  im-pointer im-icon-sm" +
      (this.state.canResetName ? "" : " im-disabled");
    const classNameImage =
      "im-icon-ResetName im-icon-16" +
      (this.state.canResetName ? "" : " im-disabled");
    return (
      <div
        className={className}
        onClick={this.resetRelationName.bind(this, this.state.canResetName)}
      >
        <i className={classNameImage} />
        <div className={"im-tooltip im-tooltip-right"}>Reset name</div>
      </div>
    );
  }

  render() {
    if (this.props.match.params.rid) {
      return (
        <div>
          <div className="im-properties-grid">
            <div>Name:</div>
            <div className="im-field-and-btn">
              <DebounceInput
                type="text"
                minLength={1}
                debounceTimeout={300}
                value={Helpers.gv(
                  this.props.relations[this.props.match.params.rid].name
                )}
                onChange={this.handleTextChange.bind(this, "name")}
              />
              {this.renderResetName()}
            </div>

            <div>Description:</div>

            <DebounceInput
              element="textarea"
              minLength={1}
              debounceTimeout={300}
              className="im-textarea"
              value={Helpers.gv(
                this.props.relations[this.props.match.params.rid].desc
              )}
              onChange={this.handleTextChange.bind(this, "desc")}
            />
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    type: state.model.type,
    nameAutoGeneration: state.model.nameAutoGeneration
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateRelationProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(RelationProperties)
);
