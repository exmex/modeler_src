import PropTypes from "prop-types";
import React from "react";
import { TEST_ID } from "common";
import { TextField } from "../../components/common/text_field";

export const ModelSQLSettingsMaxLineItemsDetail = ({
  source,
  updateProperty
}) => {
  return source.limitItemsOnLine ? (
    <TextField
      caption="Max line items:"
      source={source}
      propertyName="maxListItemsOnLine"
      updateProperty={updateProperty}
      data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_MAX_LINE_ITEMS}
    />
  ) : (
    <></>
  );
};

ModelSQLSettingsMaxLineItemsDetail.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
