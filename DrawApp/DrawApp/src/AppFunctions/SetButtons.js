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
let WrittingModeOptions = [];

// Add lowercase letters
for (let i = 97; i <= 122; i++) {
  WrittingModeOptions.push(String.fromCharCode(i));
}

WrittingModeOptions = WrittingModeOptions.concat([
  "Shift",
  "Symbols",
  "Space",
  "Move",
  "Change Fill",
]);

let Shift = false;

//format button Options
let FormattedWrittingModeOptions = "";
for (let i = 0; i < WrittingModeOptions.length; i++) {
  FormattedWrittingModeOptions += WrittingModeOptions[i];
  FormattedWrittingModeOptions += "<br><br>";
  if (i !== 0 && (i + 1) % 5 == 0 && i !== 29) {
    FormattedWrittingModeOptions += "oops";
  }
}
FormattedWrittingModeOptions = FormattedWrittingModeOptions.split("oops");

let Symbols = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "+",
  "-",
  "*",
  "/",
  "=",
  ".",
  ",",
  "?",
  "!",
  "^",
  "(",
  ")",
  "@",
  '"',
  "'",
  ";",
].concat(["Shift", "Letters", "Space", "Move", "Change Fill"]);
let FormattedSymbolsModeOptions = "";
for (let i = 0; i < Symbols.length; i++) {
  FormattedSymbolsModeOptions += Symbols[i];
  FormattedSymbolsModeOptions += "<br><br>";
  if (i !== 0 && (i + 1) % 5 == 0 && i !== 29) {
    FormattedSymbolsModeOptions += "oops";
  }
}
FormattedSymbolsModeOptions = FormattedSymbolsModeOptions.split("oops");
function SetNewFileButtons() {
  Button1.innerHTML = "Portrait";
  Button2.innerHTML = "Landscape";
  Button3.innerHTML = "Square";
  Button4.innerHTML = "";
  Button5.innerHTML = "";
  Button6.innerHTML = "Go Back";
  CurrentPage = "PickCanvas";
  return;
}
function SetNavigationButtons() {
  Button1.innerHTML =
    "<img src='../assets/Icons/LeftArrow.png' alt='Left-Arrow' />";
  Button1.setAttribute("arrow", "LeftArrow");
  Button2.innerHTML =
    "<img src='../assets/Icons/UpArrow.png' alt='Up-Arrow' />";
  Button2.setAttribute("arrow", "UpArrow");
  Button3.innerHTML =
    "<img src='../assets/Icons/DownArrow.png' alt='Down-Arrow' />";
  Button3.setAttribute("arrow", "DownArrow");
  Button4.innerHTML =
    "<img src='../assets/Icons/RightArrow.png' alt='Right-Arrow' />";
  Button4.setAttribute("arrow", "RightArrow");
  if (
    CurrentPage == CanvasMode + "SelectFillLetterMore" ||
    CurrentPage == CanvasMode + "SelectFillSymbolsMore"
  ) {
    Button5.innerHTML = "";
    Button6.innerHTML = "Go Back";
    CurrentPage = CanvasMode + "SelectFillLetterMove";
  } else {
    Button5.innerHTML = "Fill";
    Button6.innerHTML = "More";
    CurrentPage = CanvasMode;
  }

  return;
}
function setMoreButtons() {
  Button1.innerHTML = "Change Color";
  Button1.removeAttribute("arrow");
  Button2.innerHTML = "Change Fill";
  Button2.removeAttribute("arrow");
  Button3.innerHTML = "Change Palette";
  Button3.removeAttribute("arrow");
  Button4.innerHTML = "Save";
  Button4.removeAttribute("arrow");
  Button5.innerHTML = "Print";
  Button6.innerHTML = "Go Back";
  CurrentPage = CanvasMode + "More";
  return;
}
let FormattedPallete = "";
Object.values(palette).forEach((value) => {
  let index = Object.values(palette).indexOf(value) + 1;
  let string = value.name.toString();
  FormattedPallete += string;
  FormattedPallete += "<br><br>";
  if (index !== 0 && index % 5 == 0) {
    FormattedPallete += "oops";
  }
});
FormattedPallete = FormattedPallete.split("oops");
function setChangeColorButtons() {
  Button1.innerHTML = FormattedPallete[0] + "oops";
  Button2.innerHTML = FormattedPallete[1] + "oops";
  Button3.innerHTML = FormattedPallete[2] + "oops";
  Button4.innerHTML = FormattedPallete[3] + "oops";
  Button5.innerHTML = FormattedPallete[4] + "oops";
  Button6.innerHTML =
    "Eraser<br><br>Standard<br><br><br><br><br><br><br><br>Go Back";
  CurrentPage = CanvasMode + "ChangeColor";
  return;
}
function setSelectColorButtons(bool, buttonClickedOptions) {
  console.log(bool);
  if (bool === true) {
    Button1.innerHTML = buttonClickedOptions[0];
    Button2.innerHTML = buttonClickedOptions[1];
    Button3.innerHTML = buttonClickedOptions[2];
    Button4.innerHTML = buttonClickedOptions[3];
    Button5.innerHTML = buttonClickedOptions[4];
    Button6.innerHTML = "oops";
    CurrentPage = CanvasMode + "SelectColor";
  } else {
    Button1.innerHTML = buttonClickedOptions[0];
    Button2.innerHTML = buttonClickedOptions[1];
    Button3.innerHTML = buttonClickedOptions[2];
    Button4.innerHTML = buttonClickedOptions[3];
    Button5.innerHTML = buttonClickedOptions[4];
    Button6.innerHTML = "Go Back";
    CurrentPage = CanvasMode + "SelectColorMore";
  }
  return;
}
function setChangeFillButtons() {
  Button1.innerHTML = "SOLID";
  Button2.innerHTML = "DOT";
  Button3.innerHTML = "LETTER";
  Button4.innerHTML = "";
  Button5.innerHTML = "";
  Button6.innerHTML = "Go Back";
  CurrentPage = CanvasMode + "ChangeFill";
  return;
}
function setLetterButtons() {
  if (!Shift) {
    Button1.innerHTML = FormattedWrittingModeOptions[0];
    Button2.innerHTML = FormattedWrittingModeOptions[1];
    Button3.innerHTML = FormattedWrittingModeOptions[2];
    Button4.innerHTML = FormattedWrittingModeOptions[3];
    Button5.innerHTML = FormattedWrittingModeOptions[4];
    Button6.innerHTML = FormattedWrittingModeOptions[5];
  } else {
    Button1.innerHTML = FormattedWrittingModeOptions[0].toLocaleUpperCase();
    Button2.innerHTML = FormattedWrittingModeOptions[1].toLocaleUpperCase();
    Button3.innerHTML = FormattedWrittingModeOptions[2].toLocaleUpperCase();
    Button4.innerHTML = FormattedWrittingModeOptions[3].toLocaleUpperCase();
    Button5.innerHTML = FormattedWrittingModeOptions[4].toLocaleUpperCase();
    Button6.innerHTML = "Z".concat(
      FormattedWrittingModeOptions[5].split("z")[1]
    );
  }

  CurrentPage = CanvasMode + "ChangeFillLetter";
  return;
}
function setSelectLetterButtons(bool = false, buttonClickedOptions) {
  Button1.innerHTML = buttonClickedOptions[0];
  Button2.innerHTML = buttonClickedOptions[1];
  Button3.innerHTML = buttonClickedOptions[2];
  Button4.innerHTML = buttonClickedOptions[3];
  Button5.innerHTML = buttonClickedOptions[4];
  if (bool === true) {
    Button6.innerHTML = buttonClickedOptions[5];
    if (CurrentPage == CanvasMode + "ChangeFillSymbols") {
      CurrentPage = CanvasMode + "SelectFillSymbolsMore";
    } else {
      CurrentPage = CanvasMode + "SelectFillLetterMore";
    }
  } else {
    Button6.innerHTML = "oops";
    if (CurrentPage == CanvasMode + "ChangeFillSymbols") {
      CurrentPage = CanvasMode + "SelectFillSymbols";
    } else {
      CurrentPage = CanvasMode + "SelectFillLetter";
    }
  }

  return;
}
function setSymbolsButtons() {
  Button1.innerHTML = FormattedSymbolsModeOptions[0];
  Button2.innerHTML = FormattedSymbolsModeOptions[1];
  Button3.innerHTML = FormattedSymbolsModeOptions[2];
  Button4.innerHTML = FormattedSymbolsModeOptions[3];
  Button5.innerHTML = FormattedSymbolsModeOptions[4];
  Button6.innerHTML = FormattedSymbolsModeOptions[5];
  CurrentPage = CanvasMode + "ChangeFillSymbols";
  return;
}
function setFileLookupButtons() {
  Button1.innerHTML =
    "<img src='../assets/Icons/DownArrow.png' alt='Down-Arrow' />";

  Button2.innerHTML =
    "<img src='../assets/Icons/DownDown.png' alt='DownDown-Arrow' />";

  Button3.innerHTML =
    "<img src='../assets/Icons/UpArrow.png' alt='Up-Arrow' />";

  Button4.innerHTML =
    "<img src='../assets/Icons/UpUpArrow.png' alt='UpUp-Arrow' />";
  Button5.innerHTML = "Select";
  Button6.innerHTML = "oops";
  CurrentPage = "FileLookup";
  return;
}
function setPrintLookupButtons() {
  Button1.innerHTML =
    "<img src='../assets/Icons/DownArrow.png' alt='Down-Arrow' />";

  Button2.innerHTML =
    "<img src='../assets/Icons/DownDown.png' alt='DownDown-Arrow' />";

  Button3.innerHTML =
    "<img src='../assets/Icons/UpArrow.png' alt='Up-Arrow' />";

  Button4.innerHTML =
    "<img src='../assets/Icons/UpUpArrow.png' alt='UpUp-Arrow' />";
  Button5.innerHTML = "Select";
  Button6.innerHTML = "oops";
  CurrentPage = CanvasMode + "PrinterLookup";
  return;
}

