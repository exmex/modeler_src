import React, { Component } from "react";

import ButtonEditLarge from "../../components/button_edit_large";
import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import DetailPanel from "../../components/detail_panel";
import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import { MessageIcon } from "../../components/message_icon";
import ModalTextEditor from "../../containers/modals/modal_text_editor";
import SpecificationAssistantJsonSchema from "./specification_assistant_jsonschema";
import { TableObjectTypesJson } from "./class_table_jsonschema";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getRefCode } from "./generator_jsonschema";
import { toggleTextEditorModal } from "../../actions/ui";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router";

class ColumnsJsonSchemaDetailPanel extends Component {
  render() {
    const internalDataTypeTable = this.props.tables[this.props.col.datatype];
    const internalDataTypeName = internalDataTypeTable?.objectType ?? "";

    if (
      JsonSchemaHelpers.isChoice(internalDataTypeName) ||
      JsonSchemaHelpers.isCondition(internalDataTypeName) ||
      JsonSchemaHelpers.isJsonSchemaKey(internalDataTypeName)
    ) {
      return this.props.isCollapsible
        ? this.renderCollapsibleDetailPanelSimple()
        : this.renderDetailPanelSimple();
    } else {
      const rootSchemaTable = JsonSchemaHelpers.getRootSchemaTable(
        this.props.tables
      );
      const definitionKeyName = JsonSchemaHelpers.getDefinitionKeyName(
        rootSchemaTable,
        {
          jsonCodeSettings: this.props.jsonCodeSettings,
          type: this.props.type
        }
      );
      return this.props.isCollapsible
        ? this.renderCollapsiblDetailPanelJsonSchema(definitionKeyName)
        : this.renderDetailPanelJsonSchema(definitionKeyName);
    }
  }

  renderRefField(col, { definitionKeyName }) {
    const internalNestedTableObjectType =
      this.props.tables[col.datatype]?.objectType;
    if (
      internalNestedTableObjectType === TableObjectTypesJson.ANY &&
      getRefCode(col, this.props.tables, {
        definitionKeyName,
        catalogColumns: this.props.catalogColumns.colToTable
      }) === ""
    ) {
      return (
        <>
          <div>Ref:</div>
          <div className="im-grid-right-icon">
            <DebounceInput
              placeholder={"$ref value"}
              minLength={1}
              debounceTimeout={300}
              type="text"
              className={" im-mw-sm col_" + col.id}
              value={Helpers.gv(col.ref)}
              onChange={this.props.handleTextChange.bind(this, col.id, "ref")}
            />
          </div>
        </>
      );
    } else {
      if (
        JsonSchemaHelpers.isReferenced(
          col,
          this.props.tables,
          this.props.catalogColumns.colToTable
        ) ||
        JsonSchemaHelpers.isReferencedSubschema(col, this.props.tables)
      ) {
        return (
          <>
            <div>Ref:</div>
            <div className="im-grid-right-icon">
              <DebounceInput
                placeholder={"$ref value"}
                disabled={true}
                minLength={1}
                debounceTimeout={300}
                type="text"
                className={"im-disabled im-mw-sm col_" + col.id}
                value={getRefCode(col, this.props.tables, {
                  definitionKeyName,
                  catalogColumns: this.props.catalogColumns.colToTable
                })}
                onChange={() => {}}
              />
            </div>
          </>
        );
      }
    }
  }

