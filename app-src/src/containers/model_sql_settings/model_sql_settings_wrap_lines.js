import { ModelSQLSettingsWrapLinesDetail } from "./model_sql_settings_wrap_lines_detail";
import PropTypes from "prop-types";
import React from "react";
import { SwitchField } from "../../components/common/switch_field";
import { TEST_ID } from "common";

export const ModelSQLSettingsWrapLines = ({ source, updateProperty }) => {
  return (
    <>
      <SwitchField
        caption="Wrap lines"
        propertyName="wrapLines"
        source={source}
        updateProperty={updateProperty}
        data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_WRAP_LINES}
      />
      <ModelSQLSettingsWrapLinesDetail
        source={source}
        updateProperty={updateProperty}
      />
    </>
  );
};

ModelSQLSettingsWrapLines.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