function setSaveButtons() {
  if (FileName == undefined) {
    document.getElementById("PrimaryButtons_1").disabled = true;
  } else {
    document.getElementById("PrimaryButtons_1").disabled = false;
  }
  Button1.innerHTML = "Save with current name";
  Button2.innerHTML = "";
  Button3.innerHTML = "Save with new name";
  Button4.innerHTML = "";
  Button5.innerHTML = "Save with default name";
  Button6.innerHTML = "Cancel";
  CurrentPage = CanvasMode + "Save";
  return;
}
function saveKeyboardButtons() {
  document.getElementById("PrimaryButtons_1").disabled = false;
  Button1.innerHTML = FormattedWrittingModeOptions[0];
  Button2.innerHTML = FormattedWrittingModeOptions[1];
  Button3.innerHTML = FormattedWrittingModeOptions[2];
  Button4.innerHTML = FormattedWrittingModeOptions[3];
  Button5.innerHTML = FormattedWrittingModeOptions[4];
  Button6.innerHTML = "z<br><br><br><br><br><br>Space<br><br>Back<br><br>Done";
  CurrentPage = CanvasMode + "SetCustomNameKeys";
  return;
}
function saveKeyboardSetLetters(bool = false, buttonClickedOptions) {
  document.getElementById("PrimaryButtons_1").disabled = false;
  Button1.innerHTML = buttonClickedOptions[0];
  Button2.innerHTML = buttonClickedOptions[1];
  Button3.innerHTML = buttonClickedOptions[2];
  Button4.innerHTML = buttonClickedOptions[3];
  Button5.innerHTML = buttonClickedOptions[4];
  if (bool === true) {
    Button6.innerHTML = buttonClickedOptions[5];
    CurrentPage = CanvasMode + "SetCustomNameLettersMore";
  } else {
    Button6.innerHTML = "oops";
    CurrentPage = CanvasMode + "SetCustomNameLetters";
  }

  return;
}
