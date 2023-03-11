import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { updateIndexProperty } from "../../actions/tables";
import { withRouter } from "react-router-dom";

class IndexMSSQL extends Component {
  constructor(props) {
    super(props);
    this.getIndexExtendedPropertiesMSSQL =
      this.getIndexExtendedPropertiesMSSQL.bind(this);
  }

  getIndexProperties(index) {
    switch (index.mssql.type) {
      case "SPATIAL":
        return this.getIndexSpatial(index);
      case "XML":
        return this.getIndexXml(index);
      case "COLUMNSTORE":
        return this.getIndexColumnstore(index);
      case "FULLTEXT":
        return this.getIndexFulltext(index);
      case "RELATIONAL":
      default:
        return this.getIndexRelational(index);
    }
  }

  getIndexRelational(index) {
    return (
      <>
        <div />
        <CheckboxSwitch
          label="Unique"
          checked={index.unique}
          onChange={this.props.handleCheckboxChange.bind(
            this,
            index.id,
            "unique"
          )}
        />
        <div />
        <CheckboxSwitch
          label="Clustered"
          checked={index.mssql.clustered ?? false}
          onChange={this.props.handleCheckboxChangePlatform.bind(
            this,
            index.id,
            "clustered",
            "mssql"
          )}
        />
        <div>Where: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.where)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "where",
            "mssql"
          )}
        />
        <div>With: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.with)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "with",
            "mssql"
          )}
        />
        <div>On filegroup: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={Helpers.gv(index.mssql && index.mssql.onFilegroup)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "onFilegroup",
            "mssql"
          )}
        />
      </>
    );
  }

  getIndexSpatial(index) {
    return (
      <>
        <div>Using: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.using)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "using",
            "mssql"
          )}
        />
        <div>With: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.with)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "with",
            "mssql"
          )}
        />
        <div>On filegroup: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.onFilegroup)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "onFilegroup",
            "mssql"
          )}
        />
      </>
    );
  }

  getIndexXml(index) {
    return (
      <>
        <div />
        <CheckboxSwitch
          label="Primary"
          checked={index.mssql.primaryxml ?? false}
          onChange={this.props.handleCheckboxChangePlatform.bind(
            this,
            index.id,
            "primaryxml",
            "mssql"
          )}
        />

        <div>Path XML index: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.pathXMLIndex)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "pathXMLIndex",
            "mssql"
          )}
        />
        <div>With: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.with)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "with",
            "mssql"
          )}
        />

        <div>On filegroup: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.onFilegroup)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "onFilegroup",
            "mssql"
          )}
        />
      </>
    );
  }

  getIndexFulltext(index) {
    return (
      <>
        <div>Key index: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.keyIndex)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "keyIndex",
            "mssql"
          )}
        />
        <div>With: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.with)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "with",
            "mssql"
          )}
        />

        <div>On filegroup: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.onFilegroup)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "onFilegroup",
            "mssql"
          )}
        />
      </>
    );
  }

  getIndexColumnstore(index) {
    return (
      <>
        <div />
        <CheckboxSwitch
          label="Clustered"
          checked={index.mssql.clustered ?? false}
          onChange={this.props.handleCheckboxChangePlatform.bind(
            this,
            index.id,
            "clustered",
            "mssql"
          )}
        />
        <div>Where: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.where)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "where",
            "mssql"
          )}
        />
        <div>Order: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.order)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "order",
            "mssql"
          )}
        />
        <div>With: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element="textarea"
          value={Helpers.gv(index.mssql && index.mssql.with)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "with",
            "mssql"
          )}
        />
        <div>On filegroup: </div>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={Helpers.gv(index.mssql && index.mssql.onFilegroup)}
          onChange={this.props.handleTextChangePlatform.bind(
            this,
            index.id,
            "onFilegroup",
            "mssql"
          )}
        />
      </>
    );
  }

  getIndexExtendedPropertiesMSSQL(index) {
    return (
      <div className="im-mt">
        <div className="im-content-spacer-md" />
        <div className="im-properties-grid">
          <div>Type: </div>
          <select
            value={index.mssql.type}
            onChange={this.props.handleTextChangePlatform.bind(
              this,
              index.id,
              "type",
              "mssql"
            )}
          >
            <option value="RELATIONAL">Relational (Default)</option>
            <option value="SPATIAL">Spatial</option>
            <option value="XML">XML</option>
            <option value="FULLTEXT">Fulltext</option>
            <option value="COLUMNSTORE">Columnstore</option>
          </select>

          {this.getIndexProperties(index)}

          <div>Description: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(index.mssql && index.mssql.desc)}
            onChange={this.props.handleTextChangePlatform.bind(
              this,
              index.id,
              "desc",
              "mssql"
            )}
          />
        </div>
      </div>
    );
  }

  render() {
    if (this.props.index) {
      let index = this.props.index;
      return this.getIndexExtendedPropertiesMSSQL(index);
    }
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateIndexProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IndexMSSQL)
);
