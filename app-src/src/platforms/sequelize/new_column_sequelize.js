import React, { Component } from "react";

import CheckboxCustom from "../../components/checkbox_custom";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import SequelizeHelpers from "./helpers_sequelize";
import { TEST_ID } from "common";
import _ from "lodash";
import { connect } from "react-redux";

class NewColumnSequelize extends Component {
  constructor(props) {
    super(props);
    this.refNewColumn = React.createRef();
    this.state = {};
    this.focus = this.focus.bind(this);
  }

  componentDidMount() {
    this.props.handleStateChange(
      "valueDatatype",
      SequelizeHelpers.getSequelizeDefaultType()
    );
  }

  focus() {
    this.refNewColumn.current.focus();
  }

  renderDataTypesSequelize(fn, colDatatype) {
    return (
      <select value={this.props.valueDatatype} onChange={fn}>
        {SequelizeHelpers.makeDatatypesSequelize()}
        {this.props.renderCustomDatatypes()}
      </select>
    );
  }

  renderDataTypes() {
    return this.renderDataTypesSequelize(
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

export default connect(mapStateToProps)(NewColumnSequelize);
