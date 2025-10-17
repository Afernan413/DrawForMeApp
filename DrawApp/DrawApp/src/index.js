const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require("electron");
const path = require("path");

require("@electron/remote/main").initialize();

const isDevelopment = !app.isPackaged;
let contentWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    backgroundColor: "#f5f5f5",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      devTools: isDevelopment,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
    mainWindow.setAlwaysOnTop(true);
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  require("@electron/remote/main").enable(mainWindow.webContents);

  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  contentWindow = new BrowserWindow({
    parent: externalDisplay ? undefined : mainWindow,
    x: externalDisplay ? externalDisplay.bounds.x : undefined,
    y: externalDisplay ? externalDisplay.bounds.y : undefined,
    width: externalDisplay ? externalDisplay.workAreaSize.width : 800,
    height: externalDisplay ? externalDisplay.workAreaSize.height : 600,
    show: false,
    movable: true,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    backgroundColor: "#f5f5f5",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      devTools: isDevelopment,
    },
  });

  contentWindow.once("ready-to-show", () => {
    contentWindow.show();
    if (externalDisplay) {
      contentWindow.maximize();
    }
  });

  contentWindow.loadFile(path.join(__dirname, "ContentScreen.html"));
  require("@electron/remote/main").enable(contentWindow.webContents);

  mainWindow.on("closed", () => {
    if (contentWindow && !contentWindow.isDestroyed()) {
      contentWindow.close();
    }
  });

  contentWindow.on("closed", () => {
    contentWindow = undefined;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("browser-window-created", (_, window) => {
    window.removeMenu();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  globalShortcut.unregisterAll();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("canvas-update", (_event, canvasData) => {
  if (contentWindow && !contentWindow.isDestroyed()) {
    contentWindow.webContents.send("update-canvas", canvasData);
  }
});

if (isDevelopment) {
  try {
    require("electron-reloader")(module);
  } catch (_) {
    // no-op: reloader is optional in production builds
  }
}
