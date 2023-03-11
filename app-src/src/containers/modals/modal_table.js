import {
  DefaultGeneratorOptionsMSSQL,
  DefaultGeneratorOptionsMySQLFamily,
  DefaultGeneratorOptionsPG,
  DefaultGeneratorOptionsSQLite
} from "../../generator/model-to-sql-model/generator_options";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  generateCreateTableSQL as generateMSSQLCreateTableSQL,
  generateSelectTableSQL as generateMSSQLSelectTableSQL
} from "../../platforms/mssql/generator/generator_sql_mssql";
import {
  generateCreateTableSQL as generateMySQLFamilyCreateTableSQL,
  generateSelectTableSQL as generateMySQLFamilySelectTableSQL
} from "../../platforms/mysql_family/generator/generator_sql_mysql_family";
import {
  generateCreateTableSQL as generatePgCreateTableSQL,
  generateSelectTableSQL as generatePgSelectTableSQL
} from "../../platforms/pg/generator/generator_sql_pg";
import {
  generateCreateTableSQL as generateSQLiteCreateTableSQL,
  generateSelectTableSQL as generateSQLiteSelectTableSQL
} from "../../platforms/sqlite/generator/generator_sql_sqlite";
import {
  getActiveDiagramAvailableImplements,
  getActiveDiagramAvailableRelations,
  getActiveDiagramItems,
  getActiveDiagramObject
} from "../../selectors/selector_diagram";

