var PrinterList = [];
let currentPrinter = 1;
var swal = require("sweetalert");
const PRINT_TIMEOUT = 30000; // ms

function showLoading(message) {
  try {
    const el = document.getElementById("LoadingOverlay");
    const msg = document.getElementById("LoadingMessage");
    if (msg) msg.textContent = message || "Working...";
    if (el) {
      el.removeAttribute("hidden");
      el.setAttribute("aria-hidden", "false");
    }
  } catch (e) {
    console.warn("showLoading failed", e);
  }
}

function hideLoading() {
  try {
    const el = document.getElementById("LoadingOverlay");
    if (el) {
      el.setAttribute("hidden", "");
      el.setAttribute("aria-hidden", "true");
    }
  } catch (e) {
    console.warn("hideLoading failed", e);
  }
}

function GetPrinters() {
  document.getElementById("PrinterSelection").removeAttribute("hidden");
  const winContents = BrowserWindow.getFocusedWindow().webContents;
  winContents.getPrintersAsync().then((printers) => {
    PrinterList = [];
    printers.forEach((printer) => {
      console.log(printer);
      if (printer.options["printer-location"] !== "") {
        PrinterList.push(printer);
      }
    });
    PrinterList.forEach((printer) => {});
    if (document.getElementById("PrinterList")) {
      document.getElementById("PrinterList").innerHTML = "";
      let counter = 1;
      PrinterList.forEach((printer) => {
        document.getElementById("PrinterList").innerHTML +=
          `<div class="Printer" id="printer-${counter++}">${
            printer.name
          }</div>`;
      });
      PrinterList.push("Save As PDF");
      document.getElementById("PrinterList").innerHTML +=
        `<div class="Printer" id="printer-${counter++}">Save As PDF</div>`;
    }
    if (PrinterList.length !== 0) {
      document
        .querySelector("#PrinterList > div:nth-child(1)")
        .classList.add("active");
    }
  });

  setPrintLookupButtons();
}
function updatePrinterSelection() {
  document.querySelectorAll("div.Printer").forEach((Printer) => {
    Printer.classList.remove("active");
  });
  const activePrinter = document.getElementById("printer-" + currentPrinter);
  if (activePrinter) {
    activePrinter.classList.add("active");
  } else {
    return;
  }
  activePrinter.scrollIntoViewIfNeeded();
  return;
}
function navigatePrinterList(Movement) {
  if (Movement == Button1) {
    console.log("Down Arrow Clicked");
    if (currentPrinter + 1 <= PrinterList.length) {
      currentPrinter += 1;
    }
    console.log(currentPrinter);
    updatePrinterSelection();
    Button1.removeEventListener("click", () => {});
  }
  if (Movement == Button2) {
    console.log("DownDown Arrow Clicked");
    if (currentPrinter + 4 <= PrinterList.length) {
      currentPrinter += 4;
    } else {
      currentPrinter = PrinterList.length;
    }
    console.log(currentPrinter);
    updatePrinterSelection();
    Button2.removeEventListener("click", () => {});
  }
  if (Movement == Button3) {
    console.log("Up Arrow Clicked");
    if (currentPrinter - 1 >= 1) {
      currentPrinter -= 1;
    }
    console.log(currentPrinter);
    updatePrinterSelection();
    Button3.removeEventListener("click", () => {});
  }
  if (Movement == Button4) {
    console.log("UpUp Arrow Clicked");
    if (currentPrinter - 4 >= 1) {
      currentPrinter -= 4;
    } else {
      currentPrinter = 1;
    }
    console.log(currentPrinter);
    updatePrinterSelection();
    Button4.removeEventListener("click", () => {});
  }
  return;
}
function selectPrinter() {
  const winContents = BrowserWindow.getAllWindows()[0].webContents;
  const activePrinter = document.getElementById("printer-" + currentPrinter);
  if (!activePrinter) return;
  PrinterName = activePrinter.innerHTML;
  document.getElementById("PrinterSelection").setAttribute("hidden", "");
  document.querySelector("#CanvasContainer").style.display = "grid";
  console.log(PrinterName);
  if (PrinterName == "Save As PDF") {
    fs.mkdirSync(DocumentsPath + "/ArtByAbey/Artworks", { recursive: true });
    var filepath1 = DocumentsPath + "/ArtByAbey/Artworks";
    var options = {
      color: true,
      marginsType: 0,
      pageSize: "A4",
      printBackground: true,
      printSelectionOnly: false,
      landscape: CanvasMode == "Portrait" ? false : true,
    };
    let win = BrowserWindow.getAllWindows()[0];
    // Show loading overlay while generating PDF
    showLoading("Exporting to PDF...");
    let timer = setTimeout(() => {
      hideLoading();
      swal("Export timed out. Please try again.", {
        icon: "error",
        buttons: false,
        timer: 5000,
      });
    }, PRINT_TIMEOUT);

    win.webContents
      .printToPDF(options)
      .then((data) => {
        try {
          fs.writeFileSync(filepath1 + "/" + FileName + ".pdf", data);
          hideLoading();
          clearTimeout(timer);
          swal("File saved as PDF in " + filepath1.replaceAll("/", "\\"), {
            buttons: false,
            timer: 5000,
          });
        } catch (err) {
          hideLoading();
          clearTimeout(timer);
          console.error("Error writing PDF file:", err);
          swal("Error saving PDF: " + (err.message || err), {
            icon: "error",
            buttons: false,
            timer: 5000,
          });
        }
      })
      .catch((err) => {
        hideLoading();
        clearTimeout(timer);
        console.error("printToPDF failed:", err);
        swal("Error exporting PDF: " + (err.message || err), {
          icon: "error",
          buttons: false,
          timer: 5000,
        });
      });
  } else {
    /* swal("Currently using printers is not functioning as intended :)", {
      buttons: false,
      timer: 5000,
    });*/
    let win = BrowserWindow.getAllWindows()[0];
    // Show loading overlay while sending print job
    showLoading("Sending to printer...");
    let timer = setTimeout(() => {
      hideLoading();
      swal("Print request timed out. Please check the printer and try again.", {
        icon: "error",
        buttons: false,
        timer: 5000,
      });
    }, PRINT_TIMEOUT);

    try {
      win.webContents.print(
        {
          silent: true,
          deviceName: PrinterName,
          color: true,
          marginsType: 0,
          pageSize: "Letter",
          printBackground: true,
          printSelectionOnly: false,
          landscape: CanvasMode == "Portrait" ? false : true,
        },
        (success, failureReason) => {
          hideLoading();
          clearTimeout(timer);
          if (success) {
            swal("Print job sent to printer.", { buttons: false, timer: 3000 });
          } else {
            console.error("print failed:", failureReason);
            swal("Printing failed: " + (failureReason || "Unknown reason"), {
              icon: "error",
              buttons: false,
              timer: 5000,
            });
          }
        }
      );
    } catch (err) {
      hideLoading();
      clearTimeout(timer);
      console.error("print threw:", err);
      swal("Printing error: " + (err.message || err), {
        icon: "error",
        buttons: false,
        timer: 5000,
      });
    }
  }
  return;
}
