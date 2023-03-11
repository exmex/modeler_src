import React, { Component } from "react";
import {
  getActiveDiagramAvailableLines,
  getActiveDiagramAvailableRelations,
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../../selectors/selector_diagram";

import Helpers from "../../helpers/helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getMongooseDefineStatement } from "./generator_mongoose";
import isElectron from "is-electron";
import js_beautify from "js-beautify";
import { subscribeSaveScriptComplete } from "../../helpers/ipc/script_save";
import { tomorrow } from "react-syntax-highlighter/dist/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/styles/hljs/tomorrow-night-bright";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const clipboard = window?.clipboard;
const ipcRenderer = window?.ipcRenderer;

class ModelMongoose extends Component {
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
      suffix: "js",
      data: this.getMongooseArray(),
      writeFileParam: this.props.writeFileParam
    };

    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:save", JSON.stringify(toSend));
    }
  }

  getMongooseArray() {
    var collections = _.filter(this.props.tables, ["embeddable", false]);
    var toReturn = {};
    _.map(collections, (table) => {
      if (
        this.shouldGenearateDiagramObjecstOnly(table.id) ||
        !this.props.onlyActiveDiagram
      ) {
        toReturn = {
          ...toReturn,
          [table.id]: {
            name: table.name,
            script: this.getMongoose(table, false)
          }
        };
      }
    });

    let newId = uuidv4();
    toReturn = {
      ...toReturn,
      [newId]: {
        name: "other_mongoose_objects",
        script: this.getOtherObjectsScript(false)
      }
    };

    let newLineId = uuidv4();
    toReturn = {
      ...toReturn,
      [newLineId]: {
        name: "line_objects",
        script: this.getLinesScript(false)
      }
    };

    let newRelationId = uuidv4();
    toReturn = {
      ...toReturn,
      [newRelationId]: {
        name: "reference_objects",
        script: this.getRelationsScript(false)
      }
    };

    return toReturn;
  }

  getMongoose(table, beautifyCode) {
    var code;
    if (beautifyCode === true) {
      code = js_beautify(
        getMongooseDefineStatement(
          table,
          "'",
          this.props.tables,
          "",
          {
            previewObject: false
          },
          this.props.otherObjects
        ),
        {
          indent_size: 2,
          preserve_newlines: true,
          keep_array_indentation: true
        }
      );

      return (
        <SyntaxHighlighter
          key={uuidv4()}
          language="javascript"
          style={
            this.props.settings.theme === "im-dark"
              ? tomorrowNightBright
              : tomorrow
          }
          customStyle={{
            backgroundColor: "transparent"
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    } else {
      code = getMongooseDefineStatement(
        table,
        "'",
        this.props.tables,
        "",
        {
          previewObject: false
        },
        this.props.otherObjects
      );
      return code;
    }
  }

  getLinesScript(beautifyCode) {
    let toReturn = "";
    let linesSorted = _.orderBy(this.props.lines, ["name"], ["asc"]);

    _.map(
      _.filter(linesSorted, (line) => line.generate),
      (line) => {
        if (
          this.shouldGenearateDiagramObjecstOnly(line.id) ||
          !this.props.onlyActiveDiagram
        ) {
          toReturn += Helpers.getObjectCodeOrCustomCode(line, "code");
        }
      }
    );

    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
          language="javascript"
          style={
            this.props.settings.theme === "im-dark"
              ? tomorrowNightBright
              : tomorrow
          }
          customStyle={{
            backgroundColor: "transparent"
          }}
        >
          {toReturn}
        </SyntaxHighlighter>
      );
    } else {
      return toReturn;
    }
  }

  getRelationsScript(beautifyCode) {
    let toReturn = "";
    let relationsSorted = _.orderBy(this.props.relations, ["name"], ["asc"]);

    _.map(
      _.filter(relationsSorted, (relation) => relation.generateCustomCode),
      (relation) => {
        if (
          this.shouldGenearateDiagramObjecstOnly(relation.id) ||
          !this.props.onlyActiveDiagram
        ) {
          toReturn += Helpers.getObjectCodeOrCustomCode(relation, "customCode");
        }
      }
    );

    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
          language="javascript"
          style={
            this.props.settings.theme === "im-dark"
              ? tomorrowNightBright
              : tomorrow
          }
          customStyle={{
            backgroundColor: "transparent"
          }}
        >
          {toReturn}
        </SyntaxHighlighter>
      );
    } else {
      return toReturn;
    }
  }

  getOtherObjectsScript(beautifyCode) {
    let toReturn = "";
    let otherObjectsSorted = _.orderBy(
      this.props.otherObjects,
      ["type"],
      ["asc"]
    );
    _.map(
      _.filter(otherObjectsSorted, (otherObject) => otherObject.generate),
      (otherObject) => {
        if (
          otherObject.type !== "Enum" &&
          (this.shouldGenearateDiagramObjecstOnly(otherObject.id) ||
            !this.props.onlyActiveDiagram)
        ) {
          toReturn += Helpers.getObjectCodeOrCustomCode(otherObject, "code");
        }
      }
    );

    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
          language="javascript"
          style={
            this.props.settings.theme === "im-dark"
              ? tomorrowNightBright
              : tomorrow
          }
          customStyle={{
            backgroundColor: "transparent"
          }}
        >
          {toReturn}
        </SyntaxHighlighter>
      );
    } else {
      return toReturn;
    }
  }

  getMongooseScript() {
    var collections = _.filter(this.props.tables, ["embeddable", false]);
    return _.map(collections, (table) => {
      if (
        this.shouldGenearateDiagramObjecstOnly(table.id) ||
        !this.props.onlyActiveDiagram
      ) {
        return this.getMongoose(table, true);
      }
    });
  }

  getScript(data) {
    var toReturn = "";
    _.map(data, (item) => {
      toReturn += item.script;
    });
    return toReturn;
  }

  renderSaveButton() {
    if (isElectron()) {
      return (
        <div className="modal-toolbar">
          <button
            className="im-btn-tertiary im-btn-small"
            onClick={() =>
              this.copyToClipboard(this.getScript(this.getMongooseArray()))
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
    }
  }

  render() {
    return (
      <div>
        {this.renderSaveButton()}
        <div>
          <pre className="script">
            {this.getMongooseScript()}
            {this.getOtherObjectsScript(true)}
            {this.getLinesScript(true)}
            {this.getRelationsScript(true)}
          </pre>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    lines: state.lines,
    otherObjects: state.otherObjects,
    notifications: state.notifications,
    settings: state.settings,
    writeFileParam: state.model.writeFileParam,
    relations: state.relations,
    activeDiagram: state.activeDiagram,
    diagramObjects: {
      ...getActiveDiagramTables(state),
      ...getActiveDiagramOtherObjects(state),
      ...getActiveDiagramNotes(state),
      ...getActiveDiagramAvailableLines(state),
      ...getActiveDiagramAvailableRelations(state)
    }
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
  connect(mapStateToProps, mapDispatchToProps)(ModelMongoose)
);
