import React, { Component } from "react";

import _ from "lodash";

export default class InputDatalist extends Component {
  renderOptions() {
    return _.map(this.props.arrayOfItems, (arrayItem) => {
      return <option key={arrayItem} value={arrayItem} />;
    });
  }

  render() {
    return <datalist id={this.props.inputId}>{this.renderOptions()}</datalist>;
  }
}
