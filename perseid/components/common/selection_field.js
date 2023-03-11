import PropTypes from "prop-types";
import React from "react";

export const SelectionField = ({
  hidden,
  caption,
  source,
  options,
  updateProperty,
  propertyName
}) => {
  return hidden !== true ? (
    <>
      <div className="im-align-self-center">{caption}</div>
      <select
        value={source[propertyName]}
        onChange={event => {
          updateProperty(propertyName, event.target.value);
        }}
      >
        {Object.keys(options).map(key => (
          <option key={key} value={key}>
            {options[key]}
          </option>
        ))}
      </select>
    </>
  ) : (
    <></>
  );
};

SelectionField.propTypes = {
  hidden: PropTypes.bool,
  caption: PropTypes.string,
  propertyName: PropTypes.string,
  source: PropTypes.object,
  options: PropTypes.object,
  updateProperty: PropTypes.func
};
