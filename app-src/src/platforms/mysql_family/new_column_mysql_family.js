import React, { Component } from "react";

import CheckboxCustom from "../../components/checkbox_custom";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import MySQLFamilyHelpers from "./helpers_mysql_family";
import { TEST_ID } from "common";
import _ from "lodash";
import { connect } from "react-redux";

class NewColumnMySQLFamily extends Component {
  constructor(props) {
    super(props);
    this.refNewColumn = React.createRef();
    this.state = { valueDatatype: "" };
    this.focus = this.focus.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.passedTableId !== this.props.passedTableId) {
      if (
        this.props.passedTableId !== undefined &&
        this.props.tables[this.props.passedTableId].embeddable === true
      ) {
        this.props.handleStateChange(
          "valueDatatype",
          MySQLFamilyHelpers.getDefaultEmbeddableType()
        );
      } else {
        this.props.handleStateChange(
          "valueDatatype",
          MySQLFamilyHelpers.getDefaultType()
        );
      }
    }
  }

  componentDidMount(d) {
    if (
      this.props.passedTableId !== undefined &&
      this.props.tables[this.props.passedTableId].embeddable === true
    ) {
      this.props.handleStateChange("valueDatatype", "string");
    } else {
      this.props.handleStateChange("valueDatatype", "INT");
    }
  }

  focus() {
    this.refNewColumn.current.focus();
  }

  renderDataTypesMySQL(fn, colDatatype) {
    return (
      <select value={this.props.valueDatatype} onChange={fn}>
        {MySQLFamilyHelpers.makeDatatypes()}
        {this.props.renderEmbeddable(this.props.passedTableId)}
        {this.props.renderCustomDatatypes()}
      </select>
    );
  }

  renderDataTypes() {
    if (
      this.props.passedTableId !== undefined &&
      this.props.tables[this.props.passedTableId].embeddable === true
    ) {
      return this.props.renderDataTypesJson(
        (e) => this.props.handleStateChange("valueDatatype", e.target.value),
        this.props.valueDatatype
      );
    } else {
      return this.renderDataTypesMySQL(
        (e) => this.props.handleStateChange("valueDatatype", e.target.value),
        this.props.valueDatatype
      );
    }
  }

  renderCaptionByModelType() {
    if (
      this.props.passedTableId !== undefined &&
      this.props.tables[this.props.passedTableId].embeddable === true
    ) {
      return (
        <div className="im-align-center im-uppercase">
          {this.props.localization.L_LIST}
        </div>
      );
    } else {
      return <div className="im-uppercase">Param</div>;
    }
  }

  renderNewColsByModelType() {
    if (
      this.props.passedTableId !== undefined &&
      this.props.tables[this.props.passedTableId].embeddable === true
    ) {
      return (
        <CheckboxCustom
          checked={this.state.valueList}
          onChange={(e) =>
            this.props.handleStateChange("valueList", e.target.checked)
          }
          label=""
        />
      );
    } else {
      return (
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          size="2"
          type="text"
          value={this.state.valueParam}
          onChange={(e) =>
            this.props.handleStateChange("valueParam", e.target.value)
          }
        />
      );
    }
  }

  render() {
    let platformStyle = "dNewColRowForm dNewColRowForm" + this.props.type;
    if (
      this.props.passedTableId !== undefined &&
      this.props.tables[this.props.passedTableId].embeddable === true
    ) {
      platformStyle = "dNewColRowForm  dNewColRowFormJSON";
    }
    return (
      <div className="newColForm">
        <form onSubmit={this.props.handleNewColSubmit.bind(this)}>
          <div className={platformStyle}>
            <div className=" im-mw-sm im-uppercase">
              {_.upperFirst(this.props.localization.L_COLUMN)} name
            </div>
            <div className="im-uppercase">Datatype</div>
            {this.renderCaptionByModelType()}
            {this.props.passedTableId !== undefined &&
            this.props.tables[this.props.passedTableId].embeddable === true ? (
              ""
            ) : (
              <div className="im-align-center im-uppercase">
                {this.props.localization.L_PK}
              </div>
            )}
            <div className="im-align-center im-uppercase">
              {this.props.localization.L_NN}
            </div>
            <div />
          </div>

          <div className={platformStyle}>
            <DebounceInput
              data-testid={TEST_ID.COLUMNS.INPUT_NEW_NAME}
              minLength={1}
              debounceTimeout={300}
              className=" im-mw-sm"
              type="text"
              value={Helpers.gv(this.props.newColName)}
              onChange={(e) =>
                this.props.handleStateChange("valueName", e.target.value)
              }
            />

            {this.renderDataTypes()}
            {this.renderNewColsByModelType()}

            {this.props.passedTableId !== undefined &&
            this.props.tables[this.props.passedTableId].embeddable === true ? (
              ""
            ) : (
              <CheckboxCustom
                checked={this.state.valuePk}
                onChange={(e) =>
                  this.props.handleStateChange("valuePk", e.target.checked)
                }
                label=""
              />
            )}

            <CheckboxCustom
              checked={this.state.valueNn}
              onChange={(e) =>
                this.props.handleStateChange("valueNn", e.target.checked)
              }
              label=""
            />

            <div>
              <button
                data-testid={TEST_ID.COLUMNS.BUTTON_ADD_NEW}
                type="submit"
                className="im-btn-default im-btn-sm"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    localization: state.localization
  };
}

export default connect(mapStateToProps)(NewColumnMySQLFamily);
