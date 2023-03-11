import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import OtherObjectPropertiesDomainPG from "../platforms/pg/other_object_properties_domain_pg";
import OtherObjectPropertiesEnumMongoose from "../platforms/mongoose/other_object_properties_enum_mongoose";
import OtherObjectPropertiesEnumPG from "../platforms/pg/other_object_properties_enum_pg";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateOtherObjectProperty } from "../actions/other_objects";
import { withRouter } from "react-router-dom";

class OtherObjectProperties extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  async handleChange(e) {
    const value = e.target.value;
    const property = e.target.dataset.property;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES__UPDATE_OTHER_OBJECT_PROPERTY
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.match.params.oid,
        value,
        property
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.oid) {
      return null;
    }

    const activeType =
      this.props.otherObjects[this.props.match.params.oid].type;

    return (
      <div>
        <div className="im-properties-grid">
          <div>Name:</div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={Helpers.gv(
              this.props.otherObjects[this.props.match.params.oid].name
            )}
            onChange={this.handleChange}
            data-property="name"
          />

          <div>Description:</div>

          <DebounceInput
            element="textarea"
            minLength={1}
            debounceTimeout={300}
            className="im-textarea"
            value={Helpers.gv(
              this.props.otherObjects[this.props.match.params.oid].desc
            )}
            onChange={this.handleChange}
            data-property="desc"
          />
          {this.props.type === "GRAPHQL" &&
            (activeType === "Enum" || activeType === "Scalar") && (
              <>
                <div>Directive:</div>
                <DebounceInput
                  element="textarea"
                  minLength={1}
                  debounceTimeout={300}
                  className="im-textarea"
                  value={Helpers.gv(
                    this.props.otherObjects[this.props.match.params.oid]
                      .directive
                  )}
                  onChange={this.handleChange}
                  data-property="directive"
                />
              </>
            )}

          {this.props.type === "GRAPHQL" && activeType === "Enum" && (
            <>
              <div>Enum values:</div>
              <DebounceInput
                element="textarea"
                minLength={1}
                debounceTimeout={300}
                className="im-textarea im-textarea-large"
                value={Helpers.gv(
                  this.props.otherObjects[this.props.match.params.oid]
                    .enumValues
                )}
                onChange={this.handleChange}
                data-property="enumValues"
              />
            </>
          )}
        </div>
        <div className="im-properties-grid">
          <div className="im-content-spacer-md" />
          <div />

          {this.props.type === "PG" && activeType === "Domain" && (
            <OtherObjectPropertiesDomainPG
              domain={this.props.otherObjects[this.props.match.params.oid]}
              updateOtherObjectProperty={this.props.updateOtherObjectProperty}
              finishTransaction={this.props.finishTransaction}
              startTransaction={this.props.startTransaction}
            />
          )}
          {this.props.type === "PG" && activeType === "Enum" && (
            <OtherObjectPropertiesEnumPG
              enum={this.props.otherObjects[this.props.match.params.oid]}
            />
          )}
          {this.props.type === "MONGOOSE" && activeType === "Enum" && (
            <OtherObjectPropertiesEnumMongoose
              enum={this.props.otherObjects[this.props.match.params.oid]}
            />
          )}
        </div>
        <div className="im-properties-grid"></div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    otherObjects: state.otherObjects,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateOtherObjectProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OtherObjectProperties)
);
