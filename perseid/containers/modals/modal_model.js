import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  clearModel,
  createModel,
  updateJsonCodeSettingsProperty,
  updateSqlSettingsProperty
} from "../../actions/model";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import GeneratorHelpers from "../../helpers/generator/generator_helpers";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import ModelBeforeAfter from "../model_before_after";
import ModelCustomDataTypes from "../model_custom_datatypes";
import ModelDefaultValuesJsonSchema from "../../platforms/jsonschema/model_default_values_jsonschema";
import ModelDefaultValuesLogical from "../../platforms/logical/model_default_values_logical";
import ModelDefaultValuesMongoDb from "../../platforms/mongodb/model_default_values_mongodb";
import ModelDefaultValuesMongoose from "../../platforms/mongoose/model_default_values_mongoose";
import ModelDefaultValuesMySQLFamily from "../../platforms/mysql_family/model_default_values_mysql_family";
import ModelDefaultValuesPG from "../../platforms/pg/model_default_values_pg";
import ModelDefaultValuesSQLite from "../../platforms/sqlite/model_default_values_sqlite";
import ModelDefaultValuesSequelize from "../../platforms/sequelize/model_default_values_sequelize";
import ModelExtendedProperties from "../model_extended_properties";
import ModelGraphics from "../model_graphics";
import ModelProperties from "../model_properties";
import { ModelTypes } from "../../enums/enums";
import NameAutoGenerationProperties from "../name_auto_generation_properties";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { toggleModelModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      desc: "",
      type: "MONGODB",
      linegraphics: "detailed"
    };
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.modelModalIsDisplayed === true) {
        this.props.toggleModelModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  handleChangeName(event) {
    this.setState({ name: event.target.value });
    event.preventDefault();
  }

  handleChangeDesc(event) {
    this.setState({ desc: event.target.value });
    event.preventDefault();
  }

  handleChangeModelTypeSelect(event) {
    this.setState({ type: event.target.value });
    event.preventDefault();
  }

  handleChangeModelType(value) {
    this.setState({ type: value });
    //event.preventDefault();
  }

  handleChangeModelLineGraphics(event) {
    this.setState({ linegraphics: event.target.value });
    event.preventDefault();
  }

  onShowModalClick() {
    this.props.toggleModelModal();
  }

  async updateSqlSettingsProperty(pName, newValue) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODAL_MODEL__UPDATE_SQL_SETTINGS_PROPERTY
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
    if (this.props.modelModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.modelModalIsDisplayed}
          key="ModalModel"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div className="modal modal" data-testid={TEST_ID.MODALS.MODEL}>
                <div className="modal-header">Project</div>
                <div className="modal-content">
                  <Tabs className="im-tabs">
                    <div className="im-tabs-grid">
                      <div className="im-tabs-tablist">
                        <TabList>
                          <Tab>Project Details</Tab>
                          <Tab>Graphics</Tab>
                          {this.props.type === ModelTypes.MARIADB ||
                          this.props.type === ModelTypes.MYSQL ||
                          this.props.type === "PG" ||
                          this.props.type === "SQLITE" ? (
                            <Tab>Before and After Scripts</Tab>
                          ) : (
                            ""
                          )}

                          {this.props.type !== ModelTypes.GRAPHQL &&
                            this.props.type !== ModelTypes.MONGODB &&
                            this.props.type !== ModelTypes.MONGOOSE &&
                            !JsonSchemaHelpers.isPerseidModelType(
                              this.props.type
                            ) && <Tab>Settings</Tab>}

                          {this.props.type !== "GRAPHQL" &&
                            !JsonSchemaHelpers.isPerseidModelType(
                              this.props.type
                            ) && <Tab>Default Values</Tab>}
                          {!JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) && <Tab>Custom Data Types</Tab>}
                        </TabList>
                      </div>

                      <div className="im-tabs-area">
                        <TabPanel className="tabDetails im-tab-panel">
                          <ModelProperties />
                        </TabPanel>
                        <TabPanel className="tabDetails im-tab-panel">
                          <ModelGraphics />
                        </TabPanel>
                        {this.props.type === ModelTypes.MARIADB ||
                        this.props.type === ModelTypes.MYSQL ||
                        this.props.type === "PG" ||
                        this.props.type === "SQLITE" ? (
                          <TabPanel className="tabModelBeforeAfter im-tab-panel">
                            <ModelBeforeAfter />
                          </TabPanel>
                        ) : (
                          ""
                        )}

                        {!JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) &&
                          this.props.type !== ModelTypes.GRAPHQL &&
                          this.props.type !== ModelTypes.MONGODB &&
                          this.props.type !== ModelTypes.MONGOOSE && (
                            <TabPanel className="tabDetails im-tab-panel">
                              <ModelExtendedProperties />
                              {this.props.type === ModelTypes.PG && (
                                <>
                                  <div className="im-content-spacer-lg" />
                                  <NameAutoGenerationProperties />
                                </>
                              )}
                            </TabPanel>
                          )}
                        {this.props.type !== "GRAPHQL" &&
                          !JsonSchemaHelpers.isPerseidModelType(
                            this.props.type
                          ) && (
                            <TabPanel className="tabSettings im-tab-panel">
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

                              {JsonSchemaHelpers.isPerseidModelType(
                                this.props.type
                              ) ? (
                                <ModelDefaultValuesJsonSchema />
                              ) : (
                                ""
                              )}

                              {this.props.type === "PG" ? (
                                <ModelDefaultValuesPG />
                              ) : (
                                ""
                              )}

                              {this.props.type === "MONGODB" ? (
                                <ModelDefaultValuesMongoDb />
                              ) : (
                                ""
                              )}

                              {this.props.type === "MONGOOSE" ? (
                                <ModelDefaultValuesMongoose />
                              ) : (
                                ""
                              )}
                            </TabPanel>
                          )}
                        {!JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) && (
                          <TabPanel className="tabSettings im-tab-panel">
                            <ModelCustomDataTypes />
                          </TabPanel>
                        )}
                      </div>
                    </div>
                  </Tabs>
                </div>

                <div className="modal-footer">
                  <button
                    autoFocus
                    className="im-btn-default im-margin-right"
                    onClick={this.onShowModalClick.bind(this)}
                  >
                    Close
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
    modelModalIsDisplayed: state.ui.modelModalIsDisplayed,
    type: state.model.type,
    sqlSettings: state.model.sqlSettings,
    jsonCodeSettings: state.model.jsonCodeSettings,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleModelModal,
        clearModel,
        createModel,
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
  connect(mapStateToProps, mapDispatchToProps)(ModalModel)
);
