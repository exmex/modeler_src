import React, { Component } from "react";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router";

class OtherObjectSpecificsMSSQL extends Component {
  async handleChangePlatform(propertyName, platform, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_SPECIFICS_MSSQL___UPDATE_OTHER_OBJECT_PROPERTY_MSSQL
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.otherObject.id,
        {
          ...this.props.otherObject[platform],
          [propertyName]: value
        },
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <>
        <div>Schema:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(this.props.otherObject?.mssql?.schema)}
          onChange={this.handleChangePlatform.bind(this, "schema", "mssql")}
        />
      </>
    );
  }
}

export default withRouter(OtherObjectSpecificsMSSQL);
