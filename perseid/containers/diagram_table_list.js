import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.bubble.css";

import {
  ClassOtherObject,
  OtherObjectTypes
} from "../classes/class_other_object";
import {
  ClassTableJsonSchema,
  TableControlTypesJson,
  TableObjectTypesJson
} from "../platforms/jsonschema/class_table_jsonschema";
import {
  DROPDOWN_MENU,
  DROPDOWN_MENU_SOURCE,
  clearChangeScroll,
  openDropDownMenu,
  setColHeight,
  setDiagramAreaMode,
  setForcedRender,
  setRelationClicks,
  setZoom,
  toggleAddDiagramsByContainersModal,
  toggleConfirmDelete,
  toggleConfirmDeleteLine,
  toggleConfirmDeleteRelation,
  toggleDiagramItemsModal,
  toggleFeedbackModal,
  toggleIndexAssistantModal,
  toggleLineModal,
  toggleNoteModal,
  toggleOtherObjectModal,
  toggleRelationModal,
  toggleSqlModal,
  toggleTableModal,
  toggleTextEditorModal
} from "../actions/ui";
import { DiagramAreaMode, ModelTypes, ObjectType } from "../enums/enums";
import React, { Component } from "react";
import {
  addNoteWithDiagramItem,
  addOtherObjectWithDiagramItem,
  addTableWithDiagramItem,
  updateAllTableSizesFromDom,
  updateDiagramItemProperties
} from "../actions/diagrams";
import { addRelation, fetchRelation } from "../actions/relations";
import {
  addToSelection,
  addVisibleObjectsToSelection,
  clearAddMultipleToSelection,
  clearAddToSelection,
  clearSelection,
  removeFromSelection
} from "../actions/selections";
import {
  createGraphQLRelationKey,
  createGraphQLRelationObject,
  getGraphQLKey,
  graphQLUpdateColumnsAfterRelationAdded,
  isGraphQLNotAllowed,
  updateGraphQLTargetColumn
} from "../actions/platforms/graphql/graphql";
import { fetchNote, updateNoteProperty } from "../actions/notes";
import {
  fetchOtherObject,
  updateOtherObjectProperty
} from "../actions/other_objects";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";
import {
  getActiveDiagramItems,
  getActiveDiagramNotes,
  getActiveDiagramObject,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../selectors/selector_diagram";
import {
  navigateByObjectType,
  navigateToDiagramUrl,
  navigateToOtherObjectUrl
} from "../components/url_navigation";

import { ClassColumn } from "../classes/class_column";
import { ClassColumnGraphQl } from "../platforms/graphql/class_column_graphql";
import { ClassColumnLogical } from "../platforms/logical/class_column_logical";
import { ClassColumnPG } from "../platforms/pg/class_column_pg";
import { ClassColumnSQLite } from "../platforms/sqlite/class_column_sqlite";
import { ClassLine } from "../classes/class_line";
import { ClassNote } from "../classes/class_note";
import { ClassOtherObjectPG } from "../platforms/pg/class_other_object_pg";
import { ClassRelation } from "../classes/class_relation";
import { ClassRelationSequelize } from "../platforms/sequelize/class_relation_sequelize";
import { ClassTable } from "../classes/class_table";
import { ClassTableGraphQl } from "../platforms/graphql/class_table_graphql";
import { ClassTableJson } from "../platforms/json/class_table_json";
import { ClassTableLogical } from "../platforms/logical/class_table_logical";
import { ClassTableMongoDb } from "../platforms/mongodb/class_table_mongodb";
import { ClassTableMongoose } from "../platforms/mongoose/class_table_mongoose";
import { ClassTableMySQLFamily } from "../platforms/mysql_family/class_table_mysql_family";
import { ClassTablePG } from "../platforms/pg/class_table_pg";
import { ClassTableSQLite } from "../platforms/sqlite/class_table_sqlite";
import { ClassTableSequelize } from "../platforms/sequelize/class_table_sequelize";
import DiagramDraggable from "../components/diagram/diagram_draggable";
import GraphQlHelpers from "../platforms/graphql/helpers_graphql";
import Helpers from "../helpers/helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import LogicalHelpers from "../platforms/logical/helpers_logical";
import MongoDbHelpers from "../platforms/mongodb/helpers_mongodb";
import MongooseHelpers from "../platforms/mongoose/helpers_mongoose";
import MySQLFamilyHelpers from "../platforms/mysql_family/helpers_mysql_family";
import PGHelpers from "../platforms/pg/helpers_pg";
import { RelationChecker } from "../helpers/diagram/relation_checker";
import SQLiteHelpers from "../platforms/sqlite/helpers_sqlite";
import SVGPathCommander from "svg-path-commander";
import SelectDecorator from "./select_decorator";
import SequelizeHelpers from "../platforms/sequelize/helpers_sequelize";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addLine } from "../actions/lines";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copySelectedTables } from "../actions/copy";
import { createDiagramItem } from "../classes/factory/class_diagram_item_factory";
import { fetchTable } from "../actions/tables";
import { findSegmentIntersection } from "line-intersection";
import { getHistoryContext } from "../helpers/history/history";
import iconAk from "../assets/ak.svg";
import iconFk from "../assets/fk.svg";
import iconIk from "../assets/inter.svg";
import iconIndex from "../assets/index.svg";
import iconLinked from "../assets/linked.svg";
import iconPfk from "../assets/pfk.svg";
import iconPk from "../assets/pk.svg";
import { isPerseid } from "../helpers/features/features";
import { selectObjectsInSelectionBox } from "../helpers/selection/selection-box";
import { setObjectsCopyList } from "../actions/objects_copies";
import { updatePgTargetColumn } from "../actions/platforms/pg/pg";
import { v4 as uuidv4 } from "uuid";
import { wheelZoom } from "../helpers/zoom/wheel-zoom";
import { withRouter } from "react-router-dom";

const OTHER_OBJECT = "other_object";
const NOTE = "note";
const TABLE = "table";
const LINE = "line";
const RELATION = "relation";

const HORIZONTAL = "x";
const VERTICAL = "y";

export const MIN_WIDTH = 150;
export const MIN_HEIGHT = 30;

const SPACE_KEY_CODE = 32;

export let perf;

class DiagramTableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newRelation: {
        sourceId: null,
        sourceName: null,
        targetId: null,
        targetName: null
      },
      forcedRender: { id: 0 },
      resizeElement: null,
      dragged: false,
      relClicks: 0,
      diagramDrawn: false,
      isLoading: true,
      objToCopy: null,
      moveBy: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
      },
      selectionAreaDecoratorPosition: {
        startX: 0,
        startY: 0,
        click: false
      },
      pan: {
        active: false,
        space: false,
        startX: 0,
        startY: 0,
        scrollX: 0,
        scrollY: 0
      }
    };
    this.handleStart = this.handleStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handlePanStart = this.handlePanStart.bind(this);
    this.handlePanEnd = this.handlePanEnd.bind(this);
    this.handlePanMove = this.handlePanMove.bind(this);

    this.getTableCols = this.getTableCols.bind(this);

    this.handleDiagramAreaClick = this.handleDiagramAreaClick.bind(this);
    this.resizeGraphics = this.resizeGraphics.bind(this);
    this.xResizeDebounced = _.throttle(this.xResize.bind(this), 10);
    this.xStopResize = this.xStopResize.bind(this);
    this.xInitResize = this.xInitResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.setColHeightToDetected = this.setColHeightToDetected.bind(this);

    this.handleMoveSelectByMouseDebounced = _.throttle(
      this.handleMoveSelectByMouse.bind(this),
      10
    );
    this.handleSelectByMouse = this.handleSelectByMouse.bind(this);
    this.handleStopSelectByMouse = this.handleStopSelectByMouse.bind(this);
    this.hideAllModals = this.hideAllModals.bind(this);
    this.drawSelectionAreaRectangle =
      this.selectObjectsInSelectionBox.bind(this);
    this.collectionByObjectType = this.collectionByObjectType.bind(this);

    this.tableClick = this.tableClick.bind(this);
    this.renderItemContent = this.renderItemContent.bind(this);
    this.objectContextMenu = this.objectContextMenu.bind(this);
    this.diagramClick = this.diagramClick.bind(this);
    this.selectLink = this.selectLink.bind(this);

    this.unselect = this.unselect.bind(this);

    this.relationChecker = new RelationChecker();

    this.nw = 500;
    this.nh = 500;

    window.addEventListener(
      "resize",
      this.updateSvgDimensions.bind(this),
      true
    );

    perf = performance;
  }

  updateSvgDimensions() {
    var tempDiagram = document.getElementById("diagram");
    var scrollarea = document.getElementById("main-area");
    var tempSvg = document.getElementById("svgMain");
    if (tempSvg !== null) {
      var tempDiagramBox = tempDiagram.getBoundingClientRect();
      this.nw = Math.round(
        tempDiagramBox.width * (1 / this.props.zoom) +
          scrollarea.scrollLeft * (1 / this.props.zoom)
      );
      this.nh = Math.round(
        tempDiagramBox.height * (1 / this.props.zoom) +
          scrollarea.scrollTop * (1 / this.props.zoom)
      );
    }
  }

  /* Sets height of row, used for calculation of exact position of lines */
  setColHeightToDetected() {
    const colHeightReal = document.querySelector(".im-t-r");
    if (colHeightReal) {
      const boxcolHeightReal = colHeightReal.getBoundingClientRect();
      if (boxcolHeightReal.height !== this.props.colHeight) {
        this.props.setColHeight(
          Math.round((boxcolHeightReal.height * 1) / this.props.zoom)
        );
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.forcedRender.id !== this.props.forcedRender.id ||
      !!nextProps.changeScroll
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setColHeightToDetected);
    var canvas = document.getElementById("canvas");
    if (canvas !== null) {
      canvas.removeEventListener("mousedown", this.handlePanStart, false);
      canvas.removeEventListener("wheel", this.handleWheel, false);
      canvas.removeEventListener("keydown", this.handleKeyDown, false);
      canvas.removeEventListener("keyup", this.handleKeyUp, false);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.forcedRender.id !== prevProps.forcedRender.id) {
      if (this.props.forcedRender?.options.domToModel === true) {
        this.props.updateAllTableSizesFromDom(this.props.forcedRender?.options);
      }
    }
    if (!!this.props.changeScroll) {
      const mainAreaElement = document.getElementById("main-area");
      const currentScroll = {
        x: mainAreaElement?.scrollLeft || 0,
        y: mainAreaElement?.scrollTop || 0
      };
      if (this.props.changeScroll !== currentScroll) {
        if (mainAreaElement && this.props.changeScroll) {
          mainAreaElement.scrollTo(
            this.props.changeScroll.x,
            this.props.changeScroll.y
          );
          this.props.clearChangeScroll();
        }
      }
    }
  }

  addEventListeners() {
    window.addEventListener("resize", this.setColHeightToDetected);
    var canvas = document.getElementById("canvas");
    if (canvas !== null) {
      canvas.addEventListener("mousedown", this.handlePanStart, false);
      canvas.addEventListener("wheel", this.handleWheel, {
        capture: true,
        passive: false
      });
      canvas.addEventListener("keydown", this.handleKeyDown, false);
      canvas.addEventListener("keyup", this.handleKeyUp, false);

      canvas.addEventListener("mousedown", this.handleSelectByMouse, false);
    }
  }

  componentDidMount() {
    this.addEventListeners();
    this.setColHeightToDetected();
    this.setState({ isLoading: false });

    this.props.setForcedRender({ domToModel: false });
  }

  showSchemaContainer(object) {
    if (
      (this.props.type === ModelTypes.PG ||
        this.props.type === ModelTypes.MARIADB ||
        this.props.type === ModelTypes.MYSQL) &&
      object.embeddable !== true
    ) {
      if (this.props.type === ModelTypes.PG)
        return Helpers.getSchemaContainer(object.pg.schema);
      else return Helpers.getSchemaContainer(object.database);
    }
  }

  selectObjectsInSelectionBox(box) {
    const isActiveLink =
      !!this.props.match.params.lid || !!this.props.match.params.rid;
    this.props.selectObjectsInSelectionBox(
      getHistoryContext(this.props.history, this.props.match),
      box,
      isActiveLink
    );
  }

  hideAllModals() {
    if (this.props.tableModalIsDisplayed === true)
      this.props.toggleTableModal();
    if (this.props.columnModalIsDisplayed === true)
      this.props.toggleColumnModal();
    if (this.props.noteModalIsDisplayed === true) this.props.toggleNoteModal();
    if (this.props.otherObjectModalIsDisplayed === true)
      this.props.toggleOtherObjectModal();
    if (this.props.relationModalIsDisplayed === true)
      this.props.toggleRelationModal();
    if (this.props.indexAssistantModalIsDisplayed === true)
      this.props.toggleIndexAssistantModal();
    if (this.props.sqlModalIsDisplayed === true) this.props.toggleSqlModal();
    if (this.props.feedbackModalIsDisplayed === true)
      this.props.toggleFeedbackModal();
    if (this.props.diagramItemsModalIsDisplayed === true)
      this.props.toggleDiagramItemsModal();
    if (this.props.orderItemsModalIsDisplayed === true)
      this.props.toggleOrderItemsModal();
    if (this.props.textEditorModalIsDisplayed)
      this.props.toggleTextEditorModal();
    if (this.props.addDiagramsByContainersModalIsDisplayed === true) {
      this.props.toggleAddDiagramsByContainersModal();
    }
  }

  noModalIsDisplayed() {
    return (
      this.props.newModelModalIsDisplayed === false &&
      this.props.modelModalIsDisplayed === false &&
      this.props.tipsModalIsDisplayed === false &&
      this.props.tableModalIsDisplayed === false &&
      this.props.columnModalIsDisplayed === false &&
      this.props.noteModalIsDisplayed === false &&
      this.props.otherObjectModalIsDisplayed === false &&
      this.props.relationModalIsDisplayed === false &&
      this.props.indexAssistantModalIsDisplayed === false &&
      this.props.sqlModalIsDisplayed === false &&
      this.props.diagramItemsModalIsDisplayed === false &&
      this.props.orderItemsModalIsDisplayed === false &&
      this.props.addDiagramsByContainersModalIsDisplayed === false
    );
  }

  calcX(event, boxCanvas, body) {
    return Math.round(
      ((event.pageX - (boxCanvas.left + body.scrollLeft - body.clientLeft)) *
        1) /
        this.props.zoom
    );
  }

  calcY(event, boxCanvas, body) {
    return Math.round(
      ((event.pageY - (boxCanvas.top + body.scrollTop - body.clientTop)) * 1) /
        this.props.zoom
    );
  }

  handleSelectByMouse(event) {
    if (
      this.state.dragged === false &&
      this.state.pan.space !== true &&
      event.button === 0 &&
      this.noModalIsDisplayed() === true
    ) {
      var canvas = document.getElementById("canvas");
      const boxCanvas = canvas.getBoundingClientRect();
      const body = document.body;

      this.setState({
        selectionAreaDecoratorPosition: {
          startX: this.calcX(event, boxCanvas, body),
          startY: this.calcY(event, boxCanvas, body),
          initialized: true,
          click: false
        }
      });
    }

    document.addEventListener("mouseup", this.handleStopSelectByMouse, false);
    document.addEventListener(
      "mousemove",
      this.handleMoveSelectByMouseDebounced,
      false
    );
  }

  calcBox(event) {
    var canvas = document.getElementById("canvas");
    const boxCanvas = canvas.getBoundingClientRect();
    const body = document.body;
    const calcX = this.calcX(event, boxCanvas, body);
    const calcY = this.calcY(event, boxCanvas, body);

    var posX = Math.min(
      this.state.selectionAreaDecoratorPosition.startX,
      calcX
    );
    var posY = Math.min(
      this.state.selectionAreaDecoratorPosition.startY,
      calcY
    );
    var itemWidth = Math.abs(
      this.state.selectionAreaDecoratorPosition.startX - calcX
    );
    var itemHeight = Math.abs(
      this.state.selectionAreaDecoratorPosition.startY - calcY
    );

    const reverse =
      calcY < this.state.selectionAreaDecoratorPosition.startY &&
      calcX < this.state.selectionAreaDecoratorPosition.startX;

    return {
      left: posX,
      top: posY,
      width: itemWidth,
      height: itemHeight,
      reverse
    };
  }

  handleMoveSelectByMouse(event) {
    if (this.relationOrLineIsCreated() === false) {
      const element = document.getElementById("selector");
      if (!element) {
        return;
      }
      if (
        this.state.selectionAreaDecoratorPosition.initialized === true &&
        this.state.dragged === false
      ) {
        const box = this.calcBox(event);

        element.style.top = `${box.top}px`;
        element.style.left = `${box.left}px`;
        element.style.height = `${box.height}px`;
        element.style.width = `${box.width}px`;
        element.style.display = "block";
      } else {
        if (this.state.dragged !== false) {
          element.style.display = "none";
        }
      }
    }
  }

  handleStopSelectByMouse(event) {
    var element = document.getElementById("selector");
    const click = element.style.display === "none";
    if (element.style.display !== "none") {
      if (this.state.pan.space !== true) {
        const selectionBox = this.calcBox(event);
        this.selectObjectsInSelectionBox(selectionBox);
      }
      element.style.display = "none";
    }
    this.setState({
      selectionAreaDecoratorPosition: {
        startX: 0,
        startY: 0,
        click
      }
    });

    document.removeEventListener("mouseup", this.handleStopSelectByMouse);
    document.removeEventListener(
      "mousemove",
      this.handleMoveSelectByMouseDebounced,
      false
    );
  }

  handlePanStart(event) {
    if (
      event.buttons === 4 ||
      (event.buttons === 1 && this.state.pan.space === true)
    ) {
      var mainArea = document.getElementById("main-area");
      this.setState({
        pan: {
          active: true,
          space: this.state.pan.space,
          startX: event.clientX,
          startY: event.clientY,
          scrollX: mainArea.scrollLeft,
          scrollY: mainArea.scrollTop
        }
      });

      document.addEventListener("mousemove", this.handlePanMove, false);
      document.addEventListener("mouseup", this.handlePanEnd, false);
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

  handlePanEnd(event) {
    if (this.state.pan.active === true) {
      this.setState({
        pan: {
          active: false,
          space: this.state.pan.space,
          startX: 0,
          startY: 0,
          scrollX: 0,
          scrollY: 0
        }
      });
      document.removeEventListener("mousemove", this.handlePanMove);
      document.removeEventListener("mouseup", this.handlePanEnd);
    }
  }

  handleKeyUp(event) {
    if (event.keyCode === SPACE_KEY_CODE) {
      this.setState({
        pan: { space: false }
      });
      event.preventDefault();
    }
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

  async handleKeyDown(event) {
    let charCode = String.fromCharCode(event.which).toLowerCase();

    if (event.keyCode === SPACE_KEY_CODE) {
      // do not autoscroll down
      event.preventDefault();
      event.stopPropagation();
      if (this.state.pan.space !== true && this.state.dragged === false) {
        this.setState({
          pan: { space: true }
        });
      }
      return;
    }

    if (event.ctrlKey && event.key === "0") {
      this.props.setZoom(1, true);
    }

    if (
      (event.ctrlKey && charCode === "a") ||
      (event.metaKey && charCode === "a")
    ) {
      this.props.addVisibleObjectsToSelection(
        this.props.match.url,
        this.props.history,
        this.props.match.params.mid,
        this.props.match.params.did
      );
      event.preventDefault();

      //console.log("Ctrl + A pressed");
    } else if (
      !JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
      ((event.ctrlKey && charCode === "c") ||
        (event.metaKey && charCode === "c"))
    ) {
      if (this.props.selections) {
        this.props.setObjectsCopyList();
      }
      event.preventDefault();
      //console.log("Ctrl + C pressed");
    } else if (
      !JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
      ((event.ctrlKey && charCode === "v") ||
        (event.metaKey && charCode === "v"))
    ) {
      await this.props.copySelectedTables(
        this.props.objectsCopyList,
        this.props
      );

      event.preventDefault();
    } else if (event.keyCode === 46 || event.keyCode === 8) {
      if (this.props.match.params.id) {
        this.props.toggleConfirmDelete();
      } else if (this.props.match.params.rid) {
        this.props.toggleConfirmDeleteRelation();
      } else if (this.props.match.params.lid) {
        this.props.toggleConfirmDeleteLine();
      } else if (this.props.match.params.nid) {
        this.props.toggleConfirmDelete();
      } else if (this.props.match.params.oid) {
        this.props.toggleConfirmDelete();
      }
      event.preventDefault();
      //console.log("Delete key pressed");
    }

    // For MAC we can use metaKey to detect cmd key

    if (event.metaKey && charCode === "c") {
      //console.log("Cmd + C pressed");
    } else if (event.metaKey && charCode === "v") {
      //console.log("Cmd + V pressed");
    } else if (event.metaKey && charCode === "s") {
      event.preventDefault();
      //console.log("Cmd + S pressed");
    }
  }

  getColumnMark(columnMark, columnMarkIcon) {
    return this.props.activeDiagramObject.keysgraphics === true
      ? columnMarkIcon && (
          <img
            src={columnMarkIcon}
            alt="Key"
            className={"im-icon-key im-mark-" + columnMark}
          />
          /*<div className={"im-graphics-" + columnMark}>{columnMark}</div>*/
        )
      : columnMark && (
          <div className={"im-mini-" + columnMark}>{columnMark}</div>
        );
  }

  getBackgroundColor(objectId) {
    if (this.props.activeDiagramObject.diagramItems[objectId]) {
      return this.props.activeDiagramObject.diagramItems[objectId].background;
    } else {
      const mainDiagram = _.find(this.props.diagrams, ["main", true]);
      return mainDiagram.diagramItems[objectId].background;
    }
  }

  getTableIndexes(table) {
    const itemMark = "IX";
    const itemMarkIcon = iconIndex;
    if (table.indexes) {
      return table.indexes.map((index) => {
        return (
          <div
            id={"ix" + index.id}
            key={"ix" + index.id}
            className="dRow im-t-r"
          >
            <div className="dCol im-t-c">
              {this.getColumnMark(itemMark, itemMarkIcon)}
            </div>
            <div key={index.id} className="dItem">
              {index.name}
            </div>
          </div>
        );
      });
    }
  }

  isInAk(keys, column) {
    let toReturn = false;
    _.map(keys, (key) => {
      if (this.checkIfColIsInKey(column.id, key) && !column.pk && !column.fk) {
        toReturn = true;
      }
    });
    return toReturn;
  }

  checkIfColIsInKey(columnId, key) {
    let isColInKey = _.find(key.cols, ["colid", columnId]);
    return !!isColInKey;
  }

  shouldShowPerseidERDNestedTables(embeddedTable) {
    const showColumns =
      (JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
        (embeddedTable.nodeType !== "subschema" ||
          this.props.showLocallyReferenced)) ||
      !JsonSchemaHelpers.isPerseidModelType(this.props.type);
    return showColumns;
  }

  getTableCols(mainTableId, table) {
    try {
      var i = 0;
      return _.map(table.cols, (col) => {
        i++;
        if (col.isHidden === true) {
          return <div key="internal" />;
        } else {
          //if (mainTableId !== col.datatype) {
          var columnMark = null;
          if (col.pk === true) {
            if (col.fk === true) columnMark = "PFK";
            else columnMark = "PK";
          }
          if (col.fk === true) {
            if (col.pk === true) columnMark = "PFK";
            else columnMark = "FK";
          }

          var columnMarkIcon = null;

          if (
            this.props.type !== ModelTypes.GRAPHQL &&
            this.isInAk(table.keys, col)
          ) {
            columnMarkIcon = iconAk;
            columnMark = "AK";
          }

          if (col.pk === true) {
            if (col.fk === true) columnMarkIcon = iconPfk;
            else columnMarkIcon = iconPk;
          }
          if (col.fk === true) {
            if (col.pk === true) columnMarkIcon = iconPfk;
            else columnMarkIcon = iconFk;
          }

          if (
            this.props.type === "GRAPHQL" &&
            table.objectType === "interface"
          ) {
            if (col.pk === true) {
              columnMarkIcon = iconIk;
              columnMark = "I";
            }
          }
          if (this.props.type === "GRAPHQL") {
            if (col.fk === true) {
              columnMarkIcon = iconLinked;
              columnMark = "L";
            }
          }
          if (this.props.type === "GRAPHQL" && table.objectType === "union") {
            columnMarkIcon = iconLinked;
            columnMark = "U";
          }

          if (this.props.type === "PG" && table.objectType === "composite") {
            columnMarkIcon = iconLinked;
            columnMark = "C";
          }

          var colToDisplay = null;
          var nnToDisplay = "";
          if (this.props.currentDisplayMode === "description") {
            colToDisplay = col.comment;
          } else {
            col.nn
              ? (nnToDisplay = _.upperCase(this.props.localization.L_NN))
              : (nnToDisplay = "");
            colToDisplay = col.datatype;
            if (col.param) {
              if (["ENUM", "SET"].includes(col.datatype) === false) {
                colToDisplay += "(" + col.param + ")";
              }
            }

            const embeddableCandidateTable = this.props.allTables[col.datatype];

            var embeddedTable =
              embeddableCandidateTable?.embeddable === true
                ? embeddableCandidateTable
                : undefined;
            var embeddedGraphics = <div />;
            var listGraphicsLeft = <></>;
            var listGraphicsRight = <></>;
            var objectGraphicsLeft = <></>;
            var objectGraphicsRight = <></>;
            var embeddedObjectCss = "";
            var reqGraphics = <span>&nbsp;&nbsp;</span>;
            var colNameDisplayed = null;

            if (embeddedTable !== undefined) {
              colToDisplay = Helpers.shortenString(
                embeddedTable.name,
                true,
                100
              );

              if (this.props.embeddedInParentsIsDisplayed !== false) {
                embeddedGraphics = (
                  <div
                    className={
                      JsonSchemaHelpers.isPerseidModelType(this.props.type)
                        ? "im-embedded  im-embedded-thin"
                        : "im-embedded"
                    }
                    style={{ gridColumn: "span 4" }}
                  >
                    <div
                      style={{
                        borderLeft:
                          "1px dashed " +
                          this.getBackgroundColor(embeddedTable.id)
                      }}
                    >
                      {this.shouldShowPerseidERDNestedTables(embeddedTable) &&
                        this.getTableCols(mainTableId, embeddedTable)}
                    </div>
                  </div>
                );
              }

              if (!JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
                objectGraphicsLeft = (
                  <span className="im-col-object-left">&#123;</span>
                );
                objectGraphicsRight = (
                  <span className="im-col-object-right">&#125;</span>
                );
                embeddedObjectCss = " im-col-object-name";
              }
            }
            if (this.props.type === "MONGOOSE") {
              let nestedTable = this.props.allTables[col.datatype];
              if (nestedTable !== undefined) {
                colToDisplay = Helpers.shortenString(
                  nestedTable.name,
                  true,
                  100
                );
              }

              let linkedOtherObject = _.find(this.props.allOtherObjects, [
                "id",
                col.datatype
              ]);
              if (linkedOtherObject !== undefined) {
                colToDisplay = Helpers.shortenString(
                  linkedOtherObject.name,
                  true,
                  100
                );
              }
            }

            if (
              this.props.type === "PG" &&
              PGHelpers.convertToId(
                col.datatype,
                Helpers.garr(this.props.customDataTypes)
              ) !== col.datatype
            ) {
              let nestedObject =
                this.props.allTables[col.datatype] ||
                this.props.allOtherObjects[col.datatype];

              if (nestedObject !== undefined) {
                colToDisplay = Helpers.shortenString(
                  nestedObject.name,
                  true,
                  100
                );
              }
            }

            if (col.list === true) {
              listGraphicsLeft = <span className="im-col-list">[</span>;
              listGraphicsRight = <span className="im-col-list">]</span>;
            }

            if (
              this.props.type === "GRAPHQL" &&
              GraphQlHelpers.convertToId(
                col.datatype,
                Helpers.garr(this.props.customDataTypes)
              ) !== col.datatype
            ) {
              let linkedTable = this.props.allTables[col.datatype];
              if (linkedTable !== undefined) {
                colToDisplay = Helpers.shortenString(
                  linkedTable.name,
                  true,
                  100
                );
                objectGraphicsLeft = (
                  <span className="im-col-object-left">&#123;</span>
                );
                objectGraphicsRight = (
                  <span className="im-col-object-right">&#125;</span>
                );
              }

              // enums or scalars
              let linkedOtherObject = this.props.allOtherObjects[col.datatype];
              if (linkedOtherObject !== undefined) {
                colToDisplay = Helpers.shortenString(
                  linkedOtherObject.name,
                  true,
                  100
                );
              }
            }

            if (col.list) {
              let requiredArItNn = col.isArrayItemNn ? (
                <>
                  <span>&nbsp;</span>!
                </>
              ) : (
                <span>&nbsp;</span>
              );

              //colToDisplay = colToDisplay + requiredArItNn;
              listGraphicsRight = (
                <>
                  <span className="im-col-object-right">{requiredArItNn}</span>
                  <span className="im-col-list">]</span>
                </>
              );
            } else {
              listGraphicsLeft = <span className="im-col-list">&nbsp;</span>;
              listGraphicsRight = <span className="im-col-list">&nbsp;</span>;
            }

            if (this.props.type === "GRAPHQL" && col.nn === true) {
              reqGraphics = (
                <span className="im-col-object-right">&nbsp;!</span>
              );
            }

            if (this.props.type === "GRAPHQL") {
              colToDisplay = (
                <>
                  {listGraphicsLeft}
                  {colToDisplay}
                  {listGraphicsRight}
                  {reqGraphics}
                </>
              );
              //nnToDisplay = <>{reqGraphics}</>;
            }

            if (this.props.type === "GRAPHQL") {
              if (table.objectType === "union") {
                colNameDisplayed = colToDisplay;
                colToDisplay = "";
                nnToDisplay = "";
              } else {
                colNameDisplayed = <>{col.name}</>;
              }
            } else if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
              colToDisplay = (
                <>
                  {JsonSchemaHelpers.renderDataTypeIcon(
                    col,
                    this.props.allTables,
                    this.props.catalogColumns
                  )}
                  {JsonSchemaHelpers.getColDataType(
                    col,
                    this.props.allTables,
                    false,
                    this.props.catalogColumns
                  )}
                </>
              );

              colNameDisplayed = JsonSchemaHelpers.getColNameJsonSchema(
                col,
                i,
                this.props.allTables[table.id]?.objectType,
                this.props.allTables
              );
            } else {
              colNameDisplayed = (
                <>
                  {col.name} {listGraphicsLeft}
                  {objectGraphicsLeft}
                  {objectGraphicsRight}
                  {listGraphicsRight}
                  {reqGraphics}
                </>
              );
            }
          }

          if (
            this.props.estimatedSizeIsDisplayed &&
            col.estimatedSize !== undefined &&
            col.estimatedSize.length > 0
          ) {
            colToDisplay = " [" + col.estimatedSize + "] " + colToDisplay;
          }

          const dRow = JsonSchemaHelpers.isPerseidModelType(this.props.type)
            ? "dRow dRow-thin"
            : "dRow";

          const selectedRow =
            this.props.match.params.id === table.id &&
            this.props.match.params.cid === col.id
              ? " tree__mini__selected"
              : " tree__mini__clickable";

          return (
            <div id={col.id} key={col.id} className={dRow + " im-t-r"}>
              <div className="dCol im-t-c">
                {this.getColumnMark(columnMark, columnMarkIcon)}
              </div>
              <div
                data-testid={`${table.name}-${col.name}`}
                onClick={(e) => {
                  if (
                    _.toLower(this.props.currentDiagramAreaMode) ===
                      DiagramAreaMode.ARROW &&
                    this.state.moveBy.startX == this.state.moveBy.endX &&
                    this.state.moveBy.startY === this.state.moveBy.endY
                  ) {
                    this.props.history.push(
                      "/model/" +
                        this.props.match.params.mid +
                        "/diagram/" +
                        this.props.match.params.did +
                        (table.embeddable ? "/emb/" : "/item/") +
                        table.id +
                        "/col/" +
                        col.id
                    );
                    this.resizeGraphics("content" + table.id);
                    this.props.setForcedRender({ domToModel: false });

                    e.stopPropagation();
                    e.preventDefault();
                  }
                }}
                onContextMenu={(e) => {
                  if (
                    _.toLower(this.props.currentDiagramAreaMode) ===
                      DiagramAreaMode.ARROW &&
                    JsonSchemaHelpers.isPerseidModelType(this.props.type)
                  ) {
                    this.props.clearAddToSelection("table", col.datatype);
                    this.props.history.push(
                      "/model/" +
                        this.props.match.params.mid +
                        "/diagram/" +
                        this.props.match.params.did +
                        (table.embeddable ? "/emb/" : "/item/") +
                        table.id +
                        "/col/" +
                        col.id
                    );
                    this.resizeGraphics("content" + table.id);
                    this.props.setForcedRender({ domToModel: false });

                    if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
                      this.objectContextMenu(
                        DROPDOWN_MENU.COLUMN,
                        this.props.allTables[col.datatype],
                        e
                      );
                    }
                  } else {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }}
                className={"dCol im-t-c " + selectedRow}
              >
                {colNameDisplayed}
              </div>

              <div className={"dCol im-t-c im-mini" + embeddedObjectCss}>
                {this.props.currentDisplayMode !== "data"
                  ? colToDisplay
                  : col.data}
              </div>
              <div className="dCol im-t-c im-mini">
                {" "}
                {this.props.currentDisplayMode !== "data" ? nnToDisplay : ""}
              </div>
              {embeddedGraphics}
            </div>
          );
          // }
        }
      });
    } catch (e) {
      //console.log("error", e, " ", e.message);
      return;
    }
  }

  findName(rootName, list) {
    let i = 1;
    while (_.find(list, ["name", `${rootName}${i}`])) {
      i++;
    }
    return `${rootName}${i}`;
  }

  updateObjectNameByPlatform(name) {
    return this.props.type === "GRAPHQL"
      ? _.upperFirst(name)
      : name.toLowerCase();
  }

  async addSingleTable(pageX, pageY) {
    const refDiagram = document.getElementById("diagram");
    const boxDiagram = refDiagram.getBoundingClientRect();
    var leftPosition = Math.round(
      (pageX - boxDiagram.left) * (1 / this.props.zoom)
    );
    var topPosition = Math.round(
      (pageY - boxDiagram.top) * (1 / this.props.zoom)
    );
    var newTableId = uuidv4();
    var newColId = uuidv4();
    var newCol = {};
    var newCols = [];
    var newKeys = null;
    var isEmbeddable = false;
    var objectType = this.props.localization.L_TABLE;
    var defaultName = this.findName(
      this.updateObjectNameByPlatform(this.props.localization.L_TABLE),
      this.props.allTables
    );

    if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT) {
      isEmbeddable = true;
      defaultName = this.findName(
        this.updateObjectNameByPlatform(
          this.props.localization.L_TABLE_EMBEDDABLE
        ),
        this.props.allTables
      );
    }

    if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INTERFACE) {
      isEmbeddable = false;
      objectType = "interface";
      defaultName = this.findName(
        this.updateObjectNameByPlatform(this.props.localization.L_INTERFACE),
        this.props.allTables
      );
    }

    if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_UNION) {
      isEmbeddable = false;
      objectType = "union";
      defaultName = this.findName(
        this.updateObjectNameByPlatform(this.props.localization.L_UNION),
        this.props.allTables
      );
    }

    if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INPUT) {
      isEmbeddable = false;
      objectType = "input";
      defaultName = this.findName(
        this.updateObjectNameByPlatform(this.props.localization.L_INPUT),
        this.props.allTables
      );
    }

    if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_COMPOSITE) {
      isEmbeddable = false;
      objectType = "composite";
      defaultName = this.findName(
        this.updateObjectNameByPlatform(this.props.localization.L_COMPOSITE),
        this.props.allTables
      );
    }

    if (this.props.type === "GRAPHQL") {
      newCol = new ClassColumnGraphQl(
        newColId,
        "FakeIdForInternalUse",
        "ID",
        true,
        true,
        false,
        null,
        true,
        false,
        null
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Identifier",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (this.props.type === "SEQUELIZE" && this.props.def_coltopk) {
      newCol = new ClassColumn(
        newColId,
        "id",
        SequelizeHelpers.getSequelizeKeyType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (
      (this.props.type === ModelTypes.MARIADB ||
        this.props.type === ModelTypes.MYSQL) &&
      this.props.def_coltopk &&
      isEmbeddable === false
    ) {
      newCol = new ClassColumn(
        newColId,
        "id",
        MySQLFamilyHelpers.getKeyType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (
      this.props.type === "SQLITE" &&
      this.props.def_coltopk &&
      isEmbeddable === false
    ) {
      newCol = new ClassColumnSQLite(
        newColId,
        "id",
        SQLiteHelpers.getSQLiteKeyType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (
      this.props.type === "LOGICAL" &&
      this.props.def_coltopk &&
      isEmbeddable === false
    ) {
      newCol = new ClassColumnLogical(
        newColId,
        "id",
        LogicalHelpers.getLogicalKeyType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (
      this.props.type === "PG" &&
      this.props.def_coltopk &&
      isEmbeddable === false &&
      objectType !== "composite"
    ) {
      newCol = new ClassColumnPG(
        newColId,
        "id",
        PGHelpers.getPGDefaultType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: this.props.nameAutoGeneration.keys
            ? PGHelpers.makeUniquePKName(
                defaultName,
                PGHelpers.getAllKeysByNames(this.props.allTables)
              )
            : "Primary key",
          isPk: true,
          using: "",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (
      this.props.type === "MONGOOSE" &&
      this.props.def_coltopk &&
      isEmbeddable === false
    ) {
      newCol = new ClassColumn(
        newColId,
        "_id",
        MongooseHelpers.getMongooseKeyType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    if (
      this.props.type === "MONGODB" &&
      this.props.def_coltopk &&
      isEmbeddable === false
    ) {
      newCol = new ClassColumn(
        newColId,
        "_id",
        MongoDbHelpers.getMongoDBKeyType(),
        true,
        true
      );
      newCols = [newCol];
      newKeys = [
        {
          id: uuidv4(),
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [{ id: uuidv4(), colid: newColId }]
        }
      ];
    }

    var t = new ClassTable(
      newTableId,
      defaultName,
      newCols,
      newKeys,
      isEmbeddable
    );

    if (this.props.type === "SEQUELIZE") {
      let defaultValues = {
        def_freezeTableName: this.props.def_freezeTableName,
        def_timestamps: this.props.def_timestamps,
        def_paranoid: this.props.def_paranoid,
        def_version: this.props.def_version,
        def_collation: this.props.def_collation,
        def_charset: this.props.def_charset
      };

      t = new ClassTableSequelize(
        newTableId,
        defaultName,
        newCols,
        newKeys,
        isEmbeddable,

        defaultValues
      );
    }

    if (this.props.type === "GRAPHQL") {
      let defaultValues = {
        def_others: this.props.def_others
      };

      t = new ClassTableGraphQl(
        newTableId,
        defaultName,
        newCols,
        newKeys,
        isEmbeddable,
        defaultValues,
        objectType,
        null
      );
    }

    if (this.props.type === "MONGOOSE") {
      let defaultValues = {
        def_others: this.props.def_others
      };

      t = new ClassTableMongoose(
        newTableId,
        defaultName,
        newCols,
        newKeys,
        isEmbeddable,
        defaultValues
      );
    }

    if (this.props.type === "MONGODB") {
      let defaultValues = {
        def_validationLevel: this.props.def_validationLevel,
        def_validationAction: this.props.def_validationAction,
        def_collation: this.props.def_collation,
        def_others: this.props.def_others
      };

      t = new ClassTableMongoDb(
        newTableId,
        defaultName,
        newCols,
        newKeys,
        isEmbeddable,
        defaultValues
      );
    }

    if (
      this.props.type === ModelTypes.MARIADB ||
      this.props.type === ModelTypes.MYSQL
    ) {
      const defaultValues = {
        def_coltopk: this.props.def_coltopk,
        def_tabletype: this.props.def_tabletype,
        def_collation: this.props.def_collation,
        def_charset: this.props.def_charset,
        def_rowformat: this.props.def_rowformat,
        def_database: this.props.def_database
      };
      if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT) {
        t = new ClassTableJson(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable
        );
      } else {
        t = new ClassTableMySQLFamily(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          defaultValues
        );
      }
    }

    if (this.props.type === "SQLITE") {
      let defaultValues = {
        def_coltopk: this.props.def_coltopk,
        def_collation: this.props.def_collation
      };
      if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT) {
        t = new ClassTableJson(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable
        );
      } else {
        t = new ClassTableSQLite(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          defaultValues,
          "table"
        );
      }
    }

    if (this.props.type === "LOGICAL") {
      let defaultValues = {
        def_coltopk: this.props.def_coltopk
      };
      if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT) {
        t = new ClassTableJson(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable
        );
      } else {
        t = new ClassTableLogical(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          defaultValues,
          "table"
        );
      }
    }

    if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      let defaultValues = {
        def_coltopk: this.props.def_coltopk
      };
      if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT) {
        t = new ClassTableJson(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable
        );
      } else if (
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_CHOICE ||
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_CONDITION ||
        this.props.currentDiagramAreaMode ===
          DiagramAreaMode.ADD_JSON_EXTERNAL_REF
      ) {
        t = new ClassTableJsonSchema(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          objectType,
          TableControlTypesJson.STANDARD,
          ""
        );
      } else if (
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_JSON_SCHEMA ||
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_JSON_OBJECT ||
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_JSON_ARRAY
      ) {
        t = new ClassTableJsonSchema(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          objectType,
          TableControlTypesJson.STANDARD,
          ""
        );
      } else {
        t = new ClassTableJsonSchema(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          "table",
          TableControlTypesJson.STANDARD,
          ""
        );
      }
    }

    if (this.props.type === "PG") {
      let defaultValues = {
        def_coltopk: this.props.def_coltopk,
        schema: this.props.pg.schema
      };
      if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT) {
        t = new ClassTableJson(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable
        );
      } else {
        t = new ClassTablePG(
          newTableId,
          defaultName,
          newCols,
          newKeys,
          isEmbeddable,
          defaultValues,
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_COMPOSITE
            ? this.props.localization.L_COMPOSITE
            : this.props.localization.L_TABLE
        );
      }
    }
    t.visible = this.props.activeDiagramObject.main;

    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_TABLE_LIST__ADD_TABLE
    );
    try {
      const di = createDiagramItem(t, "table", leftPosition, topPosition);
      await this.props.addTableWithDiagramItem(
        this.props.match.params.did,
        t,
        di
      );
      await this.props.clearAddToSelection("table", t.id);
      navigateByObjectType(
        getCurrentHistoryTransaction().historyContext,
        "table",
        t
      );
      await this.props.setForcedRender({ domToModel: false });

      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "addSingleTable"
      });

      await this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
    } finally {
      await this.props.finishTransaction();
    }
  }

  async addSingleNote(pageX, pageY) {
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    const refDiagram = document.getElementById("diagram");
    const boxDiagram = refDiagram.getBoundingClientRect();
    var leftPosition = Math.round(
      (pageX - boxDiagram.left) * (1 / this.props.zoom)
    );
    var topPosition = Math.round(
      (pageY - boxDiagram.top) * (1 / this.props.zoom)
    );
    var t = new ClassNote(uuidv4(), this.findName("note", this.props.allNotes));
    t.visible = this.props.activeDiagramObject.main;

    const di = createDiagramItem(t, "note", leftPosition, topPosition);
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_TABLE_LIST__ADD_NOTE
    );
    try {
      await this.props.addNoteWithDiagramItem(
        t,
        di,
        this.props.match.params.did
      );
      await this.props.clearAddToSelection("note", t.id);
      await this.props.setForcedRender({ domToModel: false });
      navigateByObjectType(historyContext, "note", t);
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "addSingleNote"
      });

      await this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
    } finally {
      await this.props.finishTransaction();
    }
  }

  async addSingleOtherObject(pageX, pageY, otherObjectType) {
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.DIAGRAM_TABLE_LIST__ADD_OTHER_OBJECT
    );
    try {
      const refDiagram = document.getElementById("diagram");
      const boxDiagram = refDiagram.getBoundingClientRect();

      var otherObjectName = this.findName(
        this.updateObjectNameByPlatform(otherObjectType),
        this.props.allOtherObjects
      );

      var leftPosition = Math.round(
        (pageX - boxDiagram.left) * (1 / this.props.zoom)
      );
      var topPosition = Math.round(
        (pageY - boxDiagram.top) * (1 / this.props.zoom)
      );

      const t =
        this.props.type === "PG"
          ? new ClassOtherObjectPG(
              uuidv4(),

              otherObjectName, // this is name
              otherObjectType,
              otherObjectType === "Domain"
                ? {
                    schema: this.props.pg.schema,
                    domain: { datatype: PGHelpers.getPGDefaultType() }
                  }
                : { schema: this.props.pg.schema }
            )
          : new ClassOtherObject(
              uuidv4(),
              otherObjectName, // this is name
              otherObjectType
            );

      t.visible = this.props.activeDiagramObject.main;

      const di = createDiagramItem(
        t,
        "other_object",
        leftPosition,
        topPosition
      );
      await this.props.addOtherObjectWithDiagramItem(
        this.props.match.params.did,
        t,
        di
      );
      await this.props.clearAddToSelection("other_object", t.id);
      await this.props.setForcedRender({ domToModel: false });
      await this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
      navigateToOtherObjectUrl(
        this.props.match.url,
        this.props.history,
        this.props.match.params.mid,
        this.props.match.params.did,
        t.id
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "addSingleOtherObject"
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  handleDiagramAreaClick(e) {
    // NEW
    if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TABLE ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INTERFACE ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_UNION ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INPUT ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_COMPOSITE
    ) {
      this.addSingleTable(e.pageX, e.pageY);
    } else if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_NOTE) {
      this.addSingleNote(e.pageX, e.pageY);
    } else if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_VIEW) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.View);
    } else if (
      this.props.currentDiagramAreaMode ===
      DiagramAreaMode.ADD_MATERIALIZED_VIEW
    ) {
      this.addSingleOtherObject(
        e.pageX,
        e.pageY,
        OtherObjectTypes.MaterializedView
      );
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_FUNCTION
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Function);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_PROCEDURE
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Procedure);
    } else if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RULE) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Rule);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_SEQUENCE
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Sequence);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOMAIN
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Domain);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TYPE_OTHER
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.TypeOther);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TRIGGER
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Trigger);
    } else if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_ENUM) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Enum);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_POLICY
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Policy);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_SCALAR
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Scalar);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_MUTATION
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Mutation);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_QUERY
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Query);
    } else if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_OTHER
    ) {
      this.addSingleOtherObject(e.pageX, e.pageY, OtherObjectTypes.Other);
    } else {
      if (this.state.selectionAreaDecoratorPosition.click) {
        this.unselect(e);
      }
    }
    this.hideAllModals();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  handleMove(event) {
    if (this.relationOrLineIsCreated() === false) {
      const elementChanges = [];
      const changes = [];
      if (event) {
        _.forEach(this.props.selections, (s) => {
          this.moveObject(
            elementChanges,
            changes,
            s.objectId,
            s.objectType,
            event
          );
        });
      }

      if (!this.state.dragged) {
        this.setState({ dragged: true });
      }

      for (const elementChange of elementChanges) {
        elementChange.element.style.top = `${elementChange.y}px`;
        elementChange.element.style.left = `${elementChange.x}px`;
      }
      for (const change of changes) {
        change.xa.setAttribute("d", change.path);
        change.xb.setAttribute("d", this.reversePath(change.path));
      }
      const element = document.getElementById("selector");
      if (element?.style.display !== "none") {
        element.style.display = "none";
      }
    }
  }

  collectionByObjectType(objectType) {
    switch (objectType) {
      case NOTE:
        return this.props.notes;
      case OTHER_OBJECT:
        return this.props.otherObjects;
      case TABLE:
        return this.props.tables;
      case RELATION:
        return this.props.relations;
      case LINE:
        return this.props.lines;
      default:
        return undefined;
    }
  }

  reversePath(path) {
    let toReturn = path;
    if (this.props.cardinalityIsDisplayed === true) {
      try {
        if (path !== undefined && path !== "") {
          let originalPath = new SVGPathCommander(path);
          var optimized = originalPath.optimize();
          var normalized = optimized.normalize();
          var reversed = normalized.reverse().toString();
          if (reversed.includes("NaN") === false) {
            toReturn = reversed;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    return toReturn;
  }

  moveObject(elementChanges, changes, objectId, objectType, event) {
    const obj = this.collectionByObjectType(objectType)[objectId];
    if (!obj) {
      return;
    }
    let zoomRatio = 1 / this.props.zoom;
    const x = Math.max(
      obj.x +
        Math.round((event.clientX * 1) / this.props.zoom) -
        this.state.moveBy.startX,
      45
    );
    const y = Math.max(
      obj.y +
        Math.round((event.clientY * 1) / this.props.zoom) -
        this.state.moveBy.startY,
      30
    );

    var element = document.getElementById(objectId);
    if (element) {
      elementChanges.push({ element, x, y });
    }

    /* move relations */
    if (obj.relations) {
      for (var r of obj.relations) {
        var relation = this.props.relations[r];

        var parentTable = this.props.tables[relation.parent];
        var childTable = this.props.tables[relation.child];

        if (!parentTable || !childTable) {
          continue;
        }

        var parentColPositionIndex;
        var childColPositionIndex;

        var firstColInRel = _.find(relation.cols);
        if (firstColInRel !== null && firstColInRel !== undefined) {
          parentColPositionIndex = _.findIndex(parentTable.cols, [
            "id",
            firstColInRel.parentcol
          ]);

          parentColPositionIndex =
            this.calculateColPosition(parentColPositionIndex, parentTable) + 1;

          childColPositionIndex = _.findIndex(childTable.cols, [
            "id",
            firstColInRel.childcol
          ]);

          childColPositionIndex =
            this.calculateColPosition(childColPositionIndex, childTable) + 1;
        } else {
          parentColPositionIndex = 1;
          childColPositionIndex = 1;
        }

        var xa = document.getElementById("r" + r);
        var xb = document.getElementById("rb" + r);
        var parent;
        var child;

        var pheight = parentTable.gHeight;
        var chheight = childTable.gHeight;

        var canvas = document.getElementById("canvas");
        const boxCanvas = canvas.getBoundingClientRect();
        const body = document.body;
        var childGraphics = document.getElementById(childTable.id);
        var parentGraphics = document.getElementById(parentTable.id);

        if (parentGraphics && childGraphics) {
          var childGraphicsBox = childGraphics.getBoundingClientRect();
          var parentGraphicsBox = parentGraphics.getBoundingClientRect();

          if (objectId === parentTable.id) {
            parent = {
              x: x,
              y: y,
              gWidth: parentTable.gWidth,
              gHeight: pheight,
              visible: parentTable.visible,
              parentColPositionIndex: parentColPositionIndex,
              relations: parentTable.relations
            };
            child = {
              x: Math.round(
                (childGraphicsBox.left -
                  (boxCanvas.left + body.scrollLeft - body.clientLeft)) *
                  zoomRatio
              ),
              y: Math.round(
                (childGraphicsBox.top -
                  (boxCanvas.top + body.scrollTop - body.clientTop)) *
                  zoomRatio
              ),
              gWidth: childTable.gWidth,
              gHeight: chheight,
              visible: childTable.visible,
              childColPositionIndex: childColPositionIndex,
              relations: parentTable.relations
            };
          } else {
            parent = {
              x: Math.round(
                (parentGraphicsBox.left -
                  (boxCanvas.left + body.scrollLeft - body.clientLeft)) *
                  zoomRatio
              ),
              y: Math.round(
                (parentGraphicsBox.top -
                  (boxCanvas.top + body.scrollTop - body.clientTop)) *
                  zoomRatio
              ),
              gWidth: parentTable.gWidth,
              gHeight: pheight,
              visible: parentTable.visible,
              parentColPositionIndex: parentColPositionIndex,
              relations: parentTable.relations
            };
            child = {
              x: x,
              y: y,
              gWidth: childTable.gWidth,
              gHeight: chheight,
              visible: childTable.visible,
              childColPositionIndex: childColPositionIndex,
              relations: parentTable.relations
            };
          }

          if (this.isOnDiagram(parent) && this.isOnDiagram(child)) {
            var path;

            if (parentTable.id === childTable.id) {
              if (objectId === parentTable.id) {
                path = this.calculateSelf(r, parent);
              } else {
                path = this.calculateSelf(r, child);
              }
            } else {
              if (
                this.props.activeDiagramObject &&
                this.props.activeDiagramObject.linegraphics === "basic"
              ) {
                path = this.calculatePath(
                  this.props.relations,
                  parent,
                  child,
                  relation,
                  "relations"
                );
              } else {
                path = this.calculatePathDetailed(r, parent, child, false);
              }

              //path = this.calculatePathDetailed(r, parent, child);
            }
            changes.push({ xa, xb, path });
          }
        }
      }
    }

    /* move lines */
    var allObjectsArray = {
      ...this.props.tables,
      ...this.props.notes,
      ...this.props.otherObjects
    };

    if (allObjectsArray[objectId].lines) {
      for (var l of allObjectsArray[objectId].lines) {
        this.calculateLineDrawing(changes, l, objectId, x, y);
      }
    }
  }

  calculateLineDrawing(changes, l, objectId, x, y) {
    let zoomRatio = 1 / this.props.zoom;
    var line = this.props.lines[l];

    var parentTable = this.getObjectById(line.parent);
    var childTable = this.getObjectById(line.child);

    if (this.isOnDiagram(parentTable) && this.isOnDiagram(childTable)) {
      var parentColPositionIndex = 0;
      var childColPositionIndex = 0;

      var xa = document.getElementById("r" + l);
      var xb = document.getElementById("rb" + l);
      var parent;
      var child;

      var pheight = parentTable.gHeight;
      var chheight = childTable.gHeight;

      var canvas = document.getElementById("canvas");
      const boxCanvas = canvas.getBoundingClientRect();
      const body = document.body;
      var childGraphics = document.getElementById(childTable.id);
      var parentGraphics = document.getElementById(parentTable.id);

      if (parentGraphics && childGraphics) {
        var childGraphicsBox = childGraphics.getBoundingClientRect();
        var parentGraphicsBox = parentGraphics.getBoundingClientRect();

        if (objectId === parentTable.id) {
          parent = {
            x: x,
            y: y,
            gWidth: parentTable.gWidth,
            gHeight: pheight,
            visible: parentTable.visible,
            parentColPositionIndex: parentColPositionIndex,
            lines: parentTable.lines
          };
          child = {
            x: Math.round(
              childGraphicsBox.left * zoomRatio -
                (boxCanvas.left * zoomRatio +
                  body.scrollLeft * zoomRatio -
                  body.clientLeft * zoomRatio)
            ),
            y: Math.round(
              childGraphicsBox.top * zoomRatio -
                (boxCanvas.top * zoomRatio +
                  body.scrollTop * zoomRatio -
                  body.clientTop * zoomRatio)
            ),
            gWidth: childTable.gWidth,
            gHeight: chheight,
            visible: childTable.visible,
            childColPositionIndex: childColPositionIndex,
            lines: childTable.lines
          };
        } else {
          parent = {
            x: Math.round(
              parentGraphicsBox.left * zoomRatio -
                (boxCanvas.left * zoomRatio +
                  body.scrollLeft * zoomRatio -
                  body.clientLeft * zoomRatio)
            ),
            y: Math.round(
              parentGraphicsBox.top * zoomRatio -
                (boxCanvas.top * zoomRatio +
                  body.scrollTop * zoomRatio -
                  body.clientTop * zoomRatio)
            ),
            gWidth: parentTable.gWidth,
            gHeight: pheight,
            visible: parentTable.visible,
            parentColPositionIndex: parentColPositionIndex,
            lines: parentTable.lines
          };
          child = {
            x: x,
            y: y,
            gWidth: childTable.gWidth,
            gHeight: chheight,
            visible: childTable.visible,
            childColPositionIndex: childColPositionIndex,
            lines: childTable.lines
          };
        }

        if (this.isOnDiagram(parent) && this.isOnDiagram(child)) {
          var path;

          if (parentTable.id === childTable.id) {
            if (objectId === parentTable.id) {
              path = this.calculateSelf(l, parent);
            } else {
              path = this.calculateSelf(l, child);
            }
          } else {
            let lineGraphicsSetting = this.props.lines[l].linegraphics;
            if (
              lineGraphicsSetting === "default" ||
              lineGraphicsSetting === undefined
            ) {
              if (
                this.props.activeDiagramObject &&
                this.props.activeDiagramObject.linegraphics === "basic"
              ) {
                path = this.calculatePath(
                  this.props.lines,
                  parent,
                  child,
                  line,
                  "lines"
                );
              } else {
                path = this.calculatePathDetailed(l, parent, child, true);
              }
            } else if (lineGraphicsSetting === "basic") {
              path = this.calculatePath(
                this.props.lines,
                parent,
                child,
                line,
                "lines"
              );
            } else if (lineGraphicsSetting === "detailed") {
              path = this.calculatePathDetailed(l, parent, child, true);
            }

            //path = this.calculatePathDetailed(r, parent, child);
          }
          changes.push({ xa, xb, path });
        }
      }
    }
  }

  relationOrLineIsCreated() {
    return (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE ||
      this.props.currentDiagramAreaMode ===
        DiagramAreaMode.ADD_RELATION_BELONGS ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS
    );
  }

  moveObjectStop(id, objectType) {
    const obj = this.collectionByObjectType(objectType)[id];
    const x = Math.max(
      Math.round(obj.x + this.state.moveBy.endX - this.state.moveBy.startX),
      45
    );
    const y = Math.max(
      Math.round(obj.y + this.state.moveBy.endY - this.state.moveBy.startY),
      30
    );

    return [
      {
        id,
        propvalue: x,
        propname: "x",
        diagramId: this.props.match.params.did
      },
      {
        id,
        propvalue: y,
        propname: "y",
        diagramId: this.props.match.params.did
      }
    ];
  }

  orginalProperties(id, objectType) {
    const obj = this.collectionByObjectType(objectType)[id];
    return [
      {
        id,
        propvalue: obj.x,
        propname: "x",
        diagramId: this.props.match.params.did
      },
      {
        id,
        propvalue: obj.y,
        propname: "y",
        diagramId: this.props.match.params.did
      }
    ];
  }

  handleStop(embeddable, objectType, id, event) {
    if (this.state.dragged === true) {
      if (event) {
        this.setState(
          {
            moveBy: {
              ...this.state.moveBy,
              endX: Math.round((event.clientX * 1) / this.props.zoom),
              endY: Math.round((event.clientY * 1) / this.props.zoom),
              initialized: false
            }
          },
          async () => {
            if (_.size(this.props.selections) > 0) {
              const visibleObjects = _.filter(
                this.props.selections,
                (selectionItem) => {
                  return (
                    this.collectionByObjectType(selectionItem.objectType)[
                      selectionItem.objectId
                    ] !== undefined
                  );
                }
              ).reduce((r, i) => {
                r[i.objectId] = i;
                return r;
              }, {});
              const propertyChanges = _.map(visibleObjects, (s) =>
                this.moveObjectStop(s.objectId, s.objectType)
              ).reduce((r, i) => [...r, ...i], []);

              await this.props.startTransaction(
                getHistoryContext(this.props.history, this.props.match),
                UndoRedoDef.DIAGRAM_TABLE_LIST__UPDATE_DIAGRAM_ITEM_PROPERTIES
              );
              try {
                await this.props.updateDiagramItemProperties({
                  changes: propertyChanges
                });
              } finally {
                await this.props.finishTransaction();
              }
            }
          }
        );
      }

      this.setState({ dragged: false });
    } else {
      if (!this.ctrlOrMetaClick(event)) {
        //deselect other objects if was no drag
        this.activateOnlyObject(objectType, id, embeddable);
      }
    }

    if (this.state.selectionAreaDecoratorPosition.initialized) {
      this.setState({
        selectionAreaDecoratorPosition: {
          startX: 0,
          startY: 0,
          initialized: false,
          click: false
        }
      });
    }
  }

  resizeGraphics(element_id) {
    var element = document.getElementById(element_id);
    if (element) {
      this.setState({ resizeElement: element_id });

      //create box in bottom-left
      var resexist = element.getElementsByClassName("res");
      if (!resexist[0]) {
        var resizer = document.createElement("i");
        resizer.style.width = "16px";
        resizer.style.height = "16px";
        resizer.style.position = "absolute";
        resizer.style.right = "0";
        resizer.style.bottom = "0";
        resizer.style.cursor = "se-resize";
        resizer.className = "im-icon-ResizeBottomRight16 im-icon-16 res";

        //Append Child to Element
        element.appendChild(resizer);
        //box function onmousemove
        resizer.addEventListener("mousedown", this.xInitResize, false);
      }
    }
  }

  changeLinePathOnResize(
    activeObject,
    parentTable,
    childTable,
    l,
    body,
    elbox,
    e
  ) {
    if (!parentTable || !childTable) {
      return;
    }
    var parentColPositionIndex = 0;
    var childColPositionIndex = 0;

    var xa = document.getElementById("r" + l);
    var xb = document.getElementById("rb" + l);
    var parent;
    var child;

    const newWidth = Math.round(
      Math.max(e.clientX - elbox.x + body.scrollLeft, MIN_WIDTH) /
        this.props.zoom
    );
    const newHeight = Math.round(
      Math.max(e.clientY - elbox.y + body.scrollTop, MIN_HEIGHT) /
        this.props.zoom
    );

    parent = {
      x: parentTable.x,
      y: parentTable.y,
      gWidth: activeObject === parentTable.id ? newWidth : parentTable.gWidth,
      gHeight:
        activeObject === parentTable.id ? newHeight : parentTable.gHeight,
      visible: parentTable.visible,
      parentColPositionIndex: parentColPositionIndex,
      lines: parentTable.lines
    };

    child = {
      x: childTable.x,
      y: childTable.y,
      gWidth: activeObject === parentTable.id ? childTable.gWidth : newWidth,
      gHeight: activeObject === parentTable.id ? childTable.gHeight : newHeight,
      visible: childTable.visible,
      childColPositionIndex: childColPositionIndex,
      lines: childTable.lines
    };

    if (this.isOnDiagram(parent) && this.isOnDiagram(child)) {
      var path;
      if (parentTable.id === childTable.id) {
        path =
          this.props.match.params.id === parentTable.id
            ? this.calculateSelf(l, parent)
            : this.calculateSelf(l, child);
      } else {
        let lineGraphicsSetting = this.props.lines[l].linegraphics;
        if (
          lineGraphicsSetting === "default" ||
          lineGraphicsSetting === undefined
        ) {
          path =
            this.props.activeDiagramObject &&
            this.props.activeDiagramObject.linegraphics === "basic"
              ? this.calculatePath(
                  this.props.lines,
                  parent,
                  child,
                  this.props.lines[l],
                  "lines"
                )
              : this.calculatePathDetailed(l, parent, child, true);
        } else if (lineGraphicsSetting === "basic") {
          path = this.calculatePath(
            this.props.lines,
            parent,
            child,
            this.props.lines[l],
            "lines"
          );
        } else if (lineGraphicsSetting === "detailed") {
          path = this.calculatePathDetailed(l, parent, child, true);
        }
      }
      xa.setAttribute("d", path);
      xb.setAttribute("d", path);
      xa = null;
      xb = null;
    }
  }

  xResize(e) {
    // const obj = this.props.tables[this.props.match.params.id];
    // if (!obj) {
    //   return;
    // }
    var element = document.getElementById(this.state.resizeElement);

    var body = document.body;
    var elbox = element.getBoundingClientRect();

    let newWidth = Math.round(
      Math.max(e.clientX - elbox.x + body.scrollLeft, MIN_WIDTH) /
        this.props.zoom
    );
    let newHeight = Math.round(
      Math.max(e.clientY - elbox.y + body.scrollTop, MIN_HEIGHT) /
        this.props.zoom
    );

    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;
    const content = document.getElementById(
      "dc" + this.state.resizeElement.substr("content".length)
    );

    if (content && content.classList.contains("im-n-text-nowrap")) {
      content.classList.remove("im-n-text-nowrap");
    }
    if (content && content.classList.contains("dCols-desc-nowrap")) {
      content.classList.remove("dCols-desc-nowrap");
    }

    //content.style = "im-n-text ql-editor";

    newWidth =
      newWidth !== element.clientWidth ? element.clientWidth : newWidth;
    newHeight =
      newHeight !== element.clientHeight ? element.clientHeight : newHeight;

    if (this.props.match.params.id) {
      const obj = this.props.tables[this.props.match.params.id];
      /* resize and move relations */
      for (var r of obj.relations) {
        var relation = this.props.relations[r];

        let parentTable = this.props.tables[relation.parent];
        let childTable = this.props.tables[relation.child];

        if (!parentTable || !childTable) {
          continue;
        }

        var parentColPositionIndex;
        var childColPositionIndex;

        var firstColInRel = _.find(relation.cols);
        if (firstColInRel !== null && firstColInRel !== undefined) {
          parentColPositionIndex = _.findIndex(parentTable.cols, [
            "id",
            firstColInRel.parentcol
          ]);

          parentColPositionIndex =
            this.calculateColPosition(parentColPositionIndex, parentTable) + 1;

          childColPositionIndex = _.findIndex(childTable.cols, [
            "id",
            firstColInRel.childcol
          ]);

          childColPositionIndex =
            this.calculateColPosition(childColPositionIndex, childTable) + 1;
        } else {
          parentColPositionIndex = 1;
          childColPositionIndex = 1;
        }

        var xa = document.getElementById("r" + r);
        var xb = document.getElementById("rb" + r);
        var parent;
        var child;

        parent = {
          x: parentTable.x,
          y: parentTable.y,
          gWidth:
            this.props.match.params.id === parentTable.id
              ? newWidth
              : parentTable.gWidth,
          gHeight:
            this.props.match.params.id === parentTable.id
              ? newHeight
              : parentTable.gHeight,
          visible: parentTable.visible,
          parentColPositionIndex: parentColPositionIndex,
          relations: parentTable.relations
        };
        child = {
          x: childTable.x,
          y: childTable.y,
          gWidth:
            this.props.match.params.id === parentTable.id
              ? childTable.gWidth
              : newWidth,
          gHeight:
            this.props.match.params.id === parentTable.id
              ? childTable.gHeight
              : newHeight,
          visible: childTable.visible,
          childColPositionIndex: childColPositionIndex,
          relations: childTable.relations
        };
        if (this.isOnDiagram(parent) && this.isOnDiagram(child)) {
          const path =
            parentTable.id === childTable.id
              ? this.calculateSelf(
                  r,
                  this.props.match.params.id === parentTable.id ? parent : child
                )
              : this.props.activeDiagramObject &&
                this.props.activeDiagramObject.linegraphics === "basic"
              ? this.calculatePath(
                  this.props.relations,
                  parent,
                  child,
                  relation,
                  "relations"
                )
              : this.calculatePathDetailed(r, parent, child, false);
          xa && xa.setAttribute("d", path);
          xb && xb.setAttribute("d", this.reversePath(path));

          xa = null;
          xb = null;
        }
      }

      if (this.props.tables[this.props.match.params.id].lines) {
        for (let l of this.props.tables[this.props.match.params.id].lines) {
          let line = this.props.lines[l];
          let parentTable = this.getObjectById(line.parent);
          let childTable = this.getObjectById(line.child);
          this.changeLinePathOnResize(
            this.props.match.params.id,
            parentTable,
            childTable,
            l,
            body,
            elbox,
            e
          );
        }
      }
    } else if (
      this.props.match.params.nid &&
      this.props.notes[this.props.match.params.nid].lines
    ) {
      for (let l of this.props.notes[this.props.match.params.nid].lines) {
        let line = this.props.lines[l];
        let parentTable = this.getObjectById(line.parent);
        let childTable = this.getObjectById(line.child);
        this.changeLinePathOnResize(
          this.props.match.params.nid,
          parentTable,
          childTable,
          l,
          body,
          elbox,
          e
        );
      }
    } else if (
      this.props.match.params.oid &&
      this.props.otherObjects[this.props.match.params.oid].lines
    ) {
      for (var l of this.props.otherObjects[this.props.match.params.oid]
        .lines) {
        var line = this.props.lines[l];
        var parentTable = this.getObjectById(line.parent);
        var childTable = this.getObjectById(line.child);
        this.changeLinePathOnResize(
          this.props.match.params.oid,
          parentTable,
          childTable,
          l,
          body,
          elbox,
          e
        );
      }
    }
  }

  async selectLink(obj, objectType, e) {
    e.stopPropagation();
    await this.props.clearSelection(
      this.props.match.params.lid || this.props.match.params.rid
    );
    await this.props.setForcedRender({ domToModel: false });

    navigateByObjectType(
      getHistoryContext(this.props.history, this.props.match),
      objectType,
      obj
    );
    await this.props.setForcedRender({ domToModel: false });
  }

  buildLinkEvents(link, objectType) {
    return {
      onClick: this.selectLink.bind(this, link, objectType),
      onDoubleClick: this.objectDoubleClick.bind(this, objectType),
      onContextMenu: this.objectContextMenu.bind(this, objectType, link)
    };
  }

  xInitResize(e) {
    window.addEventListener("mousemove", this.xResizeDebounced, false);
    window.addEventListener("mouseup", this.xStopResize, false);
    e.stopPropagation();
  }

  async xStopResize(e) {
    if (
      this.props.match.params.id ||
      this.props.match.params.nid ||
      this.props.match.params.oid
    ) {
      window.removeEventListener("mousemove", this.xResizeDebounced, false);
      window.removeEventListener("mouseup", this.xStopResize, false);

      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.DIAGRAM_TABLE_LIST__ADD_RESIZE_REQUEST
      );
      try {
        getCurrentHistoryTransaction().addResizeRequest({
          operation: "resize",
          domToModel: true,
          byUser: true,
          objects: [
            this.props.match.params.id ||
              this.props.match.params.nid ||
              this.props.match.params.oid
          ]
        });
      } finally {
        await this.props.finishTransaction();
      }

      this.setState({
        selectionAreaDecoratorPosition: {
          startX: 0,
          startY: 0,
          click: false,
          initialized: false
        }
      });
    }
  }

  renderRelationCaption(relation, caption, isParent, isNormalDirection) {
    if (
      (this.props.activeDiagramObject.diagramItems[relation.parent].x >
        this.props.activeDiagramObject.diagramItems[relation.child].x &&
        isNormalDirection === false) ||
      (this.props.activeDiagramObject.diagramItems[relation.parent].x <
        this.props.activeDiagramObject.diagramItems[relation.child].x &&
        isNormalDirection === true)
    ) {
      return (
        <>
          <tspan
            startOffset={isParent ? "100%" : "0%"}
            className={"rCardinality"}
            x={isParent ? "40px" : "-40px"}
            dy="-5px"
          >
            {caption}
          </tspan>
        </>
      );
    }
  }

  getCardinalityMarker(parentOrChild, cardinality, ordinality, relationType) {
    if (
      this.props.type === ModelTypes.GRAPHQL &&
      relationType === "identifying"
    ) {
      //console.log(parentOrChild);
      return parentOrChild === "child"
        ? `url(#arrowClosedEndtransparent)`
        : `url(#nonetransparent)`;
    }
    let toReturn = `url(#cardinality-${parentOrChild}-${this.getOrdinality(
      ordinality
    )}`;
    if (cardinality === "one") {
      toReturn += "-one";
    } else if (cardinality === "many") {
      toReturn += "-many";
    } else if (cardinality === "zillion") {
      toReturn += "-zillion";
    }
    toReturn += ")";
    return toReturn;
  }

  getOrdinality(ordinality) {
    switch (ordinality) {
      case "false":
      case false:
        return "optional";
      case "true":
      case true:
        return "mandatory";
      default:
        return "mandatory";
    }
  }

  getRelationMiddleGraphics(relationType, lineColor, selClassNameArrow) {
    if (
      this.props.type === ModelTypes.GRAPHQL &&
      relationType === "identifying"
    ) {
      return (
        <tspan
          dy="0"
          dx="-16"
          style={{ fill: lineColor }}
          className={selClassNameArrow}
        >
          &#xe97a;
        </tspan>
      );
    } else {
      return (
        <tspan
          dy="0"
          dx="-16"
          style={{ fill: lineColor }}
          className={selClassNameArrow}
        >
          &#xe90a;
        </tspan>
      );
    }
  }

  renderSingleRelation(relation, path) {
    var lineColor = "#eee";
    var textPathColor = "#585858";
    if (this.props.activeDiagramObject) {
      if (
        this.props.activeDiagramObject.lineColor === "transparent" ||
        this.props.activeDiagramObject.lineColor === undefined
      ) {
        if (this.props.settings.theme === "im-dark") {
          lineColor = "#eee";
        } else {
          lineColor = "#000";
        }
      } else {
        lineColor = this.props.activeDiagramObject.lineColor;
      }
      if (
        this.props.activeDiagramObject.background === "transparent" ||
        this.props.activeDiagramObject.background === undefined
      ) {
        if (this.props.settings.theme === "im-dark") {
          textPathColor = "#333";
        } else {
          textPathColor = "#eee";
        }
      } else {
        textPathColor = this.props.activeDiagramObject.background;
      }
    }

    var selClassName = " im-rel-path ";
    var selClassNameBg = " relation-diagram-bg";
    var selClassNameArrow = "im-icon-ExpandCircle16 im-icon-16 ";

    if (
      relation.orm_association_belongs !== "na" &&
      relation.orm_association_belongs !== undefined
    ) {
      selClassName = " rbelongs-meteor";
    }

    if (
      relation.orm_association_has !== "na" &&
      relation.orm_association_has !== undefined &&
      relation.orm_association_belongs !== "na" &&
      relation.orm_association_belongs !== undefined
    ) {
      selClassName = "rboth-meteor";
    }

    if (
      this.props.type === ModelTypes.GRAPHQL &&
      relation.type === "identifying"
    ) {
      selClassName = "rbelongs";
    }

    if (this.props.match.params.rid) {
      if (this.props.match.params.rid === relation.id) {
        selClassName += " sel-relation-diagram";
        selClassNameBg += "  sel-relation-diagram-bg";
        selClassNameArrow += " sel-relation-diagram-arrow";
      }
    }
    return (
      <g key={relation.id}>
        <path
          id={"rb" + relation.id}
          className={selClassNameBg}
          d={this.reversePath(path)}
          {...this.buildLinkEvents(relation, "relation")}
          data-testid={relation.name}
        />

        <path
          style={{ stroke: lineColor }}
          id={"r" + relation.id}
          markerStart={this.getCardinalityMarker(
            "parent",
            relation.c_p,
            relation.c_mp,
            relation.type
          )}
          markerEnd={this.getCardinalityMarker(
            "child",
            relation.c_ch,
            relation.c_mch,
            relation.type
          )}
          className={selClassName}
          d={path}
          {...this.buildLinkEvents(relation, "relation")}
        />
        <text
          id={"rt" + relation.id}
          {...this.buildLinkEvents(relation, "relation")}
        >
          <textPath xlinkHref={"#r" + relation.id} startOffset="50%">
            <tspan
              dy="7"
              dx="-8"
              className="im-icon-FullCircle im-icon-16"
              style={{
                fill: textPathColor
              }}
            >
              &#xe93a;
            </tspan>
            {this.getRelationMiddleGraphics(
              relation.type,
              lineColor,
              selClassNameArrow
            )}
          </textPath>
        </text>
        {this.props.cardinalityIsDisplayed === true && (
          <>
            <text
              id={"rb_cp" + relation.id}
              {...this.buildLinkEvents(relation, "relation")}
            >
              <textPath xlinkHref={"#r" + relation.id} startOffset="0%">
                {this.renderRelationCaption(
                  relation,
                  relation.c_cp,
                  true,
                  true
                )}
              </textPath>
            </text>
            <text
              id={"rb_cch" + relation.id}
              {...this.buildLinkEvents(relation, "relation")}
            >
              <textPath
                xlinkHref={"#r" + relation.id}
                textAnchor="end"
                startOffset="100%"
              >
                {this.renderRelationCaption(
                  relation,
                  relation.c_cch,
                  false,
                  true
                )}
              </textPath>
            </text>
            <text
              id={"rtb_cp" + relation.id}
              {...this.buildLinkEvents(relation, "relation")}
            >
              <textPath xlinkHref={"#rb" + relation.id} startOffset="0%">
                {this.renderRelationCaption(
                  relation,
                  relation.c_cch,
                  true,
                  false
                )}
              </textPath>
            </text>
            <text
              id={"rtb_cch" + relation.id}
              {...this.buildLinkEvents(relation, "relation")}
            >
              <textPath
                xlinkHref={"#rb" + relation.id}
                textAnchor="end"
                startOffset="100%"
              >
                {this.renderRelationCaption(
                  relation,
                  relation.c_cp,
                  false,
                  false
                )}
              </textPath>
            </text>
          </>
        )}
      </g>
    );
  }

  renderSingleLine(line, path) {
    var lineColor = "#eee";

    if (line.lineColor === "transparent" || line.lineColor === undefined) {
      if (this.props.settings.theme === "im-dark") {
        lineColor = "#999";
      } else {
        lineColor = "#666";
      }
    } else {
      lineColor = line.lineColor;
    }

    var selClassName = "r";
    var selClassNameBg = "r relation-diagram-bg";

    if (this.props.match.params.lid) {
      if (this.props.match.params.lid === line.id) {
        selClassName += " sel-relation-diagram";
        selClassNameBg += "  sel-relation-diagram-bg";
      }
    }

    return (
      <g key={line.id} style={{ stroke: line.lineColor }}>
        <path
          id={"rb" + line.id}
          className={selClassNameBg}
          d={path}
          {...this.buildLinkEvents(line, "line")}
          data-testid={line.name}
        />

        <path
          style={{ stroke: lineColor }}
          id={"r" + line.id}
          markerStart={
            "url(#" + line.markerStart + line.lineColor.replace("#", "") + ")"
          }
          markerEnd={
            "url(#" + line.markerEnd + line.lineColor.replace("#", "") + ")"
          }
          className={selClassName}
          d={path}
          {...this.buildLinkEvents(line, "line")}
        />
      </g>
    );
  }

  calcAllNested(child) {
    var reductionChild = 0;
    if (this.props.embeddedInParentsIsDisplayed === true) {
      reductionChild = _.size(child.cols);
      for (var iter of child.cols) {
        let linkedTable = this.props.allTables[iter.datatype];

        if (linkedTable !== null && linkedTable !== undefined) {
          if (linkedTable.embeddable === true) {
            reductionChild += this.calcAllNested(linkedTable);
          }
        }
      }
    }
    return reductionChild;
  }

  calculateColPosition(childColPositionIndex, child) {
    let iter = "";
    let iii = 0;
    let reduction = 0;
    let maxIter = childColPositionIndex;

    for (iter of child.cols) {
      if (iii < maxIter) {
        let linkedTable = this.props.allTables[iter.datatype];
        if (linkedTable !== null && linkedTable !== undefined) {
          if (linkedTable.embeddable === true) {
            reduction += this.calcAllNested(linkedTable);
          }
        }
        iii++;
      }
    }
    return iii + reduction;
  }

  calculatePathDetailed(relation_id, parent, child, isLine) {
    const connectorOffset = 18;
    var moveToX;
    var moveToY;
    var lineToX;
    var lineToY;
    var rx;
    var firstColInRel;
    var parentColPositionIndex; //parent column index (position)
    var childColPositionIndex; // child column index (position)
    //var calc_chcix;

    if (parent && child) {
      if (this.isOnDiagram(parent) && this.isOnDiagram(child)) {
        if (isLine) {
          parentColPositionIndex = 0;
          childColPositionIndex = 0;
        } else {
          if (
            parent.parentColPositionIndex !== null &&
            parent.parentColPositionIndex !== undefined
          ) {
            parentColPositionIndex = parent.parentColPositionIndex;
            childColPositionIndex = child.childColPositionIndex;
          } else {
            rx = this.props.relations[relation_id];
            firstColInRel = _.find(rx.cols);

            if (firstColInRel !== null && firstColInRel !== undefined) {
              parentColPositionIndex = _.findIndex(parent.cols, [
                "id",
                firstColInRel.parentcol
              ]);

              parentColPositionIndex =
                this.calculateColPosition(parentColPositionIndex, parent) + 1;

              childColPositionIndex = _.findIndex(child.cols, [
                "id",
                firstColInRel.childcol
              ]);

              childColPositionIndex =
                this.calculateColPosition(childColPositionIndex, child) + 1;
            } else {
              parentColPositionIndex = 1;
              childColPositionIndex = 1;
            }
          }
        }
        if (this.props.type === "GRAPHQL") {
          parentColPositionIndex = 0;
          childColPositionIndex = childColPositionIndex - 1;
        }
        var markerOffsetParent;
        var markerOffsetChild;
        var reductionOffsetParent;
        var reductionOffsetChild;
        var q0;
        var q1;
        var q2;
        var d = "";

        moveToY = _.min([
          parent.y + parent.gHeight,
          parent.y + this.props.colHeight * parentColPositionIndex + 18
        ]);
        lineToY = _.min([
          child.y + child.gHeight,
          child.y + this.props.colHeight * childColPositionIndex + 18
        ]);

        if (parent.x < child.x) {
          moveToX = parent.x + parent.gWidth;
          markerOffsetParent = connectorOffset + ",0";
          if (parent.x + parent.gWidth + 25 < child.x) {
            lineToX = child.x;
            reductionOffsetParent = " l0,0 ";
            reductionOffsetChild = " l0,0 ";
            markerOffsetChild = lineToX - connectorOffset + "," + lineToY;

            q0 = moveToX + (lineToX - moveToX) / 2 / 1.5 + 4;
            q1 = moveToX + (lineToX - moveToX) / 2;
            q2 = moveToY + (lineToY - moveToY) / 2;
            d = `M${moveToX},${moveToY} l ${
              markerOffsetParent + reductionOffsetParent
            } Q${q0},${moveToY} ${q1},${q2}  T${markerOffsetChild} ${reductionOffsetChild} L${lineToX},${lineToY}`;
          } else {
            lineToX = child.x + child.gWidth + 4;
            var maxRight = _.max([
              child.x + child.gWidth + 4,
              parent.x + parent.gWidth + 4
            ]);
            reductionOffsetParent =
              " L" +
              (maxRight + connectorOffset + connectorOffset) +
              "," +
              moveToY;
            reductionOffsetChild =
              " L" +
              (maxRight + connectorOffset + connectorOffset) +
              "," +
              lineToY;
            markerOffsetChild = lineToX + connectorOffset + "," + lineToY;
            d =
              "M" +
              moveToX +
              "," +
              moveToY +
              " l" +
              markerOffsetParent +
              reductionOffsetParent +
              reductionOffsetChild +
              " L" +
              markerOffsetChild +
              " L" +
              lineToX +
              "," +
              lineToY;
          }
        } else {
          moveToX = parent.x;
          markerOffsetParent = "-" + connectorOffset + ",0";
          if (parent.x < child.x + child.gWidth + 25) {
            lineToX = child.x;
            reductionOffsetParent =
              " L" +
              (child.x - connectorOffset - connectorOffset) +
              "," +
              moveToY;
            reductionOffsetChild =
              " L" +
              (child.x + -connectorOffset - connectorOffset) +
              "," +
              lineToY;
            markerOffsetChild = lineToX - connectorOffset + "," + lineToY;

            d =
              "M" +
              moveToX +
              "," +
              moveToY +
              " l" +
              markerOffsetParent +
              reductionOffsetParent +
              reductionOffsetChild +
              " L" +
              markerOffsetChild +
              " L" +
              lineToX +
              "," +
              lineToY;
          } else {
            lineToX = child.x + child.gWidth;

            reductionOffsetParent = " l0,0 ";
            reductionOffsetChild = " l0,0 ";
            markerOffsetChild = lineToX + connectorOffset + "," + lineToY;
            q0 = moveToX + (lineToX - moveToX) / 2 / 1.5;
            q1 = moveToX + (lineToX - moveToX) / 2;
            q2 = moveToY + (lineToY - moveToY) / 2;
            d = `M${moveToX},${moveToY} l ${
              markerOffsetParent + reductionOffsetParent
            } Q${q0},${moveToY} ${q1},${q2}  T${markerOffsetChild} ${reductionOffsetChild} L${lineToX},${lineToY}`;
          }
        }

        /* */

        return d;
      }
    }
  }

  isOnDiagram(table) {
    return (
      table &&
      ((this.props.activeDiagramObject.main && table.visible) ||
        !this.props.activeDiagramObject.main)
    );
  }

  findOverlappingLinks(modelObjectDetails) {
    if (modelObjectDetails.objLinks.length > 1) {
      const result = modelObjectDetails.objLinks
        .filter((id) => !!modelObjectDetails.links[id])
        .map((id) => modelObjectDetails.links[id])
        .filter(
          (link) =>
            (link.parent === modelObjectDetails.link.parent &&
              link.child === modelObjectDetails.link.child) ||
            (link.parent === modelObjectDetails.link.child &&
              link.child === modelObjectDetails.link.parent)
        );

      return result.length > 1 ? result : [];
    }
    return [];
  }

  updateEndpointAxisValue(edgeDetails, newAxisValue, originalEndpoint) {
    if (
      edgeDetails.orientation === HORIZONTAL
        ? newAxisValue === originalEndpoint.x
        : newAxisValue === originalEndpoint.y
    ) {
      return originalEndpoint;
    }
    return {
      x:
        edgeDetails.orientation === HORIZONTAL
          ? newAxisValue
          : originalEndpoint.x,
      y:
        edgeDetails.orientation === VERTICAL ? newAxisValue : originalEndpoint.y
    };
  }

  getEndpointAxisValue(edgeDetails, originalEndpoint) {
    return edgeDetails.orientation === HORIZONTAL
      ? originalEndpoint.x
      : originalEndpoint.y;
  }

  getEndpointPosition(endpoint, edge, position, edgeDetails) {
    const endpointAxisValue = this.getEndpointAxisValue(edgeDetails, endpoint);

    const maximumAllowedSize = edge.max - edge.min - 2 * edgeDetails.step;
    const minAllowed = edge.min + edgeDetails.step;
    const maxAllowed = edge.max - edgeDetails.step;

    const landingSize = position.total * edgeDetails.step;
    const lowest = endpointAxisValue - landingSize / 2;
    const highest = endpointAxisValue + landingSize / 2;

    let outsideShapeCorrectionDelta = 0;

    if (landingSize > maximumAllowedSize) {
      const reducedToAllowedSizeDifference = Math.round(
        (position.current / position.total) * maximumAllowedSize
      );
      const newAxisValue =
        edge.min + reducedToAllowedSizeDifference + edgeDetails.step;
      return this.updateEndpointAxisValue(edgeDetails, newAxisValue, endpoint);
    } else if (lowest < minAllowed) {
      outsideShapeCorrectionDelta = Math.round(minAllowed - lowest);
    } else if (highest > maxAllowed) {
      outsideShapeCorrectionDelta = Math.round(maxAllowed - highest);
    }

    const positionDifference = Math.round(
      -(landingSize / 2) +
        (position.current / (position.total - 1)) * landingSize +
        outsideShapeCorrectionDelta
    );
    return this.updateEndpointAxisValue(
      edgeDetails,
      endpointAxisValue + positionDifference,
      endpoint
    );
  }

  getEdge(obj, edgeDetails) {
    const min = edgeDetails.orientation === HORIZONTAL ? obj.x : obj.y;
    const max =
      edgeDetails.orientation === HORIZONTAL
        ? obj.x + obj.gWidth
        : obj.y + obj.gHeight;
    return { min, max };
  }

  getLinkPosition(links, modelObjectDetails) {
    return links.reduce(
      (result, item, index) =>
        item.id === modelObjectDetails.link.id ? index : result,
      0
    );
  }

  updateOverlappingPosition(
    overlappingLinks,
    endpoint,
    modelObjectDetails,
    edgeDetails,
    reversed
  ) {
    if (endpoint) {
      const links =
        reversed === true
          ? Object.assign([], overlappingLinks).reverse()
          : overlappingLinks;
      const edge = this.getEdge(modelObjectDetails.obj, edgeDetails);
      const position = {
        current: this.getLinkPosition(links, modelObjectDetails),
        total: links.length
      };
      return this.getEndpointPosition(endpoint, edge, position, edgeDetails);
    }
    return endpoint;
  }

  updateMargin(endpoint, modelObjectDetails, edgeDetails) {
    if (endpoint) {
      const edge = this.getEdge(modelObjectDetails.obj, edgeDetails);
      const minWithMargin = edge.min + edgeDetails.step;
      const maxWithMargin = edge.max - edgeDetails.step;
      const endpointAxisValue = this.getEndpointAxisValue(
        edgeDetails,
        endpoint
      );

      if (minWithMargin > endpointAxisValue) {
        return this.updateEndpointAxisValue(
          edgeDetails,
          minWithMargin,
          endpoint
        );
      } else if (maxWithMargin < endpointAxisValue) {
        return this.updateEndpointAxisValue(
          edgeDetails,
          maxWithMargin,
          endpoint
        );
      }
    }
    return endpoint;
  }

  calculatePath(links, parent, child, link, linkListName) {
    const connectorOffset = 18;
    const step = 16;

    var moveToX;
    var moveToY;
    var lineToX;
    var lineToY;
    if (this.isOnDiagram(parent) && this.isOnDiagram(child)) {
      const parentModelObjectDetails = {
        links,
        link,
        obj: parent,
        objLinks: parent[linkListName]
      };
      const childModelObjectDetails = {
        links,
        link,
        obj: child,
        objLinks: child[linkListName]
      };
      const horizontalEdgeDetails = { step, orientation: HORIZONTAL };
      const verticalEdgeDetails = { step, orientation: VERTICAL };

      var pheight = parent.gHeight;
      var chheight = child.gHeight;

      moveToX = parent.x + parent.gWidth / 2;
      moveToY = parent.y + pheight / 2;
      lineToX = child.x + child.gWidth / 2;
      lineToY = child.y + chheight / 2;

      var parentCenter = { x: moveToX, y: moveToY };

      var parentLeftTop = { x: parent.x, y: parent.y };
      var parentLeftBottom = { x: parent.x, y: parent.y + pheight + 4 };

      var parentRightTop = { x: parent.x + parent.gWidth + 4, y: parent.y };
      var parentRightBottom = {
        x: parent.x + parent.gWidth + 4,
        y: parent.y + pheight + 4
      };

      var childCenter = { x: lineToX, y: lineToY };

      var childLeftTop = { x: child.x, y: child.y };
      var childLeftBottom = { x: child.x, y: child.y + chheight + 4 };

      var childRightTop = { x: child.x + child.gWidth + 4, y: child.y };
      var childRightBottom = {
        x: child.x + child.gWidth + 4,
        y: child.y + chheight + 4
      };

      var lnLeftP = [
        parentLeftTop,
        parentLeftBottom,
        parentCenter,
        childCenter
      ];

      var lnRightP = [
        parentRightTop,
        parentRightBottom,
        parentCenter,
        childCenter
      ];

      var lnTopP = [parentLeftTop, parentRightTop, parentCenter, childCenter];

      var lnBottomP = [
        parentLeftBottom,
        parentRightBottom,
        parentCenter,
        childCenter
      ];

      var lnLeftCh = [childLeftTop, childLeftBottom, parentCenter, childCenter];

      var lnRightCh = [
        childRightTop,
        childRightBottom,
        parentCenter,
        childCenter
      ];

      var lnTopCh = [childLeftTop, childRightTop, parentCenter, childCenter];

      var lnBottomCh = [
        childLeftBottom,
        childRightBottom,
        parentCenter,
        childCenter
      ];

      var pLeft = findSegmentIntersection(lnLeftP);
      var pRight = findSegmentIntersection(lnRightP);
      var pTop = findSegmentIntersection(lnTopP);
      var pBottom = findSegmentIntersection(lnBottomP);

      var markerOffset = "0," + connectorOffset;
      if (pLeft) {
        markerOffset = "-" + connectorOffset + ",0";
      }
      if (pRight) {
        markerOffset = connectorOffset + ",0";
      }
      if (pTop) {
        markerOffset = "0,-" + connectorOffset;
      }

      var chLeft = findSegmentIntersection(lnLeftCh);
      var chRight = findSegmentIntersection(lnRightCh);
      var chTop = findSegmentIntersection(lnTopCh);
      var chBottom = findSegmentIntersection(lnBottomCh);

      const overlappingLinks = this.findOverlappingLinks(
        parentModelObjectDetails
      );
      if (overlappingLinks.length > 0) {
        pLeft = this.updateOverlappingPosition(
          overlappingLinks,
          pLeft,
          parentModelObjectDetails,
          verticalEdgeDetails,
          false
        );
        pRight = this.updateOverlappingPosition(
          overlappingLinks,
          pRight,
          parentModelObjectDetails,
          verticalEdgeDetails,
          false
        );
        pTop = this.updateOverlappingPosition(
          overlappingLinks,
          pTop,
          parentModelObjectDetails,
          horizontalEdgeDetails,
          !!chRight && !!pTop
        );
        pBottom = this.updateOverlappingPosition(
          overlappingLinks,
          pBottom,
          parentModelObjectDetails,
          horizontalEdgeDetails,
          !!chLeft && !!pBottom
        );
        chLeft = this.updateOverlappingPosition(
          overlappingLinks,
          chLeft,
          childModelObjectDetails,
          verticalEdgeDetails,
          false
        );
        chRight = this.updateOverlappingPosition(
          overlappingLinks,
          chRight,
          childModelObjectDetails,
          verticalEdgeDetails,
          false
        );
        chTop = this.updateOverlappingPosition(
          overlappingLinks,
          chTop,
          childModelObjectDetails,
          horizontalEdgeDetails,
          !!pRight && !!chTop
        );
        chBottom = this.updateOverlappingPosition(
          overlappingLinks,
          chBottom,
          childModelObjectDetails,
          horizontalEdgeDetails,
          !!pLeft && !!chBottom
        );
      } else {
        pLeft = this.updateMargin(
          pLeft,
          parentModelObjectDetails,
          verticalEdgeDetails
        );
        pRight = this.updateMargin(
          pRight,
          parentModelObjectDetails,
          verticalEdgeDetails
        );
        pTop = this.updateMargin(
          pTop,
          parentModelObjectDetails,
          horizontalEdgeDetails
        );
        pBottom = this.updateMargin(
          pBottom,
          parentModelObjectDetails,
          horizontalEdgeDetails
        );
        chLeft = this.updateMargin(
          chLeft,
          childModelObjectDetails,
          verticalEdgeDetails
        );
        chRight = this.updateMargin(
          chRight,
          childModelObjectDetails,
          verticalEdgeDetails
        );
        chTop = this.updateMargin(
          chTop,
          childModelObjectDetails,
          horizontalEdgeDetails
        );
        chBottom = this.updateMargin(
          chBottom,
          childModelObjectDetails,
          horizontalEdgeDetails
        );
      }

      var markerOffsetChild = [0, connectorOffset];

      if (chLeft) {
        markerOffsetChild = [-connectorOffset, 0];
      }
      if (chRight) {
        markerOffsetChild = [connectorOffset, 0];
      }
      if (chTop) {
        markerOffsetChild = [0, -connectorOffset];
      }

      var parentIntersectionPointArray = [pLeft, pRight, pTop, pBottom];

      parentIntersectionPointArray = _.pull(
        parentIntersectionPointArray,
        false
      );

      var childIntersectionPointArray = [chLeft, chRight, chTop, chBottom];

      childIntersectionPointArray = _.pull(childIntersectionPointArray, false);

      var d = "";

      if (parentIntersectionPointArray[0] && childIntersectionPointArray[0]) {
        d =
          "M" +
          parentIntersectionPointArray[0].x +
          "," +
          parentIntersectionPointArray[0].y +
          " l" +
          markerOffset +
          " L" +
          (childIntersectionPointArray[0].x + markerOffsetChild[0]) +
          "," +
          (childIntersectionPointArray[0].y + markerOffsetChild[1]) +
          " L" +
          childIntersectionPointArray[0].x +
          "," +
          childIntersectionPointArray[0].y;
      }

      return d;
    }
  }

  calculateSelf(relation_id, parent) {
    if (parent) {
      var pheight = parent.gHeight;
      /*
      if (parent.resized === false) {
        var element = document.getElementById("t" + parent.id);
        var positionInfo = element.getBoundingClientRect();
        var pheight = positionInfo.height;
      }
      */

      if (this.isOnDiagram(parent)) {
        var startX = parent.x + parent.gWidth - 30;
        var startY = parent.y + pheight;

        var down1 = 20;
        var right1 = 50;
        var up1 = -50;
        var left1 = -20;
      }

      var d = "";

      d =
        "M" +
        startX +
        "," +
        startY +
        " l" +
        "0," +
        down1 +
        " l" +
        right1 +
        ",0" +
        " l" +
        "0," +
        up1 +
        " l" +
        left1 +
        ",0";

      return d;
    }
  }

  getObjectById(id) {
    let toReturn = this.props.tables[id];
    if (toReturn === undefined) toReturn = this.props.notes[id];
    if (toReturn === undefined) toReturn = this.props.otherObjects[id];
    if (toReturn === undefined) toReturn = this.props.relations[id];
    if (toReturn === undefined) toReturn = this.props.lines[id];
    return toReturn;
  }

  getModelObjectById(id) {
    let toReturn = this.props.allTables[id];
    if (toReturn === undefined) toReturn = this.props.allNotes[id];
    if (toReturn === undefined) toReturn = this.props.allOtherObjects[id];
    if (toReturn === undefined) toReturn = this.props.relations[id];
    if (toReturn === undefined) toReturn = this.props.lines[id];
    return toReturn;
  }

  fetchUnknownObjectById(id, object) {
    if (this.props.tables[id] !== undefined) {
      this.props.fetchTable(object);
    } else if (this.props.notes[id] !== undefined) {
      this.props.fetchNote(object);
    } else if (this.props.otherObjects[id] !== undefined) {
      this.props.fetchOtherObject(object);
    } else if (this.props.relations[id] !== undefined) {
      this.props.fetchRelation(object);
    } else if (this.props.lines[id] !== undefined) {
      this.props.fetchLine(object);
    }
  }

  renderLinesList() {
    return _.map(this.props.lines, (line) => {
      var parentTable = this.getObjectById(line.parent);
      var childTable = this.getObjectById(line.child);

      var path = "";
      if (parentTable && childTable) {
        if (parentTable.id === childTable.id) {
          path = this.calculateSelf(line.id, parentTable);
        } else {
          if (
            line.linegraphics === "default" ||
            line.linegraphics === undefined
          ) {
            if (
              this.props.activeDiagramObject &&
              this.props.activeDiagramObject.linegraphics === "basic"
            ) {
              path = this.calculatePath(
                this.props.lines,
                parentTable,
                childTable,
                line,
                "lines"
              );
            } else {
              path = this.calculatePathDetailed(
                line.id,
                parentTable,
                childTable,
                true
              );
            }
          } else if (line.linegraphics === "basic") {
            path = this.calculatePath(
              this.props.lines,
              parentTable,
              childTable,
              line,
              "lines"
            );
          } else if (line.linegraphics === "detailed") {
            path = this.calculatePathDetailed(
              line.id,
              parentTable,
              childTable,
              true
            );
          }
        }
        return <g key={line.id + "gg"}>{this.renderSingleLine(line, path)}</g>;
      }
    });
  }

  renderRelationsList(tables) {
    return _.map(this.props.relations, (relation) => {
      var parentTable = this.props.tables[relation.parent];
      var childTable = this.props.tables[relation.child];

      var path = "";
      if (parentTable && childTable) {
        if (parentTable.id === childTable.id) {
          path = this.calculateSelf(relation.id, parentTable);
        } else {
          if (
            this.props.activeDiagramObject &&
            this.props.activeDiagramObject.linegraphics === "basic"
          ) {
            path = this.calculatePath(
              this.props.relations,
              parentTable,
              childTable,
              relation,
              "relations"
            );
          } else {
            path = this.calculatePathDetailed(
              relation.id,
              parentTable,
              childTable,
              false
            );
          }
        }

        return (
          <g key={relation.id + "gg"} className="r">
            {this.renderSingleRelation(relation, path)}
          </g>
        );
      }
    });
  }

  renderOtherObjectContent(obj) {
    return (
      <div
        className="im-n-text im-other-object"
        style={{
          color: obj.color,
          background: obj.background
        }}
        id={"content" + obj.id}
      >
        <div
          className="im-other-object-type"
          style={{
            color: obj.color,
            background: obj.background
          }}
        >
          {obj.type}
        </div>
        {obj.name}
      </div>
    );
  }

  activeObjectIdByObjectType(objectType) {
    switch (objectType) {
      case NOTE:
        return this.props.match.params.nid;
      case OTHER_OBJECT:
        return this.props.match.params.oid;
      case TABLE:
        return this.props.match.params.id;
      case LINE:
        return this.props.match.params.lid;
      case RELATION:
        return this.props.match.params.rid;
      default: {
        return undefined;
      }
    }
  }

  isObjectSelected(id) {
    return _.find(this.props.selections, ["objectId", id]) !== undefined;
  }

  ctrlOrMetaClick(e) {
    return e.ctrlKey || e.metaKey;
  }

  handleStart(embeddable, objectType, id, e) {
    if (e) {
      if (this.isObjectSelected(id)) {
        if (this.ctrlOrMetaClick(e)) {
          this.props.removeFromSelection(id);
          this.props.setForcedRender({ domToModel: false });
          this.activateNextInSelection();
        } else {
          // don't deselect because it breaks drag of multiple objects
          // deselect will be called after mouse up, if there is no move
          //this.activateOnlyObject(objectType, id, embeddable);
        }
      } else {
        if (this.ctrlOrMetaClick(e)) {
          this.addToSelectionAndActivate(objectType, id, embeddable);
        } else {
          this.activateOnlyObject(objectType, id, embeddable);
        }
      }

      this.setState({
        moveBy: {
          startX: Math.round((e.clientX * 1) / this.props.zoom),
          startY: Math.round((e.clientY * 1) / this.props.zoom),
          endX: Math.round((e.clientX * 1) / this.props.zoom),
          endY: Math.round((e.clientY * 1) / this.props.zoom),
          initialized: true
        }
      });

      e.preventDefault();
      e.stopPropagation();
    }
  }

  activateOnlyObject(objectType, id, embeddable) {
    this.clearAddToSelectionAndActivate(objectType, id, embeddable);
  }

  addToSelectionAndActivate(objectType, id, embeddable) {
    this.props.addToSelection(objectType, id);
    navigateByObjectType(
      getHistoryContext(this.props.history, this.props.match),
      objectType,
      {
        id,
        embeddable
      }
    );
    this.props.setForcedRender({ domToModel: false });
  }

  async clearAddToSelectionAndActivate(objectType, id, embeddable) {
    await this.props.clearAddToSelection(objectType, id);
    navigateByObjectType(
      getHistoryContext(this.props.history, this.props.match),
      objectType,
      {
        id,
        embeddable
      }
    );
    this.props.setForcedRender({ domToModel: false });
  }

  activateNextInSelection() {
    var newToSelect = _.find(this.props.selections);
    if (newToSelect !== undefined) {
      navigateByObjectType(
        getHistoryContext(this.props.history, this.props.match),
        newToSelect.objectType,
        this.getObjectById(newToSelect.objectId)
      );
    } else {
      navigateToDiagramUrl(
        this.props.match.url,
        this.props.history,
        this.props.match.params.mid,
        this.props.match.params.did
      );
    }
  }

  async tableClick(table, e) {
    UIHelpers.setFocusToCanvasAndKeepScrollPosition(); // for copy
    this.resizeGraphics("content" + table.id);

    if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION ||
      this.props.currentDiagramAreaMode ===
        DiagramAreaMode.ADD_RELATION_BELONGS ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE ||
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS
    ) {
      await this.handleTableSecondClick(table);
      this.handleFirstClick(table);
    }
  }

  async objectClick(obj, objectType, e) {
    if (objectType === "table") {
      this.tableClick(obj, e);
      e.stopPropagation();
      return;
    }
    UIHelpers.setFocusToCanvasAndKeepScrollPosition(); // for copy
    this.resizeGraphics("content" + obj.id);
    if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE) {
      var relid = uuidv4();
      /* line rendering */

      if (this.props.relationClicks === 1) {
        await this.props.startTransaction(
          getHistoryContext(this.props.history, this.props.match),
          UndoRedoDef.DIAGRAM_TABLE_LIST__ADD_LINK
        );
        const newRelation = this.handleSecondClick(obj);

        var newLineObject = new ClassLine(
          relid,
          `${newRelation.sourceName}-${newRelation.targetName}`,
          newRelation.sourceId,
          newRelation.targetId
        );

        var sourceTable = _.cloneDeep(
          this.getModelObjectById(newRelation.sourceId)
        );

        var targetTable = _.cloneDeep(
          this.getModelObjectById(newRelation.targetId)
        );
        if (sourceTable.lines === undefined) {
          sourceTable.lines = [];
        }
        if (targetTable.lines === undefined) {
          targetTable.lines = [];
        }
        sourceTable.lines.push(relid);
        targetTable.lines.push(relid);
        this.fetchUnknownObjectById(newRelation.sourceId, sourceTable);
        this.fetchUnknownObjectById(newRelation.targetId, targetTable);
        await this.props.addLine(newLineObject);
        await this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
      } else {
        this.handleFirstClick(obj);
      }
    }
    e.stopPropagation();
  }

  objectDoubleClick(objectType) {
    switch (objectType) {
      case TABLE: {
        this.props.toggleTableModal();
        return;
      }
      case NOTE: {
        this.props.toggleNoteModal();
        return;
      }
      case OTHER_OBJECT: {
        this.props.toggleOtherObjectModal();
        return;
      }
      case RELATION: {
        this.props.toggleRelationModal();
        return;
      }
      case LINE: {
        this.props.toggleLineModal();
        return;
      }
      default: {
        return;
      }
    }
  }

  convertObjectTypeToDropDownMenu(objectType) {
    if (isPerseid(this.props.profile) && objectType === ObjectType.TABLE) {
      return DROPDOWN_MENU.COLUMN;
    } else if (
      _.includes(
        [ObjectType.TABLE, ObjectType.NOTE, ObjectType.OTHER_OBJECT],
        objectType
      )
    ) {
      return DROPDOWN_MENU.DIAGRAM_ITEM;
    } else if (
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
      return DROPDOWN_MENU.COLUMN;
    } else if (ObjectType.RELATION === objectType) {
      return DROPDOWN_MENU.RELATION;
    } else if (ObjectType.LINE === objectType) {
      return DROPDOWN_MENU.LINE;
    }
    return DROPDOWN_MENU.PROJECT;
  }

  isSelectable(objectType) {
    switch (objectType) {
      case ObjectType.TABLE:
      case ObjectType.OTHER_OBJECT:
      case ObjectType.NOTE:
        return true;
      default:
        return false;
    }
  }

  isInSelection(objectId) {
    return !!_.find(this.props.selections, ["objectId", objectId]);
  }

  activateDetail(contextMenuType, objectType, objectId) {
    if (contextMenuType === DROPDOWN_MENU.PROJECT) {
      navigateByObjectType(
        getHistoryContext(this.props.history, this.props.match),
        ObjectType.MODEL,
        undefined
      );
    } else if (contextMenuType !== DROPDOWN_MENU.COLUMN) {
      navigateByObjectType(
        getHistoryContext(this.props.history, this.props.match),
        objectType,
        objectId
      );
    }
  }

  navigateToRootObject(objectId) {
    let isEmbeddable = this.props.tables[objectId].embeddable;
    this.props.history.push(
      `/model/${this.props.match.params.mid}/diagram/${
        this.props.match.params.did
      }/${isEmbeddable ? "emb" : "item"}/${objectId}`
    );
  }

  changeSelectionForContextMenu(objectType, objectId) {
    if (isPerseid(this.props.profile) && objectType === ObjectType.TABLE) {
      this.navigateToRootObject(objectId);
    } else {
      if (this.isSelectable(objectType)) {
        if (!this.isInSelection(objectId)) {
          this.props.clearAddToSelection(objectType, objectId);
          this.props.setForcedRender({ domToModel: false });
        }
      } else {
        this.props.clearSelection();
        this.props.setForcedRender({ domToModel: false });
      }
    }
  }

  async objectContextMenu(objectType, obj, e) {
    var posX = e.clientX;
    var posY = e.clientY;
    e.stopPropagation();
    e.preventDefault();

    this.changeSelectionForContextMenu(objectType, obj.id);

    const contextMenuType = this.convertObjectTypeToDropDownMenu(objectType);
    this.activateDetail(contextMenuType, objectType, obj);

    await this.props.openDropDownMenu(
      contextMenuType,
      DROPDOWN_MENU_SOURCE.DIAGRAM,
      {
        x: posX,
        y: posY
      }
    );

    await this.rePositionDropDown(
      contextMenuType,
      UIHelpers.getDropDownElementId(contextMenuType),
      {
        x: posX,
        y: posY
      }
    );
  }

  rePositionDropDown(objectType, elementId, tempPosition) {
    let diagramElement = document.getElementById("diagram");
    if (diagramElement) {
      const boxDiagramElement = diagramElement.getBoundingClientRect();
      const body = document.body;

      const isOnBottomHalf =
        objectType !== undefined &&
        tempPosition.y > (boxDiagramElement.height + body.scrollTop) / 2;

      this.props.openDropDownMenu(objectType, DROPDOWN_MENU_SOURCE.DIAGRAM, {
        x: tempPosition.x,
        y:
          tempPosition.y -
          (isOnBottomHalf ? UIHelpers.returnDropDownHeight(elementId) : 0)
      });
    }
  }

  renderNoteContent(obj) {
    const className = `im-n-text ql-editor${
      obj.resized === false ? " im-n-text-nowrap" : ""
    }`;
    return (
      <div
        className={className}
        style={{
          color: obj.color,
          background: obj.background
        }}
        id={"dc" + obj.id}
        dangerouslySetInnerHTML={{ __html: obj.desc }}
      />
    );
  }

  renderObjects(objectList, activeObject, objectType, renderContent, style) {
    const visibleObjectList =
      this.props.activeDiagramObject && this.props.activeDiagramObject.main
        ? _.filter(objectList, ["visible", true])
        : objectList;

    return _.map(visibleObjectList, (obj) => {
      const prepareId = "content" + obj.id;
      let selClassName = this.props.selections[obj.id]
        ? style + " sel-item-diagram-multi"
        : style;

      if (activeObject === obj.id && _.size(this.props.selections) === 1) {
        selClassName += " sel-item-diagram";
      }

      const cssDimensions = obj.resized === false;

      return (
        <DiagramDraggable
          id={obj.id}
          objectType={objectType}
          embeddable={obj.embeddable}
          key={obj.id}
          x={obj.x}
          y={obj.y}
          width={"max-content"}
          height={"max-content"}
          onStart={this.handleStart}
          onMove={this.handleMove}
          onStop={this.handleStop}
          globalAction={this.state.pan.space}
        >
          <div
            style={{
              width: `${
                cssDimensions === true ? "max-content" : `${obj.gWidth}px`
              }`,
              height: `${
                cssDimensions === true ? "max-content" : `${obj.gHeight}px`
              }`
            }}
            onClick={this.objectClick.bind(this, obj, objectType)}
            onDoubleClick={this.objectDoubleClick.bind(this, objectType)}
            onContextMenu={this.objectContextMenu.bind(this, objectType, obj)}
            className={selClassName}
            id={prepareId}
            data-testid={obj.name}
          >
            {renderContent(obj)}
          </div>
        </DiagramDraggable>
      );
    });
  }

  handleFirstClick(object) {
    if (this.props.relationClicks === 0) {
      this.props.setRelationClicks(1);
      this.setState({ relClicks: 1 }, () => {
        if (
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION ||
          this.props.currentDiagramAreaMode ===
            DiagramAreaMode.ADD_IMPLEMENTS ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE
        ) {
          this.setState({
            newRelation: {
              sourceId: object.id,
              sourceName: object.name
            }
          });
        } else {
          this.setState({
            newRelation: {
              targetId: object.id,
              targetName: object.name
            }
          });
        }
      });
    }
  }

  async handleTableSecondClick(table) {
    if (this.props.relationClicks === 1) {
      const sourceTable = this.props.tables[this.state.newRelation.sourceId];
      if (
        isGraphQLNotAllowed(
          this.props.type,
          this.props.relations,
          table,
          sourceTable,
          this.props.currentDiagramAreaMode
        )
      ) {
        this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
        return;
      }

      if (
        this.props.currentDiagramAreaMode !== DiagramAreaMode.ADD_LINE &&
        (this.props.type === "PG" ||
          this.props.type === ModelTypes.MARIADB ||
          this.props.type === ModelTypes.MYSQL ||
          this.props.type === "SQLITE" ||
          this.props.type === "LOGICAL" ||
          this.props.type === "MONGODB") &&
        this.props.tables[this.state.newRelation.sourceId].embeddable === true
      ) {
        this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
        return;
      }

      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.DIAGRAM_TABLE_LIST__ADD_LINK
      );
      var targetIdTemp = { ...this.state.newRelation }; // diff object

      if (
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION ||
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS ||
        this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE
      ) {
        targetIdTemp.targetId = table.id;
        targetIdTemp.targetName = table.name;
      } else {
        targetIdTemp.sourceId = table.id;
        targetIdTemp.sourceName = table.name;
      }

      this.setState({ newRelation: targetIdTemp }, () => {
        var relid = uuidv4();
        this.props.setRelationClicks(0);
        this.setState({ relClicks: 0 }, async () => {
          this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
          if (
            (this.props.currentDiagramAreaMode ===
              DiagramAreaMode.ADD_RELATION ||
              this.props.currentDiagramAreaMode ===
                DiagramAreaMode.ADD_IMPLEMENTS ||
              this.props.currentDiagramAreaMode ===
                DiagramAreaMode.ADD_RELATION_BELONGS) &&
            this.relationChecker.allowedRelationTarget(
              this.state.newRelation,
              this.props.type,
              this.props.tables
            )
          ) {
            await this.createRelation(relid);
          }
          if (this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE) {
            await this.createLine(relid);
          }
          await this.props.finishTransaction();
        });
      });
    }
  }

  createNewColumn(
    sourceTable,
    targetTable,
    parentTableKeyCol,
    newRelationObject
  ) {
    const colToAdd = _.cloneDeep(
      _.find(sourceTable.cols, ["id", parentTableKeyCol.colid])
    );
    if (colToAdd !== undefined) {
      var parentId = colToAdd.id;
      colToAdd.pk = false;
      colToAdd.fk = true;
      colToAdd.id = uuidv4();
      if (colToAdd.autoinc && colToAdd.autoinc !== undefined) {
        colToAdd.autoinc = false;
      }
      colToAdd.ref = sourceTable.name;
      if (this.props.parentTableInFkCols === true) {
        if (this.props.caseConvention === "under") {
          colToAdd.name = sourceTable.name + "_" + colToAdd.name;
        } else {
          colToAdd.name = sourceTable.name + _.upperFirst(colToAdd.name);
        }
      }
      if (this.props.type === "MONGODB" || this.props.type === "MONGOOSE") {
        colToAdd.name = sourceTable.name;
      }
      updatePgTargetColumn(this.props.type, colToAdd);
      updateGraphQLTargetColumn(
        this.props.type,
        newRelationObject,
        colToAdd,
        sourceTable,
        targetTable
      );

      if (colToAdd.isHidden !== true) {
        targetTable.cols = [...targetTable.cols, colToAdd];

        newRelationObject.cols = [
          ...newRelationObject.cols,
          {
            id: uuidv4(),
            parentcol: parentId,
            childcol: colToAdd.id
          }
        ];
      }
    }
    return colToAdd;
  }

  mapExistingColumn(parentColumn, targetTable, newRelationObject) {
    const existingColumn = this.getSameColumnInChild(parentColumn, targetTable);
    newRelationObject.cols = [
      ...newRelationObject.cols,
      {
        id: uuidv4(),
        parentcol: parentColumn.id,
        childcol: existingColumn.id
      }
    ];
  }

  getSameColumnInChild(parentColumn, targetTable) {
    return _.find(
      targetTable.cols,
      (col) =>
        col.isHidden === false &&
        parentColumn.name === col.name &&
        parentColumn.datatype === col.datatype &&
        parentColumn.list === col.list &&
        parentColumn.nn === col.nn
    );
  }

  isGraphQL() {
    return this.props.type === ModelTypes.GRAPHQL;
  }

  needNewColumn(parentColumn, targetTable) {
    return (
      !this.isGraphQL() ||
      (this.isGraphQL() &&
        !this.getSameColumnInChild(parentColumn, targetTable))
    );
  }

  forwardKey(sourceTable, targetTable, parentTableKey, newRelationObject) {
    const newColumns = [];
    for (let parentTableKeyCol of parentTableKey.cols) {
      const parentColumn = _.find(
        sourceTable.cols,
        (col) => col.id === parentTableKeyCol.colid
      );
      if (this.needNewColumn(parentColumn, targetTable)) {
        const column = this.createNewColumn(
          sourceTable,
          targetTable,
          parentTableKeyCol,
          newRelationObject
        );
        if (column) {
          newColumns.push({
            column,
            sourceTable,
            targetTable,
            newRelationObject
          });
        }
      } else {
        this.mapExistingColumn(parentColumn, targetTable, newRelationObject);
      }
    }
    return newColumns;
  }

  getIdentifyingKey() {
    const sourceTable = this.props.tables[this.state.newRelation.sourceId];
    const sourceTableKeys = sourceTable.keys;
    return _.find(sourceTableKeys, ["isPk", true]);
  }

  getRelationKey() {
    const sourceTable = this.props.tables[this.state.newRelation.sourceId];
    switch (this.props.type) {
      case ModelTypes.GRAPHQL:
        return getGraphQLKey(
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS,
          sourceTable
        );
      default:
        return this.getIdentifyingKey();
    }
  }

  getSourceTable(relid) {
    const sourceTable = _.cloneDeep(
      this.props.allTables[this.state.newRelation.sourceId]
    );
    sourceTable.relations.push(relid);
    return sourceTable;
  }

  getTargetTable(relid) {
    const targetTable = _.cloneDeep(
      this.props.allTables[this.state.newRelation.targetId]
    );
    targetTable.relations.push(relid);
    return targetTable;
  }

  createIdentifyingKey() {
    const sourceTable = this.props.tables[this.state.newRelation.sourceId];
    return {
      id: uuidv4(),
      name: "Identifier",
      isPk: true,
      using: "na",
      cols: sourceTable.cols.map((col) => ({ id: uuidv4(), colid: col.id }))
    };
  }

  createRelationKey() {
    switch (this.props.type) {
      case ModelTypes.GRAPHQL:
        const sourceTable = this.props.tables[this.state.newRelation.sourceId];
        return createGraphQLRelationKey(
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS,
          sourceTable
        );
      default:
        return this.createIdentifyingKey();
    }
  }

  async updateColumnsAfterRelationAdded(newColumns) {
    switch (this.props.type) {
      case ModelTypes.GRAPHQL: {
        await this.props.graphQLUpdateColumnsAfterRelationAdded(newColumns);
        return;
      }
      case ModelTypes.PG: {
        return;
      }
    }
  }

  async createRelation(relid) {
    const sourceTable = this.getSourceTable(relid);
    const targetTable = this.getTargetTable(relid);
    let relationKey = this.getRelationKey();
    if (!relationKey) {
      relationKey = this.createRelationKey();
      sourceTable.keys.push(relationKey);
    }
    const newRelationObject = this.createRelationObject(
      relid,
      relationKey,
      targetTable
    );

    const newColumns = this.forwardKey(
      sourceTable,
      sourceTable.id === targetTable.id ? sourceTable : targetTable,
      relationKey,
      newRelationObject
    );

    if (
      this.props.type === ModelTypes.PG &&
      this.props.nameAutoGeneration.relations
    ) {
      newRelationObject.name = PGHelpers.makeRelationName(
        newRelationObject,
        { [targetTable.id]: targetTable },
        { ...this.props.relations, [newRelationObject.id]: newRelationObject }
      );
    }

    await this.props.fetchTable(sourceTable);
    if (sourceTable.id !== targetTable.id) {
      await this.props.fetchTable(targetTable);
    }
    await this.props.addRelation(newRelationObject);

    await this.updateColumnsAfterRelationAdded(newColumns);
    getCurrentHistoryTransaction().addResizeRequest({
      operation: "addNewColumnToTargetTable",
      domToModel: true,
      autoExpand: true,
      objects: [targetTable.id]
    });
  }

  async createLine(relid) {
    var newLineObject = new ClassLine(
      relid,
      this.state.newRelation.sourceName +
        "-" +
        this.state.newRelation.targetName,
      this.state.newRelation.sourceId,
      this.state.newRelation.targetId
    );

    let sourceTable = _.cloneDeep(
      this.getModelObjectById(this.state.newRelation.sourceId)
    );
    let targetTable = _.cloneDeep(
      this.getModelObjectById(this.state.newRelation.targetId)
    );
    if (sourceTable.lines === undefined) {
      sourceTable.lines = [];
    }
    if (targetTable.lines === undefined) {
      targetTable.lines = [];
    }
    sourceTable.lines.push(relid);
    targetTable.lines.push(relid);
    this.fetchUnknownObjectById(this.state.newRelation.sourceId, sourceTable);
    this.fetchUnknownObjectById(this.state.newRelation.targetId, targetTable);
    await this.props.addLine(newLineObject, true);
  }

  createRelationObject(relid, parentTableKey, targetTable) {
    const isImplements =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS;
    switch (this.props.type) {
      case ModelTypes.SEQUELIZE:
        return this.createSequelizeRelationObject(relid, parentTableKey);
      case ModelTypes.GRAPHQL:
        return createGraphQLRelationObject(
          this.state,
          isImplements,
          relid,
          parentTableKey,
          targetTable
        );

      default:
        return this.createDefaultRelationObject(relid, parentTableKey);
    }
  }

  createDefaultRelationObject(relid, parentTableKey) {
    const name =
      this.state.newRelation.sourceName +
      "_" +
      this.state.newRelation.targetName;
    return new ClassRelation(
      relid,
      name,
      parentTableKey.id,
      this.state.newRelation.sourceId,
      this.state.newRelation.targetId,
      []
    );
  }

  createSequelizeRelationObject(relid, parentTableKey) {
    var relOrmBelongsTo = "na";
    var relOrmHasOne = "hasOne";
    if (
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION_BELONGS
    ) {
      relOrmBelongsTo = "belongsTo";
      relOrmHasOne = "na";
    }

    return new ClassRelationSequelize(
      relid,
      this.state.newRelation.sourceName +
        "_" +
        this.state.newRelation.targetName,
      parentTableKey.id,
      this.state.newRelation.sourceId,
      this.state.newRelation.targetId,
      [],
      relOrmBelongsTo,
      relOrmHasOne
    );
  }

  handleSecondClick(object) {
    this.props.setRelationClicks(0);
    return {
      sourceId: this.state.newRelation.sourceId,
      sourceName: this.state.newRelation.sourceName,
      targetId: object.id,
      targetName: object.name
    };
  }

  renderItemContent(table) {
    return (
      <>
        <div
          className="dGraphicsHeader"
          style={{ background: table.background }}
        >
          <div className="dGraphicsLeftTop">
            {this.getTableTypeGraphicsLeft(table)}
          </div>

          <div
            className={
              table.color === "#ffffff" ? "dTableName" : "dTableNameLight"
            }
            style={{ color: table.color }}
          >
            {this.props.schemaContainerIsDisplayed &&
              this.showSchemaContainer(table)}
            {table.name}
            {this.props.estimatedSizeIsDisplayed &&
              table.estimatedSize.length > 0 && (
                <span className="im-mini"> [{table.estimatedSize}]</span>
              )}
          </div>

          <div
            className="dGraphicsRightTop im-pointer"
            onClick={this.objectContextMenu.bind(this, "table", table)}
          >
            {
              <i
                style={{ color: table.color }}
                className="im-pointer im-icon-DotsHorizontal16 im-icon-12"
              />
            }
          </div>
        </div>

        {this.getTableContent(table, this.props.currentDisplayMode)}
      </>
    );
  }

  getTableContent(table, displayMode) {
    const style = table.resized
      ? "dCols dCols-desc dCols-desc-nowrap"
      : "dCols dCols-desc";
    switch (displayMode) {
      case "description":
        return (
          <div className={style} id={"dc" + table.id}>
            <pre>{table.desc}</pre>
          </div>
        );

      case "indexes":
        return (
          <div className="dCols" id={"dc" + table.id}>
            {this.getTableIndexes(table)}
          </div>
        );
      case "data":
      case "metadata":
      default:
        return (
          <div className="dCols" id={"dc" + table.id}>
            {this.getTableCols(table.id, table)}
          </div>
        );
    }
  }

  getTableTypeGraphicsLeft(table) {
    if (table.embeddable === true) {
      return (
        <i className="im-icon-12 im-icon-Type" style={{ color: table.color }} />
      );
    } else {
      if (table.objectType && table.objectType === "type") {
        return (
          <i
            className="im-icon-12 im-icon-Table"
            style={{ color: table.color }}
          />
        );
      } else if (table.objectType && table.objectType === "interface") {
        return (
          <i
            className="im-icon-12 im-icon-Interface"
            style={{ color: table.color }}
          />
        );
      } else if (table.objectType && table.objectType === "union") {
        return (
          <i
            className="im-icon-12 im-icon-Union"
            style={{ color: table.color }}
          />
        );
      } else if (table.objectType && table.objectType === "input") {
        return (
          <i
            className="im-icon-12 im-icon-Type"
            style={{ color: table.color }}
          />
        );
      } else if (table.objectType && table.objectType === "composite") {
        return (
          <i
            className="im-icon-12 im-icon-Composite"
            style={{ color: table.color }}
          />
        );
      } else {
        return (
          <i
            className="im-icon-12 im-icon-Type"
            style={{ color: table.background }}
          />
        );
      }
    }
  }

  renderColorizedMarkers() {
    var usedLineColorsArray = [];
    _.map(this.props.lines, (line) => {
      usedLineColorsArray.push(line.lineColor);
    });
    let uniqueUsedLineColorsArray = _.uniq(usedLineColorsArray);

    return _.map(uniqueUsedLineColorsArray, (lineColor) => {
      if (lineColor !== "transparent") {
        return (
          <defs key={"marker" + lineColor.replace("#", "")}>
            <marker
              id={"none" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            />
            <marker
              id={"circleStart" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <g>
                <circle
                  cx="5"
                  cy="5"
                  r="5"
                  stroke={lineColor}
                  strokeWidth="1"
                  fill={lineColor}
                />
              </g>
            </marker>
            <marker
              id={"circleEnd" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <g>
                <circle
                  cx="5"
                  cy="5"
                  r="5"
                  stroke={lineColor}
                  strokeWidth="1"
                  fill={lineColor}
                />
              </g>
            </marker>
            <marker
              id={"arrowEnd" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 " stroke={lineColor} />
            </marker>
            <marker
              id={"arrowStart" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path d="M 10 0 L 0 5 L 10 10 " stroke={lineColor} />
            </marker>
            <marker
              id={"arrowClosedStart" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <polygon
                points="10 0, 10 10, 0 5, 10 0"
                stroke={lineColor}
                fill={lineColor}
              />
            </marker>
            <marker
              id={"arrowClosedEnd" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <polygon
                points="0 0, 10 5, 0 10, 0 0"
                stroke={lineColor}
                fill={lineColor}
              />
            </marker>
            <marker
              id={"arrowReversedClosedStart" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <polygon
                points="0 0, 10 5, 0 10, 0 0"
                stroke={lineColor}
                fill={lineColor}
              />
            </marker>
            <marker
              id={"arrowReversedClosedEnd" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <polygon
                points="10 0, 10 10, 0 5, 10 0"
                stroke={lineColor}
                fill={lineColor}
              />
            </marker>
            <marker
              id={"diamondStart" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <polygon
                points="0 5, 5 0, 10 5, 5 10, 0 5"
                stroke={lineColor}
                fill={lineColor}
              />
            </marker>
            <marker
              id={"diamondEnd" + lineColor.replace("#", "")}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <polygon
                points="0 5, 5 0, 10 5, 5 10, 0 5"
                stroke={lineColor}
                fill={lineColor}
              />
            </marker>
          </defs>
        );
      }
    });
  }

  diagramClick(e) {
    this.handleDiagramAreaClick(e);
    e.preventDefault();
  }

  renderDefs() {
    var lineColor = this.props.activeDiagramObject
      ? this.props.activeDiagramObject.lineColor
      : "transparent";
    if (
      this.props.activeDiagramObject &&
      (this.props.activeDiagramObject.lineColor === "transparent" ||
        this.props.activeDiagramObject.lineColor === undefined)
    ) {
      if (this.props.settings.theme === "im-dark") {
        lineColor = "#eee";
      } else {
        lineColor = "#000";
      }
    }
    return (
      <defs>
        <marker
          id="arrowEndtransparent"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 " stroke={lineColor} />
        </marker>
        <marker
          id="arrowStarttransparent"
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 10 0 L 0 5 L 10 10 " stroke={lineColor} />
        </marker>

        <marker
          id={"arrowClosedStarttransparent"}
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <polygon
            points="10 0, 10 10, 0 5, 10 0"
            stroke={lineColor}
            fill={lineColor}
          />
        </marker>
        <marker
          id={"arrowClosedEndtransparent"}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <polygon
            points="0 0, 10 5, 0 10, 0 0"
            stroke={lineColor}
            fill={lineColor}
          />
        </marker>
        <marker
          id={"arrowReversedClosedStarttransparent"}
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <polygon
            points="0 0, 10 5, 0 10, 0 0"
            stroke={lineColor}
            fill={lineColor}
          />
        </marker>
        <marker
          id={"arrowReversedClosedEndtransparent"}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <polygon
            points="10 0, 10 10, 0 5, 10 0"
            stroke={lineColor}
            fill={lineColor}
          />
        </marker>
        <marker
          id={"diamondStarttransparent"}
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <polygon
            points="0 5, 5 0, 10 5, 5 10, 0 5"
            stroke={lineColor}
            fill={lineColor}
          />
        </marker>
        <marker
          id={"diamondEndtransparent"}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <polygon
            points="0 5, 5 0, 10 5, 5 10, 0 5"
            stroke={lineColor}
            fill={lineColor}
          />
        </marker>

        <marker
          id={"circleStarttransparent"}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <g>
            <circle
              cx="5"
              cy="5"
              r="5"
              stroke={lineColor}
              strokeWidth="1"
              fill={lineColor}
            />
          </g>
        </marker>
        <marker
          id={"circleEndtransparent"}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <g>
            <circle
              cx="5"
              cy="5"
              r="5"
              stroke={lineColor}
              strokeWidth="1"
              fill={lineColor}
            />
          </g>
        </marker>

        <marker
          id="cardinality-parent-mandatory-one"
          viewBox="0 0 30 30"
          refX="0"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <path d="M12.5,7.5l-12,0" stroke={lineColor} />
          <path d="M8.5,1.5l0,12" stroke={lineColor} />
          <path d="M12.5,1.5l0,12" stroke={lineColor} />
        </marker>
        <marker
          id="cardinality-parent-mandatory-many"
          viewBox="0 0 30 30"
          refX="0"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <path d="M0.5,0.5l12,7l-12,7" stroke={lineColor} />
          <path d="M12.5,7.5l-12,0" stroke={lineColor} />
          <path d="M12.5,1.5l0,12" stroke={lineColor} />
        </marker>
        <marker
          id="cardinality-parent-mandatory-zillion"
          viewBox="0 0 30 30"
          refX="0"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <path d="M0.5,0.5l12,7l-12,7" stroke={lineColor} />
          <path d="M0.5,4l12,3.5l-12,3.5" stroke={lineColor} />
          <path d="M12.5,7.5l-12,0" stroke={lineColor} />
          <path d="M12.5,1.5l0,12" stroke={lineColor} />
        </marker>

        <marker
          id="cardinality-parent-optional-one"
          viewBox="0 0 30 30"
          refX="0"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <circle
            cx="18.5"
            cy="7.5"
            r="4"
            stroke={lineColor}
            className="relationCardinality"
          />
          <path d="M12.5,7.5l-12,0" stroke={lineColor} />
          <path d="M8.5,1.5l0,12" stroke={lineColor} />
        </marker>
        <marker
          id="cardinality-parent-optional-many"
          viewBox="0 0 30 30"
          refX="0"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <circle
            cx="18.5"
            cy="7.5"
            r="4"
            stroke={lineColor}
            className="relationCardinality"
          />
          <path d="M0.5,0.5l12,7l-12,7" stroke={lineColor} />
          <path d="M12.5,7.5l-12,0" stroke={lineColor} />
        </marker>
        <marker
          id="cardinality-parent-optional-zillion"
          viewBox="0 0 30 30"
          refX="0"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <circle
            cx="18.5"
            cy="7.5"
            r="4"
            stroke={lineColor}
            className="relationCardinality"
          />
          <path d="M0.5,0.5l12,7l-12,7" stroke={lineColor} />
          <path d="M0.5,4l12,3.5l-12,3.5" stroke={lineColor} />
          <path d="M12.5,7.5l-12,0" stroke={lineColor} />
        </marker>

        <marker
          id="cardinality-child-mandatory-one"
          viewBox="0 0 30 30"
          refX="30"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <path d="M17.5,7.5l12,0" stroke={lineColor} />
          <path d="M21.5,1.5l0,12" stroke={lineColor} />
          <path d="M17.5,1.5l0,12" stroke={lineColor} />
        </marker>
        <marker
          id="cardinality-child-mandatory-many"
          viewBox="0 0 30 30"
          refX="30"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <path d="M29.5,0.5l-12,7l12,7" stroke={lineColor} />
          <path d="M17.5,7.5l12,0" stroke={lineColor} />
          <path d="M17.5,1.5l0,12" stroke={lineColor} />
        </marker>

        <marker
          id="cardinality-child-mandatory-zillion"
          viewBox="0 0 30 30"
          refX="30"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <path d="M29.5,0.5l-12,7l12,7" stroke={lineColor} />
          <path d="M29.5,4l-12,3.5l12,3.5" stroke={lineColor} />
          <path d="M17.5,7.5l12,0" stroke={lineColor} />
          <path d="M17.5,1.5l0,12" stroke={lineColor} />
        </marker>

        <marker
          id="cardinality-child-optional-one"
          viewBox="0 0 30 30"
          refX="30"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <circle
            cx="11.5"
            cy="7.5"
            r="4"
            stroke={lineColor}
            className="relationCardinality"
          />
          <path d="M17.5,7.5l12,0" stroke={lineColor} />
          <path d="M21.5,1.5l0,12" stroke={lineColor} />
        </marker>

        <marker
          id="cardinality-child-optional-many"
          viewBox="0 0 30 30"
          refX="30"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <circle
            cx="11.5"
            cy="7.5"
            r="4"
            stroke={lineColor}
            className="relationCardinality"
          />
          <path d="M29.5,0.5l-12,7l12,7" stroke={lineColor} />
          <path d="M17.5,7.5l12,0" stroke={lineColor} />
        </marker>

        <marker
          id="cardinality-child-optional-zillion"
          viewBox="0 0 30 30"
          refX="30"
          refY="7.5"
          orient="auto"
          markerWidth="30"
          markerHeight="30"
        >
          <circle
            cx="11.5"
            cy="7.5"
            r="4"
            stroke={lineColor}
            className="relationCardinality"
          />
          <path d="M29.5,0.5l-12,7l12,7" stroke={lineColor} />
          <path d="M29.5,4l-12,3.5l12,3.5" stroke={lineColor} />
          <path d="M17.5,7.5l12,0" stroke={lineColor} />
        </marker>
      </defs>
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

  renderDiagram() {
    var classToUse = "im-full-width im-" + this.props.currentDiagramAreaMode;

    return (
      <div
        id="mainHtmlCanvas"
        style={{
          transform: `scale(${this.props.zoom})`,
          background: this.props.activeDiagramObject
            ? this.props.activeDiagramObject.background
            : "#03a9f4"
        }}
        onClick={this.diagramClick}
        onContextMenu={this.objectContextMenu.bind(
          this,
          DROPDOWN_MENU.PROJECT,
          this.props.diagrams[this.props.match.params.did]
        )}
        className={classToUse}
      >
        <SelectDecorator
          id="selector"
          dimensions={this.state.selectionAreaDecoratorPosition}
        />
        {this.renderObjects(
          this.props.tables,
          this.props.match.params.id,
          TABLE,
          this.renderItemContent,
          `t `
        )}
        {this.renderObjects(
          this.props.notes,
          this.props.match.params.nid,
          NOTE,
          this.renderNoteContent,
          `im-n `
        )}
        {this.renderObjects(
          this.props.otherObjects,
          this.props.match.params.oid,
          OTHER_OBJECT,
          this.renderOtherObjectContent,
          `im-n `
        )}

        <svg
          id="svgMain"
          style={{
            background: this.props.activeDiagramObject
              ? this.props.activeDiagramObject.background
              : "#03a9f4",
            width: `${this.nw}px`,
            height: `${this.nh}px`
          }}
        >
          {this.renderColorizedMarkers()}
          {this.renderDefs()}
          {UIHelpers.renderWatermark(
            this.props.profile.licInfo.key,
            this.props.appName
          )}
          <g>{this.renderRelationsList()}</g>
          <g>{this.renderLinesList()}</g>
        </svg>
      </div>
    );
  }

  render() {
    return (
      <div id="canvas" tabIndex={50} style={{ background: "transparent" }}>
        {this.renderDiagram()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state),
    activeDiagramItems: getActiveDiagramItems(state),
    allTables: state.tables,
    allOtherObjects: state.otherObjects,
    allNotes: state.notes,
    relations: state.relations,
    lines: state.lines,
    selections: state.selections,
    objectsCopyList: state.objectsCopyList,
    embeddedInParentsIsDisplayed: state.model.embeddedInParentsIsDisplayed,
    customDataTypes: state.model.customDataTypes,
    estimatedSizeIsDisplayed: state.model.estimatedSizeIsDisplayed,
    def_freezeTableName: state.model.def_freezeTableName,
    def_timestamps: state.model.def_timestamps,
    def_paranoid: state.model.def_paranoid,
    def_version: state.model.def_version,
    def_collation: state.model.def_collation,
    def_charset: state.model.def_charset,
    pg: state.model.pg,
    def_coltopk: state.model.def_coltopk,
    schemaContainerIsDisplayed: state.model.schemaContainerIsDisplayed,
    def_others: state.model.def_others,
    def_validationLevel: state.model.def_validationLevel,
    def_validationAction: state.model.def_validationAction,
    def_tabletype: state.model.def_tabletype,
    def_rowformat: state.model.def_rowformat,
    def_database: state.model.def_database,
    type: state.model.type,
    nameAutoGeneration: state.model.nameAutoGeneration,
    localization: state.localization,
    settings: state.settings,
    profile: state.profile,
    diagrams: state.diagrams,
    colHeight: state.ui.colHeight,
    zoom: state.ui.zoom,
    forcedRender: state.ui.forcedRender,
    tableModalIsDisplayed: state.ui.tableModalIsDisplayed,
    columnModalIsDisplayed: state.ui.columnModalIsDisplayed,
    noteModalIsDisplayed: state.ui.noteModalIsDisplayed,
    otherObjectModalIsDisplayed: state.ui.otherObjectModalIsDisplayed,
    relationModalIsDisplayed: state.ui.relationModalIsDisplayed,
    indexAssistantModalIsDisplayed: state.ui.indexAssistantModalIsDisplayed,
    sqlModalIsDisplayed: state.ui.sqlModalIsDisplayed,
    feedbackModalIsDisplayed: state.ui.feedbackModalIsDisplayed,
    diagramItemsModalIsDisplayed: state.ui.diagramItemsModalIsDisplayed,
    orderItemsModalIsDisplayed: state.ui.orderItemsModalIsDisplayed,
    addDiagramsByContainersModalIsDisplayed:
      state.ui.addDiagramsByContainersModalIsDisplayed,
    newModelModalIsDisplayed: state.ui.newModelModalIsDisplayed,
    modelModalIsDisplayed: state.ui.modelModalIsDisplayed,
    tipsModalIsDisplayed: state.ui.tipsModalIsDisplayed,
    currentDisplayMode: state.ui.currentDisplayMode,
    relationClicks: state.ui.relationClicks,
    cardinalityIsDisplayed: state.model.cardinalityIsDisplayed,
    parentTableInFkCols: state.model.parentTableInFkCols,
    caseConvention: state.model.caseConvention,
    currentDiagramAreaMode: state.ui.currentDiagramAreaMode,
    changeScroll: state.ui.changeScroll,
    tables: getActiveDiagramTables(state),
    notes: getActiveDiagramNotes(state),
    otherObjects: getActiveDiagramOtherObjects(state),
    appName: state.profile.appInfo.appName,
    textEditorModalIsDisplayed: state.ui.textEditorModalIsDisplayed,
    catalogColumns: state.catalogColumns.colToTable,
    strictJsonFormat: state.model?.jsonCodeSettings?.strict,
    showLocallyReferenced: state.model?.showLocallyReferenced
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openDropDownMenu: openDropDownMenu,
        fetchTable: fetchTable,
        fetchRelation: fetchRelation,
        addRelation: addRelation,
        addLine: addLine,
        toggleTableModal: toggleTableModal,
        toggleRelationModal: toggleRelationModal,
        setDiagramAreaMode: setDiagramAreaMode,
        toggleConfirmDelete: toggleConfirmDelete,
        toggleConfirmDeleteRelation: toggleConfirmDeleteRelation,
        toggleConfirmDeleteLine: toggleConfirmDeleteLine,
        addToSelection: addToSelection,
        removeFromSelection: removeFromSelection,
        clearSelection: clearSelection,
        addVisibleObjectsToSelection: addVisibleObjectsToSelection,
        copySelectedTables: copySelectedTables,
        setObjectsCopyList: setObjectsCopyList,
        fetchNote: fetchNote,
        fetchOtherObject: fetchOtherObject,
        updateOtherObjectProperty: updateOtherObjectProperty,
        toggleOtherObjectModal: toggleOtherObjectModal,
        updateNoteProperty: updateNoteProperty,
        toggleNoteModal: toggleNoteModal,
        setRelationClicks: setRelationClicks,
        setColHeight: setColHeight,
        toggleLineModal: toggleLineModal,
        setZoom: setZoom,
        toggleFeedbackModal: toggleFeedbackModal,
        toggleSqlModal: toggleSqlModal,
        updateDiagramItemProperties: updateDiagramItemProperties,
        addTableWithDiagramItem: addTableWithDiagramItem,
        addNoteWithDiagramItem: addNoteWithDiagramItem,
        addOtherObjectWithDiagramItem: addOtherObjectWithDiagramItem,
        toggleDiagramItemsModal: toggleDiagramItemsModal,
        toggleAddDiagramsByContainersModal: toggleAddDiagramsByContainersModal,
        updateAllTableSizesFromDom: updateAllTableSizesFromDom,
        toggleIndexAssistantModal: toggleIndexAssistantModal,
        graphQLUpdateColumnsAfterRelationAdded,
        finishTransaction,
        startTransaction,
        clearAddToSelection,
        clearAddMultipleToSelection,
        setForcedRender,
        clearChangeScroll,
        wheelZoom,
        selectObjectsInSelectionBox,
        toggleTextEditorModal
      },

      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiagramTableList)
);
