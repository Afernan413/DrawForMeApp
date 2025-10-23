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
window.tinycolor = tinycolor;
var color2Name = require("color-2-name");
const { ipcRenderer } = require("electron");
const fs = require("fs");
const BrushState = require("./AppFunctions/BrushState");

// expose brush helpers for other scripts loaded via script tags
window.BrushState = BrushState;

function getBrushPreviewColor(strengthOverride) {
  const brushStrength =
    typeof strengthOverride === "number"
      ? strengthOverride
      : BrushState.getBrushStrength
        ? BrushState.getBrushStrength()
        : 1;
  const selectionContainer = document.querySelector(
    "#CurrentSelectionContainer"
  );
  const rawColor = selectionContainer
    ? selectionContainer.style.getPropertyValue("--backgroundColor") ||
      selectionContainer.style.backgroundColor ||
      color ||
      "#000000"
    : color || "#000000";

  if (window.tinycolor) {
    const parsed = window.tinycolor(rawColor || "#000000");
    if (parsed.isValid()) {
      if (parsed.getAlpha() === 0) {
        parsed.setAlpha(1);
      }
      return parsed.setAlpha(brushStrength).toRgbString();
    }
  }

  return `rgba(0, 0, 0, ${brushStrength.toFixed(2)})`;
}

function updateBrushPreviewElement() {
  const previewEl = document.getElementById("BrushPreview");
  if (!previewEl) {
    return;
  }
  const isSolidFill = FillMode === "Solid";
  previewEl.hidden = !isSolidFill;
  if (!isSolidFill) {
    return;
  }

  const maxBrushSize = BrushState.MAX_BRUSH_SIZE || 10;
  const brushSize = BrushState.getBrushSize ? BrushState.getBrushSize() : 1;
  const brushStrength = BrushState.getBrushStrength
    ? BrushState.getBrushStrength()
    : 1;

  const scale = maxBrushSize <= 1 ? 1 : (brushSize - 1) / (maxBrushSize - 1);
  const minPercent = 20;
  const percent = minPercent + scale * (100 - minPercent);
  previewEl.style.width = `${percent.toFixed(2)}%`;
  previewEl.style.height = `${percent.toFixed(2)}%`;
  const isEraserActive = color === "transparent";
  previewEl.classList.toggle("eraser-preview", isEraserActive);
  if (isEraserActive) {
    previewEl.style.backgroundColor = "";
  } else {
    previewEl.style.backgroundColor = getBrushPreviewColor(brushStrength);
  }
}

function updateBrushStatsElement() {
  const statsEl = document.getElementById("BrushStats");
  if (!statsEl) {
    return;
  }
  const brushSize = BrushState.getBrushSize ? BrushState.getBrushSize() : 1;
  const brushStrength = BrushState.getBrushStrength
    ? BrushState.getBrushStrength()
    : 1;
  const brushLabel = `${brushSize}`;
  const opacityLabel = `${Math.round(brushStrength * 100)}%`;
  const eraserActive = color === "transparent";
  if (FillMode === "Solid") {
    let html = `
    <div><span>Fill Mode: </span> <span>${FillMode}</span></div>
    <div><span>Brush Size: </span> <span>${brushLabel}</span></div>
  `;
    if (!eraserActive) {
      html += `
    <div><span>Opacity: </span><span>${opacityLabel}</span></div>
  `;
    }
    statsEl.innerHTML = html;
  } else {
    statsEl.innerHTML = `
    <div><span>Fill Mode: </span> <span>${FillMode}</span></div>
  `;
  }
}

function refreshBrushUI() {
  // if fillMode is letter but no letter is set, switch the mode to solid with white color
  if (FillMode === "Letter") {
    const letterEl = document.getElementById("Letter");
    if (!letterEl || letterEl.innerHTML.trim() === "") {
      FillMode = "Solid";
      color = "#FFFFFF";
    }
  }
  updateBrushPreviewElement();
  updateBrushStatsElement();
  if (typeof window.updatePixel === "function") {
    window.updatePixel();
  }
}

