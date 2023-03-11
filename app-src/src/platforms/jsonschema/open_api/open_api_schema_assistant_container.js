import React, { Component, Fragment } from "react";
import {
  extractSchemasForPath,
  getSpecification
} from "../detection/detect_schema";
import { finishTransaction, startTransaction } from "../../../actions/undoredo";
import {
  updateColumnProperty,
  updateTableProperty
} from "../../../actions/tables";

import ColumnsJsonSchemaSingle from "../columns_jsonschema_single";
import Helpers from "../../../helpers/helpers";
import JsonSchemaHelpers from "../helpers_jsonschema";
import OpenAPISchemaAssistant from "./open_api_schema_assistant";
import { TableObjectTypesJson } from "../class_table_jsonschema";
import { UndoRedoDef } from "../../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { buildDetail } from "../detection/detail_builder";
import { connect } from "react-redux";
import { getActiveSchema } from "../detection/schema_detection";
import { getHistoryContext } from "../../../helpers/history/history";
import { getPath } from "../detection/path_detection";
import json5 from "json5";
import { withRouter } from "react-router-dom";

class OpenAPIColumnsJSONSchemaSingle extends Component {
  constructor(props) {
    super(props);
    this.changeSpecificationValue = this.changeSpecificationValue.bind(this);
    this.updateSpecification = this.updateSpecification.bind(this);

    this.state = {
      activeTableId: undefined,
      activeColumnId: undefined,
      activeSpecification: {},
      activeSpecificationText: undefined,
      activeDetail: undefined,
      error: undefined
    };
  }

  componentDidMount() {
    const specificationText = this.getStoreSpecification();
    this.setState({
      activeTableId: this.props.match.params.id,
      activeColumnId: this.props.match.params.cid,
      tempSpecificationText: specificationText
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const specificationText = this.getStoreSpecification();
    const hasActiveDataTableChanged = this.hasActiveDataTableChanged(prevState);
    const hasCodeStrictChanged = this.hasCodeStrictChanged(prevProps);
    const hasActiveDataTableSpecificationChanged =
      this.hasActiveDataTableSpecificationChanged(specificationText);
    const isSpecificationTextParsable =
      this.isSpecificationTextParsable(specificationText);
    const hasNameChanged = this.hasNameChanged(prevProps);
    const hasOpenAPISchemaChanged = this.hasOpenAPISchemaChanged(prevProps);

    if (
      hasActiveDataTableChanged ||
      hasCodeStrictChanged ||
      hasNameChanged ||
      hasOpenAPISchemaChanged
    ) {
      this.setState(
        {
          activeTableId: this.props.match.params.id,
          activeColumnId: this.props.match.params.cid,
          activeSpecificationText: specificationText
        },
        () => {
          const activeSpecification =
            this.parseSpecification(specificationText);
          const activeDetail = this.buildDetail(activeSpecification);
          this.setState({
            activeDetail,
            activeSpecification: isSpecificationTextParsable
              ? activeSpecification
              : {}
          });
        }
      );
    }

    if (!hasActiveDataTableChanged && hasActiveDataTableSpecificationChanged) {
      this.setState(
        {
          activeSpecificationText: specificationText
        },
        () => {
          if (isSpecificationTextParsable) {
            const activeSpecification =
              this.parseSpecification(specificationText);
            const activeDetail = this.buildDetail(activeSpecification);
            this.setState({
              activeDetail,
              activeSpecification
            });
          }
        }
      );
    }
  }

  async deleteProperty(name) {
    const specification = getSpecification(
      this.props.tables,
      this.props.match.params.id,
      this.props.match.params.cid
    );
    const newSpecification = Helpers.stringifyJson(
      Object.assign({}, _.omit(specification, name)),
      this.props.strictJsonFormat
    );
    await this.updateSpecification(newSpecification);
  }

  newAdditionalProperty(name) {
    const specification = getSpecification(
      this.props.tables,
      this.props.match.params.id,
      this.props.match.params.cid
    );

    this.updateSpecification(
      Helpers.stringifyJson(
        { ...specification, [name]: "" },
        this.props.strictJsonFormat
      )
    );
  }

  async updateSpecification(newSpecification) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMNS_JSON_SCHEMA__SET_SPECIFICATION
    );
    try {
      if (this.props.match.params.cid) {
        this.props.updateColumnProperty(
          this.props.match.params.id,
          this.props.match.params.cid,
          newSpecification,
          "specification"
        );
      } else {
        this.props.updateTableProperty(
          this.props.match.params.id,
          newSpecification,
          "specification"
        );
      }
    } finally {
      await this.props.finishTransaction();
    }
  }

