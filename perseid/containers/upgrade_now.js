import React, { Component } from "react";

import { getAppTitle } from "common";

const ipcRenderer = window?.ipcRenderer;

class UpgradeNow extends Component {
  constructor(props) {
    super(props);

    this.buyNowWeb = this.buyNowWeb.bind(this);
  }

  buyNowWeb() {
    ipcRenderer?.send(
      "link:openExternal",
      "https://www.datensen.com/upgrade.html"
    );
  }

  upgradeMessage() {
    return `Upgrade to ${getAppTitle(
      process.env.REACT_APP_PRODUCT
    )} Professional`;
  }

  render() {
    return (
      <div className="im-align-center im-padding-md">
        <h2>{this.upgradeMessage()}</h2>
        <p>
          And create secure SSH/SSL/TLS database connections, <br />
          work with multiple diagrams in a project and
          <br /> generate interactive HTML reports.
          <br />
          <br />
          The license key will be sent to your email box.
        </p>
        <div className="im-content-spacer-md" />

        <button className="im-btn-default" onClick={this.buyNowWeb}>
          Upgrade Now!
        </button>
      </div>
    );
  }
}

export default UpgradeNow;
