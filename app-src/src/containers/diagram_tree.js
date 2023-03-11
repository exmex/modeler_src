import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.core.css";

import {
  DROPDOWN_MENU,
  DROPDOWN_MENU_SOURCE,
  openDropDownMenu,
  setColHeight,
  setDiagramAreaMode,
  setDiagramLoading,
  setForcedRender,
  setMovement,
  setRelationClicks,
  toggleConfirmDelete,
  toggleConfirmDeleteRelation,
  toggleFinder,
  toggleLineModal,
  toggleNoteModal,
  toggleOtherObjectModal,
  toggleRelationModal,
  toggleTableModal
} from "../actions/ui";
import React, { Component, Fragment } from "react";
import {
  TableControlTypesJson,
  TableObjectTypesJson
} from "../platforms/jsonschema/class_table_jsonschema";
import {
  addNote,
  deleteNote,
  fetchNote,
  updateNoteProperty
} from "../actions/notes";
import {
  addOtherObject,
  deleteOtherObject,
  fetchOtherObject
} from "../actions/other_objects";
import {
  addRelation,
  deleteRelation,
  fetchRelation,
  fetchRelations
} from "../actions/relations";
import {
  addTable,
  deleteTable,
  fetchTable,
  fetchTableAndCatalog,
  updateColumnProperty,
  updateTableProperty
} from "../actions/tables";
import {
  addToSelection,
  clearAddToSelection,
  clearSelection
} from "../actions/selections";
import { finishTransaction, startTransaction } from "../actions/undoredo";
import { setDisplayMode, updateModelProperty } from "../actions/model";

import { DebounceInput } from "react-debounce-input";
import DiagramFinder from "../containers/diagram_finder";
import Helpers from "../helpers/helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { KeyTypes } from "../platforms/jsonschema/class_column_jsonschema";
import { MessageIcon } from "../components/message_icon";
import { ModelTypes } from "../enums/enums";
import Sortable from "react-sortablejs";
import TreeDiagramHelpers from "../helpers/tree_diagram/tree_diagram_helpers";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addLine } from "../actions/lines";
import arrayMove from "array-move";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { getReducedOtherObjectsList } from "../selectors/selector_other_objects";
import json5 from "json5";
import md5 from "md5";
import { navigateToDiagramUrl } from "../components/url_navigation";
import { setObjectsCopyList } from "../actions/objects_copies";
import { wheelZoom } from "../helpers/zoom/wheel-zoom";
import { withRouter } from "react-router-dom";

const SPACE_KEY_CODE = 32;

const initActiveDomItem = {
  activeDomItemId: ""
};

const initPan = {
  pan: {
    active: false,
    space: false,
    startX: 0,
    startY: 0,
    scrollX: 0,
    scrollY: 0
  }
};

