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
const fs = require("fs");
const os = require("os");
const events = require("events");

// Increase default max listeners slightly to avoid noisy MaxListenersExceededWarning
// while guarding against legitimate memory leaks. It's better to fix duplicate
// listener registration, but raising the limit here is a safe short-term mitigation.
events.EventEmitter.defaultMaxListeners = 20;

// Track content window in outer scope so IPC handlers can reference it.
let contentWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Ensure userData path is safe and doesn't contain trailing dots which can
// cause Windows to fail when creating directories. Use a folder under
// %APPDATA% with the product name from package.json (no trailing dots).
try {
  const appData =
    app.getPath("appData") || path.join(os.homedir(), "AppData", "Roaming");
  const safeName = "ArtByAbey";
  const userDataPath = path.join(appData, safeName);
  app.setPath("userData", userDataPath);

  // Pre-create common cache directories the Chromium network stack expects.
  const desiredDirs = [
    path.join(userDataPath, "Network"),
    path.join(userDataPath, "Code Cache", "js"),
    path.join(userDataPath, "Code Cache", "wasm"),
    path.join(userDataPath, "Shared Dictionary", "cache"),
    path.join(userDataPath, "GPUCache"),
  ];

  const tryEnsureDirs = (baseDirs) => {
    for (const dir of baseDirs) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        // Re-throw the error for handling by the caller
        throw e;
      }
    }
  };

  try {
    tryEnsureDirs(desiredDirs);
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    console.error(
      `Initial cache directory creation failed for ${userDataPath}:`,
      msg
    );

    // If it's a permissions problem on Windows (Access is denied / EACCES),
    // fall back to a temp directory so the app can continue running.
    if (
      msg.includes("Access is denied") ||
      e.code === "EACCES" ||
      e.errno === -4092
    ) {
      try {
        const fallback = path.join(os.tmpdir(), "ArtByAbey");
        const fallbackDirs = [
          path.join(fallback, "Network"),
          path.join(fallback, "Code Cache", "js"),
          path.join(fallback, "Code Cache", "wasm"),
          path.join(fallback, "Shared Dictionary", "cache"),
          path.join(fallback, "GPUCache"),
        ];
        tryEnsureDirs(fallbackDirs);
        app.setPath("userData", fallback);
        console.warn(
          `userData path fallback to temp dir due to permissions: ${fallback}`
        );
      } catch (ee) {
        console.error(
          "Fallback cache directory creation also failed:",
          ee && ee.message ? ee.message : ee
        );
      }
    } else {
      console.error("Could not create cache directories:", msg);
    }
  }
} catch (err) {
  console.error(
    "Error setting up userData path:",
    err && err.message ? err.message : err
  );
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    zooming: false,
    maximize: true,
    maximizable: false,
    minimizable: false,
    titleBarStyle: "hidden",
    center: true,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      devTools: false, // explicitly disable DevTools for production use
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.maximize();
  // Ensure the main window is shown and focused on startup.
  // Using show() then focus() to guarantee it receives keyboard input.
  try {
    mainWindow.show();
    mainWindow.focus();
  } catch (e) {}

  // Only enable remote module in development builds.
  if (process.env.NODE_ENV !== "production") {
    try {
      require("@electron/remote/main").enable(mainWindow.webContents);
      // mainWindow.webContents.openDevTools({ mode: 'detach' });
    } catch (e) {
      console.warn(
        "Could not enable @electron/remote in dev:",
        e && e.message ? e.message : e
      );
    }
  }
  // In production, prevent context menu actions that could reveal devtools.
  if (process.env.NODE_ENV === "production") {
    try {
      mainWindow.webContents.on("context-menu", (e) => {
        e.preventDefault();
      });
    } catch (e) {}
  }
  // Create the content window only if a secondary display is present.
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((display) => {
    // A display that doesn't start at 0,0 is treated as an external/secondary monitor.
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  if (externalDisplay) {
    // Place the content window on the secondary monitor and make it fullscreen.
    contentWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      movable: true,
      frame: false,
      center: false,
      fullscreen: true,
      show: false, // create hidden so we can show without stealing focus
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: false,
        devTools: false,
      },
    });

    contentWindow.loadFile(path.join(__dirname, "ContentScreen.html"));

    if (process.env.NODE_ENV !== "production") {
      try {
        require("@electron/remote/main").enable(contentWindow.webContents);
        //contentWindow.webContents.openDevTools({ mode: 'detach' });
      } catch (e) {
        console.warn(
          "Could not enable @electron/remote for contentWindow in dev:",
          e && e.message ? e.message : e
        );
      }
    }

    if (process.env.NODE_ENV === "production") {
      try {
        contentWindow.webContents.on("context-menu", (e) => {
          e.preventDefault();
        });
      } catch (e) {}
    }

    // Show the content window without stealing focus from the main window.
    // On Windows, showInactive() displays the window without focusing it.
    contentWindow.once("ready-to-show", () => {
      try {
        if (
          process.platform === "win32" &&
          typeof contentWindow.showInactive === "function"
        ) {
          contentWindow.showInactive();
        } else {
          // On other platforms, show then immediately refocus the main window.
          contentWindow.show();
          try {
            mainWindow.focus();
          } catch (e) {}
        }
      } catch (e) {
        // fallback: just show
        try {
          contentWindow.show();
        } catch (ee) {}
      }
    });
  } else {
    // No external display found; leave contentWindow null and don't create the extra window.
    contentWindow = null;
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Prevent users from opening DevTools via common shortcuts in production.
app.on("ready", () => {
  if (process.env.NODE_ENV === "production") {
    try {
      // Register no-op handlers for common devtools shortcuts
      const noop = () => {};
      globalShortcut.register("F12", noop);
      globalShortcut.register("CommandOrControl+Shift+I", noop);
      globalShortcut.register("CommandOrControl+Shift+J", noop);
      globalShortcut.register("CommandOrControl+Alt+I", noop);
    } catch (e) {
      console.warn(
        "Failed to register global shortcuts to block devtools:",
        e && e.message ? e.message : e
      );
    }
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  try {
    globalShortcut.unregisterAll();
  } catch (e) {}
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("canvas-update", (event, canvasData) => {
  if (contentWindow) {
    contentWindow.webContents.send("update-canvas", canvasData);
  }
});
// Only enable the reloader in development mode. Re-executing the main module
// can re-register listeners and lead to EventEmitter warnings like
// "11 render-view-deleted listeners added to [WebContents]".
try {
  if (process.env.NODE_ENV !== "production") {
    require("electron-reloader")(module);
  }
} catch (_) {}
