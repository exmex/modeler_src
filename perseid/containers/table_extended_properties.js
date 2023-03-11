import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import ButtonEditLarge from "../components/button_edit_large";
import CheckboxSwitch from "../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import InputDatalist from "../components/input_datalist";
import ModalTextEditor from "../containers/modals/modal_text_editor";
import { ModelTypes } from "../enums/enums";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { toggleTextEditorModal } from "../actions/ui";
import { updateTableProperty } from "../actions/tables";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class TableExtendedProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY
    );
    try {
      await this.props.updateTableProperty(
        this.props.match.params.id,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY_BOOLEAN
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      checked,
      propName
    );
    await this.props.finishTransaction();
  }

  async handleTextChangePlatform(property, platform, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY_PLATFORM
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      {
        ...this.props.tables[this.props.match.params.id][platform],
        [property]: value
      },
      platform
    );
    await this.props.finishTransaction();
  }

  async handleCheckboxChangePlatform(property, platform, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY_PLATFORM_BOOLEAN
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      {
        ...this.props.tables[this.props.match.params.id][platform],
        [property]: checked
      },
      platform
    );
    await this.props.finishTransaction();
  }

  async handleSelectChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      value,
      propName
    );
    await this.props.finishTransaction();
  }

  renderByModelType() {
    switch (this.props.type) {
      case ModelTypes.SEQUELIZE:
        return this.renderSequelize();
      case ModelTypes.MONGODB:
        return this.renderMongoDb();
      case ModelTypes.GRAPHQL:
        return this.renderGraphQl();
      case ModelTypes.MONGOOSE:
        return this.renderMongoose();
      case ModelTypes.PG:
        return this.renderPG();
      case ModelTypes.SQLITE:
        return this.renderSQLite();
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return this.renderMySQL();
      case ModelTypes.JSONSCHEMA:
      case ModelTypes.OPENAPI:
      case ModelTypes.FULLJSON:
        return this.renderJsonSchema();
      default:
        return <></>;
    }
  }

  openInLargeWindow(obj, propertyName, header) {
    this.props.toggleTextEditorModal(
      <ModalTextEditor
        textEditorId={uuidv4()}
        onChange={this.handleTextChange.bind(this, propertyName)}
        modalHeader={_.upperFirst(header)}
        text={Helpers.gv(obj[propertyName])}
      />
    );
  }

  openInLargeWindowPlatform(obj, platform, propertyName, header) {
    this.props.toggleTextEditorModal(
      <ModalTextEditor
        textEditorId={uuidv4()}
        onChange={this.handleTextChangePlatform.bind(
          this,
          propertyName,
          platform
        )}
        modalHeader={_.upperFirst(header)}
        text={Helpers.gv(obj[platform][propertyName])}
      />
    );
  }

  renderMongoDb() {
    return (
      <div className="im-properties-grid">
        <div />
        <CheckboxSwitch
          label="Auto index id"
          checked={Helpers.gch(
            this.props.tables[this.props.match.params.id].autoIndexId
          )}
          onChange={this.handleCheckboxChange.bind(this, "autoIndexId")}
        />
        <div />
        <CheckboxSwitch
          label="Capped"
          checked={Helpers.gch(
            this.props.tables[this.props.match.params.id].capped
          )}
          onChange={this.handleCheckboxChange.bind(this, "capped")}
        />
        <div>Size: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].size
            )}
            onChange={this.handleTextChange.bind(this, "size")}
          />
          <div />
        </div>
        <div>Max: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].max
            )}
            onChange={this.handleTextChange.bind(this, "max")}
          />
          <div />
        </div>
        <div>Validation level: </div>
        <div className="im-grid-right-icon">
          <select
            value={Helpers.gsel(
              this.props.tables[this.props.match.params.id].validationLevel
            )}
            onChange={this.handleSelectChange.bind(this, "validationLevel")}
          >
            <option value="na">Not defined</option>
            <option value="off">Off</option>
            <option value="strict">Strict</option>
            <option value="moderate">Moderate</option>
          </select>
          <div />
        </div>
        <div>Validation action: </div>
        <div className="im-grid-right-icon">
          <select
            value={Helpers.gsel(
              this.props.tables[this.props.match.params.id].validationAction
            )}
            onChange={this.handleSelectChange.bind(this, "validationAction")}
          >
            <option value="na">Not defined</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
          </select>
          <div />
        </div>
        <div>Validation:</div>
        <div className="im-grid-right-icon">
          <DebounceInput
            element="textarea"
            minLength={1}
            debounceTimeout={300}
            className="im-textarea"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].validation
            )}
            onChange={this.handleTextChange.bind(this, "validation")}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              this.props.tables[this.props.match.params.id],
              "validation",
              "Validation"
            )}
          />
        </div>
        <div>Collation: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].collation
            )}
            onChange={this.handleTextChange.bind(this, "collation")}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              this.props.tables[this.props.match.params.id],
              "collation",
              "Collation"
            )}
          />
        </div>

        <div>Other options: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].others
            )}
            onChange={this.handleTextChange.bind(this, "others")}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              this.props.tables[this.props.match.params.id],
              "others",
              "Other options"
            )}
          />
        </div>
      </div>
    );
  }

  renderGraphQl() {
    return (
      <div className="im-properties-grid">
        <div>Directive: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].directive
            )}
            onChange={this.handleTextChange.bind(this, "directive")}
          />{" "}
          <div />
        </div>
      </div>
    );
  }

  renderMongoose() {
    return (
      <div className="im-properties-grid">
        <div>Schema options: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].others
            )}
            onChange={this.handleTextChange.bind(this, "others")}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              this.props.tables[this.props.match.params.id],
              "others",
              "Schema options"
            )}
          />
        </div>
      </div>
    );
  }

  renderSequelize() {
    return (
      <div className="im-properties-grid">
        <div />
        <CheckboxSwitch
          label="Timestamps"
          checked={Helpers.gch(
            this.props.tables[this.props.match.params.id].timestamps
          )}
          onChange={this.handleCheckboxChange.bind(this, "timestamps")}
        />

        <div />

        <CheckboxSwitch
          label="Paranoid"
          checked={Helpers.gch(
            this.props.tables[this.props.match.params.id].paranoid
          )}
          onChange={this.handleCheckboxChange.bind(this, "paranoid")}
        />

        <div />
        <CheckboxSwitch
          label="Freeze Table Name"
          checked={Helpers.gch(
            this.props.tables[this.props.match.params.id].freezeTableName
          )}
          onChange={this.handleCheckboxChange.bind(this, "freezeTableName")}
        />

        <div />
        <CheckboxSwitch
          label="Version"
          checked={Helpers.gch(
            this.props.tables[this.props.match.params.id].version
          )}
          onChange={this.handleCheckboxChange.bind(this, "version")}
        />
        {this.props.tables[this.props.match.params.id].underscored !==
          "undefined" && (
          <>
            <div />
            <CheckboxSwitch
              label="Underscored"
              checked={Helpers.gch(
                this.props.tables[this.props.match.params.id].underscored
              )}
              onChange={this.handleCheckboxChange.bind(this, "underscored")}
            />
          </>
        )}
        <div>Singular name: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].singular
            )}
            onChange={this.handleTextChange.bind(this, "singular")}
          />{" "}
          <div />
        </div>

        <div>Plural name: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].plural
            )}
            onChange={this.handleTextChange.bind(this, "plural")}
          />{" "}
          <div />
        </div>

        <div>Table name: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].tablename
            )}
            onChange={this.handleTextChange.bind(this, "tablename")}
          />{" "}
          <div />
        </div>

        <div>Engine: </div>
        <div className="im-grid-right-icon">
          <select
            value={this.props.tables[this.props.match.params.id].tabletype}
            onChange={Helpers.gsel(
              this.handleSelectChange.bind(this, "tabletype")
            )}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="InnoDB">InnoDB</option>
            <option value="MyISAM">MyISAM</option>
            <option value="MEMORY">Memory</option>
            <option value="CSV">CSV</option>
            <option value="ARCHIVE">Archive</option>
            <option value="EXAMPLE">Example</option>
            <option value="FEDERATED">Federated</option>
            <option value="HEAP">Heap</option>
            <option value="MERGE">Merge</option>
          </select>
          <div />
        </div>
        <div>Collation: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].collation
            )}
            onChange={this.handleTextChange.bind(this, "collation")}
          />
          <div />
        </div>
        <div>Char set: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].charset
            )}
            onChange={this.handleTextChange.bind(this, "charset")}
          />
          <div />
        </div>
        <div>Autoincrement: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].initautoinc
            )}
            onChange={this.handleTextChange.bind(this, "initautoinc")}
          />
          <div />
        </div>
      </div>
    );
  }

  renderMariaDB() {
    return (
      <div className="im-properties-grid">
        <div>Database: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].database
            )}
            onChange={this.handleTextChange.bind(this, "database")}
          />
          <div />
        </div>
        <div>Engine: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            list="engine"
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].tabletype
            )}
            onChange={this.handleSelectChange.bind(this, "tabletype")}
          />
          <InputDatalist
            inputId="engine"
            arrayOfItems={[
              "na",
              "Default",
              "InnoDB",
              "MyISAM",
              "MEMORY",
              "CSV",
              "ARCHIVE",
              "EXAMPLE",
              "FEDERATED",
              "HEAP",
              "MERGE"
            ]}
          />{" "}
          <div />
        </div>
        <div>Row format: </div>
        <div className="im-grid-right-icon">
          <select
            value={Helpers.gsel(
              this.props.tables[this.props.match.params.id].rowformat
            )}
            onChange={this.handleSelectChange.bind(this, "rowformat")}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="Compact">Compact</option>
            <option value="Compressed">Compressed</option>
            <option value="Dynamic">Dynamic</option>
            <option value="Fixed">Fixed</option>
            <option value="Redundant">Redundant</option>
          </select>
          <div />
        </div>
        <div>Collation: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].collation
            )}
            onChange={this.handleTextChange.bind(this, "collation")}
          />
          <div />
        </div>
        <div>Char set: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].charset
            )}
            onChange={this.handleTextChange.bind(this, "charset")}
          />
          <div />
        </div>
        <div>Autoincrement: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].initautoinc
            )}
            onChange={this.handleTextChange.bind(this, "initautoinc")}
          />
          <div />
        </div>
        <div />
        <div>
          <CheckboxSwitch
            label="If not Exists"
            checked={Helpers.gch(
              this.props.tables[this.props.match.params.id].ifnotexists
            )}
            onChange={this.handleCheckboxChange.bind(this, "ifnotexists")}
          />

          <CheckboxSwitch
            label="Temporary"
            checked={Helpers.gch(
              this.props.tables[this.props.match.params.id].temporary
            )}
            onChange={this.handleCheckboxChange.bind(this, "temporary")}
          />
        </div>
      </div>
    );
  }

  renderMySQL() {
    return (
      <div className="im-properties-grid">
        <div>Database: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].database
            )}
            onChange={this.handleTextChange.bind(this, "database")}
          />
          <div />
        </div>
        <div>Engine: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            list="engine"
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].tabletype
            )}
            onChange={this.handleSelectChange.bind(this, "tabletype")}
          />
          <InputDatalist
            inputId="engine"
            arrayOfItems={[
              "na",
              "Default",
              "ARCHIVE",
              "BLACKHOLE",
              "CSV",
              "FEDERATED",
              "InnoDB",
              "MEMORY",
              "MRG_MYISAM",
              "MyISAM",
              "PERFORMANCE_SCHEMA"
            ]}
          />{" "}
          <div />
        </div>
        <div>Row format: </div>
        <div className="im-grid-right-icon">
          <select
            value={Helpers.gsel(
              this.props.tables[this.props.match.params.id].rowformat
            )}
            onChange={this.handleSelectChange.bind(this, "rowformat")}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="Compact">Compact</option>
            <option value="Compressed">Compressed</option>
            <option value="Dynamic">Dynamic</option>
            <option value="Fixed">Fixed</option>
            <option value="Redundant">Redundant</option>
          </select>
          <div />
        </div>
        <div>Collation: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].collation
            )}
            onChange={this.handleTextChange.bind(this, "collation")}
          />
          <div />
        </div>
        <div>Char set: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].charset
            )}
            onChange={this.handleTextChange.bind(this, "charset")}
          />
          <div />
        </div>
        <div>Autoincrement: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].initautoinc
            )}
            onChange={this.handleTextChange.bind(this, "initautoinc")}
          />
          <div />
        </div>
        <div />
        <div>
          <CheckboxSwitch
            label="If not Exists"
            checked={Helpers.gch(
              this.props.tables[this.props.match.params.id].ifnotexists
            )}
            onChange={this.handleCheckboxChange.bind(this, "ifnotexists")}
          />

          <CheckboxSwitch
            label="Temporary"
            checked={Helpers.gch(
              this.props.tables[this.props.match.params.id].temporary
            )}
            onChange={this.handleCheckboxChange.bind(this, "temporary")}
          />
        </div>
      </div>
    );
  }

  renderPG() {
    if (
      this.props.tables[this.props.match.params.id].objectType === "composite"
    ) {
      return (
        <div className="im-properties-grid">
          <div>Schema: </div>
          <div className="im-grid-right-icon">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(
                this.props.tables[this.props.match.params.id].pg &&
                  this.props.tables[this.props.match.params.id].pg.schema
              )}
              onChange={this.handleTextChangePlatform.bind(
                this,
                "schema",
                "pg"
              )}
              data-testid="schema"
            />
            <div />
          </div>
        </div>
      );
    } else {
      return (
        <div className="im-properties-grid">
          <div>Tablespace: </div>
          <div className="im-grid-right-icon">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(
                this.props.tables[this.props.match.params.id].pg &&
                  this.props.tables[this.props.match.params.id].pg.tablespace
              )}
              onChange={this.handleTextChangePlatform.bind(
                this,
                "tablespace",
                "pg"
              )}
            />
            <div />
          </div>
          <div>Storage Parameters: </div>
          <div className="im-grid-right-icon">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              element="textarea"
              value={Helpers.gv(
                this.props.tables[this.props.match.params.id].pg &&
                  this.props.tables[this.props.match.params.id].pg
                    .storageParameters
              )}
              onChange={this.handleTextChangePlatform.bind(
                this,
                "storageParameters",
                "pg"
              )}
            />
            <ButtonEditLarge
              onClick={this.openInLargeWindowPlatform.bind(
                this,
                this.props.tables[this.props.match.params.id],
                "pg",
                "storageParameters",
                "Storage Parameters"
              )}
            />
          </div>
          <div>Partitions: </div>
          <div className="im-grid-right-icon">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              element="textarea"
              value={Helpers.gv(
                this.props.tables[this.props.match.params.id].pg &&
                  this.props.tables[this.props.match.params.id].pg.partition
              )}
              onChange={this.handleTextChangePlatform.bind(
                this,
                "partition",
                "pg"
              )}
            />
            <ButtonEditLarge
              onClick={this.openInLargeWindowPlatform.bind(
                this,
                this.props.tables[this.props.match.params.id],
                "pg",
                "partition",
                "Partitions"
              )}
            />
          </div>
          <div>Inherits:</div>
          <div className="im-grid-right-icon">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              element="textarea"
              value={Helpers.gv(
                this.props.tables[this.props.match.params.id].pg &&
                  this.props.tables[this.props.match.params.id].pg.inherits
              )}
              onChange={this.handleTextChangePlatform.bind(
                this,
                "inherits",
                "pg"
              )}
            />
            <ButtonEditLarge
              onClick={this.openInLargeWindowPlatform.bind(
                this,
                this.props.tables[this.props.match.params.id],
                "pg",
                "inherits",
                "Inherits"
              )}
            />
          </div>
          <div>Schema: </div>
          <div className="im-grid-right-icon">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(
                this.props.tables[this.props.match.params.id].pg &&
                  this.props.tables[this.props.match.params.id].pg.schema
              )}
              onChange={this.handleTextChangePlatform.bind(
                this,
                "schema",
                "pg"
              )}
              data-testid="schema"
            />
            <div />
          </div>
          <div />
          <CheckboxSwitch
            label={"Row level security"}
            checked={
              this.props.tables[this.props.match.params.id].pg &&
              this.props.tables[this.props.match.params.id].pg.rowsecurity
            }
            onChange={this.handleCheckboxChangePlatform.bind(
              this,
              "rowsecurity",
              "pg"
            )}
          />
        </div>
      );
    }
  }

  renderJsonSchema() {
    return <div className="im-properties-grid"></div>;
  }

  renderSQLite() {
    return (
      <div className="im-properties-grid">
        <div />
        <CheckboxSwitch
          label={"WITHOUT ROWID"}
          checked={
            this.props.tables[this.props.match.params.id].sqlite &&
            this.props.tables[this.props.match.params.id].sqlite.withoutrowid
          }
          onChange={this.handleCheckboxChangePlatform.bind(
            this,
            "withoutrowid",
            "sqlite"
          )}
        />
      </div>
    );
  }

  render() {
    return <div>{this.renderByModelType()}</div>;
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateTableProperty,
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
  connect(mapStateToProps, mapDispatchToProps)(TableExtendedProperties)
);