class DiagramTree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initPan,
      ...initActiveDomItem
    };

    this.intersectionObserver = null;
    this.handleWheel = this.handleWheel.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.handlePanStart = this.handlePanStart.bind(this);
    this.handlePanEnd = this.handlePanEnd.bind(this);
    this.handlePanMove = this.handlePanMove.bind(this);
  }

  componentDidMount() {
    var canvas = document.getElementById("canvas");

    if (canvas !== null) {
      canvas.addEventListener("keyup", this.handleKeyUp, false);
      canvas.addEventListener("mousedown", this.handlePanStart, false);
      canvas.addEventListener("wheel", this.handleWheel, {
        capture: true,
        passive: false
      });
      canvas.addEventListener("keydown", this.handleKeyDown, false);
      let options = {
        root: document.querySelector("#main-area"),

        threshold: [0, 1]
      };
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            if (entry.intersectionRatio > 0.9) {
              entry.target.setAttribute("graphics-fully-visible", "yes");
            } else {
              entry.target.removeAttribute("graphics-fully-visible");
            }
          } else {
            entry.target.removeAttribute("graphics-fully-visible");
          }
        });
      }, options);
      var treeDiagramGraphics = document.querySelectorAll(".tree__item__named");
      treeDiagramGraphics.forEach((node) => {
        this.intersectionObserver.observe(node);
      });
    }

    TreeDiagramHelpers.collapseNodesFromArray(this.props.collapsedTreeItems);
  }

  componentDidUpdate(prevProps) {
    if (this.props.collapsedTreeItems !== prevProps.collapsedTreeItems) {
      TreeDiagramHelpers.collapseNodesFromArray(this.props.collapsedTreeItems);
    }

    if (this.props.match.params.cid !== prevProps.match.params.cid) {
      let el = document.querySelector(
        `[data-col-id="${this.props.match.params.cid}"]`
      );
      if (el) {
        this.updateActiveDomItemId(el.id);
      }
    }
  }

  componentWillUnmount() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    var canvas = document.getElementById("canvas");
    if (canvas !== null) {
      canvas.removeEventListener("mousedown", this.handlePanStart, false);
      canvas.removeEventListener("wheel", this.handleWheel, false);
      canvas.removeEventListener("keydown", this.handleKeyDown, false);
      canvas.removeEventListener("keyup", this.handleKeyUp, false);
    }
  }

  handlePanStart(event) {
    if (
      event.buttons === 4 ||
      (event.buttons === 1 && this.state.pan.space === true)
    ) {
      var mainArea = document.getElementById("main-area");
      this.setState(
        {
          pan: {
            active: true,
            space: this.state.pan.space,
            startX: event.clientX,
            startY: event.clientY,
            scrollX: mainArea.scrollLeft,
            scrollY: mainArea.scrollTop
          }
        },
        () => {
          document.addEventListener("mousemove", this.handlePanMove, false);
          document.addEventListener("mouseup", this.handlePanEnd, false);
        }
      );
    }
  }

  handlePanEnd() {
    if (this.state.pan.active === true) {
      this.setState(
        {
          pan: {
            active: false,
            space: this.state.pan.space,
            startX: 0,
            startY: 0,
            scrollX: 0,
            scrollY: 0
          }
        },
        () => {
          document.removeEventListener("mousemove", this.handlePanMove);
          document.removeEventListener("mouseup", this.handlePanEnd);
        }
      );
    }
  }

  handlePanMove(event) {
    if (this.state.pan.active === true) {
      UIHelpers.scrollToXandY(
        this.state.pan.scrollX - event.clientX + this.state.pan.startX,
        this.state.pan.scrollY - event.clientY + this.state.pan.startY
      );
    }
  }

  updateActiveDomItemId(targetElementId) {
    this.setState({ activeDomItemId: targetElementId });
  }

  handleKeyUp(event) {
    if (event.keyCode === SPACE_KEY_CODE) {
      this.setState({
        pan: { space: false }
      });
      event.preventDefault();
    }
  }

  async handleKeyDown(event) {
    let charCode = String.fromCharCode(event.which).toLowerCase();

    if (event.keyCode === SPACE_KEY_CODE) {
      // do not autoscroll down
      event.preventDefault();
      event.stopPropagation();
      if (this.state.pan.space !== true) {
        this.setState({
          pan: { space: true }
        });
      }
      return;
    }

    if (
      (event.ctrlKey && charCode === "f") ||
      (event.metaKey && charCode === "f")
    ) {
      await this.props.toggleFinder();
      if (this.props.finderIsDisplayed) {
        TreeDiagramHelpers.focusFindOnDiagramInput();
      } else {
        UIHelpers.setFocusToCanvasAndKeepScrollPosition();
      }

      event.preventDefault();
    }

    if (
      (event.ctrlKey && event.key === "ArrowRight") ||
      (event.metaKey && event.key === "ArrowRight")
    ) {
      TreeDiagramHelpers.expandAllChildNodes(
        this.state.activeDomItemId,
        this.props.zoom
      );
      this.props.updateModelProperty(this.props.id, true, "isDirty");
      event.preventDefault();
    } else if (
      (event.ctrlKey && event.key === "ArrowLeft") ||
      (event.metaKey && event.key === "ArrowLeft")
    ) {
      TreeDiagramHelpers.expandOrCollapseChildNodes(
        this.state.activeDomItemId,
        true,
        this.props.zoom,
        false
      );
      this.props.updateModelProperty(this.props.id, true, "isDirty");
      event.preventDefault();
    } else if (event.shiftKey && event.key === "ArrowRight") {
      TreeDiagramHelpers.expandOrCollapseChildNodes(
        this.state.activeDomItemId,
        false,
        this.props.zoom,
        true
      );
      this.props.updateModelProperty(this.props.id, true, "isDirty");
      event.preventDefault();
    } else if (event.shiftKey && event.key === "ArrowLeft") {
      TreeDiagramHelpers.expandOrCollapseChildNodes(
        this.state.activeDomItemId,
        false,
        this.props.zoom,
        false
      );
      this.props.updateModelProperty(this.props.id, true, "isDirty");
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      await this.navigateRight(this.state.activeDomItemId);
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      await this.navigateLeft(this.state.activeDomItemId);
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      await this.navigateUp(this.state.activeDomItemId);
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      await this.navigateDown(this.state.activeDomItemId);
      event.preventDefault();
    }
  }

  doNothing(e) {
    e.stopPropagation();
  }

  handleWheel(event) {
    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
    const mainArea = document.getElementById("main-area");
    const clientRect = mainArea.getBoundingClientRect();
    if (!mainArea || !isCtrlOrMeta) {
      return;
    }
    event.preventDefault();

    this.props.wheelZoom({
      delta: {
        x: event.deltaX,
        y: event.deltaY
      },
      cursor: {
        x: event.clientX - clientRect.left,
        y: event.clientY - clientRect.top
      },
      scroll: {
        x: mainArea.scrollLeft,
        y: mainArea.scrollTop
      }
    });
  }

  async handleTableTextChange(tableId, propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_TREE__UPDATE_TABLE_PROPERTY
    );
    try {
      this.props.updateTableProperty(tableId, value, propName, false);
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleTextChange(columnId, tableId, propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_TREE__UPDATE_COLUMN_PROPERTY
    );
    try {
      await this.props.updateColumnProperty(tableId, columnId, value, propName);
    } finally {
      await this.props.finishTransaction();
    }
  }

  getRootElementCaption(obj) {
    if (JsonSchemaHelpers.isSchema(obj)) {
      return (
        <span className="tree__icon__ref">
          <i className="im-icon-Table" />
        </span>
      );
    }
    if (JsonSchemaHelpers.isRef(obj)) {
      return (
        <span className="tree__icon__referenced">
          <i className="im-icon-Linked" />
        </span>
      );
    }
    if (JsonSchemaHelpers.isDef(obj)) {
      return (
        <span className="tree__icon__ref">
          <i className="im-icon-Type" />
        </span>
      );
    }
  }

  renderKeyByType(table, column) {
    if (
      table.objectType === TableObjectTypesJson.KEYARRAY ||
      table.objectType === TableObjectTypesJson.KEYOBJECT ||
      table.objectType === TableObjectTypesJson.ANYOF ||
      table.objectType === TableObjectTypesJson.ALLOF ||
      table.objectType === TableObjectTypesJson.ONEOF ||
      table.objectType === TableObjectTypesJson.NOT
    ) {
      switch (table.objectType) {
        case TableObjectTypesJson.ALLOF:
        case TableObjectTypesJson.ANYOF:
        case TableObjectTypesJson.ONEOF:
        case TableObjectTypesJson.NOT:
          return this.renderChoice(table, column);
        case TableObjectTypesJson.KEYOBJECT:
        case TableObjectTypesJson.KEYARRAY:
        default:
          return this.renderKey(table, column);
      }
    }
  }

  renderKey(table, column) {
    return (
      <div className={"tree__key"}>
        <div className="tree__key__text">
          <div className="tree__key__inputwrapper">
            {JsonSchemaHelpers.renderKeyTypeIcon(table.objectType, column.name)}
            <DebounceInput
              minLength={1}
              placeholder={"name"}
              size={2}
              debounceTimeout={300}
              className={"tree__input col_" + column.id + " form-control"}
              type="text"
              value={Helpers.gv(column.name)}
              onChange={this.handleTextChange.bind(
                this,
                column.id,
                this.props.match.params.id,
                "name"
              )}
            />
            <span></span>
            <div key={column.id} className="tree__item__hidden">
              {column.name}
            </div>
          </div>
          {column.comment && this.props.showDescriptions && (
            <div title={column.comment} key={column.id + "_c"}>
              <span className="tree__prop__comment">
                {JsonSchemaHelpers.shortenLongText(column.comment, 200)}
              </span>
            </div>
          )}
          {this.getColSpec(column)}
        </div>
      </div>
    );
  }

  renderChoice(table, column) {
    return (
      <div className={"tree__choice tree__choice__" + column.name}>
        <div className="tree__choice__wrapper">
          <div className="tree__choice__text">{column.name}</div>
          {column.comment && this.props.showDescriptions && (
            <div title={column.comment} key={column.id + "_c"}>
              <span className="tree__prop__comment">
                {JsonSchemaHelpers.shortenLongText(column.comment, 200)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  getSchemaDefinition(projectType, schema) {
    switch (projectType) {
      case ModelTypes.OPENAPI:
        if (schema.includes("2.0")) {
          return (
            <>
              <span className="tree__prop__key">swagger: </span>
              <span className="tree__prop__value">{schema}</span>
            </>
          );
        } else {
          return (
            <>
              <span className="tree__prop__key">openapi: </span>
              <span className="tree__prop__value">{schema}</span>
            </>
          );
        }
      case ModelTypes.JSONSCHEMA:
      default:
        return (
          <>
            <span className="tree__prop__key">$schema: </span>
            <span className="tree__prop__value">
              {JsonSchemaHelpers.getSchemaShortName(schema)}
            </span>
          </>
        );
    }
  }

  getColSpec(column) {
    if (!!column.specification && this.props.showSpecifications) {
      try {
        let specObj = json5.parse(column.specification);
        let filteredSpecObj = _.omit(specObj, [
          "description",
          "$schema",
          "swagger",
          "openapi"
        ]);

        let specToShow = [];
        _.forOwn(filteredSpecObj, function (value, key) {
          specToShow.push(
            <div key={column.id + [key]} className="tree__flex__rows">
              <span className="tree__prop__key">{key}: </span>
              <span
                className="tree__prop__value"
                title={Helpers.getEmptyObjectOrValue(value, false)}
              >
                {Helpers.getEmptyObjectOrValue(value, true)}
              </span>
            </div>
          );
        });

        return (
          <div className="tree__spec">
            {filteredSpecObj && <div>{specToShow}</div>}
            {specObj.$schema && (
              <div
                title={specObj.$schema}
                key={column.id + "_schema"}
                className="tree__flex__rows"
              >
                <span className="tree__prop__key">$schema: </span>
                <span className="tree__prop__value">
                  {JsonSchemaHelpers.getSchemaShortName(specObj.$schema)}
                </span>
              </div>
            )}
          </div>
        );
      } catch (e) {
        return (
          <div className="tree__spec">
            <MessageIcon
              visible={
                column.specification &&
                !Helpers.isValidJson5Structure(column.specification)
              }
              tooltip="Invalid JSON"
              type="error"
              iconSize="12"
              direction="left"
            ></MessageIcon>
            {JsonSchemaHelpers.shortenLongText(
              column.specification.toString(),
              20
            )}
          </div>
        );
      }
    }
  }

  renderColumnType(column) {
    if (JsonSchemaHelpers.isRootOrDef(this.props.tables[column.datatype])) {
      return "ref";
    } else {
      return this.props.tables[column.datatype]?.objectType;
    }
  }

  renderRequired(required) {
    return required === true ? (
      <div>
        <span className="tree__item__req">R</span>
      </div>
    ) : (
      ""
    );
  }

  renderConditionTypeIcon(column) {
    const colName = column.name;
    switch (colName) {
      case KeyTypes.IF:
      case KeyTypes.THEN:
      case KeyTypes.ELSE:
        return <div className="tree__condition__text">{colName}</div>;
      case undefined:
      default:
        return "";
    }
  }

  getEmtpyRelationContainer(table, targetId) {
    const lineColor = this.props.theme === "im-dark" ? "#eee" : "#000";
    var a = 0;
    var emptyRelationsJsxArray = [];
    if (table && _.size(table.cols) > 0) {
      _.map(table.cols, (col) => {
        a++;
        const unique = md5(col.id + "_" + table.id + "_" + targetId);
        const domColItemId = "item_" + unique;

        var embeddedTable = this.props.tables[col.datatype];

        emptyRelationsJsxArray.push(
          <path
            className="im-rel-path im-tree-path"
            style={{ stroke: lineColor }}
            id={`g_${domColItemId}`}
            key={`g_${domColItemId}`}
          ></path>
        );
        emptyRelationsJsxArray.push(
          <Fragment key={"f_" + unique}>
            {this.getEmtpyRelationContainer(embeddedTable, unique)}
          </Fragment>
        );
      });
      return emptyRelationsJsxArray;
    }
  }

  getVisibleEmbeddedTableCols(embeddedTable) {
    return embeddedTable?.nodeType === TableControlTypesJson.SUBSCHEMA &&
      !this.props.showLocallyReferenced
      ? []
      : embeddedTable?.cols ?? [];
  }

  getItemBg(colName) {
    if (JsonSchemaHelpers.isCondition(colName)) {
      return ``;
    } else {
      return `tree__item__bg`;
    }
  }

  getItemBox(colName) {
    if (JsonSchemaHelpers.isCondition(colName)) {
      return `tree__condition tree__condition__${colName}`;
    } else {
      return `tree__item__box`;
    }
  }

  getItemSpecStyle(colName) {
    if (JsonSchemaHelpers.isCondition(colName)) {
      return `tree__item__spec tree__condition__wrapper`;
    } else {
      return `tree__item__spec`;
    }
  }

  renderColumnDataType(column) {
    const dataType = JsonSchemaHelpers.getColDataType(
      column,
      this.props.tables,
      false,
      this.props.catalogColumns
    );

    if (dataType !== "") {
      return <span className="tree__datatype__name">{dataType}</span>;
    } else {
      return "";
    }
  }

  getTableCols(tableCols, table, targetId) {
    var a = 0;
    var itemIndex = -1;
    const sortList = JsonSchemaHelpers.sortOrder();
    const sortedTableCols = tableCols.sort((a, b) => {
      return sortList.indexOf(a.name) - sortList.indexOf(b.name);
    });

    return _.map(sortedTableCols, (col) => {
      a++;
      let lineStyleForItem = this.getLineStyle(sortedTableCols, a);

      if (JsonSchemaHelpers.isArrayLike(table.objectType)) {
        itemIndex++;
      }

      var embeddedGraphics = <div />;
      var embeddedTable = this.props.tables[col.datatype];
      const visibleEmbeddedTableCols =
        this.getVisibleEmbeddedTableCols(embeddedTable);

      const unique = md5(col.id + "_" + table.id + "_" + targetId);
      const domColItemId = "item_" + unique;
      let subId = "sub_" + unique;
      let i = 0;
      if (embeddedTable !== undefined) {
        i++;
        let treeItemStyle = `tree__item__sub im-display-inline-block group `;

        if (
          JsonSchemaHelpers.isReferenced(
            col,
            this.props.tables,
            this.props.catalogColumns
          ) &&
          this.props.tables[col.datatype] &&
          _.size(this.props.tables[col.datatype].cols) > 0
        ) {
          /*treeItemStyle += " tree__bg__referenced";*/
        }
        if (
          JsonSchemaHelpers.isReferencedSubschema(col, this.props.tables) &&
          this.props.tables[col.datatype] &&
          _.size(visibleEmbeddedTableCols) > 0
        ) {
          treeItemStyle += " tree__bg__subschema";
        }

        embeddedGraphics = (
          <div key={"colItem" + col.id} className={treeItemStyle} id={subId}>
            <Sortable
              options={{
                handle: ".tree__item",
                animation: 150,
                easing: "easeOutBounce",
                dragoverBubble: true
              }}
              onChange={async (order, sortable, evt) => {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                await this.props.startTransaction(
                  getHistoryContext(this.props.history, this.props.match),
                  UndoRedoDef.COLUMNS_JSONSCHEMA__COLS_REORDER
                );
                try {
                  const newSort = arrayMove(
                    embeddedTable.cols,
                    oldIndex,
                    newIndex
                  );
                  const newTable = Object.assign(
                    {},
                    { ...embeddedTable, cols: newSort }
                  );
                  this.props.fetchTable(newTable);
                  this.props.fetchTableAndCatalog(embeddedTable);
                } finally {
                  await this.props.finishTransaction();
                }
              }}
            >
              {this.getTableCols(
                visibleEmbeddedTableCols,
                embeddedTable,
                unique
              )}
            </Sortable>
          </div>
        );
      }

      let style = `tree__item__named  ${lineStyleForItem}   ${
        this.props.match.params.cid && this.props.match.params.cid === col.id
          ? " sel-item-diagram-multi"
          : ""
      }`;

      return (
        <div key={domColItemId} className={`tree__item t__${lineStyleForItem}`}>
          <div key={"a" + domColItemId} className="tree__item__hidden__caption">
            <div className="tree__item__hidden__caption__text">{col.name}</div>
          </div>
          <div
            tabIndex={-1}
            id={domColItemId}
            className={style}
            data-report-id={col.datatype}
            data-table-id={table.id}
            data-col-id={col.id}
            onClick={(e) => {
              this.updateActiveDomItemId(domColItemId);
              this.props.clearAddToSelection("table", col.datatype);
              this.props.setForcedRender({ domToModel: false });
              this.props.history.push(
                "/model/" +
                  this.props.match.params.mid +
                  "/diagram/" +
                  this.props.match.params.did +
                  "/emb/" +
                  table.id +
                  "/col/" +
                  col.id
              );
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              this.updateActiveDomItemId(domColItemId);

              this.props.clearAddToSelection("table", col.datatype);
              this.props.history.push(
                "/model/" +
                  this.props.match.params.mid +
                  "/diagram/" +
                  this.props.match.params.did +
                  "/emb/" +
                  table.id +
                  "/col/" +
                  col.id
              );

              this.objectContextMenu(DROPDOWN_MENU.COLUMN, col.datatype, e);
            }}
          >
            {(embeddedTable === undefined ||
              (embeddedTable.objectType !== TableObjectTypesJson.KEYOBJECT &&
                embeddedTable.objectType !== TableObjectTypesJson.KEYARRAY &&
                embeddedTable.objectType !== TableObjectTypesJson.ALLOF &&
                embeddedTable.objectType !== TableObjectTypesJson.ANYOF &&
                embeddedTable.objectType !== TableObjectTypesJson.ONEOF &&
                embeddedTable.objectType !== TableObjectTypesJson.NOT)) && (
              <div
                className={`${this.getItemBg(col.name)} ${
                  col.nn ? "tree__item__required" : ""
                }`}
              >
                <div className={this.getItemBox(col.name)}>
                  <div className={this.getItemSpecStyle(col.name)}>
                    <div className="tree__item__inputwrapper">
                      {JsonSchemaHelpers.isArrayLike(table.objectType) ? (
                        <span className="tree__item__index">[{itemIndex}]</span>
                      ) : JsonSchemaHelpers.isCondition(col.name) ? (
                        this.renderConditionTypeIcon(col)
                      ) : (
                        <DebounceInput
                          minLength={1}
                          placeholder={"name"}
                          size={2}
                          debounceTimeout={300}
                          className={
                            "tree__input col_" + col.id + " form-control"
                          }
                          type="text"
                          value={Helpers.gv(col.name)}
                          onChange={this.handleTextChange.bind(
                            this,
                            col.id,
                            table.id,
                            "name"
                          )}
                        />
                      )}
                    </div>
                    {!JsonSchemaHelpers.isArrayLike(table.objectType) && (
                      <div
                        key={"b" + domColItemId}
                        className="tree__item__hidden"
                      >
                        {col.name}
                      </div>
                    )}

                    <div className="tree__item__last">
                      <div key={col.id}>
                        {JsonSchemaHelpers.renderDataTypeIcon(
                          col,
                          this.props.tables,
                          this.props.catalogColumns
                        )}

                        {this.renderColumnDataType(col)}

                        {this.props.tables[col.datatype]?.objectType ===
                          TableObjectTypesJson.ANY &&
                          col.ref && (
                            <div className="tree__spec" title={col.ref}>
                              <div>
                                <div className="tree__flex__rows">
                                  <span className="tree__ref__key">$ref: </span>
                                  <span className="tree__prop__value">
                                    {col.ref.trim()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                        {col.comment && this.props.showDescriptions && (
                          <div title={col.comment} key={col.id + "_c"}>
                            <span className="tree__prop__comment">
                              {JsonSchemaHelpers.shortenLongText(
                                col.comment,
                                200
                              )}
                            </span>
                          </div>
                        )}

                        {this.getColSpec(col)}
                      </div>
                      {this.renderRequired(col.nn)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {embeddedTable && this.renderKeyByType(embeddedTable, col)}

            {embeddedTable && _.size(visibleEmbeddedTableCols) > 0 && (
              <div
                className="tree__expander__icon__left"
                onClick={(e) => {
                  this.updateActiveDomItemId(domColItemId);
                  TreeDiagramHelpers.toggleChildrenVisibility(subId);
                  this.props.clearAddToSelection("table", col.datatype);
                  this.props.updateModelProperty(
                    this.props.model.id,
                    true,
                    "isDirty"
                  );
                  this.props.setForcedRender({ domToModel: false });
                  this.props.history.push(
                    "/model/" +
                      this.props.match.params.mid +
                      "/diagram/" +
                      this.props.match.params.did +
                      "/emb/" +
                      table.id +
                      "/col/" +
                      col.id
                  );

                  e.stopPropagation();
                }}
              >
                <i className={`im-icon-16 im-icon-FullCircle`} />
                <i
                  id={"icon_" + subId}
                  className={`im-icon-16 im-icon-MinusCircle16 im-position-top-2`}
                />
              </div>
            )}
          </div>
          {/*}  <br />
          {"SOURCE " + domColItemId}
          <br />
          <br />
          <br />
                            {"TARGET " + targetId}*/}

          {embeddedTable !== undefined ? (
            <div className={"tree__flex"}>
              <>{embeddedGraphics}</>
            </div>
          ) : (
            ""
          )}
        </div>
      );
    });
  }

  getLineStyle(tableCols, i) {
    let colsCnt = _.size(tableCols);
    if (colsCnt === 1) {
      return "tree__item__single__line";
    } else {
      if (i === 1) {
        return "tree__item__first__line";
      } else if (i === colsCnt && i !== 0) {
        return "tree__item__last__line";
      } else if (colsCnt < 1) {
        return "tree__item__no__line";
      } else {
        return "tree__item__middle__line";
      }
    }
  }

  renderRoot() {
    return (
      <>
        {this.renderRootElements("schema")}
        {this.renderRootElements("subschema")}
        {this.renderRootElements("refs")}
      </>
    );
  }

  renderRootElements(type) {
    var visibleTables = _.filter(this.props.tables, function (o) {
      if (type === "schema") {
        return (
          JsonSchemaHelpers.isRootOrDef(o) &&
          o.visible === true &&
          JsonSchemaHelpers.isSchema(o)
        );
      }
      if (type === "subschema") {
        return (
          JsonSchemaHelpers.isRootOrDef(o) &&
          o.visible === true &&
          JsonSchemaHelpers.isDef(o)
        );
      }
      if (type === "refs") {
        return (
          JsonSchemaHelpers.isRootOrDef(o) &&
          o.visible === true &&
          JsonSchemaHelpers.isRef(o)
        );
      }
    });

    var i = 0;
    return _.map(visibleTables, (table) => {
      let rootId = table.id + "_root";
      let subId = "sub_" + rootId;
      i++;
      let rootStyle = JsonSchemaHelpers.getRootTypeStyle(table);
      let style = `tree__item__named  ${
        (this.props.match.params.id === table.id &&
          this.props.match.params.cid === undefined) ||
        this.props.selections[table.id]
          ? " sel-item-diagram-multi"
          : ""
      }`;

      return (
        <div key={rootId} className={"tree__item__root group "}>
          <div className="tree__item__root__wrapper">
            <div
              onClick={(e) => {
                this.updateActiveDomItemId("item_" + rootId);
                this.props.clearAddToSelection("table", table.id);
                this.props.setForcedRender({ domToModel: false });
                this.props.history.push(
                  `/model/${this.props.match.params.mid}/diagram/${
                    this.props.match.params.did
                  }/${table.embeddable ? "emb" : "item"}/${table.id}`
                );
                e.stopPropagation();
              }}
              onContextMenu={(e) => {
                this.updateActiveDomItemId("item_" + rootId);
                this.props.setForcedRender({ domToModel: false });
                this.props.history.push(
                  `/model/${this.props.match.params.mid}/diagram/${
                    this.props.match.params.did
                  }/${table.embeddable ? "emb" : "item"}/${table.id}`
                );

                this.objectContextMenu(
                  DROPDOWN_MENU.DIAGRAM_ITEM,
                  this.props.match.params.id,
                  e
                );
              }}
              data-report-id={table.id}
              data-table-id={table.id}
              id={"item_" + rootId}
              className={style}
            >
              <div
                className={rootStyle + " tree__item__rootbox  tree__item__bg"}
              >
                <div className="tree__item__type">
                  <div className="tree__item__icon">
                    {this.getRootElementCaption(table)}
                  </div>
                </div>
                <div className="tree__item__spec">
                  <div className="tree__item__inputwrapper ">
                    <DebounceInput
                      minLength={1}
                      placeholder={"name"}
                      size={2}
                      debounceTimeout={300}
                      className={
                        "tree__input col_" + table.id + " form-control"
                      }
                      type="text"
                      value={Helpers.gv(table.name)}
                      onChange={this.handleTableTextChange.bind(
                        this,
                        table.id,
                        "name"
                      )}
                    />
                  </div>
                  <div key={table.id} className="tree__item__hidden">
                    {table.name}
                  </div>
                  <div>
                    {table.objectType === TableObjectTypesJson.REF && (
                      <div key={table.id} className="tree__datatype__name">
                        {JsonSchemaHelpers.shortenLongText(table.refUrl, 100)}
                      </div>
                    )}

                    {table.objectType !== TableObjectTypesJson.ANY &&
                      table.objectType !== TableObjectTypesJson.REF && (
                        <div key={table.id} className="tree__datatype__name">
                          {this.props.tables[table.objectType]
                            ? this.props.tables[table.objectType].name
                            : table.objectType}
                        </div>
                      )}

                    {table.desc && this.props.showDescriptions && (
                      <div title={table.desc} key={table.id + "_d"}>
                        <span className="tree__prop__comment">
                          {JsonSchemaHelpers.shortenLongText(table.desc, 200)}
                        </span>
                      </div>
                    )}
                    {table.schema && (
                      <div className="tree__spec">
                        <div
                          title={table.schema}
                          key={table.id + "_s"}
                          className="tree__flex__rows"
                        >
                          {this.getSchemaDefinition(
                            this.props.type,
                            table.schema
                          )}
                        </div>
                      </div>
                    )}
                    {this.getColSpec(table)}

                    {_.size(table.cols) > 0 && (
                      <div
                        className="tree__expander__icon__left"
                        onClick={(e) => {
                          this.updateActiveDomItemId("item_" + rootId);
                          TreeDiagramHelpers.toggleChildrenVisibility(subId);
                          this.props.clearAddToSelection("table", table.id);
                          this.props.setForcedRender({ domToModel: false });
                          this.props.updateModelProperty(
                            this.props.model.id,
                            true,
                            "isDirty"
                          );
                          this.props.history.push(
                            `/model/${this.props.match.params.mid}/diagram/${this.props.match.params.did}/item/${table.id}`
                          );
                          e.stopPropagation();
                        }}
                      >
                        <i className={`im-icon-16 im-icon-FullCircle`} />
                        <i
                          id={"icon_" + subId}
                          className="im-icon-16 im-icon-MinusCircle16 im-position-top-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {_.size(table.cols) > 0 && (
              <div className="tree__flex">
                <div
                  className={`tree__item__sub im-display-inline-block group`}
                  id={subId}
                >
                  <Sortable
                    options={{
                      handle: ".tree__item",
                      animation: 150,
                      easing: "easeOutBounce",
                      dragoverBubble: true
                    }}
                    onChange={async (order, sortable, evt) => {
                      const oldIndex = evt.oldIndex;
                      const newIndex = evt.newIndex;
                      await this.props.startTransaction(
                        getHistoryContext(this.props.history, this.props.match),
                        UndoRedoDef.COLUMNS_JSONSCHEMA__COLS_REORDER
                      );
                      try {
                        const newSort = arrayMove(
                          table.cols,
                          oldIndex,
                          newIndex
                        );
                        const newTable = Object.assign(
                          {},
                          { ...table, cols: newSort }
                        );
                        this.props.fetchTable(newTable);
                        this.props.fetchTableAndCatalog(table);
                      } finally {
                        await this.props.finishTransaction();
                      }
                    }}
                  >
                    {this.getTableCols(table.cols, table, rootId)}
                  </Sortable>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  }

  rePositionDropDown(objectType, elementId, tempPosition) {
    let diagramElement = document.getElementById("diagram");
    if (diagramElement) {
      const boxDiagramElement = diagramElement.getBoundingClientRect();
      const body = document.body;

      let activeDropDown = document.getElementsByClassName("im-dropdown");
      if (activeDropDown[0]) {
        tempPosition.x = Math.min(
          tempPosition.x,
          window.innerWidth - activeDropDown[0].clientWidth - 10
        );
      }

      if (
        objectType !== undefined &&
        tempPosition.y > (boxDiagramElement.height + body.scrollTop) / 2
      ) {
        this.props.openDropDownMenu(objectType, DROPDOWN_MENU_SOURCE.DIAGRAM, {
          x: tempPosition.x,
          y: tempPosition.y - UIHelpers.returnDropDownHeight(elementId)
        });
      } else {
        this.props.openDropDownMenu(objectType, DROPDOWN_MENU_SOURCE.DIAGRAM, {
          x: tempPosition.x,
          y: tempPosition.y
        });
      }
    }
  }

  async objectContextMenu(objectType, obj, e) {
    if (obj) {
      if (_.find(this.props.selections, ["objectId", obj.id]) === undefined) {
        this.props.clearAddToSelection(objectType, obj.id);
        this.props.setForcedRender({ domToModel: false });
      }
    } else {
      this.props.clearSelection();
      this.props.setForcedRender({ domToModel: false });
    }

    var convertedObjectType;
    if (
      _.includes(
        [
          TableObjectTypesJson.KEYARRAY,
          TableObjectTypesJson.KEYOBJECT,
          TableObjectTypesJson.ARRAY,
          TableObjectTypesJson.OBJECT,
          DROPDOWN_MENU.COLUMN
        ],
        objectType
      )
    ) {
      convertedObjectType = DROPDOWN_MENU.COLUMN;
    } else if (objectType === "diagram_item") {
      convertedObjectType = DROPDOWN_MENU.COLUMN;
    } else {
      convertedObjectType = DROPDOWN_MENU.PROJECT;
    }

    var posX = e.clientX;
    var posY = e.clientY;
    e.stopPropagation();
    e.preventDefault();

    await this.props.openDropDownMenu(
      convertedObjectType,
      DROPDOWN_MENU_SOURCE.DIAGRAM,
      {
        x: posX,
        y: posY
      }
    );

    this.rePositionDropDown(
      convertedObjectType,
      UIHelpers.getDropDownElementId(convertedObjectType),
      {
        x: posX,
        y: posY
      }
    );
  }

  unselect(e) {
    this.props.clearSelection(
      this.props.match.params.lid || this.props.match.params.rid
    );
    this.props.setForcedRender({ domToModel: false });
    navigateToDiagramUrl(
      this.props.match.url,
      this.props.history,
      this.props.match.params.mid,
      this.props.match.params.did
    );
    e.preventDefault();
  }

  navigateFromBread(e) {
    this.navigateLeft(this.state.activeDomItemId);
    e.preventDefault();
    e.stopPropagation();
  }

  navigateToCurrent(e) {
    let el = document.querySelector(`#${this.state.activeDomItemId}`);
    console.log(el);
    TreeDiagramHelpers.findItemInTreeDiagramAndScrollToPosition(
      el.id,
      this.props.zoom
    );
    e.preventDefault();
    e.stopPropagation();
  }

  getParentName() {
    try {
      let parentName = "";
      if (this.props.match.params.cid) {
        const parentTableId =
          this.props.catalogColumns[this.props.match.params.cid]
            ?.belongsToTableId;
        const parentTableName = this.props.tables[parentTableId].name;
        const parentColId =
          this.props.catalogTables[parentTableId]?.parentColId;
        const parentColTableId =
          this.props.catalogColumns[parentColId]?.belongsToTableId;
        if (JsonSchemaHelpers.isRootOrDef(this.props.tables[parentTableId])) {
          parentName = parentTableName;
        } else {
          parentName = _.find(this.props.tables[parentColTableId]?.cols, [
            "id",
            parentColId
          ])?.name;
        }
      }

      return parentName === "" || parentName === undefined
        ? "'nameless'"
        : parentName;
    } catch {
      return "";
    }
  }

  getCurrentName() {
    try {
      let currentName = _.find(
        this.props.tables[this.props.match.params.id]?.cols,
        ["id", this.props.match.params.cid]
      )?.name;
      return currentName === "" || currentName === undefined
        ? "'nameless'"
        : currentName;
    } catch {
      return "";
    }
  }

  renderDiagram() {
    if (this.props.diagrams[this.props.match.params.did] !== undefined) {
      var classToUse = "im-full-width im-" + this.props.currentDiagramAreaMode;

      var nw = 500;
      var nh = 500;

      var tempDiagram = document.getElementById("diagram");
      var scrollarea = document.getElementById("main-area");
      var tempSvg = document.getElementById("svgMain");
      if (tempSvg !== null) {
        var tempDiagramBox = tempDiagram.getBoundingClientRect();
        nw = Math.round(
          tempDiagramBox.width * (1 / this.props.zoom) +
            scrollarea.scrollLeft * (1 / this.props.zoom)
        );
        nh = Math.round(
          tempDiagramBox.height * (1 / this.props.zoom) +
            scrollarea.scrollTop * (1 / this.props.zoom)
        );
      }
      return (
        <div
          id="mainHtmlCanvas"
          style={{
            transform: `scale(${this.props.zoom})`
          }}
          className={classToUse}
          onClick={this.unselect.bind(this)}
          onContextMenu={this.objectContextMenu.bind(
            this,
            undefined,
            undefined
          )}
        >
          <svg
            style={{
              width: `${nw}px`,
              height: `${nh}px`
            }}
            id="svgMain"
          >
            {UIHelpers.renderWatermark(this.props.profile, this.props.appName)}
          </svg>
          <div
            id="tree__wrapper"
            style={{
              width: `${nw}px`,
              height: `${nh}px`
            }}
            className="tree__wrapper"
          >
            <div
              onClick={this.doNothing.bind(this)}
              id="tree__mini__toolbar"
              className="tree__mini__toolbar"
              style={{
                width: `${nw}px`
              }}
            >
              {this.props.match.params.cid && (
                <div className="tree__breadcrumbs">
                  <div className="tree__bread__caption">Parent:</div>
                  <div
                    className="tree__bread__value im-btn-link"
                    onClick={this.navigateFromBread.bind(this)}
                  >
                    {this.getParentName()}
                  </div>
                  <div className="tree__bread__caption">Active item:</div>
                  <div
                    className="tree__bread__value im-btn-link"
                    onClick={this.navigateToCurrent.bind(this)}
                  >
                    {this.getCurrentName()}
                  </div>
                </div>
              )}
            </div>

            <div className="tree__spacer" />
            {this.renderRoot()}
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  }

  clearSelectionAndKeepScroll() {
    this.props.clearSelection();
  }

  async navigateToTarget(targetElement, direction) {
    if (targetElement) {
      await this.navigateToDomItem(targetElement, false);
      this.updateActiveDomItemId(targetElement.id);
      targetElement.focus();
      if (targetElement.getAttribute("graphics-fully-visible") === null) {
        TreeDiagramHelpers.scrollToPosition(
          targetElement.id,
          this.props.zoom,
          direction
        );
      }
    }
  }

  async navigateLeft(currentItemId = this.props.activeDomItemId) {
    const currentElement = document.querySelector(`#${currentItemId}`);
    const parentElement = currentElement.closest(`.tree__item__sub`);
    if (parentElement !== null) {
      const leftElementId = parentElement.id.replace("sub", "item");
      const targetElement = document.querySelector(`#${leftElementId}`);
      if (targetElement) {
        this.navigateToTarget(targetElement, "left");
        this.props.clearSelection();
      }
    }
  }

  async navigateRight(currentItemId = this.props.activeDomItemId) {
    const subId = currentItemId.replace("item", "sub");
    const subElement = document.querySelector(`#${subId}`);
    if (subElement) {
      const targetElement = document.querySelector(
        `#${subId} .tree__item__named`
      );
      if (
        targetElement &&
        subElement.classList.contains("im-display-inline-block") === true
      ) {
        this.navigateToTarget(targetElement, "right");
        this.props.clearSelection();
      }
    }
  }

  async navigateUp(currentItemId = this.props.activeDomItemId) {
    const targetElement = TreeDiagramHelpers.getLeftElement(
      currentItemId,
      true
    );
    if (targetElement) {
      this.navigateToTarget(targetElement, "up");
      this.props.clearSelection();
    }
  }

  async navigateDown(currentItemId = this.props.activeDomItemId) {
    const targetElement = TreeDiagramHelpers.getLeftElement(
      currentItemId,
      false
    );
    if (targetElement) {
      this.navigateToTarget(targetElement, "down");
      this.props.clearSelection();
    }
  }

  async navigateToDomItem(element, scroll) {
    if (element) {
      TreeDiagramHelpers.expandParentNodes(element.id, this.props.zoom);
      if (scroll) {
        TreeDiagramHelpers.findItemInTreeDiagramAndScrollToPosition(
          element.id,
          this.props.zoom
        );
      }

      var colTableDataTypeId;
      const colIdFromElement = element.getAttribute("data-col-id");
      const tableIdFromElement = element.getAttribute("data-table-id");
      const tableIdFromCatalog =
        this.props.catalogColumns[colIdFromElement]?.belongsToTableId;
      if (tableIdFromCatalog) {
        const col = _.find(this.props.tables[tableIdFromCatalog].cols, [
          "id",
          colIdFromElement
        ]);
        colTableDataTypeId = col.datatype;
      }

      var tableOrColumnUrlPath = "/item/" + tableIdFromElement;

      if (colIdFromElement) {
        tableOrColumnUrlPath =
          "/emb/" + tableIdFromCatalog + "/col/" + colIdFromElement;
        this.props.clearAddToSelection("table", colTableDataTypeId);
      } else {
        this.props.clearAddToSelection("table", tableIdFromElement);
      }

      this.props.history.push(
        "/model/" +
          this.props.match.params.mid +
          "/diagram/" +
          this.props.match.params.did +
          tableOrColumnUrlPath
      );
    }
  }

  render() {
    return (
      <div id="canvas" tabIndex={50} style={{ background: "transparent" }}>
        {this.renderDiagram()}
        {this.props.finderIsDisplayed && (
          <DiagramFinder
            updateActiveDomItemId={this.updateActiveDomItemId.bind(this)}
            navigateToDomItem={this.navigateToDomItem.bind(this)}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    lines: state.lines,
    otherObjectsList: getReducedOtherObjectsList(state).otherObjectArray,
    objectsCopyList: state.objectsCopyList,
    model: state.model,
    notes: state.notes,
    otherObjects: state.otherObjects,
    localization: state.localization,
    zoom: state.ui.zoom,
    selections: state.selections,
    diagrams: state.diagrams,
    settings: state.settings,
    profile: state.profile,
    currentDiagramAreaMode: state.ui.currentDiagramAreaMode,
    appName: state.profile.appInfo.appName,
    forcedRender: state.ui.forcedRender,
    catalogColumns: state.catalogColumns.colToTable,
    catalogTables: state.catalogColumns.tableToCol,
    theme: state.settings.theme,
    finderIsDisplayed: state.ui.finderIsDisplayed,
    strictJsonFormat: state.model.jsonCodeSettings.strict,
    type: state.model.type,
    collapsedTreeItems: state.collapsedTreeItems,
    showDescriptions: state.model.showDescriptions,
    showSpecifications: state.model.showSpecifications,
    showLocallyReferenced: state.model.showLocallyReferenced
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        addTable: addTable,
        setMovement: setMovement,
        fetchTable: fetchTable,
        fetchRelations: fetchRelations,
        fetchRelation: fetchRelation,
        addRelation: addRelation,
        addLine: addLine,
        toggleTableModal: toggleTableModal,
        toggleRelationModal: toggleRelationModal,
        setDiagramAreaMode: setDiagramAreaMode,
        setDisplayMode: setDisplayMode,
        setDiagramLoading: setDiagramLoading,
        deleteTable: deleteTable,
        deleteRelation: deleteRelation,
        toggleConfirmDelete: toggleConfirmDelete,
        toggleConfirmDeleteRelation: toggleConfirmDeleteRelation,
        addToSelection: addToSelection,
        clearSelection: clearSelection,
        updateTableProperty: updateTableProperty,
        setObjectsCopyList: setObjectsCopyList,
        deleteNote: deleteNote,
        fetchNote: fetchNote,
        addNote: addNote,
        addOtherObject: addOtherObject,
        fetchOtherObject: fetchOtherObject,
        deleteOtherObject: deleteOtherObject,
        toggleOtherObjectModal: toggleOtherObjectModal,
        updateNoteProperty: updateNoteProperty,
        toggleNoteModal: toggleNoteModal,
        setRelationClicks: setRelationClicks,
        setColHeight: setColHeight,
        updateColumnProperty: updateColumnProperty,
        toggleLineModal: toggleLineModal,
        openDropDownMenu: openDropDownMenu,
        updateModelProperty: updateModelProperty,
        startTransaction,
        finishTransaction,
        setForcedRender,
        clearAddToSelection,
        wheelZoom,
        toggleFinder,
        fetchTableAndCatalog
      },
      dispatch
    ),
    dispatch
  };
}
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiagramTree)
);
