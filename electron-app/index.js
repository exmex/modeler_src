// Copyright: 2022, Ideamerit s.r.o. (www.datensen.com)
const electron = require("electron");
const fs = require("fs");
const _ = require("lodash");
let axios = require("axios");
const { app, BrowserWindow, ipcMain, dialog, shell, session } = electron;

const os = require("os");
const path = require("path");

const IntegrationFactory = require("./src/app/integration/integration-factory");
const FilenameProvider = require("./src/app/integration/filename-provider");
const PayloadProcessor = require("./src/app/integration/payload-processor");
const Dispatcher = require("./src/app/integration/dispatcher");
const SettingsContext = require("./src/app/settings/settings");
const checkModelVersion = require("./src/app/check_model_version");
const { loadMenu, MENU_DEFAULT } = require("./src/app/menu/application_menu");
const ModelTypes = require("./src/app/integration/db-platform/model_types");
const { getAppTitle, getAppName, getAppVersion } = require("common");
const ChildProcessExecutor = require("./src/app/integration/child-process-executor");
const CancelErrorExecutor = require("./src/app/integration/cancel-error-executor");
const getIntegrations = require("./src/app/integration/integrations");
const { cpDir, exists } = require("./src/app/util/fs-advanced");

const productName = process.env.CURRENT_PRODUCT;
const productDir = process.env.CURRENT_PRODUCT_DIR_NAME;

const fileSuffix = process.env.CURRENT_PRODUCT === "perseid" ? "dpm" : "dmm";
const e2eTestCache = [];
let forcedClose = false;

const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} = require('electron-devtools-installer');

const dotenv = require("dotenv");
const currentConfigPath = path.join(
  process.cwd(),
  `.env${
    process.env.NODE_ENV === "development" ? `.${process.env.NODE_ENV}` : ""
  }`
);
dotenv.config({ path: currentConfigPath });
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  console.log({
    currentConfigPath,
    node_env: process.env.NODE_ENV,
    dirname: __dirname,
    process_cwd: process.cwd()
  });
}
require("wdio-electron-service/main");

app.setName(getAppName(productName));
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";

ipcMain.handle("wdio-electron", (event, paramArray) => {
  const paramName = paramArray[0];
  if (paramName === "FORCED_CLOSE") {
    forcedClose = true;
    app.quit();
  }
  if (paramName === "SET_PROCESS_ENV") {
    process.env[paramArray[1]] = paramArray[2];
    return e2eTestCache[paramArray[1]];
  }
  if (paramName === "TEST_INITIALIZED") {
    isTestInitialized = true;
  }
  return e2eTestCache[paramName];
});

let mainWindow;
let settings;

var splash;

var init = true;

const isMac = process.platform === "darwin";
const isDebug = () => {
  return process.env.REACT_DEBUG === `true`;
};

let isTestInitialized = false;
const isTest = process.env.NODE_ENV === "test";
if (isTest && isDebug()) {
}

const reduxDevToolsPathByPlatform = () => {
  switch (process.platform) {
    case "darwin":
      return "Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.11_0";
    case "linux":
      return "snap/chromium/common/chromium/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.11_0";
    default:
      return "/AppData/Local/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.17_0";
  }
};

const reduxDevToolsPath = path.join(
  os.homedir(),
  reduxDevToolsPathByPlatform()
);

const windowSetup = {
  enableRemoteModule: false,
  contextIsolation: true,
  nodeIntegration: true,
  spellcheck: false,
  preload: path.join(__dirname, "preload.js") // use a preload script
};

