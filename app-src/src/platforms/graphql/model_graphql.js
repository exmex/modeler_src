import React, { Component } from "react";
import {
  getActiveDiagramAvailableLines,
  getActiveDiagramAvailableRelations,
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../../selectors/selector_diagram";
import {
  getGraphQlDefineStatement,
  getGraphQlLinkStatement,
  getOtherObjectStatement,
  shouldGenerate
} from "./generator_graphql";

import SyntaxHighlighter from "react-syntax-highlighter";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { subscribeSaveScriptComplete } from "../../helpers/ipc/script_save";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const clipboard = window?.clipboard;
const ipcRenderer = window?.ipcRenderer;

class ModelGraphQl extends Component {
  copyToClipboard(text) {
    if (isElectron()) {
      clipboard.writeText(text);
    }
  }

  saveToSingleFile() {
    var toSend = {
      suffix: "js",
      data: this.getModelScriptArray(),
      writeFileParam: this.props.writeFileParam
    };
    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:saveToSingleFile", JSON.stringify(toSend));
    }
  }

  saveToFiles() {
    var toSend = {
      suffix: "js",
      data: this.getModelScriptArray(),
      writeFileParam: this.props.writeFileParam
    };
    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:save", JSON.stringify(toSend));
    }
  }

  getGraphQlArray() {
    const generatorOptions = { previewObject: false };
    var collections = this.props.tables;
    var toReturn = {};
    _.map(collections, (table) => {
      if (
        shouldGenerate(table.id, {
          onlyActiveDiagram: this.props.onlyActiveDiagram,
          diagramObjects: this.props.diagramObjects
        })
      ) {
        toReturn = {
          ...toReturn,
          [table.id]: {
            name: table.name,
            script: this.getGraphQl(table, false, generatorOptions)
          }
        };
      }
    });

    let newId = uuidv4();
    toReturn = {
      ...toReturn,
      [newId]: {
        name: "other_graphql_objects",
        script: this.getOtherObjectsScript(false, generatorOptions, diagram)
      }
    };

    let newLineId = uuidv4();
    toReturn = {
      ...toReturn,
      [newLineId]: {
        name: "line_objects",
        script: this.getLinesScript(false, generatorOptions, diagram)
      }
    };

    let newRelationId = uuidv4();
    toReturn = {
      ...toReturn,
      [newRelationId]: {
        name: "reference_objects",
        script: this.getRelationsScript(false, generatorOptions, diagram)
      }
    };

    return toReturn;
  }

  getGraphQl(table, beautifyCode, generatorOptions) {
    const code = getGraphQlDefineStatement(
      table,
      "'",
      this.props.tables,
      this.props.otherObjects,
      this.props.relations,
      "",
      generatorOptions
    );
    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
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
          {code}
        </SyntaxHighlighter>
      );
    }
    return code;
  }

  getGraphQlScript(beautifyCode, generatorOptions, diagram) {
    var collections = this.props.tables;
    return _.map(collections, (table) => {
      if (
        shouldGenerate(table.id, {
          onlyActiveDiagram: this.props.onlyActiveDiagram,
          diagramObjects: this.props.diagramObjects
        })
      ) {
        return this.getGraphQl(table, beautifyCode, generatorOptions, diagram);
      }
    });
  }

  getLinesScript(beautifyCode, generatorOptions, diagram) {
    const linesSorted = _.orderBy(this.props.lines, ["name"], ["asc"]);
    const toReturn = getGraphQlLinkStatement(
      linesSorted,
      generatorOptions,
      diagram,
      true
    );

    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
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
          {toReturn}
        </SyntaxHighlighter>
      );
    } else {
      return toReturn;
    }
  }

  getRelationsScript(beautifyCode, generatorOptions, diagram) {
    const relationsSorted = _.orderBy(this.props.relations, ["name"], ["asc"]);
    const toReturn = getGraphQlLinkStatement(
      relationsSorted,
      generatorOptions,
      diagram,
      false
    );

    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
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
          {toReturn}
        </SyntaxHighlighter>
      );
    } else {
      return toReturn;
    }
  }

  getOtherObjectsScript(beautifyCode, generatorOptions, diagram) {
    const otherObjectsSorted = _.orderBy(
      this.props.otherObjects,
      ["type"],
      ["asc"]
    );
    const toReturn = _.map(otherObjectsSorted, (otherObject) =>
      getOtherObjectStatement(otherObject, generatorOptions, diagram)
    ).join("\n");

    if (beautifyCode === true) {
      return (
        <SyntaxHighlighter
          key={uuidv4()}
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
          {toReturn}
        </SyntaxHighlighter>
      );
    } else {
      return toReturn;
    }
  }

  getModelScriptArray() {
    var toReturn = {};

    toReturn = {
      ...toReturn,
      [this.props.match.params.mid]: {
        name: "schema",
        script: this.getScript(this.getGraphQlArray())
      }
    };

    return toReturn;
  }

  getScript(data) {
    var toReturn = "";
    _.map(data, (item) => {
      toReturn += item.script;
    });
    return toReturn;
  }

  renderSaveButton() {
    /*if (isElectron()) {*/
    return (
      <div className="modal-toolbar">
        <button
          className="im-btn-tertiary im-btn-small"
          onClick={() =>
            this.copyToClipboard(this.getScript(this.getGraphQlArray()))
          }
        >
          Copy to clipboard
        </button>
        <button
          className="im-btn-default im-btn-small"
          onClick={this.saveToSingleFile.bind(this)}
        >
          Save script
        </button>
      </div>
    );
    /* }*/
  }

  render() {
    const generatorOptions = { previewObject: false };
    const diagram = {
      onlyActiveDiagram: this.props.onlyActiveDiagram,
      diagramObjects: this.props.diagramObjects
    };

    return (
      <div>
        {this.renderSaveButton()}
        <div>
          <pre className="script">
            {this.getGraphQlScript(true, generatorOptions, diagram)}
            {this.getOtherObjectsScript(true, generatorOptions, diagram)}
            {this.getLinesScript(true, generatorOptions, diagram)}
            {this.getRelationsScript(true, generatorOptions, diagram)}
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
    relations: state.relations,
    otherObjects: state.otherObjects,
    notifications: state.notifications,
    settings: state.settings,
    writeFileParam: state.model.writeFileParam,

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
  connect(mapStateToProps, mapDispatchToProps)(ModelGraphQl)
);
