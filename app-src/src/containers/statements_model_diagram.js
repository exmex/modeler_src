import {
  DefaultGeneratorOptionsMSSQL,
  DefaultGeneratorOptionsMySQLFamily,
  DefaultGeneratorOptionsPG,
  DefaultGeneratorOptionsSQLite
} from "../generator/model-to-sql-model/generator_options";
import React, { Component } from "react";
import { TYPE, addNotificationSimple } from "../actions/notifications";
import {
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../selectors/selector_diagram";

import { ModelTypes } from "../enums/enums";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { subscribeSaveScriptComplete } from "../helpers/ipc/script_save";
import { withRouter } from "react-router-dom";

const clipboard = window?.clipboard;
const ipcRenderer = window?.ipcRenderer;

class StatementsModelDiagram extends Component {
  copyToClipboard(text) {
    if (isElectron()) {
      clipboard.writeText(text);
      this.props.addNotificationSimple(
        "Script has been copied.",
        TYPE.INFO,
        true,
        null,
        null,
        false
      );
    }
  }

  saveToSingleFile(script) {
    var toSend = {
      suffix: "sql",
      data: this.getModelSQLArray(script),
      writeFileParam: this.props.writeFileParam
    };
    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:saveToSingleFile", JSON.stringify(toSend));
    }
  }

  saveToFiles() {
    var toSend = {
      suffix: "sql",
      data: this.getModelSQLArray(),
      writeFileParam: this.props.writeFileParam
    };
    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:save", JSON.stringify(toSend));
    }
  }

  getModelSQLArray(script) {
    var toReturn = {};

    toReturn = {
      ...toReturn,
      [this.props.match.params.mid]: {
        name: this.props.name,
        script
      }
    };

    return toReturn;
  }

  renderSaveButton(script) {
    return (
      <div className="modal-toolbar">
        <button
          className="im-btn-tertiary im-btn-small"
          onClick={this.copyToClipboard.bind(this, script)}
        >
          Copy to clipboard
        </button>

        <button
          className="im-btn-default im-btn-small"
          onClick={this.saveToSingleFile.bind(this, script)}
        >
          Save script
        </button>
      </div>
    );
    /* }*/
  }

  generatorOptions() {
    switch (this.props.type) {
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return DefaultGeneratorOptionsMySQLFamily;
      case ModelTypes.SQLITE:
        return DefaultGeneratorOptionsSQLite;
      case ModelTypes.PG:
        return DefaultGeneratorOptionsPG(this.props.sqlSettings);
      case ModelTypes.MSSQL:
        return DefaultGeneratorOptionsMSSQL(this.props.sqlSettings);
      default:
        return {};
    }
  }

  render() {
    const script = this.props.getScript(
      this.props.sqlSettings,
      {
        tables: this.props.tables,
        otherObjects: this.props.otherObjects,
        notes: this.props.notes,
        relations: this.props.relations,
        lines: this.props.lines,
        ui: this.props.ui,
        model: this.props.model,
        diagramTables: this.props.diagramTables,
        diagramOtherObjects: this.props.diagramOtherObjects,
        diagramNotes: this.props.diagramNotes,
        order: this.props.order
      },
      {
        ...this.generatorOptions(),
        onlyActiveDiagram: this.props.onlyActiveDiagram
      }
    );

    return (
      <div>
        {this.renderSaveButton(script)}
        <div>
          <pre className="script">{script}</pre>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ui: state.ui,
    tables: state.tables,
    otherObjects: state.otherObjects,
    notes: state.notes,
    relations: state.relations,
    lines: state.lines,
    sqlSettings: state.model.sqlSettings,
    diagramTables: getActiveDiagramTables(state),
    diagramOtherObjects: getActiveDiagramOtherObjects(state),
    diagramNotes: getActiveDiagramNotes(state),
    order: state.order,
    type: state.model.type,
    name: state.model.name,
    writeFileParam: state.model.writeFileParam,
    model: state.model
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        subscribeSaveScriptComplete,
        addNotificationSimple
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(StatementsModelDiagram)
);
