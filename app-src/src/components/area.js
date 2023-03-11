import {
  DROPDOWN_MENU,
  openDropDownMenu,
  setDiagramAreaMode,
  setForcedRender,
  toggleDiagramItemsModal
} from "../actions/ui";
import {
  Features,
  hasLicense,
  isFeatureAvailable,
  isFreeware,
  isMoon
} from "../helpers/features/features";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";

import { ClassDiagram } from "../classes/class_diagram";
import { DiagramAreaMode } from "../enums/enums";
import DiagramSub from "./diagram_sub";
import DiagramTableList from "../containers/diagram_table_list";
import DiagramTree from "../containers/diagram_tree";
import { TEST_ID } from "common";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addDiagram } from "../actions/diagrams";
import { bindActionCreators } from "redux";
import { clearSelection } from "../actions/selections";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { getHistoryContext } from "../helpers/history/history";
import isElectron from "is-electron";
import { showDiagram } from "../actions/model";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class Area extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedTabIndex: 0 };
    this.resizeObserver = null;
    this.tabsResizeObserver = null;

    this.scrollingPanel = React.createRef();

    this.getDiagramPanels = this.getDiagramPanels.bind(this);
    this.getDiagramTabs = this.getDiagramTabs.bind(this);
    this.addDiagram = this.addDiagram.bind(this);
    this.openDiagramItems = this.openDiagramItems.bind(this);
    this.handleNav = this.handleNav.bind(this);
    this.showNavButtons = this.showNavButtons.bind(this);
    this.syncDiagramAndSVGDimensions =
      this.syncDiagramAndSVGDimensions.bind(this);
  }

  syncDiagramAndSVGDimensions() {
    UIHelpers.syncDiagramAndSVGDimensions(
      this.props.zoom,
      this.props.reportIsRendered
    );
  }

  showHideNavigationArrows() {
    UIHelpers.toggleNavArrowsInDiagramTabs();
  }

  componentDidMount() {
    this.syncDiagramAndSVGDimensions();
    this.resizeObserver = new ResizeObserver(this.syncDiagramAndSVGDimensions);
    this.resizeObserver.observe(document.getElementById("diagram"));

    this.tabsResizeObserver = new ResizeObserver(this.showHideNavigationArrows);
    this.tabsResizeObserver.observe(
      document.getElementById("tabsPanelForDiagramTabs")
    );
    this.tabsResizeObserver.observe(
      document.getElementById("scrollingPanelForDiagramTabs")
    );
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.tabsResizeObserver) {
      this.tabsResizeObserver.disconnect();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.isZoomChange(prevProps) ||
      this.isReportRenderedChange(prevProps)
    ) {
      this.syncDiagramAndSVGDimensions();
    }
  }

  isReportRenderedChange(prevProps) {
    return this.props.reportIsRendered !== prevProps.reportIsRendered;
  }

  isZoomChange(prevProps) {
    return this.props.zoom !== prevProps.zoom;
  }

  BuyNowWeb() {
    if (isElectron()) {
      ipcRenderer.send(
        "link:openExternal",
        "https://www.datensen.com/purchase.html"
      );
    }
  }

  async openDropDownMenu(diagramId, e) {
    const { clientX, clientY } = {
      clientX: e.clientX,
      clientY: e.clientY
    };
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.AREA__SHOW_DIAGRAM
    );
    try {
      await this.props.clearSelection(false);
      await this.props.setForcedRender({ domToModel: false });
      await this.props.showDiagram(
        this.props.match.params.mid,
        diagramId,
        false,
        getHistoryContext(this.props.history, this.props.match)
      );
      await this.props.openDropDownMenu(DROPDOWN_MENU.DIAGRAM, "area", {
        x: clientX,
        y: clientY - 50
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  getDiagramTabs() {
    var sortedDiagrams = this.sortedDiagrams();
    return _.map(sortedDiagrams, (diagram) => {
      return (
        <Tab
          key={"t-" + diagram.id}
          onContextMenu={this.openDropDownMenu.bind(this, diagram.id)}
          data-testid={"TAB_" + diagram.name}
        >
          {diagram.name}
        </Tab>
      );
    });
  }

  sortedDiagrams() {
    var openDiagrams = _.filter(this.props.diagrams, ["isOpen", true]);
    return _.orderBy(openDiagrams, ["main", "name"], ["desc", "asc"]);
  }

  getDiagramTabIndex() {
    return _.findIndex(this.sortedDiagrams(), [
      "id",
      this.props.match.params.did
    ]);
  }

  async setActiveDiagramById(index) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.AREA__SHOW_DIAGRAM
    );
    try {
      const sortedDiagrams = this.sortedDiagrams();
      if (sortedDiagrams[index]) {
        await this.props.showDiagram(
          this.props.match.params.mid,
          sortedDiagrams[index].id,
          false,
          getHistoryContext(this.props.history, this.props.match)
        );
      }
    } finally {
      await this.props.finishTransaction();
    }

    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  getDiagramPanels() {
    var sortedDiagrams = this.sortedDiagrams();
    return _.map(sortedDiagrams, (diagram) => {
      return (
        <TabPanel key={"p-" + diagram.id}>
          <DiagramSub id={diagram.id} name={diagram.name} />
        </TabPanel>
      );
    });
  }

  async addDiagram() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.AREA__ADD_DIAGRAM
    );
    try {
      const diagram = new ClassDiagram(
        uuidv4(),
        "Diagram " + (_.size(this.props.diagrams) + 1),
        "",
        false
      );
      await this.props.addDiagram(diagram);
      await this.props.clearSelection(false);
      await this.props.showDiagram(
        this.props.match.params.mid,
        diagram.id,
        false,
        getCurrentHistoryTransaction().historyContext
      );
      await this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
      UIHelpers.setFocusToCanvasAndKeepScrollPosition();
    } finally {
      await this.props.finishTransaction();
    }
  }

  getNewDiagramButton() {
    return (
      <button
        id="btn-add-diagram"
        className="im-btn-secondary im-btn-sm"
        onClick={this.addDiagram}
        data-testid={TEST_ID.DIAGRAM_PANEL.ADD_DIAGRAM}
      >
        Add diagram
      </button>
    );
  }

  getBuyNowButton() {
    return (
      <button
        id="btn-add-diagram"
        className="im-btn-default im-btn-sm"
        onClick={this.BuyNowWeb.bind(this)}
        data-testid={TEST_ID.DIAGRAM_PANEL.BUY_NOW}
      >
        Buy Now!
      </button>
    );
  }

  openDiagramItems() {
    this.props.toggleDiagramItemsModal();
  }

  getDiagramItemsButton() {
    return (
      <button
        id="btn-add-diagram"
        className="im-btn-secondary im-btn-sm"
        onClick={this.openDiagramItems}
      >
        Diagram items
      </button>
    );
  }

  setTabIndex(index) {
    this.setState({ selectedTabIndex: index });
  }

  showNavButtons() {
    if (this.scrollingPanel.current && isMoon(this.props.profile)) {
      return (
        <div id="scrollingPanelArrows">
          <button
            className="im-btn-secondary im-btn-sm"
            onClick={() => this.handleNav("left")}
          >
            <i className="im-icon-ArrowLeft16 im-icon-12"></i>
          </button>
          <button
            className="im-btn-secondary im-btn-sm"
            onClick={() => this.handleNav("right")}
          >
            <i className="im-icon-ArrowRight16 im-icon-12"></i>
          </button>
        </div>
      );
    }
  }

  scrollPanelBy(value) {
    this.scrollingPanel &&
      this.scrollingPanel.current.scrollBy({
        left: value,
        top: 0,
        behavior: "smooth"
      });
  }

  handleNav = (direction) => {
    if (direction === "left") {
      this.scrollPanelBy(-150);
    } else {
      this.scrollPanelBy(150);
    }
  };

  scrollByWheel(event) {
    this.scrollPanelBy(event.deltaY * 50);
  }

  getLicenseTypeForReportCss() {
    if (hasLicense(this.props.profile)) {
      return "mm-commercial";
    } else {
      if (isFreeware(this.props.profile)) {
        return "mm-freeware";
      } else {
        return "mm-trial";
      }
    }
  }

  render() {
    return (
      <Tabs
        className="im-tabs"
        selectedIndex={this.getDiagramTabIndex()}
        onSelect={this.setActiveDiagramById.bind(this)}
      >
        <div
          className={
            this.props.settings.diagramTabsPosition === "tabs-top"
              ? "im-tabs-grid-diagram-top"
              : "im-tabs-grid-diagram"
          }
        >
          <div className="diagram-area-1">
            <div className="im-tabs-diagram-area" id="scroll-area">
              <div
                tabIndex={0}
                id="main-area"
                className="main-area"
                onScroll={this.syncDiagramAndSVGDimensions}
                style={
                  this.props.activeDiagramObject && {
                    background: this.props.activeDiagramObject.background
                  }
                }
                data-testid={TEST_ID.DIAGRAM.MAIN_AREA}
              >
                <div
                  id="diagram"
                  className={"diagram " + this.getLicenseTypeForReportCss()}
                >
                  {this.props.activeDiagramObject?.type === "treediagram" ? (
                    <DiagramTree />
                  ) : (
                    <DiagramTableList />
                  )}
                </div>
              </div>
            </div>
            {this.getDiagramPanels()}
          </div>
          <div
            id="scrollingPanelForDiagramTabs"
            className="diagram-area-2 im-tabs-tablist"
            ref={this.scrollingPanel}
            onWheel={(e) => this.scrollByWheel(e)}
          >
            <TabList>
              <div
                className={
                  this.props.settings.diagramTabsPosition === "tabs-top"
                    ? "im-tabs-with-fixed-panel im-tabs-with-fixed-panel-top"
                    : "im-tabs-with-fixed-panel"
                }
              >
                <div id="tabsPanelForDiagramTabs">{this.getDiagramTabs()}</div>
                <div className="im-fixed-panel">
                  {this.showNavButtons()}

                  {isFeatureAvailable(
                    this.props.availableFeatures,
                    Features.MULTIDIAGRAMS
                  ) && this.getNewDiagramButton()}

                  {isFreeware(this.props.profile) &&
                    isFeatureAvailable(
                      this.props.profile.availableFeatures,
                      Features.FREEWARE
                    ) &&
                    this.getBuyNowButton()}
                </div>
              </div>
            </TabList>
          </div>
        </div>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  return {
    zoom: state.ui.zoom,
    reportIsRendered: state.ui.reportIsRendered,
    diagrams: state.diagrams,
    settings: state.settings,
    activeDiagramObject: getActiveDiagramObject(state),
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile,
    model: state.model
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openDropDownMenu,
        addDiagram,
        showDiagram,
        clearSelection,
        setDiagramAreaMode,
        toggleDiagramItemsModal,
        finishTransaction,
        startTransaction,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Area));
