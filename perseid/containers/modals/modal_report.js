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
import {
  setForcedRender,
  setReportIsRendered,
  toggleReportModal
} from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import Choice from "../../components/choice";
import Draggable from "react-draggable";
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
import { isPro } from "../../helpers/features/features";
import { updateModelProperty } from "../../actions/model";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModalReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: "style01",
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
    _.map(this.props.lines, (line) => {
      toReturn += getLineDetailForReport(line);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Lines");

    toReturn += ReportHelpers.getSectionWrapperStart("Other");
    _.map(this.props.otherObjects, (otherObject) => {
      toReturn += getOtherDetailForReport(otherObject, this.props.lines);
    });
    toReturn += ReportHelpers.getSectionWrapperEnd("Other");

    toReturn += ReportHelpers.getSectionWrapperStart("Notes");
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
    var toReturn = this.getAllPlatformsDetailsForReport();
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
    } else if (this.props.type === ModelTypes.GRAPHQL) {
      toReturn += this.getGraphQlItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.MONGOOSE) {
      toReturn += this.getMongooseItemsDetailsForReport();
    } else if (this.props.type === ModelTypes.LOGICAL) {
      toReturn += this.getLogicalItemsDetailsForReport();
    } else if (JsonSchemaHelpers.isPerseidModelType(this.props.type)) {
      toReturn += this.getJsonSchemaItemsDetailsForReport();
    }
    return toReturn;
  }

  getMongoDbItemsDetailsForReport() {
    var toReturn = "";
    toReturn += ReportHelpers.getSectionWrapperStart(
      _.upperFirst(this.props.localization.L_TABLES)
    );
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
    _.map(this.props.relations, (relation) => {
      toReturn += getPgRelationDetailForReport(relation, this.props.tables);
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
        Documents: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", true]),
          "id"
        ),
        References: _.mapKeys(this.diagramRelations(), "id")
      };
    } else if (
      this.props.type === ModelTypes.MYSQL ||
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
    } else if (this.props.type === ModelTypes.MONGOOSE) {
      jsonModel = {
        ...jsonModel,
        Schemas: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", !true]),
          "id"
        ),
        Types: _.mapKeys(
          _.filter(this.diagramTables(), ["embeddable", true]),
          "id"
        ),
        Relations: _.mapKeys(this.diagramRelations(), "id")
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
    output += getDiagramForReport(
      diagramOutput,
      this.props.activeDiagramObject.id
    );
    output += getProjectForReport(
      this.props.model,
      this.props.activeDiagramObject
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
                    </select>
                    <div />
                    <Choice
                      customClassName="im-choice-item"
                      customImgClassName="im-choice-style"
                      onClick={this.handleChangeStyle.bind(this)}
                      choices={this.state.availableStyles}
                      selectedChoiceId={this.state.style}
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
    catalogColumns: state.catalogColumns
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