  changeSpecificationKey(key, e) {
    const newKey = e.target.value;
    const value = this.state.activeSpecification[key];
    const newSpecification = _.omit(this.state.activeSpecification, key);

    newSpecification[newKey] = value;
    const newSpecificationText = Helpers.stringifyJson(
      newSpecification,
      this.props.strictJsonFormat
    );
    this.setState(
      {
        activeSpecification: newSpecification,
        activeSpecificationText: newSpecificationText
      },
      () => {
        this.updateSpecification(newSpecificationText);
      }
    );
  }

  changeSpecificationValue(key, deletable, e) {
    let newValue = e.target.value;
    const newSpecification = { ...this.state.activeSpecification };
    try {
      newSpecification[key] = this.convertJSONTextToJSONValue(
        newValue,
        deletable
      );
      const newSpecificationText = Helpers.stringifyJson(
        newSpecification,
        this.props.strictJsonFormat
      );
      this.setState(
        {
          activeSpecification: newSpecification,
          activeSpecificationText: newSpecificationText
        },
        () => {
          this.updateSpecification(newSpecificationText);
        }
      );
    } catch {}
  }

  convertJSONTextToJSONValue(textValue, deletable) {
    if (textValue !== undefined) {
      if (
        textValue !== "" &&
        textValue !== null &&
        textValue !== false &&
        textValue !== 0 &&
        Helpers.isValidJson5Structure(textValue)
      ) {
        return json5.parse(textValue);
      } else {
        if (textValue === "" && !deletable) {
          return undefined;
        }
        if (_.isNumber(textValue)) {
          return +textValue;
        } else if (textValue === "true") {
          return true;
        } else if (textValue === "false") {
          return false;
        }
        return textValue;
      }
    } else {
      return deletable ? "" : undefined;
    }
  }

  getUserFriendlyGroupName(groupPath) {
    let toReturn = groupPath;
    const lastSlashPosition = groupPath.lastIndexOf("/");
    if (lastSlashPosition !== -1) {
      let groupName = groupPath.substring(lastSlashPosition + 1);
      if (_.size(groupName) > 0) {
        toReturn = groupName.replace("-", " ").replace("_", " ");
      }
    }
    return toReturn;
  }

  getDefaultEmptyObject(specificationText) {
    return specificationText === "" ? "{}" : specificationText;
  }

  getStoreSpecification() {
    if (!!this.props.match.params.cid) {
      return this.getDefaultEmptyObject(
        JsonSchemaHelpers.getColumnById(
          this.props.tables,
          this.props.match.params.id,
          this.props.match.params.cid
        )?.specification
      );
    }
    return this.getDefaultEmptyObject(
      this.props.tables[this.props.match.params.id]?.specification
    );
  }

  parseSpecification(specificationText) {
    try {
      return Helpers.parseJson(specificationText);
    } catch {
      return {};
    }
  }

  isSpecificationTextParsable(specificationText) {
    try {
      return !!Helpers.parseJson(specificationText);
    } catch {
      return false;
    }
  }

  hasActiveDataTableSpecificationChanged(specificationText) {
    return this.state.activeSpecificationText !== specificationText;
  }

  hasCodeStrictChanged(prevProps) {
    return (
      prevProps.jsonCodeSettingsStrict !== this.props.jsonCodeSettingsStrict
    );
  }

  hasOpenAPISchemaChanged(prevProps) {
    const prevSchema = JsonSchemaHelpers.getRootSchemaTable(
      prevProps.tables
    )?.schema;
    const schema = JsonSchemaHelpers.getRootSchemaTable(
      this.props.tables
    )?.schema;
    return prevSchema !== schema;
  }

