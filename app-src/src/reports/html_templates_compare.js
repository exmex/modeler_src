const HtmlTemplatesCompare = {
  htmlStart(title, modelData, reportDescription, authorInfo, timestamp) {
    return `<!DOCTYPE html>
     <html lang="en">
       <head>
         <meta charset="utf-8" />
         <meta
           content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
           name="viewport"
         />
         <meta name="robots" content="noindex, nofollow" />
         <link href="datensen-moon-modeler-report.css" rel="stylesheet" />
         <link href="scrollbars.css" rel="stylesheet" />
         <link href="style.css" rel="stylesheet" />
         <link href="lists.css" rel="stylesheet" />
         <link href="modals.css" rel="stylesheet" />
         <link href="searchbar.css" rel="stylesheet" />
         <link href="im.css" rel="stylesheet" />
         <link href="compare.css" rel="stylesheet" />
         <title>${title}</title>  
         <meta name="description" content="Luna Modeler - HTML report" />
         <script>
           var page = "statistics";
           var item = "";
           var projectObj = {};
           var searchTerm = "";
           const reportDescription = \`${reportDescription}\`;
           const projectData = ${modelData};        
           const authorInfo = JSON.parse(${authorInfo});
         
       
        
      async function processAll() {
        projectObj = projectData;
        page = await getUrlParam("page");
        item = await getUrlParam("item");
        await createMainNavigationAndWrappers();

        for (let pageItem of Object.keys(projectObj)) {
          await createNavigationLists(projectObj[\`\${pageItem}\`], pageItem);
          await createSectionsAndObjects(projectObj[\`\${pageItem}\`], pageItem);
        }
        setActiveStyles();
      }

      function updateNavigationLists() {
        for (let pageItem of Object.keys(projectObj)) {
          createNavigationLists(projectObj[\`\${pageItem}\`], pageItem);
        }
      }

      function setSearchTerm(value) {
        searchTerm = value;
        updateNavigationLists();
      }

      function clearSearch() {
        setSearchTerm("");
        \$("#searchBar").val("");
        changeUrl(\`index.html?page=\${page}\`);
      }

      function zeroToDash(value) {
        return value === 0 || value === "0" ? "-" : value;
      }

      function navigateToUrl(url) {
        window.location = url;
      }

      function changeUrl(url) {
        window.history.pushState({ page: url }, url, url);
        processAll();
      }

      function getUrlParam(param) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get(param);
      }

      function resetPages() {
        \$(".mm-nav-a").removeClass("mm-nav-active");
        \$(".mm-section").removeClass("mm-section-active");
        \$(".mm-display-block").removeClass("mm-display-block");
      }

      function resetItems() {
        \$(".mm-detail").removeClass("mm-detail-active");
        \$(".mm-detail").removeClass("mm-display-none");
      }

      function setPage() {
        if (page === null) {
          page = "statistics";
        }
        if (page === "statistics") {
          hideSide();
        } else {
          showSide();
        }
        \$("#mm-sidenav-" + page).addClass("mm-sidenav-active");
        \$("#mm-section-" + page).addClass("mm-section-active");
        \$("#mm-nav-" + page).addClass("mm-nav-active");
        \$("#mm-tab-content-" + page).addClass("mm-tab-content-active");
      }

      function setItem() {
        if (item !== null && item !== undefined) {
          \$(".mm-detail").addClass("mm-display-none");
          \$("#sidenav-" + item).addClass("mm-sidenav-item-active");
          \$("#detail-" + item)
            .removeClass("mm-display-none")
            .addClass("mm-detail-active")
            .addClass("mm-display-block");
        }
      }

      function hideSide() {
        \$("#mm-side").addClass("mm-display-none");
        \$("#mm-report-content").addClass("mm-report-content-cols-1");
      }

      function showSide() {
        \$("#mm-side").removeClass("mm-display-none");
        \$("#mm-report-content").removeClass("mm-report-content-cols-1");
      }

      function setActiveStyles() {
        resetPages();
        setPage();
        resetItems();
        updateDetailsVisibilityOnPage();
        setItem();
      }

      function toggleNavTabs() {
        if (\$(".mm-nav-tabs").width() < 992) {
          \$(".mm-nav-a").toggle();
        }
      }

      async function createMainNavigationAndWrappers() {
        let mainNavs =
          '<div id="mm-nav-expander"><i onclick="toggleNavTabs()" class="mm-main-hamburger im-icon-HamburgerBold im-icon-20"></i></div><nav class="mm-nav-tabs"  onclick="toggleNavTabs()">';
        let sideNavigationWrappers = "";

        for (let reportPage of Object.keys(projectObj)) {
          if (Object.keys(projectObj[reportPage]).length > 0) {
            if (reportPage === "attributes") {
              for (let reportPageItem of Object.keys(projectObj[reportPage])) {
                mainNavs += \`<div id="mm-nav-\${reportPageItem}" class="mm-nav-a" onclick="changeUrl('index.html?page=\${reportPageItem}')">
                \${projectObj[reportPage][reportPageItem].caption}</div>  \`;
                sideNavigationWrappers += \`<div id="mm-sidenav-\${reportPageItem}"></div>\`;
              }
            } else {
              mainNavs += \`<div id="mm-nav-\${reportPage}" class="mm-nav-a" onclick="changeUrl('index.html?page=\${reportPage}')">
              \${reportPage}</div>  \`;
              sideNavigationWrappers += \`<div id="mm-sidenav-\${reportPage}"></div>\`;
            }
          }
        }
        mainNavs += "</nav>";

        document.getElementById("mm-main-navs").innerHTML = mainNavs;
        document.getElementById("mm-side-content").innerHTML =
          sideNavigationWrappers;
      }

      async function createNavigationLists(collectionOfObjects, pageName) {
        for (let item of Object.keys(collectionOfObjects)) {
          let navItems = "";
          let obj = collectionOfObjects[item]?.attributes;
          if (obj) {
            navItems = "<ul class='im-list im-collapsed im-h-100'>";
            for (let objItem of Object.keys(obj)) {
              let caption = obj[objItem].caption;
              if (caption.includes(searchTerm) || searchTerm === "") {
                navItems += \`<li  id="sidenav-itm-\${objItem}"  class="im-list-item im-rel">
                <div onclick="changeUrl('index.html?page=\${item}&item=itm-\${objItem}')">\`;
                navItems += getIconOfChange(getTypeOfChange(obj[objItem].diff));
                navItems += obj[objItem].caption;
                navItems += "</div></li>";
              }
            }
            navItems += "</ul>";
          }
          var sideNavElement = document.getElementById("mm-sidenav-" + item);
          if (sideNavElement) {
            sideNavElement.innerHTML = navItems;
          }
        }
      }

      function getTypeOfChange(diffObject) {
        if (diffObject) {
          if (diffObject.finishMissing === true) {
            return "Deleted";
          }
          if (diffObject.startMissing === true) {
            return "Added";
          }
          if (
            !diffObject.startMissing &&
            !diffObject.finishMissing &&
            !diffObject.idArray
          ) {
            return "Modified";
          } else {
            return "";
          }
        } else {
          return "Modified";
        }
      }

      function getIconOfChange(diffType) {
        switch (diffType) {
          case "Deleted":
            return \`<i class="mm-left-text mm-side-icon im-icon-Projects"></i>\`;
          case "Added":
            return \`<i class="mm-right-text mm-side-icon im-icon-ShowData"></i>\`;
          default:
            return \`<i class="mm-modified-text mm-side-icon im-icon-UpdateFromDatabase"></i>\`;
        }
      }

      function getTextOfChange(diffType) {
        switch (diffType) {
          case "Deleted":
            return \`<div>\${getIconOfChange(
              diffType
            )}This object exists only in the project and not in the database.</div>\`;
          case "Added":
            return \`<div>\${getIconOfChange(
              diffType
            )}This object exists only in the database and not in the project.</div>\`;
          default:
            return \`<div>\${getIconOfChange(
              diffType
            )}This object was modified in the database or in the project.</div>\`;
        }
      }

      function keyExists(obj, key) {
        if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
          return false;
        } else if (obj.hasOwnProperty(key)) {
          return true;
        } else if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            const result = keyExists(obj[i], key);
            if (result) {
              return result;
            }
          }
        } else {
          for (const k in obj) {
            const result = keyExists(obj[k], key);
            if (result) {
              return result;
            }
          }
        }

        return false;
      }

      function getPropertiesDiff(obj, indent, showHeaders) {
        var toReturn = \`\`;
        indent += 5;
        if (showHeaders && !keyExists(obj, "idArray")) {
          toReturn += \`<div><div class="mm-d-g-3" style="padding-left: 10px"><div class="mm-subtitle" style="padding-left: -10px"></div><div class="mm-subtitle-col mm-left-text">In project</div><div class="mm-subtitle-col mm-right-text">In database</div></div></div>\`;
        }
        for (let keyItem of Object.keys(obj)) {
          if (obj[keyItem] && 
            typeof obj[keyItem] !== "string" &&
            typeof obj[keyItem] !== "boolean" &&
            typeof obj[keyItem] !== "number"
          ) {
            if (obj[keyItem].caption && obj[keyItem].diff?.idArray) {
              toReturn += \`<div><div class="mm-d-g-3" style="padding-left: 10px"><div class="mm-subtitle" style="padding-left: \${indent}px">\${obj[keyItem].caption}</div><div class="mm-subtitle-col mm-left-text">In project</div><div class="mm-subtitle-col mm-right-text">In database</div></div></div>\`;
            
            }
            if (
              obj[keyItem].caption &&
              !obj[keyItem].diff?.idArray &&
              !obj[keyItem].startState &&
              !obj[keyItem].finishState &&
              obj[keyItem].finishMissing !== true &&
              obj[keyItem].startState !== null && 
              obj[keyItem].startState !== "" &&
              obj[keyItem].startMissing !== true &&
              [keyItem].finishState !== "" &&
              obj[keyItem].finishMissing !== true &&
              obj[keyItem].startState !== false
            ) {
              toReturn += \`<div class="mm-d-g-3" style="padding-left: 10px"><div class="mm-d-v \${
                obj[keyItem].objectCaption ? "mm-d-v-s" : ""
              }">\${
                obj[keyItem].caption
              }</div><div class="mm-d-c-c-i">\${obj[keyItem].diff?.startMissing ? "Does not exist" : ""}</div><div class="mm-d-c-c-i">\${obj[keyItem].diff?.finishMissing ? "Does not exist" : ""}</div></div>\`;
            }

            if (obj[keyItem].startState || obj[keyItem].finishState) {
              toReturn += \`<div  style="padding-left: 10px"  class="mm-d-g-3"><div style="padding-left: \${indent}px" class="mm-d-c">\${
                obj[keyItem].caption
              }</div><div class="mm-d-v">\${
                obj[keyItem].startStateCaption
                  ? convertUndefined(obj[keyItem].startStateCaption)
                  : convertUndefined(obj[keyItem].startState)
              }</div><div class="mm-d-v">\${
                obj[keyItem].finishStateCaption
                  ? convertUndefined(obj[keyItem].finishStateCaption)
                  : convertUndefined(obj[keyItem].finishState)
              }</div></div>\`;
            }

            if (obj[keyItem].diffs?.startMissing !== true) {
              toReturn += getPropertiesDiff(obj[keyItem], indent, false);
            }
          }
        }
        return toReturn;
      }

      function getCodeDiff(obj, side) {
        var code = [];
        for (let keyItem of Object.keys(obj)) {
          if (obj[keyItem] && 
            typeof obj[keyItem] !== "string" &&
            typeof obj[keyItem] !== "boolean" &&
            typeof obj[keyItem] !== "number"
          ) {
            if (obj[keyItem].startCode && side === "left") {
              code += \`\${obj[keyItem].startCode}\`;
            }

            if (obj[keyItem].finishCode && side === "right") {
              code += \`\${obj[keyItem].finishCode}\`;
            }
          }
        }

        for (let keyItem of Object.keys(obj)) {
          if (obj[keyItem] && 
            typeof obj[keyItem] !== "string" &&
            typeof obj[keyItem] !== "boolean" &&
            typeof obj[keyItem] !== "number"
          ) {
            code += getCodeDiff(obj[keyItem], side);
          }
        }
        return code;
      }

      async function createSectionsAndObjects(collectionOfObjects, pageName) {
        let sectionsData = "";

        sectionsData += \`<div class="mm-section" id="mm-section-statistics"><div class="mm-fullpage-wrapper"><div id="detail-itm-statistics" class="mm-detail">
          <div class="mm-statistics-group">Statistics</div><div class="im-content-spacer-lg"></div>\`;
        sectionsData += \`<div class="mm-d-g-5">
                        <div class="mm-d-c-c-i ">Object type</div>
                        <div class="mm-d-c-c-i im-align-center">\${getIconOfChange(
                          "Deleted"
                        )}In project only</div> 
                        <div class="mm-d-c-c-i im-align-center">\${getIconOfChange(
                          "Added"
                        )}In database only</div>
                                               
                        <div class="mm-d-c-c-i im-align-center">\${getIconOfChange(
                          "Modified"
                        )}Modified</div>
                        <div class="mm-d-c-c-i im-align-center">Total objects in database</div>
                     \`;
        for (let statItem in projectData.statistics) {
          sectionsData += \`                     
                        <div class="mm-d-v">\${
                          projectData.statistics[statItem].caption
                        }</div>
                        <div class="mm-d-v im-align-center">\${zeroToDash(
                          projectData.statistics[statItem].count.removed.count
                        )}</div>
                        <div class="mm-d-v im-align-center">\${zeroToDash(
                          projectData.statistics[statItem].count.added.count
                        )}</div>
                        
                        <div class="mm-d-v im-align-center">\${zeroToDash(
                          projectData.statistics[statItem].count.modified.count
                        )}</div>
                        <div class="mm-d-v im-align-center">\${zeroToDash(
                          projectData.statistics[statItem].count.total
                        )}</div>
                      \`;
        }
        sectionsData += \`</div>\`;
        if(reportDescription){
        sectionsData += \`<div class="im-content-spacer-lg"></div>\`; 
        sectionsData += \`<div class="mm-d-v-i">Report description</div>\`;    
        sectionsData += \`<div class="im-content-spacer-sm"></div>\`;     
        sectionsData += \`<div class="mm-compare-text">\${reportDescription}</div>\`;
        }

        if(authorInfo !== null && ((authorInfo.authorName !== "" && authorInfo.authorName !== undefined) || (authorInfo.companyDetails !== "" && authorInfo.companyDetails !== undefined) )){
          sectionsData += \`<div class="im-content-spacer-lg"></div>\`; 
          sectionsData += \`<div class="mm-d-v-i">Created by</div>\`;   
          sectionsData += \`<div class="im-content-spacer-sm"></div>\`; 
          if(authorInfo.authorName !== "" && authorInfo.authorName !== undefined && authorInfo.authorName !== null){
          sectionsData += \`<div class="mm-compare-text mm-author">\${authorInfo.authorName}</div>\`;
          }
          if(authorInfo.companyDetails !== "" && authorInfo.companyDetails !== undefined){
          sectionsData += \`<div class="mm-compare-text">\${authorInfo.companyDetails}</div> \`;
          }
          if(authorInfo.companyUrl !== "" && authorInfo.companyUrl !== undefined){
          sectionsData += \`<div class="mm-compare-text"><a href="\${authorInfo.companyUrl}" target="_blank">\${authorInfo.companyUrl}</a></div>\`;
          }
          }

          sectionsData += \`<div class="im-content-spacer-md"></div>\`; 
        sectionsData += \`<div class="mm-timestamp"><div class="mm-d-c-i">${timestamp}</div></div>\`;   
        sectionsData += \`</div></div></div>\`; 

        for (let item of Object.keys(collectionOfObjects)) {
          let obj = collectionOfObjects[item]?.attributes;
          if (obj) {
            sectionsData += \`<div class="mm-section" id="mm-section-\${item}">\`;
            sectionsData += \`<div class="mm-section-group">\${collectionOfObjects[item].caption}</div>\`;
            for (let keyItem of Object.keys(obj)) {
              sectionsData += \`<div id="detail-itm-\${keyItem}" class="mm-detail"
                >
                    <div class="mm-d-i">
                      <div class="mm-d-c-i">Name</div>
                      <div class="mm-d-v-i">\${obj[keyItem].caption}</div>
                    </div>
                    <div class="mm-compare-message">\${getTextOfChange(
                      getTypeOfChange(obj[keyItem].diff)
                    )}</div>\`;

              if (
                obj[keyItem].generated?.startCode ||
                obj[keyItem].generated?.finishCode
              ) {
                sectionsData += \`<div class="mm-title-section"><i class="im-icon-ShowDescription"></i> Script</div>\`;
              }

              if (
                obj[keyItem].generated?.startCode &&
                obj[keyItem].generated?.finishCode
              ) {
                sectionsData += \`<div class="im-code-split">\`;
              } else {
                sectionsData += \`<div class="im-code-split im-code-fullwidth">\`;
              }

              if (obj[keyItem].generated?.startCode) {
                sectionsData += \`<div><div class="mm-d-c-c-i mm-left">In project</div><pre>\${getCodeDiff(
                  obj[keyItem],
                  "left"
                )}</pre></div>\`;
              }

              if (getCodeDiff(obj[keyItem], "right") !== "") {
                sectionsData += \`<div><div class="mm-d-c-c-i mm-right">In database</div><pre>\${getCodeDiff(
                  obj[keyItem],
                  "right"
                )}</pre></div>\`;
              }
              sectionsData += \`</div>\`;
              sectionsData += \`<div class="mm-title-section"><i class="im-icon-Diff"></i> Differences</div>\`;

              sectionsData += \`<div>\${getPropertiesDiff(
                obj[keyItem],
                -10, true
              )}</div>
                  </div>\`;
            }
            sectionsData += \`</div>\`;
          }
        }        

       
        var contentElement = document.getElementById("mm-content");
        if (contentElement) {
          contentElement.innerHTML = sectionsData;
        }
      }

      function updateDetailsVisibilityOnPage() {
        for (let item of Object.keys(projectObj)) {
          let navItems = "";
          let obj = projectObj[item]?.attributes;
          if (obj) {
            for (let keyItem of Object.keys(obj)) {
              updateItemDetailsVisibility(projectObj[keyItem], keyItem);
            }
          }
        }
      }

      function convertUndefined(value) {
        return value === undefined || value === "undefined"
          ? "<span>-</span>"
          : value;
      }

      async function updateItemDetailsVisibility(
        collectionOfObjects,
        pageName
      ) {
        if (item !== null && item !== undefined) {
          await \$(".mm-detail")
            .removeClass("mm-display-block")
            .addClass("mm-display-none");
        } else {
          await \$(".mm-detail")
            .removeClass("mm-display-block")
            .addClass("mm-display-none");
          for (let item of Object.keys(collectionOfObjects)) {
            let iterItem = collectionOfObjects[item];

            \$("#detail-itm-" + iterItem.id)
              .removeClass("mm-display-none")
              .addClass("mm-display-block");
          }
        }
      }
    </script>
  </head>
  <body onload="processAll()" class="mm-main-report-area">
    <div class="container-fluid" id="mm-main-navs"></div>
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

              <div class="im-search-button" onclick="clearSearch()">
                <i class="im-icon-Cross16 im-icon-16"></i>
              </div>
              <div></div>
            </div>
          </div>
          <div id="mm-side-content"></div>
        </div>
      </div>
      <div id="mm-content"></div>
    </div>
    <div id="objDetail"></div>
    <script
      src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
      integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
      crossorigin="anonymous"
    ></script>
  </body>
</html>`;
  }
};
export default HtmlTemplatesCompare;
