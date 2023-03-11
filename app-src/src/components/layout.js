import React, { Component } from "react";

import AppInit from "./app_init";
import ConfirmDeleteConnection from "../containers/confirmations/confirm_delete_connection";
import ElectronMenu from "./electron_menu";
import Footer from "./footer";
import Loading from "./loading";
import MainLayoutSwitch from "../containers/main_layout_switch";
import ModalBuyPro from "../containers/modals/modal_buy_pro";
import ModalConnection from "../containers/modals/modal_connection";
import ModalDiffHTMLReport from "../containers/modals/modal_diff_html_report";
import ModalEula from "../containers/modals/modal_eula";
import ModalFeedback from "../containers/modals/modal_feedback";
import ModalImportFromUrl from "../containers/modals/modal_import_from_url";
import ModalNewConnection from "../containers/modals/modal_new_connection";
import ModalNewModel from "../containers/modals/modal_new_model";
import ModalOpenFromUrl from "../containers/modals/modal_open_from_url";
import ModalProxy from "../containers/modals/modal_proxy";
import ModalReport from "../containers/modals/modal_report";
import ModalReverseStats from "../containers/modals/modal_reverse_stats";
import ModalTips from "../containers/modals/modal_tips";
import ModalTrial from "../containers/modals/modal_trial";
import ModalUnsavedChanges from "../containers/modals/modal_unsaved_changes";
import NotificationBox from "../containers/notification_box";
import { TEST_ID } from "common";
import Toolbar from "./toolbar/toolbar";
import { connect } from "react-redux";

class Layout extends Component {
  renderModalDialogs() {
    return (
      <>
        {this.props.diagramLoading && <Loading />}
        {this.props.unsavedChangesModalIsDisplayed && <ModalUnsavedChanges />}
        {this.props.tipsModalIsDisplayed && <ModalTips />}
        {this.props.newModelModalIsDisplayed && <ModalNewModel />}
        {this.props.openFromUrlModalIsDisplayed && <ModalOpenFromUrl />}
        {this.props.proxyModalIsDisplayed && <ModalProxy />}
        {this.props.feedbackModalIsDisplayed && <ModalFeedback />}
        {this.props.newConnectionModalIsDisplayed && <ModalNewConnection />}
        {this.props.connectionModalIsDisplayed && <ModalConnection />}
        {this.props.reportModalIsDisplayed && <ModalReport />}
        {this.props.diffHTMLReportModalIsDisplayed && <ModalDiffHTMLReport />}
        {this.props.reverseStatsIsDisplayed && <ModalReverseStats />}
        {this.props.buyProModalIsDisplayed && <ModalBuyPro />}
        {this.props.eulaModalIsDisplayed && <ModalEula />}
        {this.props.trialModalIsDisplayed && <ModalTrial />}
        {this.props.importFromUrlModalIsDisplayed && <ModalImportFromUrl />}
        {this.props.confirmDeleteConnectionIsDisplayed && (
          <ConfirmDeleteConnection />
        )}
      </>
    );
  }

  render() {
    const theme = this.props.theme !== undefined ? this.props.theme : "";
    const printColors =
      this.props.printColors === undefined || this.props.printColors === true
        ? "print-colors-yes"
        : "print-colors-no";
    const appLayoutClassName = "app-layout " + theme + " " + printColors;
    return (
      <div
        id="app-layout"
        data-testid={TEST_ID.LAYOUT.APP_LAYOUT}
        className={appLayoutClassName}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }}
      >
        <Toolbar />
        <MainLayoutSwitch />
        <NotificationBox />
        {this.renderModalDialogs()}
        <Footer />
        <ElectronMenu />
        <AppInit />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.settings.theme,
    printColors: state.settings.printColors,
    unsavedChangesModalIsDisplayed: state.ui.unsavedChangesModalIsDisplayed,
    diagramLoading: state.ui.diagramLoading,
    tipsModalIsDisplayed: state.ui.tipsModalIsDisplayed,
    newModelModalIsDisplayed: state.ui.newModelModalIsDisplayed,
    openFromUrlModalIsDisplayed: state.ui.openFromUrlModalIsDisplayed,
    feedbackModalIsDisplayed: state.ui.feedbackModalIsDisplayed,
    newConnectionModalIsDisplayed: state.ui.newConnectionModalIsDisplayed,
    connectionModalIsDisplayed: state.ui.connectionModalIsDisplayed,
    reportModalIsDisplayed: state.ui.reportModalIsDisplayed,
    diffHTMLReportModalIsDisplayed: state.ui.diffHTMLReportModalIsDisplayed,
    reverseStatsIsDisplayed: state.ui.reverseStatsIsDisplayed,
    buyProModalIsDisplayed: state.ui.buyProModalIsDisplayed,
    eulaModalIsDisplayed: state.ui.eulaModalIsDisplayed,
    restoreModelModalIsDisplayed: state.ui.restoreModelModalIsDisplayed,
    trialModalIsDisplayed: state.ui.trialModalIsDisplayed,
    confirmDeleteConnectionIsDisplayed:
      state.ui.confirmDeleteConnectionIsDisplayed,
    importFromUrlModalIsDisplayed: state.ui.importFromUrlModalIsDisplayed,
    proxyModalIsDisplayed: state.ui.proxyModalIsDisplayed,
    profile: state.profile
  };
}

export default connect(mapStateToProps)(Layout);
