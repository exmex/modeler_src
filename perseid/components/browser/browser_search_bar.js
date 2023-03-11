import React, { Component } from "react";

import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { setSearchTerm } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class BrowserSearchBar extends Component {
  constructor(props) {
    super(props);
    this.refSearchBox = React.createRef();
    this.onInputChangeDebounced = _.debounce(
      this.onInputChangeDebounced.bind(this),
      200
    );
    this.clearSearchTerm = this.clearSearchTerm.bind(this);
  }

  componentDidMount() {
    this.refSearchBox.current.value = this.props.searchTerm;
  }

  componentDidUpdate() {
    this.refSearchBox.current.value = this.props.searchTerm;
  }

  onInputChangeDebounced(event) {
    this.props.setSearchTerm(this.refSearchBox.current.value);
  }

  clearSearchTerm() {
    this.props.setSearchTerm("");
  }

  render() {
    const buttonDisplayedStyle =
      this.props.searchTerm.length > 0 ? "im-search-button" : "im-display-none";
    return (
      <div className="im-search-bar">
        <div />
        <input
          className="im-search-box-input"
          placeholder="Filter"
          type="text"
          id="searchBar"
          ref={this.refSearchBox}
          onChange={this.onInputChangeDebounced}
          autoComplete="off"
        />
        <div
          className={buttonDisplayedStyle}
          onClick={this.clearSearchTerm.bind(this)}
        >
          <i className="im-icon-Cross16 im-icon-16" />
        </div>
        <div />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchTerm: state.ui.searchTerm
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        setSearchTerm
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BrowserSearchBar)
);
