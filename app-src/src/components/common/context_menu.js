import PropTypes from "prop-types";
import React from "react";

export const ContextMenuWrapper = ({ id, top, left, children, dataTestId }) => {
  return (
    <div
      data-testid={dataTestId}
      style={{
        top: top + "px",
        left: left + "px"
      }}
      className="im-dropdown"
      id={id}
    >
      {children}
    </div>
  );
};

export const ContextMenu = ({ children }) => {
  return <ul className="dropdown-area">{children}</ul>;
};

export const ContextMenuItem = ({
  className,
  icon,
  caption,
  fn,
  divClassName,
  dataTestId,
  iconClassName
}) => {
  return (
    <li
      className={className ? className : "im-dropdown-icon-empty"}
      onClick={fn}
    >
      <i
        className={`im-icon-${icon ? icon : "Empty"} im-icon-12 ${
          iconClassName ? iconClassName : ""
        }`}
      />
      <div className={divClassName} data-testid={dataTestId}>
        {caption}
      </div>
    </li>
  );
};

export const ContextMenuSeparator = () => {
  return <li className="im-dropdown-separator" />;
};

export const ContextMenuSubMenu = ({
  subMenuClassName,
  icon,
  caption,
  children
}) => {
  return (
    <li className="im-dropdown-icon-empty im-dropdown-submenu">
      <i className={`im-icon-${icon} im-icon-12`} />
      <div>
        {caption}
        <ul className={subMenuClassName}>{children}</ul>
      </div>
    </li>
  );
};

ContextMenuWrapper.propTypes = {
  id: PropTypes.string,
  top: PropTypes.number,
  left: PropTypes.number,
  children: PropTypes.element,
  dataTestId: PropTypes.string
};

ContextMenuItem.propTypes = {
  className: PropTypes.string,
  caption: PropTypes.string,
  icon: PropTypes.string,
  fn: PropTypes.func,
  divClassName: PropTypes.string,
  dataTestId: PropTypes.string,
  iconClassName: PropTypes.string
};

ContextMenuSubMenu.propTypes = {
  subMenuClassName: PropTypes.string,
  caption: PropTypes.string,
  icon: PropTypes.string,
  children: PropTypes.element
};
