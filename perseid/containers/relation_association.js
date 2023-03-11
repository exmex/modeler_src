import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import CheckboxSwitch from "../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateRelationProperty } from "../actions/relations";
import { withRouter } from "react-router-dom";

class RelationAssociation extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_ASSOCIATION__UPDATE_RELATION_PROPERTY
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

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_ASSOCIATION__UPDATE_RELATION_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    var pt = _.upperFirst(
      this.props.tables[
        this.props.relations[this.props.match.params.rid].parent
      ].name
    );
    var cht = _.upperFirst(
      this.props.tables[this.props.relations[this.props.match.params.rid].child]
        .name
    );

    return (
      <div>
        <div className="im-properties-grid">
          <div className="im-bold">Belongs to: </div>
          <select
            value={Helpers.gsel(
              this.props.relations[this.props.match.params.rid]
                .orm_association_belongs
            )}
            onChange={this.handleTextChange.bind(
              this,
              "orm_association_belongs"
            )}
          >
            <option value="na">Not defined</option>
            <option value="belongsTo">
              {cht}.belongsTo({pt})
            </option>
            <option value="belongsToMany">
              {cht}.belongsToMany({pt})
            </option>
          </select>
          <div>Alias:</div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.relations[this.props.match.params.rid]
                .orm_alias_belongs
            )}
            onChange={this.handleTextChange.bind(this, "orm_alias_belongs")}
          />
          <div>Through:</div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.relations[this.props.match.params.rid]
                .orm_through_belongs
            )}
            onChange={this.handleTextChange.bind(this, "orm_through_belongs")}
          />
          <div />
          <CheckboxSwitch
            label="Skip constraints"
            checked={Helpers.gch(
              this.props.relations[this.props.match.params.rid]
                .orm_constraints_belongs
            )}
            onChange={this.handleCheckboxChange.bind(
              this,
              "orm_constraints_belongs"
            )}
          />

          <div className="im-content-spacer-md" />
          <div> </div>
          <div className="im-bold">Has: </div>
          <select
            value={Helpers.gsel(
              this.props.relations[this.props.match.params.rid]
                .orm_association_has
            )}
            onChange={this.handleTextChange.bind(this, "orm_association_has")}
          >
            <option value="na">Not defined</option>
            <option value="hasOne">
              {pt}.hasOne({cht})
            </option>
            <option value="hasMany">
              {pt}.hasMany({cht})
            </option>
          </select>
          <div>Alias:</div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.relations[this.props.match.params.rid].orm_alias_has
            )}
            onChange={this.handleTextChange.bind(this, "orm_alias_has")}
          />
          <div>Through:</div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.relations[this.props.match.params.rid].orm_through_has
            )}
            onChange={this.handleTextChange.bind(this, "orm_through_has")}
          />
          <div />
          <CheckboxSwitch
            label="Skip constraints"
            checked={Helpers.gch(
              this.props.relations[this.props.match.params.rid]
                .orm_constraints_has
            )}
            onChange={this.handleCheckboxChange.bind(
              this,
              "orm_constraints_has"
            )}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    relations: state.relations,
    tables: state.tables
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
  connect(mapStateToProps, mapDispatchToProps)(RelationAssociation)
);
