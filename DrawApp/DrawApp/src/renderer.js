const { BrowserWindow } = require("@electron/remote");
var color2Name = require("color-2-name");

///////////////////////////////GET ITEMS///////////////////////////////////////////////////////
var GridContainer = document.querySelector("#CanvasContainer");
const GridSizeTitle = document.querySelector("#CanvasSizeTitle");
const OriginalButtons = document.querySelector("#ButtonsContainer").innerHTML;
const ButtonsContainer = document.querySelector("#ButtonsContainer");

let colorOptions;

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
var currWindow = BrowserWindow.getFocusedWindow();
///////////////////////////////////////////////////////////////////////////////////////////////

function PortraitMode() {
  CanvasMode = "Portrait";
  if (document.querySelectorAll(".pixelCanvas").length == 0) {
    createGrid(30, 50);
  }
  SetNavigationButtons();
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
  SetNavigationButtons();
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
  SetNavigationButtons();
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
    PortraitMode();
    return;
  }
  if (CurrentPage == CanvasMode) {
    NavigateGrid(Button1);
    return;
  }
  if (CurrentPage == CanvasMode + "More") {
    colorOptions = ChangeColor();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[0].innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    color = palette.filter((e) => e.name == colorOptions[0].innerHTML)[0].hex;
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColorMore") {
    color = "transparent";
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    document.querySelector("#Circle").hidden = true;
    FillMode = "Solid";
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFill") {
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").hidden = true;
    document.querySelector("#Letter").innerHTML = "";

    FillMode = "Solid";
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFillLetter") {
    setSelectLetterButtons(false, Button1.innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage.includes(CanvasMode + "SelectFillLetter")) {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button1.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    setLetterButtons();
    return;
  }
});
//Button 2 listener
Button2.addEventListener("click", () => {
  if (CurrentPage == "PickCanvas") {
    LandscapeMode();
    return;
  }
  if (CurrentPage == CanvasMode) {
    NavigateGrid(Button2);
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[1].innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    color = palette.filter((e) => e.name == colorOptions[1].innerHTML)[0].hex;
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    setMoreButtons();
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
    if (color == "transparent") {
      color = "white";
    }
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    FillMode = "Circle";
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFillLetter") {
    setSelectLetterButtons(false, Button2.innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectFillLetter") {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button2.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    setLetterButtons();
    return;
  }
});
//Button 3 listener
Button3.addEventListener("click", () => {
  if (CurrentPage == "PickCanvas") {
    SquareMode();
    return;
  }
  if (CurrentPage == CanvasMode) {
    NavigateGrid(Button3);
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[2].innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    color = palette.filter((e) => e.name == colorOptions[2].innerHTML)[0].hex;
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    setMoreButtons();
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
  if (CurrentPage == CanvasMode + "ChangeFillLetter") {
    setSelectLetterButtons(false, Button3.innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectFillLetter") {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button3.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    setLetterButtons();
    return;
  }
});
//Button 4 listener
Button4.addEventListener("click", () => {
  if (Button4.innerHTML.includes("Import Image")) {
    return;
  }
  if (CurrentPage == CanvasMode) {
    NavigateGrid(Button4);
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(true, colorOptions[3].innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    color = palette.filter((e) => e.name == colorOptions[3].innerHTML)[0].hex;
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFillLetter") {
    setSelectLetterButtons(false, Button4.innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectFillLetter") {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button4.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    setLetterButtons();
    return;
  }
});
//Button 5 listener
Button5.addEventListener("click", () => {
  if (Button5.innerHTML.includes("Fonts And Fills")) {
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
    setSelectColorButtons(true, colorOptions[4].innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    color = palette.filter((e) => e.name == colorOptions[4].innerHTML)[0].hex;
    var r = document.querySelector("#CurrentSelectionContainer");
    r.style.setProperty("--backgroundColor", color);
    setMoreButtons();
    return;
  }
  if (CurrentPage == CanvasMode + "ChangeFillLetter") {
    setSelectLetterButtons(false, Button5.innerHTML.split("<br><br>"));
    return;
  }
  if (CurrentPage == CanvasMode + "SelectFillLetter") {
    FillMode = "Letter";
    document.querySelector("#Letter").hidden = false;
    document.querySelector("#Circle").hidden = true;
    document.querySelector("#Letter").innerHTML = Button5.innerHTML;
    FillPixel(color, document.querySelector("#Letter").innerHTML);
    setLetterButtons();
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
  }
  if (CurrentPage == CanvasMode + "ChangeColor") {
    setSelectColorButtons(
      false,
      "Eraser<br><br>Standard<br><br>Unknown<br><br>Unknown<br><br>Unknown<br><br>Go Back".split(
        "<br><br>"
      )
    );
    return;
  }
  if (CurrentPage == CanvasMode + "SelectColor") {
    colorOptions = ChangeColor();
    return;
  }
  if (
    CurrentPage == CanvasMode + "SelectColorMore" ||
    CurrentPage.includes(CanvasMode + "ChangeFill")
  ) {
    if (CurrentPage == CanvasMode + "ChangeFillLetter") {
      setSelectLetterButtons(true, Button6.innerHTML.split("<br><br>"));
      return;
    }
    if (Button6.innerHTML.includes("Go Back")) {
      setMoreButtons();
      return;
    }
    return;
  }

  if (CurrentPage == CanvasMode + "SelectFillLetter") {
    setLetterButtons();
    return;
  }
});
