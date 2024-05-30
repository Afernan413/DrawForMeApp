const {
  BrowserWindow,
  BrowserView,
  app,
  desktopCapturer,
  screen,
  remote,
} = require("@electron/remote");
const electron = require("electron");
const path = require("path");
var PHE = require("print-html-element");
var tinycolor = require("tinycolor2");
var color2Name = require("color-2-name");
const { ipcRenderer } = require("electron");
const fs = require("fs");
///////////////////////////////GET ITEMS///////////////////////////////////////////////////////
var GridContainer = document.querySelector("#CanvasContainer");
//const GridSizeTitle = document.querySelector("#CanvasSizeTitle");
const OriginalButtons = document.querySelector("#ButtonsContainer").innerHTML;
const ButtonsContainer = document.querySelector("#ButtonsContainer");

let colorOptions;
let palette = [
  { hex: "#000000", name: "Black" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#FF0000", name: "Red" },
  { hex: "#00FF00", name: "Green" },
  { hex: "#0000FF", name: "Blue" },
  { hex: "#FFFF00", name: "Yellow" },
  { hex: "#FF00FF", name: "Magenta" },
  { hex: "#00FFFF", name: "Cyan" },
  { hex: "#800000", name: "Maroon" },
  { hex: "#808000", name: "Olive" },
  { hex: "#008000", name: "Dark Green" },
  { hex: "#800080", name: "Purple" },
  { hex: "#008080", name: "Teal" },
  { hex: "#FFA500", name: "Orange" },
  { hex: "#A52A2A", name: "Brown" },
  { hex: "#DEB887", name: "Burlywood" },
  { hex: "#5F9EA0", name: "Cadet Blue" },
  { hex: "#7FFF00", name: "Chartreuse" },
  { hex: "#D2691E", name: "Chocolate" },
  { hex: "#FF7F50", name: "Coral" },
  { hex: "#6495ED", name: "Cornflower Blue" },
  { hex: "#DC143C", name: "Crimson" },
  { hex: "#00FFFF", name: "Aqua" },
  { hex: "#00008B", name: "Dark Blue" },
  { hex: "#008B8B", name: "Dark Cyan" },
];
var Button1 = document.querySelector("#PrimaryButtons_1");
var Button2 = document.querySelector("#PrimaryButtons_2");
var Button3 = document.querySelector("#PrimaryButtons_3");
var Button4 = document.querySelector("#PrimaryButtons_4");
var Button5 = document.querySelector("#PrimaryButtons_5");
var Button6 = document.querySelector("#PrimaryButtons_6");
var CurrentPage = "Home";
var CurrentSelectionContainer = document.querySelector(
  "#CurrentSelectionContainer"
);
var color = document
  .querySelector("#CurrentSelectionContainer")
  .computedStyleMap()
  .get("--backgroundColor");
var FillMode = "Solid";
var currWindow = BrowserWindow.getAllWindows()[1];
var childWdindow = BrowserWindow.getAllWindows()[0];

var printers = [];
let contentWindow;
///////////////////////////////////////////////////////////////////////////////////////////////
function ContentWindow() {
  const canvas = document.getElementById("CanvasContainer").outerHTML;
  require("electron").ipcRenderer.send("canvas-update", canvas);
  return;
}
function printCanvas() {
  setPrintLookupButtons();
  document.querySelector("#CanvasContainer").style.display = "none";
  GetPrinters();
}
function PortraitMode() {
  CanvasMode = "Portrait";
  if (document.querySelectorAll(".pixelCanvas").length == 0) {
    createGrid(30, 50);
  }
  if (
    CurrentPage == "PortraitInitialColor" ||
    CurrentPage == "PortraitInitialColorFile"
  ) {
    setInitialColorButtons();
  } else {
    SetNavigationButtons();
  }
  if (Navigating == false) {
    NavigateGrid();
  }
  updatePixel();
  return;
}
function LandscapeMode() {
  CanvasMode = "Landscape";
  if (document.querySelectorAll(".pixelCanvas").length == 0) {
    createGrid(50, 30);
  }
  if (
    CurrentPage == "LandscapeInitialColor" ||
    CurrentPage == "LandscapeInitialColorFile"
  ) {
    setInitialColorButtons();
  } else {
    SetNavigationButtons();
  }
  if (Navigating == false) {
    NavigateGrid();
  }
  updatePixel();
  return;
}
function SquareMode() {
  CanvasMode = "Square";
  if (document.querySelectorAll(".pixelCanvas").length == 0) {
    createGrid(50, 50);
  }
  if (
    CurrentPage == "SquareInitialColor" ||
    CurrentPage == "SquareInitialColorFile"
  ) {
    setInitialColorButtons();
  } else {
    SetNavigationButtons();
  }
  if (Navigating == false) {
    NavigateGrid();
  }
  updatePixel();
  return;
}

//Button 1 listener
Button1.addEventListener("click", () => {
  if (CurrentPage == "Home") {
    SetNewFileButtons();
    return;
  }
  if (CurrentPage == "PickCanvas") {
    CurrentPage = "PortraitInitialColor";
    PortraitMode();
    return;
  }
  if (CurrentPage == CanvasMode + "PrinterLookup") {
    navigatePrinterList(Button1);
    return;
  }
  if (CurrentPage == CanvasMode + "Quit") {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.reload();
    });
    return;
  }
  if (CurrentPage == "FileLookup") {
    navigateFileList(Button1);
    return;
  }
  if (
    CurrentPage == CanvasMode ||
    CurrentPage == CanvasMode + "SelectFillLetterMove"
  ) {
    NavigateGrid(Button1);
    return;
  }
  if (CurrentPage == CanvasMode + "More") {
    colorOptions = ChangeColor();
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(true, colorOptions[0].innerHTML.split("<br>"), true);
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[0].innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectColor" ||
    CurrentPage.includes(CanvasMode + "SelectInitialColor")
  ) {
    if (CurrentPage.includes(CanvasMode + "SelectInitialColor")) {
      //document.getElementById("CanvasSizeTitle").hidden = false;
      document.getElementById("CustomFileNameBar").innerText = "";
      document.getElementById("CustomFileNameBar").hidden = true;
    }
    color = colorOptions[0].innerHTML.split("background-color:")[1].slice(0, 7);
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty(
      "--backgroundColor",
      colorOptions[0].innerHTML.split("background-color:")[1].slice(0, 7)
    );
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    color = "transparent";
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    document.querySelector("#Circle").hidden = true;
    FillMode = "Solid";
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFill") {
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").hidden = true;
    document.querySelector("#Letter").innerHTML = "";

    FillMode = "Solid";
    colorOptions = ChangeColor();
    return;
  }
  if (
    CurrentPage == CanvasMode + "ChangeFillLetter" ||
    CurrentPage == CanvasMode + "ChangeFillSymbols"
  ) {
    setSelectLetterButtons(false, Button1.innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage.includes(CanvasMode + "SelectFillLetter") ||
    (CurrentPage.includes(CanvasMode + "SelectFillSymbols") &&
      CurrentPage.includes("Move") == false)
  ) {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button1.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    if (
      CurrentPage == CanvasMode + "SelectFillSymbols" ||
      CurrentPage == CanvasMode + "SelectFillSymbolsMore"
    ) {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }

    return;
  }
  if (CurrentPage == CanvasMode + "Save") {
    saveFile("setCurrent");
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameKeys") {
    saveKeyboardSetLetters(false, Button1.innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage == CanvasMode + "SetCustomNameLetters" ||
    CurrentPage == CanvasMode + "SetCustomNameLettersMore"
  ) {
    FillPixel(color, Button1.innerHTML);
    saveKeyboardButtons();
    return;
  }
});
//Button 2 listener
Button2.addEventListener("click", () => {
  if (CurrentPage == "PickCanvas") {
    CurrentPage = "LandscapeInitialColor";
    LandscapeMode();
    return;
  }
  if (CurrentPage == CanvasMode + "PrinterLookup") {
    navigatePrinterList(Button2);
    return;
  }
  if (CurrentPage == CanvasMode + "Quit") {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.destroy();
    });
  }
  if (CurrentPage == "FileLookup") {
    navigateFileList(Button2);
    return;
  }
  if (
    CurrentPage == CanvasMode ||
    CurrentPage == CanvasMode + "SelectFillLetterMove"
  ) {
    NavigateGrid(Button2);
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[1].innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(true, colorOptions[1].innerHTML.split("<br>"), true);
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectColor" ||
    CurrentPage.includes(CanvasMode + "SelectInitialColor")
  ) {
    if (CurrentPage.includes(CanvasMode + "SelectInitialColor")) {
      //document.getElementById("CanvasSizeTitle").hidden = false;
      document.getElementById("CustomFileNameBar").innerText = "";
      document.getElementById("CustomFileNameBar").hidden = true;
    }
    color = colorOptions[1].innerHTML.split("background-color:")[1].slice(0, 7);
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (CurrentPage == CanvasMode + "More") {
    colorOptions = ChangeFill();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFill") {
    document.querySelector("#Circle").hidden = false;
    document.querySelector("#Letter").hidden = true;
    document.querySelector("#Letter").innerHTML = "";
    if (color == "transparent" || tinycolor(color).isLight() == false) {
      color = "white";
    }
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    FillMode = "Circle";
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (
    CurrentPage == CanvasMode + "ChangeFillLetter" ||
    CurrentPage == CanvasMode + "ChangeFillSymbols"
  ) {
    setSelectLetterButtons(false, Button2.innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetter" ||
    CurrentPage == CanvasMode + "SelectFillSymbols"
  ) {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button2.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    if (CurrentPage == CanvasMode + "SelectFillSymbols") {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetterMore" ||
    CurrentPage == CanvasMode + "SelectFillSymbolsMore"
  ) {
    if (Shift == true) {
      Shift = false;
    } else {
      Shift = true;
    }
    if (
      CurrentPage == CanvasMode + "SelectFillSymbols" ||
      CurrentPage == CanvasMode + "SelectFillSymbolsMore"
    ) {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }
  }
  if (CurrentPage == CanvasMode + "SetCustomNameKeys") {
    saveKeyboardSetLetters(false, Button2.innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLetters") {
    FillPixel(color, Button2.innerHTML);
    saveKeyboardButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "Save") {
    saveFile("setNew");
    return;
  }
});
//Button 3 listener
Button3.addEventListener("click", () => {
  if (CurrentPage == "Home") {
    GetProjects();
    return;
  }
  if (CurrentPage == "PickCanvas") {
    CurrentPage = "SquareInitialColor";
    SquareMode();
    return;
  }
  if (CurrentPage == CanvasMode + "PrinterLookup") {
    navigatePrinterList(Button3);
    return;
  }
  if (CurrentPage == "FileLookup") {
    navigateFileList(Button3);
    return;
  }
  if (
    CurrentPage == CanvasMode ||
    CurrentPage == CanvasMode + "SelectFillLetterMove"
  ) {
    NavigateGrid(Button3);
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[2].innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(true, colorOptions[2].innerHTML.split("<br>"), true);
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectColor" ||
    CurrentPage.includes(CanvasMode + "SelectInitialColor")
  ) {
    if (CurrentPage.includes(CanvasMode + "SelectInitialColor")) {
      //document.getElementById("CanvasSizeTitle").hidden = false;
      document.getElementById("CustomFileNameBar").innerText = "";
      document.getElementById("CustomFileNameBar").hidden = true;
    }
    color = colorOptions[2].innerHTML.split("background-color:")[1].slice(0, 7);
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFill") {
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").hidden = false;
    if (color == "transparent") {
      color = "white";
    }
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    FillMode = "Letter";
    setLetterButtons();
    return;
  }
  if (
    CurrentPage == CanvasMode + "ChangeFillLetter" ||
    CurrentPage == CanvasMode + "ChangeFillSymbols"
  ) {
    setSelectLetterButtons(false, Button3.innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetter" ||
    CurrentPage == CanvasMode + "SelectFillSymbols"
  ) {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button3.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    if (CurrentPage == CanvasMode + "SelectFillSymbols") {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }
    return;
  }
  if (CurrentPage == CanvasMode + "SelectFillLetterMore") {
    setSymbolsButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SelectFillSymbolsMore") {
    setLetterButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameKeys") {
    saveKeyboardSetLetters(false, Button3.innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLetters") {
    FillPixel(color, Button3.innerHTML);
    saveKeyboardButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "Save") {
    saveFile("setDefault");
    return;
  }
});
//Button 4 listener
Button4.addEventListener("click", () => {
  if (Button4.innerHTML.includes("Import Image")) {
    return;
  }
  if (CurrentPage == CanvasMode + "PrinterLookup") {
    navigatePrinterList(Button4);
    return;
  }
  if (CurrentPage == "FileLookup") {
    navigateFileList(Button4);
    return;
  }
  if (
    CurrentPage == CanvasMode ||
    CurrentPage == CanvasMode + "SelectFillLetterMove"
  ) {
    NavigateGrid(Button4);
    return;
  }
  if (CurrentPage == CanvasMode + "More") {
    setSaveButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[3].innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(true, colorOptions[3].innerHTML.split("<br>"), true);
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectColor" ||
    CurrentPage.includes(CanvasMode + "SelectInitialColor")
  ) {
    if (CurrentPage.includes(CanvasMode + "SelectInitialColor")) {
     // document.getElementById("CanvasSizeTitle").hidden = false;
      document.getElementById("CustomFileNameBar").innerText = "";
      document.getElementById("CustomFileNameBar").hidden = true;
    }
    color = colorOptions[3].innerHTML.split("background-color:")[1].slice(0, 7);
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (
    CurrentPage == CanvasMode + "ChangeFillLetter" ||
    CurrentPage == CanvasMode + "ChangeFillSymbols"
  ) {
    setSelectLetterButtons(false, Button4.innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetter" ||
    CurrentPage == CanvasMode + "SelectFillSymbols"
  ) {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button4.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    if (CurrentPage == CanvasMode + "SelectFillSymbols") {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetterMore" ||
    CurrentPage == CanvasMode + "SelectFillSymbolsMore"
  ) {
    if (currentPixel !== document.querySelectorAll(".pixelCanvas").length - 1) {
      currentPixel++;
      updatePixel();
      if (
        CurrentPage == CanvasMode + "SelectFillSymbols" ||
        CurrentPage == CanvasMode + "SelectFillSymbolsMore"
      ) {
        setSymbolsButtons();
      } else {
        setLetterButtons();
      }
      return;
    }
  }
  if (CurrentPage == CanvasMode + "SetCustomNameKeys") {
    saveKeyboardSetLetters(false, Button4.innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLetters") {
    FillPixel(color, Button4.innerHTML);
    saveKeyboardButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLettersMore") {
    document.querySelector("#CustomFileNameBar").innerHTML += " ";
    saveKeyboardButtons();
    return;
  }
});
//Button 5 listener
Button5.addEventListener("click", () => {
  if (Button5.innerHTML.includes("Fonts And Fills")) {
    return;
  }
  if (CurrentPage == "FileLookup") {
    selectFile();
    return;
  }
  if (CurrentPage == CanvasMode + "PrinterLookup") {
    selectPrinter();
    SetNavigationButtons();
    return;
  }
  if (Button5.innerHTML.includes("Fill")) {
    if (FillMode == "Letter") {
      FillPixel(color, document.querySelector("#Letter").innerHTML);
    } else {
      FillPixel(color);
    }

    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[4].innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(true, colorOptions[4].innerHTML.split("<br>"), true);
    return;
  }
  if (
    CurrentPage.includes(CanvasMode + "SelectColor") ||
    CurrentPage.includes(CanvasMode + "SelectInitialColor")
  ) {
    if (CurrentPage.includes(CanvasMode + "SelectInitialColor")) {
      //document.getElementById("CanvasSizeTitle").hidden = false;
      document.getElementById("CustomFileNameBar").innerText = "";
      document.getElementById("CustomFileNameBar").hidden = true;
    }
    color = colorOptions[4].innerHTML.split("background-color:")[1].slice(0, 7);
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    window[CanvasMode.toString() + "Mode"]();
    return;
  }
  if (
    CurrentPage == CanvasMode + "ChangeFillLetter" ||
    CurrentPage == CanvasMode + "ChangeFillSymbols"
  ) {
    setSelectLetterButtons(false, Button5.innerHTML.split("<br>"));
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetter" ||
    CurrentPage == CanvasMode + "SelectFillSymbols"
  ) {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button5.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    if (CurrentPage == CanvasMode + "SelectFillSymbols") {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetterMore" ||
    CurrentPage == CanvasMode + "SelectFillSymbolsMore"
  ) {
    SetNavigationButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameKeys") {
    saveKeyboardSetLetters(false, Button5.innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLetters") {
    FillPixel(color, Button5.innerHTML);
    saveKeyboardButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLettersMore") {
    document.querySelector("#CustomFileNameBar").innerHTML = document
      .querySelector("#CustomFileNameBar")
      .innerHTML.slice(0, -1);
    saveKeyboardButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "More") {
    printCanvas();
    return;
  }
  if (CurrentPage == CanvasMode + "Save") {
    setQuitButtons();
    return;
  }
});
//Button 6 listener
Button6.addEventListener("click", () => {
  if (Button6.innerHTML.includes("More")) {
    setMoreButtons();
    return;
  }
  if (Button6.innerHTML.includes("Quit")) {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.destroy();
    });
  }
  if (CurrentPage == CanvasMode + "Quit") {
    setSaveButtons();
    return;
  }
  if (Button6.innerHTML.includes("Go Back")) {
    if (CurrentPage == "PickCanvas") {
      document.location.reload();
    }
    if (CurrentPage == "LandscapeMore") {
      LandscapeMode();
      return;
    }
    if (CurrentPage == "PortraitMore") {
      PortraitMode();
      return;
    }
    if (CurrentPage == "SquareMore") {
      SquareMode();
      return;
    }
    if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
      //document.getElementById("CanvasSizeTitle").hidden = false;
      document.getElementById("CustomFileNameBar").innerText = "";
      document.getElementById("CustomFileNameBar").hidden = true;
      clearGrid();
      if (CurrentPage.includes("File")) {
        document.location.reload();
      } else {
        SetNewFileButtons();
      }
      return;
    }
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(
      false,
      "Eraser<br>Standard<br><br><br><br>Go Back".split(
        "<br>"
      )
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    colorOptions = ChangeColor();
    return;
  }
  if (CurrentPage.includes(CanvasMode + "SelectInitialColor")) {
    setInitialColorButtons();
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectColorMore" ||
    CurrentPage.includes(CanvasMode + "ChangeFill")
  ) {
    if (
      CurrentPage == CanvasMode + "ChangeFillLetter" ||
      CurrentPage == CanvasMode + "ChangeFillSymbols"
    ) {
      setSelectLetterButtons(true, Button6.innerHTML.split("<br>"));
      return;
    }
    if (Button6.innerHTML.includes("Go Back")) {
      window[CanvasMode.toString() + "Mode"]();
      return;
    }
    return;
  }

  if (
    CurrentPage == CanvasMode + "SelectFillLetter" ||
    CurrentPage == CanvasMode + "SelectFillSymbols" ||
    CurrentPage.includes("SelectFillLetterMove")
  ) {
    if (CurrentPage == CanvasMode + "SelectFillSymbols") {
      setSymbolsButtons();
    } else {
      setLetterButtons();
    }
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectFillLetterMore" ||
    CurrentPage == CanvasMode + "SelectFillSymbolsMore"
  ) {
    setChangeFillButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "Save") {
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameKeys") {
    saveKeyboardSetLetters(true, Button6.innerHTML.split("<br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLetters") {
    saveKeyboardButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SetCustomNameLettersMore") {
    setNewName();
    //document.getElementById("CanvasSizeTitle").removeAttribute("hidden");
    setSaveButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "PrinterLookup") {
    setMoreButtons();
    document.getElementById("PrinterSelection").setAttribute("hidden", "");
    document.querySelector("#CanvasContainer").style.display = "grid";
    return;
  }
  if (CurrentPage == "FileLookup") {
    document.location.reload();
    return;
  }
});

//event listener for keyboard input

addEventListener("keypress", function (event) {
  console.log(event.key);
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "1") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Button1.click();
  }
  if (event.key === "2") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Button2.click();
  }
  if (event.key === "3") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Button3.click();
  }
  if (event.key === "4") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Button4.click();
  }
  if (event.key === "5") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Button5.click();
  }
  if (event.key === "6") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Button6.click();
  }
});
