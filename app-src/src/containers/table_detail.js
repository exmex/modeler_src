import {
  DefaultGeneratorOptionsMSSQL,
  DefaultGeneratorOptionsMySQLFamily,
  DefaultGeneratorOptionsPG,
  DefaultGeneratorOptionsSQLite
} from "../generator/model-to-sql-model/generator_options";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  generateCreateTableSQL as generateMSSQLCreateTableSQL,
  generateSelectTableSQL as generateMSSQLSelectTableSQL
} from "../platforms/mssql/generator/generator_sql_mssql";
import {
  generateCreateTableSQL as generateMySQLFamilyCreateTableSQL,
  generateSelectTableSQL as generateMySQLFamilySelectTableSQL
} from "../platforms/mysql_family/generator/generator_sql_mysql_family";
import {
  generateCreateTableSQL as generatePgCreateTableSQL,
  generateSelectTableSQL as generatePgSelectTableSQL
} from "../platforms/pg/generator/generator_sql_pg";
import {
  generateCreateTableSQL as generateSQLiteCreateTableSQL,
  generateSelectTableSQL as generateSQLiteSelectTableSQL
} from "../platforms/sqlite/generator/generator_sql_sqlite";
import {
  getActiveDiagramAvailableImplements,
  getActiveDiagramAvailableRelations,
  getActiveDiagramObject
} from "../selectors/selector_diagram";

