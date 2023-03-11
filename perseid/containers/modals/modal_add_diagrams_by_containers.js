import React, { Component } from "react";
import {
  addDiagramsByContainers,
  getContainerName,
  getContainersTablesCount
} from "../../actions/diagrams";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import CheckboxCustom from "../../components/checkbox_custom";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { toggleAddDiagramsByContainersModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const NAME_FIELD = "name";
class ModalAddDiagramsByContainers extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.state = {
      containersTablesCount: this.checkAll(
        getContainersTablesCount(this.props.type, this.props.tables)
      )
    };
  }

  checkAll(containersTablesCount) {
    Object.keys(containersTablesCount).forEach((item) => {
      containersTablesCount[item].checked = true;
    });
    return containersTablesCount;
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.addDiagramsByContainersModalIsDisplayed === true) {
        this.props.toggleAddDiagramsByContainersModal();
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.addDiagramsByContainersModalIsDisplayed !==
      prevProps.addDiagramsByContainersModalIsDisplayed
    ) {
      this.setState({
        containersTablesCount: this.checkAll(
          getContainersTablesCount(this.props.type, this.props.tables)
        )
      });
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  close() {
    this.props.toggleAddDiagramsByContainersModal();
  }

  async addDiagramsByContainers() {
    const result = _.map(
      _.filter(this.state.containersTablesCount, (item) => item.checked),
      (item) => item.name
    );
    this.props.toggleAddDiagramsByContainersModal();
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODAL_ADD_DIAGRAMS_BY_CONTAINERS__ADD_DIAGRAMS_BY_CONTAINERS
    );
    try {
      await this.props.addDiagramsByContainers(result);
    } finally {
      await this.props.finishTransaction();
    }
  }

  getTableHeaders() {
    return (
      <div className="im-items-selection-header">
        <div></div>
        <div className="im-cols-header-fixed">
          <span className="im-pointer">Name</span>
        </div>
        <div className="im-cols-header-fixed">
          <span className="im-pointer">No. of tables</span>
        </div>
      </div>
    );
  }

  changeCheck(tableCount, e) {
    const checked = tableCount ? tableCount.checked === true : false;
    this.setState((state) => {
      return {
        containersTablesCount: {
          ...this.state.containersTablesCount,
          [tableCount.name]: {
            ...this.state.containersTablesCount[tableCount.name],
            checked: !checked
          }
        }
      };
    });
    e.preventDefault();
  }

  getAllObjects() {
    const sortedContainersTablesCount = _.orderBy(
      this.state.containersTablesCount,
      [NAME_FIELD]
    );

    return _.map(sortedContainersTablesCount, (tableCount) => {
      return (
        <div
          className="im-items-selection"
          key={tableCount.name}
          onClick={this.changeCheck.bind(this, tableCount)}
        >
          <div>
            <CheckboxCustom
              checked={
                this.state.containersTablesCount[tableCount.name].checked
              }
              onChange={this.changeCheck.bind(this, tableCount)}
            />
          </div>
          <div>{tableCount.name}</div>
          <div>{tableCount.count}</div>
        </div>
      );
    });
  }

  isAddDiagramsByContainersActionEnabled() {
    return _.reduce(
      this.state.containersTablesCount,
      (result, item) => (item.checked ? true : result),
      false
    );
  }

  render() {
    const containersName = getContainerName(this.props.type);
    const isEnabled = this.isAddDiagramsByContainersActionEnabled();
    const disabledText = isEnabled === false ? " im-disabled" : "";
    return (
      <CSSTransition
        in={this.props.addDiagramsByContainersModalIsDisplayed}
        key="ModalAddDiagramsByContainers"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal"
              data-testid={TEST_ID.MODALS.ADD_DIAGRAMS_BY_CONTAINERS}
            >
              <div className="modal-header im-relative">
                Add diagrams by {containersName}
              </div>

              <div className="modal-content modal-content-notabs">
                <div className="im-diagram-items-modal">
                  <div className="im-p-sm"></div>
                  <div>{this.getTableHeaders()}</div>
                </div>
                <div>{this.getAllObjects()}</div>
              </div>

              <div className="modal-footer">
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.close.bind(this)}
                >
                  Close
                </button>
                <button
                  autoFocus
                  className={`im-btn-default im-margin-right${disabledText}`}
                  onClick={this.addDiagramsByContainers.bind(this, isEnabled)}
                >
                  Add diagrams
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
    addDiagramsByContainersModalIsDisplayed:
      state.ui.addDiagramsByContainersModalIsDisplayed,
    type: state.model.type,
    tables: state.tables
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleAddDiagramsByContainersModal,
        addDiagramsByContainers,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalAddDiagramsByContainers)
);
