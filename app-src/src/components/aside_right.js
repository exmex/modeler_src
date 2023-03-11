import React, { Component } from "react";

import AsideRightSwitch from "../containers/aside_right_switch";
import AsideToggleButton from "../containers/aside_toggle_button";
import { TEST_ID } from "common";

export default class AsideRight extends Component {
  render() {
    return (
      <div
        tabIndex={3}
        className="aside-right"
        id="aside-right"
        data-testid={TEST_ID.LAYOUT.ASIDE_RIGHT}
      >
        <div className="aside-prop">
          <AsideToggleButton icon="im-icon-Right" direction="right" />
          <AsideRightSwitch />
        </div>
      </div>
    );
  }
}
