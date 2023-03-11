import "swiper/scss"; // core Swiper
import "swiper/scss/navigation"; // Navigation module
import "swiper/scss/pagination"; // Pagination module

import { Navigation, Pagination } from "swiper";
import React, { Component } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { isBasicLuna, isBasicMoon, isPro } from "../helpers/features/features";

import { TEST_ID } from "common";
import { connect } from "react-redux";
import isElectron from "is-electron";
import tip1 from "../assets/tips-galaxy-import.png";
import tip2 from "../assets/tips-galaxy-generate.png";
import tip3 from "../assets/tips-reports.png";
import tip9 from "../assets/tips-feedback.png";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class CarouselTipsGalaxy extends Component {
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
              <div className="im-slide im-slide-bg7">
                <div>
                  <h1>Import from files</h1>
                  <p>Load your structure from an existing file.</p>
                  <p className="im-highlighted-text">
                    Tip: To visualize an existing GraphQL structure go to the Projects section and import GraphQL
                    from a file.
                  </p>
                </div>
                <div>
                  <img src={tip1} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg4">
                <div>
                  <h1>Generate scripts</h1>
                  <p>
                    Easily generate schema creation scripts for GraphQL
                  </p>
                  
                </div>
                <div>
                  <img src={tip2} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg3">
                <div>
                  <h1>Generate HTML reports</h1>
                  <p>
                    Create interactive documentation for your projects. Export
                    diagrams, search for objects and share documentation with
                    others.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: To run the report, double-click the generated
                    index.html file. No server is required.
                  </p>
                </div>
                <div>
                  <img src={tip3} className="im-img-tip" />
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
                "https://www.datensen.com/target/app-news-galaxy"
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
                "https://www.datensen.com/target/app-docs-galaxy"
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
          {isBasicMoon(this.props.profile) === false &&
            isBasicLuna(this.props.profile) === false &&
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

export default withRouter(connect(mapStateToProps)(CarouselTipsGalaxy));
