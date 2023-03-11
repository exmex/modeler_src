import {
  DefaultGeneratorOptionsMSSQL,
  DefaultGeneratorOptionsMySQLFamily,
  DefaultGeneratorOptionsPG,
  DefaultGeneratorOptionsSQLite
} from "../generator/model-to-sql-model/generator_options";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { finishTransaction, startTransaction } from "../actions/undoredo";
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

import CheckboxSwitch from "../components/checkbox_switch";
import CollapsiblePanel from "../components/collapsible_panel";
import ColumnTableProperties from "./column_table_properties";
import Columns from "./columns";
import EmbExtendedProperties from "./emb_extended_properties";
import Helpers from "../helpers/helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import ModelPartialJsonSchema from "../platforms/jsonschema/model_partial_jsonschema";
import { ModelTypes } from "../enums/enums";
import NewColumn from "./new_column";
import TableGraphics from "./table_graphics";
import TableMongoDb from "../platforms/mongodb/table_mongodb";
import TableSequelize from "../platforms/sequelize/table_sequelize";
import TableStatements from "./table_statements";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { getHistoryContext } from "../helpers/history/history";
import { navigateToProjectUrl } from "../components/url_navigation";
import { switchEmbeddable } from "../actions/tables";
import { withRouter } from "react-router-dom";

class EmbDetail extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.EMB_DETAIL__UPDATE_TABLE_PROPERTY
    );
    try {
      await this.props.updateTableProperty(
        this.props.match.params.id,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }
  componentDidUpdate() {
    if (this.props.passedTableId === null) {
      navigateToProjectUrl(
        this.props.match.url,
        this.props.history,
        this.props.match.params.mid,
        this.props.match.params.did
      );
    }
  }

  getTabsByModelType() {
    switch (this.props.type) {
      case ModelTypes.SEQUELIZE:
        return <TableSequelize />;
      case ModelTypes.MONGODB:
        return <TableMongoDb />;
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
    return (
      this.props.activeDiagramObject &&
      this.props.activeDiagramObject.diagramItems[this.props.match.params.id]
    );
  }

  async handleEmbeddableCheckboxChange(event) {
    const checked = event.target.checked;
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.EMB_DETAIL__SWITCH_EMBEDDABLE
    );
    try {
      await this.props.switchEmbeddable(
        historyContext,
        this.props.match.params.id,
        checked
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (
      (!this.props.passedTableId && !this.props.match.params.id) ||
      (!this.props.tables[this.props.match.params.id] &&
        !this.props.tables[this.props.passedTableId])
    ) {
      return (
        <div className="aside-right-message">
          Select a {this.props.localization.L_TABLE_EMBEDDABLE} to see details.
        </div>
      );
    }
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>
                {_.upperFirst(this.props.localization.L_TABLE_EMBEDDABLE)}{" "}
                Details
              </Tab>
              {this.existsDiagramItemOnActiveDiagram() ? (
                <Tab>Graphics</Tab>
              ) : (
                <></>
              )}
              {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
                !JsonSchemaHelpers.isRef(
                  this.props.tables[this.props.match.params.id]
                ) && (
                  <>
                    <Tab>{this.props.localization.L_COLUMNS}</Tab>
                    <Tab>Script</Tab>
                  </>
                )}
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <div>
                <CollapsiblePanel
                  panelKey="pTableDetail"
                  panelTitle={this.props.localization.L_TABLE_EMBEDDABLE}
                  panelIsExpanded={this.props.panelsExpanded.pTableDetail}
                >
                  <div className="im-collapsible-panel">
                    <ColumnTableProperties
                      passedTableId={
                        this.props.passedTableId
                          ? this.props.passedTableId
                          : this.props.match.params.id
                      }
                    />

                    {this.props.type === "MONGODB" ||
                    this.props.type === "MONGOOSE" ? (
                      <div className="im-properties-grid">
                        <div />
                        <CheckboxSwitch
                          label={_.upperFirst(
                            this.props.localization.L_TABLE_EMBEDDABLE
                          )}
                          checked={Helpers.gch(
                            this.props.tables[this.props.match.params.id]
                              .embeddable
                          )}
                          onChange={this.handleEmbeddableCheckboxChange.bind(
                            this
                          )}
                        />
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>
                </CollapsiblePanel>

                {this.props.type !== ModelTypes.LOGICAL &&
                !JsonSchemaHelpers.isPerseidModelType(this.props.type) ? (
                  <CollapsiblePanel
                    panelKey="pTableExtended"
                    panelTitle={
                      this.props.localization.L_TABLE_EMBEDDABLE + " specifics"
                    }
                    panelIsExpanded={this.props.panelsExpanded.pTableExtended}
                  >
                    <div className="im-collapsible-panel">
                      <EmbExtendedProperties />
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
                      <NewColumn
                        passedTableId={
                          this.props.tables[this.props.passedTableId]
                            ? this.props.passedTableId
                            : this.props.match.params.id
                        }
                      />
                      <div className="im-collapsible-panel">
                        <Columns
                          passedTableId={
                            this.props.passedTableId
                              ? this.props.passedTableId
                              : this.props.match.params.id
                          }
                        />
                      </div>
                    </div>
                  </CollapsiblePanel>
                )}
              </div>
            </TabPanel>

            {this.existsDiagramItemOnActiveDiagram() ? (
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
            ) : (
              <></>
            )}
            {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
              !JsonSchemaHelpers.isRef(
                this.props.tables[this.props.match.params.id]
              ) && (
                <>
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
                  <TabPanel>
                    <ModelPartialJsonSchema forSubSchema={true} />
                  </TabPanel>
                </>
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
    tables: state.tables,
    type: state.model.type,
    panelsExpanded: state.ui.panelsExpanded,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        switchEmbeddable,
        startTransaction,
        finishTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EmbDetail)
);
