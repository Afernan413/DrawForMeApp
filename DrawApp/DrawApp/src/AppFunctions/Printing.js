var PrinterList = [];
let currentPrinter = 1;
function GetPrinters() {
  document.getElementById("PrinterSelection").removeAttribute("hidden");
  const winContents = BrowserWindow.getFocusedWindow().webContents;
  winContents.getPrintersAsync().then((printers) => {
    PrinterList = printers;
    PrinterList.forEach((printer) => {
      console.log(printer.name);
    });
    if (document.getElementById("PrinterList").innerHTML == "") {
      let counter = 1;
      PrinterList.forEach((printer) => {
        document.getElementById(
          "PrinterList"
        ).innerHTML += `<div class="Printer" id="printer-${counter++}">${
          printer.name
        }</div>`;
      });
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
  const winContents = BrowserWindow.getFocusedWindow().webContents;
  const activePrinter = document.getElementById("printer-" + currentPrinter);
  PrinterName = activePrinter.innerHTML;
  document.getElementById("PrinterSelection").setAttribute("hidden", "");
  document.querySelector("#CanvasContainer").style.display = "grid";
  console.log(PrinterName);
  winContents.print({
    silent: true,
    printBackground: true,
    deviceName: PrinterName,
    scaleFactor: 100,
    pageRanges: [
      {
        from: 0,
        to: 1,
      },
    ],
    color: true,
    pageSize: "A4",
  });
  return;
}
