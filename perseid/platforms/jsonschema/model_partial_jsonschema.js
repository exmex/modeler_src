import React, { Component } from "react";
import {
  generateJsonSchemaPartialScript,
  getJsonSchemaDefineStatement
} from "../../platforms/jsonschema/generator_jsonschema";

import ButtonCustom from "../../components/button_custom";
import CollapsiblePanel from "../../components/collapsible_panel";
import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import SyntaxHighlighter from "react-syntax-highlighter";
import { connect } from "react-redux";
import { copyToClipboard } from "../../helpers/clipboard";
import { tomorrow } from "react-syntax-highlighter/dist/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/styles/hljs/tomorrow-night-bright";
import { withRouter } from "react-router-dom";

const ItemScript = ({ script }) => {
  return <div>{script}</div>;
};
class ModelPartialJsonSchema extends Component {
  getScriptForClipboard(code) {
    return Helpers.getStrictOrSimpleJson(
      code,
      this.props.jsonCodeSettings.strict,
      this.props.jsonCodeSettings.format
    );
  }

  addCurlyBrackets(code) {
    return `{${code}}`;
  }

  getScript(code) {
    const textCode = Helpers.getStrictOrSimpleJson(
      code,
      this.props.jsonCodeSettings.strict,
      this.props.jsonCodeSettings.format
    );

    return (
      <div>
        <pre className="script">
          <SyntaxHighlighter
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
            {textCode}
          </SyntaxHighlighter>
        </pre>
      </div>
    );
  }

  getJsonSchemaPartialScript() {
    return generateJsonSchemaPartialScript(
      this.props.match.params.id,
      this.props.match.params.cid,
      {
        catalogColumns: this.props.catalogColumns,
        jsonCodeSettings: this.props.jsonCodeSettings,
        tables: this.props.tables,
        type: this.props.type
      }
    );
  }

  getJsonSubSchemaScript() {
    const activeTable = this.props.tables[this.props.match.params.id];
    const definitionKeyName = JsonSchemaHelpers.getDefinitionKeyName(
      activeTable,
      {
        jsonCodeSettings: this.props.jsonCodeSettings,
        type: this.props.type
      }
    );

    let quotations = '"';

    return getJsonSchemaDefineStatement(activeTable, this.props.tables, {
      quotations,
      definitionKeyName,
      skipDefs: true,
      catalogColumns: this.props.catalogColumns.colToTable,
      strictJsonFormat: this.props.jsonCodeSettings.strict,
      projectType: this.props.type
    });
  }

  render() {
    const code =
      this.props.forSubSchema === true
        ? this.getJsonSubSchemaScript()
        : this.addCurlyBrackets(this.getJsonSchemaPartialScript());
    return (
      <div>
        <CollapsiblePanel
          panelKey="pJsonSchemaPartial"
          panelTitle="Partial script"
          panelIsExpanded={this.props.panelsExpanded.pJsonSchemaPartial}
        >
          <div>
            <ItemScript script={this.getScript(code)} />
            <div className="im-code-actions">
              <div />
              <ButtonCustom
                type="default"
                size="sm"
                caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
                onClick={() =>
                  copyToClipboard(this.getScriptForClipboard(code))
                }
              />
            </div>
          </div>
        </CollapsiblePanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    panelsExpanded: state.ui.panelsExpanded,
    settings: state.settings,
    localization: state.localization,
    jsonCodeSettings: state.model.jsonCodeSettings,
    catalogColumns: state.catalogColumns,
    type: state.model.type
  };
}

export default withRouter(connect(mapStateToProps)(ModelPartialJsonSchema));
