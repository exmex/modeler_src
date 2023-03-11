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
import tip12 from "../assets/tips-generate-switch-moon.png";
import tip13 from "../assets/tips-show-hide-document-moon.png";
import tip2 from "../assets/tips-field-properties-moon.png";
import tip4 from "../assets/tips-reports.png";
import tip7 from "../assets/tips-default-values-moon.png";
import tip9 from "../assets/tips-feedback.png";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class CarouselTips extends Component {
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
              <div className="im-slide  im-slide-bg1">
                <div>
                  <h1>Define properties</h1>
                  <p>
                    Edit object properties via the right side panel or via modal
                    forms.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: To access the area where field/column specifics can be
                    set, click the arrow icon to the left of the field/column
                    name.
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
                  <h1>Show or hide object details</h1>
                  <p>
                    Click the eye icon to or use <b>CTRL + Arrow</b> key combination to display or hide details.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: If you wish to display only collections, click the Display button on the main toolbar and deactivate the Display object details option.
                  </p>
                </div>
                <div>
                  <img src={tip13} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
           
            <SwiperSlide>
              <div className="im-slide im-slide-bg4">
                <div>
                  <h1>Select objects to be generated</h1>
                  <p>
                  You can also turn off the "Generate" switch to skip
                    generating scripts for the selected object. 
                  </p>
                  <p className="im-highlighted-text">
                    Tip: Custom code can
                    be generated in addition to or instead of the auto-
                    generated script.
                  </p>
                </div>
                <div>
                  <img src={tip12} className="im-img-tip" />
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
                  <img src={tip4} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg6">
                <div>
                  <h1>Set project default values</h1>
                  <p>
                    Default values can be set in the Project settings. These
                    options are dependent on the target platform.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: Edit the project to access project settings.
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
                "https://www.datensen.com/target/app-news"
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
                "https://www.datensen.com/target/app-docs"
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
                "https://www.datensen.com/target/app-videos"
              )}
            >
              Watch videos
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

export default withRouter(connect(mapStateToProps)(CarouselTips));
