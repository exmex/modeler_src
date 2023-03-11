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
import tip1 from "../assets/tips-meteor-modeling.png";
import tip2 from "../assets/tips-meteor-fields.png";
import tip3 from "../assets/tips-meteor-display-modes.png";
import tip5 from "../assets/tips-meteor-script.png";
import tip7 from "../assets/tips-meteor-default-settings.png";
import tip9 from "../assets/tips-feedback.png";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class CarouselTipsMeteor extends Component {
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
                  <h1>Draw ER Diagrams</h1>
                  <p>
                    Design Sequelize diagrams for your database structures in
                    minutes.
                  </p>
                </div>
                <div>
                  <img src={tip1} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
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
              <div className="im-slide im-slide-bg2">
                <div>
                  <h1>Draw associations</h1>
                  <p>
                    Click on the parent model and then on the child model to
                    draw a new association. Then enter the cardinality settings
                    and edit the view mode to see the details.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: View modes can be changed through the main toolbar.
                    View cardinality captions, estimated size etc.
                  </p>
                </div>
                <div>
                  <img src={tip3} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg4">
                <div>
                  <h1>Generate scripts</h1>
                  <p>Easily generate Sequelize scripts.</p>
                </div>
                <div>
                  <img src={tip5} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="im-slide im-slide-bg6">
                <div>
                  <h1>Set project default values</h1>
                  <p>Default values can be set in the Project settings.</p>
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
                "https://www.datensen.com/target/app-news-meteor"
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
                "https://www.datensen.com/target/app-docs-meteor"
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

export default withRouter(connect(mapStateToProps)(CarouselTipsMeteor));
