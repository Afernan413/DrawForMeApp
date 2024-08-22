var PrinterList = [];
let currentPrinter = 1;
var swal = require("sweetalert");

function GetPrinters() {
  document.getElementById("PrinterSelection").removeAttribute("hidden");
  const winContents = BrowserWindow.getFocusedWindow().webContents;
  winContents.getPrintersAsync().then((printers) => {
    PrinterList = [];
    printers.forEach((printer) => {
      if (printer.status !== 0) {
        PrinterList.push(printer);
      }
    });
    PrinterList.forEach((printer) => {
      console.log(printer.name);
    });
    if (document.getElementById("PrinterList")) {
      document.getElementById("PrinterList").innerHTML = "";
      let counter = 1;
      PrinterList.forEach((printer) => {
        document.getElementById(
          "PrinterList"
        ).innerHTML += `<div class="Printer" id="printer-${counter++}">${
          printer.name
        }</div>`;
      });
      PrinterList.push("Save As PDF");
      document.getElementById(
        "PrinterList"
      ).innerHTML += `<div class="Printer" id="printer-${counter++}">Save As PDF</div>`;
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
    swal("File saved as PDF in " + filepath1.replaceAll("/", "\\"), {
      buttons: false,
      timer: 5000,
    });
    win.webContents.printToPDF(options).then((data) => {
      fs.writeFileSync(filepath1 + "/" + FileName + ".pdf", data);
    });
  } else {
    /* swal("Currently using printers is not functioning as intended :)", {
      buttons: false,
      timer: 5000,
    });*/
    let win = BrowserWindow.getAllWindows()[0];
    win.webContents.print({
      silent: true,
      dpi: { horizontal: 600, vertical: 600 },
      deviceName: PrinterName,
      color: true,
      marginsType: 0,
      pageSize: "A4",
      printBackground: true,
      printSelectionOnly: false,
      landscape: CanvasMode == "Portrait" ? false : true,
    });
  }
  return;
}
