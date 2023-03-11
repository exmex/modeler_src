import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import NoteGraphics from "../note_graphics";
import NoteProperties from "../note_properties";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleNoteModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalNote extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.noteModalIsDisplayed === true) {
        this.props.toggleNoteModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  onShowModalClick() {
    this.props.toggleNoteModal();
  }

  noChange() {
    return null;
  }

  render() {
    const activeNote = this.props.notes[this.props.match.params.nid];
    if (
      this.props.match.params.nid &&
      this.props.noteModalIsDisplayed === true &&
      activeNote
    ) {
      return (
        <CSSTransition
          in={this.props.noteModalIsDisplayed}
          key="modalNote"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.NOTE}>
              <div className="modal-header">Note details</div>
              <div className="modal-content">
                <Tabs className="im-tabs">
                  <div className="im-tabs-grid">
                    <div className="im-tabs-tablist">
                      <TabList>
                        <Tab>Details</Tab>
                        <Tab>Graphics</Tab>
                      </TabList>
                    </div>

                    <div className="im-tabs-area">
                      <TabPanel className="tabDetails im-tab-panel">
                        <NoteProperties />
                      </TabPanel>
                      <TabPanel className="tabRI im-tab-panel">
                        <NoteGraphics />
                      </TabPanel>
                    </div>
                  </div>
                </Tabs>
              </div>
              <div className="modal-footer">
                <button
                  autoFocus
                  className="im-btn-default"
                  onClick={this.onShowModalClick.bind(this)}
                >
                  Close
                </button>
              </div>
            </div>
          </Draggable>
        </CSSTransition>
      );
    } else {
      return "";
    }
  }
}

function mapStateToProps(state) {
  return {
    notes: state.notes,
    noteModalIsDisplayed: state.ui.noteModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleNoteModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalNote)
);
