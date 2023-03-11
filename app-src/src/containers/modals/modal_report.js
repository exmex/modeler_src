import React, { Component } from "react";
import { TEST_ID, getAppTitle } from "common";
import {
  getActiveDiagramItems,
  getActiveDiagramObject
} from "../../selectors/selector_diagram";
import {
  getDiagramForReport,
  getLineDetailForReport,
  getNoteDetailForReport,
  getOtherDetailForReport,
  getProjectForReport
} from "../../reports/report_all_platforms";
import {
  getGraphQlImplementsDetailForReport,
  getGraphQlRelationDetailForReport,
  getGraphQlTableDetailForReport
} from "../../platforms/graphql/report_graphql";
import {
  getJsonSchemaTableDetailForReport,
  getNestedObjectsForReport
} from "../../platforms/jsonschema/report_jsonschema";
import {
  getLogicalRelationDetailForReport,
  getLogicalTableDetailForReport
} from "../../platforms/logical/report_logical";
import {
  getMSSQLRelationDetailForReport,
  getMSSQLTableDetailForReport
} from "../../platforms/mssql/report_mssql";
import {
  getMongoDbRelationDetailForReport,
  getMongoDbTableDetailForReport
} from "../../platforms/mongodb/report_mongodb";
import {
  getMongooseRelationDetailForReport,
  getMongooseTableDetailForReport
} from "../../platforms/mongoose/report_mongoose";
import {
  getMySqlRelationDetailForReport,
  getMySqlTableDetailForReport
} from "../../platforms/mysql_family/report_mysql";
import {
  getPgRelationDetailForReport,
  getPgTableDetailForReport
} from "../../platforms/pg/report_pg";
import {
  getSqliteRelationDetailForReport,
  getSqliteTableDetailForReport
} from "../../platforms/sqlite/report_sqlite";
import { isMoon, isPro } from "../../helpers/features/features";
import {
  setForcedRender,
  setReportIsRendered,
  toggleReportModal
} from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import CheckboxSwitch from "../../components/checkbox_switch";
import Choice from "../../components/choice";
import Draggable from "react-draggable";
import Helpers from "../../helpers/helpers";
import HtmlTemplates from "../../reports/html_templates";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "../../enums/enums";
import ReportHelpers from "../../helpers/report_helpers";
import UIHelpers from "../../helpers/ui_helpers";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import imgDarkStyle from "../../assets/imgDarkStyle.png";
import imgLightStyle from "../../assets/imgLightStyle.png";
import imgPrintStyle from "../../assets/imgPrintStyle.png";
import { updateModelProperty } from "../../actions/model";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModalReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: "style01",
      authorInfo: true,
      availableStyles: [
        {
          id: "style01",
          text: "Dark style",
          icon: imgDarkStyle
        },
        {
          id: "style02",
          text: "Light style",
          icon: imgLightStyle
        },
        {
          id: "style03",
          text: "Document style",
          icon: imgPrintStyle
        }
      ],
      availableStylesMoon: [
        {
          id: "style01",
          text: "Dark style",
          icon: imgDarkStyle
        },
        {
          id: "style02",
          text: "Light style",
          icon: imgLightStyle
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
      if (this.props.reportModalIsDisplayed === true) {
        this.props.toggleReportModal();
      }
    }
  }

  changeAuthorInfo() {
    this.setState({ authorInfo: !this.state.authorInfo });
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

  onShowModalClick() {
    this.props.toggleReportModal();
  }

  getAllPlatformsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart("Lines");
    if (_.size(this.props.lines) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Lines");
    }
    _.map(this.props.lines, (line) => {
      toReturn += getLineDetailForReport(line);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Lines");

    toReturn += ReportHelpers.getSectionWrapperStart("Other");
    if (_.size(this.props.otherObjects) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Other objects");
    }
    _.map(this.props.otherObjects, (otherObject) => {
      toReturn += getOtherDetailForReport(otherObject, this.props.lines);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Other");

    toReturn += ReportHelpers.getSectionWrapperStart("Notes");
    if (_.size(this.props.notes) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Notes");
    }
    _.map(this.props.notes, (note) => {
      toReturn += getNoteDetailForReport(note, this.props.lines);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Notes");
    return toReturn;
  }

  diagramTables() {
    return _.map(
      this.props.activeDiagramItems,
      (item) => this.props.tables[item.referencedItemId]
    );
  }

  diagramNotes() {
    return _.map(
      this.props.activeDiagramItems,
      (item) => this.props.notes[item.referencedItemId]
    );
  }

  diagramOtherObjects() {
    return _.map(
      this.props.activeDiagramItems,
      (item) => this.props.otherObjects[item.referencedItemId]
    );
  }

  diagramRelations() {
    return _.filter(
      this.props.relations,
      (rel) =>
        !!this.props.activeDiagramItems[rel.parent] &&
        !!this.props.activeDiagramItems[rel.child]
    );
  }

  diagramLines() {
    return _.filter(
      this.props.lines,
      (line) =>
        !!this.props.activeDiagramItems[line.parent] &&
        !!this.props.activeDiagramItems[line.child]
    );
  }

  diagramRelationsGraphQL() {
    return _.filter(
      this.props.relations,
      (rel) =>
        !!this.props.activeDiagramItems[rel.parent] &&
        !!this.props.activeDiagramItems[rel.child] &&
        rel.type !== "identifying"
    );
  }

  diagramImplements() {
    return _.filter(
      this.props.relations,
      (rel) =>
        !!this.props.activeDiagramItems[rel.parent] &&
        !!this.props.activeDiagramItems[rel.child] &&
        rel.type === "identifying"
    );
  }

  getItemsDetailsForReport() {
    var toReturn = "";
    if (this.props.type === ModelTypes.MONGODB) {
      toReturn += this.getMongoDbItemsDetailsForReport();
    } else if (
      this.props.type === ModelTypes.MYSQL ||
      this.props.type === ModelTypes.MARIADB
    ) {
      toReturn += this.getMySqlItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.SQLITE) {
      toReturn += this.getSqliteItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.PG) {
      toReturn += this.getPgItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.MSSQL) {
      toReturn += this.getMSSQLItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.GRAPHQL) {
      toReturn += this.getGraphQlItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.MONGOOSE) {
      toReturn += this.getMongooseItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.LOGICAL) {
      toReturn += this.getLogicalItemsDetailsForReport();
    } else if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      toReturn += this.getJsonSchemaItemsDetailsForReport();
    }
    toReturn += this.getAllPlatformsDetailsForReport();
    return toReturn;
  }

  getMongoDbItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", !true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", !true]), (table) => {
      toReturn += getMongoDbTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES_EMBEDDABLE
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getMongoDbTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }
    _.map(this.props.relations, (relation) => {
      toReturn += getMongoDbRelationDetailForReport(
        relation,
        this.props.tables
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getMySqlItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", !true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", !true]), (table) => {
      toReturn += getMySqlTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES_EMBEDDABLE
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getMySqlTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(this.props.relations, (relation) => {
      toReturn += getMySqlRelationDetailForReport(relation, this.props.tables);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getGraphQlItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart("Types");

    if (_.size(_.filter(this.diagramTables(), ["objectType", "type"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }
    _.map(_.filter(this.diagramTables(), ["objectType", "type"]), (table) => {
      toReturn += getGraphQlTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart("Inputs");

    if (_.size(_.filter(this.diagramTables(), ["objectType", "input"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Inputs");
    }

    _.map(_.filter(this.diagramTables(), ["objectType", "input"]), (table) => {
      toReturn += getGraphQlTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Inputs");

    toReturn += ReportHelpers.getSectionWrapperStart("Interfaces");

    if (
      _.size(_.filter(this.diagramTables(), ["objectType", "interface"])) > 0
    ) {
      toReturn += ReportHelpers.getSectionTitle("Interfaces");
    }

    _.map(
      _.filter(this.diagramTables(), ["objectType", "interface"]),
      (table) => {
        toReturn += getGraphQlTableDetailForReport(
          table,
          this.props.tables,
          this.props.relations,
          this.props.lines,
          this.props.otherObjects
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Interfaces");

    toReturn += ReportHelpers.getSectionWrapperStart("Unions");

    if (_.size(_.filter(this.diagramTables(), ["objectType", "union"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Unions");
    }

    _.map(_.filter(this.diagramTables(), ["objectType", "union"]), (table) => {
      toReturn += getGraphQlTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Unions");

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(_.filter(this.props.relations, ["type", "simple"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(_.filter(this.props.relations, ["type", "simple"]), (relation) => {
      toReturn += getGraphQlRelationDetailForReport(
        relation,
        this.props.tables
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    toReturn += ReportHelpers.getSectionWrapperStart("Implements");

    if (_.size(_.filter(this.props.relations, ["type", "identifying"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Implements");
    }

    _.map(
      _.filter(this.props.relations, ["type", "identifying"]),
      (relation) => {
        toReturn += getGraphQlImplementsDetailForReport(
          relation,
          this.props.tables
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Implements");

    return toReturn;
  }

  getMongooseItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", !true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", !true]), (table) => {
      toReturn += getMongooseTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart("Types");

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle("Types");
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getMongooseTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Types");

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(this.props.relations, (relation) => {
      toReturn += getMongooseRelationDetailForReport(
        relation,
        this.props.tables
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getPgItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.diagramTables(), ["objectType", "table"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.diagramTables(), ["objectType", "table"]), (table) => {
      toReturn += getPgTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart("Composites");

    if (
      _.size(_.filter(this.diagramTables(), ["objectType", "composite"])) > 0
    ) {
      toReturn += ReportHelpers.getSectionTitle("Composites");
    }

    _.map(
      _.filter(this.diagramTables(), ["objectType", "composite"]),
      (table) => {
        toReturn += getPgTableDetailForReport(
          table,
          this.props.tables,
          this.props.relations,
          this.props.lines,
          this.props.otherObjects
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Composites");

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES_EMBEDDABLE
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getPgTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(this.props.relations, (relation) => {
      toReturn += getPgRelationDetailForReport(relation, this.props.tables);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getMSSQLItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.diagramTables(), ["objectType", "table"])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.diagramTables(), ["objectType", "table"]), (table) => {
      toReturn += getMSSQLTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES_EMBEDDABLE
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getMSSQLTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines,
        this.props.otherObjects
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(this.props.relations, (relation) => {
      toReturn += getMSSQLRelationDetailForReport(relation, this.props.tables);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getSqliteItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", !true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", !true]), (table) => {
      toReturn += getSqliteTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES_EMBEDDABLE
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getSqliteTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(this.props.relations, (relation) => {
      toReturn += getSqliteRelationDetailForReport(relation, this.props.tables);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getLogicalItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", !true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", !true]), (table) => {
      toReturn += getLogicalTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    if (_.size(_.filter(this.props.tables, ["embeddable", true])) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_TABLES_EMBEDDABLE
      );
    }

    _.map(_.filter(this.props.tables, ["embeddable", true]), (table) => {
      toReturn += getLogicalTableDetailForReport(
        table,
        this.props.tables,
        this.props.relations,
        this.props.lines
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_TABLES_EMBEDDABLE)
    );

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );

    if (_.size(this.props.relations) > 0) {
      toReturn += ReportHelpers.getSectionTitle(
        this.props.localization.L_RELATIONS
      );
    }

    _.map(this.props.relations, (relation) => {
      toReturn += getLogicalRelationDetailForReport(
        relation,
        this.props.tables
      );
    });
    toReturn += ReportHelpers.getSectionWrapperEnd(
      _.upperFirst(this.props.localization.L_RELATIONS)
    );
    return toReturn;
  }

  getJsonSchemaItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart("Schema");

    if (
      _.size(
        _.filter(this.props.tables, function (o) {
          return JsonSchemaHelpers.isSchema(o);
        })
      ) > 0
    ) {
      toReturn += ReportHelpers.getSectionTitle("Schema");
    }

    _.map(
      _.filter(this.props.tables, function (o) {
        return JsonSchemaHelpers.isSchema(o);
      }),
      (table) => {
        toReturn += getJsonSchemaTableDetailForReport(
          table,
          this.props.tables,
          this.props.lines,
          this.props.strictJsonFormat,
          this.props.catalogColumns
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Schema");

    toReturn += ReportHelpers.getSectionWrapperStart("Nested");

    if (
      _.size(
        _.filter(this.props.tables, function (o) {
          return (
            !JsonSchemaHelpers.isSchema(o) &&
            !JsonSchemaHelpers.isRef(o) &&
            !JsonSchemaHelpers.isDef(o)
          );
        })
      ) > 0
    ) {
      toReturn += ReportHelpers.getSectionTitle("Nested");
    }

    _.map(
      _.filter(this.props.tables, function (o) {
        return (
          !JsonSchemaHelpers.isSchema(o) &&
          !JsonSchemaHelpers.isRef(o) &&
          !JsonSchemaHelpers.isDef(o)
        );
      }),
      (table) => {
        toReturn += getJsonSchemaTableDetailForReport(
          table,
          this.props.tables,
          this.props.lines,
          this.props.strictJsonFormat,
          this.props.catalogColumns
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Nested");

    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst("Definitions")
    );

    if (
      _.size(
        _.filter(this.props.tables, function (o) {
          return JsonSchemaHelpers.isDef(o);
        })
      ) > 0
    ) {
      toReturn += ReportHelpers.getSectionTitle("Definitions");
    }

    _.map(
      _.filter(this.props.tables, function (o) {
        return JsonSchemaHelpers.isDef(o);
      }),
      (table) => {
        toReturn += getJsonSchemaTableDetailForReport(
          table,
          this.props.tables,
          this.props.lines,
          this.props.strictJsonFormat,
          this.props.catalogColumns
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Definitions");

    toReturn += ReportHelpers.getSectionWrapperStart("Refs");

    if (
      _.size(
        _.filter(this.props.tables, function (o) {
          return JsonSchemaHelpers.isRef(o);
        })
      ) > 0
    ) {
      toReturn += ReportHelpers.getSectionTitle("Refs");
    }

    _.map(
      _.filter(this.props.tables, function (o) {
        return JsonSchemaHelpers.isRef(o);
      }),
      (table) => {
        toReturn += getJsonSchemaTableDetailForReport(
          table,
          this.props.tables,
          this.props.lines,
          this.props.strictJsonFormat,
          this.props.catalogColumns
        );
      }
    );
    toReturn += ReportHelpers.getSectionWrapperEnd("Refs");

    return toReturn;
  }

  getJsonDataModelByType() {
    var jsonModel = {};
    if (this.props.type === ModelTypes.MONGODB) {
      jsonModel = {
        ...jsonModel,
        Collections: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", !true]),
          "id"
        ),
        References: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (
      this.props.type === ModelTypes.MYSQL ||
      this.props.type === ModelTypes.MSSQL ||
      this.props.type === ModelTypes.MARIADB ||
      this.props.type === ModelTypes.SQLITE
    ) {
      jsonModel = {
        ...jsonModel,
        Tables: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", !true]),
          "id"
        ),
        Json: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", true]),
          "id"
        ),
        Relationships: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (this.props.type === ModelTypes.LOGICAL) {
      jsonModel = {
        ...jsonModel,
        Entities: _.mapKeys(
          _.filter(this.props.diagramTables, ["embeddable", !true]),
          "id"
        ),
        Json: _.mapKeys(
          _.filter(this.props.diagramTables, ["embeddable", true]),
          "id"
        ),
        Relationships: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      jsonModel = {
        ...jsonModel,
        Schema: _.mapKeys(
          _.filter(this.props.tables, function (o) {
            return JsonSchemaHelpers.isSchema(o);
          }),
          "id"
        ),
        Nested: getNestedObjectsForReport(
          this.props.tables,
          this.props.catalogColumns
        ),
        Definitions: _.mapKeys(
          _.filter(this.props.tables, function (o) {
            return JsonSchemaHelpers.isDef(o);
          }),
          "id"
        ),
        Refs: _.mapKeys(
          _.filter(this.props.tables, function (o) {
            return JsonSchemaHelpers.isRef(o);
          }),
          "id"
        )
      };
    } else if (this.props.type === ModelTypes.PG) {
      jsonModel = {
        ...jsonModel,
        Tables: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "table"]),
          "id"
        ),
        Composites: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "composite"]),
          "id"
        ),
        Json: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", true]),
          "id"
        ),
        Relationships: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (this.props.type === ModelTypes.MSSQL) {
      jsonModel = {
        ...jsonModel,
        Tables: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "table"]),
          "id"
        ),
        Relationships: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (this.props.type === ModelTypes.MONGOOSE) {
      jsonModel = {
        ...jsonModel,
        Schemas: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", !true]),
          "id"
        ),
        References: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (this.props.type === ModelTypes.GRAPHQL) {
      jsonModel = {
        ...jsonModel,
        Types: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "type"]),
          "id"
        ),
        Inputs: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "input"]),
          "id"
        ),
        Interfaces: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "interface"]),
          "id"
        ),
        Unions: _.mapKeys(
          _.filter(this.diagramTables(), ["objectType", "union"]),
          "id"
        ),
        References: _.mapKeys(this.diagramRelationsGraphQL(), "id"),
        Implements: _.mapKeys(this.diagramImplements(), "id")
      };
    }
    jsonModel = {
      ...jsonModel,
      Lines: _.mapKeys(this.diagramLines(), "id"),
      Other: _.mapKeys(this.diagramOtherObjects(), "id"),
      Notes: _.mapKeys(this.diagramNotes(), "id")
    };
    return jsonModel;
  }

  async generateReport() {
    /*
    var htmlNodes = document.querySelectorAll(
      ".tree__item__root,.tree__flex,.tree__item,.tree__item__sub,.tree__item__named"
    );
    if (htmlNodes) {
      await UIHelpers.setDimensionsToDom(htmlNodes);
    }*/

    var authorInfo = JSON.stringify({
      authorName: this.props.authorName,
      companyDetails: this.props.companyDetails,
      companyUrl: this.props.companyUrl
    });

    var d = document.getElementById("diagram");
    if (d === null) {
      return;
    }
    await this.props.setReportIsRendered(true);

    var diagramOutput;
    if (isPro(this.props.profile)) {
      diagramOutput = ReportHelpers.replaceResourcesInReports(
        d.outerHTML,
        this.props.appName
      );
    } else {
      diagramOutput = ReportHelpers.modifyDiagramForTrial(
        ReportHelpers.replaceResourcesInReports(
          d.outerHTML,
          this.props.appName
        ),
        this.props.type
      );
    }

    var jsonModel = this.getJsonDataModelByType();

    var output = HtmlTemplates.htmlStart(
      `Report for ${this.props.name} made in ${getAppTitle(
        process.env.REACT_APP_PRODUCT
      )}`,
      jsonModel
    );

    output += HtmlTemplates.bodyStart('class="mm-main-report-area"');
    output += HtmlTemplates.body();

    if (this.state.style !== "style03") {
      output += getDiagramForReport(
        diagramOutput,
        this.props.activeDiagramObject.id
      );
    }
    output += getProjectForReport(
      this.props.model,
      this.props.activeDiagramObject,
      this.state.authorInfo ? authorInfo : null
    );
    output += this.getItemsDetailsForReport();
    output += HtmlTemplates.bodyFooter();
    output += HtmlTemplates.bodyEnd() + HtmlTemplates.htmlEnd();

    await this.props.setReportIsRendered(false);
    ipcRenderer &&
      ipcRenderer.send("app:exportToHtml", {
        reportContent: output,
        reportStyleName: this.state.style
      });

    /*
    if (htmlNodes) {
      await UIHelpers.removeDimensionsFromDom(htmlNodes);
    }*/

    await this.props.toggleReportModal();
  }

  render() {
    return (
      <CSSTransition
        in={this.props.reportModalIsDisplayed}
        key="ModalReport"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal-confirm"
              data-testid={TEST_ID.MODALS.REPORT}
            >
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
                      {!isMoon(this.props.profile) && <option value="style03">Document style</option>}
                    </select>
                    <div />
                    <Choice
                      customClassName="im-choice-item"
                      customImgClassName="im-choice-style"
                      onClick={this.handleChangeStyle.bind(this)}
                      choices={isMoon(this.props.profile) ? this.state.availableStylesMoon : this.state.availableStyles}
                      selectedChoiceId={this.state.style}
                    />
                    <div />
                    <CheckboxSwitch
                      label={
                        "Add author and company details from project settings"
                      }
                      checked={this.state.authorInfo}
                      onChange={this.changeAuthorInfo.bind(this)}
                    />
                    <div className="im-content-spacer-md" />
                    <div />
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
                  onClick={this.generateReport.bind(this)}
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
    reportModalIsDisplayed: state.ui.reportModalIsDisplayed,

    type: state.model.type,
    name: state.model.name,
    tables: state.tables,
    relations: state.relations,
    notes: state.notes,
    lines: state.lines,
    otherObjects: state.otherObjects,
    activeDiagramObject: getActiveDiagramObject(state),
    activeDiagramItems: getActiveDiagramItems(state),
    diagrams: state.diagrams,
    localization: state.localization,
    availableFeatures: state.profile.availableFeatures,
    profile: state.profile,
    model: state.model,
    strictJsonFormat: state.model?.jsonCodeSettings?.strict,
    catalogColumns: state.catalogColumns,
    authorName: state.model.authorName,
    companyDetails: state.model.companyDetails,
    companyUrl: state.model.companyUrl
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleReportModal,
        setReportIsRendered,
        updateModelProperty,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalReport)
);