  hasNameChanged(prevProps) {
    if (!!this.props.match.params.cid) {
      const prevColName = this.getDefaultEmptyObject(
        JsonSchemaHelpers.getColumnById(
          prevProps.tables,
          this.props.match.params.id,
          this.props.match.params.cid
        )?.name
      );
      const colName = this.getDefaultEmptyObject(
        JsonSchemaHelpers.getColumnById(
          this.props.tables,
          this.props.match.params.id,
          this.props.match.params.cid
        )?.name
      );
      return prevColName !== colName;
    }
    return false;
  }

  hasActiveDataTableChanged(prevState) {
    return (
      prevState.activeTableId !== this.props.match.params.id ||
      prevState.activeColumnId !== this.props.match.params.cid
    );
  }

  getSchemaAndVersion() {
    const root = JsonSchemaHelpers.getRootSchemaTable(this.props.tables);
    return {
      schema: getActiveSchema({ root, type: this.props.type })
    };
  }

  buildDetail(specification) {
    const col = this.props.match.params.cid
      ? JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
          this.props.tables,
          this.props.catalogColumns.colToTable,
          this.props.match.params.cid
        )
      : undefined;
    if (col?.objectType === TableObjectTypesJson.KEYARRAY) {
      return <></>;
    }

    const { schema } = this.getSchemaAndVersion();

    const { root, path } = getPath(
      this.props.tables,
      this.props.catalogColumns.tableToCol,
      this.props.match.params.id,
      this.props.match.params.cid
    );

    const schemasForPath = extractSchemasForPath(
      { root, path },
      {
        globalSchema: schema,
        jsonCodeSettings: this.props.jsonCodeSettings,
        type: this.props.type
      }
    );

    const cols = this.props.match.params.cid
      ? JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
          this.props.tables,
          this.props.catalogColumns.colToTable,
          this.props.match.params.cid
        )?.cols
      : this.props.tables[this.props.match.params.id].cols;

    return buildDetail({
      schemasForPath,
      specification,
      cols,
      globalSchema: schema
    });
  }

  createNewName() {
    const specification = getSpecification(
      this.props.tables,
      this.props.match.params.id,
      this.props.match.params.cid
    );

    const newName = `newKey${_.size(specification)}`;
    if (specification?.[newName]) {
      return `newKey${_.random(500, 999)}`;
    }
    return newName;
  }

  render() {
    if (this.props.col) {
      return (
        <ColumnsJsonSchemaSingle
          handleTextChange={this.props.handleTextChange.bind(this)}
          handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
          col={this.props.col}
          activeDetail={this.state.activeDetail}
          activeSpecification={this.state.activeSpecification}
          renderCustomDatatypes={this.props.renderCustomDatatypes.bind(this)}
          passedTableId={this.props.passedTableId}
          newAdditionalProperty={this.newAdditionalProperty.bind(this)}
          deleteProperty={this.deleteProperty.bind(this)}
          changeSpecificationValue={this.changeSpecificationValue.bind(this)}
          changeSpecificationKey={this.changeSpecificationKey.bind(this)}
        />
      );
    }
    return (
      <OpenAPISchemaAssistant
        id={this.props.match.params.id}
        cid={this.props.match.params.cid}
        col={this.props.col}
        activeDetail={this.state.activeDetail}
        activeSpecification={this.state.activeSpecification}
        newAdditionalProperty={this.newAdditionalProperty.bind(this)}
        deleteProperty={this.deleteProperty.bind(this)}
        changeSpecificationValue={this.changeSpecificationValue.bind(this)}
        changeSpecificationKey={this.changeSpecificationKey.bind(this)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    jsonCodeSettings: state.model.jsonCodeSettings,
    catalogColumns: state.catalogColumns,
    type: state.model.type,
    strictJsonFormat: state.model?.jsonCodeSettings?.strict
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateTableProperty,
        updateColumnProperty,
        startTransaction,
        finishTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OpenAPIColumnsJSONSchemaSingle)
);
