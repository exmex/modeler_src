import { ModelTypes, ModelTypesForHumans } from "../enums/enums";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { finishTransaction, startTransaction } from "../actions/undoredo";
import {
  updateJsonCodeSettingsProperty,
  updateSqlSettingsProperty
} from "../actions/model";

import CollapsiblePanel from "../components/collapsible_panel";
import GeneratorHelpers from "../helpers/generator/generator_helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import ModelBeforeAfter from "./model_before_after";
import ModelCodeGenerationSequelize from "../platforms/sequelize/model_code_generation_sequelize";
import ModelCustomDataTypes from "./model_custom_datatypes";
import ModelDefaultValuesGraphQl from "../platforms/graphql/model_default_values_graphql";
import ModelDefaultValuesJsonSchema from "../platforms/jsonschema/model_default_values_jsonschema";
import ModelDefaultValuesLogical from "../platforms/logical/model_default_values_logical";
import ModelDefaultValuesMongoDb from "../platforms/mongodb/model_default_values_mongodb";
import ModelDefaultValuesMongoose from "../platforms/mongoose/model_default_values_mongoose";
import ModelDefaultValuesMySQLFamily from "../platforms/mysql_family/model_default_values_mysql_family";
import ModelDefaultValuesPG from "../platforms/pg/model_default_values_pg";
import ModelDefaultValuesSQLite from "../platforms/sqlite/model_default_values_sqlite";
import ModelDefaultValuesSequelize from "../platforms/sequelize/model_default_values_sequelize";
import ModelExtendedProperties from "./model_extended_properties";
import ModelGraphics from "./model_graphics";
import { ModelJsonCodeSettings } from "./model_json_code_settings/model_json_code_settings";
import ModelProperties from "./model_properties";
import { ModelSQLSettings } from "./model_sql_settings/model_sql_settings";
import NameAutoGenerationProperties from "./name_auto_generation_properties";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { withRouter } from "react-router-dom";
import { ModelJsonCodeSettingsSelect } from "./model_json_code_settings/model_json_code_settings_select";
import { TEST_ID } from "common";

class ModelDetail extends Component {
  async updateSqlSettingsProperty(pName, newValue) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DETAIL__UPDATE_SQL_SETTINGS_PROPERTY
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

  render() {
    if (!this.props.model) {
      return (
        <div className="aside-right-message">
          Select a model to see details.
        </div>
      );
    }

    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>Project Details</Tab>
              <Tab>Graphics</Tab>
              {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                <Tab>Settings</Tab>
              )}
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelTitle={this.props.localization.L_MODEL}
                panelKey="pModel"
                panelIsExpanded={this.props.panelsExpanded.pModel}
              >
                <div className="im-collapsible-panel">
                  <ModelProperties />
                </div>
              </CollapsiblePanel>
              {this.props.type === ModelTypes.MARIADB ||
              this.props.type === ModelTypes.MYSQL ||
              this.props.type === "PG" ||
              this.props.type === "SQLITE" ? (
                <CollapsiblePanel
                  panelTitle={`Before and After Scripts`}
                  panelKey="pModelBeforeAfter"
                  panelIsExpanded={this.props.panelsExpanded.pModelBeforeAfter}
                >
                  <div className="im-collapsible-panel">
                    <ModelBeforeAfter />
                  </div>
                </CollapsiblePanel>
              ) : undefined}
            </TabPanel>
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelTitle="Graphics"
                panelKey="pModelGraphics"
                panelIsExpanded={this.props.panelsExpanded.pModelGraphics}
              >
                <div className="im-collapsible-panel">
                  <ModelGraphics />
                </div>
              </CollapsiblePanel>
            </TabPanel>
            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <TabPanel className="im-aside">
                {this.props.type !== ModelTypes.GRAPHQL &&
                  this.props.type !== ModelTypes.MONGODB &&
                  this.props.type !== ModelTypes.MONGOOSE && (
                    <CollapsiblePanel
                      panelTitle="Foreign key settings"
                      panelKey="pModelExtended"
                      panelIsExpanded={this.props.panelsExpanded.pModelExtended}
                    >
                      <div className="im-collapsible-panel">
                        <ModelExtendedProperties />
                      </div>
                    </CollapsiblePanel>
                  )}
                {this.props.type === ModelTypes.PG && (
                  <CollapsiblePanel
                    panelTitle="Naming conventions"
                    panelKey="pModelExtended"
                    panelIsExpanded={this.props.panelsExpanded.pModelExtended}
                  >
                    <div className="im-collapsible-panel">
                      <NameAutoGenerationProperties />
                    </div>
                  </CollapsiblePanel>
                )}
                <CollapsiblePanel
                  panelTitle="Custom data types"
                  panelKey="pModelDataTypes"
                  panelIsExpanded={this.props.panelsExpanded.pModelDataTypes}
                >
                  <div className="im-collapsible-panel">
                    <ModelCustomDataTypes />
                  </div>
                </CollapsiblePanel>