function setCurrentBrushColor(newColor, options = {}) {
  if (!newColor) {
    return;
  }
  if (options.applyToPaint !== false) {
    color = newColor;
  }
  const selection = document.querySelector("#CurrentSelectionContainer");
  if (selection) {
    selection.style.setProperty("--backgroundColor", newColor);
  }
  if (options.remember !== false && BrushState && BrushState.setBrushColor) {
    BrushState.setBrushColor(newColor);
  }
}

function applyBackgroundColor(newColor) {
  if (!newColor) {
    return;
  }
  const canvasEl = document.getElementById("CanvasContainer");
  if (!canvasEl) {
    return;
  }
  const previousBackground =
    BrushState && typeof BrushState.getBackgroundColor === "function"
      ? BrushState.getBackgroundColor()
      : null;
  const appliedColor =
    BrushState && typeof BrushState.setBackgroundColor === "function"
      ? BrushState.setBackgroundColor(newColor)
      : newColor;
  canvasEl.style.backgroundColor = appliedColor;
  const pixels = canvasEl.querySelectorAll(".pixelCanvas");
  pixels.forEach((pixel) => {
    if (!pixel) {
      return;
    }
    const hasContent = pixel.innerHTML && pixel.innerHTML.trim().length > 0;
    const inlineColor = pixel.style.backgroundColor;
    if (!inlineColor || hasContent || !previousBackground) {
      return;
    }
    try {
      const inlineHex = tinycolor(inlineColor).toHexString();
      const prevHex = tinycolor(previousBackground).toHexString();
      if (inlineHex === prevHex) {
        pixel.style.backgroundColor = appliedColor;
      }
    } catch (error) {
      if (inlineColor === previousBackground) {
        pixel.style.backgroundColor = appliedColor;
      }
    }
  });
  if (color === "transparent") {
    setCurrentBrushColor(appliedColor, { remember: false, applyToPaint: false });
  }
  ContentWindow();
}

window.getBrushPreviewColor = getBrushPreviewColor;
window.refreshBrushUI = refreshBrushUI;

///////////////////////////////GET ITEMS///////////////////////////////////////////////////////
var GridContainer = document.querySelector("#CanvasContainer");
//const GridSizeTitle = document.querySelector("#CanvasSizeTitle");
const OriginalButtons = document.querySelector("#ButtonsContainer").innerHTML;
const ButtonsContainer = document.querySelector("#ButtonsContainer");

