import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { ModelTypes } from "../../enums/enums";
import RelationAssociation from "../relation_association";
import RelationCardinality from "../relation_cardinality";
import RelationCustomCode from "../relation_custom_code";
import RelationKey from "../relation_key";
import RelationObjects from "../relation_objects";
import RelationProperties from "../relation_properties";
import RelationRI from "../relation_ri";
import RelationSequelize from "../../platforms/sequelize/relation_sequelize";
import RelationStatements from "../relation_statements";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { generateRelationSQL as generateMySQLFamilyRelationSQL } from "../../platforms/mysql_family/generator/generator_sql_mysql_family";
import { generateRelationSQL as generatePgRelationSQL } from "../../platforms/pg/generator/generator_sql_pg";
import { toggleRelationModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalRelation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.relationModalIsDisplayed === true) {
        this.props.toggleRelationModal();
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
    this.props.toggleRelationModal();
  }

  renderTabCaption(caption, isVisible) {
    return isVisible === true || isVisible === undefined ? (
      <Tab>{caption}</Tab>
    ) : (
      <></>
    );
  }

  render() {
    const activeRelation = this.props.relations[this.props.match.params.rid];
    if (
      this.props.match.params.rid &&
      this.props.relationModalIsDisplayed === true &&
      activeRelation
    ) {
      const windowCaption =
        this.props.type === ModelTypes.GRAPHQL &&
        activeRelation.type === "identifying"
          ? _.upperFirst(this.props.localization.L_IMPLEMENTS)
          : _.upperFirst(this.props.localization.L_RELATION);

      return (
        <CSSTransition
          in={this.props.relationModalIsDisplayed}
          key="modalRelation"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.RELATION}>
              <div className="modal-header">{windowCaption} details</div>
              <div className="modal-content">
                <Tabs className="im-tabs">
                  <div className="im-tabs-grid">
                    {this.renderTabCaptions()}
                    {this.renderTabs()}
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

  renderTabCaptions() {
    return (
      <div className="im-tabs-tablist">
        <TabList>
          {this.renderTabCaption("Details", true)}
          {this.props.type !== ModelTypes.LOGICAL &&
          this.props.type !== ModelTypes.GRAPHQL
            ? this.renderTabCaption(
                "Referential Integrity",
                this.isRelational()
              )
            : undefined}
          {this.renderTabCaption("Referenced Objects", this.isRelational())}
          {this.props.type !== ModelTypes.GRAPHQL &&
            this.renderTabCaption("Key", true)}
          {this.renderTabCaption("Cardinality", true)}
          {this.props.type !== ModelTypes.LOGICAL &&
          this.props.type !== ModelTypes.GRAPHQL
            ? this.renderTabCaption(
                this.props.localization.L_SCRIPT,
                (this.isRelational() &&
                  this.props.type !== ModelTypes.SQLITE) ||
                  this.props.type === ModelTypes.SEQUELIZE
              )
            : undefined}
          {this.props.type !== ModelTypes.LOGICAL
            ? this.renderTabCaption("Custom Code", this.isRelational())
            : undefined}
        </TabList>
      </div>
    );
  }
  renderTabs() {
    return (
      <div className="im-tabs-area">
        {this.renderTab(this.renderDetails(), true, "tabDetails")}
        {this.props.type !== ModelTypes.LOGICAL &&
        this.props.type !== ModelTypes.GRAPHQL
          ? this.renderTab(<RelationRI />, this.isRelational(), "tabRI")
          : undefined}
        {this.renderTab(<RelationObjects />, this.isRelational(), "tabKey")}
        {this.props.type !== ModelTypes.GRAPHQL &&
          this.renderTab(<RelationKey />, true, "tabKey")}
        {this.renderTab(<RelationCardinality />, true, "tabKey")}
        {this.props.type !== ModelTypes.LOGICAL &&
        this.props.type !== ModelTypes.GRAPHQL
          ? this.renderTab(
              this.renderScript(),
              (this.isRelational() && this.props.type !== ModelTypes.SQLITE) ||
                this.props.type === ModelTypes.SEQUELIZE,
              "tabKey"
            )
          : undefined}
        {this.props.type !== ModelTypes.LOGICAL
          ? this.renderTab(
              <RelationCustomCode />,
              this.isRelational(),
              "tabKey"
            )
          : undefined}
      </div>
    );
  }

  renderScript() {
    return (
      <>
        {this.renderRelationStatementsSequelize()}
        {this.renderRelationStatementsMySQLFamily()}
        {this.renderRelationStatementsPg()}
      </>
    );
  }

  renderRelationStatementsSequelize() {
    return this.props.type === ModelTypes.SEQUELIZE ? (
      <RelationSequelize />
    ) : (
      <></>
    );
  }

  renderRelationStatementsPg() {
    return this.props.type === ModelTypes.PG ? (
      <RelationStatements generateRelationSQL={generatePgRelationSQL} />
    ) : (
      <></>
    );
  }

  renderRelationStatementsMySQLFamily() {
    return this.props.type === ModelTypes.MARIADB ||
      this.props.type === ModelTypes.MYSQL ? (
      <RelationStatements
        generateRelationSQL={generateMySQLFamilyRelationSQL}
      />
    ) : (
      <></>
    );
  }

  renderTab(content, isVisible, style) {
    return isVisible ? (
      <TabPanel className={style + " im-tab-panel"}>{content}</TabPanel>
    ) : (
      <></>
    );
  }

  renderDetails() {
    return (
      <>
        <RelationProperties />
        <div className="im-content-spacer-md" />
        {this.props.type === ModelTypes.SEQUELIZE ? (
          <RelationAssociation />
        ) : (
          <></>
        )}
      </>
    );
  }

  isRelational() {
    return (
      this.props.type !== ModelTypes.MONGODB &&
      this.props.type !== ModelTypes.MONGOOSE
    );
  }
}

function mapStateToProps(state) {
  return {
    relationModalIsDisplayed: state.ui.relationModalIsDisplayed,
    localization: state.localization,
    type: state.model.type,
    relations: state.relations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleRelationModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalRelation)
);