                {this.props.type !== "GRAPHQL" && (
                  <CollapsiblePanel
                    panelTitle={
                      "Default values for new  " +
                      this.props.localization.L_TABLES
                    }
                    panelKey="pModelDefaultValues"
                    panelIsExpanded={
                      this.props.panelsExpanded.pModelDefaultValues
                    }
                  >
                    <div className="im-collapsible-panel">
                      {this.props.type === "SEQUELIZE" ? (
                        <ModelDefaultValuesSequelize />
                      ) : (
                        ""
                      )}

                      {this.props.type === ModelTypes.MYSQL ||
                      this.props.type === ModelTypes.MARIADB ? (
                        <ModelDefaultValuesMySQLFamily />
                      ) : (
                        ""
                      )}

                      {this.props.type === "SQLITE" ? (
                        <ModelDefaultValuesSQLite />
                      ) : (
                        ""
                      )}

                      {this.props.type === "LOGICAL" ? (
                        <ModelDefaultValuesLogical />
                      ) : (
                        ""
                      )}

                      {JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
                        <ModelDefaultValuesJsonSchema />
                      ) : (
                        ""
                      )}

                      {this.props.type === "PG" ? <ModelDefaultValuesPG /> : ""}

                      {this.props.type === "MONGODB" ? (
                        <ModelDefaultValuesMongoDb />
                      ) : (
                        ""
                      )}

                      {this.props.type === "GRAPHQL" ? (
                        <ModelDefaultValuesGraphQl />
                      ) : (
                        ""
                      )}

                      {this.props.type === "MONGOOSE" ? (
                        <ModelDefaultValuesMongoose />
                      ) : (
                        ""
                      )}
                    </div>
                  </CollapsiblePanel>
                )}

                {this.props.type === "SEQUELIZE" ? (
                  <CollapsiblePanel
                    panelTitle="Code generation"
                    panelKey="pModelCodeGeneration"
                    panelIsExpanded={
                      this.props.panelsExpanded.pModelCodeGeneration
                    }
                  >
                    <div className="im-collapsible-panel">
                      <ModelCodeGenerationSequelize />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
                {GeneratorHelpers.hasSqlGenerationSettings(this.props.type) && (
                  <CollapsiblePanel
                    panelTitle="SQL Generation"
                    panelKey="pModelExtended"
                    panelIsExpanded={
                      this.props.panelsExpanded.pModelCodeGeneration
                    }
                  >
                    <div className="im-collapsible-panel">
                      <ModelSQLSettings
                        type={this.props.type}
                        source={this.props.sqlSettings}
                        updateProperty={this.updateSqlSettingsProperty.bind(
                          this
                        )}
                        containerCaption={this.props.localization.L_CONTAINER}
                      />
                    </div>
                  </CollapsiblePanel>
                )}

                {GeneratorHelpers.hasJsonGenerationSettings(
                  this.props.type
                ) && (
                  <CollapsiblePanel
                    panelTitle="Code Generation"
                    panelKey="pCodeGeneration"
                    panelIsExpanded={
                      this.props.panelsExpanded.pModelCodeGeneration
                    }
                  >
                    <div className="im-collapsible-panel">
                      <ModelJsonCodeSettingsSelect
                        source={this.props.jsonCodeSettings}
                        updateProperty={this.updateJsonCodeSettingsProperty.bind(
                          this
                        )}
                        containerCaption={"Format:"}
                        propertyName={"format"}
                        options={{
                          json: "json",
                          yaml: "yaml"
                        }}
                        testid={TEST_ID.SQL_CODE_SETTINGS.JSON_CODE_FORMAT}
                      />
                      <ModelJsonCodeSettings
                        type={this.props.type}
                        source={this.props.jsonCodeSettings}
                        updateProperty={this.updateJsonCodeSettingsProperty.bind(
                          this
                        )}
                        containerCaption={"Generate strict JSON"}
                      />
                      <ModelJsonCodeSettingsSelect
                        source={this.props.jsonCodeSettings}
                        updateProperty={this.updateJsonCodeSettingsProperty.bind(
                          this
                        )}
                        containerCaption={"Definitions key:"}
                        propertyName={"definitionKeyName"}
                        options={{
                          bySchema: "From schema",
                          definitions: "definitions",
                          defs: "$defs"
                        }}
                        testid={
                          TEST_ID.SQL_CODE_SETTINGS.JSON_CODE_DEFINITION_KEY
                        }
                      />
                    </div>
                  </CollapsiblePanel>
                )}
              </TabPanel>
            )}
          </div>
        </div>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  return {
    panelsExpanded: state.ui.panelsExpanded,
    type: state.model.type,
    sqlSettings: state.model.sqlSettings,
    jsonCodeSettings: state.model.jsonCodeSettings,
    localization: state.localization,
    model: state.model
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateSqlSettingsProperty,
        updateJsonCodeSettingsProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelDetail)
);