let colorOptions;
// Curated 25-color palette: chosen to cover hue wheel, neutrals, and useful midtones
// Colors are objects with {hex, name} to match existing usage in SetButtons.js
let palette = [
  { hex: "#000000", name: "Black" }, // Anchor: black
  { hex: "#FFFFFF", name: "White" }, // Anchor: white
  { hex: "#7F7F7F", name: "Mid Gray" }, // Neutral midtone for desaturations
  { hex: "#FF0000", name: "Primary Red" }, // Strong red
  { hex: "#E25822", name: "Vermilion" }, // Warm orange-red
  { hex: "#FFA500", name: "Orange" }, // Orange (warm)
  { hex: "#FFD700", name: "Gold" }, // Yellow/gold (rich warm yellow)
  { hex: "#FFFF66", name: "Lemon" }, // Light yellow (highlights)
  { hex: "#00A86B", name: "Green" }, // Primary green (slightly muted)
  { hex: "#007F5F", name: "Deep Green" }, // Deep/forest green
  { hex: "#00FFCC", name: "Aqua Mint" }, // Cyan/green mix useful for blends
  { hex: "#00BFFF", name: "Sky Blue" }, // Light bright blue
  { hex: "#0000CD", name: "Royal Blue" }, // Medium-deep blue
  { hex: "#4B0082", name: "Indigo" }, // Violet-blue bridge
  { hex: "#8A2BE2", name: "Violet" }, // Vivid violet
  { hex: "#FF00FF", name: "Magenta" }, // Magenta / fuchsia
  { hex: "#FF69B4", name: "Hot Pink" }, // Pink for skin/highlights
  { hex: "#A0522D", name: "Sienna" }, // Brown/red-leaning (earth)
  { hex: "#8B4513", name: "Saddle Brown" }, // Dark brown (shadows)
  { hex: "#F5DEB3", name: "Wheat" }, // Light warm beige
  { hex: "#FFEFD5", name: "Papaya" }, // Very light warm tone
  { hex: "#2F4F4F", name: "Charcoal" }, // Dark neutral with slight cool tint
  { hex: "#556B2F", name: "Olive Drab" }, // Muted olive for natural blends
  { hex: "#B22222", name: "Brick Red" }, // Muted strong red for contrast
  { hex: "#C0C0C0", name: "Silver" },
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
  if (CurrentPage == CanvasMode + "More" && FillMode == "Solid") {
    // Open the new ChangeBrush top-level menu
    colorOptions = ChangeBrush();
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(
      true,
      colorOptions[0].innerHTML.split("</canvas>"),
      true
    );
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[0].innerHTML.split("</canvas>"));
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBackground") {
    setSelectBackgroundButtons(
      colorOptions[0].innerHTML.split("</canvas>")
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectBackground") {
    const selectedColor = colorOptions[0].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    applyBackgroundColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
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
    const selectedColor = colorOptions[0].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    setCurrentBrushColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    // Button1 on SelectColorMore -> Adjust Size
    setBrushSizeButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // Button1 on ChangeBrush -> Change Color (show palettes)
    colorOptions = ChangeColor();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushMenu") {
    setBrushSizeButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushSize") {
    BrushState.increaseBrushSize();
    setBrushSizeButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushStrength") {
    if (color === "transparent") {
      return;
    }
    BrushState.increaseBrushStrength();
    setBrushStrengthButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFill") {
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").hidden = true;
    document.querySelector("#Letter").innerHTML = "";

    FillMode = "Solid";
    const rememberedColor =
      BrushState && typeof BrushState.getBrushColor === "function"
        ? BrushState.getBrushColor()
        : null;
    if (rememberedColor) {
      setCurrentBrushColor(rememberedColor, { remember: true });
      //goto main navigation
      window[CanvasMode.toString() + "Mode"]();
    }
    else{
      colorOptions = ChangeColor();
    }
    refreshBrushUI();
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
    refreshBrushUI();
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
    setSelectColorButtons(true, colorOptions[1].innerHTML.split("</canvas>"));
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBackground") {
    setSelectBackgroundButtons(
      colorOptions[1].innerHTML.split("</canvas>")
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectBackground") {
    const selectedColor = colorOptions[1].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    applyBackgroundColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }

  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(
      true,
      colorOptions[1].innerHTML.split("</canvas>"),
      true
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    if (color === "transparent") {
      return;
    }
    // Button2 on SelectColorMore -> Adjust Opacity
    setBrushStrengthButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // Button2 on ChangeBrush -> Change Size
    setBrushSizeButtons();
    refreshBrushUI();
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
    const selectedColor = colorOptions[1].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    setCurrentBrushColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushMenu") {
    if (color === "transparent") {
      return;
    }
    setBrushStrengthButtons();
    return;
  }
  
  if (CurrentPage == CanvasMode + "BrushSize") {
    BrushState.decreaseBrushSize();
    setBrushSizeButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushStrength") {
    if (color === "transparent") {
      return;
    }
    BrushState.decreaseBrushStrength();
    setBrushStrengthButtons();
    refreshBrushUI();
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
    const letterPreviewColor = color2Name.getColor("white").hex;
    setCurrentBrushColor(letterPreviewColor, { remember: false });
    FillMode = "Circle";
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
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
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // NOTE: ChangeBrush Button4 mapping moved to Button4 handler to fix wrong placement
    // Placeholder here removed so Button2 handler doesn't shadow later handlers
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
  if (CurrentPage == CanvasMode + "More") {
    colorOptions = ChangeBackgroundColor();
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
    setSelectColorButtons(true, colorOptions[2].innerHTML.split("</canvas>"));
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBackground") {
    setSelectBackgroundButtons(
      colorOptions[2].innerHTML.split("</canvas>")
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectBackground") {
    const selectedColor = colorOptions[2].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    applyBackgroundColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(
      true,
      colorOptions[2].innerHTML.split("</canvas>"),
      true
    );
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // Button3 on ChangeBrush -> Change Opacity
    if (color === "transparent") {
      return;
    }
    setBrushStrengthButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushSize") {
    BrushState.resetBrushSize();
    setBrushSizeButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "BrushStrength") {
    if (color === "transparent") {
      return;
    }
    BrushState.resetBrushStrength();
    setBrushStrengthButtons();
    refreshBrushUI();
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
    const selectedColor = colorOptions[2].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    setCurrentBrushColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFill") {
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").hidden = false;
    const letterPreviewColor = color2Name.getColor("white").hex;
    setCurrentBrushColor(letterPreviewColor, { remember: false });
    FillMode = "Letter";
    setLetterButtons();
    refreshBrushUI();
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
    refreshBrushUI();
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
  // If we're on the SelectColorMore screen the 4th button is unused (keep it a no-op)
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    return;
  }
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
    setSelectColorButtons(true, colorOptions[3].innerHTML.split("</canvas>"));
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBackground") {
    setSelectBackgroundButtons(
      colorOptions[3].innerHTML.split("</canvas>")
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectBackground") {
    const selectedColor = colorOptions[3].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    applyBackgroundColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(
      true,
      colorOptions[3].innerHTML.split("</canvas>"),
      true
    );
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
    const selectedColor = colorOptions[3].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    setCurrentBrushColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    // Button3 on SelectColorMore -> Standard brush (reset to default)
    BrushState.resetBrush();
    setBrushMenuButtons();
    refreshBrushUI();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // Button4 on ChangeBrush -> Standard: reset brush and restore remembered color
    BrushState.resetBrush();
    const restoredColor =
      BrushState && typeof BrushState.getBrushColor === "function"
        ? BrushState.getBrushColor()
        : "#FFFFFF";
    if (restoredColor) {
      setCurrentBrushColor(restoredColor, { remember: true });
    } else {
      setCurrentBrushColor("#FFFFFF");
    }
    FillMode = "Solid";
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
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
    refreshBrushUI();
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
  // If we're on the SelectColorMore screen the 5th button is unused (no-op)
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    return;
  }
  if (Button5.innerHTML.includes("Fonts And Fills")) {
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // Button5 on ChangeBrush -> Eraser
    const backgroundColor =
      BrushState && typeof BrushState.getBackgroundColor === "function"
        ? BrushState.getBackgroundColor()
        : "#FFFFFF";
    setCurrentBrushColor(backgroundColor, {
      remember: false,
      applyToPaint: false,
    });
    color = "transparent";
    FillMode = "Solid";
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
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
  if (CurrentPage == CanvasMode + "BrushMenu") {
    BrushState.resetBrush();
    setBrushMenuButtons();
    refreshBrushUI();
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
    setSelectColorButtons(true, colorOptions[4].innerHTML.split("</canvas>"));
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBackground") {
    setSelectBackgroundButtons(
      colorOptions[4].innerHTML.split("</canvas>")
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectBackground") {
    const selectedColor = colorOptions[4].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    applyBackgroundColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
    return;
  }
  if (CurrentPage.includes(CanvasMode + "ChangeInitialColor")) {
    setSelectColorButtons(
      true,
      colorOptions[4].innerHTML.split("</canvas>"),
      true
    );
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
    if (CurrentPage.includes("More")) {
      return;
    }
    const selectedColor = colorOptions[4].innerHTML
      .split("background-color:")[1]
      .slice(0, 7);
    setCurrentBrushColor(selectedColor);
    window[CanvasMode.toString() + "Mode"]();
    refreshBrushUI();
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
    refreshBrushUI();
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
  if (CurrentPage == CanvasMode + "BrushMenu") {
    // Go back to the ChangeBrush top-level page (avoid loop back to ChangeColor)
    setChangeBrushButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBrush") {
    // Back from ChangeBrush should return to navigation
    SetNavigationButtons();
    return;
  }
  if (
    CurrentPage == CanvasMode + "BrushSize" ||
    CurrentPage == CanvasMode + "BrushStrength"
  ) {
    // Return to the ChangeBrush top-level page instead of the intermediate BrushMenu
    setChangeBrushButtons();
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
    
    setChangeBrushButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeBackground") {
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SelectBackground") {
    colorOptions = ChangeBackgroundColor();
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
      refreshBrushUI();
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

refreshBrushUI();
window.addEventListener("load", () => {
  refreshBrushUI();
});
