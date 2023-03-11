import {
  HistoryContext,
  getHistoryContext
} from "../../helpers/history/history";
import React, { Component } from "react";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../actions/undoredo";
import {
  getActiveDiagramNotes,
  getActiveDiagramObject,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../../selectors/selector_diagram";
import {
  setDiagramLoading,
  setForcedRender,
  toggleConfirmDelete
} from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { clearSelection } from "../../actions/selections";
import { connect } from "react-redux";
import { deleteDiagramItems } from "../../actions/diagrams";
import { deleteSelectedObjects } from "../../actions/tables";
import { isPerseid } from "../../helpers/features/features";
import { navigateToDiagramUrl } from "../../components/url_navigation";
import { withRouter } from "react-router-dom";

class ConfirmDelete extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.confirmDeleteIsDisplayed === true) {
        this.props.toggleConfirmDelete();
      }
    }
  }

  async onConfirmClick() {
    if (
      this.props.match.params.id ||
      this.props.match.params.nid ||
      this.props.match.params.oid
    ) {
      navigateToDiagramUrl(
        this.props.match.url,
        this.props.history,
        this.props.match.params.mid,
        this.props.match.params.did
      );

      await this.props.toggleConfirmDelete();
      await this.props.setDiagramLoading(!this.props.diagramLoading);
      const historyContext = getHistoryContext(
        this.props.history,
        this.props.match
      );
      await this.props.startTransaction(
        historyContext,
        UndoRedoDef.CONFIRM_DELETE__DELETE_OBJECTS
      );
      try {
        await this.props.deleteSelectedObjects(historyContext);
        await this.props.clearSelection(true);
        getCurrentHistoryTransaction().addResizeRequest({
          domToModel: false,
          operation: "onConfirmClick"
        });
      } finally {
        await this.props.finishTransaction();
        await this.props.setDiagramLoading(false);
      }
    }
  }

  isMainDiagram = () =>
    this.props.activeDiagramObject && this.props.activeDiagramObject.main;

  itemById = (id) =>
    this.props.diagramTables[id] ||
    this.props.diagramNotes[id] ||
    this.props.diagramOtherObjects[id];

  selectionToDiagramItems = () =>
    _.reduce(
      this.props.selections,
      (r, item) => {
        const foundDiagramItem = this.itemById(item.objectId);
        return foundDiagramItem ? [...r, foundDiagramItem] : r;
      },
      []
    );

  async deleteDiagramItemClick() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.CONFIRM_DELETE__DELETE_DIAGRAM_ITEMS
    );
    try {
      await this.props.deleteDiagramItems(
        this.props.match.params.did,
        _.map(this.selectionToDiagramItems(), (item) => item.id)
      );
      this.props.toggleConfirmDelete();
    } finally {
      await this.props.finishTransaction();
    }
  }

  async onShowModalClick() {
    await this.props.toggleConfirmDelete();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  async onDeleteDiagramItem() {
    if (!this.isMainDiagram() && this.selectionToDiagramItems().length > 0) {
      this.deleteDiagramItemClick();
    }
  }

  renderPerseidRootInSelection() {
    let message = `Root object cannot be deleted. Change your selection.`;

    return (
      <CSSTransition
        in={this.props.confirmDeleteIsDisplayed}
        key="confirmDelete"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal-confirm"
              
            >
              <div className="modal-header">
                Delete
              </div>
              <div className="modal-content-confirm">{message}</div>
              <div className="modal-footer">
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.onShowModalClick.bind(this)}
                >
                  Close
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      </CSSTransition>
    );
  }

  renderClassicConfirmation() {
    var selItemsCnt = _.size(this.props.selections);
    var objectType = this.props.localization.L_TABLE;
    var objectName = "";
    var message = "";

    var message = "Are you sure you want to delete ";
    if (!this.isMainDiagram()) {
      message += " or remove ";
    }
    if (selItemsCnt === 1) {
      _.map(this.props.selections, (s) => {
        if (s.objectType === "table") {
          if (this.props.tables[s.objectId]) {
            if (
              this.props.tables[s.objectId] &&
              this.props.tables[s.objectId].embeddable === true
            ) {
              objectType = this.props.localization.L_TABLE_EMBEDDABLE;
            }
            objectName = this.props.tables[s.objectId].name;
          }
        } else if (s.objectType === "note") {
          if (this.props.notes[s.objectId]) {
            objectType = "note";
            objectName = this.props.notes[s.objectId].name;
          }
        } else if (s.objectType === "other_object") {
          if (this.props.otherObjects[s.objectId]) {
            objectType = "";
            objectName = this.props.otherObjects[s.objectId].name;
          }
        }
      });
      message += objectType + ' "' + objectName + '"?';
    } else {
      message += selItemsCnt + " items?";
    }

    return (
      <CSSTransition
        in={this.props.confirmDeleteIsDisplayed}
        key="confirmDelete"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal-confirm"
              data-testid={TEST_ID.CONFIRMATIONS.DELETE}
            >
              <div className="modal-header">
                {this.isMainDiagram() ? "Delete" : "Delete or remove"}
              </div>
              <div className="modal-content-confirm">{message}</div>
              <div className="modal-footer">
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.onShowModalClick.bind(this)}
                >
                  Close
                </button>
                {!this.isMainDiagram() && (
                  <button
                    className="im-btn-default im-margin-right"
                    onClick={this.onDeleteDiagramItem.bind(this)}
                  >
                    Remove from diagram
                  </button>
                )}
                <button
                  className="im-btn-default"
                  onClick={this.onConfirmClick.bind(this)}
                >
                  Delete from project
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      </CSSTransition>
    );
  }

  render() {
    if (isPerseid(this.props.profile)) {
      let rootItemInSelection = _.find(this.props.selections, ["embeddable", false]);
      if (rootItemInSelection !== undefined || this.props.tables[this.props.match.params.id]?.embeddable === false) {
        return <>{this.renderPerseidRootInSelection()}</>;
      } else {
        return <>{this.renderClassicConfirmation()}</>;
      }
    } else {
      return <>{this.renderClassicConfirmation()}</>;
    }
  }
}

function mapStateToProps(state) {
  return {
    confirmDeleteIsDisplayed: state.ui.confirmDeleteIsDisplayed,
    diagramLoading: state.ui.diagramLoading,
    selections: state.selections,
    localization: state.localization,
    tables: state.tables,
    notes: state.notes,
    otherObjects: state.otherObjects,
    activeDiagramObject: getActiveDiagramObject(state),
    diagramTables: getActiveDiagramTables(state),
    diagramOtherObjects: getActiveDiagramOtherObjects(state),
    diagramNotes: getActiveDiagramNotes(state),
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        deleteDiagramItems,
        toggleConfirmDelete,
        clearSelection,
        deleteSelectedObjects,
        setDiagramLoading,
        finishTransaction,
        startTransaction,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfirmDelete)
);