import { CSSTransition } from "react-transition-group";
import Columns from "../columns";
import Draggable from "react-draggable";
import EmbExtendedProperties from "../emb_extended_properties";
import Indexes from "../indexes";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import Keys from "../keys";
import { ModelTypes } from "../../enums/enums";
import NewColumn from "../new_column";
import Relations from "../table_relations";
import { TEST_ID } from "common";
import TableBeforeAfter from "../table_before_after";
import TableCustomCode from "../table_custom_code";
import TableExtendedProperties from "../table_extended_properties";
import TableGraphQl from "../../platforms/graphql/table_graphql";
import TableGraphics from "../table_graphics";
import TableMongoDb from "../../platforms/mongodb/table_mongodb";
import TableMongoose from "../../platforms/mongoose/table_mongoose";
import TableProperties from "../table_properties";
import TableSequelize from "../../platforms/sequelize/table_sequelize";
import TableSequelizeModules from "../../platforms/sequelize/table_sequelize_modules";
import TableStatements from "../table_statements";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleTableModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalTable extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.tableModalIsDisplayed === true) {
        this.props.toggleTableModal();
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
    this.props.toggleTableModal();
  }

  noChange() {
    return null;
  }

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
    return (
      this.props.activeDiagramObject &&
      this.props.activeDiagramObject.diagramItems[this.props.match.params.id]
    );
  }

  render() {
    if (this.props.tableModalIsDisplayed === true) {
      var caption = "";
      var embeddable;
      if (
        this.props.tables &&
        this.props.match.params.id &&
        this.props.tables[this.props.match.params.id] !== undefined
      ) {
        if (
          this.props.tables[this.props.match.params.id].embeddable === undefined
        ) {
          embeddable = false;
        } else {
          embeddable = this.props.tables[this.props.match.params.id].embeddable;
        }

        if (embeddable === false) {
          caption = _.upperFirst(this.props.localization.L_TABLE) + " details ";
        } else {
          caption = "Detail";
        }

        if (this.props.type === "GRAPHQL") {
          caption = _.upperFirst(this.getCaptionByObjectType());
        }
        const isComposite =
          this.props.tables[this.props.match.params.id].objectType ===
          "composite";

        return (
          <CSSTransition
            in={this.props.tableModalIsDisplayed}
            key="modal"
            classNames="fade"
            unmountOnExit
            timeout={{ enter: 500, exit: 100 }}
          >
            <Draggable handle=".modal-header">
              <div className="modal" data-testid={TEST_ID.MODALS.TABLE}>
                <div className="modal-header">
                  {caption}
                  {this.props.tables[this.props.match.params.id]
                    ? " - " + this.props.tables[this.props.match.params.id].name
                    : ""}
                </div>
                <div className="modal-content">
                  <Tabs className="im-tabs">
                    <div className="im-tabs-grid">
                      <div className="im-tabs-tablist">
                        <TabList>
                          {!embeddable && <Tab>Details</Tab>}
                          {!JsonSchemaHelpers.isRef(
                            this.props.tables[this.props.match.params.id]
                          ) && (
                            <Tab>
                              {_.upperFirst(this.props.localization.L_COLUMNS)}
                            </Tab>
                          )}
                          {embeddable === false &&
                          !isComposite &&
                          this.props.type !== "GRAPHQL" &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) ? (
                            <Tab>Keys</Tab>
                          ) : (
                            ""
                          )}
                          {this.props.type !== "MONGOOSE" &&
                          (this.props.type === ModelTypes.MONGODB ||
                            this.props.type === ModelTypes.MARIADB ||
                            this.props.type === ModelTypes.MYSQL ||
                            this.props.type === ModelTypes.MSSQL ||
                            this.props.type === "PG" ||
                            this.props.type === "SQLITE") &&
                          this.props.match.params.id &&
                          this.props.tables[this.props.match.params.id]
                            .embeddable === false &&
                          !isComposite ? (
                            <Tab>Indexes</Tab>
                          ) : (
                            ""
                          )}
                          {embeddable === false &&
                          !isComposite &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) ? (
                            <Tab>
                              {_.upperFirst(
                                this.props.localization.L_RELATIONS
                              )}
                            </Tab>
                          ) : (
                            ""
                          )}
                          {this.props.type === "GRAPHQL" &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) &&
                          embeddable === false ? (
                            <Tab>
                              {_.upperFirst(
                                this.props.localization.L_IMPLEMENTS
                              )}
                            </Tab>
                          ) : (
                            ""
                          )}
                          {this.props.type !== ModelTypes.LOGICAL &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) &&
                          embeddable === false &&
                          !isComposite ? (
                            <Tab>
                              {_.upperFirst(this.props.localization.L_SCRIPT)}
                            </Tab>
                          ) : (
                            ""
                          )}

                          {this.props.type !== ModelTypes.LOGICAL &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) &&
                          embeddable === false &&
                          this.props.type === "SEQUELIZE" ? (
                            <Tab>Modules</Tab>
                          ) : (
                            ""
                          )}

                          {this.props.type !== ModelTypes.LOGICAL &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) &&
                          embeddable === false &&
                          !isComposite ? (
                            <Tab>Before and After Scripts</Tab>
                          ) : (
                            ""
                          )}
                          {this.props.type !== ModelTypes.LOGICAL &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) &&
                          embeddable === false &&
                          !isComposite ? (
                            <Tab>Custom Code</Tab>
                          ) : (
                            ""
                          )}
                          {this.existsDiagramItemOnActiveDiagram() &&
                          !embeddable ? (
                            <Tab>Graphics</Tab>
                          ) : undefined}
                        </TabList>
                      </div>

                      <div className="im-tabs-area">
                        {!embeddable && (
                          <TabPanel className="tabDetails im-tab-panel">
                            <TableProperties />
                            <div className="im-content-spacer-md" />
                            {this.props.tables[this.props.match.params.id]
                              .embeddable === false ||
                            this.props.type === "SEQUELIZE"
                              ? this.props.type !== "GRAPHQL" && (
                                  <TableExtendedProperties />
                                )
                              : ""}
                            {this.props.tables[this.props.match.params.id]
                              .embeddable && this.props.type === "MONGODB" ? (
                              <EmbExtendedProperties />
                            ) : (
                              ""
                            )}
                          </TabPanel>
                        )}

                        {!JsonSchemaHelpers.isRef(
                          this.props.tables[this.props.match.params.id]
                        ) && (
                          <TabPanel className="tabColumns im-tab-panel">
                            {this.props.tables[this.props.match.params.id]
                              .objectType !== "union" && (
                              <div className="im-new-col-fixed">
                                <NewColumn />
                              </div>
                            )}

                            <div className="im-new-col-content">
                              <div className="im-collapsible-panel">
                                <Columns
                                  passedTableId={this.props.match.params.id}
                                />
                              </div>
                            </div>
                          </TabPanel>
                        )}
                        {embeddable === false &&
                        !isComposite &&
                        this.props.type !== "GRAPHQL" &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) ? (
                          <TabPanel className="tabKeys im-tab-panel">
                            <Keys />
                          </TabPanel>
                        ) : (
                          ""
                        )}
                        {this.props.type !== "MONGOOSE" &&
                        (this.props.type === ModelTypes.MONGODB ||
                          this.props.type === ModelTypes.MARIADB ||
                          this.props.type === ModelTypes.MYSQL ||
                          this.props.type === ModelTypes.MSSQL ||
                          this.props.type === "PG" ||
                          this.props.type === "SQLITE") &&
                        this.props.match.params.id &&
                        this.props.tables[this.props.match.params.id]
                          .embeddable === false &&
                        !isComposite ? (
                          <TabPanel className="tabIndexes im-tab-panel">
                            <Indexes />
                          </TabPanel>
                        ) : (
                          ""
                        )}
                        {embeddable === false &&
                        !isComposite &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) ? (
                          <TabPanel className="tabRelations im-tab-panel">
                            <Relations
                              table={
                                this.props.tables[this.props.match.params.id]
                              }
                              relations={
                                this.props.activeDiagramAvailableRelations
                              }
                              tables={this.props.tables}
                              localization={this.props.localization}
                            />
                          </TabPanel>
                        ) : (
                          ""
                        )}

                        {this.props.type === "GRAPHQL" &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) &&
                        embeddable === false ? (
                          <TabPanel className="tabRelations im-tab-panel">
                            <Relations
                              table={
                                this.props.tables[this.props.match.params.id]
                              }
                              relations={
                                this.props.activeDiagramAvailableImplements
                              }
                              tables={this.props.tables}
                              localization={this.props.localization}
                            />
                          </TabPanel>
                        ) : (
                          ""
                        )}

                        {this.props.type !== ModelTypes.LOGICAL &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) &&
                        embeddable === false &&
                        !isComposite ? (
                          <TabPanel className="tabSQL im-tab-panel">
                            {this.getTabsByModelType()}
                          </TabPanel>
                        ) : (
                          ""
                        )}

                        {this.props.type !== ModelTypes.LOGICAL &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) &&
                        embeddable === false &&
                        this.props.type === "SEQUELIZE" ? (
                          <TabPanel className="im-aside">
                            <TableSequelizeModules />
                          </TabPanel>
                        ) : (
                          ""
                        )}

                        {this.props.type !== ModelTypes.LOGICAL &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) &&
                        embeddable === false &&
                        !isComposite ? (
                          <TabPanel>
                            <TableBeforeAfter />
                          </TabPanel>
                        ) : (
                          ""
                        )}

                        {this.props.type !== ModelTypes.LOGICAL &&
                        !JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) &&
                        embeddable === false &&
                        !isComposite ? (
                          <TabPanel className="tabCustomCode im-tab-panel">
                            <TableCustomCode />
                          </TabPanel>
                        ) : (
                          ""
                        )}
                        {this.existsDiagramItemOnActiveDiagram() &&
                        !embeddable ? (
                          <TabPanel className="tabGraphics im-tab-panel">
                            <TableGraphics />
                          </TabPanel>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </Tabs>
                </div>
                <div className="modal-footer">
                  <button
                    autoFocus
                    id="im-close"
                    className="im-btn-default"
                    onClick={this.onShowModalClick.bind(this)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Draggable>
          </CSSTransition>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state),
    relations: state.relations,
    activeDiagramItems: getActiveDiagramItems(state),
    tables: state.tables,
    tableModalIsDisplayed: state.ui.tableModalIsDisplayed,
    localization: state.localization,
    type: state.model.type,
    activeDiagramAvailableRelations: getActiveDiagramAvailableRelations(state),
    activeDiagramAvailableImplements:
      getActiveDiagramAvailableImplements(state),
    sqlSettings: state.model.sqlSettings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleTableModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalTable)
);
