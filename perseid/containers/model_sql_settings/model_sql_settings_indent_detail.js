import { IndentationString } from "../../generator/sql-model-to-lines/model_to_lines";
import PropTypes from "prop-types";
import React from "react";
import { SelectionField } from "../../components/common/selection_field";
import { TEST_ID } from "common";
import { TextField } from "../../components/common/text_field";

export const ModelSQLSettingsIndentDetail = ({ source, updateProperty }) => {
  return source.indent ? (
    <>
      <SelectionField
        caption="Indent with:"
        source={source}
        propertyName="indentationString"
        options={IndentationString}
        updateProperty={updateProperty}
        data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_INDENT_WITH}
      />
      <TextField
        caption="Indent size:"
        source={source}
        propertyName="indentationSize"
        updateProperty={updateProperty}
        data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_INDENT_SIZE}
      />
    </>
  ) : (
    <></>
  );
};

ModelSQLSettingsIndentDetail.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
