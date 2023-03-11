import React, { Component } from "react";
import { TYPE, addNotificationSimple } from "../actions/notifications";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { setActiveTask, setDiagramLoading } from "../actions/ui";

import CheckboxSwitch from "../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import LoadingMini from "../components/loading_mini";
import { ModelTypes } from "../enums/enums";
import { MongoDBTLSPanel } from "../components/connection/mongodb_tls_panel";
import { ReferenceSearchValue } from "../platforms/mongodb/class_connection_mongodb";
import { SSHPanel } from "../components/connection/ssh_panel";
import { TLSPanel } from "../components/connection/tls_panel";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { updateConnectionProperty } from "../actions/connections";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

const LOADING_DATABASES_MESSAGE = "Loading databases...";
const OK_STATUS = "ok";

class ConnectionProperties extends Component {
  constructor(props) {
    super(props);
    this.updateStateProperty = this.updateStateProperty.bind(this);
    this.state = {
      databaseNames: [],
      database:
        this.props.activeConnection &&
        this.props.connections[this.props.activeConnection] &&
        this.props.connections[this.props.activeConnection].database
    };
  }

  async updateStateProperty(propertyName, value) {
    await this.props.updateConnectionProperty(
      this.props.activeConnection,
      value,
      propertyName
    );
    this.saveConnectionsToFile(this.props.connections);
  }

  selectDatabase(databases, database) {
    if (databases) {
      const index = databases.indexOf(database);
      if (index > 0) {
        return databases[index];
      } else if (databases.length > 0) {
        return databases[0];
      }
    }
    return "";
  }

  async loadDatabases() {
    if (isElectron()) {
      const token = uuidv4();
      await this.props.setActiveTask({
        token,
        caption: LOADING_DATABASES_MESSAGE
      });
      await this.props.setDiagramLoading(true);
      let connectionObjectToPass =
        this.props.connections[this.props.activeConnection];

      ipcRenderer?.once(
        "connectionsList:testAndLoadCompleted",
        async (event, result) => {
          if (result.error) {
            await this.props.setActiveTask(null);
            await this.props.setDiagramLoading(false);
            await this.props.addNotificationSimple(
              result.error,
              TYPE.ERROR,
              false,
              null,
              null,
              false
            );
            return;
          }
          if (result.status === OK_STATUS) {
            if (result.databases) {
              const originalDatabase = this.state.database;
              this.setState(
                {
                  databaseNames: result.databases,
                  database: this.selectDatabase(
                    result.databases,
                    originalDatabase
                  )
                },
                async () => this.updateStoredConnection(originalDatabase)
              );
              await this.props.addNotificationSimple(
                `Databases loaded.`,
                TYPE.INFO,
                true,
                null,
                null,
                false
              );
            }
          }
          await this.props.setActiveTask(null);
          await this.props.setDiagramLoading(false);
        }
      );

      ipcRenderer?.send("connectionsList:runTestAndLoad", {
        connection: connectionObjectToPass,
        token
      });
    }
  }

  async updateStoredConnection(db) {
    if (this.state.database !== db) {
      await this.props.updateConnectionProperty(
        this.props.activeConnection,
        this.state.database,
        "database"
      );
      this.saveConnectionsToFile(this.props.connections);
    }
  }

  renderConnectionPropertiesByPlatform(platform) {
    switch (platform) {
      case "PG":
        return this.renderPG();
      case "MONGODB":
        return this.renderMongoDBProperties();
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
      default:
        return this.renderMySQLFamily();
    }
  }

