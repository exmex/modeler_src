import React, { Component } from "react";

import { TEST_ID } from "common";

const ipcRenderer = window?.ipcRenderer;

class BuyNow extends Component {
  constructor(props) {
    super(props);

    this.BuyNowWeb = this.BuyNowWeb.bind(this);
  }

  BuyNowWeb() {
    ipcRenderer?.send(
      "link:openExternal",
      "https://www.datensen.com/purchase.html"
    );
  }

  render() {
    return (
      <div className="im-align-center im-padding-md">
        <h2>Purchase a commercial license</h2>
        <p>The license key will be sent to your email box.</p>
        <div className="im-content-spacer-md" />

        <button
          className="im-btn-default"
          onClick={this.BuyNowWeb}
          data-testid={TEST_ID.BUY_NOW.BUY_NOW_BUTTON}
        >
          Buy Now!
        </button>
      </div>
    );
  }
}

export default BuyNow;
