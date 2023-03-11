import React, { Component } from "react";
import { toggleAsideLeft, toggleAsideRight } from "../actions/ui";

import Area from "../components/area";
import AsideRight from "../components/aside_right";
import AsideToggle from "../components/aside_toggle";
import Browser from "../components/browser/browser";
import DiagramAuxiliary from "./diagram_auxiliary";
import SplitterLayout from "react-splitter-layout";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class AppContainer extends Component {
  async onShowLeftPanel() {
    await this.props.toggleAsideLeft();
  }

  async onShowRightPanel() {
    await this.props.toggleAsideRight();
  }

  getLayout() {
    if (this.props.settings.layout === "area-right") {
      return (
        <SplitterLayout
          primaryInitialSize={390}
          secondaryMinSize={390}
          customClassName={
            this.props.asideRightIsDisplayed
              ? "im-panel-right im-print-hidden"
              : "im-panel-right-hidden-area im-print-hidden"
          }
        >
          {this.props.asideRightIsDisplayed ? (
            <AsideRight />
          ) : (
            <AsideToggle
              direction="right"
              text="Properties"
              icon="im-icon-Right"
              rotate={90}
              onClick={this.onShowRightPanel.bind(this)}
            />
          )}
          <Area />
        </SplitterLayout>
      );
    } else {
      return (
        <SplitterLayout
          secondaryInitialSize={390}
          primaryMinSize={200}
          secondaryMinSize={390}
          customClassName={
            this.props.asideRightIsDisplayed
              ? "im-panel-right"
              : "im-panel-right-hidden"
          }
        >
          <Area />
          {this.props.asideRightIsDisplayed ? (
            <AsideRight />
          ) : (
            <AsideToggle
              direction="right"
              text="Properties"
              icon="im-icon-Right"
              rotate={90}
              onClick={this.onShowRightPanel.bind(this)}
            />
          )}
        </SplitterLayout>
      );
    }
  }

  render() {
    return (
      <>
        <DiagramAuxiliary />
        <div tabIndex={5} className="app-window">
          <div className="app-area">
            <SplitterLayout
              primaryIndex={1}
              primaryMinSize={100}
              secondaryMinSize={this.props.asideLeftIsDisplayed ? 250 : 40}
              secondaryInitialSize={250}
              customClassName={
                this.props.asideLeftIsDisplayed
                  ? "im-panel-left"
                  : "im-panel-left-hidden"
              }
            >
              {this.props.asideLeftIsDisplayed ? (
                <Browser />
              ) : (
                <AsideToggle
                  direction="left"
                  text="Object list"
                  icon="im-icon-Left"
                  rotate={90}
                  onClick={this.onShowLeftPanel.bind(this)}
                />
              )}

              {this.getLayout()}
            </SplitterLayout>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    asideRightIsDisplayed: state.ui.asideRightIsDisplayed,
    asideLeftIsDisplayed: state.ui.asideLeftIsDisplayed,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleAsideRight: toggleAsideRight,
        toggleAsideLeft: toggleAsideLeft
      },
      dispatch
    ),
    dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
