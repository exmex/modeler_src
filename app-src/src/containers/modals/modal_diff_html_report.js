import React, { Component } from "react";

import { CSSTransition } from "react-transition-group";
import CheckboxSwitch from "../../components/checkbox_switch";
import Choice from "../../components/choice";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import Helpers from "../../helpers/helpers";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { generateDiffHTMLReport } from "../../actions/diff_html_report";
import imgDiffReportDark from "../../assets/imgDiffReportDark.png";
import imgDiffReportDocument from "../../assets/imgDiffReportDocument.png";
import imgDiffReportLight from "../../assets/imgDiffReportLight.png";
import moment from "moment";
import { toggleDiffHTMLReportModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class DiffHTMLModalReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reportDescription: "",
      generateSQL: false,
      authorInfo: true,
      style: "style01",
      availableStyles: [
        {
          id: "style01",
          text: "Dark style",
          icon: imgDiffReportDark
        },
        {
          id: "style02",
          text: "Light style",
          icon: imgDiffReportLight
        },
        {
          id: "style03",
          text: "Document style",
          icon: imgDiffReportDocument
        }
      ]
    };
    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.diffHTMLReportModalIsDisplayed === true) {
        this.props.toggleDiffHTMLReportModal();
      }
    }
  }

  // select
  handleChangeModelStyleSelect(event) {
    this.setState({ style: event.target.value });
    event.preventDefault();
  }

  //choice
  handleChangeStyle(value) {
    this.setState({ style: value });
  }

  changeGenerateSQL() {
    this.setState({ generateSQL: !this.state.generateSQL });
  }
  changeAuthorInfo() {
    this.setState({ authorInfo: !this.state.authorInfo });
  }
  onShowModalClick() {
    this.props.toggleDiffHTMLReportModal();
  }

  render() {
    var authorInfo = JSON.stringify({
      authorName: this.props.authorName,
      companyDetails: this.props.companyDetails,
      companyUrl: this.props.companyUrl
    });
    return (
      <CSSTransition
        in={this.props.diffHTMLReportModalIsDisplayed}
        key="ModalReport"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper modal-z-top">
          <Draggable handle=".modal-header">
            <div className="modal " data-testid={TEST_ID.MODALS.REPORT}>
              <div className="modal-header">Generate report</div>
              <div className="modal-content-confirm">
                <div>
                  <div className="im-connections-grid">
                    <div>Style:</div>
                    <select
                      value={this.state.style}
                      onChange={this.handleChangeModelStyleSelect.bind(this)}
                    >
                      <option value="style01">Dark style</option>
                      <option value="style02">Light style</option>
                      <option value="style03">Document style</option>
                    </select>
                    <div />
                    <Choice
                      customClassName="im-choice-item"
                      customImgClassName="im-choice-style"
                      onClick={this.handleChangeStyle.bind(this)}
                      choices={this.state.availableStyles}
                      selectedChoiceId={this.state.style}
                    />

                    <div className="im-content-spacer-md" />
                    <div />
                    <div>Report description:</div>
                    <DebounceInput
                      element="textarea"
                      minLength={1}
                      debounceTimeout={300}
                      className="im-textarea"
                      placeholder=""
                      value={this.state.reportDescription}
                      onChange={(e) =>
                        this.setState({ reportDescription: e.target.value })
                      }
                    />
                    <div />
                    <CheckboxSwitch
                      label={
                        "Add author and company details from project settings"
                      }
                      checked={this.state.authorInfo}
                      onChange={this.changeAuthorInfo.bind(this)}
                    />
                    {/*<div />
                    <CheckboxSwitch
                      label={"Show SQL differences"}
                      checked={this.state.generateSQL}
                      onChange={this.changeGenerateSQL.bind(this)}
                    />*/}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.onShowModalClick.bind(this)}
                  data-testid={TEST_ID.MODAL_REPORT.CLOSE}
                >
                  Close
                </button>
                <button
                  id="btn-create-new-project"
                  className="im-btn-default"
                  onClick={this.props.generateDiffHTMLReport.bind(
                    this,
                    ipcRenderer,
                    this.state.style,
                    this.state.generateSQL,
                    this.state.reportDescription,
                    this.state.authorInfo ? authorInfo : null,
                    moment().format("DD MMMM YYYY | hh:mm:ss")
                  )}
                >
                  Generate report
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      </CSSTransition>
    );
  }
}

function mapStateToProps(state) {
  return {
    diffHTMLReportModalIsDisplayed: state.ui.diffHTMLReportModalIsDisplayed,
    reverseStats: state.reverseStats,
    authorName: state.model.authorName,
    companyDetails: state.model.companyDetails,
    companyUrl: state.model.companyUrl
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleDiffHTMLReportModal,
        generateDiffHTMLReport
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiffHTMLModalReport)
);
