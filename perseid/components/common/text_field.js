import { DebounceInput } from "react-debounce-input";
import PropTypes from "prop-types";
import React from "react";

export function TextField(props) {
  const type = props.type ? props.type : "text";

  return props.hidden !== true ? (
    <>
      <div className="im-align-self-center">{props.caption}</div>
      <DebounceInput
        minLength={1}
        debounceTimeout={300}
        type={type}
        value={props.source[props.propertyName]}
        onChange={event =>
          props.updateProperty(props.propertyName, event.target.value)
        }
      />
    </>
  ) : (
    <></>
  );
}

TextField.propTypes = {
  hidden: PropTypes.bool,
  type: PropTypes.string,
  caption: PropTypes.string,
  propertyName: PropTypes.string,
  source: PropTypes.object,
  updateProperty: PropTypes.func
};
