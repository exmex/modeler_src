import JsTemplates from "./js_templates";

const HtmlTemplates = {
  htmlStart(title, modelData) {
    return `<!DOCTYPE html>
    <html lang="en">
     <head>
     <meta charset="utf-8" />
     
     <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
     <meta name="robots" content="noindex, nofollow">
     <link href="datensen-moon-modeler-report.css" rel="stylesheet" />    
     <link href="scrollbars.css" rel="stylesheet" />
     <link href="style.css" rel="stylesheet" />
     <link href="lists.css" rel="stylesheet" />
     <link href="modals.css" rel="stylesheet" />
     <link href="searchbar.css" rel="stylesheet" />
     <link href="im.css" rel="stylesheet" />
     <title>${title}</title>  
     <meta name="description" content="Moon Modeler - HTML report">
     ${JsTemplates.jsStart()}
     ${JsTemplates.jsGlobalVariables()}
     ${JsTemplates.jsModel(modelData)}
     ${JsTemplates.jsFunctions()}
     ${JsTemplates.jsEnd()}
     </head>`;
  },

  bodyStart(bodyAttributes) {
    return `<body  onclick="setPlaceholderClick(event)" onload="processAll()" ${bodyAttributes}>`;
  },

  body() {
    return `<div class="container-fluid" id="mm-main-navs"></div>
    <div class="container-fluid" id="mm-report-content">
    <div id="mm-side">
      <div id="mm-side-wrapper">
        <div id="mm-search">
          <div class="im-search-bar">
            <div></div>
            <input
            class="im-search-box-input"
            onkeyup="setSearchTerm(event.target.value)"
            placeholder="Filter"
            type="text"
            id="searchBar"
            />

            <div class="im-search-button" onclick="clearSearch()"><i class="im-icon-Cross16 im-icon-16"></i></div>
            <div></div>
          </div>
        </div>
      
        <div id="mm-side-content"></div>
      </div>
    </div>
    <div id="mm-content">
    `;
  },

  bodyFooter() {
    return `</div></div>
    
    <div id="placeholder" >
    <div class="mm-modal-fix">
    <div class="modal-header">Details</div>
    <div class="modal-content">
      <div id="placeholder-content"></div>
    </div>
    <div class="modal-footer">
      <button onclick="hidePlaceholder()" class="im-btn-default">
        Close
      </button>
    </div>
    </div>
    </div>`;
  },

  bodyEnd() {
    return `
    <script
    src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
    integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
    crossorigin="anonymous">
    </script>
    </body>`;
  },
  htmlEnd() {
    return `</html>`;
  }
};
export default HtmlTemplates;
