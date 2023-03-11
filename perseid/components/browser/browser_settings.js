import { ObjectType, getPlatformProperty } from "../../enums/enums";
import React, { Component } from "react";

import CheckboxCustom from "../checkbox_custom";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { changeBrowserSettings } from "../../actions/ui";
import { connect } from "react-redux";
import { getBrowserTreeMetadataByPlatform } from "./platform/metadata";
import { isGroupVisible } from "./tree/visibility";
import { withRouter } from "react-router";

class BrowserSettings extends Component {
  changeValue(innerGroupId, checked, event) {
    this.props.changeBrowserSettings(this.props.type, innerGroupId, !checked);
    event.stopPropagation();
    event.preventDefault();
  }

  change(innerGroupId, event) {
    this.props.changeBrowserSettings(
      this.props.type,
      innerGroupId,
      event.target.checked
    );
    event.stopPropagation();
    event.preventDefault();
  }

  renderNode(id, group) {
    const browserSettings = this.props.browserSettings;
    return _.map(_.keys(group.groups || {}), (innerGroupName) => {
      const innerGroup = group.groups[innerGroupName];
      const innerGroupPropertyName = innerGroup?.propertyName ?? innerGroupName;
      const innerGroupPathId = `${id}.${innerGroupPropertyName}`;
      const innerGroupItemId = `i.${innerGroupPathId}`;

      const modelProperty = getPlatformProperty(this.props.type);
      const checked = isGroupVisible(
        innerGroupPathId,
        innerGroup,
        browserSettings?.[modelProperty]
      );

      return (
        <div className="br-settings-wrapper" key={innerGroupPathId}>
          <div
            className="br-settings-grid im-pointer"
            onClick={this.changeValue.bind(this, innerGroupPathId, checked)}
          >
            <div>
              <CheckboxCustom
                type="checkbox"
                checked={checked}
                onChange={this.change.bind(this, innerGroupPathId)}
              />
            </div>
            <div>{_.upperFirst(this.props.localization[innerGroup.label])}</div>
          </div>
          {_.size(this.renderNode(innerGroupPathId, innerGroup)) > 0 && (
            <div className="br-settings-wrapper">
              <div key={innerGroupItemId}>
                {this.renderNode(innerGroupPathId, innerGroup)}
              </div>
            </div>
          )}
        </div>
      );
    });
  }

  render() {
    const browserTree = getBrowserTreeMetadataByPlatform(this.props.type);
    return (
      <div className="br-container">
        {this.renderNode(ObjectType.MODEL, browserTree)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    browserSettings: state.ui.browserSettings,
    type: state.model.type,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        changeBrowserSettings
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BrowserSettings)
);
