const path = require("path");
const fs = require("fs");
const { BrowserWindow, app } = require("@electron/remote");
const swal = require("sweetalert");

const artworksDirectory = path.join(app.getPath("home"), "ArtByAbey", "Artworks");
fs.mkdirSync(artworksDirectory, { recursive: true });

let PrinterList = [];
let currentPrinter = 1;

function sanitizeOutputFileName(name) {
  if (!name) {
    return "Artwork";
  }
  const trimmed = name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").trim();
  return trimmed || "Artwork";
}

function GetPrinters() {
  const printerSelection = document.getElementById("PrinterSelection");
  if (printerSelection) {
    printerSelection.hidden = false;
  }

  const printerListContainer = document.getElementById("PrinterList");
  if (!printerListContainer) {
    return;
  }

  const focusedWindow =
    BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (!focusedWindow) {
    return;
  }

  focusedWindow.webContents.getPrintersAsync().then((printers) => {
    PrinterList = printers
      .filter((printer) => Boolean(printer?.name))
      .map((printer) => ({
        name: printer.name,
        deviceName: printer.name,
      }))
      .sort((a, b) => a.name.localeCompare(b));

    PrinterList.push({
      name: "Save As PDF",
      deviceName: "__virtual__",
      isVirtual: true,
    });

    printerListContainer.innerHTML = "";
    PrinterList.forEach((printer, index) => {
      const listItem = document.createElement("div");
      listItem.className = "Printer";
      listItem.id = `printer-${index + 1}`;
      listItem.textContent = printer.name;
      printerListContainer.appendChild(listItem);
    });

    currentPrinter = Math.min(currentPrinter, PrinterList.length) || 1;
    updatePrinterSelection();
  });

  setPrintLookupButtons();
}

function updatePrinterSelection() {
  document.querySelectorAll("div.Printer").forEach((printer) => {
    printer.classList.remove("active");
  });

  const activePrinter = document.getElementById(`printer-${currentPrinter}`);
  if (!activePrinter) {
    return;
  }

  activePrinter.classList.add("active");
  activePrinter.scrollIntoView({ block: "nearest" });
}

function movePrinterSelection(step) {
  if (!PrinterList.length) {
    return;
  }

  currentPrinter = Math.min(
    Math.max(currentPrinter + step, 1),
    PrinterList.length
  );
  updatePrinterSelection();
}

function navigatePrinterList(Movement) {
  if (Movement === Button1) {
    movePrinterSelection(1);
  } else if (Movement === Button2) {
    movePrinterSelection(4);
  } else if (Movement === Button3) {
    movePrinterSelection(-1);
  } else if (Movement === Button4) {
    movePrinterSelection(-4);
  }
}

function selectPrinter() {
  const selectedPrinter = PrinterList[currentPrinter - 1];
  if (!selectedPrinter) {
    return;
  }

  const printerSelection = document.getElementById("PrinterSelection");
  if (printerSelection) {
    printerSelection.hidden = true;
  }

  const canvasContainer = document.querySelector("#CanvasContainer");
  if (canvasContainer) {
    canvasContainer.style.display = "grid";
  }

  const availableWindows = BrowserWindow.getAllWindows().filter(
    (win) => !win.isDestroyed()
  );
  const mainWindow =
    BrowserWindow.getFocusedWindow() || availableWindows.find(Boolean);

  if (!mainWindow) {
    return;
  }

  if (selectedPrinter.isVirtual) {
    const options = {
      color: true,
      marginsType: 0,
      pageSize: "A4",
      printBackground: true,
      printSelectionOnly: false,
      landscape: CanvasMode === "Portrait" ? false : true,
    };

    swal(`File saved as PDF in ${path.normalize(artworksDirectory)}`, {
      buttons: false,
      timer: 5000,
    });

    mainWindow.webContents
      .printToPDF(options)
      .then((data) => {
        const safeName = sanitizeOutputFileName(FileName);
        const outputPath = path.join(artworksDirectory, `${safeName}.pdf`);
        fs.writeFileSync(outputPath, data);
      })
      .catch(() => {
        swal("Unable to save the PDF. Please try again.", {
          buttons: false,
          timer: 2500,
        });
      });

    return;
  }

  mainWindow.webContents.print({
    silent: true,
    deviceName: selectedPrinter.deviceName,
    color: true,
    marginsType: 0,
    pageSize: "Letter",
    printBackground: true,
    printSelectionOnly: false,
    landscape: CanvasMode === "Portrait" ? false : true,
  });
}
