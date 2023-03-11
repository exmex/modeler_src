import { ModelSQLSettingsIndentDetail } from "./model_sql_settings_indent_detail";
import PropTypes from "prop-types";
import React from "react";
import { SwitchField } from "../../components/common/switch_field";

export const ModelSQLSettingsIndent = ({ source, updateProperty }) => {
  return (
    <>
      <SwitchField
        caption="Indent"
        propertyName="indent"
        source={source}
        updateProperty={updateProperty}
      />
      <ModelSQLSettingsIndentDetail
        source={source}
        updateProperty={updateProperty}
      />
    </>
  );
};

ModelSQLSettingsIndent.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