app.on("ready", async () => {
  /*try {
    if (isDebug() === true && !isTest) {
      await session.defaultSession.loadExtension(reduxDevToolsPath, {
        allowFileAccess: true
      });
    }
  } catch (e) {
    console.log(e.message);
  }*/
  installExtension(REDUX_DEVTOOLS, {
    loadExtensionOptions: { allowFileAccess: true },
  })
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

  const debugText = isDebug() === true && !isTest ? `DEBUG ` : ``;
  const title = `${debugText}${getAppTitle(productName)} - ${getAppVersion(
    productName
  )}`;

  mainWindow = new BrowserWindow({
    show: false,
    height: 800,
    width: 1200,
    webPreferences: {
      backgroundThrotteling: false,
      ...windowSetup
    },
    title,
    icon: path.join(productDir, "build/icons/128x128.png")
  });

  settings = SettingsContext.instance(mainWindow, ipcMain, productName);

  splash = new BrowserWindow({
    width: 512,
    height: 512,
    transparent: true,
    frame: false,
    icon: path.join(productDir, "build/icons/128x128.png"),
    title: "Splash",
    webPreferences: {
      ...windowSetup
    }
  });

  splash.loadURL(`file://${productDir}/build/splash.html`);
  mainWindow.loadURL(`file://${productDir}/build/index.html`);
  mainWindow.on("close", (e) => {
    if (!init) {
      if (!forcedClose) {
        mainWindow.webContents.send("app:close");
        e.preventDefault();
      }
    }
  });

  loadMenu(app, mainWindow, MENU_DEFAULT);

  mainWindow.once("ready-to-show", async () => {
    if (isTest) {
      while (isTestInitialized === false) {
        await new Promise((r) => {
          setTimeout(() => r(), 50);
        });

        console.log({
          REACT_DEBUG: process.env.REACT_DEBUG,
          REACT_DEBUG_TYPE: process.env.REACT_DEBUG_TYPE,
          NODE_ENV: process.env.NODE_ENV,
          VALID_LICENSE: process.env.VALID_LICENSE,
          INVALID_LICENSE: process.env.INVALID_LICENSE,
          IMPORT_FILENAME: process.env.IMPORT_FILENAME,
          MOCK_NOW: process.env.MOCK_NOW,
          TEST: process.env.TEST
        });

        if (isDebug()) {
          mainWindow.webContents.send("app:test", {
            MOCK_NOW: process.env.MOCK_NOW
          });
        }
      }
    }

    splash.close();
    init = false;
    await mainWindow.maximize();
    await mainWindow.show();
  });

  registerMMREIntegrations(mainWindow.webContents);
});

/*
ipcMain.on("app:exportToPng", (event) => {
  const { x: left, y: top, width, height } = document.querySelector('my-element').getBoundingClientRect();

webContents.capturePage({x, y, width, height}, (image) => {
  //image is a NativeImage instance.  
  const buff = image.toPNG();
  //now you can save it to disk or do whatever
})
})
*/

ipcMain.on("app:exportToPdf", async (event, printOptions) => {
  try {
    //console.log("export called", printOptions);
    var pdfPath; //= path.join(os.tmpdir(), "print.pdf");
    const defaultPath =
      settings.getModelPdfReportFilePath() ??
      `${settings.getDefaultPath()}/${printOptions.filename}.pdf`;

    const options = {
      defaultPath,
      title: "Select a file"
    };
    ///

    let { canceled, filePath } = await dialog.showSaveDialog(null, options);
    if (canceled) {
      console.log("You didn't save the file");
      return;
    }
    //console.log("filename", fileName);
    let fileExtension = filePath.substr(filePath.lastIndexOf(".") + 1);
    if (fileExtension !== "pdf") {
      filePath = filePath + ".pdf";
    }
    // fileName is a string that contains the path and filename created in the save file dialog.
    pdfPath = filePath;
    //console.log("pdf path", pdfPath);
    ///
    settings.setModelPdfReportFilePath(pdfPath);

    const win = BrowserWindow.fromWebContents(event.sender);
    var opts = {
      pageSize: { width: printOptions.width, height: printOptions.height },
      printBackground: printOptions.printBackground,
      marginsType: 1
    };
    //console.log("win", win);
    win.webContents
      .printToPDF(opts)
      .then((data) => {
        /*if (err) {
       
      } else {*/
        //console.log(pdfPath, "PDF path");
        fs.writeFile(pdfPath, data, (err) => {
          if (err) {
            mainWindow.webContents.send("notification:newMessage", {
              type: "error",
              message:
                "PDF file could not be saved. Make sure it is not already open." +
                err.message,
              autohide: false
            });
            mainWindow.webContents.send("app:exportToPdfFinished");
            return console.log(err.message);
          } else {
            //console.log("pdf file export attempt done");
            shell.openExternal("file://" + pdfPath);
            mainWindow.webContents.send("notification:newMessage", {
              type: "info",
              message: "PDF file saved to " + pdfPath,
              autohide: true,
              urlCaption: "Open PDF file",
              urlToOpen: "file://" + pdfPath,
              urlIsExternal: true
            });
            mainWindow.webContents.send("app:exportToPdfFinished");
          }
        });

        //}
      })
      .catch((err) => {
        mainWindow.webContents.send("notification:newMessage", {
          type: "error",
          message:
            "PDF file could not be saved. Make sure it is not already open." +
            err.message,
          autohide: false,
          urlCaption: null,
          urlToOpen: null,
          urlIsExternal: false
        });
        mainWindow.webContents.send("app:exportToPdfFinished");
        return console.log(err.message);
      });
  } catch (e) {
    mainWindow.webContents.send("app:exportToPdfFinished");
  }
});

