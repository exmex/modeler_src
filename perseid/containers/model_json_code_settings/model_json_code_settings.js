import PropTypes from "prop-types";
import React from "react";
import { SwitchField } from "../../components/common/switch_field";
import { TEST_ID } from "common";

export const ModelJsonCodeSettings = ({
  source,
  updateProperty,
  containerCaption
}) => {
  return (
    <SwitchField
      source={source}
      updateProperty={updateProperty}
      caption={containerCaption}
      propertyName="strict"
      data-testid={TEST_ID.SQL_CODE_SETTINGS.JSON_CODE}
    />
  );
};

ModelJsonCodeSettings.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
