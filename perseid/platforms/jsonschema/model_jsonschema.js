import React, { Component } from "react";
import {
  getActiveDiagramAvailableLines,
  getActiveDiagramAvailableRelations,
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../../selectors/selector_diagram";

import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import SyntaxHighlighter from "react-syntax-highlighter";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getJsonSchemaDefineStatement } from "./generator_jsonschema";
import isElectron from "is-electron";
import js_beautify from "js-beautify";
import { subscribeSaveScriptComplete } from "../../helpers/ipc/script_save";
import { tomorrow } from "react-syntax-highlighter/dist/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/styles/hljs/tomorrow-night-bright";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const clipboard = window?.clipboard;

const ipcRenderer = window?.ipcRenderer;

class ModelJsonSchema extends Component {
  copyToClipboard(text) {
    if (isElectron()) {
      clipboard.writeText(text);
    }
  }

  shouldGenearateDiagramObjecstOnly(objId) {
    return this.props.onlyActiveDiagram === true &&
      this.props.diagramObjects[objId]
      ? true
      : false;
  }

  saveToFiles() {
    var toSend = {
      suffix: this.props.jsonCodeSettings.format,
      data: this.getJsonSchemaArray(),
      writeFileParam: this.props.writeFileParam
    };
    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:save", JSON.stringify(toSend));
    }
  }

  getJsonSchemaArray() {
    var rootSchemaTables = _.filter(this.props.tables, ["embeddable", false]);
    var toReturn = {};
    _.map(rootSchemaTables, (rootSchemaTable) => {
      if (
        this.shouldGenearateDiagramObjecstOnly(rootSchemaTable.id) ||
        !this.props.onlyActiveDiagram
      ) {
        toReturn = {
          ...toReturn,
          [rootSchemaTable.id]: {
            name: rootSchemaTable.name,
            script: this.getJsonSchema(rootSchemaTable, {
              beautifyCode: false,
              skipDefs: false,
              strictJsonFormat: this.props.jsonCodeSettings.strict,
              quotations: '"',
              definitionKeyName: JsonSchemaHelpers.getDefinitionKeyName(
                rootSchemaTable,
                {
                  jsonCodeSettings: this.props.jsonCodeSettings,
                  type: this.props.type
                }
              )
            })
          }
        };
      }
    });

    return toReturn;
  }

  getJsonSchema(
    table,
    { beautifyCode, definitionKeyName, quotations, strictJsonFormat }
  ) {
    const codeText = Helpers.getStrictOrSimpleJson(
      getJsonSchemaDefineStatement(table, this.props.tables, {
        quotations,
        definitionKeyName,
        skipDefs: false,
        catalogColumns: this.props.catalogColumns,
        strictJsonFormat,
        projectType: this.props.type
      }),
      this.props.jsonCodeSettings.strict,
      this.props.jsonCodeSettings.format
    );
    if (beautifyCode === true) {
      const syntaxHighlightedCode =
        this.props.jsonCodeSettings.format === "yaml"
          ? codeText
          : js_beautify(codeText);

      return (
        <SyntaxHighlighter
          key={uuidv4()}
          language={
            this.props.jsonCodeSettings.format === "yaml"
              ? "yaml"
              : "javascript"
          }
          style={
            this.props.settings.theme === "im-dark"
              ? tomorrowNightBright
              : tomorrow
          }
          customStyle={{
            backgroundColor: "transparent"
          }}
        >
          {syntaxHighlightedCode}
        </SyntaxHighlighter>
      );
    } else {
      return codeText;
    }
  }

  getJsonSchemaScript() {
    const rootSchemaTable = JsonSchemaHelpers.getRootSchemaTable(
      this.props.tables
    );
    return this.getJsonSchema(rootSchemaTable, {
      beautifyCode: true,
      skipDefs: false,
      strictJsonFormat: this.props.jsonCodeSettings.strict,
      definitionKeyName: JsonSchemaHelpers.getDefinitionKeyName(
        rootSchemaTable,
        {
          jsonCodeSettings: this.props.jsonCodeSettings,
          type: this.props.type
        }
      ),
      quotations: '"'
    });
  }

  getScript(data) {
    var toReturn = "";
    _.map(data, (item) => {
      toReturn += item.script;
    });
    return Helpers.getStrictOrSimpleJson(
      toReturn,
      this.props.jsonCodeSettings.strict,
      this.props.jsonCodeSettings.format
    );
  }

  renderSaveButton() {
    /*if (isElectron()) {*/
    return (
      <div className="modal-toolbar">
        <button
          className="im-btn-tertiary im-btn-small"
          onClick={() =>
            this.copyToClipboard(this.getScript(this.getJsonSchemaArray()))
          }
        >
          Copy to clipboard
        </button>
        <button
          className="im-btn-default im-btn-small"
          onClick={this.saveToFiles.bind(this)}
        >
          Save scripts
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
          <pre className="script">{this.getJsonSchemaScript()}</pre>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    jsonCodeSettings: state.model.jsonCodeSettings,
    lines: state.lines,
    otherObjects: state.otherObjects,
    ui: state.ui,
    notifications: state.notifications,
    settings: state.settings,
    writeFileParam: state.model.writeFileParam,
    model: state.model,
    relations: state.relations,
    type: state.model.type,
    activeDiagram: state.activeDiagram,
    diagramObjects: {
      ...getActiveDiagramTables(state),
      ...getActiveDiagramOtherObjects(state),
      ...getActiveDiagramNotes(state),
      ...getActiveDiagramAvailableLines(state),
      ...getActiveDiagramAvailableRelations(state)
    },
    catalogColumns: state.catalogColumns.colToTable
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        subscribeSaveScriptComplete
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelJsonSchema)
);