ipcMain.on("app:quit", (event, message) => {
  mainWindow = null;
  app.quit();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* IPC LISTENERS */
ipcMain.on("link:openExternal", (event, url) => {
  if (process.env.NODE_ENV === "test") {
    console.log(`SHELL.OPEN_EXTERNAL=${url}`);
  }
  require("electron").shell.openExternal(url);
});

function buildModelTextAndFilePath(modelWithFilePathText) {
  const modelWithFilePath = JSON.parse(modelWithFilePathText);
  const filePath = modelWithFilePath.model.filePath;
  const model = {
    ...modelWithFilePath,
    model: _.omit(modelWithFilePath.model, "filePath")
  };
  const modelText = formatModelToText(model);
  return { filePath, modelText };
}

ipcMain.on("model:convertAndSaveTemp", async (event, { convertedModel }) => {
  mainWindow.webContents.send("model:convertAndSaveTempCompleted", {
    modelData: convertedModel,
    filePath: "",
    lastSaveDay: ""
  });
});

ipcMain.on("model:save", async (event, { modeldata, shouldChangeFileInUI }) => {
  const { modelText, filePath } = buildModelTextAndFilePath(modeldata);
  if (filePath !== "" && filePath !== undefined) {
    saveChanges(filePath, modelText, shouldChangeFileInUI);
  } else {
    await saveFile(modelText, shouldChangeFileInUI);
  }
});

ipcMain.on(
  "model:saveAs",
  async (event, { modeldata, shouldChangeFileInUI }) => {
    const { modelText } = buildModelTextAndFilePath(modeldata);
    await saveFile(modelText, shouldChangeFileInUI);
  }
);

ipcMain.on("script:saveToSingleFile", (event, scriptdata) => {
  var parsedArray = JSON.parse(scriptdata);
  //console.log(parsedArray);
  _.map(parsedArray.data, async (item) => {
    await saveScriptToFile(
      item.script,
      parsedArray.writeFileParam,
      item.name,
      parsedArray.suffix
    );
  });
});

function formatModelToText(model) {
  return JSON.stringify(model, "", "\t");
}

ipcMain.on("app:exportToDiffHtml", async (event, data) => {
  let destinationFolder = await openFolder(
    settings.getModelHTMLReportDir() ?? settings.getDefaultPath()
  );

  if (destinationFolder === undefined) {
    return;
  }

  saveScriptFile(
    path.join(destinationFolder, "/index.html"),
    data.reportContent,
    true,
    false
  );

  settings.setModelHTMLReportDir(destinationFolder);

  var stylesPath;
  if (process.env.NODE_ENV === "development") {
    stylesPath = path.join(
      productDir,
      path.sep,
      "build",
      path.sep,
      "styles",
      path.sep,
      data.reportStyleName
    );
  } else {
    stylesPath = path.join(
      process.resourcesPath,
      "build",
      path.sep,
      "styles",
      path.sep,
      data.reportStyleName
    );
  }

  await cpDir(stylesPath, destinationFolder);

  shell.openExternal("file://" + path.join(destinationFolder, "/index.html"));
  mainWindow.webContents.send("script:saveScriptCompleted");
  mainWindow.webContents.send("notification:newMessage", {
    type: "info",
    message:
      "Comparison report saved to " +
      path.join(destinationFolder, "/index.html"),
    autohide: true,
    urlCaption: `Open report`,
    urlToOpen: "file://" + path.join(destinationFolder, "/index.html"),
    urlIsExternal: true
  });
});

ipcMain.on("app:exportToHtml", async (event, data) => {
  let destinationFolder = await openFolder(
    settings.getModelHTMLReportDir() ?? settings.getDefaultPath()
  );
  if (destinationFolder === undefined) {
    return;
  }

  saveScriptFile(
    path.join(destinationFolder, "/index.html"),
    data.reportContent,
    true,
    false
  );

  settings.setModelHTMLReportDir(destinationFolder);

  var stylesPath;
  if (process.env.NODE_ENV === "development") {
    stylesPath = path.join(
      productDir,
      path.sep,
      "build",
      path.sep,
      "styles",
      path.sep,
      data.reportStyleName
    );
  } else {
    stylesPath = path.join(
      process.resourcesPath,
      "build",
      path.sep,
      "styles",
      path.sep,
      data.reportStyleName
    );
  }

  await cpDir(stylesPath, destinationFolder);

  shell.openExternal("file://" + path.join(destinationFolder, "/index.html"));
  mainWindow.webContents.send("script:saveScriptCompleted");
  mainWindow.webContents.send("notification:newMessage", {
    type: "info",
    message: "Report saved to " + path.join(destinationFolder, "/index.html"),
    autohide: true,
    urlCaption: `Open report`,
    urlToOpen: "file://" + path.join(destinationFolder, "/index.html"),
    urlIsExternal: true
  });
});

ipcMain.on("script:save", async (event, scriptdata) => {
  let destinationFolder = await openFolder(
    settings.getModelScriptsDir() ?? settings.getDefaultPath()
  );
  if (destinationFolder === undefined) {
    mainWindow.webContents.send("script:saveScriptCompleted", { cancel: true });
    return;
  }
  var parsedArray = JSON.parse(scriptdata);
  _.forEach(parsedArray.data, (item) => {
    saveScriptFile(
      destinationFolder + "/" + item.name + "." + parsedArray.suffix,
      item.script,
      parsedArray.writeFileParam,
      false
    );
  });
  settings.setModelScriptsDir(destinationFolder);
  mainWindow.webContents.send("script:saveScriptCompleted");
  mainWindow.webContents.send("notification:newMessage", {
    type: "info",
    message: "Scripts generation finished.",
    autohide: true,
    urlCaption: `Open folder`,
    urlToOpen: "file://" + destinationFolder,
    urlIsExternal: true
  });
});

ipcMain.on("model:open", async () => {
  await modelOpen();
});

ipcMain.on("model:openFromCommandLine", async () => {
  await modelOpenFromCommandLine();
});

ipcMain.on("model:reopen", async (event, { filePath, removeRestoreItem }) => {
  try {
    var stats = await fs.promises.stat(filePath);
    var mtime = stats.mtime;

    fs.readFile(filePath, "utf-8", async (err, data) => {
      if (err) {
        return;
      } else {
        var d = {};
        d.modelData = JSON.parse(data);
        d.filePath = filePath;
        d.lastSaveDay = mtime;
        if (!!removeRestoreItem) {
          d.filePath = "";
          d.modelData.model.isDirty = true;
          await removeRestoreItemAndFile(filePath, removeRestoreItem);
        }

        mainWindow.webContents.send("model:reopenCompleted", d);
      }
    });
  } catch (e) {
    dialog.showMessageBox(
      null,
      {
        type: "info",
        buttons: ["Close"],
        message: "Project file not found or cannot be loaded.",
        title: "Info"
      },
      function () {
        return;
      }
    );
  }
});

async function removeRestoreItemAndFile(filePath, removeRestoreItem) {
  try {
    await fs.promises.unlink(filePath);
  } catch (e) {}
  settings.setRestore({
    ..._.omit(settings.getRestore(), removeRestoreItem)
  });
}

async function getFileFromUrl(url) {
  const axiosInstance = axios.create();
  const response = await axiosInstance.get(url);
  return response.data;
}

ipcMain.on("model:openFromUrl", async (event, urlPath) => {
  try {
    var data = await getFileFromUrl(urlPath);
    if (
      data.model?.id &&
      data.model?.storedin &&
      _.endsWith(urlPath, `.${fileSuffix}`)
    ) {
      var d = {};
      d.modelData = JSON.parse(JSON.stringify(data));
      d.filePath = "";
      d.lastSaveDay = "";
      mainWindow.webContents.send("model:openFromUrlCompleted", d);
    } else {
      sendOpenFromUrlError("Incorrect project file.", undefined);
    }
  } catch (e) {
    sendOpenFromUrlError(`Project file could not be loaded. ${e.message}`, e);
  }
});

function sendOpenFromUrlError(message, error) {
  mainWindow.webContents.send("model:openFromUrlCompleted", {
    error: error ? error.message : message
  });
  mainWindow.webContents.send("notification:newMessage", {
    type: "error",
    message,
    autohide: false
  });
}

ipcMain.on(
  "connectionsList:runChooseFile",
  async (event, { propertyName, currentFilePath, title, filters }) => {
    const defaultPath = path.dirname(currentFilePath);
    const options = {
      title,
      defaultPath:
        defaultPath && defaultPath !== "" && defaultPath !== "."
          ? defaultPath
          : settings.getDefaultPath(),
      filters,
      properties: ["openFile"]
    };

    const { canceled, filePaths } = await dialog.showOpenDialog(options);
    let result = { propertyName };
    if (!canceled) {
      result = { ...result, filePath: filePaths[0] };
      settings.setDefaultPath(path.dirname(filePaths[0]));
    }

    mainWindow.webContents.send("connectionsList:completedChooseFile", result);
  }
);

async function modelOpenFromCommandLine() {
  try {
    const fileSelected = process.argv[1];
    const isSandBoxParameter = fileSelected === "--no-sandbox";
    if (doNotOpenFileFromCommandLine() || isSandBoxParameter) {
      mainWindow.webContents.send("model:openCompleted", undefined);
      return;
    }
    var stats = await fs.promises.stat(fileSelected);
    var mtime = stats.mtime;

    const data = await fs.promises.readFile(fileSelected, "utf-8");
    var model = {};
    model.modelData = JSON.parse(data);
    checkModelVersion(model.modelData.model.storedin);
    model.filePath = fileSelected;
    model.lastSaveDay = mtime.toLocaleDateString();
    mainWindow.webContents.send("model:openCompleted", model);
  } catch (e) {
    mainWindow.webContents.send("model:openCompleted", {
      error: e.message
    });
    mainWindow.webContents.send("notification:newMessage", {
      type: "error",
      message: `Command line parameter ${process.argv[1]} could not open model.\n${e.message}`,
      full: e,
      autohide: false
    });
  }
}

function doNotOpenFileFromCommandLine() {
  const moreThanSingleParameter = process.argv.length !== 2;
  const noFilePathOnCommandLine = process.argv.length <= 1;
  const dotRelativeFilePathCommandLine =
    process.argv.length === 2 && process.argv[1] === ".";
  const macPSNCommandLine =
    process.argv.length === 2 &&
    isMac === true &&
    process.argv[1].startsWith("-psn");
  return (
    macPSNCommandLine ||
    noFilePathOnCommandLine ||
    dotRelativeFilePathCommandLine ||
    moreThanSingleParameter
  );
}

function prettyModelOpenErrorMessage(message) {
  if (message.startsWith(`Unexpected token`)) {
    return `Model can't be loaded. Model is broken.`;
  }
  return message;
}

function sendModelOpenError(err) {
  mainWindow.webContents.send("notification:newMessage", {
    type: "error",
    message: prettyModelOpenErrorMessage(err.message),
    full: err,
    autohide: false
  });
  mainWindow.webContents.send("model:openCompleted", {
    error: prettyModelOpenErrorMessage(err.message)
  });
}

async function modelOpen() {
  try {
    let options = {
      title: "Select a project",
      defaultPath: settings.getDefaultPath(),
      filters: [
        { name: "Project files", extensions: [fileSuffix] },
        { name: "All Files", extensions: ["*"] }
      ]
    };
    let { canceled, filePaths } = await dialog.showOpenDialog(options);

    if (canceled) {
      mainWindow.webContents.send("model:openCompleted", {
        cancel: true,
        error: new Error()
      });
      return;
    }
    settings.setDefaultPath(path.dirname(filePaths[0]));

    let firstFileSelected = filePaths[0];

    var stats = await fs.promises.stat(firstFileSelected);
    var mtime = stats.mtime;

    fs.readFile(firstFileSelected, "utf-8", (err, data) => {
      if (err) {
        sendModelOpenError(err);
        return;
      }
      try {
        var d = {};
        d.modelData = JSON.parse(data);
        checkModelVersion(d.modelData.model.storedin);
        d.filePath = firstFileSelected;
        d.lastSaveDay = mtime.toLocaleDateString();
        mainWindow.webContents.send("model:openCompleted", d);
      } catch (innerErr) {
        sendModelOpenError(innerErr);
      }
    });
  } catch (err) {
    sendModelOpenError(err);
  }
}

function saveScriptFile(fileName, content, writeFileParam, reportResult) {
  const overWriteFlag = writeFileParam === true ? "w" : "wx";
  fs.writeFile(fileName, content, { flag: overWriteFlag }, (err) => {
    if (err) {
      const errMessage = err.message.startsWith("EEXIST")
        ? `File '${fileName}' already exists.`
        : err.message;
      mainWindow.webContents.send("notification:newMessage", {
        type: "error",
        message: errMessage,
        full: err,
        autohide: false,
        urlCaption: `Open folder`,
        urlToOpen: "file://" + path.dirname(fileName),
        urlIsExternal: true
      });
    } else {
      if (reportResult) {
        mainWindow.webContents.send("notification:newMessage", {
          type: "info",
          message: "Script saved to " + fileName,
          autohide: true,
          urlCaption: `Open folder`,
          urlToOpen: "file://" + path.dirname(fileName),
          urlIsExternal: true
        });
      }
    }
  });
}

async function saveScriptToFile(
  content,
  writeFileParam,
  defaultFileName,
  suffix
) {
  try {
    const defaultPath =
      settings.getModelScriptFilePath() ??
      `${settings.getDefaultPath()}/${defaultFileName}.${suffix}`;
    const options = {
      defaultPath,
      title: "Select a file"
    };

    const { canceled, filePath } = await dialog.showSaveDialog(null, options);
    if (canceled) {
      mainWindow.webContents.send("script:saveScriptCompleted", {
        cancel: true
      });
      return;
    }
    saveScriptFile(filePath, content, writeFileParam, true);
    settings.setModelScriptFilePath(filePath);
    mainWindow.webContents.send("script:saveScriptCompleted");
  } catch (error) {
    mainWindow.webContents.send("script:saveScriptCompleted", { error });
  }
}

/* save file */
//let content = "Some text to save into the file";

// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
async function saveFile(content, shouldChangeFileInUI) {
  try {
    var lastSavedDate = Date().toLocaleString();
    const options = {
      defaultPath: settings.getDefaultPath(),
      title: `Select a file`
    };

    let fileName;
    if (process.env.NODE_ENV === "test") {
      fileName = process.env.SAVE_FILENAME;
    } else {
      const { canceled, filePath } = await dialog.showSaveDialog(null, options);
      fileName = canceled === true ? undefined : filePath;
    }

    if (fileName === undefined) {
      mainWindow.webContents.send("model:savedComplete", {
        cancel: true
      });
      return;
    }

    settings.setDefaultPath(path.dirname(fileName));

    let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (fileExtension !== fileSuffix) {
      fileName = fileName + `.${fileSuffix}`;
    }

    //fileName = fileName + ".dmm";
    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.writeFile(fileName, content, (err) => {
      if (err) {
        mainWindow.webContents.send("notification:newMessage", {
          type: "error",
          message: err.message,
          full: err,
          autohide: false
        });
        mainWindow.webContents.send("model:savedComplete", {
          error: err.message
        });

        //console.log("An error ocurred creating the file " + err.message);
      } else {
        mainWindow.webContents.send("model:savedComplete", {
          filePath: fileName,
          lastSaveDay: lastSavedDate,
          shouldChangeFileInUI: shouldChangeFileInUI
        });

        mainWindow.webContents.send("notification:newMessage", {
          type: "info",
          message: "Project saved to " + fileName,
          autohide: true,
          urlCaption: `Open folder`,
          urlToOpen: "file://" + path.dirname(fileName),
          urlIsExternal: true
        });
      }
      const originalModelList = settings.getModelList();
      const modifiedModel = JSON.parse(content);
      settings.setModelList({
        ...originalModelList,
        [fileName]: {
          filePath: fileName,
          modelId: modifiedModel.model.id,
          modelName: modifiedModel.model.name,
          modelDesc: modifiedModel.model.desc,
          modelType: modifiedModel.model.type,
          lastSaved: Date.now(),
          lastSavedDay: lastSavedDate
        }
      });
      //console.log("The file has been succesfully saved");
    });
  } catch (e) {
    dialog.showMessageBox(
      null,
      {
        type: "info",
        buttons: ["Close"],
        message: "File could not be saved." + e,
        title: "Info"
      },
      function () {
        return;
      }
    );
  }
}

/* update file */
function saveChanges(fileName, content, shouldChangeFileInUI) {
  try {
    var lastSavedDate = Date().toLocaleString();
    fs.writeFile(fileName, content, (err) => {
      if (err) {
        //console.log("err", err);
        mainWindow.webContents.send("notification:newMessage", {
          type: "error",
          message: err.message,
          full: err,
          autohide: false
        });
        mainWindow.webContents.send("model:savedComplete", {
          error: err.message
        });

        //console.log("An error ocurred creating the file " + err.message);
      } else {
        mainWindow.webContents.send("model:savedComplete", {
          filePath: fileName,
          lastSaveDay: lastSavedDate,
          shouldChangeFileInUI
        });

        mainWindow.webContents.send("notification:newMessage", {
          type: "info",
          message: "Project saved to " + fileName,
          autohide: true,
          urlCaption: `Open folder`,
          urlToOpen: "file://" + path.dirname(fileName),
          urlIsExternal: true
        });
      }
      //console.log(app.getPath("userData"));
      if (shouldChangeFileInUI) {
        const originalModelList = settings.getModelList();
        const modifiedModel = JSON.parse(content);
        settings.setModelList({
          ...originalModelList,
          [fileName]: {
            filePath: fileName,
            modelId: modifiedModel.model.id,
            modelName: modifiedModel.model.name,
            modelDesc: modifiedModel.model.desc,
            modelType: modifiedModel.model.type,
            lastSaved: Date.now(),
            lastSavedDay: lastSavedDate
          }
        });
      }
      //console.log("The file has been succesfully saved");
    });
  } catch (e) {
    dialog.showMessageBox(
      null,
      {
        type: "info",
        buttons: ["Close"],
        message: "Changes could not be saved.",
        title: "Info"
      },
      function () {
        return;
      }
    );
  }
}

/* select folder */
async function openFolder(defaultPath) {
  let options = {
    title: "Select a folder",
    defaultPath,
    properties: ["openDirectory"]
  };
  let { canceled, filePaths } = await dialog.showOpenDialog(options);

  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}

function containsExtension(ext, filesSelected) {
  return `.${ext}` === path.extname(filesSelected[0]);
}

function getModelType(graphQlExts, jsonSchemaExts, filesSelected) {
  if (graphQlExts.find((ext) => containsExtension(ext, filesSelected))) {
    return ModelTypes.GRAPHQL;
  }

  if (jsonSchemaExts.find((ext) => containsExtension(ext, filesSelected))) {
    return ModelTypes.JSONSCHEMA;
  }

  return undefined;
}

function registerMMREIntegrations(webContents) {
  const integrationFactory = new IntegrationFactory(
    new Dispatcher(webContents),
    new FilenameProvider(os.tmpdir())
  );
  const executors = {};

  ipcMain.on("model:import", async (event, parameters) => {
    const graphQlExts = ["gql", "graphql", "js"];
    const jsonSchemaExts = ["json", "yaml"];
    const filters = [];
    let extensions = [];
    if (parameters.supportedTypes.includes(ModelTypes.GRAPHQL)) {
      extensions = [...extensions, ...graphQlExts];
      filters.push({ name: "GraphQL files", extensions: graphQlExts });
    }
    if (parameters.supportedTypes.includes(ModelTypes.JSONSCHEMA)) {
      extensions = [...extensions, ...jsonSchemaExts];
      filters.push({ name: "JSON Schema files", extensions: jsonSchemaExts });
    }

    const options = {
      title: "Select a file",
      defaultPath: settings.getDefaultPath(),
      filters: [
        {
          name: "Supported files",
          extensions
        },
        ...filters
      ]
    };

    let filesSelected = [process.env.IMPORT_FILENAME];
    if (process.env.NODE_ENV !== "test") {
      const { canceled, filePath } = await dialog.showOpenDialog(options);
      filesSelected = canceled ? [] : [filePath];
    }
    if (filesSelected?.length === 1) {
      settings.setDefaultPath(path.dirname(filesSelected[0]));
      const connection = {
        source: filesSelected,
        sourceType: "file",
        type:
          filesSelected &&
          filesSelected.length === 1 &&
          getModelType(graphQlExts, jsonSchemaExts, filesSelected)
      };
      const executor = integrationFactory
        .createDbPlatformFactory()
        .createReverseExecutor(connection);
      executors[parameters.token] = executor;
      executor.execute();
    } else {
      const executor = integrationFactory
        .createDbPlatformFactory()
        .createReverseCancelExecutor();
      executors[parameters.token] = executor;
      executor.execute();
    }
  });

  ipcMain.on("model:importFromUrl", (event, parameters) => {
    const connection = {
      sourceType: "url",
      source: parameters.urlPath,
      type: ModelTypes.GRAPHQL
    };
    const executor = integrationFactory
      .createDbPlatformFactory()
      .createReverseExecutor(connection);
    executors[parameters.token] = executor;
    executor.execute();
  });

  ipcMain.on("task:cancel", async (event, parameters) => {
    const executor = executors[parameters.token];
    executors[parameters.token] = undefined;
    executor && executor.cancel();
  });

  ipcMain.on("model:runAutolayout", async (event, parameters) => {
    const executor = await integrationFactory
      .createAutolayoutFactory()
      .createAutolayoutExecutor(parameters.autoLayoutData);
    executors[parameters.token] = executor;
    executor.execute();
  });

  ipcMain.on("connectionsList:runTestAndLoad", (event, parameters) => {
    const executor = integrationFactory
      .createDbPlatformFactory()
      .createTestConnectionExecutor(parameters.connection);
    executors[parameters.token] = executor;
    executor.execute();
  });

  ipcMain.on("connectionsList:runReverse", (event, parameters) => {
    const executor = integrationFactory
      .createDbPlatformFactory()
      .createReverseExecutor(parameters.connection, parameters.modelToUpdate);
    executors[parameters.token] = executor;
    executor.execute();
  });

  ipcMain.on("app:reload", (event) => {
    app.relaunch();
    app.exit(0);
  });

  ipcMain.on("app:updateMenu", (event, message) => {
    loadMenu(app, mainWindow, message);
  });

  ipcMain.handle("app:existsFile", async (event, filePath) => {
    return await exists(filePath);
  });
}

module.exports = {
  ChildProcessExecutor,
  CancelErrorExecutor,
  FilenameProvider,
  PayloadProcessor,
  getIntegrations
};
