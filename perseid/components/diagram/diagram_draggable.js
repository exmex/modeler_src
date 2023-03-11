import React from "react";

class DiagramDraggable extends React.Component {
  constructor(props) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  onStart(e) {
    if (this.props.globalAction === false) {
      this.props.onStart &&
        this.props.onStart(
          this.props.embeddable,
          this.props.objectType,
          this.props.id,
          e
        );
    }
  }

  onStop(e) {
    if (this.props.globalAction === false) {
      this.props.onStop &&
        this.props.onStop(
          this.props.embeddable,
          this.props.objectType,
          this.props.id,
          e
        );
    }
  }

  onMove(e) {
    if (this.props.globalAction === false) {
      this.props.onMove && this.props.onMove(e);
      e.stopPropagation();
    }
  }

  onMouseDown(e) {
    if (e.button !== 0 || this.props.globalAction === true) {
      return;
    }
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    this.props.onStart &&
      this.props.onStart(
        this.props.embeddable,
        this.props.objectType,
        this.props.id,
        e
      );
    e.preventDefault();
    e.stopPropagation();
  }

  onMouseUp(e) {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    this.props.onStop &&
      this.props.onStop(
        this.props.embeddable,
        this.props.objectType,
        this.props.id,
        e
      );
    e.preventDefault();
    e.stopPropagation();
  }

  onMouseMove(e) {
    this.onMove(e);
    e.preventDefault();
  }

  onTouchStart(e) {
    this.onStart(e.touches[0]);
    document.addEventListener("touchmove", this.onTouchMove, {
      passive: false
    });
    document.addEventListener("touchend", this.onTouchEnd, { passive: false });
    e.preventDefault();
  }

  onTouchMove(e) {
    this.onMove(e.touches[0]);
    e.preventDefault();
  }

  onTouchEnd(e) {
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    this.props.onStop && this.props.onStop(e.touches[0]);
    e.preventDefault();
  }

  render() {
    return (
      <div
        id={this.props.id}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        style={{
          position: "absolute",
          left: this.props.x,
          top: this.props.y,
          touchAction: "none",
          width: this.props.width,
          height: this.props.height,
          minWidth: this.props.minWidth,
          minHeight: this.props.minHeight,
          paddingBottom: "45px",
          paddingRight: "45px"
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default DiagramDraggable;
