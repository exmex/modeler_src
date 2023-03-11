import React, { Component } from "react";

class ObjCaption extends Component {
  render() {
    const { item } = this.props.linkedItem;
    return (
      <>
        <div>
          {this.props.caption === "Name" ? (
            `${this.props.caption}:`
          ) : (
            <div className="im-text-secondary">{this.props.caption}:</div>
          )}
        </div>

        <div>{item.name}</div>
      </>
    );
  }
}

export default ObjCaption;
