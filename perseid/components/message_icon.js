import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";

export const MessageIcon = ({ ...props }) => {
  return props.visible ? (
    <div className=" im-has-tooltip im-relative im-inline-block ">
      <div className={` im-message-icon-${props.type} `}>
        <i
          className={` im-icon-${props.iconSize} im-icon-${_.upperFirst(
            props.type
          )}16 `}
        />
      </div>
      <div className={` im-tooltip im-tooltip-left `}>{props.tooltip}</div>
    </div>
  ) : (
    <></>
  );
};

MessageIcon.propTypes = {
  type: PropTypes.string,
  tooltip: PropTypes.string,
  visible: PropTypes.any,
  iconSize: PropTypes.string,
  direction: PropTypes.string
};
