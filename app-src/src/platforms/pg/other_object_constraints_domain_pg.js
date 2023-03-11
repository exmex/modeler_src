import React, { Component } from "react";

import { DebounceInput } from "react-debounce-input";
import DetailPanel from "../../components/detail_panel";
import Helpers from "../../helpers/helpers";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { getHistoryContext } from "../../helpers/history/history";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router";

class OtherObjectConstraintsDomainPG extends Component {
  constructor(props) {
    super(props);
    this.handleConstraintChange = this.handleConstraintChange.bind(this);
    this.deleteConstraint = this.deleteConstraint.bind(this);
    this.addConstraint = this.addConstraint.bind(this);
  }

  async updateConstraints(constraints) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_CONSTRAINTS_DOMAIN_PG__UPDATE_OTHER_OBJECT_PROPERTY_PLATFORM
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.domain.id,
        {
          ...this.props.domain.pg,
          domain: {
            ...this.props.domain.pg.domain,
            constraints
          }
        },
        "pg"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  handleConstraintChange(prop, id, e) {
    const constraints = this.getConstraints();
    const modifiedConstraints = constraints
      ? constraints.map((con) =>
          con.id === id ? { ...con, [prop]: e.target.value } : con
        )
      : constraints;
    this.updateConstraints(modifiedConstraints);
  }

  deleteConstraint(id) {
    const constraints = this.getConstraints();
    const reducedConstraints = constraints
      ? constraints.filter((con) => con.id !== id)
      : constraints;
    this.updateConstraints(reducedConstraints);
  }

  addConstraint(e) {
    const newConstraint = {
      id: uuidv4(),
      name:
        this.props.domain.name +
        "_cons_" +
        (_.size(this.props.domain.constraints) + 1),
      constraint_def: ""
    };
    const constraints = this.getConstraints();
    const newConstraints = constraints
      ? [...constraints, newConstraint]
      : [newConstraint];
    this.updateConstraints(newConstraints);
  }

  getConstraints() {
    return this.props.domain?.pg?.domain.constraints;
  }

  renderConstraints() {
    const constraints = this.getConstraints();
    return constraints
      ? constraints.map((constraint) => {
          return (
            <div key={constraint.id} className="im-keys-grid">
              <div />
              <DebounceInput
                minLength={1}
                debounceTimeout={300}
                type="text"
                size="2"
                value={constraint.name}
                onChange={this.handleConstraintChange.bind(
                  this,
                  "name",
                  constraint.id
                )}
              />

              <div
                className="im-pointer im-icon-sm"
                onClick={this.deleteConstraint.bind(this, constraint.id)}
              >
                <i className="im-icon-Trash16 im-icon-16" />
              </div>

              <DetailPanel colspan="3">
                <div className="im-properties-grid">
                  <div>Expression</div>
                  <DebounceInput
                    element="textarea"
                    debounceTimeout={300}
                    className="im-textarea"
                    value={Helpers.gv(constraint.constraint_def)}
                    onChange={this.handleConstraintChange.bind(
                      this,
                      "constraint_def",
                      constraint.id
                    )}
                  />
                </div>
              </DetailPanel>
            </div>
          );
        })
      : undefined;
  }

  render() {
    return (
      <div>
        <div className="im-new-item-wrapper">
          <button
            className="im-btn-default im-btn-sm"
            onClick={this.addConstraint.bind(this)}
          >
            + Add Constraint
          </button>
        </div>
        {_.size(this.props.domain.pg.domain.constraints) > 0
          ? UIHelpers.getHeader("Constraint name")
          : null}
        {this.renderConstraints()}
      </div>
    );
  }
}

export default withRouter(OtherObjectConstraintsDomainPG);
