import React, { Component, Fragment } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import ButtonEditLarge from "../../components/button_edit_large";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import InputDatalist from "../../components/input_datalist";
import JsonSchemaHelpers from "./helpers_jsonschema";
import ModalTextEditor from "../../containers/modals/modal_text_editor";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addNotification } from "../../actions/notifications";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { getSpecificationStatementJsonSchema } from "./generator_jsonschema";
import js_beautify from "js-beautify";
import json5 from "json5";
import { toggleTextEditorModal } from "../../actions/ui";
import { updateColumnProperty } from "../../actions/tables";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class SpecificationAssistantJsonSchema extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleStateChange = this.handleStateChange.bind(this);
    this.buildSpecification = this.buildSpecification.bind(this);
  }

  componentDidUpdate(prevProps) {
    const prevCol = JsonSchemaHelpers.getActiveColumn(
      prevProps.tables,
      this.props.passedTableId,
      this.props.passedCol.id
    );
    const currentCol = JsonSchemaHelpers.getActiveColumn(
      this.props.tables,
      this.props.passedTableId,
      this.props.passedCol.id
    );
    if (
      prevProps.tables[prevCol?.datatype]?.objectType !==
        this.props.tables[currentCol?.datatype]?.objectType ||
      prevCol?.specification !== currentCol?.specification
    ) {
      this.updateState(currentCol);
    }
    if (
      prevProps.jsonCodeSettingsStrict !== this.props.jsonCodeSettingsStrict
    ) {
      this.buildSpecification();
    }
  }

  componentDidMount() {
    if (this.props.passedCol.id) {
      this.updateState(this.props.passedCol);
    }
  }

  updateState(col) {
    const internalNestedTableObjectType =
      this.props.tables[col.datatype]?.objectType;
    try {
      let newStateObject = JsonSchemaHelpers.getSpecificationParsedState(
        col.specification,
        internalNestedTableObjectType
      );
      this.setState({
        specification: newStateObject.specification
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  handleStateChange(category, propName, event) {
    var newValue = event.target.value;
    let group = JsonSchemaHelpers.getSpecGroup(propName);
    if (this.isOtherAndEmpty(newValue, group)) {
      newValue = "";
    } else {
      if (newValue === "") {
        newValue = undefined;
      }
    }
    this.setState(
      {
        [category]: {
          ...this.state[category],
          [propName]: newValue
        }
      },
      () => {
        this.buildSpecification();
      }
    );
  }

  removeFromSpecificationState(category, propName) {
    var newState = Object.assign(this.state[category]);
    newState = _.omit(newState, propName);
    this.setState(
      {
        specification: newState
      },
      () => {
        this.buildSpecification();
      }
    );
  }

  handleStateKeyChange(category, oldKey, newKey, oldValue) {
    var copiedState = Object.assign(this.state[category]);
    var newState = {};
    for (const property in copiedState) {
      if (property === oldKey) {
        delete copiedState[property];
        newState[newKey] = oldValue;
      } else {
        newState = { ...newState, [property]: copiedState[property] };
      }
    }

    this.setState(
      {
        [category]: newState
      },
      () => {
        this.buildSpecification();
      }
    );
  }

  isOtherAndEmpty(val, group) {
    return group === "other" && (val === undefined || val === "");
  }

  async buildSpecification() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMNS_JSON_SCHEMA__SET_SPECIFICATION
    );
    try {
      let specificationScript = "";
      let definedSpecification = [];

      _.each(this.state.specification, (val, key) => {
        definedSpecification = [
          ...definedSpecification,
          this.getStateValueByName("specification", key)
        ];
      });

      definedSpecification = _.filter(definedSpecification, (specItem) => {
        return specItem !== undefined;
      });

      if (_.size(definedSpecification) > 0) {
        specificationScript += "{\n";
      }

      if (_.size(definedSpecification) > 0) {
        let i = 1;
        for (let line of definedSpecification) {
          specificationScript += line;
          if (i < _.size(definedSpecification)) {
            specificationScript += ",\n";
          }
          i++;
        }
      }

      if (_.size(definedSpecification) > 0) {
        specificationScript += "\n}";
      }

      await this.props.updateColumnProperty(
        this.props.passedTableId,
        this.props.passedCol.id,
        specificationScript,
        "specification"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getStateValueByName(category, propName) {
    let group = JsonSchemaHelpers.getSpecGroup(propName);
    let val = this.state[category][propName];

    if (this.isOtherAndEmpty(val, group)) {
      return `"${propName}": ""`;
    }

    if (val !== undefined) {
      if (
        val !== "" &&
        val !== null &&
        val !== false &&
        val !== 0 &&
        Helpers.isValidJson5Structure(val)
      ) {
        val = json5.parse(val);
        if (_.isObjectLike(val) && _.isEmpty(val)) {
          if (Array.isArray(val)) {
            return `"${propName}": []`;
          } else {
            return `"${propName}": {}`;
          }
        } else if (val !== undefined && val !== "") {
          return `"${propName}": ${Helpers.gv(JSON.stringify(val))}`;
        }
      } else {
        return `"${propName}": ${Helpers.getQuotedStringOnly(val, '"')}`;
      }
    }
  }

  getPlaceholderCaption(keyName) {
    switch (keyName) {
      case "contentEncoding":
      case "contentMediaType":
      case "format":
        return "Press down arrow to open list";
      case "enum":
        return "Use square brackets";
      default:
        return "";
    }
  }

  getSpecDataListByKeyName(keyName) {
    switch (keyName) {
      case "format":
        return (
          <InputDatalist
            inputId="format"
            arrayOfItems={_.sortBy(JsonSchemaHelpers.getJsonStringFormat())}
          />
        );
      case "contentEncoding":
        return (
          <InputDatalist
            inputId="contentEncoding"
            arrayOfItems={_.sortBy(JsonSchemaHelpers.getContentEncoding())}
          />
        );
      case "contentMediaType":
        return (
          <InputDatalist
            inputId="contentMediaType"
            arrayOfItems={_.sortBy(JsonSchemaHelpers.getContentMediaType())}
          />
        );
      default:
        return <></>;
    }
  }

  openInLargeWindow(groupItem) {
    this.props.toggleTextEditorModal(
      <ModalTextEditor
        textEditorId={uuidv4()}
        onChange={this.handleStateChange.bind(
          this,
          "specification",
          groupItem.key
        )}
        modalHeader={_.upperFirst(groupItem.key)}
        text={this.getEmptyOtherOrValue(groupItem.val, groupItem.group)}
      />
    );
  }

  renderSpecificationFields() {
    if (this.state.specification && this.state.specification !== {}) {
      let groupedSpec = [];
      _.map(this.state.specification, (val, key) => {
        let group = JsonSchemaHelpers.getSpecGroup(key);
        let obj = { group: group, key: key, val: val };
        groupedSpec.push(obj);
      });

      let groupes = _.groupBy(groupedSpec, (o) => {
        return o.group;
      });

      return _.map(groupes, (group) => {
        return (
          <Fragment key={group[0].group}>
            <div className="im-detail-spec-group">
              {_.upperFirst(group[0].group + " restrictions")}
            </div>
            <div className=" im-detail-spec-panel">
              <div className="im-index-assist-grid">
                {this.returnField(group)}
              </div>
            </div>
          </Fragment>
        );
      });
    }
  }

  getEmptyOtherOrValue(val, group) {
    if (this.isOtherAndEmpty(val, group)) {
      return "";
    } else {
      return Helpers.gv(Helpers.getQuotedStringOnly(val, ""));
    }
  }

  returnField(group) {
    var i = 0;
    return _.map(group, (groupItem) => {
      i++;
      return (
        <Fragment key={groupItem.group + "_" + i}>
          {groupItem.group !== "other" ? (
            <div>{groupItem.key}:</div>
          ) : (
            <DebounceInput
              element="input"
              key={groupItem.group + i}
              debounceTimeout={300}
              className={""}
              value={Helpers.gv(groupItem.key)}
              onChange={(e) =>
                this.handleStateKeyChange(
                  "specification",
                  groupItem.key,
                  e.target.value,
                  groupItem.val
                )
              }
            />
          )}

          <div className="im-grid-right-icon">
            <DebounceInput
              list={groupItem.key}
              element="input"
              debounceTimeout={300}
              className={""}
              placeholder={this.getPlaceholderCaption(groupItem.key)}
              value={this.getEmptyOtherOrValue(groupItem.val, groupItem.group)}
              onChange={this.handleStateChange.bind(
                this,
                "specification",
                groupItem.key
              )}
            />
            {JsonSchemaHelpers.propertiesEditableInModal().includes(
              groupItem.key
            ) ? (
              <ButtonEditLarge
                onClick={this.openInLargeWindow.bind(this, groupItem)}
              />
            ) : (
              <></>
            )}
            {groupItem.group === "other" ? (
              <div
                onClick={() => {
                  this.removeFromSpecificationState(
                    "specification",
                    groupItem.key
                  );
                }}
                className="im-icon-sm im-pointer im-display-inline-block im-spec-editable-icon"
              >
                <i className="im-icon-Trash16 im-icon-16" />
              </div>
            ) : (
              <></>
            )}
            {this.getSpecDataListByKeyName(groupItem.key)}
          </div>
        </Fragment>
      );
    });
  }

  renderRestrictionsUI() {
    var newName = `newKey${_.size(this.state.specification)}`;
    if (this.state.specification && this.state.specification[newName]) {
      newName = `newKey${_.random(500, 999)}`;
    }
    return (
      <>
        {this.renderSpecificationFields()}
        <div className="im-new-item-wrapper">
          <button
            className="im-btn-default im-btn-sm"
            onClick={() =>
              this.setState(
                {
                  specification: {
                    ...this.state.specification,
                    [newName]: ""
                  }
                },
                () => this.buildSpecification()
              )
            }
          >
            Add restriction
          </button>
        </div>
      </>
    );
  }

  getSpecificationBeautifiedCode(obj) {
    return js_beautify(getSpecificationStatementJsonSchema(obj), {
      indent_size: 2,
      preserve_newlines: true,
      keep_array_indentation: true
    });
  }

  render() {
    if (this.props.passedCol?.id) {
      return <div key="spec">{this.renderRestrictionsUI()}</div>;
    } else {
      return "";
    }
  }
}

function mapStateToProps(state) {
  return {
    localization: state.localization,
    name: state.model.name,
    tables: state.tables,
    settings: state.settings,
    jsonCodeSettingsStrict: state.model.jsonCodeSettings.strict
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateColumnProperty,
        addNotification,
        finishTransaction,
        startTransaction,
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SpecificationAssistantJsonSchema)
);
