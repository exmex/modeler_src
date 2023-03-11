import React, { Component } from "react";
import {
  updateIndexColumnProperty,
  updateIndexProperty
} from "../../actions/tables";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import IndexAssistantMongoDb from "../../platforms/mongodb/index_assistant_mongodb";
import { ModelTypes } from "../../enums/enums";
import MongoDbHelpers from "../../platforms/mongodb/helpers_mongodb";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { navigateTable } from "../../actions/navigation";
import { toggleIndexAssistantModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalIndexAssistant extends Component {
  constructor(props) {
    super(props);

    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.indexAssistantModalIsDisplayed === true) {
        this.setState(MongoDbHelpers.getIndexInitState());
        this.props.toggleIndexAssistantModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async onCloseClick() {
    const hc = getHistoryContext(this.props.history, this.props.match);
    await this.props.navigateTable(hc, this.props.match.params.id);
    await this.props.toggleIndexAssistantModal();
  }

  render() {
    return (
      <CSSTransition
        in={this.props.indexAssistantModalIsDisplayed}
        key="modalIndexAssistant"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <Draggable handle=".modal-header">
          <div className="modal" data-testid={TEST_ID.MODALS.INDEX_ASSISTANT}>
            <div className="modal-header">Index assistant</div>
            <div className="modal-content modal-content-notabs">
              {this.props.type === ModelTypes.MONGODB &&
                this.props.match.params.iid && <IndexAssistantMongoDb />}
            </div>
            <div className="modal-footer">
              <button
                autoFocus
                className="im-btn-default"
                onClick={this.onCloseClick.bind(this)}
              >
                Close
              </button>
            </div>
          </div>
        </Draggable>
      </CSSTransition>
    );
  }
}

function mapStateToProps(state) {
  return {
    indexAssistantModalIsDisplayed: state.ui.indexAssistantModalIsDisplayed,
    localization: state.localization,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleIndexAssistantModal,
        updateIndexProperty,
        updateIndexColumnProperty,
        navigateTable
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalIndexAssistant)
);
