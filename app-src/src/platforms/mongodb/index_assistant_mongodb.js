import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  updateIndexColumnProperty,
  updateIndexProperty
} from "../../actions/tables";

import CheckboxSwitch from "../../components/checkbox_switch";
import CollapsiblePanel from "../../components/collapsible_panel";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import IndexMongoDb from "./index_mongodb";
import InputDatalist from "../../components/input_datalist";
import MongoDbHelpers from "./helpers_mongodb";
import Sortable from "react-sortablejs";
import SyntaxHighlighter from "react-syntax-highlighter";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { addNotification } from "../../actions/notifications";
import arrayMove from "array-move";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { getMongoDbCreateIndexStatement } from "./generator_mongodb";
import js_beautify from "js-beautify";
import moment from "moment";
import { navigateToItemUrl } from "../../components/url_navigation";
import { toggleIndexAssistantModal } from "../../actions/ui";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const checkboxOptions = ["sparse", "unique", "hidden"];
const optionsWithJsonStructure = [
  "partialFilterExpression",
  "weights",
  "wildcardProjection"
];

const ItemSql = ({ sql }) => {
  return <div>{sql}</div>;
};
class IndexAssistantMongoDb extends Component {
  constructor(props) {
    super(props);
    this.state = MongoDbHelpers.getIndexInitState();
    this.handleStateChange = this.handleStateChange.bind(this);
    this.buildIndex = this.buildIndex.bind(this);
    this.updateIndexName = this.updateIndexName.bind(this);
  }

  componentDidMount() {
    if (this.props.match.params.iid) {
      const index = this.props.tables[this.props.match.params.id].indexes.find(
        (ind) => ind.id === this.props.match.params.iid
      );

      try {
        if (_.size(index.mongodb?.fields) > 0) {
          let newStateObject = MongoDbHelpers.getIndexParsedState(
            index.mongodb?.fields,
            index.mongodb?.options
          );
          this.setState({
            fields: newStateObject.fields,
            options: newStateObject.options,
            collation: newStateObject.collation,
            useIndexName: newStateObject.useIndexName
          });
        }
      } catch (e) {
        this.props.addNotification({
          id: uuidv4(),
          datepast: moment().startOf("minute").fromNow(),
          datesort: moment().unix(),
          date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
          message:
            "Index could not be loaded. Please make sure the JSON definition is correct.",
          model: this.props.name,
          type: "info",
          autohide: true,
          urlCaption: null,
          urlToOpen: null,
          urlIsExternal: false
        });
        navigateToItemUrl(
          this.props.match.url,
          this.props.history,
          this.props.match.params.mid,
          this.props.match.params.did,
          this.props.tables[this.props.match.params.id].id,
          this.props.tables[this.props.match.params.id].embeddable
        );
        this.props.toggleIndexAssistantModal();
      }
    }
  }

  updateFieldState(fieldId, propName, newValue) {
    let newFieldsObject = Object.assign([], this.state.fields);
    let fieldPosition = _.findIndex(newFieldsObject, ["id", fieldId]);
    newFieldsObject[fieldPosition][propName] = newValue;
    this.setState({ fields: newFieldsObject }, () => this.buildIndex());
  }

  deleteFromFieldState(fieldId) {
    let newFieldsObject = Object.assign([], this.state.fields);
    newFieldsObject = _.reject(newFieldsObject, { id: fieldId });
    this.setState({ fields: newFieldsObject }, () => this.buildIndex());
  }

  handleStateChange(category, propName, newValue) {
    this.setState(
      {
        [category]: {
          ...this.state[category],
          [propName]: newValue
        }
      },
      () => {
        this.buildIndex();
      }
    );
  }

  getIndex() {
    return this.props.tables[this.props.match.params.id].indexes.find(
      (ind) => ind.id === this.props.match.params.iid
    );
  }

