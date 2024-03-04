const {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  contextBridge,
  ipcRenderer,
  screen,
  globalShortcut,
} = require("electron");
require("@electron/remote/main").initialize();

const path = require("path");
const { isMainThread } = require("worker_threads");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    titleBarStyle: "hidden",
    center: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      devTools: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  require("@electron/remote/main").enable(mainWindow.webContents);
  let displays = screen.getAllDisplays();
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });
  contentWindow = new BrowserWindow({
    x: externalDisplay ? externalDisplay.bounds.x : 0,
    y: externalDisplay ? externalDisplay.bounds.y : 0,
    movable: false,
    titleBarStyle: "hidden",
    center: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      devTools: false,
    },
  });
  if (externalDisplay) {
    contentWindow.maximize();
  }
  contentWindow.loadFile(path.join(__dirname, "ContentScreen.html"));
  require("@electron/remote/main").enable(contentWindow.webContents);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

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
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("canvas-update", (event, canvasData) => {
  if (contentWindow) {
    contentWindow.webContents.send("update-canvas", canvasData);
  }
});
app.on("browser-window-focus", function () {
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });
  globalShortcut.register("F5", () => {
    console.log("F5 is pressed: Shortcut Disabled");
  });
});
app.on("browser-window-blur", function () {
  globalShortcut.unregister("CommandOrControl+R");
  globalShortcut.unregister("F5");
});
