import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { addToSelection, clearSelection } from "../actions/selections";

import CollapsiblePanel from "../components/collapsible_panel";
import Columns from "./columns";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import ModelPartialJsonSchema from "../platforms/jsonschema/model_partial_jsonschema";
import NewColumn from "./new_column";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { isPerseid } from "../helpers/features/features";
import { navigateByObjectType } from "../components/url_navigation";
import { setForcedRender } from "../actions/ui";
import { withRouter } from "react-router-dom";

class ColumnDetail extends Component {
  getActiveCol() {
    return JsonSchemaHelpers.getColumnById(
      this.props.tables,
      this.props.match.params.id,
      this.props.match.params.cid
    );
  }
  async addToSelectionAndActivate(objectType, id, embeddable) {
    await this.props.clearSelection(false);
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

  renderEmbeddatableTab() {
    var table = this.props.tables[this.props.match.params.id];
    if (table === undefined) {
      return <></>;
    }
    var embeddableTables = _.filter(this.props.tables, ["embeddable", true]);

    var col = this.getActiveCol();

    if (
      col &&
      this.props.tables[col.datatype] &&
      _.size(this.props.tables[col.datatype].cols) > 0
    ) {
      var embeddedTable = _.find(embeddableTables, ["id", col.datatype]);
      if (embeddedTable !== undefined) {
        return <Tab>Children</Tab>;
      }
    }
  }

  renderEmbeddableTableDetail() {
    var table = this.props.tables[this.props.match.params.id];
    if (table === undefined) {
      return <></>;
    }
    var embeddableTables = _.filter(this.props.tables, ["embeddable", true]);

    var col = this.getActiveCol();

    if (
      col &&
      this.props.tables[col.datatype] &&
      _.size(this.props.tables[col.datatype].cols) > 0
    ) {
      var embeddedTable = _.find(embeddableTables, ["id", col.datatype]);

      if (embeddedTable !== undefined) {
        return (
          <TabPanel className="im-aside">
            <CollapsiblePanel
              panelKey="pTableColumns"
              panelTitle={"Children"}
              panelIsExpanded={this.props.panelsExpanded.pTableColumns}
            >
              <div>
                <NewColumn passedTableId={embeddedTable.id} />
                <div className="im-collapsible-panel">
                  <Columns passedTableId={embeddedTable.id} />
                </div>
              </div>
            </CollapsiblePanel>
          </TabPanel>
        );
      }
    }
  }

  hasChildren() {
    return _.size(this.props.tables[this.props.match.params.id]?.cols) > 0;
  }

  render() {
    if (
      !this.props.match.params.id ||
      !this.props.tables[this.props.match.params.id]
    ) {
      return (
        <div className="aside-right-message">
          Select a {this.props.localization.L_TABLE} to see details.
        </div>
      );
    }

    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>{this.props.localization.L_COLUMN} details</Tab>
              {this.hasChildren() && this.renderEmbeddatableTab()}
              {isPerseid(this.props.profile) ? <Tab>Script</Tab> : <></>}
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelKey="pTableProperties"
                panelTitle="Properties"
                panelIsExpanded={this.props.panelsExpanded.pTableProperties}
              >
                <div className="im-collapsible-panel">
                  <Columns
                    showOnlyActiveColumn={true}
                    passedTableId={this.props.match.params.id}
                  />
                  {!isPerseid(this.props.profile) && (
                    <div className="im-message">
                      {_.upperFirst(this.props.localization.L_COLUMN)} selection
                      is active.
                      <div className="im-mt">
                        {`Edit the `}
                        <div
                          className="im-btn-link im-pointer im-display-inline-block"
                          onClick={() =>
                            this.addToSelectionAndActivate(
                              "table",
                              this.props.match.params.id,
                              this.props.tables[this.props.match.params.id]
                                .embeddable
                            )
                          }
                        >
                          {this.props.tables[this.props.match.params.id].name}
                        </div>
                        {` properties`} or <br />
                        deselect the {this.props.localization.L_COLUMN} on the
                        diagram <br />
                        to edit the object properties.
                      </div>
                    </div>
                  )}
                </div>
              </CollapsiblePanel>
            </TabPanel>

            {this.hasChildren() && this.renderEmbeddableTableDetail()}
            {isPerseid(this.props.profile) ? (
              <TabPanel>
                <ModelPartialJsonSchema />
              </TabPanel>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    panelsExpanded: state.ui.panelsExpanded,
    localization: state.localization,
    profile: state.profile,
    settings: state.settings,
    jsonCodeSettingsStrict: state.model?.jsonCodeSettings?.strict
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        addToSelection,
        setForcedRender,
        clearSelection
      },

      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ColumnDetail)
);
