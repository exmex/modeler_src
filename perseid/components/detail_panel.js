import React, { Component } from "react";

export default class DetailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: true };
  }

  togglePanel() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  componentDidMount() {
    if (this.props.panelIsExpanded === "false") {
      this.setState({ isExpanded: false });
    }
  }

  render() {
    let classNameList = " im-detail-expanded ";
    if (this.state.isExpanded === true) {
      classNameList = " im-detail-collapsed";
    }

    return (
      <div
        className="im-detail-expander-block"
        style={{ gridColumn: "span " + this.props.colspan }}
      >
        <div
          onClick={this.togglePanel.bind(this)}
          className="im-cat-icon im-pointer im-detail-expander"
        >
          <i
            className={
              this.state.isExpanded
                ? "im-icon-Expand16 im-icon-16"
                : "im-icon-Collapse16 im-icon-16"
            }
          />
        </div>
        <div className={classNameList}>{this.props.children}</div>
      </div>
    );
  }
}
