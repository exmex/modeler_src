import Helpers from "../helpers/helpers";

const JsTemplates = {
  jsStart() {
    return `<script>`;
  },
  jsGlobalVariables() {
    return `
    var page = "mm1";
    var item = "";
    var projectObj = {};
    var searchTerm = "";
    `;
  },
  jsModel(jsonData) {
    return `const projectData = ${JSON.stringify(jsonData, Helpers.escape)}`;
  },

  jsFunctions() {
    return `    
    async function processAll() {
      projectObj = projectData;
      page = await getUrlParam("page");
      item = await getUrlParam("item");
      await createMainNavigationAndWrappers();

      for (let pageItem of Object.keys(projectObj)) {
        await createNavigationLists(getFilteredItems(searchTerm, projectObj[\`\${pageItem}\`]), pageItem);
        await addEventsToDiagram(projectObj[\`\${pageItem}\`]);
      }
      setActiveStyles();     
    }

    function updateNavigationLists() {
      for (let pageItem of Object.keys(projectObj)) {
        createNavigationLists(getFilteredItems(searchTerm, projectObj[\`\${pageItem}\`]), pageItem);
      }
    }

    function setSearchTerm(value) {     
      searchTerm = value;
      updateNavigationLists();
    }

    function clearSearch() {
      setSearchTerm("");
      $("#searchBar").val("");
      changeUrl(\`index.html?page=\${page}\`);
    }

    function getFilteredItems(searchTerm, collection) {      
      let toReturn = collection;
      if (searchTerm !== "") {
      toReturn = Object.values(collection).filter(t =>
          t.name.includes(searchTerm)
        );
      }
      return toReturn;
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
      $(".mm-nav-a").removeClass("mm-nav-active");
      $(".mm-section").removeClass("mm-section-active");
      $(".mm-display-block").removeClass("mm-display-block");
    }

    function resetItems() {
      $(".mm-detail").removeClass("mm-detail-active");
      $(".mm-detail").removeClass("mm-display-none");
    }

    function setPage() {
      if (page === null) {
        page = "Diagrams";
      }
      $("#mm-sidenav-" + page).addClass("mm-sidenav-active");
      $("#mm-section-" + page).addClass("mm-section-active");
      $("#mm-nav-" + page).addClass("mm-nav-active");
      $("#mm-tab-content-" + page).addClass("mm-tab-content-active");
    }

    function setItem() {
      if (item !== null && item !== undefined) {
        //$("#" + item).addClass("mm-display-blockxxx");
        $(".mm-detail").addClass("mm-display-none");
        $("#sidenav-" + item).addClass("mm-sidenav-item-active");
        $("#detail-" + item).removeClass("mm-display-none")
          .addClass("mm-detail-active")
          .addClass("mm-display-block");
      }
    }

    function hideSide() {
      $("#mm-side").addClass("mm-display-none");
      $("#mm-report-content").addClass("mm-report-content-cols-1");
    }

    function showSide() {
      $("#mm-side").removeClass("mm-display-none");
      $("#mm-report-content").removeClass("mm-report-content-cols-1");
    }

    function showPlacehodler(){
      $("#placeholder").removeClass("mm-display-none").addClass("mm-display-block");
          $("#placeholder-content").html($("#detail-" + item).prop("outerHTML"));
    }

    function hidePlaceholder(){
      $("#placeholder").removeClass("mm-display-block").addClass("mm-display-none");
    }

    function setDiagram() {
      if (page === "Diagrams" || page === "Project" || page === undefined) {
        hideSide();
        if (item !== null && item !== undefined) {
          showPlacehodler();
        } else {
          hidePlaceholder();
        }
        $(".main-area").addClass("mm-display-block");
      } else {
        showSide();
        if (item !== null && item !== undefined && $(window).width() < 992) {            
          showPlacehodler()
        } else {
          hidePlaceholder();
        }
      }
    }

    function setActiveStyles() {
      resetPages();
      setPage();
      resetItems();
      updateDetailsVisibilityOnPage();
      setItem();
      setDiagram();
    }

    function hidePlaceholder(){
      $("#placeholder").removeClass("mm-display-block").addClass("mm-display-none");
    }

    function setPlaceholderClick(event) {
    
      var parent = event.target;
      while (parent) {
        if (parent.id) {
          if (parent.id == "placeholder") {
            return;
          }
        }
        parent = parent.parentElement;
      }
        hidePlaceholder();
    }

    function addEventToElement(elementName, itemId) {
      let element = document.getElementById(elementName);
      if (element) {
        element.onclick = function (event) {
          changeUrl(\`index.html?page=Diagrams&item=itm-\${itemId}\`);
        };
      }
      else {
        let jsonSchemaReportElements = document.querySelectorAll(\`[data-report-id="\${itemId}"]\`);
        if(jsonSchemaReportElements){
        for (let jsonSchemaReportElement of jsonSchemaReportElements) {
          jsonSchemaReportElement.onclick = function (event) {
            changeUrl(\`index.html?page=Diagrams&item=itm-\${itemId}\`);
          };
        }    
      }
    }
      event.stopPropagation();
      event.preventDefault();
    }

    async function addEventsToDiagram(collectionOfObjects) {
      for (let item of Object.keys(collectionOfObjects)) {
        addEventToElement(item, item);
        addEventToElement(\`r\${item}\`, item);
        addEventToElement(\`rb\${item}\`, item);
        addEventToElement(\`rt\${item}\`, item);
      }
    }

    function toggleNavTabs() {
      if ($(".mm-nav-tabs").width() < 992) {
        $(".mm-nav-a").toggle();
      }
    }

    async function createMainNavigationAndWrappers() {
      let mainNavs = '<div id="mm-nav-expander"><i onclick="toggleNavTabs()" class="mm-main-hamburger im-icon-HamburgerBold im-icon-20"></i></div><nav class="mm-nav-tabs"  onclick="toggleNavTabs()">';
      let sideNavigationWrappers = "";
      mainNavs += \`<div id="mm-nav-Diagrams" class="mm-nav-a" onclick="changeUrl('index.html?page=Diagrams')">Diagram</div>\`;

      for (let reportPage of Object.keys(projectObj)) {
        if (Object.keys(projectObj[reportPage]).length > 0) {          
        mainNavs += \`<div id="mm-nav-\${reportPage}" class="mm-nav-a" onclick="changeUrl('index.html?page=\${reportPage}')">
        \${reportPage}        
    </div>  \`;
        }
    sideNavigationWrappers += \`<div id="mm-sidenav-\${reportPage}"></div>\`;
      }
      mainNavs += \`<div id="mm-nav-Project" class="mm-nav-a mm-ml-auto" onclick="changeUrl('index.html?page=Project')">Project</div>\`;
      mainNavs += "</nav>";
     

      document.getElementById("mm-main-navs").innerHTML = mainNavs;
      document.getElementById("mm-side-content").innerHTML = sideNavigationWrappers;
    }

    async function createNavigationLists(collectionOfObjects, pageName) {
      let navItems = "<ul class='im-list im-collapsed im-h-100'>";
      for (let item of Object.keys(collectionOfObjects)) {
        let iterItem = collectionOfObjects[item];
        navItems += \`<li  id="sidenav-itm-\${iterItem.id}"  class="im-list-item im-rel">
          <div onclick="changeUrl('index.html?page=\${pageName}&item=itm-\${iterItem.id}')">\`;
        navItems += iterItem.name;
        navItems += "</div></li>";
      }
      navItems += "</ul>";
      document.getElementById("mm-sidenav-" + pageName).innerHTML = navItems;
    }

    function updateDetailsVisibilityOnPage() {
      for (let pageItem of Object.keys(projectObj)) {          
        updateItemDetailsVisibility(projectObj[\`\${pageItem}\`], pageItem);
      }
    }

    async function updateItemDetailsVisibility(collectionOfObjects, pageName) {
      if (item !== null && item !== undefined) {
        await $(".mm-detail").removeClass("mm-display-block").addClass("mm-display-none");
      } else {
        await $(".mm-detail").removeClass("mm-display-block").addClass("mm-display-none");
        for (let item of Object.keys(collectionOfObjects)) {
          let iterItem = collectionOfObjects[item];

          $("#detail-itm-" + iterItem.id)
            .removeClass("mm-display-none")
            .addClass("mm-display-block");
        }
      }
    }

    `;
  },
  jsEnd() {
    return "</script>";
  }
};
export default JsTemplates;