import CollapsiblePanel from "../components/collapsible_panel";
import Columns from "./columns";
import Indexes from "./indexes";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import Keys from "./keys";
import { ModelTypes } from "../enums/enums";
import NewColumn from "./new_column";
import Relations from "./table_relations";
import TableBeforeAfter from "./table_before_after";
import TableCustomCode from "./table_custom_code";
import TableExtendedProperties from "./table_extended_properties";
import TableGraphQl from "../platforms/graphql/table_graphql";
import TableGraphics from "./table_graphics";
import TableMongoDb from "../platforms/mongodb/table_mongodb";
import TableMongoose from "../platforms/mongoose/table_mongoose";
import TableProperties from "./table_properties";
import TableSequelize from "../platforms/sequelize/table_sequelize";
import TableSequelizeModules from "../platforms/sequelize/table_sequelize_modules";
import TableStatements from "./table_statements";
import _ from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class TableDetail extends Component {
  getCaptionByObjectType() {
    let activeTable = this.props.tables[this.props.match.params.id];
    if (activeTable.objectType) {
      if (activeTable.objectType === "interface") {
        return this.props.localization.L_INTERFACE;
      } else if (activeTable.objectType === "type") {
        return this.props.localization.L_TYPE;
      } else if (activeTable.objectType === "union") {
        return this.props.localization.L_UNION;
      } else if (activeTable.objectType === "input") {
        return this.props.localization.L_INPUT;
      } else if (activeTable.objectType === "composite") {
        return this.props.localization.L_COMPOSITE;
      } else {
        return this.props.localization.L_TABLE;
      }
    } else return this.props.localization.L_TABLE;
  }

  getTabsByModelType() {
    switch (this.props.type) {
      case ModelTypes.SEQUELIZE:
        return <TableSequelize />;
      case ModelTypes.MONGODB:
        return <TableMongoDb />;
      case ModelTypes.GRAPHQL:
        return <TableGraphQl />;
      case ModelTypes.MONGOOSE:
        return <TableMongoose />;
      case ModelTypes.PG:
        return (
          <TableStatements
            generateCreateTableSQL={generatePgCreateTableSQL}
            generateSelectTableSQL={generatePgSelectTableSQL}
            defaultGeneratorOptions={DefaultGeneratorOptionsPG(
              this.props.sqlSettings
            )}
          />
        );
      case ModelTypes.MSSQL:
        return (
          <TableStatements
            generateCreateTableSQL={generateMSSQLCreateTableSQL}
            generateSelectTableSQL={generateMSSQLSelectTableSQL}
            defaultGeneratorOptions={DefaultGeneratorOptionsMSSQL(
              this.props.sqlSettings
            )}
          />
        );
      case ModelTypes.SQLITE:
        return (
          <TableStatements
            generateCreateTableSQL={generateSQLiteCreateTableSQL}
            generateSelectTableSQL={generateSQLiteSelectTableSQL}
            defaultGeneratorOptions={DefaultGeneratorOptionsSQLite}
          />
        );
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return (
          <TableStatements
            generateCreateTableSQL={generateMySQLFamilyCreateTableSQL}
            generateSelectTableSQL={generateMySQLFamilySelectTableSQL}
            defaultGeneratorOptions={DefaultGeneratorOptionsMySQLFamily}
          />
        );
      default:
        return <></>;
    }
  }

  existsDiagramItemOnActiveDiagram() {
    return this.props.activeDiagramObject?.diagramItems[
      this.props.match.params.id
    ];
  }

  render() {
    if (
      !this.props.match.params.id ||
      !this.props.tables[this.props.match.params.id]
    ) {
      return (
        <div className="aside-right-message">
          Select a {this.props.localization.L_TABLE} to see details.
        </div>
      );
    }
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>{_.upperFirst(this.getCaptionByObjectType())} Details</Tab>

              {this.existsDiagramItemOnActiveDiagram() ? (
                <Tab>Graphics</Tab>
              ) : undefined}
              {JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                <Tab>{this.props.localization.L_COLUMNS}</Tab>
              )}
              {this.props.type !== ModelTypes.LOGICAL &&
              !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
                <Tab>{this.props.localization.L_SCRIPT}</Tab>
              ) : (
                ""
              )}
              {this.props.type === "SEQUELIZE" ? <Tab>Modules</Tab> : ""}
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <div>
                <CollapsiblePanel
                  panelKey="pTableDetail"
                  panelTitle={_.upperFirst(this.getCaptionByObjectType())}
                  panelIsExpanded={this.props.panelsExpanded.pTableDetail}
                >
                  <div className="im-collapsible-panel">
                    <TableProperties />
                  </div>
                </CollapsiblePanel>
                {this.props.type !== ModelTypes.LOGICAL &&
                !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
                  <CollapsiblePanel
                    panelKey="pTableExtended"
                    panelTitle={
                      _.upperFirst(this.getCaptionByObjectType()) + " specifics"
                    }
                    //panelIsExpanded="false"
                    panelIsExpanded={this.props.panelsExpanded.pTableExtended}
                  >
                    <div className="im-collapsible-panel">
                      <TableExtendedProperties />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
                {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
                  <CollapsiblePanel
                    panelKey="pTableColumns"
                    panelTitle={this.props.localization.L_COLUMNS}
                    panelIsExpanded={this.props.panelsExpanded.pTableColumns}
                  >
                    <div>
                      {this.props.tables[this.props.match.params.id]
                        .objectType !== "union" && <NewColumn />}
                      <div className="im-collapsible-panel">
                        <Columns passedTableId={this.props.match.params.id} />
                      </div>
                    </div>
                  </CollapsiblePanel>
                )}
                {this.props.type !== "GRAPHQL" &&
                  !JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
                  this.props.tables[this.props.match.params.id].objectType !==
                    "composite" && (
                    <CollapsiblePanel
                      panelKey="pTableKeys"
                      panelTitle="Keys"
                      panelIsExpanded={this.props.panelsExpanded.pTableKeys}
                    >
                      <div className="im-collapsible-panel">
                        <Keys />
                      </div>
                    </CollapsiblePanel>
                  )}
                {this.props.type !== "GRAPHQL" &&
                !JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
                this.props.type !== ModelTypes.LOGICAL &&
                this.props.type !== "MONGOOSE" &&
                this.props.tables[this.props.match.params.id].objectType !==
                  "composite" ? (
                  <CollapsiblePanel
                    panelKey="pTableIndexes"
                    panelTitle="Indexes"
                    panelIsExpanded={this.props.panelsExpanded.pTableIndexes}
                  >
                    <div className="im-collapsible-panel">
                      <Indexes />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
                {!JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
                this.props.tables[this.props.match.params.id].objectType !==
                  "composite" ? (
                  <CollapsiblePanel
                    panelKey="pTableRelations"
                    panelTitle={this.props.localization.L_RELATIONS}
                    panelIsExpanded={this.props.panelsExpanded.pTableRelations}
                  >
                    <div className="im-collapsible-panel">
                      <Relations
                        table={this.props.tables[this.props.match.params.id]}
                        relations={this.props.activeDiagramAvailableRelations}
                        tables={this.props.tables}
                        localization={this.props.localization}
                      />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
                {this.props.type === "GRAPHQL" ? (
                  <CollapsiblePanel
                    panelKey="pImplements"
                    panelTitle={this.props.localization.L_IMPLEMENTS}
                    panelIsExpanded={this.props.panelsExpanded.pImplements}
                  >
                    <div className="im-collapsible-panel">
                      <Relations
                        table={this.props.tables[this.props.match.params.id]}
                        relations={this.props.activeDiagramAvailableImplements}
                        tables={this.props.tables}
                        localization={this.props.localization}
                      />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
                {this.props.type !== ModelTypes.LOGICAL &&
                !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
                  <CollapsiblePanel
                    panelKey="pTableBeforeAfter"
                    panelTitle="Before and After Scripts"
                    panelIsExpanded={
                      this.props.panelsExpanded.pTableBeforeAfter
                    }
                  >
                    <div className="im-collapsible-panel">
                      <TableBeforeAfter />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
              </div>
            </TabPanel>
            {this.existsDiagramItemOnActiveDiagram() && (
              <TabPanel className="im-aside">
                <CollapsiblePanel
                  panelKey="pTableColors"
                  panelTitle="Colors"
                  panelIsExpanded={this.props.panelsExpanded.pTableColors}
                >
                  <div className="im-collapsible-panel">
                    <TableGraphics />
                  </div>
                </CollapsiblePanel>
              </TabPanel>
            )}

            {JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <TabPanel className="im-aside">
                <CollapsiblePanel
                  panelKey="pTableColumns"
                  panelTitle={this.props.localization.L_COLUMNS}
                  panelIsExpanded={this.props.panelsExpanded.pTableColumns}
                >
                  <div>
                    <div className="im-collapsible-panel">
                      <Columns passedTableId={this.props.match.params.id} />
                    </div>
                  </div>
                </CollapsiblePanel>
              </TabPanel>
            )}

            {this.props.type !== ModelTypes.LOGICAL &&
            !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
              <TabPanel className="im-aside">
                {this.getTabsByModelType()}
                <CollapsiblePanel
                  panelTitle="Custom code"
                  panelKey="pTableCode"
                  panelIsExpanded={this.props.panelsExpanded.pTableCode}
                  customCss="im-collapsible-wrapper-code"
                >
                  <div className="im-collapsible-panel">
                    <TableCustomCode />
                  </div>
                </CollapsiblePanel>
              </TabPanel>
            ) : undefined}
            {this.props.type === "SEQUELIZE" ? (
              <TabPanel className="im-aside">
                <TableSequelizeModules />
              </TabPanel>
            ) : (
              ""
            )}
          </div>
        </div>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state),
    activeDiagramAvailableRelations: getActiveDiagramAvailableRelations(state),
    activeDiagramAvailableImplements:
      getActiveDiagramAvailableImplements(state),
    tables: state.tables,
    type: state.model.type,
    panelsExpanded: state.ui.panelsExpanded,
    localization: state.localization,
    sqlSettings: state.model.sqlSettings
  };
}

export default withRouter(connect(mapStateToProps)(TableDetail));
