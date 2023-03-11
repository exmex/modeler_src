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
import tip10 from "../assets/tips-videos.png";
import tip11 from "../assets/tips-purchase.png";
import tip12 from "../assets/tips-luna-generate.png";
import tip2 from "../assets/tips-luna-column-properties.png";
import tip3 from "../assets/tips-luna-cardinality.png";
import tip4 from "../assets/tips-luna-reports.png";
import tip5 from "../assets/tips-luna-sql-settings.png";
import tip6 from "../assets/tips-luna-connections.png";
import tip7 from "../assets/tips-luna-project-default-values-right-panel.png";
import tip9 from "../assets/tips-feedback.png";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class CarouselTipsLuna extends Component {
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
                    Edit properties via the right side panel or via modal
                    forms.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: To access the area where column specifics can be
                    set, click the arrow icon to the left of the column
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
                  <h1>Draw relationships</h1>
                  <p>
                    Click on the parent table and then on the child table to
                    draw a new relationship. Then enter the cardinality settings
                    and edit the view mode to see the details.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: View modes can be changed through the main toolbar.
                    View or hide cardinality captions, schema
                    names, estimated size, etc.
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
                  <h1>Generate scripts or SQL code</h1>
                  <p>
                    Easily generate SQL for your preferred relational database.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: Set the generation settings
                    in the SQL script window.
                  </p>
                </div>
                <div>
                  <img src={tip5} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="im-slide im-slide-bg4">
                <div>
                  <h1>Select objects to be generated</h1>
                  <p>
                    Create sub-diagrams with only selected project items and
                    then generate reports or scripts for them.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: You can also turn off the "Generate" switch to skip
                    generating scripts for the selected object. Custom code can
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
                    options are dependent on the target platform, so the options
                    for a MongoDB project will be different from the options for
                    PostgreSQL etc.
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
              <div className="im-slide im-slide-bg5">
                <div>
                  <h1>Manage connections</h1>
                  <p>
                    Create database connections to your local or cloud databases
                    and load the database structures. Visualize existing
                    databases easily.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: Use the Search field to find a database connection
                    quickly. You can also search SSL/SSH/TLS connections.
                  </p>
                </div>
                <div>
                  <img src={tip6} className="im-img-tip" />
                </div>
              </div>
            </SwiperSlide>            
            <SwiperSlide>
              <div className="im-slide im-slide-bg2">
                <div>
                  <h1>Watch videos</h1>
                  <p>
                    Visit{" "}
                    <button
                      className="im-btn-link"
                      onClick={this.openBrowser.bind(
                        this,
                        "https://www.datensen.com"
                      )}
                    >
                      https://www.datensen.com
                    </button>{" "}
                    and browse documentation, read Quick start guides or{" "}
                    <button
                      className="im-btn-link"
                      onClick={this.openBrowser.bind(
                        this,
                        "https://www.datensen.com/target/app-videos"
                      )}
                    >
                      watch videos
                    </button>
                    .
                  </p>
                </div>
                <div>
                  <img src={tip10} className="im-img-tip" />
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
                    open the Feedback form. You can also send us a message to
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
            {isBasicLuna(this.props.profile) === false &&
              isBasicMoon(this.props.profile) === false &&
              isPro(this.props.profile) === false && (
                <SwiperSlide>
                  <div className="im-slide im-slide-bg8">
                    <div>
                      <h1>Purchase a license</h1>
                      <p className="im-highlighted-text">
                        Luna Modeler is available in two editions, Basic and
                        Professional.
                        <button
                          className="im-btn-default im-mt im-full-width"
                          onClick={this.openBrowser.bind(
                            this,
                            "https://www.datensen.com/target/app-compare"
                          )}
                        >
                          Compare editions
                        </button>
                        <button
                          className="im-btn-default im-mt im-full-width"
                          onClick={this.openBrowser.bind(
                            this,
                            "https://www.datensen.com/target/app-purchase"
                          )}
                        >
                          Buy now!
                        </button>
                      </p>
                    </div>
                    <div>
                      <img src={tip11} className="im-img-tip" />
                    </div>
                  </div>
                </SwiperSlide>
              )}
          </Swiper>
        </div>
        <div className="im-info">
          <div>
            <button
              className="im-btn-link"
              onClick={this.openBrowser.bind(
                this,
                "https://www.datensen.com/target/app-news-luna"
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
                "https://www.datensen.com/target/app-docs-luna"
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

export default withRouter(connect(mapStateToProps)(CarouselTipsLuna));
