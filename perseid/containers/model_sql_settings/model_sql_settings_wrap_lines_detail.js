import { ModelSQLSettingsIndent } from "./model_sql_settings_indent";
import PropTypes from "prop-types";
import React from "react";
import { TEST_ID } from "common";
import { TextField } from "../../components/common/text_field";

export const ModelSQLSettingsWrapLinesDetail = ({ source, updateProperty }) => {
  return source.wrapLines ? (
    <>
      <TextField
        caption="Wrap line length:"
        propertyName="wrapOffset"
        source={source}
        updateProperty={updateProperty}
        data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_WRAP_LINES_LENGTH}
      />
      <ModelSQLSettingsIndent source={source} updateProperty={updateProperty} />
    </>
  ) : (
    <></>
  );
};

ModelSQLSettingsWrapLinesDetail.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
