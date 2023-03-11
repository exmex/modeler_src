import React, { Component } from "react";

import AsideToggleButton from "../../containers/aside_toggle_button";
import BrowserFooter from "./browser_footer";
import BrowserSearchBar from "./browser_search_bar";
import BrowserTreeContainer from "../../containers/browser_tree_container";
import LeftSideItemsBar from "../../containers/left_panel_items_bar";

export default class Browser extends Component {
  render() {
    return (
      <div tabIndex={1} className="aside-left" id="aside-left">
        <div className="aside-nav">
          <div className="im-tabs-grid im-tabs-grid-aside-left">
            <div className="im-tabs-tablist">
              <div className="im-aside-left-panel-toolbar">
                <AsideToggleButton icon="im-icon-Left" direction="left" />
                <BrowserSearchBar />
                <LeftSideItemsBar />
              </div>
            </div>
            <div className="im-tabs-area">
              <BrowserTreeContainer />
            </div>
            <div className="im-aside-bottom-panel">
              <BrowserFooter />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
