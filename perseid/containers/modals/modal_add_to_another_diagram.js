import React, { Component, createRef } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  addSelectionToExistingDiagram,
  createNewDiagramsFromSelection
} from "../../actions/diagrams";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import { ClassDiagram } from "../../classes/class_diagram";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import Helpers from "../../helpers/helpers";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { toggleAddToAnotherDiagramModal } from "../../actions/ui";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const NEW_DIAGRAM_TAB_INDEX = 0;
const EXISTING_DIAGRAM_TAB_INDEX = 1;

class ModalAddToAnotherDiagram extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.state = { selected: undefined, newDiagramName: "", otherDiagrams: [] };
    this.ref = createRef();
  }

  componentDidUpdate(prevProps) {
    const hasDiagramsChanged = prevProps.diagrams !== this.props.diagrams;
    const hasActiveDiagramChanged =
      prevProps.activeDiagram !== this.props.activeDiagram;
    if (hasDiagramsChanged || hasActiveDiagramChanged) {
      this.loadOtherDiagrams();
    }
  }

  loadOtherDiagrams() {
    const otherDiagrams = _.sortBy(
      _.filter(
        this.props.diagrams,
        (diagram) => diagram.id !== this.props.activeDiagram
      ),
      (d) => d.name
    );

    this.setState({
      otherDiagrams,
      selected: _.first(otherDiagrams)?.id
    });
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.addToAnotherDiagramModalIsDisplayed === true) {
        this.props.toggleAddToAnotherDiagramModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
    this.loadOtherDiagrams();
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async addClick() {
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.MODAL_ADD_TO_ANOTHER_DIAGRAM__ADD_TO_ANOTHER_DIAGRAM
    );
    try {
      if (this.ref.current.state.selectedIndex === NEW_DIAGRAM_TAB_INDEX) {
        const newDiagram = new ClassDiagram(
          uuidv4(),
          this.state.newDiagramName ||
            "Diagram " + (_.size(this.props.diagrams) + 1),
          "",
          false
        );
        await this.props.createNewDiagramsFromSelection(
          newDiagram,
          this.props.selections,
          historyContext
        );
      }
      if (
        this.ref.current?.state.selectedIndex === EXISTING_DIAGRAM_TAB_INDEX
      ) {
        await this.props.addSelectionToExistingDiagram(
          this.state.selected,
          this.props.selections,
          historyContext
        );
      }
      this.props.toggleAddToAnotherDiagramModal();
      UIHelpers.setFocusToCanvasAndKeepScrollPosition();
    } finally {
      await this.props.finishTransaction();
    }
  }

  closeClick() {
    this.props.toggleAddToAnotherDiagramModal();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  render() {
    return (
      <CSSTransition
        in={this.props.addToAnotherDiagramModalIsDisplayed}
        key="ModalDiagramItems"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal"
              data-testid={TEST_ID.MODALS.ADD_TO_ANOTHER_DIAGRAM}
            >
              <div className="modal-header">Add to another diagram</div>
              <div className="modal-content">
                <Tabs className="im-tabs" ref={this.ref}>
                  <div className="im-tabs-grid">
                    <div className="im-tabs-tablist">
                      <TabList>
                        <Tab>New diagram</Tab>
                        {_.size(this.state.otherDiagrams) > 0 ? (
                          <Tab>Existing diagrams</Tab>
                        ) : (
                          ""
                        )}
                      </TabList>
                    </div>

                    <div className="im-tabs-area">
                      <TabPanel className="tabDetails im-tab-panel">
                        <div className="im-properties-grid">
                          <div>Name: </div>
                          <DebounceInput
                            minLength={1}
                            debounceTimeout={300}
                            type="text"
                            value={Helpers.gv(this.state.newDiagramName)}
                            onChange={(e) =>
                              this.setState({
                                newDiagramName: e.target.value
                              })
                            }
                          />
                        </div>
                      </TabPanel>
                      {_.size(this.state.otherDiagrams) > 0 ? (
                        <TabPanel className="tabDetails im-tab-panel">
                          <div className="im-properties-grid">
                            <div>Diagram: </div>
                            <select
                              onChange={(e) => {
                                this.setState({ selected: e.target.value });
                              }}
                              value={this.state.selected}
                            >
                              {_.map(this.state.otherDiagrams, (diagram) => (
                                <option
                                  key={diagram.id}
                                  value={diagram.id}
                                  label={diagram.name}
                                />
                              ))}
                            </select>
                          </div>
                        </TabPanel>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </Tabs>
              </div>

              <div className="modal-footer">
                <button
                  autoFocus
                  className="im-btn-default im-margin-right"
                  onClick={this.closeClick.bind(this)}
                >
                  Close
                </button>
                <button
                  autoFocus
                  className="im-btn-default im-margin-right"
                  onClick={this.addClick.bind(this)}
                >
                  Add
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
    addToAnotherDiagramModalIsDisplayed:
      state.ui.addToAnotherDiagramModalIsDisplayed,
    activeDiagram: state.model.activeDiagram,
    selections: state.selections,
    diagrams: state.diagrams
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleAddToAnotherDiagramModal,
        createNewDiagramsFromSelection,
        addSelectionToExistingDiagram,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalAddToAnotherDiagram)
);