  async buildIndex() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.INDEX_ASSISTANT_MONGODB__UPDATE_INDEX_PROPERTY
    );
    try {
      await this.buildIndexFromState();
    } finally {
      await this.props.finishTransaction();
    }
  }

  async buildIndexFromState() {
    let ixFieldsScript = "{\n";
    let ixOptionsScript = "";
    let definedOptions = [];
    let definedCollation = [];

    if (this.state.useIndexName === true) {
      definedOptions = [
        ...definedOptions,
        `name: ${Helpers.getQuotedStringOnly(this.getIndex().name, '"')}`
      ];
    }

    let k = 1;
    for (let field of this.state.fields) {
      if (field.name && field.name !== "") {
        ixFieldsScript += this.getStateFieldDetails(field);
        if (k < _.size(this.state.fields)) {
          ixFieldsScript += ",\n";
        }
        k++;
      }
    }
    ixFieldsScript += "\n}";

    _.each(this.state.options, (val, key) => {
      definedOptions = [
        ...definedOptions,
        this.getStateValueByName("options", key)
      ];
    });

    _.each(this.state.collation, (val, key) => {
      definedCollation = [
        ...definedCollation,
        this.getStateValueByName("collation", key)
      ];
    });

    definedOptions = _.compact(definedOptions);
    definedCollation = _.compact(definedCollation);

    if (_.size(definedOptions) > 0 || _.size(definedCollation) > 0) {
      ixOptionsScript += "{\n";
    }

    if (_.size(definedOptions) > 0) {
      let i = 1;
      for (let line of definedOptions) {
        ixOptionsScript += line;
        if (i < _.size(definedOptions)) {
          ixOptionsScript += ",\n";
        }
        i++;
      }
    }

    if (_.size(definedCollation) > 0) {
      if (_.size(definedOptions) > 0) {
        ixOptionsScript += ",\n";
      }
      let j = 1;
      ixOptionsScript += "collation: {\n";
      for (let line of definedCollation) {
        ixOptionsScript += "     " + line;
        if (j < _.size(definedCollation)) {
          ixOptionsScript += ",\n";
        }
        j++;
      }
      ixOptionsScript += "\n   }";
    }

    if (_.size(definedOptions) > 0 || _.size(definedCollation) > 0) {
      ixOptionsScript += "\n}";
    }

    const index = this.props.tables[this.props.match.params.id].indexes.find(
      (ind) => ind.id === this.props.match.params.iid
    );
    const current = index["mongodb"];
    const next = {
      ...current,
      options: ixOptionsScript,
      fields: ixFieldsScript
    };

    await this.props.updateIndexProperty(
      this.props.match.params.id,
      this.props.match.params.iid,
      next,
      "mongodb"
    );
  }

  getStateValueByName(category, propName) {
    let toReturn = "";
    let val = this.state[category][propName];
    if (_.includes(checkboxOptions, propName)) {
      if (val === true || val === "true") {
        toReturn = `${propName}: ${val}`;
      }
    } else if (_.includes(optionsWithJsonStructure, propName)) {
      if (val !== null && _.trim(val) !== "") {
        toReturn = `${propName}: ${Helpers.getDefinedJson(val)}`;
      }
    } else if (
      val !== "na" &&
      val !== "undefined" &&
      val !== null &&
      _.trim(val) !== ""
    ) {
      toReturn = `${propName}: ${Helpers.getQuotedStringOnly(val, '"')}`;
    }
    return toReturn;
  }

  getStateFieldDetails(fieldInState) {
    return `${Helpers.getQuotedStringOnly(
      fieldInState.name,
      '"'
    )}: ${Helpers.getQuotedStringOnly(fieldInState.type, '"')}`;
  }

  render() {
    if (this.props.match.params.iid) {
      const index = this.getIndex();
      if (!index) {
        return <></>;
      }
      return (
        <div>
          <Tabs className="im-tabs">
            <div className="im-tabs-grid">
              {this.renderTabCaptions()}
              {this.renderTabs(index)}
            </div>
          </Tabs>
        </div>
      );
    } else {
      return <></>;
    }
  }

  renderTabCaptions() {
    return (
      <div className="im-tabs-tablist">
        <TabList>
          <Tab>Fields</Tab>
          <Tab>Options</Tab>
          <Tab>Collation</Tab>
          <Tab>Code</Tab>
          <Tab>Create statement</Tab>
        </TabList>
      </div>
    );
  }

  renderFieldItems(index) {
    return (
      <div className="im-mt">
        <Sortable
          options={{
            handle: ".handle",
            animation: 150,
            easing: "easeOutBounce",
            dragoverBubble: true
          }}
          onChange={(order, sortable, evt) => {
            var newSort = arrayMove(
              this.state.fields,
              evt.oldIndex - 1,
              evt.newIndex - 1
            );
            this.setState({ fields: newSort });
          }}
        >
          {this.getIndexFieldItems()}
        </Sortable>
      </div>
    );
  }

  addField(event) {
    let updatedFields = [
      ...this.state.fields,
      {
        id: uuidv4(),
        name: this.state.newFieldName,
        type: this.state.newFieldType
      }
    ];
    this.setState({ fields: updatedFields, newFieldName: "" }, () =>
      this.buildIndex()
    );
    event.preventDefault();
  }

  getItemsForIndexFieldAsArray(table, parentFieldName, isNested) {
    var fieldNames = [];
    _.map(table.cols, (col) => {
      let fieldName;
      if (isNested === true) {
        fieldName = parentFieldName + col.name;
      } else {
        fieldName = col.name;
        parentFieldName = "";
      }
      fieldNames = [...fieldNames, fieldName];
      let embeddableTables = _.filter(this.props.tables, ["embeddable", true]);
      let embeddedTable = _.find(embeddableTables, ["id", col.datatype]);
      if (embeddedTable !== undefined) {
        let newParent = parentFieldName + col.name + ".";
        fieldNames = [
          ...fieldNames,
          ...this.getItemsForIndexFieldAsArray(embeddedTable, newParent, true)
        ];
      }
    });
    return fieldNames;
  }

  renderNewField() {
    let platformStyle = "dNewColRowForm dNewIndexAssist ";
    return (
      <div className="newColForm">
        <form onSubmit={this.addField.bind(this)}>
          <div className={platformStyle}>
            <div className=" im-mw-sm im-uppercase">New field name</div>
            <div className="im-uppercase">Type</div>

            <div />
          </div>

          <div className={platformStyle}>
            <DebounceInput
              list="fieldnames"
              placeholder="Type field name or select an item"
              minLength={1}
              debounceTimeout={300}
              className=" im-mw-sm"
              type="text"
              value={this.state.newFieldName}
              onChange={(e) => this.setState({ newFieldName: e.target.value })}
            />

            <InputDatalist
              inputId="fieldnames"
              arrayOfItems={this.getItemsForIndexFieldAsArray(
                this.props.tables[this.props.match.params.id],
                "",
                false
              )}
            />

            <select
              value={this.state.newFieldType}
              onChange={(e) => this.setState({ newFieldType: e.target.value })}
            >
              {MongoDbHelpers.getIndexTypes()}
            </select>

            <div>
              <button type="submit" className="im-btn-default im-btn-sm">
                Add
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  renderFields(index) {
    return (
      <div>
        {this.renderNewField()}
        {this.renderFieldItems(index)}
      </div>
    );
  }

  async updateIndexName(indexId, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.INDEX_MONGODB__UPDATE_INDEX_PROPERTY
    );
    try {
      await this.props.updateIndexProperty(
        this.props.match.params.id,
        indexId,
        value,
        "name"
      );
      this.buildIndexFromState();
    } finally {
      await this.props.finishTransaction();
    }
  }

  renderOptions(index) {
    return (
      <>
        <CollapsiblePanel
          panelKey="pOptionsForAllIndexTypes"
          panelTitle="Options for all index types"
          panelIsExpanded={true}
        >
          <div>
            <div className="im-mt">
              <div className="im-index-assist-grid">
                <div>Index name: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder=""
                  type="text"
                  value={index.name}
                  onChange={this.updateIndexName.bind(this, index.id)}
                />
                <div />
                <CheckboxSwitch
                  label="Add index name to index options"
                  checked={this.state.useIndexName}
                  onChange={() =>
                    this.setState(
                      { useIndexName: !this.state.useIndexName },
                      () => this.buildIndex()
                    )
                  }
                />

                <div />
                <CheckboxSwitch
                  label="Sparse"
                  checked={this.state.options.sparse}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "sparse",
                      e.target.checked
                    )
                  }
                />

                <div />
                <CheckboxSwitch
                  label="Unique"
                  checked={this.state.options.unique}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "unique",
                      e.target.checked
                    )
                  }
                />
                <div />
                <CheckboxSwitch
                  label="Hidden"
                  checked={this.state.options.hidden}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "hidden",
                      e.target.checked
                    )
                  }
                />

                <div>TTL/Expire after: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder="Value in seconds, e.g. 3600"
                  type="text"
                  value={this.state.options.expireAfterSeconds}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "expireAfterSeconds",
                      e.target.value
                    )
                  }
                />

                <div>Partial filter expression: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder=""
                  element="textarea"
                  value={Helpers.getDefinedJson(
                    this.state.options.partialFilterExpression
                  )}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "partialFilterExpression",
                      e.target.value
                    )
                  }
                />
                <div>Storage engine: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder=""
                  type="text"
                  value={this.state.options.storageEngine}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "storageEngine",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          panelKey="pOptionsForTextIndexes"
          panelTitle="Options for text indexes"
          panelIsExpanded={false}
        >
          <div>
            <div className="im-mt">
              <div className="im-index-assist-grid">
                <div>Weights: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder=""
                  element="textarea"
                  value={Helpers.getDefinedJson(this.state.options.weights)}
                  onChange={(e) =>
                    this.handleStateChange("options", "weights", e.target.value)
                  }
                />

                <div>Defuault language: </div>
                <select
                  className="im-flex-cols-first-full-width"
                  value={this.state.options.default_language}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "default_language",
                      e.target.value
                    )
                  }
                >
                  <option value="na" className="im-datatypes-tables">
                    Not set
                  </option>
                  {MongoDbHelpers.getDefaultLanguages()}
                </select>

                <div>Language override: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder=""
                  type="text"
                  value={this.state.options.language_override}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "language_override",
                      e.target.value
                    )
                  }
                />
                <div>Text index version: </div>

                <select
                  className="im-flex-cols-first-full-width"
                  value={this.state.options.textIndexVersion}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "textIndexVersion",
                      e.target.value
                    )
                  }
                >
                  <option value="na" className="im-datatypes-tables">
                    Not set
                  </option>
                  <option value="1" className="im-datatypes-tables">
                    Version 1
                  </option>
                  <option value="2" className="im-datatypes-tables">
                    Version 2
                  </option>
                  <option value="3" className="im-datatypes-tables">
                    Version 3
                  </option>
                </select>
              </div>
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          panelKey="pOptionsFor2dsphereIndexes"
          panelTitle="Options for 2dsphere indexes"
          panelIsExpanded={false}
        >
          <div>
            <div className="im-mt">
              <div className="im-index-assist-grid">
                <div>2dsphere index version: </div>

                <select
                  className="im-flex-cols-first-full-width"
                  value={this.state.options["2dsphereIndexVersion"]}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "2dsphereIndexVersion",
                      e.target.value
                    )
                  }
                >
                  <option value="na" className="im-datatypes-tables">
                    Not set
                  </option>
                  <option value="2" className="im-datatypes-tables">
                    Version 2
                  </option>
                  <option value="3" className="im-datatypes-tables">
                    Version 3
                  </option>
                </select>
              </div>
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          panelKey="pOptionsForWildcardIndexes"
          panelTitle="Options for wildcard indexes"
          panelIsExpanded={false}
        >
          <div>
            <div className="im-mt">
              <div className="im-index-assist-grid">
                <div>Wildcard projection: </div>
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  placeholder=""
                  element="textarea"
                  value={Helpers.getDefinedJson(
                    this.state.options.wildcardProjection
                  )}
                  onChange={(e) =>
                    this.handleStateChange(
                      "options",
                      "wildcardProjection",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </CollapsiblePanel>
      </>
    );
  }

  renderCollation() {
    return (
      <div>
        <div className="im-mt">
          <div className="im-index-assist-grid">
            <div>Locale: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.locale}
              onChange={(e) =>
                this.handleStateChange("collation", "locale", e.target.value)
              }
            >
              <option value="na" className="im-datatypes-tables">
                Not set
              </option>
              {MongoDbHelpers.getCollations()}
            </select>

            <div>Case level: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.caseLevel}
              onChange={(e) =>
                this.handleStateChange("collation", "caseLevel", e.target.value)
              }
            >
              {UIHelpers.makeTrueFalseSelect()}
            </select>

            <div>Case first: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.caseFirst}
              onChange={(e) =>
                this.handleStateChange("collation", "caseFirst", e.target.value)
              }
            >
              <option value="na" className="im-datatypes-tables">
                Not set
              </option>
              <option value="upper" className="im-datatypes-tables">
                Upper - Uppercase sorts before lowercase
              </option>
              <option value="lower" className="im-datatypes-tables">
                Lower - Lowercase sorts before uppercase
              </option>
              <option value="off" className="im-datatypes-tables">
                Off - Default
              </option>
            </select>

            <div>Strength: </div>

            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.strength}
              onChange={(e) =>
                this.handleStateChange("collation", "strength", e.target.value)
              }
            >
              <option value="na" className="im-datatypes-tables">
                Not set
              </option>
              <option value="1" className="im-datatypes-tables">
                1 - Comparisons of the base characters only
              </option>
              <option value="2" className="im-datatypes-tables">
                2 - Comparisons up to secondary differences, such as diacritics
              </option>
              <option value="3" className="im-datatypes-tables">
                3 - Comparisons up to tertiary differences, such as case and
                letter variants
              </option>
              <option value="4" className="im-datatypes-tables">
                4 - Limited for specific use case to consider punctuation
              </option>
              <option value="5" className="im-datatypes-tables">
                5 - Identical Level. Limited for specific use case of tie
                breaker.
              </option>
            </select>

            <div>Numeric ordering: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.numericOrdering}
              onChange={(e) =>
                this.handleStateChange(
                  "collation",
                  "numericOrdering",
                  e.target.value
                )
              }
            >
              {UIHelpers.makeTrueFalseSelect()}
            </select>

            <div>Alternate: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.alternate}
              onChange={(e) =>
                this.handleStateChange("collation", "alternate", e.target.value)
              }
            >
              <option value="na" className="im-datatypes-tables">
                Not set
              </option>
              <option value="non-ignorable" className="im-datatypes-tables">
                Non ignorable - Whitespace and punctuation are considered base
                characters
              </option>
              <option value="shifted" className="im-datatypes-tables">
                Shifted - Whitespace and punctuation are not considered base
                characters
              </option>
            </select>

            <div>Max variable: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.maxVariable}
              onChange={(e) =>
                this.handleStateChange(
                  "collation",
                  "maxVariable",
                  e.target.value
                )
              }
            >
              <option value="na" className="im-datatypes-tables">
                Not set
              </option>
              <option value="punct" className="im-datatypes-tables">
                Punct - Both whitespace and punctuation are ignorable
              </option>
              <option value="space" className="im-datatypes-tables">
                Space - Whitespace are ignorable
              </option>
            </select>

            <div>Backwards: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.backwards}
              onChange={(e) =>
                this.handleStateChange("collation", "backwards", e.target.value)
              }
            >
              {UIHelpers.makeTrueFalseSelect()}
            </select>

            <div>Normalization: </div>
            <select
              className="im-flex-cols-first-full-width"
              value={this.state.collation.normalization}
              onChange={(e) =>
                this.handleStateChange(
                  "collation",
                  "normalization",
                  e.target.value
                )
              }
            >
              {UIHelpers.makeTrueFalseSelect()}
            </select>
          </div>
        </div>
      </div>
    );
  }

  renderIndexCaptions() {
    return (
      <div className="im-index-assist im-cols-header-fixed">
        <div>Field</div>
        <div>Type</div>
        <div />
        <div />
      </div>
    );
  }

  renderIndexFieldItem(field) {
    return (
      <div key={field.id} className="im-mt-mini">
        <div className="im-index-assist">
          <DebounceInput
            value={field.name}
            onChange={(e) =>
              this.updateFieldState(field.id, "name", e.target.value)
            }
          />

          <select
            value={field.type}
            onChange={(e) =>
              this.updateFieldState(field.id, "type", e.target.value)
            }
          >
            {MongoDbHelpers.getIndexTypes()}
          </select>
          <div className="handle im-icon-16">&#xe95f;</div>
          <div
            onClick={() => this.deleteFromFieldState(field.id)}
            className="im-icon-sm im-pointer"
          >
            <i className="im-icon-Trash16 im-icon-16" />
          </div>
        </div>
      </div>
    );
  }

  getIndexFieldItems() {
    return _.size(this.state.fields) > 0 ? (
      <>
        {this.renderIndexCaptions()}
        {_.map(this.state.fields, (field) => this.renderIndexFieldItem(field))}
      </>
    ) : (
      <>
        <div className="im-message im-padding-md">
          Add a field to the index.
          <br />
          You can type a field name or click in a text field, open the drop-down
          menu, and select an available field name.
        </div>
      </>
    );
  }

  getIndexSyntaxCode(index, tableName) {
    return (
      <div>
        <pre className="script">
          <SyntaxHighlighter
            language="javascript"
            style={
              this.props.settings.theme === "im-dark"
                ? tomorrowNightBright
                : tomorrow
            }
            customStyle={{
              backgroundColor: "transparent"
            }}
          >
            {this.getIndexBeautifiedCode(index, tableName)}
          </SyntaxHighlighter>
        </pre>
      </div>
    );
  }

  getIndexBeautifiedCode(index, tableName) {
    return js_beautify(getMongoDbCreateIndexStatement(index, tableName), {
      indent_size: 2,
      preserve_newlines: true,
      keep_array_indentation: true
    });
  }

  renderTabs(index) {
    return (
      <div className="im-tabs-area">
        <div>
          <TabPanel className={"tabFields im-tab-panel"}>
            {this.renderFields(index)}
          </TabPanel>
          <TabPanel className={"tabProperties im-tab-panel"}>
            {this.renderOptions(index)}
          </TabPanel>
          <TabPanel className={"tabCollation im-tab-panel"}>
            {this.renderCollation()}
          </TabPanel>
          <TabPanel className={"tabJson im-tab-panel"}>
            <IndexMongoDb index={index} />
          </TabPanel>
          <TabPanel className={"tabCode im-tab-panel"}>
            <ItemSql
              sql={this.getIndexSyntaxCode(
                index,
                this.props.tables[this.props.match.params.id].name
              )}
            />
          </TabPanel>
        </div>
      </div>
    );
  }

  async handleIndexColChangePlatform(
    indexId,
    indexColumnRefId,
    property,
    bool,
    platform,
    event
  ) {
    const value = event.target.value;
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.INDEX_ASSISTANT_MONGODB__UPDATE_INDEX_COLUMN_PROPERTY
    );
    try {
      const index = this.props.tables[this.props.match.params.id].indexes.find(
        (ind) => ind.id === indexId
      );
      const columnReference = index.cols.find(
        (colref) => colref.id === indexColumnRefId
      );
      const current = columnReference[platform];
      const next = {
        ...current,
        [property]: bool ? checked : value
      };
      await this.props.updateIndexColumnProperty(
        this.props.match.params.id,
        indexId,
        indexColumnRefId,
        next,
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }
}

function mapStateToProps(state) {
  return {
    localization: state.localization,
    name: state.model.name,
    tables: state.tables,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleIndexAssistantModal,
        updateIndexProperty,
        updateIndexColumnProperty,
        addNotification,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IndexAssistantMongoDb)
);
