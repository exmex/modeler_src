import React, { Component } from "react";
import {
  getActiveDiagramAvailableLines,
  getActiveDiagramAvailableRelations,
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../../selectors/selector_diagram";
import {
  getSequelizeAssociation,
  getSequelizeDefineStatement
} from "./generator_sequelize";

import Helpers from "../../helpers/helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../../helpers/clipboard";
import isElectron from "is-electron";
import js_beautify from "js-beautify";
import { subscribeSaveScriptComplete } from "../../helpers/ipc/script_save";
import { tomorrow } from "react-syntax-highlighter/dist/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/styles/hljs/tomorrow-night-bright";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModelSequelize extends Component {
  constructor(props) {
    super(props);
    this.getSequelizeAssociationsForTable =
      this.getSequelizeAssociationsForTable.bind(this);
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
      data: this.getSequelizeArray(),
      writeFileParam: this.props.writeFileParam
    };
    if (isElectron()) {
      this.props.subscribeSaveScriptComplete(ipcRenderer);
      ipcRenderer.send("script:save", JSON.stringify(toSend));
    }
  }

  getSequelizeArray() {
    const generatorOptions = { previewObject: false };
    var toReturn = {};
    _.map(this.props.tables, (table) => {
      if (
        this.shouldGenearateDiagramObjecstOnly(table.id) ||
        !this.props.onlyActiveDiagram
      ) {
        toReturn = {
          ...toReturn,
          [table.id]: {
            name: table.name,
            script: this.getSequelize(table, false, generatorOptions)
          }
        };
      }
    });

    let newId = uuidv4();
    toReturn = {
      ...toReturn,
      [newId]: {
        name: "other_sequelize_objects",
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

    return toReturn;
  }

  getSequelizeAssociationsForTable(table, quotations, generatorOptions) {
    var toReturn = "";
    if (table.generate === true || generatorOptions.previewObject === true) {
      var relCnt = _.size(table.relations);
      var tmpScriptsArray = [];

      if (relCnt > 0) {
        _.map(table.relations, (relation) => {
          var r = this.props.relations[relation];

          if (table.name === this.props.tables[r.parent].name) {
            if (r) {
              tmpScriptsArray = [
                ...tmpScriptsArray,
                getSequelizeAssociation(
                  r,
                  this.props.tables[r.child],
                  this.props.tables[r.parent],
                  quotations,
                  "has",
                  generatorOptions
                )
              ];
            }
          }

          if (table.name === this.props.tables[r.child].name) {
            if (r) {
              tmpScriptsArray = [
                ...tmpScriptsArray,
                getSequelizeAssociation(
                  r,
                  this.props.tables[r.child],
                  this.props.tables[r.parent],
                  quotations,
                  "belongs",
                  generatorOptions
                )
              ];
            }
          }
        });
      }
      var cnt = 0;
      tmpScriptsArray = _.compact(tmpScriptsArray);
      var finalSize = _.size(tmpScriptsArray);
      //if (finalSize > 0) {
      //toReturn += getSequelizeModulesAssociationBegin(table.name);
      //}
      for (var tmpScript of tmpScriptsArray) {
        cnt++;
        if (tmpScript !== "") {
          toReturn += tmpScript;
          if (cnt !== finalSize) {
            //toReturn += ",";
          }
        }
      }
      //if (finalSize > 0) {
      //toReturn += getSequelizeModulesAssociationEnd();
      //}
    }
    return toReturn;
  }

  getSequelize(table, beautifyCode, generatorOptions) {
    if (beautifyCode === true) {
      let code = js_beautify(
        getSequelizeDefineStatement(table, "'", generatorOptions),
        {
          indent_size: 2,
          preserve_newlines: true,
          keep_array_indentation: true
        }
      );

      if (code) {
        code += "\n\n";
      }
      code += js_beautify(
        this.getSequelizeAssociationsForTable(table, "'", generatorOptions),
        {
          indent_size: 2,
          preserve_newlines: true,
          keep_array_indentation: true
        }
      );

      if (
        table.generateCustomCode === true &&
        generatorOptions.previewObject === false
      ) {
        table.customCode && (code += table.customCode + "\n\n");
      }

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
      let code = getSequelizeDefineStatement(table, "'", generatorOptions);
      code += this.getSequelizeAssociationsForTable(
        table,
        "'",
        generatorOptions
      );

      if (
        table.generateCustomCode === true &&
        generatorOptions.previewObject === false
      ) {
        table.customCode && (code += table.customCode + "\n\n");
      }

      return code;
    }
  }

  getSequelizeScript(generatorOptions) {
    return _.map(this.props.tables, (table) => {
      if (
        this.shouldGenearateDiagramObjecstOnly(table.id) ||
        !this.props.onlyActiveDiagram
      ) {
        return this.getSequelize(table, true, generatorOptions);
      }
    });
  }

  renderSaveButton() {
    if (isElectron()) {
      return (
        <div className="modal-toolbar">
          <button
            className="im-btn-tertiary im-btn-small"
            onClick={() =>
              copyToClipboard(this.getScript(this.getSequelizeArray()))
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

  getLinesScript(beautifyCode) {
    let toReturn = "";
    let linesSorted = _.orderBy(this.props.lines, ["name"], ["asc"]);

    _.map(
      _.filter(linesSorted, (line) => !!line.generate),
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

  getOtherObjectsScript(beautifyCode) {
    let toReturn = "";
    let otherObjectsSorted = _.orderBy(
      this.props.otherObjects,
      ["type"],
      ["asc"]
    );
    _.map(
      _.filter(otherObjectsSorted, (otherObject) => !!otherObject.generate),
      (otherObject) => {
        if (
          this.shouldGenearateDiagramObjecstOnly(otherObject.id) ||
          !this.props.onlyActiveDiagram
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

  getScript(data) {
    var toReturn = "";
    _.map(data, (item) => {
      toReturn += item.script;
    });
    return toReturn;
  }

  render() {
    const generatorOptions = { previewObject: false };
    return (
      <div>
        {this.renderSaveButton()}
        <div>
          <pre className="script">
            {this.getSequelizeScript(generatorOptions)}
            {this.getOtherObjectsScript(true)}
            {this.getLinesScript(true)}
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
  connect(mapStateToProps, mapDispatchToProps)(ModelSequelize)
);
