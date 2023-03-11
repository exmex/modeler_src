import "swiper/scss"; // core Swiper
import "swiper/scss/navigation"; // Navigation module
import "swiper/scss/pagination"; // Pagination module

import { Navigation, Pagination } from "swiper";
import React, { Component } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { isBasic, isPro } from "../helpers/features/features";

import { TEST_ID } from "common";
import { connect } from "react-redux";
import isElectron from "is-electron";
import tip1 from "../assets/tips-perseid-tree.png";
import tip2 from "../assets/tips-perseid-dropdowns.png";
import tip3 from "../assets/tips-perseid-output-format.png";
import tip4 from "../assets/tips-perseid-navigation.png";
import tip5 from "../assets/tips-perseid-ctrl.png";
import tip6 from "../assets/tips-perseid-shift.png";
import tip7 from "../assets/tips-perseid-rearrange.png";
import tip8 from "../assets/tips-reports.png";
import tip9 from "../assets/tips-feedback.png";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class CarouselTipsPerseid extends Component {
  openBrowser(url) {
    if (isElectron()) {
      ipcRenderer.send("link:openExternal", url);
    }
  }

  render() {
    return (
      <div className="im-relative">
        <div
          className="im-carousel-wrapper"
          data-testid={TEST_ID.COMPONENTS.TIPS}
        >
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            mousewheel={true}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            className="im-carousel"
          >
            <SwiperSlide>
              <div className="im-slide im-slide-bg5">
                <div>
                  <h1>Visualize JSON schema or Open API files</h1>
                  <p>
                    Import existing files and view the structure in both TREE
                    and ERD-like diagram.
                  </p>
                </div>
                <div>
                  <img src={tip1} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg1">
                <div>
                  <h1>Model new structures using dropdowns</h1>
                  <p>
                    Right-click a node and select the desired nested node. For
                    Open API, you will get suggestions of only available nodes.
                  </p>
                </div>
                <div>
                  <img src={tip2} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide  im-slide-bg1">
                <div>
                  <h1>Generate JSON or YAML code</h1>
                  <p>
                    Specify the output format on the Generation Settings tab of
                    the Script form.
                  </p>
                </div>
                <div>
                  <img src={tip3} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg2">
                <div>
                  <h1>Use arrow keys for navigation</h1>
                  <p>
                    Move from one node to another by pressing left/right/up/down
                    arrow keys.
                  </p>
                </div>
                <div>
                  <img src={tip4} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg4">
                <div>
                  <h1>
                    Expand or collapse nodes using CTRL or SHIFT and arrow keys
                  </h1>
                  <p>
                    CTRL+arrow expands or collapses all nested nodes.
                    SHIFT+arrow key expands or collapses the nearest node and
                    preserves the state of other nested nodes without
                    modifications.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: You can press SHIFT+right arrow to expand the next
                    level of nested nodes. If you decide to expand all child
                    nodes, stay on the selected element and press CTRL+right
                    arrow.
                  </p>
                </div>
                <div>
                  <img src={tip5} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="im-slide im-slide-bg3">
                <div>
                  <h1>Generate documentation</h1>
                  <p>
                    Export the diagrams to PDF or HTML files. The diagram will
                    contain all colored descriptions, properties and other
                    important information.
                  </p>
                </div>
                <div>
                  <img src={tip8} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg6">
                <div>
                  <h1>Rearrange position of items</h1>
                  <p>
                    Navigate to the Children tab to manage positions of nested
                    nodes.
                  </p>
                </div>
                <div>
                  <img src={tip7} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="im-slide im-slide-bg3">
                <div>
                  <h1>Suggest new features</h1>
                  <p>
                    Feel free to send us your feedback and let us know what you
                    like, what you feel should be improved and what is missing
                    completely.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: Click the Feedback button at bottom right corner to
                    open the Feedback form. You can also send us a message to{" "}
                    <button
                      className="im-btn-link"
                      onClick={this.openBrowser.bind(
                        this,
                        "mailto://support@datensen.com"
                      )}
                    >
                      support@datensen.com
                    </button>
                  </p>
                </div>
                <div>
                  <img src={tip9} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
        <div className="im-info">
          <div>
            <button
              className="im-btn-link"
              onClick={this.openBrowser.bind(
                this,
                "https://www.datensen.com/target/app-news-perseid"
              )}
            >
              Read what's new
            </button>
          </div>
          <div>
            <button
              className="im-btn-link"
              onClick={this.openBrowser.bind(
                this,
                "https://www.datensen.com/target/app-docs-perseid"
              )}
            >
              Read documentation
            </button>
          </div>
          <div>
            <button
              className="im-btn-link"
              onClick={this.openBrowser.bind(
                this,
                "https://www.datensen.com/target/app-contact"
              )}
            >
              Contact us
            </button>
          </div>
          {isBasic(this.props.profile) === false &&
            isPro(this.props.profile) === false && (
              <div>
                <button
                  className="im-btn-link"
                  onClick={this.openBrowser.bind(
                    this,
                    "https://www.datensen.com/target/app-purchase"
                  )}
                >
                  Buy Now!
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.profile
  };
}

export default withRouter(connect(mapStateToProps)(CarouselTipsPerseid));
