import React, { Component } from "react";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router-dom";

class OtherObjectPropertiesSequenceMSSQL extends Component {
  async handleChangePlatformObject(propertyName, platform, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_SEQUENCE_MSSQL__UPDATE_OTHER_OBJECT_PROPERTY_MSSQL_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.sequence.id,
        {
          sequence: {
            ...this.props.sequence[platform].sequence,
            [propertyName]: value
          },
          schema: this.props.sequence[platform].schema
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
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_SEQUENCE_MSSQL___UPDATE_OTHER_OBJECT_PROPERTY_MSSQL_SEQUENCE
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.sequence.id,
        {
          ...this.props.sequence[platform],
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
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_SEQUENCE_MSSQL__UPDATE_OTHER_OBJECT_PROPERTY_MSSQL_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.sequence.id,
        {
          sequence: {
            ...this.props.sequence[platform].sequence,
            [propertyName]: checked
          },
          schema: this.props.sequence[platform].schema
        },
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getSequence() {
    return this.props.sequence?.mssql?.sequence;
  }

  render() {
    const sequence = this.getSequence();
    return (
      <>
        <div>Schema:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(this.props.sequence?.mssql?.schema)}
          onChange={this.handleChangePlatform.bind(this, "schema", "mssql")}
        />
        <div>Start with:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(sequence?.start)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "start",
            "mssql"
          )}
        />
        <div>Increment by:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(sequence?.increment)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "increment",
            "mssql"
          )}
        />
        <div>Min:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(sequence?.minValue)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "minValue",
            "mssql"
          )}
        />
        <div>Max:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(sequence?.maxValue)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "maxValue",
            "mssql"
          )}
        />
        <div>Cache:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(sequence?.cache)}
          onChange={this.handleChangePlatformObject.bind(
            this,
            "cache",
            "mssql"
          )}
        />
        <div />
        <CheckboxSwitch
          element="textarea"
          minLength={1}
          label="Cycle"
          checked={Helpers.gch(sequence?.isCycling)}
          onChange={this.handleCheckChangePlatform.bind(
            this,
            "isCycling",
            "mssql"
          )}
        />
      </>
    );
  }
}

export default withRouter(OtherObjectPropertiesSequenceMSSQL);