  renderMySQLFamily() {
    const connection = this.props.connections[this.props.activeConnection];
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid im-tabs-grid-connections">
          <div className="im-connections-grid-tabs">
            <div />
            <div className="im-tabs-tablist">
              <TabList>
                <Tab>Server</Tab>
                <Tab>SSH</Tab>
                <Tab>SSL/TLS</Tab>
                <Tab>Settings</Tab>
              </TabList>
            </div>
          </div>
          <div className="im-tabs-area p-0">
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderMySQLFamilyProperties()}
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={connection}
                updateProperty={this.updateStateProperty}
                profile={this.props.profile}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <TLSPanel
                availableFeatures={this.props.availableFeatures}
                connection={connection}
                updateProperty={this.updateStateProperty}
                profile={this.props.profile}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderMySQLFamilySettings()}
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }

  renderPG() {
    const connection = this.props.connections[this.props.activeConnection];
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid im-tabs-grid-connections">
          <div className="im-connections-grid-tabs">
            <div />
            <div className="im-tabs-tablist">
              <TabList>
                <Tab>Server</Tab>
                <Tab>SSH</Tab>
                <Tab>SSL/TLS</Tab>
                <Tab>Settings</Tab>
              </TabList>
            </div>
          </div>
          <div className="im-tabs-area p-0">
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderPGProperties()}
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={connection}
                updateProperty={this.updateStateProperty}
                profile={this.props.profile}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <TLSPanel
                availableFeatures={this.props.availableFeatures}
                connection={connection}
                updateProperty={this.updateStateProperty}
                profile={this.props.profile}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderPGSettings()}
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }

  renderMySQLFamilyProperties() {
    return (
      <div className="im-connections-grid">
        <div>Server:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].server
          )}
          onChange={this.handleTextChange.bind(this, "server")}
        />

        <div>Port:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].port
          )}
          onChange={this.handleTextChange.bind(this, "port")}
        />

        <div>User:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].user
          )}
          onChange={this.handleTextChange.bind(this, "user")}
        />

        <div>Password:</div>
        <DebounceInput
          type={this.props.pwdDisplayed ? "text" : "password"}
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].password
          )}
          onChange={this.handleTextChange.bind(this, "password")}
        />
        {this.renderDatabaseList()}
      </div>
    );
  }

  renderPGProperties() {
    return (
      <div className="im-connections-grid">
        <div>Server:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].server
          )}
          onChange={this.handleTextChange.bind(this, "server")}
        />

        <div>Port:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].port
          )}
          onChange={this.handleTextChange.bind(this, "port")}
        />

        <div>Database:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].db
          )}
          onChange={this.handleTextChange.bind(this, "db")}
        />

        <div>User:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].user
          )}
          onChange={this.handleTextChange.bind(this, "user")}
        />

        <div>Password:</div>
        <DebounceInput
          type={this.props.pwdDisplayed ? "text" : "password"}
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].password
          )}
          onChange={this.handleTextChange.bind(this, "password")}
        />
        {this.renderDatabaseList()}
      </div>
    );
  }

  renderMongoDBProperties() {
    const connection = this.props.connections[this.props.activeConnection];
    const showUserNamePassword =
      connection.authtype === "Default" ||
      connection.authtype === "SCRAM-SHA-1" ||
      connection.authtype === "SCRAM-SHA-256";
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid im-tabs-grid-connections">
          <div className="im-connections-grid-tabs">
            <div />
            <div className="im-tabs-tablist">
              <TabList>
                <Tab>Server</Tab>
                <Tab>Authentication</Tab>
                <Tab>SSH</Tab>
                <Tab>SSL/TLS</Tab>
                <Tab>Settings</Tab>
              </TabList>
            </div>
          </div>
          <div className="im-tabs-area p-0">
            <TabPanel className="tabDetails im-tab-panel">
              <div className="im-connections-grid">
                <div className="im-align-self-center">URL:</div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  value={Helpers.gv(connection.url)}
                  onChange={this.handleTextChange.bind(this, "url")}
                />
                {this.renderDatabaseList()}
                <div />
                <CheckboxSwitch
                  label={"Direct connection"}
                  checked={
                    this.props.connections[this.props.activeConnection]
                      .directConnection
                  }
                  onChange={this.handleCheckChange.bind(
                    this,
                    "directConnection"
                  )}
                />
                <div />
                <CheckboxSwitch
                  label={"Retry writes"}
                  checked={
                    this.props.connections[this.props.activeConnection]
                      .retryWrites
                  }
                  onChange={this.handleCheckChange.bind(
                    this,
                    "retryWrites"
                  )}
                />
              </div>
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <div className="im-connections-grid">
                <div className="im-align-self-center">Type:</div>
                <React.Fragment>
                  <select
                    className="im-flex-cols-first-full-width"
                    value={connection.authtype}
                    onChange={this.handleTextChange.bind(this, "authtype")}
                  >
                    <option
                      key="None"
                      value="None"
                      className="im-datatypes-tables"
                    >
                      None
                    </option>
                    <option
                      key="Default"
                      value="Default"
                      className="im-datatypes-tables"
                    >
                      Default
                    </option>
                    <option
                      key="SCRAM-SHA-1"
                      value="SCRAM-SHA-1"
                      className="im-datatypes-tables"
                    >
                      SCRAM-SHA-1
                    </option>
                    <option
                      key="SCRAM-SHA-256"
                      value="SCRAM-SHA-256"
                      className="im-datatypes-tables"
                    >
                      SCRAM-SHA-256
                    </option>
                  </select>
                </React.Fragment>
                {showUserNamePassword === true ? (
                  <>
                    <div className="im-align-self-center">Username:</div>
                    <DebounceInput
                      minLength={1}
                      debounceTimeout={300}
                      type="text"
                      value={Helpers.gv(connection.authuser)}
                      onChange={this.handleTextChange.bind(this, "authuser")}
                    />
                    <div className="im-align-self-center">Password:</div>
                    <DebounceInput
                      minLength={1}
                      debounceTimeout={300}
                      type={this.props.pwdDisplayed ? "text" : "password"}
                      value={Helpers.gv(connection.authpassword)}
                      onChange={this.handleTextChange.bind(
                        this,
                        "authpassword"
                      )}
                    />
                    <div className="im-align-self-center">Auth. Db:</div>
                    <DebounceInput
                      minLength={1}
                      debounceTimeout={300}
                      type="text"
                      value={Helpers.gv(connection.authsource)}
                      onChange={this.handleTextChange.bind(this, "authsource")}
                    />
                  </>
                ) : undefined}
              </div>
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={connection}
                updateProperty={this.updateStateProperty}
                profile={this.props.profile}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <MongoDBTLSPanel
                availableFeatures={this.props.availableFeatures}
                connection={connection}
                updateProperty={this.updateStateProperty}
                profile={this.props.profile}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderMongoDBSettings()}
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }

  renderPGSettings() {
    return (
      <div className="im-connections-grid">
        <div />
        <CheckboxSwitch
          label={`Include ${this.props.localization.L_CONTAINER}`}
          checked={
            this.props.connections[this.props.activeConnection].includeSchema
          }
          onChange={this.handleCheckChange.bind(this, "includeSchema")}
        />
        {this.renderJSONSettings()}
      </div>
    );
  }

  renderJSONSettings() {
    return (
      <>
        <div />
        <CheckboxSwitch
          label={"Parse data and infer JSON structures"}
          checked={
            this.props.connections[this.props.activeConnection].parseData
          }
          onChange={this.handleCheckChange.bind(this, "parseData")}
        />
        <div
          hidden={
            this.props.connections[this.props.activeConnection].parseData ===
            false
          }
        />
        <CheckboxSwitch
          label={"Parse maximum records (no data limit)"}
          checked={this.props.connections[this.props.activeConnection].noLimit}
          onChange={this.handleCheckChange.bind(this, "noLimit")}
          hidden={
            this.props.connections[this.props.activeConnection].parseData ===
            false
          }
        />
        <div
          className="im-align-self-center"
          hidden={
            this.props.connections[this.props.activeConnection].noLimit ===
              true ||
            this.props.connections[this.props.activeConnection].parseData ===
              false
          }
        >
          Data limit:
        </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="number"
          step="100"
          min="0"
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].dataLimit
          )}
          hidden={
            this.props.connections[this.props.activeConnection].noLimit ===
              true ||
            this.props.connections[this.props.activeConnection].parseData ===
              false
          }
          onChange={this.handleTextChange.bind(this, "dataLimit")}
        />
      </>
    );
  }

  renderMongoDBSettings() {
    const hideDataLimit =
      this.props.connections[this.props.activeConnection].source !== "data";
    const noLimit = this.props.connections[this.props.activeConnection].noLimit;
    return (
      <div className="im-connections-grid">
        <div>Schema from:</div>
        <select
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].source
          )}
          onChange={this.handleTextChange.bind(this, "source")}
        >
          <option value="data">Data</option>
          <option value="validator">Validator</option>
        </select>
        {hideDataLimit === false && <div />}
        <CheckboxSwitch
          label={"Parse maximum documents (no data limit)"}
          checked={this.props.connections[this.props.activeConnection].noLimit}
          onChange={this.handleCheckChange.bind(this, "noLimit")}
          hidden={hideDataLimit}
        />
        <div className="im-align-self-center" hidden={hideDataLimit || noLimit}>
          Data limit:
        </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="number"
          step="100"
          min="0"
          hidden={hideDataLimit || noLimit}
          value={Helpers.gv(
            this.props.connections[this.props.activeConnection].dataLimit
          )}
          onChange={this.handleTextChange.bind(this, "dataLimit")}
        />

        {noLimit === false && hideDataLimit === false && <div />}
        {noLimit === false && hideDataLimit === false && (
          <div className="im-input-tip">
            Schema can be inferred from data. Set how many records should be
            iterated.
          </div>
        )}
        {hideDataLimit === false && (
          <>
            <div>References:</div>

            <select
              value={Helpers.gv(
                this.props.connections[this.props.activeConnection]
                  .referenceSearch
              )}
              onChange={this.handleTextChange.bind(this, "referenceSearch")}
            >
              <option value={ReferenceSearchValue.ALL}>All</option>
              <option value={ReferenceSearchValue.FIRST}>First</option>
              <option value={ReferenceSearchValue.NONE}>None</option>
            </select>
            <div></div>
            <div className="im-input-tip">{this.referenceSearchHint()}</div>
          </>
        )}
      </div>
    );
  }

  referenceSearchHint() {
    switch (
      this.props.connections[this.props.activeConnection].referenceSearch
    ) {
      case ReferenceSearchValue.ALL:
        return `All relations between ObjectId and root documents ids will be reversed.`;
      case ReferenceSearchValue.FIRST:
        return `Only first relation between ObjectId and root document id will be reversed.`;
      default:
        return `No relations will be reversed.`;
    }
  }

  renderMySQLFamilySettings() {
    return (
      <div className="im-connections-grid">{this.renderJSONSettings()}</div>
    );
  }

  renderDatabaseList() {
    return (
      <React.Fragment>
        <div className="im-align-self-center">
          {this.props.connections[this.props.activeConnection].type === "PG"
            ? `Schema:`
            : `Database:`}
        </div>
        <div className="im-flex-cols">
          {this.state.databaseNames && this.state.databaseNames.length === 0 ? (
            <DebounceInput
              className="im-flex-cols-first-full-width"
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(
                this.props.connections[this.props.activeConnection].database
              )}
              onChange={this.handleTextChange.bind(this, "database")}
            />
          ) : (
            <React.Fragment>
              <select
                className="im-flex-cols-first-full-width"
                value={Helpers.gv(
                  this.props.connections[this.props.activeConnection].database
                )}
                onChange={this.handleTextChange.bind(this, "database")}
              >
                {this.renderDatabaseListOptionsForDropDown(
                  this.state.databaseNames
                )}
              </select>
            </React.Fragment>
          )}

          <button
            id="btn-load-connections"
            className="im-btn-default im-btn-sm"
            onClick={this.loadDatabases.bind(this)}
          >
            Load databases
          </button>
        </div>
      </React.Fragment>
    );
  }

  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.updateConnectionProperty(
      this.props.activeConnection,
      value,
      propName
    );
    this.saveConnectionsToFile(this.props.connections);
  }

  async handleCheckChange(propName, event) {
    const checked = event.target.checked;
    await this.props.updateConnectionProperty(
      this.props.activeConnection,
      checked,
      propName
    );
    this.saveConnectionsToFile(this.props.connections);
  }

  saveConnectionsToFile(connections) {
    if (isElectron()) {
      ipcRenderer.send("connectionsList:saveConnections", connections);
    }
  }

  renderDatabaseListOptionsForDropDown(databaseNames) {
    return _.map(databaseNames, (name) => {
      return (
        <option key={name} value={name} className="im-datatypes-tables">
          {name}
        </option>
      );
    });
  }

  render() {
    if (!this.props.activeConnection || this.props.activeConnection === null) {
      return null;
    }

    if (this.props.connections[this.props.activeConnection] === undefined) {
      return null;
    }

    return (
      <div>
        {this.props.diagramLoading ? (
          <LoadingMini />
        ) : (
          <React.Fragment>
            <div className="im-connections-grid">
              <div>Name:</div>
              <DebounceInput
                type="text"
                debounceTimeout={300}
                value={Helpers.gv(
                  this.props.connections[this.props.activeConnection].name
                )}
                onChange={this.handleTextChange.bind(this, "name")}
              />

              <div>Description:</div>
              <DebounceInput
                element="textarea"
                minLength={1}
                debounceTimeout={300}
                className="im-textarea"
                value={Helpers.gv(
                  this.props.connections[this.props.activeConnection].desc
                )}
                onChange={this.handleTextChange.bind(this, "desc")}
              />

              <div className="im-content-spacer-md" />
              <div />
            </div>
            {this.renderConnectionPropertiesByPlatform(
              Helpers.gv(
                this.props.connections[this.props.activeConnection].type
              )
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeConnection: state.activeConnection,
    connections: state.connections,
    diagramLoading: state.ui.diagramLoading,
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateConnectionProperty,
        setDiagramLoading,
        setActiveTask,
        addNotificationSimple
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConnectionProperties)
);
