import { Features, isFeatureAvailable } from "../helpers/features/features";
import { IPCContext, createReverseModelAction } from "../helpers/ipc/ipc";
import { ModelTypes, ModelTypesForHumans } from "../enums/enums";
import React, { Component } from "react";
import { addConnection, selectConnection } from "../actions/connections";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";
import {
  toggleConfirmDeleteConnection,
  toggleConnectionModal
} from "../actions/ui";

import { TEST_ID } from "common";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addNotification } from "../actions/notifications";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import moment from "moment";
import { provideModel } from "../actions/model";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ConnectionsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
    this.getConnectionsList = this.getConnectionsList.bind(this);
    this.onReverseConnection = this.onReverseConnection.bind(this);
  }

  saveConnectionsToFile(connections) {
    ipcRenderer?.send("connectionsList:saveConnections", connections);
  }

  async duplicateConnection(connectionId) {
    let connectionNewId = uuidv4();
    let connectionCopy = _.cloneDeep(this.props.connections[connectionId]);
    connectionCopy.id = connectionNewId;
    connectionCopy.name = connectionCopy.name + "_copy";

    await this.props.addConnection(connectionCopy);
    this.saveConnectionsToFile(this.props.connections);
    await this.props.selectConnection(connectionNewId);
    await this.props.toggleConnectionModal();
  }

  renderMySQLFamilyProperties(connectionItem) {
    return (
      <div className="im-flex-cols">
        <div className="im-box-text">
          Server:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.server}
          </div>
        </div>
        <div className="im-box-text">
          Port:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.port}
          </div>
        </div>
        <div className="im-box-text">
          User:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.user}
          </div>
        </div>
      </div>
    );
  }

  renderPGProperties(connectionItem) {
    return (
      <div className="im-flex-cols">
        <div className="im-box-text">
          Server:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.server}
          </div>
        </div>
        <div className="im-box-text">
          Port:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.port}
          </div>
        </div>
        <div className="im-box-text">
          Database:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.db}
          </div>
        </div>
        <div className="im-box-text">
          Schema:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.database}
          </div>
        </div>
        <div className="im-box-text">
          User:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.user}
          </div>
        </div>
      </div>
    );
  }

  renderMongoDBProperties(connectionItem) {
    return (
      <div className="im-flex-cols">
        <div className="im-box-text">
          URL:{" "}
          <div className="im-box-text-dark im-display-inline-block">
            {connectionItem.url}
          </div>
        </div>
      </div>
    );
  }

  renderDatabasePropertiesByPlatform(platform, connectionItem) {
    switch (platform) {
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return this.renderMySQLFamilyProperties(connectionItem);
      case "PG":
        return this.renderPGProperties(connectionItem);
      case "MONGODB":
        return this.renderMongoDBProperties(connectionItem);
      case "MARIADB":
      case "MYSQL":
      default:
        return this.renderMySQLFamilyProperties(connectionItem);
    }
  }

  isSshSslAvailable(connection) {
    const features = this.props.availableFeatures;
    return (
      (!connection.sshEnabled ||
        (connection.sshEnabled &&
          isFeatureAvailable(features, Features.SSH, this.props.profile))) &&
      (!connection.sslEnabled ||
        (connection.sslEnabled &&
          isFeatureAvailable(features, Features.TLS, this.props.profile))) &&
      (!connection.tlsEnabled ||
        (connection.tlsEnabled &&
          isFeatureAvailable(features, Features.TLS, this.props.profile)))
    );
  }

  async onReverseConnection(e) {
    const id = e.target.dataset.itemid;
    const connection = this.props.connections[id];
    if (!this.isSshSslAvailable(connection)) {
      this.notifyUserSshSslIsNotAvailable();
      return;
    }
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.CONNECTIONS_LIST__REVERSE_MODEL
    );
    try {
      await this.props.provideModel(
        getCurrentHistoryTransaction().historyContext,
        this.props.isDirty,
        new IPCContext(createReverseModelAction(connection)),
        { autolayout: true, cancelable: true, connection }
      );
    } finally {
      await this.props.finishTransaction(true);
    }
  }

  notifyUserSshSslIsNotAvailable() {
    this.props.addNotification({
      id: uuidv4(),
      datepast: moment().startOf("minute").fromNow(),
      datesort: moment().unix(),
      date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
      message: this.props.localization.TEXTS.SSH_TLS_REVERSE_ON_NON_PRO,
      model: this.props.name,
      type: "info",
      autohide: false,
      urlCaption: null,
      urlToOpen: null,
      urlIsExternal: false
    });
  }

  showConnectionSecurity(connectionItem) {
    let securityTypeIcon = "Insecure";
    let highlightedStyle = "";
    let securityTextArray = [];
    let securityText = "";
    let tooltip = "Improve security by setting SSH/SSL/TLS options";

    if (connectionItem.sshEnabled) {
      securityTextArray.push(" SSH");
    }
    if (connectionItem.sslEnabled) {
      securityTextArray.push(" SSL/TLS");
    }
    if (connectionItem.tlsEnabled) {
      securityTextArray.push(" TLS");
    }

    if (securityTextArray.length > 0) {
      securityTypeIcon = "Secure";
      highlightedStyle = "im-highlighted";
      tooltip = "Secure connection options set";
    }
    securityTextArray.forEach((item) => (securityText += item));
    return (
      <div className={highlightedStyle + " im-has-tooltip im-relative"}>
        <i className={"im-icon im-icon-" + securityTypeIcon} />
        <div className={"im-tooltip im-tooltip-right"}>{tooltip}</div>
        {securityText}
      </div>
    );
  }

  getConnectionsList() {
    var sortedConnections = _.orderBy(this.props.connections, [
      (conn) => conn["name"].toLowerCase()
    ]);

    if (this.props.searchTerm) {
      sortedConnections = sortedConnections.filter(
        (t) =>
          (t.sshEnabled &&
            this.props.searchTerm.toLowerCase().includes("ssh")) ||
          ((t.sslEnabled || t.tlsEnabled) &&
            this.props.searchTerm.toLowerCase().includes("ssl")) ||
          ((t.sslEnabled || t.tlsEnabled) &&
            this.props.searchTerm.toLowerCase().includes("tls")) ||
          t.sshhost
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          t.name.toLowerCase().includes(this.props.searchTerm.toLowerCase()) ||
          ModelTypesForHumans[t.type]
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          t.desc?.toLowerCase().includes(this.props.searchTerm.toLowerCase()) ||
          t.url?.toLowerCase().includes(this.props.searchTerm.toLowerCase()) ||
          t.port
            ?.toString()
            .toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          t.server
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          t.database
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase()) ||
          t.db?.toLowerCase().includes(this.props.searchTerm.toLowerCase()) ||
          t.user?.toLowerCase().includes(this.props.searchTerm.toLowerCase())
      );
    }

    if (_.size(sortedConnections) < 1) {
      return (
        <div className="im-message im-padding-md">
          No matches. Try to redefine the search term.
        </div>
      );
    }

    return _.map(sortedConnections, (connectionItem) => {
      return (
        <div key={connectionItem.id} className="im-grid-row">
          <div className="im-box-title">
            <div className="im-box-name">{connectionItem.name}</div>
            <div className="im-box-secured">
              {this.showConnectionSecurity(connectionItem)}
            </div>
            <div className="im-box-type">
              {ModelTypesForHumans[connectionItem.type]}
            </div>

            <div
              className="im-box-cross"
              onClick={() => {
                this.props.selectConnection(connectionItem.id);
                this.props.toggleConfirmDeleteConnection();
              }}
            >
              <i className="im-icon-16 im-icon-Cross16" />
            </div>
          </div>
          <div className="im-box-text-dark">{connectionItem.desc}</div>

          <div className="im-box-text im-flex-cols-first-full-width ">
            {this.state.type === "PG" ? `Schema:` : `Database:`}{" "}
            <div className="im-box-text-dark im-display-inline-block">
              {connectionItem.database}
            </div>
          </div>

          {this.renderDatabasePropertiesByPlatform(
            connectionItem.type,
            connectionItem
          )}

          <div className="im-box-btn">
            <div className="im-flex-cols">
              <div
                className="im-link im-flex-cols-first-full-width"
                onClick={this.onReverseConnection}
                data-itemid={connectionItem.id}
                data-testid={
                  TEST_ID.CONNECTIONS
                    .CONNECT_AND_LOAD_EXISTING_DATABASE_STRUCTURE_LINK
                }
              >
                Connect and load existing database structure
              </div>
              <div
                className="im-link im-display-inline-block"
                onClick={async () => {
                  await this.props.selectConnection(connectionItem.id);
                  await this.duplicateConnection(connectionItem.id);
                }}
              >
                Duplicate
              </div>
              <div className="im-box-text"> | </div>
              <div
                className="im-link im-display-inline-block"
                onClick={() => {
                  this.props.selectConnection(connectionItem.id);
                  this.props.toggleConnectionModal();
                }}
              >
                Edit
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    if (_.size(this.props.connections) < 1) {
      return <div />;
    }

    return (
      <div key={uuidv4()}>
        {this.state.isLoading === true ? (
          <div>Loading</div>
        ) : (
          <div className="im-flex-box-items">{this.getConnectionsList()}</div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isDirty: state.model.isDirty,
    name: state.model.name,
    localization: state.localization,
    connections: state.connections,
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleConnectionModal,
        selectConnection,
        toggleConfirmDeleteConnection,
        addConnection,
        provideModel,
        addNotification,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConnectionsList)
);
