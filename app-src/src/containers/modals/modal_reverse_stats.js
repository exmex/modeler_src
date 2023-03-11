import { DEV_DEBUG, isDebug } from "../../web_env";
import React, { Component } from "react";
import {
  toggleReverseStatsModal,
  toggleTextEditorModal
} from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import CollapsibleRow from "../../components/collapsible_row";
import Draggable from "react-draggable";
import Helpers from "../../helpers/helpers";
import ModalTextEditor from "../../containers/modals/modal_text_editor";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { generateDiffHTMLReport } from "../../actions/diff_html_report";
import { getHistoryContext } from "../../helpers/history/history";
import { importReverseStats } from "../../actions/reverseStats";
import { toggleDiffHTMLReportModalExecute } from "../../actions/modals";
import { undo } from "../../actions/undoredo";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router";

class ModalReverseStats extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.pressContinueDiscard = this.pressContinueDiscard.bind(this);
    this.pressContinueUpdate = this.pressContinueUpdate.bind(this);
  }

  async pressContinueDiscard() {
    this.closeModal();
    await this.props.undo(
      getHistoryContext(this.props.history, this.props.match)
    );
  }

  async pressContinueUpdate() {
    this.props.importReverseStats({
      ...this.props.reverseStats,
      updated: true
    });
    this.closeModal();
  }

  closeModal() {
    if (this.props.reverseStatsIsDisplayed === true) {
      this.props.toggleReverseStatsModal();
    }
  }

  openInLargeWindow(value, header) {
    if (isDebug([DEV_DEBUG])) {
      this.props.toggleTextEditorModal(
        <ModalTextEditor
          textEditorId={uuidv4()}
          onChange={() => {}}
          modalHeader={_.upperFirst(header)}
          text={Helpers.gv(value)}
        />
      );
    }
  }

  renderModalContentNoChanges() {
    return (
      <>
        <div class="modal-content-confirm">
          No changes to the database were detected. The project seems to be up
          to date.
        </div>
        <div className="modal-footer">
          <button className="im-btn-default" onClick={this.closeModal}>
            Close
          </button>
        </div>
      </>
    );
  }

  renderRowDetails(typeStat) {
    var toReturn = [];
    const itemsRemoved = _.sortBy(typeStat.count?.removed?.idNames, [
      "name",
      "asc"
    ]);

    const itemsAdded = _.sortBy(typeStat.count?.added?.idNames, [
      "name",
      "asc"
    ]);

    const itemsModified = _.sortBy(typeStat.count?.modified?.idNames, [
      "name",
      "asc"
    ]);

    _.map(itemsRemoved, (removed) => {
      toReturn.push(
        <li>
          <div className="im-updated-items im-items-selection im-cursor-arrow">
            <div />
            <div className="im-align-left-forced im-p-l-md">{removed.name}</div>
            <div>
              <i className="im-icon-Yes im-icon-16" />
            </div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </li>
      );
    });

    _.map(itemsAdded, (added) => {
      toReturn.push(
        <li>
          <div className="im-updated-items im-items-selection im-cursor-arrow">
            <div />
            <div className="im-align-left-forced im-p-l-md">{added.name}</div>
            <div></div>
            <div>
              <i className="im-icon-Yes im-icon-16" />
            </div>
            <div></div>
            <div></div>
          </div>
        </li>
      );
    });

    _.map(itemsModified, (modified) => {
      toReturn.push(
        <li>
          <div className="im-updated-items im-items-selection im-cursor-arrow">
            <div />
            <div className="im-align-left-forced im-p-l-md">
              {modified.name}
            </div>
            <div></div>
            <div></div>
            <div
              className="im-pointer"
              onClick={this.openInLargeWindow.bind(
                this,
                JSON.stringify(modified.diff, null, 2),
                "Detail"
              )}
            >
              <i className="im-icon-Yes im-icon-16" />
            </div>
            <div></div>
          </div>
        </li>
      );
    });

    return toReturn;
  }

  renderModalContentChanges() {
    return (
      <>
        <div className="modal-content">
          <>
            <div className="im-diagram-items-modal">
              <div className="im-p-sm"></div>
              <div>
                <div className="im-updated-items-header">
                  <div />
                  <div>Type</div>
                  <div className=" im-has-tooltip im-relative im-inline-block im-pointer im-align-center">
                    In project only
                    <div
                      className={` im-tooltip im-tooltip-left im-tooltip-arrow `}
                    >
                      Items were removed from the database
                      <br />
                      and will be removed from the project
                    </div>
                  </div>
                  <div className=" im-has-tooltip im-relative im-inline-block im-pointer im-align-center">
                    In database only
                    <div
                      className={` im-tooltip im-tooltip-left im-tooltip-arrow `}
                    >
                      Items were added to the database
                      <br />
                      and will be added to the project
                    </div>
                  </div>

                  <div className=" im-has-tooltip im-relative im-inline-block im-pointer im-align-center">
                    Modified
                    <div
                      className={` im-tooltip im-tooltip-left im-tooltip-arrow `}
                    >
                      Items were modified in the database
                      <br />
                      and will be updated in the project
                    </div>
                  </div>
                  <div className=" im-has-tooltip im-relative im-inline-block im-nowrap im-pointer im-align-center">
                    Objects in database
                    <div className={` im-tooltip im-tooltip-right `}>
                      Total number of items in the database
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {_.map(
              this.props.reverseStats.diffReport.statistics,
              (typeStat) => (
                <CollapsibleRow
                  panelKey={uuidv4()}
                  panelCols={[
                    typeStat.caption,
                    typeStat.count.removed.count,
                    typeStat.count.added.count,
                    typeStat.count.modified.count,
                    typeStat.count.total
                  ]}
                  panelIsExpanded={false}
                  customCss=""
                >
                  <>{this.renderRowDetails(typeStat)}</>
                </CollapsibleRow>
              )
            )}
          </>
        </div>

        {this.props.reverseStats.updated === true ? (
          <div className="modal-footer">
            <button
              className="im-btn-secondary im-margin-right"
              onClick={this.props.toggleDiffHTMLReportModalExecute.bind(this)}
            >
              Generate report
            </button>
            <button className="im-btn-default" onClick={this.closeModal}>
              Close
            </button>
          </div>
        ) : (
          <div className="modal-footer">
            <div className="im-display-inline-block im-float-left im-p-sm">
              <div className="im-align-left">
                <div className="im-text-secondary">
                  Tip: You can use UNDO after updating the project
                </div>
              </div>
            </div>
            <button
              className="im-btn-secondary im-margin-right"
              onClick={this.props.toggleDiffHTMLReportModalExecute.bind(this)}
            >
              Generate report
            </button>
            <button
              className="im-btn-secondary im-margin-right"
              onClick={this.pressContinueDiscard}
            >
              Ignore and close
            </button>
            <button
              className="im-btn-default"
              onClick={this.pressContinueUpdate}
            >
              Update project
            </button>
          </div>
        )}
      </>
    );
  }

  isReportEmpty() {
    return _.reduce(
      this.props.reverseStats.diffReport.statistics,
      (r, typeStat) => {
        return typeStat.count.added.count +
          typeStat.count.removed.count +
          typeStat.count.modified.count >
          0
          ? true
          : r;
      },
      false
    );
  }

  render() {
    return (
      <CSSTransition
        in={this.props.reverseStatsIsDisplayed}
        key="confirmRestoreModel"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.REVERSE_STATS}>
              <div className="modal-header">Detected changes</div>
              {this.isReportEmpty()
                ? this.renderModalContentChanges()
                : this.renderModalContentNoChanges()}
            </div>
          </Draggable>
        </div>
      </CSSTransition>
    );
  }
}

function mapStateToProps(state) {
  return {
    reverseStatsIsDisplayed: state.ui.reverseStatsIsDisplayed,
    reverseStats: state.reverseStats,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleReverseStatsModal,
        undo,
        toggleTextEditorModal,
        importReverseStats,
        toggleDiffHTMLReportModalExecute,
        generateDiffHTMLReport
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalReverseStats)
);
