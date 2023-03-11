import React, { Component, Fragment } from "react";
import {
  deleteColumn,
  removeColumnFromKey,
  setObjectTypeToRootJsonSchema,
  switchEmbeddable,
  updateTableProperty
} from "../../../actions/tables";
import { finishTransaction, startTransaction } from "../../../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../../../helpers/helpers";
import SpecificationAssistantJsonSchema from "../specification_assistant_jsonschema";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteRelation } from "../../../actions/relations";
import { generageDefaultRegExp } from "../detection/detail_builder";
import { getSpecification } from "../detection/detect_schema";
import { toggleTextEditorModal } from "../../../actions/ui";
import { withRouter } from "react-router";

class OpenAPISchemaAssistant extends Component {
  getUserFriendlyGroupName(groupPath) {
    let toReturn = groupPath;
    const lastSlashPosition = groupPath.lastIndexOf("/");
    if (lastSlashPosition !== -1) {
      let groupName = groupPath.substring(lastSlashPosition + 1);
      if (_.size(groupName) > 0) {
        toReturn = groupName.replace("-", " ").replace("_", " ");
      }
    }
    return toReturn;
  }

  renderAtomicProperties(group) {
    return (
      group?.atomicProperties?.length > 0 && (
        <>
          <div className="im-detail-spec-group-hidden">Properties</div>
          <div className="im-index-assist-grid">
            {this.renderFields(group?.atomicProperties, {
              deletable: false,
              editable: false
            })}
          </div>
        </>
      )
    );
  }

  renderAtomicPatternProperty(atomicPatternProperty) {
    return (
      <Fragment key={atomicPatternProperty.patternPropertyKey}>
        <div className="im-index-assist-grid">
          {this.renderAtomicPatternPropertyFields(atomicPatternProperty)}
        </div>
        <div className="im-new-item-wrapper">
          <button
            className="im-btn-default im-btn-sm"
            onClick={this.props.newAdditionalProperty.bind(
              this,
              generageDefaultRegExp(atomicPatternProperty.patternPropertyKey)
            )}
          >
            Add property
          </button>
        </div>
      </Fragment>
    );
  }

  renderAtomicPatternPropertyFields(atomicPatternProperty) {
    return (
      <>
        <div className="im-detail-spec-group">
          {atomicPatternProperty.patternPropertyKey}
        </div>
        <div></div>
        {this.renderFields(atomicPatternProperty?.patternInstances, {
          editable: true,
          deletable: true
        })}
      </>
    );
  }

  renderAtomicPatternProperties(group) {
    return (
      group?.atomicPatternProperties?.length > 0 && (
        <>
          <div className="im-detail-spec-group-hidden">Pattern properties</div>
          {_.map(group?.atomicPatternProperties, (atomicPatternProperty) =>
            this.renderAtomicPatternProperty(atomicPatternProperty)
          )}
        </>
      )
    );
  }

  renderAtomicAdditionalProperties(detail) {
    return detail?.atomicAdditionalProperties?.length > 0 ? (
      <>
        <div className="im-index-assist-grid">
          {this.renderFields(detail?.atomicAdditionalProperties, {
            editable: true,
            deletable: true
          })}
        </div>
      </>
    ) : (
      <></>
    );
  }

  renderGroup(group, caption) {
    return (
      (_.size(group.atomicProperties) > 0 ||
        _.size(group.atomicPatternProperties) > 0) && (
        <Fragment key={group.name}>
          <div className="im-detail-spec-group">
            {caption
              ? caption
              : `${_.upperFirst(
                  this.getUserFriendlyGroupName(group.name)
                )} properties`}
          </div>

          <div className=" im-detail-spec-panel">
            {this.renderAtomicProperties(group)}
            {this.renderAtomicPatternProperties(group)}
          </div>
        </Fragment>
      )
    );
  }

  renderFields(properties, { editable, deletable }) {
    return _.map(properties, (property) =>
      this.renderField(property.name, property.name, property.value, {
        editable,
        deletable
      })
    );
  }

  createNewName() {
    const specification = getSpecification(
      this.props.tables,
      this.props.match.params.id,
      this.props.match.params.cid
    );

    const newName = `newKey${_.size(specification)}`;
    if (specification?.[newName]) {
      return `newKey${_.random(500, 999)}`;
    }
    return newName;
  }

  getValue(value) {
    return value === undefined || value === ""
      ? Helpers.gv("")
      : Helpers.gv(Helpers.getQuotedStringOnly(value, ""));
  }

  renderField(index, name, value, { editable, deletable }) {
    return (
      <Fragment key={index}>
        {editable ? (
          <DebounceInput
            element="input"
            debounceTimeout={300}
            className={""}
            value={name}
            onChange={this.props.changeSpecificationKey.bind(this, name)}
          />
        ) : (
          <div>{name}:</div>
        )}

        <div className="im-grid-right-icon">
          <DebounceInput
            element="input"
            debounceTimeout={300}
            className={""}
            value={this.getValue(value)}
            onChange={this.props.changeSpecificationValue.bind(
              this,
              name,
              deletable
            )}
          />
          {deletable ? (
            <div
              onClick={this.props.deleteProperty.bind(this, name)}
              className="im-icon-sm im-pointer im-display-inline-block im-spec-editable-icon"
            >
              <i className="im-icon-Trash16 im-icon-16" />
            </div>
          ) : (
            <></>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const sortList = ["#/$defs/specification-extensions"];
    const sortedSchemasForPath = this.props.activeDetail?.schemasForPath?.sort(
      (a, b) => {
        return sortList.indexOf(a.name) - sortList.indexOf(b.name);
      }
    );

    if (this.props.activeDetail?.hasJSONSchema) {
      if (!!this.props.col) {
        return (
          <SpecificationAssistantJsonSchema
            passedCol={this.props.col}
            passedTableId={this.props.match.params.id}
          />
        );
      }
      return <></>;
    }
    var allGroups = {};
    _.map(sortedSchemasForPath, (group) => {
      allGroups = _.merge(allGroups, group);
    });

    return (
      <div>
        {sortedSchemasForPath && this.renderGroup(allGroups, "All properties")}
        <div className="im-detail-spec-group">Other properties</div>
        <div className=" im-detail-spec-panel">
          {this.renderAtomicAdditionalProperties(this.props.activeDetail)}
          <div className="im-new-item-wrapper">
            <button
              className="im-btn-default im-btn-sm"
              onClick={this.props.newAdditionalProperty.bind(
                this,
                this.createNewName()
              )}
            >
              Add property
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    catalogColumns: state.catalogColumns
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateTableProperty,
        deleteRelation,
        removeColumnFromKey,
        deleteColumn,
        finishTransaction,
        startTransaction,
        setObjectTypeToRootJsonSchema,
        switchEmbeddable,
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OpenAPISchemaAssistant)
);
