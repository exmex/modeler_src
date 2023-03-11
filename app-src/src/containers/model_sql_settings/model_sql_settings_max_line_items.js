import { ModelSQLSettingsMaxLineItemsDetail } from "./model_sql_settings_max_line_items_detail";
import PropTypes from "prop-types";
import React from "react";
import { SwitchField } from "../../components/common/switch_field";
import { TEST_ID } from "common";

export const ModelSQLSettingsMaxLineItems = ({ source, updateProperty }) => {
  return (
    <>
      <SwitchField
        caption="Limit items on line"
        propertyName="limitItemsOnLine"
        source={source}
        updateProperty={updateProperty}
        data-testid={TEST_ID.SQL_CODE_SETTINGS.SQL_LIMIT_ITEMS}
      />
      <ModelSQLSettingsMaxLineItemsDetail
        source={source}
        updateProperty={updateProperty}
      />
    </>
  );
};

ModelSQLSettingsMaxLineItems.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
