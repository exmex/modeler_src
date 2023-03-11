import {
  ClassConnectionMongoDb,
  ReferenceSearchValue
} from "../../platforms/mongodb/class_connection_mongodb";
import { Features, isFeatureAvailable } from "../../helpers/features/features";
import React, { Component } from "react";
import { TYPE, addNotificationSimple } from "../../actions/notifications";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { getAvailableFeatures, getSupportedModelTypes } from "../../app_config";
import {
  setActiveTask,
  setDiagramLoading,
  toggleNewConnectionModal
} from "../../actions/ui";

import CheckboxSwitch from "../../components/checkbox_switch";
import Choice from "../../components/choice";
import { ChooseFilePathField } from "../../components/common/choose_file_path_field";
import { ClassConnectionMSSQL } from "../../platforms/mssql/class_connection_mssql";
import { ClassConnectionMySQLFamily } from "../../platforms/mysql_family/class_connection_mysql_family";
import { ClassConnectionPG } from "../../platforms/pg/class_connection_pg";
import { ClassConnectionSQLite } from "../../platforms/mysql_family/class_connection_sqlite";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import Helpers from "../../helpers/helpers";
import LoadingMini from "../../components/loading_mini";
import { ModelTypes } from "../../enums/enums";
import { MongoDBTLSPanel } from "../../components/connection/mongodb_tls_panel";
import { SSHPanel } from "../../components/connection/ssh_panel";
import { TEST_ID } from "common";
import { TLSPanel } from "../../components/connection/tls_panel";
import _ from "lodash";
import { addConnection } from "../../actions/connections";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { sqliteFilters } from "../../components/connection/filters";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

const INIT_STATE = {
  databaseNames: [],
  name: "",
  desc: "",
  server: "",
  port: "",
  user: "",
  password: "",
  database: "",
  db: "",
  url: "",
  sshEnabled: false,
  sshhost: "",
  sshport: "",
  sshusername: "",
  sshpassword: "",
  sshprivatekey: "",
  sshpassphrase: "",
  authtype: "None",
  authuser: "",
  authpassword: "",
  authsource: "",
  includeSchema: true,
  pwdDisplayed: false,
  parseData: true,
  noLimit: false,
  dataLimit: 1000,
  source: "data",
  referenceSearch: ReferenceSearchValue.FIRST,
  sslEnabled: false,
  sslRejectUnauthorized: true,
  sslCA: "",
  sslCert: "",
  sslKey: "",
  sslPassPhrase: "",
  sslServerName: "",
  tlsEnabled: false,
  tlsCAFile: "",
  tlsCertificateKeyFile: "",
  tlsCertificateKeyFilePassword: "",
  directConnection: false,
  retryWrites: false,
  tlsAllowInvalidHostnames: false,
  filePath: "",
  encrypt: false,
  trustServerCertificate: true
};

const LOADING_DATABASES_MESSAGE = "Loading databases...";
const OK_STATUS = "ok";

