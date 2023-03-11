import React, { Component } from "react";

import _ from "lodash";

export default class Choice extends Component {
  constructor(props) {
    super(props);
    this.state = { activeId: this.props.selectedChoiceId };
    this.changeSelection = this.changeSelection.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.selectedChoiceId !== prevProps.selectedChoiceId) {
      this.setState({ activeId: this.props.selectedChoiceId });
    }
  }

  changeSelection(id) {
    this.setState({ activeId: id }, () =>
      this.props.onClick(this.state.activeId)
    );
  }

  renderChoices() {
    let selectedChoiceClass;
    return _.map(this.props.choices, (ch) => {
      if (ch.id === this.state.activeId) {
        selectedChoiceClass = " im-choice-selected ";
      } else {
        selectedChoiceClass = "";
      }
      return (
        <div
          key={ch.id}
          className={
            "im-choice  " + this.props.customClassName + selectedChoiceClass
          }
          onClick={() => this.changeSelection(ch.id)}
          data-testid={ch.id}
        >
          <img
            title={ch.text}
            alt={ch.text}
            src={ch.icon}
            className={this.props.customImgClassName}
          />
        </div>
      );
    });
  }

  render() {
    return <div className="im-choice-box">{this.renderChoices()}</div>;
  }
}
