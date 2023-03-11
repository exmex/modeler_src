const electron = require("electron");
const { getAppTitle, PRODUCT } = require("common");
const { spawn } = require("child_process");
// const fs = require("fs");
const { Menu, shell } = electron;
// const { v4: uuidv4 } = require("uuid");

const productName = process.env.CURRENT_PRODUCT;
const isMac = process.platform === "darwin";
const isMoon = productName === PRODUCT.MOON_PRODUCT;
const isLuna = productName === PRODUCT.LUNA_PRODUCT;
const isDebug = () => {
  return process.env.REACT_DEBUG === `true`;
};

const MENU_DEFAULT = {
  UNDO: {
    isEnabled: false
  },
  REDO: {
    isEnabled: false
  },
  COPY: {
    isEnabled: false
  },
  PASTE: {
    isEnabled: false
  },
  NEW: {
    isEnabled: true
  },
  OPEN: {
    isEnabled: true
  },
  SAVE: {
    isEnabled: false
  },
  SAVEAS: {
    isEnabled: false
  },
  RUNINSTANCES: {
    isEnabled: false
  }
};

function runInstance() {
  // const id = uuidv4();
  // const out = fs.openSync(`/tmp/test/out${id}.log`, "a");
  // const err = fs.openSync(`/tmp/test/out${id}.log`, "a");

  // const subprocess = spawn(process.execPath, ["."], {
  //   cwd: process.cwd(),
  //   detached: true,
  //   stdio: ["ignore", out, err]
  // });

  // subprocess.unref();

  const subprocess = spawn(process.execPath, ["."], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore"
  });
  subprocess.unref();
}

function saveProjectAs(mainWindow) {
  mainWindow.webContents.send("model:wantToSaveAs", {
    request: 1
  });
}

function saveProject(mainWindow) {
  mainWindow.webContents.send("model:wantToSave", {
    request: 1
  });
}

function modelNewRequest(mainWindow) {
  mainWindow.webContents.send("model:wantNew", {
    request: 1
  });
}

function modelOpenRequest(mainWindow) {
  mainWindow.webContents.send("model:wantToOpen", {});
}

function feedbackToggleRequest(mainWindow) {
  mainWindow.webContents.send("feedback:toggle", {});
}

function undo(mainWindow) {
  mainWindow.webContents.send("model:undo", {});
}

function redo(mainWindow) {
  mainWindow.webContents.send("model:redo", {});
}

function paste(mainWindow) {
  mainWindow.webContents.send("model:paste", {});
}
function copy(mainWindow) {
  mainWindow.webContents.send("model:copy", {});
}

function pageRequest(mainWindow, page) {
  mainWindow.webContents.send("page:" + page, {});
}

function modalRequest(mainWindow, modal) {
  mainWindow.webContents.send("modal:" + modal, {});
}

function createMenuTemplate(app, mainWindow, status = MENU_DEFAULT) {
  return [
    ...(isMac
      ? [
          {
            label: getAppTitle(productName),
            submenu: [
              {
                label: "Quit",
                accelerator:
                  process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
                click() {
                  if (mainWindow) {
                    mainWindow.webContents.send("app:close");
                  } else {
                    app.quit();
                  }
                }
              }
            ]
          }
        ]
      : []),

    {
      label: "File",
      submenu: [
        {
          label: "New project",
          enabled: status.NEW.isEnabled,
          click() {
            modelNewRequest(mainWindow);
          }
        },
        {
          label: "Open project",
          enabled: status.OPEN.isEnabled,
          click() {
            modelOpenRequest(mainWindow);
          }
        },
        { type: "separator" },
        {
          label: "Save project",
          enabled: status.SAVE.isEnabled,
          click() {
            saveProject(mainWindow);
          }
        },
        {
          label: "Save project as...",
          enabled: status.SAVEAS.isEnabled,
          click() {
            saveProjectAs(mainWindow);
          }
        },
        { type: "separator" },
        {
          label: `Open ${getAppTitle(productName)} in a new window`,
          enabled: status.RUNINSTANCES.isEnabled,
          click() {
            runInstance(mainWindow);
          }
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
          click() {
            if (mainWindow) {
              mainWindow.webContents.send("app:close");
            } else {
              app.quit();
            }
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          enabled: status.UNDO.isEnabled,
          click() {
            undo(mainWindow);
          }
        },
        {
          label: "Redo",
          accelerator: "CmdOrCtrl+Shift+Z",
          enabled: status.REDO.isEnabled,
          click() {
            redo(mainWindow);
          }
        },
        { type: "separator" },
        ...(isMac
          ? [
              {
                role: "copy"
              },
              { role: "paste" },
              { type: "separator" },
              {
                label: "Copy objects",
                enabled: status.COPY.isEnabled,
                click() {
                  copy(mainWindow);
                }
              },
              {
                label: "Paste objects",
                enabled: status.PASTE.isEnabled,
                click() {
                  paste(mainWindow);
                }
              },
              { type: "separator" },
              { role: "selectAll", label: "Select text" }
            ]
          : [
              {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                enabled: status.COPY.isEnabled,
                click() {
                  copy(mainWindow);
                }
              },
              {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                enabled: status.PASTE.isEnabled,
                click() {
                  paste(mainWindow);
                }
              }
            ]),

        { type: "separator" },
        ...(isMoon || isLuna
          ? [
              {
                label: "Connections",
                click() {
                  pageRequest(mainWindow, "connections");
                }
              }
            ]
          : []),
        {
          label: "Projects",
          click() {
            pageRequest(mainWindow, "projects");
          }
        },
        { type: "separator" },
        {
          label: "Settings",
          click() {
            pageRequest(mainWindow, "settings");
          }
        }
      ]
    },
    {
      label: "View",
      submenu: [{ role: "zoomIn" }, { role: "zoomOut" }, { role: "resetZoom" }]
    },
    {
      label: "Support",
      submenu: [
        {
          label: "Show tips",
          click() {
            modalRequest(mainWindow, "tipsModal");
          }
        },
        {
          label: "Website",
          click() {
            shell.openExternal("https://www.datensen.com/");
          }
        },
        {
          label: "Send us your feedback",
          click() {
            feedbackToggleRequest(mainWindow);
          }
        },
        { type: "separator" },
        {
          label: "My account",
          click() {
            pageRequest(mainWindow, "account");
          }
        }
      ]
    },
    ...(isDebug()
      ? [
          {
            label: "Dev",
            submenu: [
              {
                label: "Toggle Developer Tools",
                accelerator:
                  process.platform === "darwin"
                    ? "Command+Alt+I"
                    : "Ctrl+Shift+I",
                click(item, focusedWindow) {
                  focusedWindow.toggleDevTools();
                }
              }
            ]
          }
        ]
      : [])
  ];
}

function loadMenu(app, mainWindow, status) {
  const mainMenu = Menu.buildFromTemplate(
    createMenuTemplate(app, mainWindow, status)
  );
  Menu.setApplicationMenu(mainMenu);
}

module.exports = {
  loadMenu,
  MENU_DEFAULT
};