class ModalNewConnection extends Component {
  constructor(props) {
    super(props);

    this.escFunction = this.escFunction.bind(this);
    this.updateStateProperty = this.updateStateProperty.bind(this);

    this.state = this.initState();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.newConnectionModalIsDisplayed === true) {
        this.props.toggleNewConnectionModal();
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.newConnectionModalIsDisplayed &&
        this.props.newConnectionModalIsDisplayed) ||
      !_.isEqual(prevProps.profile, this.props.profile)
    ) {
      this.setState(this.initState());
    }
  }

  getAvailableTypes() {
    return _.filter(getSupportedModelTypes(), (type) => type.loadFromDatabase);
  }

  getFirstSupportedType() {
    return _.find(getSupportedModelTypes(), (type) => type.loadFromDatabase)
      ?.id;
  }

  getAvailableTypeOptions() {
    return _.map(this.getAvailableTypes(), (type) => (
      <option value={type.id}>{type.text}</option>
    ));
  }

  initState() {
    return {
      ...INIT_STATE,
      availableTypes: this.getAvailableTypes(),
      type: this.getFirstSupportedType()
    };
  }

  updateStateProperty(propertyName, value) {
    this.setState({ [propertyName]: value });
  }

  handleChange(propName, event) {
    this.setState({ [propName]: event.target.value });
  }

  handleCheck(propName, event) {
    this.setState({ [propName]: event.target.checked });
  }

  handleChangeConnectionTypeSelect(event) {
    this.setState({
      type: event.target.value,
      databaseNames: [],
      database: ""
    });
    event.preventDefault();
  }

  handleChangeType(value) {
    this.setState({ type: value, databaseNames: [], database: "" });
  }

  onShowModalClick() {
    this.props.toggleNewConnectionModal();
  }

  saveConnectionsToFile(connections) {
    ipcRenderer?.send("connectionList:save", connections);
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

  buildConnection() {
    return {
      server: this.state.server,
      port: this.state.port,
      user: this.state.user,
      password: this.state.password,
      type: this.state.type,
      url: this.state.url,
      sshEnabled: this.state.sshEnabled,
      sshhost: this.state.sshhost,
      sshport: this.state.sshport,
      sshusername: this.state.sshusername,
      sshpassword: this.state.sshpassword,
      sshprivatekey: this.state.sshprivatekey,
      sshpassphrase: this.state.sshpassphrase,
      authtype: this.state.authtype,
      authuser: this.state.authuser,
      authpassword: this.state.authpassword,
      authsource: this.state.authsource,
      db: this.state.db,
      includeSchema: this.state.includeSchema,
      parseData: this.state.parseData,
      dataLimit: this.state.dataLimit,
      source: this.state.source,
      referenceSearch: this.state.referenceSearch,
      sslEnabled: this.state.sslEnabled,
      sslRejectUnauthorized: this.state.sslRejectUnauthorized,
      sslCA: this.state.sslCA,
      sslCert: this.state.sslCert,
      sslKey: this.state.sslKey,
      sslPassPhrase: this.state.sslPassPhrase,
      sslServerName: this.state.sslServerName,
      encrypt: this.state.encrypt,
      trustServerCertificate: this.state.trustServerCertificate,
      tlsEnabled: this.state.tlsEnabled,
      tlsCAFile: this.state.tlsCAFile,
      tlsCertificateKeyFile: this.state.tlsCertificateKeyFile,
      tlsCertificateKeyFilePassword: this.state.tlsCertificateKeyFilePassword,
      directConnection: this.state.directConnection,
      retryWrites: this.state.retryWrites,
      tlsAllowInvalidHostnames: this.state.tlsAllowInvalidHostnames,
      filePath: this.state.filePath
    };
  }

  async loadDatabases() {
    if (isElectron()) {
      const token = uuidv4();
      await this.props.setActiveTask({
        token,
        caption: LOADING_DATABASES_MESSAGE
      });
      await this.props.setDiagramLoading(true);
      const connection = this.buildConnection();
      this.subscribeTestConnectionEvent();
      await this.sendTestConnectionEvent(connection, token);
    }
  }

  async sendTestConnectionEvent(connectionObjectToPass, token) {
    ipcRenderer.send("connectionsList:runTestAndLoad", {
      connection: connectionObjectToPass,
      token
    });
  }

  subscribeTestConnectionEvent() {
    ipcRenderer.once(
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
            this.setState({
              databaseNames: result.databases,
              database: this.selectDatabase(result.databases, originalDatabase)
            });
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
  }

  updateDatabasesList(result) {
    if (result.databases) {
      this.setState({
        databaseNames: result.databases,
        database: this.selectDatabase(result.databases, this.state.database)
      });
    }
  }

  async createNewConnection() {
    var newConnection;
    if (this.state.type === "MONGODB") {
      newConnection = new ClassConnectionMongoDb(
        uuidv4(),
        this.state.name,
        this.state.desc,
        this.state.type,
        this.state.database,
        this.state.url,
        this.state.sshEnabled,
        this.state.sshhost,
        this.state.sshport,
        this.state.sshusername,
        this.state.sshpassword,
        this.state.sshprivatekey,
        this.state.sshpassphrase,
        this.state.authtype,
        this.state.authuser,
        this.state.authpassword,
        this.state.authsource,
        this.state.noLimit,
        this.state.dataLimit,
        this.state.source,
        this.state.referenceSearch,
        this.state.tlsEnabled,
        this.state.tlsCAFile,
        this.state.tlsCertificateKeyFile,
        this.state.tlsCertificateKeyFilePassword,
        this.state.directConnection,
        this.state.retryWrites,
        this.state.tlsAllowInvalidHostnames
      );
    }

    if (this.state.type === "PG") {
      newConnection = new ClassConnectionPG(
        uuidv4(),
        this.state.name,
        this.state.desc,
        this.state.type,
        this.state.database,
        this.state.db,
        this.state.server,
        this.state.port,
        this.state.user,
        this.state.password,
        this.state.sshEnabled,
        this.state.sshhost,
        this.state.sshport,
        this.state.sshusername,
        this.state.sshpassword,
        this.state.sshprivatekey,
        this.state.sshpassphrase,
        this.state.includeSchema,
        this.state.parseData,
        this.state.noLimit,
        this.state.dataLimit,
        this.state.sslEnabled,
        this.state.sslRejectUnauthorized,
        this.state.sslCA,
        this.state.sslCert,
        this.state.sslKey,
        this.state.sslPassPhrase,
        this.state.sslServerName
      );
    }

    if (this.state.type === "MSSQL") {
      newConnection = new ClassConnectionMSSQL(
        uuidv4(),
        this.state.name,
        this.state.desc,
        this.state.type,
        this.state.database,
        this.state.db,
        this.state.server,
        this.state.port,
        this.state.user,
        this.state.password,
        this.state.sshEnabled,
        this.state.sshhost,
        this.state.sshport,
        this.state.sshusername,
        this.state.sshpassword,
        this.state.sshprivatekey,
        this.state.sshpassphrase,
        this.state.includeSchema,
        this.state.parseData,
        this.state.noLimit,
        this.state.dataLimit,
        this.state.sslEnabled,
        this.state.sslRejectUnauthorized,
        this.state.sslCA,
        this.state.sslCert,
        this.state.sslKey,
        this.state.sslPassPhrase,
        this.state.sslServerName,
        this.state.encrypt,
        this.state.trustServerCertificate
      );
    }

    if (
      this.state.type === ModelTypes.MARIADB ||
      this.state.type === ModelTypes.MYSQL
    ) {
      newConnection = new ClassConnectionMySQLFamily(
        uuidv4(),
        this.state.name,
        this.state.desc,
        this.state.type,
        this.state.database,
        this.state.server,
        this.state.port,
        this.state.user,
        this.state.password,
        this.state.sshEnabled,
        this.state.sshhost,
        this.state.sshport,
        this.state.sshusername,
        this.state.sshpassword,
        this.state.sshprivatekey,
        this.state.sshpassphrase,
        this.state.parseData,
        this.state.noLimit,
        this.state.dataLimit,
        this.state.sslEnabled,
        this.state.sslRejectUnauthorized,
        this.state.sslCA,
        this.state.sslCert,
        this.state.sslKey,
        this.state.sslPassPhrase,
        this.state.sslServerName
      );
    }

    if (this.state.type === ModelTypes.SQLITE) {
      newConnection = new ClassConnectionSQLite(
        uuidv4(),
        this.state.name,
        this.state.desc,
        this.state.type,
        this.state.database,
        this.state.filePath
      );
    }

    await this.props.addConnection(newConnection);
    this.saveConnectionsToFile(this.props.connections);
    this.props.toggleNewConnectionModal();
  }

  renderConnectionPropertiesByPlatform(platform) {
    switch (platform) {
      case ModelTypes.PG:
        return this.renderPG();
      case ModelTypes.MSSQL:
        return this.renderMSSQL();
      case ModelTypes.MONGODB:
        return this.renderMongoDBProperties();
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return this.renderMySQLFamily();
      case ModelTypes.SQLITE:
        return this.renderSQLite();
      default:
        return <></>;
    }
  }

  renderPG() {
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
          <div className="im-tabs-area">
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderPGProperties()}
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <TLSPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
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

  renderMSSQL() {
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid im-tabs-grid-connections">
          <div className="im-connections-grid-tabs">
            <div />
            <div className="im-tabs-tablist">
              <TabList>
                <Tab>Server</Tab>
                <Tab>SSH</Tab>
                <Tab>Settings</Tab>
              </TabList>
            </div>
          </div>
          <div className="im-tabs-area">
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderMSSQLProperties()}
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderMSSQLSettings(
                this.props.availableFeatures,
                this.props.profile
              )}
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }

  renderSQLite() {
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid im-tabs-grid-connections">
          <div className="im-connections-grid-tabs">
            <div />
            <div className="im-tabs-tablist">
              <TabList>
                <Tab>File</Tab>
              </TabList>
            </div>
          </div>
          <div className="im-tabs-area">
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderSQLiteProperties()}
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }

  renderMySQLFamily() {
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
              </TabList>
            </div>
          </div>
          <div className="im-tabs-area">
            <TabPanel className="tabDetails im-tab-panel">
              {this.renderMySQLFamilyProperties()}
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <TLSPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
              />
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }

  renderMySQLFamilyProperties() {
    return (
      <div className="im-connections-grid">
        <div className="im-align-self-center">Server:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.server}
          onChange={this.handleChange.bind(this, "server")}
        />

        <div className="im-align-self-center">Port:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.port}
          onChange={this.handleChange.bind(this, "port")}
        />

        <div className="im-align-self-center">User:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.user}
          onChange={this.handleChange.bind(this, "user")}
        />

        <div className="im-align-self-center">Password:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type={this.state.pwdDisplayed ? "text" : "password"}
          value={this.state.password}
          onChange={this.handleChange.bind(this, "password")}
        />
        {this.renderDatabaseList()}
      </div>
    );
  }

  renderPGProperties() {
    return (
      <div className="im-connections-grid">
        <div className="im-align-self-center">Server:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.server}
          onChange={this.handleChange.bind(this, "server")}
          data-testid={TEST_ID.NEW_CONNECTION.SERVER_EDIT}
        />

        <div className="im-align-self-center">Port:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.port}
          onChange={this.handleChange.bind(this, "port")}
          data-testid={TEST_ID.NEW_CONNECTION.PORT_EDIT}
        />

        <div className="im-align-self-center">Database:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.db}
          onChange={this.handleChange.bind(this, "db")}
          data-testid={TEST_ID.NEW_CONNECTION.DATABASE_EDIT}
        />

        <div className="im-align-self-center">User:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.user}
          onChange={this.handleChange.bind(this, "user")}
          data-testid={TEST_ID.NEW_CONNECTION.USER_EDIT}
        />

        <div className="im-align-self-center">Password:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type={this.state.pwdDisplayed ? "text" : "password"}
          value={this.state.password}
          onChange={this.handleChange.bind(this, "password")}
          data-testid={TEST_ID.NEW_CONNECTION.PASSWORD_EDIT}
        />
        {this.renderDatabaseList()}
      </div>
    );
  }

  renderMSSQLProperties() {
    return (
      <div className="im-connections-grid">
        <div className="im-align-self-center">Server:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.server}
          onChange={this.handleChange.bind(this, "server")}
          data-testid={TEST_ID.NEW_CONNECTION.SERVER_EDIT}
        />

        <div className="im-align-self-center">Port:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.port}
          onChange={this.handleChange.bind(this, "port")}
          data-testid={TEST_ID.NEW_CONNECTION.PORT_EDIT}
        />

        <div className="im-align-self-center">User:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={this.state.user}
          onChange={this.handleChange.bind(this, "user")}
          data-testid={TEST_ID.NEW_CONNECTION.USER_EDIT}
        />

        <div className="im-align-self-center">Password:</div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type={this.state.pwdDisplayed ? "text" : "password"}
          value={this.state.password}
          onChange={this.handleChange.bind(this, "password")}
          data-testid={TEST_ID.NEW_CONNECTION.PASSWORD_EDIT}
        />
        {this.renderDatabaseList()}
      </div>
    );
  }

  renderSQLiteProperties() {
    return (
      <div className="im-connections-grid">
        <ChooseFilePathField
          caption="Path"
          name="filePath"
          filters={sqliteFilters}
          connection={this.state}
          hidden={false}
          updateProperty={this.updateStateProperty}
        />
      </div>
    );
  }

  renderMongoDBProperties() {
    const showUserNamePassword =
      this.state.authtype === "Default" ||
      this.state.authtype === "SCRAM-SHA-1" ||
      this.state.authtype === "SCRAM-SHA-256";
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
          <div className="im-tabs-area">
            <TabPanel className="tabDetails im-tab-panel">
              <div className="im-connections-grid">
                <div className="im-align-self-center">URL:</div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  value={this.state.url}
                  onChange={this.handleChange.bind(this, "url")}
                />
                {this.renderDatabaseList()}
                <div />
                <CheckboxSwitch
                  label={"Direct connection"}
                  checked={this.state.directConnection}
                  onChange={this.handleCheck.bind(this, "directConnection")}
                />
                <div />
                <CheckboxSwitch
                  label={"Retry writes"}
                  checked={this.state.retryWrites}
                  onChange={this.handleCheck.bind(this, "retryWrites")}
                />
              </div>
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <div className="im-connections-grid">
                <div className="im-align-self-center">Type:</div>
                <React.Fragment>
                  <select
                    className="im-flex-cols-first-full-width"
                    value={this.state.authtype}
                    onChange={this.handleChange.bind(this, "authtype")}
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
                      value={this.state.authuser}
                      onChange={this.handleChange.bind(this, "authuser")}
                    />
                    <div className="im-align-self-center">Password:</div>
                    <DebounceInput
                      minLength={1}
                      debounceTimeout={300}
                      type={this.state.pwdDisplayed ? "text" : "password"}
                      value={this.state.authpassword}
                      onChange={this.handleChange.bind(this, "authpassword")}
                    />
                    <div className="im-align-self-center">Auth. Db:</div>
                    <DebounceInput
                      minLength={1}
                      debounceTimeout={300}
                      type="text"
                      value={this.state.authsource}
                      onChange={this.handleChange.bind(this, "authsource")}
                    />
                  </>
                ) : undefined}
              </div>
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <SSHPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
              />
            </TabPanel>
            <TabPanel className="tabDetails im-tab-panel">
              <MongoDBTLSPanel
                availableFeatures={this.props.availableFeatures}
                connection={this.state}
                updateProperty={this.updateStateProperty}
                pwdDisplayed={this.state.pwdDisplayed}
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
          label={`Include schema`}
          checked={this.state.includeSchema}
          onChange={this.handleCheck.bind(this, "includeSchema")}
        />
      </div>
    );
  }

  renderMSSQLSettings(availableFeatures, profile) {
    return (
      <div className="im-connections-grid">
        {isFeatureAvailable(availableFeatures, Features.TLS) ? (
          <>
            <div />
            <CheckboxSwitch
              label={`Encrypt`}
              checked={this.state.encrypt}
              onChange={this.handleCheck.bind(this, "encrypt")}
            />
          </>
        ) : (
          <></>
        )}
        <div />
        <CheckboxSwitch
          label={`Trust Server Certificate`}
          checked={this.state.trustServerCertificate}
          onChange={this.handleCheck.bind(this, "trustServerCertificate")}
        />
      </div>
    );
  }
  renderMongoDBSettings() {
    const hideDataLimit = this.state.source !== "data";
    const noLimit = this.state.noLimit;
    return (
      <div className="im-connections-grid">
        <div>Schema from:</div>
        <select
          value={this.state.source}
          onChange={this.handleChange.bind(this, "source")}
        >
          <option value="data">Data</option>
          <option value="validator">Validator</option>
        </select>
        {hideDataLimit === false && <div />}
        <CheckboxSwitch
          label={"Parse maximum documents (no data limit)"}
          checked={this.state.noLimit}
          onChange={this.handleCheck.bind(this, "noLimit")}
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
          value={this.state.dataLimit}
          onChange={this.handleChange.bind(this, "dataLimit")}
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
              value={Helpers.gv(this.state.referenceSearch)}
              onChange={this.handleChange.bind(this, "referenceSearch")}
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
    switch (this.state.referenceSearch) {
      case ReferenceSearchValue.ALL:
        return `All relations between ObjectId and root documents ids will be reversed.`;
      case ReferenceSearchValue.FIRST:
        return `Only first relation between ObjectId and root document id will be reversed.`;
      default:
        return `No relations will be reversed.`;
    }
  }

  renderOptions() {
    return (
      <div className="im-connections-grid">
        <div />
        <CheckboxSwitch
          label={"Analyze JSON Columns"}
          checked={this.state.analyzeJSON}
          onChange={this.handleCheck.bind(this, "analyzeJSON")}
        />
        <div hidden={this.state.analyzeJSON === false} />
        <CheckboxSwitch
          label={"No sample limit"}
          checked={this.state.noSampleLimit}
          disabled={this.state.analyzeJSON === false}
          hidden={this.state.analyzeJSON === false}
          onChange={this.handleCheck.bind(this, "noSampleLimit")}
        />
        <div
          hidden={this.state.analyzeJSON === false}
          className="im-align-self-center"
        >
          Sample limit:
        </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="number"
          min="0"
          value={this.state.sampleLimit}
          hidden={
            this.state.analyzeJSON === false &&
            this.state.noSampleLimit === false
          }
          onChange={this.handleChange.bind(this, "sampleLimit")}
        />
      </div>
    );
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

  renderDatabaseList() {
    return (
      <React.Fragment>
        <div className="im-align-self-center">
          {this.state.type === ModelTypes.PG ? `Schema:` : `Database:`}
        </div>
        <div className="im-flex-cols">
          {this.state.databaseNames && this.state.databaseNames.length === 0 ? (
            <DebounceInput
              className="im-flex-cols-first-full-width"
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(this.state.database)}
              onChange={this.handleChange.bind(this, "database")}
              data-testid={TEST_ID.NEW_CONNECTION.SCHEMA_EDIT}
            />
          ) : (
            <React.Fragment>
              <select
                className="im-flex-cols-first-full-width"
                value={this.state.database}
                onChange={this.handleChange.bind(this, "database")}
                data-testid={TEST_ID.NEW_CONNECTION.SCHEMA_EDIT}
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
            data-testid={TEST_ID.NEW_CONNECTION.LOAD_DATABASES_BUTTON}
          >
            Load
          </button>
        </div>
      </React.Fragment>
    );
  }

  render() {
    if (this.props.newConnectionModalIsDisplayed === true) {
      var disabledButton = this.state.name === "" ? true : false;
      var buttonStyle =
        this.state.name === ""
          ? "im-btn-default im-disabled"
          : "im-btn-default";

      return (
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.NEW_CONNECTION}>
              <div className="modal-header">New connection</div>
              <div className="modal-content-confirm">
                <div>
                  {this.props.diagramLoading ? (
                    <LoadingMini />
                  ) : (
                    <React.Fragment>
                      <div className="im-connections-grid">
                        <div />
                        <Choice
                          customClassName="im-choice-item"
                          customImgClassName="im-choice-project-type"
                          onClick={this.handleChangeType.bind(this)}
                          choices={this.state.availableTypes}
                          selectedChoiceId={this.state.type}
                        />

                        <div>Type:</div>
                        <select
                          value={this.state.type}
                          onChange={this.handleChangeConnectionTypeSelect.bind(
                            this
                          )}
                        >
                          {this.getAvailableTypeOptions()}
                        </select>

                        <div className="im-align-self-center">
                          Name: <span className="im-input-tip">(required)</span>
                        </div>
                        <DebounceInput
                          minLength={1}
                          debounceTimeout={300}
                          type="text"
                          value={this.state.name}
                          onChange={this.handleChange.bind(this, "name")}
                          data-testid={TEST_ID.NEW_CONNECTION.NAME_EDIT}
                        />
                        <div>Description:</div>

                        <DebounceInput
                          element="textarea"
                          minLength={1}
                          debounceTimeout={300}
                          className="im-textarea"
                          value={this.state.desc}
                          onChange={this.handleChange.bind(this, "desc")}
                        />
                      </div>
                      {this.renderConnectionPropertiesByPlatform(
                        this.state.type
                      )}
                    </React.Fragment>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <div className="im-display-inline-block im-float-left im-p-sm">
                  <div className="im-align-left">
                    <CheckboxSwitch
                      label="Show passwords"
                      checked={this.state.pwdDisplayed}
                      onChange={() =>
                        this.setState({
                          pwdDisplayed: !this.state.pwdDisplayed
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.onShowModalClick.bind(this)}
                >
                  Close
                </button>
                <button
                  id="btn-save-connection"
                  className={buttonStyle + " im-margin-right"}
                  onClick={this.createNewConnection.bind(this)}
                  disabled={disabledButton}
                  title={
                    this.state.name === "" ? "Connection name is required" : ""
                  }
                  data-testid={TEST_ID.NEW_CONNECTION.SAVE_CONNECTION_BUTTON}
                >
                  Save connection
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    diagramLoading: state.ui.diagramLoading,
    newConnectionModalIsDisplayed: state.ui.newConnectionModalIsDisplayed,
    connections: state.connections,
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleNewConnectionModal,
        addConnection,
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
  connect(mapStateToProps, mapDispatchToProps)(ModalNewConnection)
);
