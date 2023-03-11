import React, { Component } from "react";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router-dom";

class OtherObjectPropertiesUserDefinedTypeMSSQL extends Component {
  async handleChangePlatformObject(propertyName, platform, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_UDT_MSSQL__UPDATE_OTHER_OBJECT_PROPERTY_MSSQL_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.udt.id,
        {
          udt: {
            ...this.props.udt[platform].udt,
            [propertyName]: value
          },
          schema: this.props.udt[platform].schema
        },
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangePlatform(propertyName, platform, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_UDT_MSSQL___UPDATE_OTHER_OBJECT_PROPERTY_MSSQL_UDT
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.udt.id,
        {
          ...this.props.udt[platform],
          [propertyName]: value
        },
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleCheckChangePlatform(propertyName, platform, e) {
    const checked = e.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_UDT_MSSQL__UPDATE_OTHER_OBJECT_PROPERTY_MSSQL_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.udt.id,
        {
          udt: {
            ...this.props.udt[platform].udt,
            [propertyName]: checked
          },
          schema: this.props.udt[platform].schema
        },
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getUDT() {
    return this.props.udt?.mssql?.udt;
  }

  render() {
    const udt = this.getUDT();
    return (
      <>
        <div>Schema:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(this.props.udt?.mssql?.schema)}
          onChange={this.handleChangePlatform.bind(this, "schema", "mssql")}
        />
        <div>Base Type:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(udt?.baseType)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "baseType",
            "mssql"
          )}
        />
        <div>Params:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(udt?.params)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "params",
            "mssql"
          )}
        />
        <div />
        <CheckboxSwitch
          element="textarea"
          minLength={1}
          label="Not null"
          checked={Helpers.gch(udt?.isNotNull)}
          onChange={this.handleCheckChangePlatform.bind(
            this,
            "isNotNull",
            "mssql"
          )}
        />
        <div>External name:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(udt?.externalName)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "externalName",
            "mssql"
          )}
        />
        <div>As table:</div>
        <DebounceInput
          element="textarea"
          minLength={1}
          debounceTimeout={300}
          className="im-textarea"
          value={Helpers.gv(udt?.asTable)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "asTable",
            "mssql"
          )}
        />
      </>
    );
  }
}

export default withRouter(OtherObjectPropertiesUserDefinedTypeMSSQL);
