import PropTypes from "prop-types";
import React from "react";
import { SelectionField } from "../../components/common/selection_field";

export const ModelJsonCodeSettingsSelect = ({
  source,
  updateProperty,
  containerCaption,
  propertyName,
  options,
  testid
}) => {
  return (
   
        <SelectionField
          source={source}
          updateProperty={updateProperty}
          caption={containerCaption}
          propertyName={propertyName}
          data-testid={testid}
          hidden={false}
          options={options}
        />
      
  );
};

ModelJsonCodeSettingsSelect.propTypes = {
  source: PropTypes.object,
  updateProperty: PropTypes.func,
  containerCaption: PropTypes.string,
  propertyName: PropTypes.string,
  options: PropTypes.object,
  testid: PropTypes.string
};
