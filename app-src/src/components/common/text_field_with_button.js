import { DebounceInput } from "react-debounce-input";
import PropTypes from "prop-types";
import React from "react";

export function TextFieldWithButton(props) {
  return props.hidden !== true ? (
    <>
      <div className="im-align-self-center">{props.property.caption}</div>
      <div className="im-flex-cols">
        <DebounceInput
          className="im-flex-cols-first-full-width"
          minLength={1}
          debounceTimeout={300}
          type="text"
          value={props.property.value}
          onChange={event =>
            props.updateProperty(props.property.name, event.target.value)
          }
        />

        <button
          className="im-btn-default im-btn-sm"
          onClick={props.button.command.bind(this, ...props.button.params)}
        >
          {props.button.caption}
        </button>
      </div>
    </>
  ) : (
    <></>
  );
}

TextFieldWithButton.propTypes = {
  hidden: PropTypes.bool,
  property: PropTypes.shape({
    caption: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    name: PropTypes.string
  }),
  button: PropTypes.shape({
    caption: PropTypes.string,
    command: PropTypes.func,
    params: PropTypes.array
  })
};
