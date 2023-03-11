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
import tip1 from "../assets/tips-json-nested.png";
import tip10 from "../assets/tips-videos.png";
import tip11 from "../assets/tips-purchase.png";
import tip12 from "../assets/tips-generate.png";
import tip2 from "../assets/tips-column-properties.png";
import tip3 from "../assets/tips-cardinality.png";
import tip4 from "../assets/tips-reports.png";
import tip5 from "../assets/tips-sql-settings.png";
import tip6 from "../assets/tips-connections.png";
import tip7 from "../assets/tips-project-default-values-right-panel.png";
import tip8 from "../assets/tips-import.png";
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
              <div className="im-slide im-slide-bg5">
                <div>
                  <h1>Draw ER Diagrams</h1>
                  <p>
                    Design structures for both noSQL and relational databases
                    and display nested JSON/documents directly in ER diagrams.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: To visualize nested structures, edit a table, define a
                    new column and select a previously created JSON object from
                    the list "data type" drop-down list
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
                  <h1>Draw relations</h1>
                  <p>
                    Click on the parent table and then on the child table to
                    draw a new relationship. Then enter the cardinality settings
                    and edit the view mode to see the details.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: View modes can be changed through the main toolbar.
                    View or hide nested objects, cardinality captions, schema
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
                    Easily generate SQL for relational databases, schema
                    validation scripts for MongoDB, or schemas for Mongoose or
                    GraphQL.
                  </p>
                  <p className="im-highlighted-text">
                    Tip: For relational databases, set the generation settings
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
              <div className="im-slide im-slide-bg7">
                <div>
                  <h1>Import from files</h1>
                  <p>This feature is available for SQLite and GraphQL.</p>
                  <p className="im-highlighted-text">
                    Tip: To visualize an existing SQLite database structure or
                    GraphQL schema go to the Projects section and import SQLite
                    from a file.{" "}
                  </p>
                </div>
                <div>
                  <img src={tip8} className="im-img-tip" />
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
            {isBasic(this.props.profile) === false &&
              isPro(this.props.profile) === false && (
                <SwiperSlide>
                  <div className="im-slide im-slide-bg8">
                    <div>
                      <h1>Purchase a license</h1>
                      <p className="im-highlighted-text">
                        Moon Modeler is available in two editions, Basic and
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

export default withRouter(connect(mapStateToProps)(CarouselTips));
