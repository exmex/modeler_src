import React, { Component } from "react";

import TreeDiagramHelpers from "../helpers/tree_diagram/tree_diagram_helpers";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { clearSelection } from "../actions/selections";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { toggleFinder } from "../actions/ui";
import { withRouter } from "react-router-dom";

const initFindOnDiagram = {
  foundResults: [],
  searchTerm: "",
  cntFoundResults: 0,
  currentFoundResultPosition: 0
};

class DiagramFinder extends Component {
  constructor(props) {
    super(props);
    this.state = initFindOnDiagram;
    this.refFindOnDiagramBox = React.createRef();
  }

  componentDidUpdate() {
    if (this.refFindOnDiagramBox.current) {
      this.refFindOnDiagramBox.current.value = this.state.searchTerm;
    }
  }

  addDecoratorToResults() {
    this.removeDecoratorFromResults();
    for (let node of this.state.foundResults) {
      node.setAttribute("data-results-decorator", "yes");
    }
  }

  removeDecoratorFromResults() {
    var decorated = document.querySelectorAll("[data-results-decorator]");
    decorated.forEach((node) => {
      node.removeAttribute("data-results-decorator");
    });
  }

  querySelectorIncludesText(selector, event) {
    this.removeDecoratorFromResults();
    if (this.refFindOnDiagramBox.current.value === "") {
      this.setState(initFindOnDiagram);
    } else {
      const text = this.refFindOnDiagramBox.current.value;
      const foundResultsArr = Array.from(
        document.querySelectorAll(selector)
      ).filter((el) =>
        el.textContent.toLowerCase().includes(text.toLowerCase())
      );

      const cntFoundResults = _.size(foundResultsArr);
      if (cntFoundResults > 0) {
        this.setState(
          {
            foundResults: foundResultsArr,
            searchTerm: text,
            cntFoundResults: cntFoundResults,
            currentFoundResultPosition: 1
          },
          () => {
            var element =
              this.state.foundResults[
                this.state.currentFoundResultPosition - 1
              ];
            this.props.updateActiveDomItemId(element.id);
            this.changeFoundResultPosition(true, false);
            TreeDiagramHelpers.focusFindOnDiagramInput();
            this.addDecoratorToResults();
          }
        );
      } else {
        this.props.updateActiveDomItemId("");
        this.setState(
          {
            foundResults: [],
            searchTerm: text,
            cntFoundResults: 0,
            currentFoundResultPosition: 0
          },
          () => {
            this.clearSelection();
            TreeDiagramHelpers.focusFindOnDiagramInput();
          }
        );
      }
    }
  }

  clearSelection() {
    this.removeDecoratorFromResults();
    this.props.clearSelection();
    this.props.history.push(
      "/model/" +
        this.props.match.params.mid +
        "/diagram/" +
        this.props.match.params.did
    );
  }

  async changePosition(next) {
    if (next === true) {
      if (this.state.currentFoundResultPosition < this.state.cntFoundResults) {
        this.setState({
          currentFoundResultPosition: this.state.currentFoundResultPosition + 1
        });
      }
    } else {
      if (this.state.currentFoundResultPosition > 1) {
        this.setState({
          currentFoundResultPosition: this.state.currentFoundResultPosition - 1
        });
      }
    }
  }

  clearSearchTerm() {
    this.setState(initFindOnDiagram);
    this.removeDecoratorFromResults();
  }

  async changeFoundResultPosition(next, changePosition) {
    if (changePosition) {
      await this.changePosition(next);
      this.props.updateActiveDomItemId(
        this.state.foundResults[this.state.currentFoundResultPosition - 1].id
      );
    }
    var element =
      this.state.foundResults[this.state.currentFoundResultPosition - 1];
    this.props.navigateToDomItem(element, true);
    this.addDecoratorToResults();
  }

  renderResultsStats() {
    if (this.state.cntFoundResults > 0) {
      return this.renderResultsNavigation();
    } else {
      return this.renderNotFound();
    }
  }

  renderNotFound() {
    return (
      <div className="im-search-results-counts im-not-found">Not found</div>
    );
  }

  closeFinder() {
    this.clearSearchTerm();
    this.props.toggleFinder();
  }

  renderResultsNavigation() {
    var nextStyle = "im-disabled";
    var previousStyle = "im-disabled";

    if (
      this.state.cntFoundResults > 0 &&
      this.state.currentFoundResultPosition < this.state.cntFoundResults
    ) {
      nextStyle = "im-pointer";
    }
    if (
      this.state.cntFoundResults > 0 &&
      this.state.currentFoundResultPosition !== 1
    ) {
      previousStyle = "im-pointer";
    }

    return (
      <div className="im-found">
        <div className="im-search-results-counts">
          {`${this.state.currentFoundResultPosition} / ${this.state.cntFoundResults}`}
        </div>
        <div
          className={` ${previousStyle} im-rotate-180`}
          onClick={this.changeFoundResultPosition.bind(this, false, true)}
        >
          <i className="im-icon-Collapse16 im-icon-16 " />
        </div>
        <div
          className={` ${nextStyle}`}
          onClick={this.changeFoundResultPosition.bind(this, true, true)}
        >
          <i className="im-icon-Collapse16 im-icon-16 " />
        </div>
      </div>
    );
  }

  render() {
    var buttonDisplayedStyle = "";
    var foundResultsDetailsStyle = "";

    if (this.state.searchTerm?.length > 0) {
      foundResultsDetailsStyle = "im-found-results-details";
      buttonDisplayedStyle = "im-search-button im-pointer";
    } else {
      foundResultsDetailsStyle = "im-display-none";
      buttonDisplayedStyle = "im-display-none";
    }

    return (
      <div id="im-find-on-diagram" className="im-find-on-diagram">
        <div className="im-search-bar im-search-fixed-width">
          <div></div>
          <input
            className="im-search-box-input"
            placeholder="Find on diagram"
            type="text"
            id="findOnDigramInput"
            ref={this.refFindOnDiagramBox}
            onChange={this.querySelectorIncludesText.bind(
              this,
              ".tree__item__named"
            )}
          />

          <div
            className={buttonDisplayedStyle}
            onClick={this.clearSearchTerm.bind(this)}
          >
            <i className="im-icon-Cross16 im-icon-16" />
          </div>
          <div className={foundResultsDetailsStyle}>
            {this.renderResultsStats()}

            <div
              className={` im-search-close im-pointer`}
              onClick={this.closeFinder.bind(this)}
            >
              Close
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        clearSelection,
        toggleFinder
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiagramFinder)
);