  // JSON OBJECT / ARRAY / DATATYPE
  jsonSchemaDetail(definitionKeyName) {
    const internalNestedTableObjectType =
      this.props.tables[this.props.col.datatype]?.objectType;

    return (
      <>
        {this.renderRefField(this.props.col, { definitionKeyName })}
        {(JsonSchemaHelpers.isReferenced(
          this.props.col,
          this.props.tables,
          this.props.catalogColumns.colToTable
        ) ||
          JsonSchemaHelpers.isReferencedSubschema(
            this.props.col,
            this.props.tables
          )) && (
          <>
            <div />
            <CheckboxSwitch
              label="Use schema $id"
              checked={Helpers.gch(this.props.col.useSchemaId)}
              onChange={this.props.handleCheckboxChange.bind(
                this,
                this.props.col.id,
                "useSchemaId"
              )}
            />
          </>
        )}
        {JsonSchemaHelpers.canBeRequired(
          this.props.match.params.id,
          this.props.tables,
          this.props.catalogColumns
        ) && (
          <>
            <div />
            <CheckboxSwitch
              label="Required"
              checked={Helpers.gch(this.props.col.nn)}
              onChange={this.props.handleCheckboxChange.bind(
                this,
                this.props.col.id,
                "nn"
              )}
            />
          </>
        )}
        {this.renderColPropertyTextArea(
          this.props.col,
          "comment",
          "Description",
          "im-textarea"
        )}
        {!JsonSchemaHelpers.isKeyArray(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) && (
            <>
              <div>
                Specification:
                <>
                  <div style={{ marginTop: "4px" }} />

                  <MessageIcon
                    key={"sidePanelColSpec"}
                    visible={
                      this.props.col.specification &&
                      !Helpers.isValidJson5Structure(
                        this.props.col.specification
                      )
                    }
                    tooltip="Invalid JSON"
                    type="error"
                    iconSize="12"
                    direction="left"
                  ></MessageIcon>
                </>
              </div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  element="textarea"
                  debounceTimeout={300}
                  className="im-textarea-code"
                  value={Helpers.gv(this.props.col["specification"])}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    this.props.col.id,
                    "specification"
                  )}
                />
                <ButtonEditLarge
                  onClick={this.openInLargeWindow.bind(
                    this,
                    this.props.col,
                    "specification",
                    "Specification"
                  )}
                />
              </div>
            </>
          )}
        {JsonSchemaHelpers.isJSONSchemaModelType(this.props.type) &&
          !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
          !!this.props.col && (
            <div className="im-spec-wrapper">
              <SpecificationAssistantJsonSchema
                passedCol={this.props.col}
                passedTableId={this.props.passedTableId}
              />
            </div>
          )}
      </>
    );
  }

  openInLargeWindow(col, propertyName, header) {
    this.props.toggleTextEditorModal(
      <ModalTextEditor
        textEditorId={uuidv4()}
        onChange={this.props.handleTextChange.bind(this, col.id, propertyName)}
        modalHeader={_.upperFirst(header)}
        text={Helpers.gv(col[propertyName])}
      />
    );
  }

  renderColPropertyTextArea(
    col,
    propertyName,
    propertyCaption,
    customClassName,
    messageIcon
  ) {
    return (
      <>
        <div>
          {propertyCaption}:{messageIcon}
        </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            element="textarea"
            debounceTimeout={300}
            className={customClassName}
            value={Helpers.gv(col[propertyName])}
            onChange={this.props.handleTextChange.bind(
              this,
              col.id,
              propertyName
            )}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              col,
              propertyName,
              propertyCaption
            )}
          />
        </div>
      </>
    );
  }

  renderDetailPanelJsonSchema(definitionKeyName) {
    return this.jsonSchemaDetail(definitionKeyName);
  }

  renderCollapsiblDetailPanelJsonSchema(definitionKeyName) {
    return (
      <DetailPanel
        panelIsExpanded={
          this.props.cid && this.props.col.id === this.props.cid
            ? "false"
            : true
        }
        colspan="9"
      >
        <div
          id={"f_" + this.props.col.id}
          className={"im-properties-grid f_" + this.props.col.id}
          ref={"f_" + this.props.col.id}
        >
          {this.renderDetailPanelJsonSchema(definitionKeyName)}
        </div>
      </DetailPanel>
    );
  }

  renderCollapsibleDetailPanelSimple() {
    return (
      <DetailPanel
        panelIsExpanded={
          this.props.cid && this.props.col.id === this.props.cid
            ? "false"
            : true
        }
        colspan="9"
      >
        <div
          id={"f_" + this.props.col.id}
          className={"im-properties-grid f_" + this.props.col.id}
          ref={"f_" + this.props.col.id}
        >
          {this.renderDetailPanelSimple()}
        </div>
      </DetailPanel>
    );
  }

  renderDetailPanelSimple() {
    const internalNestedTableObjectType =
      this.props.tables[this.props.col.datatype]?.objectType;
    return (
      <>
        {this.renderColPropertyTextArea(
          this.props.col,
          "comment",
          "Description",
          "im-textarea"
        )}

        {!JsonSchemaHelpers.isKeyArray(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
          this.renderColPropertyTextArea(
            this.props.col,
            "specification",
            "Specification",
            "im-textarea-code"
          )}

        {JsonSchemaHelpers.isJSONSchemaModelType(this.props.type) &&
          !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
          !!this.props.col && (
            <div className="im-spec-wrapper">
              <SpecificationAssistantJsonSchema
                passedCol={this.props.col}
                passedTableId={this.props.passedTableId}
              />
            </div>
          )}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    catalogColumns: state.catalogColumns,
    jsonCodeSettings: state.model?.jsonCodeSettings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ColumnsJsonSchemaDetailPanel)
);
