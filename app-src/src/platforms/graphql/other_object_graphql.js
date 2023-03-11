import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  getGraphQlEnumStatement,
  getGraphQlScalarStatement
} from "./generator_graphql";

import ButtonCustom from "../../components/button_custom";
import CheckboxSwitch from "../../components/checkbox_switch";
import CollapsiblePanel from "../../components/collapsible_panel";
import Helpers from "../../helpers/helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../../helpers/clipboard";
import { getHistoryContext } from "../../helpers/history/history";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { updateOtherObjectProperty } from "../../actions/other_objects";
import { withRouter } from "react-router-dom";

class GraphQlOtherObject extends Component {
  renderCodeViewer() {
    if (
      this.activeOtherObject.type === "Enum" ||
      this.activeOtherObject.type === "Scalar"
    ) {
      return (
        <div>
          <pre className="script">
            <SyntaxHighlighter
              language="graphql"
              style={
                this.props.settings.theme === "im-dark"
                  ? tomorrowNightBright
                  : tomorrow
              }
              customStyle={{
                backgroundColor: "transparent"
              }}
            >
              {this.code}
            </SyntaxHighlighter>
          </pre>
        </div>
      );
    } else {
      return (
        <div>
          <div className="im-message">
            <br />
            No script available.
          </div>
        </div>
      );
    }
  }

  get activeOtherObject() {
    return this.props.otherObjects[this.props.match.params.oid];
  }

  get code() {
    const generatorOptions = {
      previewObject: true
    };

    if (this.activeOtherObject.type === "Enum") {
      return getGraphQlEnumStatement(this.activeOtherObject, generatorOptions);
    }
    if (this.activeOtherObject.type === "Scalar") {
      return getGraphQlScalarStatement(
        this.activeOtherObject,
        generatorOptions
      );
    }
    return "";
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.GRAPHQL_OTHER_OBJECT__UPDATE_OTHER_OBJECT_PROPERTY
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.match.params.oid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <div>
        <CollapsiblePanel
          panelTitle="Define"
          panelKey="pOtherObjectScript"
          panelIsExpanded={this.props.panelsExpanded.pOtherObjectScript}
        >
          <div>
            {this.renderCodeViewer()}
            <div className="im-code-actions">
              <CheckboxSwitch
                label={this.props.localization.TEXTS.GENERATE}
                checked={Helpers.gch(this.activeOtherObject.generate !== false)}
                onChange={this.handleCheckboxChange.bind(this, "generate")}
              />
              <ButtonCustom
                type="default"
                size="sm"
                caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
                onClick={() => copyToClipboard(this.code)}
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
    otherObjects: state.otherObjects,
    panelsExpanded: state.ui.panelsExpanded,
    settings: state.settings,
    localization: state.localization
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
  connect(mapStateToProps, mapDispatchToProps)(GraphQlOtherObject)
);
