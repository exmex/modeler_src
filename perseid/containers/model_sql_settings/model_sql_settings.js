import {
  IDENTIFIER_CASE,
  INCLUDE_GENERATED_NAMES,
  INCLUDE_SCHEMA,
  KEYWORD_CASE,
  QUOTATION
} from "../../generator/sql-model-to-lines/model_to_lines";

import { ModelSQLSettingsMaxLineItems } from "./model_sql_settings_max_line_items";
import { ModelSQLSettingsWrapLines } from "./model_sql_settings_wrap_lines";
import { ModelTypes } from "../../enums/enums";
import PropTypes from "prop-types";
import React from "react";
import { SelectionField } from "../../components/common/selection_field";
import { TEST_ID } from "common";
import { TextField } from "../../components/common/text_field";

export const ModelSQLSettings = ({
  source,
  updateProperty,
  containerCaption,
  type
}) => {
  return (
    <div data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_SETTINGS}>
      <div className="im-properties-grid im-properties-grid-sql">
        <ModelSQLSettingsWrapLines
          source={source}
          updateProperty={updateProperty}
        />
        <ModelSQLSettingsMaxLineItems
          source={source}
          updateProperty={updateProperty}
        />
        <TextField
          caption="Statement delimiter:"
          source={source}
          propertyName="statementDelimiter"
          updateProperty={updateProperty}
          data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_STATEMENT_DELIMITER}
        />
        <TextField
          caption="Routine delimiter:"
          source={source}
          propertyName="routineDelimiter"
          updateProperty={updateProperty}
          data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_ROUTINE_DELIMITER}
        />
        <SelectionField
          caption="Keyword case:"
          source={source}
          propertyName="keywordCase"
          options={KEYWORD_CASE}
          updateProperty={updateProperty}
          data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_KEYWORD_CASE}
        />
        <SelectionField
          caption="Identifier case:"
          source={source}
          propertyName="identiferCase"
          options={IDENTIFIER_CASE}
          updateProperty={updateProperty}
          data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_IDENTIFIER_CASE}
        />
        {type !== ModelTypes.SQLITE ? (
          <>
            <SelectionField
              caption={`Include ${containerCaption}:`}
              source={source}
              propertyName="includeSchema"
              options={INCLUDE_SCHEMA}
              updateProperty={updateProperty}
              data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_INCLUDE_SCHEMA}
            />
            <SelectionField
              caption="Quotation:"
              source={source}
              propertyName="quotation"
              options={QUOTATION}
              updateProperty={updateProperty}
              data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_QUOTATION}
            />
          </>
        ) : (
          <></>
        )}
        {type === ModelTypes.PG ? (
          <>
            <SelectionField
              caption={`Include names:`}
              source={source}
              propertyName="includeGeneratedNames"
              options={INCLUDE_GENERATED_NAMES}
              updateProperty={updateProperty}
              data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_INCLUDE_NAMES}
            />
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

ModelSQLSettings.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
