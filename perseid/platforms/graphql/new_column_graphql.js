import React, { Component } from "react";

import CheckboxCustom from "../../components/checkbox_custom";
import { DebounceInput } from "react-debounce-input";
import GraphQlHelpers from "./helpers_graphql";
import Helpers from "../../helpers/helpers";
import { TEST_ID } from "common";
import _ from "lodash";
import { connect } from "react-redux";

class NewColumnGraphQl extends Component {
  constructor(props) {
    super(props);
    this.refNewColumn = React.createRef();
    this.state = {};
    this.focus = this.focus.bind(this);
  }

  componentDidMount() {
    this.props.handleStateChange(
      "valueDatatype",
      GraphQlHelpers.getGraphQlDefaultType()
    );
  }

  changePkValue(e) {
    this.props.handleStateChange("valueName", e.target.value);
    if (
      this.props.tables[this.props.passedTableId].objectType === "interface" ||
      this.props.tables[this.props.passedTableId].objectType === "union"
    ) {
      this.state.valuePk !== true &&
        this.props.handleStateChange("valuePk", true);
    } else {
      this.props.handleStateChange("valuePk", false);
    }
  }

  focus() {
    this.refNewColumn.current.focus();
  }

  renderDataTypesGraphQl(fn, colDatatype) {
    return (
      <select value={this.props.valueDatatype} onChange={fn}>
        {GraphQlHelpers.makeDatatypesGraphQl()}

        {/*this.props.renderSchemas()*/}
        {this.props.renderOtherObjects("Enum", this.props.localization.L_ENUM)}
        {this.props.renderOtherObjects(
          "Scalar",
          this.props.localization.L_SCALAR
        )}
        {this.props.renderCustomDatatypes()}
      </select>
    );
  }

  renderDataTypes() {
    return this.renderDataTypesGraphQl(
      (e) => this.props.handleStateChange("valueDatatype", e.target.value),
      this.props.valueDatatype
    );
  }

  renderCaptionByModelType() {
    return (
      <div className="im-align-center im-uppercase">
        {this.props.localization.L_LIST}
      </div>
    );
  }

  renderNewColsByModelType() {
    return (
      <CheckboxCustom
        checked={this.state.valueList}
        onChange={(e) =>
          this.props.handleStateChange("valueList", e.target.checked)
        }
        label=""
      />
    );
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
            {/*this.props.passedTableId !== undefined &&
            this.props.tables[this.props.passedTableId].embeddable === true ? (
              ""
            ) : (
              <div className="im-align-center im-uppercase">
                {this.props.localization.L_PK}
              </div>
            )*/}
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
              onChange={(e) => this.changePkValue(e)}
            />

            {this.renderDataTypes()}
            {this.renderNewColsByModelType()}
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

export default connect(mapStateToProps)(NewColumnGraphQl);
