import CheckboxSwitch from "../checkbox_switch";
import PropTypes from "prop-types";
import React from "react";

export const SwitchField = ({
  hidden,
  source,
  caption,
  propertyName,
  updateProperty
}) => {
  return hidden !== true ? (
    <>
      <div />
      <CheckboxSwitch
        label={caption}
        checked={source[propertyName]}
        onChange={event => updateProperty(propertyName, event.target.checked)}
      />
    </>
  ) : (
    <></>
  );
};

SwitchField.propTypes = {
  hidden: PropTypes.bool,
  caption: PropTypes.string,
  propertyName: PropTypes.string,
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
