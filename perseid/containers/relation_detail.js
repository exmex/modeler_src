import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import CollapsiblePanel from "../components/collapsible_panel";
import { ModelTypes } from "../enums/enums";
import RelationAssociation from "./relation_association";
import RelationCardinality from "./relation_cardinality";
import RelationCustomCode from "./relation_custom_code";
import RelationKey from "./relation_key";
import RelationObjects from "./relation_objects";
import RelationProperties from "./relation_properties";
import RelationRi from "./relation_ri";
import RelationSequelize from "../platforms/sequelize/relation_sequelize";
import RelationStatements from "./relation_statements";
import _ from "lodash";
import { connect } from "react-redux";
import { generateRelationSQL as generateMySQLFamilyRelationSQL } from "../platforms/mysql_family/generator/generator_sql_mysql_family";
import { generateRelationSQL as generatePgRelationSQL } from "../platforms/pg/generator/generator_sql_pg";
import { withRouter } from "react-router-dom";

class RelationDetail extends Component {
  render() {
    const relation =
      this.props.match.params.rid &&
      _.find(this.props.relations, ["id", this.props.match.params.rid]);
    try {
      if (this.props.match.params.rid === undefined || relation === undefined) {
        return (
          <div className="aside-right-message">
            Select an object to see details.
          </div>
        );
      }

      const tabCaption =
        this.props.type === ModelTypes.GRAPHQL &&
        relation.type === "identifying"
          ? _.upperFirst(this.props.localization.L_IMPLEMENTS)
          : _.upperFirst(this.props.localization.L_RELATION);

      return (
        <Tabs className="im-tabs">
          <div className="im-tabs-grid">
            <div className="im-tabs-tablist">
              <TabList>
                <Tab>{tabCaption} Details</Tab>
                {this.props.type !== ModelTypes.LOGICAL ? (
                  <Tab>{this.props.localization.L_SCRIPT}</Tab>
                ) : undefined}
              </TabList>
            </div>

            <div className="im-tabs-area">
              <TabPanel className="im-aside">
                <CollapsiblePanel
                  panelTitle={tabCaption + " Detail"}
                  panelKey="pRelationDetail"
                  panelIsExpanded={this.props.panelsExpanded.pRelationDetail}
                >
                  <div className="im-collapsible-panel">
                    <RelationProperties />
                  </div>
                </CollapsiblePanel>
                {this.props.type === ModelTypes.MARIADB ||
                this.props.type === ModelTypes.MYSQL ||
                this.props.type === ModelTypes.PG ||
                this.props.type === ModelTypes.SQLITE ? (
                  <CollapsiblePanel
                    panelTitle="Referential integrity"
                    panelKey="pRelationRi"
                    panelIsExpanded={this.props.panelsExpanded.pRelationRi}
                  >
                    <div className="im-collapsible-panel">
                      <RelationRi />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}

                {this.props.type === ModelTypes.MARIADB ||
                this.props.type === ModelTypes.MYSQL ||
                this.props.type === ModelTypes.PG ||
                this.props.type === ModelTypes.LOGICAL ||
                this.props.type === ModelTypes.SQLITE ? (
                  <CollapsiblePanel
                    panelTitle="Referenced objects"
                    panelKey="pRelationReferenced"
                    panelIsExpanded={
                      this.props.panelsExpanded.pRelationReferenced
                    }
                  >
                    <div className="im-collapsible-panel">
                      <RelationObjects />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
                {this.props.type !== "GRAPHQL" && (
                  <CollapsiblePanel
                    panelTitle="Key"
                    panelKey="pRelationKey"
                    panelIsExpanded={this.props.panelsExpanded.pRelationKey}
                  >
                    <div className="im-collapsible-panel">
                      <RelationKey />
                    </div>
                  </CollapsiblePanel>
                )}
                {this.props.type !== "GRAPHQL" ||
                (this.props.type === "GRAPHQL" &&
                  relation?.type !== "identifying") ? (
                  <CollapsiblePanel
                    panelTitle="Cardinality"
                    panelKey="pRelationCardinality"
                    panelIsExpanded={
                      this.props.panelsExpanded.pRelationCardinality
                    }
                  >
                    <div className="im-collapsible-panel">
                      <RelationCardinality />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  <></>
                )}
                {this.props.type === "SEQUELIZE" ? (
                  <CollapsiblePanel
                    panelTitle="Association"
                    panelKey="pRelationAssociation"
                    panelIsExpanded={
                      this.props.panelsExpanded.pRelationAssociation
                    }
                  >
                    <div className="im-collapsible-panel">
                      <RelationAssociation />
                    </div>
                  </CollapsiblePanel>
                ) : (
                  ""
                )}
              </TabPanel>
              {this.props.type !== ModelTypes.LOGICAL ? (
                <TabPanel className="im-aside">
                  {this.props.type === "SEQUELIZE" ? (
                    <RelationSequelize />
                  ) : (
                    <></>
                  )}
                  {this.props.type === ModelTypes.MYSQL ||
                  this.props.type === ModelTypes.MARIADB ? (
                    <RelationStatements
                      generateRelationSQL={generateMySQLFamilyRelationSQL}
                    />
                  ) : (
                    <></>
                  )}
                  {this.props.type === ModelTypes.PG ? (
                    <RelationStatements
                      generateRelationSQL={generatePgRelationSQL}
                    />
                  ) : (
                    <></>
                  )}

                  <CollapsiblePanel
                    panelTitle="Custom code"
                    panelKey="pTableCode"
                    panelIsExpanded={this.props.panelsExpanded.pRelationCode}
                    customCss="im-collapsible-wrapper-code"
                  >
                    <div className="im-collapsible-panel">
                      <RelationCustomCode />
                    </div>
                  </CollapsiblePanel>
                </TabPanel>
              ) : undefined}
            </div>
          </div>
        </Tabs>
      );
    } catch (err) {
      throw new Error("Relation detail error");
    }
  }
}

function mapStateToProps(state) {
  return {
    relations: state.relations,
    panelsExpanded: state.ui.panelsExpanded,
    localization: state.localization,
    type: state.model.type
  };
}

export default withRouter(connect(mapStateToProps)(RelationDetail));
