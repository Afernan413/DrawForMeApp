const { BrowserWindow } = require("@electron/remote");

///////////////////////////////GET ITEMS///////////////////////////////////////////////////////
const GridContainer = document.querySelector("#CanvasContainer");
const GridSizeTitle = document.querySelector("#CanvasSizeTitle");
const OriginalButtons = document.querySelector("#ButtonsContainer").innerHTML;
const ButtonsContainer = document.querySelector("#ButtonsContainer");
const Button1 = document.querySelector("#PrimaryButtons_1");
const Button2 = document.querySelector("#PrimaryButtons_2");
const Button3 = document.querySelector("#PrimaryButtons_3");
const Button4 = document.querySelector("#PrimaryButtons_4");
const Button5 = document.querySelector("#PrimaryButtons_5");
const Button6 = document.querySelector("#PrimaryButtons_6");
const color = document
  .querySelector("#CurrentSelectionContainer")
  .computedStyleMap()
  .get("--backgroundColor");
const pixels = document.querySelectorAll(".pixelCanvas");
const currWindow = BrowserWindow.getFocusedWindow();
///////////////////////////////////////////////////////////////////////////////////////////////

function PortraitMode() {
  CanvasMode = "Portrait";
  if (pixels.length == 0) {
    createGrid(30, 50);
  }
  SetNavigationButtons();
  if (Navigating == false) {
    NavigateGrid();
    Navigating = true;
  }
  updatePixel();
}
function LandscapeMode() {
  CanvasMode = "Landscape";
  if (pixels.length == 0) {
    createGrid(50, 30);
  }
  SetNavigationButtons();
  if (Navigating == false) {
    NavigateGrid();
    Navigating = true;
  }
  updatePixel();
}
function SquareMode() {
  CanvasMode = "Square";
  if (pixels.length == 0) {
    createGrid(50, 50);
  }
  SetNavigationButtons();
  if (Navigating == false) {
    NavigateGrid();
    Navigating = true;
  }
  updatePixel();
}

//Button 1 listener
Button1.addEventListener("click", () => {
  if (Button1.innerHTML.includes("New File")) {
    SetNewFileButtons();
    return;
  }
  if (Button1.innerHTML.includes("Portrait")) {
    PortraitMode();
    return;
  }
  return;
});
//Button 2 listener
Button2.addEventListener("click", () => {
  if (Button2.innerHTML.includes("Landscape")) {
    LandscapeMode();
    return;
  }
});
//Button 3 listener
Button3.addEventListener("click", () => {
  if (Button3.innerHTML.includes("Square")) {
    SquareMode();
    return;
  }
});
//Button 4 listener
Button4.addEventListener("click", () => {
  if (Button4.innerHTML.includes("Import Image")) {
    return;
  }
});
//Button 5 listener
Button5.addEventListener("click", () => {
  if (Button5.innerHTML.includes("Fonts And Fills")) {
    return;
  }
  if (Button5.innerHTML.includes("Fill")) {
    FillPixel();
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
    currWindow.destroy();
  }
  if (Button6.innerHTML.includes("Go Back")) {
    if (Button6.getAttribute("currentpage") == "PickCanvas") {
      document.location.reload();
    }
    if (Button6.getAttribute("currentpage") == "Landscape") {
      LandscapeMode();
      return;
    }
    if (Button6.getAttribute("currentpage") == "Portrait") {
      PortraitMode();
      return;
    }
    if (Button6.getAttribute("currentpage") == "Square") {
      SquareMode();
      return;
    }
  }
});
