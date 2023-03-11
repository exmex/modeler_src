import React, { Component } from "react";

import LayoutSwitch from "./components/layout_switch";

const { detect } = require("detect-browser");
const browser = detect();

class App extends Component {
  detectBrowser() {
    if (browser) {
      if (browser.name !== "firefox" && browser.name !== "chrome") {
        return (
          <div className="im-not-supported">
            <h1>Your browser is not supported.</h1>
            <h3>This application requires Firefox or Chrome browser.</h3>
          </div>
        )
      }
    }
    return <LayoutSwitch />;
  }

  render() {
    return this.detectBrowser();
  }
}

export default App;
