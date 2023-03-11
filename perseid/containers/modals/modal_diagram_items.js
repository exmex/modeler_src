import React, { Component } from "react";
import { addDiagramItems, deleteDiagramItems } from "../../actions/diagrams";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import { setChangeScroll, toggleDiagramItemsModal } from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import CheckboxCustom from "../../components/checkbox_custom";
import Draggable from "react-draggable";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "../../enums/enums";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createDiagramItem } from "../../classes/factory/class_diagram_item_factory";
import { getActiveDiagramItems } from "../../selectors/selector_diagram";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router-dom";

class ModalDiagramItems extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.refSearchBox = React.createRef();
    this.state = { searchTerm: "", sortBy: "name", sortOrderAsc: true };
    this.onInputChangeDebounced = _.debounce(
      this.onInputChangeDebounced.bind(this),
      200
    );
    this.clearSearchTerm = this.clearSearchTerm.bind(this);
    this.setSort = this.setSort.bind(this);
  }

  objectAndTypeById(id) {
    let toReturn = {};
    if (this.props.tables[id]) {
      if (this.props.tables[id].objectType === "composite") {
        toReturn = {
          obj: this.props.tables[id],
          type: "composite",
          objectType: "Composite"
        };
      } else {
        let objTypeName = this.props.tables[id].embeddable
          ? _.upperFirst(this.props.localization.L_TABLE_EMBEDDABLE)
          : _.upperFirst(this.props.localization.L_TABLE);
        toReturn = {
          obj: this.props.tables[id],
          type: "table",
          objectType: objTypeName
        };
      }
    } else if (this.props.notes[id]) {
      toReturn = {
        obj: this.props.notes[id],
        type: "note",
        objectType: "Note"
      };
    } else if (this.props.otherObjects[id]) {
      toReturn = {
        obj: this.props.otherObjects[id],
        type: "other_object",
        objectType: _.upperFirst(this.props.otherObjects[id].type)
      };
    }
    return toReturn;
  }

  clearSearchTerm() {
    this.setState({ searchTerm: "" });
    this.refSearchBox.current.value = "";
  }

  // the searchTerm in state is almost not needed, only left due to debounce
  onInputChangeDebounced() {
    this.setState({ searchTerm: this.refSearchBox.current.value });
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.diagramItemsModalIsDisplayed === true) {
        this.clearSearchTerm();
        this.props.toggleDiagramItemsModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  onShowDiagramItemsClick() {
    this.clearSearchTerm();
    this.props.toggleDiagramItemsModal();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  isOnDiagram(objId) {
    return this.props.diagramObjects[objId] ? true : false;
  }

  setSort(sortBy) {
    if (this.state.sortBy === sortBy) {
      this.setState({ sortOrderAsc: !this.state.sortOrderAsc });
    } else {
      this.setState({ sortBy: sortBy, sortOrderAsc: true });
    }
  }

  getTableHeaders() {
    return (
      <div className="im-items-selection-header">
        <div></div>
        <div className="im-cols-header-fixed">
          <span className="im-pointer" onClick={() => this.setSort("name")}>
            Name
          </span>
        </div>
        <div
          className="im-cols-header-fixed"
          onClick={() =>
            this.setSort(
              this.props.type === ModelTypes.PG ? "schema" : "database"
            )
          }
        >
          {this.props.type === ModelTypes.PG && "Schema"}
          {this.props.type === ModelTypes.MYSQL && "Database"}
          {this.props.type === ModelTypes.MARIADB && "Database"}
          {this.props.type === ModelTypes.MONGODB && "Database"}
        </div>
        <div className="im-cols-header-fixed">
          <span
            className="im-pointer"
            onClick={() => this.setSort("objectType")}
          >
            Object type
          </span>
        </div>
      </div>
    );
  }

  getAllObjects() {
    let allObjects = {
      ...this.props.tables,
      ...this.props.notes,
      ...this.props.otherObjects
    };
    let sortType = this.state.sortOrderAsc === true ? ["asc"] : ["desc"];
    var sortedAllObjects;
    if (this.state.sortBy !== "objectType") {
      sortedAllObjects = _.orderBy(
        allObjects,
        [(it) => it["name"].toLowerCase()],
        sortType
      );
    } else if (this.state.sortBy === "objectType") {
      sortedAllObjects = _.orderBy(
        allObjects,
        [
          (it) =>
            it["type"] ? it["type"].toLowerCase() : it["name"].toLowerCase()
        ],
        sortType
      );
    }

    if (this.state.searchTerm !== "") {
      sortedAllObjects = sortedAllObjects.filter((t) =>
        t.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
      );
    }

    if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      sortedAllObjects = _.filter(sortedAllObjects, function (o) {
        return JsonSchemaHelpers.isRootOrDef(o);
      });
    }

    return _.map(sortedAllObjects, (singleObj) => {
      let objDetails = this.objectAndTypeById(singleObj.id);
      return (
        <div
          className="im-items-selection"
          key={singleObj.id}
          onClick={(e) => {
            this.addOrRemove(singleObj.id);
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div>
            <CheckboxCustom
              checked={this.isOnDiagram(singleObj.id)}
              onChange={(e) => this.addOrRemove(singleObj.id)}
              label=""
            />
          </div>
          <div>{singleObj.name}</div>
          <div>
            {singleObj.pg?.schema} {singleObj.database}
          </div>
          <div>{objDetails.objectType}</div>
        </div>
      );
    });
  }

  async addOrRemove(objectId) {
    if (this.isOnDiagram(objectId) === false) {
      let obj = this.objectAndTypeById(objectId);
      const di = createDiagramItem(
        obj.obj,
        obj.type,
        _.random(100, 250),
        _.random(100, 250)
      );

      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.MODAL_DIAGRAM_ITEMS__ADD_DIAGRAM_ITEMS
      );
      try {
        await this.props.addDiagramItems(this.props.match.params.did, [di]);
        this.revealNewAddedItem();
      } finally {
        await this.props.finishTransaction();
      }
    } else {
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.MODAL_DIAGRAM_ITEMS__DELETE_DIAGRAM_ITEMS
      );
      try {
        await this.props.deleteDiagramItems(
          this.props.match.params.did,
          objectId
        );
      } finally {
        await this.props.finishTransaction();
      }
    }
  }

  revealNewAddedItem() {
    this.props.setChangeScroll({ x: 0, y: 0 });
  }

  renderSearchInput() {
    var buttonDisplayedStyle = "";
    if (this.state.searchTerm?.length > 0) {
      buttonDisplayedStyle = "im-search-button";
    } else {
      buttonDisplayedStyle = "im-display-none";
    }
    return (
      <div className="im-search-bar im-search-fixed-width">
        <div></div>
        <input
          className="im-search-box-input"
          placeholder="Filter by object name"
          type="text"
          id="searchInput"
          ref={this.refSearchBox}
          onChange={this.onInputChangeDebounced}
        />
        <div
          className={buttonDisplayedStyle}
          onClick={this.clearSearchTerm.bind(this)}
        >
          <i className="im-icon-Cross16 im-icon-16" />
        </div>
        <div />
      </div>
    );
  }

  render() {
    if (this.props.diagramItemsModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.diagramItemsModalIsDisplayed}
          key="ModalDiagramItems"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal"
                data-testid={TEST_ID.MODALS.DIAGRAM_ITEMS}
              >
                {this.renderSearchInput()}
                <div className="modal-header im-relative">Diagram items</div>

                <div className="modal-content modal-content-notabs">
                  <div className="im-diagram-items-modal">
                    <div className="im-p-sm"></div>
                    <div>{this.getTableHeaders()}</div>
                  </div>
                  <div>{this.getAllObjects()}</div>
                </div>

                <div className="modal-footer">
                  <button
                    autoFocus
                    className="im-btn-default im-margin-right"
                    onClick={this.onShowDiagramItemsClick.bind(this)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Draggable>
          </div>
        </CSSTransition>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    diagramItemsModalIsDisplayed: state.ui.diagramItemsModalIsDisplayed,
    activeDiagram: state.activeDiagram,
    type: state.model.type,
    tables: state.tables,
    notes: state.notes,
    localization: state.localization,
    otherObjects: state.otherObjects,
    diagramObjects: getActiveDiagramItems(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleDiagramItemsModal,
        addDiagramItems,
        deleteDiagramItems,
        setChangeScroll,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalDiagramItems)
);
