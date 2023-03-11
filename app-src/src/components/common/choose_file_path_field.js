import Helpers from "../../helpers/helpers";
import PropTypes from "prop-types";
import React from "react";
import { TextFieldWithButton } from "./text_field_with_button";

const ipcRenderer = window?.ipcRenderer;

function chooseFilePath(
  propertyName,
  currentFilePath,
  title,
  filters,
  updateProperty
) {
  ipcRenderer?.once("connectionsList:completedChooseFile", (event, result) => {
    if (result.filePath) {
      updateProperty(result.propertyName, result.filePath);
    }
  });
  ipcRenderer?.send("connectionsList:runChooseFile", {
    propertyName,
    currentFilePath,
    title,
    filters
  });
}

export function ChooseFilePathField(props) {
  const value = Helpers.gv(props.connection[props.name]);
  const property = { caption: `${props.caption}:`, name: props.name, value };
  const button = {
    command: chooseFilePath,
    params: [
      props.name,
      value,
      `Select a ${props.caption}`,
      props.filters,
      props.updateProperty
    ],
    caption: "Select"
  };
  return (
    <TextFieldWithButton
      hidden={props.hidden}
      updateProperty={props.updateProperty}
      property={property}
      button={button}
    />
  );
}

ChooseFilePathField.propTypes = {
  hidden: PropTypes.bool,
  name: PropTypes.string,
  caption: PropTypes.string,
  connection: PropTypes.object,
  updateProperty: PropTypes.func,
  filters: PropTypes.array
};
