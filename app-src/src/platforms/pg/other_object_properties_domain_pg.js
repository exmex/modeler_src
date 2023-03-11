import React, { Component } from "react";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import PGHelpers from "./helpers_pg";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router-dom";

class OtherObjectPropertiesDomainPG extends Component {

  async handleChangeDomainPg(propertyName, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_DOMAIN_PG__UPDATE_OTHER_OBJECT_PROPERTY_PG
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.domain.id,
        {
          domain: {
            ...this.props.domain.pg.domain,
            [propertyName]: value
          },
          schema: this.props.domain.pg.schema
        },
        "pg"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangePg(propertyName, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_DOMAIN_PG___UPDATE_OTHER_OBJECT_PROPERTY_PG_DOMAIN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.domain.id,
        {
          ...this.props.domain.pg,
          [propertyName]: value
        },
        "pg"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleCheckChangePg(propertyName, e) {
    const checked = e.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_DOMAIN_PG__UPDATE_OTHER_OBJECT_PROPERTY_PG_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.domain.id,
        {
          domain: {
            ...this.props.domain.pg.domain,
            [propertyName]: checked
          },
          schema: this.props.domain.pg.schema
        },
        "pg"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getDomain() {
    return this.props.domain?.pg?.domain;
  }

  render() {
    const domain = this.getDomain();
    return (
      <>
        <div>Schema:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.domain && this.props.domain.pg && this.props.domain.pg.schema
          )}
          onChange={this.handleChangePg.bind(this, "schema")}
        />
        <div>Datatype:</div>
        {this.renderDataTypesPG()}
        <div>Parameters:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(domain && domain.datatype_param)}
          onChange={this.handleChangeDomainPg.bind(this, "datatype_param")}
        />
        <div>Collate:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(domain && domain.collation)}
          onChange={this.handleChangeDomainPg.bind(this, "collation")}
        />
        <div>Default:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(domain && domain.default)}
          onChange={this.handleChangeDomainPg.bind(this, "default")}
        />
        <div />
        <CheckboxSwitch
          element="textarea"
          minLength={1}
          label="Not Null"
          checked={Helpers.gch(domain && domain.not_null)}
          onChange={this.handleCheckChangePg.bind(this, "not_null")}
        />
      </>
    );
  }

  renderDataTypesPG() {
    const domain = this.getDomain();

    return (
      <select
        value={domain && domain.datatype}
        onChange={this.handleChangeDomainPg.bind(this, "datatype")}
      >
        {PGHelpers.makeDatatypesPG()}
      </select>
    );
  }
}

export default withRouter(OtherObjectPropertiesDomainPG);
