import { Features, isFeatureAvailable } from "../../helpers/features/features";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  updateJsonCodeSettingsProperty,
  updateModelProperty,
  updateSqlSettingsProperty
} from "../../actions/model";

import CheckboxSwitch from "../../components/checkbox_switch";
import Draggable from "react-draggable";
import GeneratorHelpers from "../../helpers/generator/generator_helpers";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import ModelGraphQl from "../../platforms/graphql/model_graphql";
import { ModelJsonCodeSettings } from "../model_json_code_settings/model_json_code_settings";
import { ModelJsonCodeSettingsSelect } from "../model_json_code_settings/model_json_code_settings_select";
import ModelJsonSchema from "../../platforms/jsonschema/model_jsonschema";
import ModelMongoDb from "../../platforms/mongodb/model_mongodb";
import ModelMongoose from "../../platforms/mongoose/model_mongoose";
import { ModelSQLSettings } from "../model_sql_settings/model_sql_settings";
import ModelSequelize from "../../platforms/sequelize/model_sequelize";
import ModelSequelizeModules from "../../platforms/sequelize/model_sequelize_modules";
import { ModelTypes } from "../../enums/enums";
import OrderItems from "../order_items";
import StatementsModelDiagram from "../statements_model_diagram";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { generateMySQLFamilyModelSQL } from "../../platforms/mysql_family/generator/generator_sql_mysql_family";
import { generatePgModelSQL } from "../../platforms/pg/generator/generator_sql_pg";
import { generateSQLiteModelSQL } from "../../platforms/sqlite/generator/generator_sql_sqlite";
import { getActiveDiagramObject } from "../../selectors/selector_diagram";
import { getHistoryContext } from "../../helpers/history/history";
import isElectron from "is-electron";
import { toggleSqlModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalSql extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.sqlModalIsDisplayed === true) {
        this.props.toggleSqlModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  onShowModalClick() {
    this.props.toggleSqlModal();
  }

  async updateSqlSettingsProperty(pName, newValue) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODAL_SQL__UPDATE_SQL_SETTINGS_PROPERTY
    );
    try {
      await this.props.updateSqlSettingsProperty(
        this.props.match.mid,
        newValue,
        pName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async updateJsonCodeSettingsProperty(pName, newValue) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DETAIL__UPDATE_JSON_CODE_SETTINGS_PROPERTY
    );
    try {
      await this.props.updateJsonCodeSettingsProperty(
        this.props.match.mid,
        newValue,
        pName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleWriteFileParam(event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODAL_SQL__UPDATE_MODEL_PROPERTY
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        checked,
        "writeFileParam"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  renderScriptTab() {
    if (this.props.type === "SEQUELIZE") {
      return <ModelSequelize />;
    } else if (this.props.type === "MONGODB") {
      return <ModelMongoDb />;
    } else if (this.props.type === "GRAPHQL") {
      return <ModelGraphQl />;
    } else if (this.props.type === "MONGOOSE") {
      return <ModelMongoose />;
    } else if (this.props.type === ModelTypes.PG) {
      return <StatementsModelDiagram getScript={generatePgModelSQL} />;
    } else if (this.props.type === ModelTypes.SQLITE) {
      return <StatementsModelDiagram getScript={generateSQLiteModelSQL} />;
    } else if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      return <ModelJsonSchema />;
    } else {
      return <StatementsModelDiagram getScript={generateMySQLFamilyModelSQL} />;
    }
  }

  isDiagramScriptSupported() {
    return (
      isFeatureAvailable(
        this.props.availableFeatures,
        Features.MULTIDIAGRAMS,
        this.props.profile
      ) && _.size(this.props.diagrams) > 1
    );
  }

  renderDiagramScriptTab() {
    if (this.props.type === ModelTypes.SEQUELIZE) {
      return <ModelSequelize onlyActiveDiagram />;
    } else if (this.props.type === ModelTypes.MONGODB) {
      return <ModelMongoDb onlyActiveDiagram />;
    } else if (this.props.type === ModelTypes.GRAPHQL) {
      return <ModelGraphQl onlyActiveDiagram />;
    } else if (this.props.type === ModelTypes.MONGOOSE) {
      return <ModelMongoose onlyActiveDiagram />;
    } else if (this.props.type === ModelTypes.PG) {
      return (
        <StatementsModelDiagram
          getScript={generatePgModelSQL}
          onlyActiveDiagram
        />
      );
    } else if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      return <ModelJsonSchema onlyActiveDiagram />;
    } else if (this.props.type === ModelTypes.SQLITE) {
      return (
        <StatementsModelDiagram
          getScript={generateSQLiteModelSQL}
          onlyActiveDiagram
        />
      );
    } else if (
      this.props.type === ModelTypes.MYSQL ||
      this.props.type === ModelTypes.MARIADB
    ) {
      return (
        <StatementsModelDiagram
          getScript={generateMySQLFamilyModelSQL}
          onlyActiveDiagram
        />
      );
    } else {
      return <></>;
    }
  }

  renderDiagramScriptTabSequelize() {
    return <ModelSequelizeModules onlyActiveDiagram />;
  }

  render() {
    const isMainDiagram =
      this.props.activeDiagramObject && this.props.activeDiagramObject.main;

    if (this.props.sqlModalIsDisplayed === true) {
      return (
        <Draggable handle=".modal-header">
          <div className="modal modal-sql" data-testid={TEST_ID.MODALS.SQL}>
            <div className="modal-header">
              {_.upperFirst(this.props.localization.L_SCRIPT)}
            </div>
            <div className="modal-content">
              <Tabs className="im-tabs">
                <div className="im-tabs-grid">
                  <div className="im-tabs-tablist">
                    <TabList>
                      <Tab>{"Project " + this.props.localization.L_SCRIPT}</Tab>
                      {this.props.type === "SEQUELIZE" ? (
                        <Tab>Project modules</Tab>
                      ) : (
                        ""
                      )}
                      {this.isDiagramScriptSupported() && !isMainDiagram ? (
                        <Tab>
                          {this.props.activeDiagramObject.name}{" "}
                          {this.props.localization.L_SCRIPT}
                        </Tab>
                      ) : (
                        <></>
                      )}
                      {this.isDiagramScriptSupported() &&
                      !isMainDiagram &&
                      this.props.type === ModelTypes.SEQUELIZE ? (
                        <Tab>
                          {this.props.activeDiagramObject.name}
                          {" modules"}
                        </Tab>
                      ) : (
                        <></>
                      )}
                      {(GeneratorHelpers.hasSqlGenerationSettings(
                        this.props.type
                      ) ||
                        GeneratorHelpers.hasJsonGenerationSettings(
                          this.props.type
                        )) && <Tab>Generation settings</Tab>}
                      {GeneratorHelpers.hasSqlGenerationSettings(
                        this.props.type
                      ) && <Tab>Order items</Tab>}
                    </TabList>
                  </div>

                  <div className="im-tabs-area im-tabs-area-nopadding">
                    <TabPanel className="tabDetails im-tab-panel">
                      {this.renderScriptTab()}
                    </TabPanel>

                    {this.props.type === "SEQUELIZE" ? (
                      <TabPanel>
                        <ModelSequelizeModules />
                      </TabPanel>
                    ) : (
                      ""
                    )}

                    {this.isDiagramScriptSupported() && !isMainDiagram ? (
                      <TabPanel className="tabDetails im-tab-panel">
                        {this.renderDiagramScriptTab()}
                      </TabPanel>
                    ) : (
                      <></>
                    )}

                    {this.isDiagramScriptSupported() &&
                    !isMainDiagram &&
                    this.props.type === ModelTypes.SEQUELIZE ? (
                      <TabPanel className="tabDetails im-tab-panel">
                        {this.renderDiagramScriptTabSequelize()}
                      </TabPanel>
                    ) : (
                      <></>
                    )}

                    {GeneratorHelpers.hasSqlGenerationSettings(
                      this.props.type
                    ) && (
                      <TabPanel>
                        <ModelSQLSettings
                          type={this.props.type}
                          source={this.props.sqlSettings}
                          updateProperty={this.updateSqlSettingsProperty.bind(
                            this
                          )}
                          containerCaption={this.props.localization.L_CONTAINER}
                        />
                      </TabPanel>
                    )}

                    {GeneratorHelpers.hasSqlGenerationSettings(
                      this.props.type
                    ) && (
                      <TabPanel>
                        <OrderItems />
                      </TabPanel>
                    )}

                    {GeneratorHelpers.hasJsonGenerationSettings(
                      this.props.type
                    ) && (
                      <TabPanel>
                        <div className="im-tabs-area">
                          <div className="im-connections-grid">
                            <ModelJsonCodeSettingsSelect
                              source={this.props.jsonCodeSettings}
                              updateProperty={this.updateJsonCodeSettingsProperty.bind(
                                this
                              )}
                              containerCaption={"Key for definitions:"}
                              propertyName={"definitionKeyName"}
                              options={{
                                bySchema: "According to the schema version",
                                definitions: "definitions",
                                defs: "$defs"
                              }}
                              testid={
                                TEST_ID.SQL_CODE_SETTINGS
                                  .JSON_CODE_DEFINITION_KEY
                              }
                            />
                            <ModelJsonCodeSettingsSelect
                              source={this.props.jsonCodeSettings}
                              updateProperty={this.updateJsonCodeSettingsProperty.bind(
                                this
                              )}
                              containerCaption={"Output format:"}
                              propertyName={"format"}
                              options={{
                                json: "json",
                                yaml: "yaml"
                              }}
                              testid={
                                TEST_ID.SQL_CODE_SETTINGS.JSON_CODE_FORMAT
                              }
                            />
                            {this.props.jsonCodeSettings &&
                              this.props.jsonCodeSettings.format === "json" && (
                                <>
                                  <ModelJsonCodeSettings
                                    type={this.props.type}
                                    source={this.props.jsonCodeSettings}
                                    updateProperty={this.updateJsonCodeSettingsProperty.bind(
                                      this
                                    )}
                                    containerCaption={"Generate strict JSON"}
                                  />
                                  <div className="im-content-spacer-md" />
                                  <div />
                                </>
                              )}
                          </div>
                        </div>
                      </TabPanel>
                    )}
                  </div>
                </div>
              </Tabs>
            </div>
            <div className="modal-footer">
              {isElectron() ? (
                <div className="im-display-inline-block im-float-left im-p-sm">
                  <div className="im-align-left">
                    <CheckboxSwitch
                      label="Overwrite existing files"
                      checked={this.props.writeFileParam}
                      onChange={this.handleWriteFileParam.bind(this)}
                    />
                  </div>
                </div>
              ) : (
                ""
              )}
              <button
                autoFocus
                className="im-btn-default"
                onClick={this.onShowModalClick.bind(this)}
              >
                Close
              </button>
            </div>
          </div>
        </Draggable>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    localization: state.localization,
    writeFileParam: state.model.writeFileParam,
    sqlSettings: state.model.sqlSettings,
    jsonCodeSettings: state.model.jsonCodeSettings,
    type: state.model.type,
    availableFeatures: state.profile.availableFeatures,
    diagrams: state.diagrams,
    activeDiagramObject: getActiveDiagramObject(state),
    profile: state.profile,
    sqlModalIsDisplayed: state.ui.sqlModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleSqlModal,
        updateModelProperty,
        updateSqlSettingsProperty,
        updateJsonCodeSettingsProperty,
        startTransaction,
        finishTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalSql)
);
