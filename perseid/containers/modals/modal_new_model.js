import {
  ClassTableJsonSchema,
  TableControlTypesJson,
  TableObjectTypesJson
} from "../../platforms/jsonschema/class_table_jsonschema";
import React, { Component } from "react";
import { TEST_ID, getAppVersionObject } from "common";
import { addDiagram, addDiagramItems } from "../../actions/diagrams";
import { createModel, showDiagram } from "../../actions/model";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  getDefaultModeType,
  getDefaultSchema,
  getSupportedModelTypes
} from "../../app_config";
import {
  setDisplayMode,
  setForcedRender,
  toggleNewModelModal
} from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import Choice from "../../components/choice";
import { ClassDiagram } from "../../classes/class_diagram";
import { ClassDiagramItem } from "../../classes/class_diagram_item";
import { ClassModelGraphQl } from "../../platforms/graphql/class_model_graphql";
import { ClassModelJsonSchema } from "../../platforms/jsonschema/class_model_jsonschema";
import { ClassModelLogical } from "../../platforms/logical/class_model_logical";
import { ClassModelMongoDb } from "../../platforms/mongodb/class_model_mongodb";
import { ClassModelMongoose } from "../../platforms/mongoose/class_model_mongoose";
import { ClassModelMySQLFamily } from "../../platforms/mysql_family/class_model_mysql_family";
import { ClassModelPG } from "../../platforms/pg/class_model_pg";
import { ClassModelSQLite } from "../../platforms/sqlite/class_model_sqlite";
import { ClassModelSequelize } from "../../platforms/sequelize/class_model_sequelize";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "../../enums/enums";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchTable } from "../../actions/tables";
import { getHistoryContext } from "../../helpers/history/history";
import { navigateToDiagramUrl } from "../../components/url_navigation";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class ModalNewModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      desc: "",
      type: getDefaultModeType(),
      linegraphics: "detailed",
      schema: getDefaultSchema(getDefaultModeType())
    };
    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.newModelModalIsDisplayed === true) {
        this.props.toggleNewModelModal();
      }
    }
  }

  handleChangeName(event) {
    this.setState({ name: event.target.value });
    //event.preventDefault();
  }

  handleChangeDesc(event) {
    this.setState({ desc: event.target.value });
    //event.preventDefault();
  }

  handleChangeSchema(event) {
    this.setState({ schema: event.target.value });
  }

  handleChangeModelTypeSelect(event) {
    this.setState({
      type: event.target.value,
      schema: getDefaultSchema(event.target.value)
    });
    event.preventDefault();
  }

  handleChangeType(value) {
    this.setState({ type: value, schema: getDefaultSchema(value) });
  }

  handleChangeModelType(value) {
    this.setState({ type: value, schema: getDefaultSchema(value) });
    //event.preventDefault();
  }

  handleChangeModelLineGraphics(event) {
    this.setState({ linegraphics: event.target.value });
    event.preventDefault();
  }

  onShowModalClick() {
    this.props.toggleNewModelModal();
  }

  async createNewModel() {
    var storedIn = getAppVersionObject(process.env.REACT_APP_PRODUCT);
    var defaultValues = {};
    var newModel;
    var diagram = new ClassDiagram(uuidv4(), "Main Diagram", "", true);

    if (this.state.type === ModelTypes.MONGODB) {
      defaultValues = {
        def_coltopk: true,
        def_collation: "",
        def_validationLevel: "na",
        def_validationAction: "na"
      };
      //defaultValues = {};
      newModel = new ClassModelMongoDb(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }
    if (this.state.type === ModelTypes.MONGOOSE) {
      defaultValues = {
        def_coltopk: true,
        def_others: ""
      };
      newModel = new ClassModelMongoose(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (this.state.type === ModelTypes.GRAPHQL) {
      defaultValues = {
        def_coltopk: true,
        def_others: ""
      };
      newModel = new ClassModelGraphQl(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (
      this.state.type === ModelTypes.MARIADB ||
      this.state.type === ModelTypes.MYSQL
    ) {
      defaultValues = {
        def_coltopk: true,
        def_tabletype: "na",
        def_charset: "",
        def_collation: ""
      };
      newModel = new ClassModelMySQLFamily(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (this.state.type === ModelTypes.SQLITE) {
      defaultValues = {
        def_coltopk: true
      };
      newModel = new ClassModelSQLite(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (this.state.type === ModelTypes.LOGICAL) {
      defaultValues = {
        def_coltopk: false
      };
      newModel = new ClassModelLogical(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (
      this.state.type === ModelTypes.JSONSCHEMA ||
      this.state.type === ModelTypes.FULLJSON ||
      this.state.type === ModelTypes.OPENAPI
    ) {
      defaultValues = {
        def_coltopk: false
      };
      newModel = new ClassModelJsonSchema(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );

      var newSchema = new ClassTableJsonSchema(
        uuidv4(),
        JsonSchemaHelpers.getDefaultRootObjectName(this.state.type),
        [],
        [],
        false,
        this.state.type === ModelTypes.OPENAPI
          ? TableObjectTypesJson.ANY
          : TableObjectTypesJson.OBJECT,
        TableControlTypesJson.ROOT,
        this.state.schema
      );
    }

    if (this.state.type === ModelTypes.PG) {
      defaultValues = {
        def_coltopk: true
      };

      newModel = new ClassModelPG(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (this.state.type === ModelTypes.SEQUELIZE) {
      defaultValues = {
        def_coltopk: true,
        def_freezeTableName: false,
        def_timestamps: false,
        def_paranoid: false,
        def_version: false
      };
      newModel = new ClassModelSequelize(
        uuidv4(),
        diagram.id,
        this.state.name,
        this.state.desc,
        this.state.type,
        1,
        storedIn,
        defaultValues
      );
    }

    if (
      (this.state.type === ModelTypes.LOGICAL ||
        this.state.type === ModelTypes.GRAPHQL ||
        this.state.type === ModelTypes.MONGOOSE) &&
      this.props.currentDisplayMode === "indexes"
    ) {
      this.props.setDisplayMode("metadata");
    }

    await this.props.createModel(newModel, diagram);

    navigateToDiagramUrl(
      this.props.match.url,
      this.props.history,
      newModel.id,
      diagram.id
    );

    await this.props.setForcedRender({ domToModel: false });

    if (JsonSchemaHelpers.isPerseidModelType(this.state.type)) {
      const di = new ClassDiagramItem(newSchema.id, 50, 40, 60, 180);
      di.background = "#03a9f4";
      await this.props.fetchTable(newSchema);
      await this.props.addDiagramItems(diagram.id, [di]);

      var JsonDiagram = new ClassDiagram(uuidv4(), "TREE DIAGRAM", "", true);
      JsonDiagram.type = "treediagram";
      await this.props.addDiagram(JsonDiagram);
      const historyContext = getHistoryContext(
        this.props.history,
        this.props.match
      );
      await this.props.startTransaction(
        historyContext,
        UndoRedoDef.MODAL_NEW_MODEL__NEW_MODEL
      );
      try {
        await this.props.showDiagram(
          newModel.id,
          JsonDiagram.id,
          true,
          historyContext
        );
      } finally {
        await this.props.finishTransaction(true);
      }
    }
    this.setState({ name: "", desc: "" });
    this.props.toggleNewModelModal();
  }

  modelTypeOptions() {
    return getSupportedModelTypes().map((item) => (
      <option key={item.id} value={item.id}>
        {item.text}
      </option>
    ));
  }

  renderSchema(type) {
    if (type === ModelTypes.JSONSCHEMA) {
      return this.renderJsonSchema();
    } else if (type === ModelTypes.OPENAPI) {
      return this.renderOpenApiVersion();
    } else return "";
  }

  renderJsonSchema() {
    return (
      <>
        <div>Schema version:</div>
        <select
          value={this.state.schema}
          onChange={this.handleChangeSchema.bind(this)}
        >
          {JsonSchemaHelpers.makeSelectSchemas(
            JsonSchemaHelpers.getJsonSchemasArray()
          )}
        </select>
      </>
    );
  }

  renderOpenApiVersion() {
    return (
      <>
        <div>OpenAPI version:</div>
        <select
          value={this.state.schema}
          onChange={this.handleChangeSchema.bind(this)}
        >
          {JsonSchemaHelpers.makeSelectSchemas(
            JsonSchemaHelpers.getOpenApiVersionsArray()
          )}
        </select>
      </>
    );
  }

  render() {
    if (this.props.newModelModalIsDisplayed === true) {
      const disabledButton = this.state.name === "" ? true : false;
      const disabledStyle = disabledButton ? " im-disabled" : "";
      const buttonStyle = `im-btn-default${disabledStyle}`;

      return (
        <CSSTransition
          in={this.props.newModelModalIsDisplayed}
          key="ModalNewModel"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.MODALS.NEW_MODEL}
              >
                <div className="modal-header">New project</div>
                <div className="modal-content-confirm">
                  <div>
                    <Choice
                      customClassName="im-choice-item"
                      customImgClassName="im-choice-project-type"
                      onClick={this.handleChangeType.bind(this)}
                      choices={getSupportedModelTypes()}
                      selectedChoiceId={this.state.type}
                    />
                    <div className="im-content-spacer-lg" />
                    <div className="im-connections-grid">
                      <div>Type:</div>
                      <select
                        value={this.state.type}
                        onChange={this.handleChangeModelTypeSelect.bind(this)}
                      >
                        {this.modelTypeOptions()}
                      </select>

                      <div className="im-content-spacer-md" />
                      <div />

                      <div className="im-align-self-center">
                        Name: <span className="im-input-tip"> (required)</span>
                      </div>
                      <DebounceInput
                        minLength={1}
                        debounceTimeout={300}
                        type="text"
                        value={this.state.name}
                        onChange={this.handleChangeName.bind(this)}
                        data-testid={TEST_ID.MODAL_NEW_MODEL.NEW_PROJECT_NAME}
                      />
                      <div>Description:</div>

                      <DebounceInput
                        element="textarea"
                        minLength={1}
                        debounceTimeout={300}
                        className="im-textarea"
                        value={this.state.desc}
                        onChange={this.handleChangeDesc.bind(this)}
                      />

                      {this.renderSchema(this.state.type)}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="im-btn-default im-margin-right"
                    onClick={this.onShowModalClick.bind(this)}
                  >
                    Close
                  </button>
                  <button
                    id="btn-create-new-project"
                    className={buttonStyle}
                    onClick={this.createNewModel.bind(this)}
                    disabled={disabledButton}
                    title={
                      this.state.name === "" ? "Project name is required" : ""
                    }
                    data-testid={TEST_ID.MODAL_NEW_MODEL.CREATE_NEW_PROJECT}
                  >
                    Create new project
                  </button>
                </div>
              </div>
            </Draggable>
          </div>
        </CSSTransition>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    newModelModalIsDisplayed: state.ui.newModelModalIsDisplayed,
    currentDisplayMode: state.ui.currentDisplayMode
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleNewModelModal,
        createModel,
        fetchTable,
        addDiagramItems,
        addDiagram,
        showDiagram,
        startTransaction,
        finishTransaction,
        setDisplayMode,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalNewModel)
);
