const GridContainer = document.querySelector("#CanvasContainer");

function createGrid(length, height) {
  GridContainer.innerHTML = "";
  GridContainer.style.setProperty("--length", length);
  GridContainer.style.setProperty("--height", height);
  if (length == 30 && height == 50) {
    GridContainer.style.setProperty("--canvasWidth", "350px");
  }
  if (length == 50 && height == 30) {
    GridContainer.style.setProperty("--canvasWidth", "800px");
    GridContainer.style.setProperty("--canvasHeight", "600px");
  }
  if (length == 50 && height == 50) {
    GridContainer.style.setProperty("--canvasWidth", "600px");
    GridContainer.style.setProperty("--canvasHeight", "600px");
  }
  for (let i = 0; i < length * height; i++) {
    const gridItem = document.createElement("div");
    gridItem.classList.add("pixelCanvas");
    GridContainer.appendChild(gridItem);
  }
}

function PortraitMode() {
  createGrid(30, 50);
}
function LandscapeMode() {
  createGrid(50, 30);
}
function SquareMode() {
  createGrid(50, 50);
}

const Button1 = document.querySelector("#PrimaryButtons_1");
const Button2 = document.querySelector("#PrimaryButtons_2");
const Button3 = document.querySelector("#PrimaryButtons_3");
const Button4 = document.querySelector("#PrimaryButtons_4");
const Button5 = document.querySelector("#PrimaryButtons_5");
const Button6 = document.querySelector("#PrimaryButtons_6");

//Button 1 listener
Button1.addEventListener("click", () => {
  if (Button1.innerHTML.includes("New File")) {
    Button1.textContent = "Portrait";
    Button2.textContent = "Landscape";
    Button3.textContent = "Square";
    Button4.textContent = "";
    Button5.textContent = "";
    Button6.textContent = "Go Back";
    return;
  }
  if (Button1.innerHTML.includes("Portrait")) {
    PortraitMode();
    return;
  }
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
  if (Button4.innerHTML.includes("Button 4")) {
    return;
  }
});
//Button 5 listener
Button5.addEventListener("click", () => {
  if (Button5.innerHTML.includes("Button 5")) {
    return;
  }
});
//Button 6 listener
Button6.addEventListener("click", () => {
  if (Button6.innerHTML.includes("Go Back")) {
    Button1.textContent = "New File";
    Button2.textContent = "Open File";
    Button3.textContent = "Save File";
    Button4.textContent = "Button 4";
    Button5.textContent = "Button 5";
    Button6.textContent = "Button 6";
    return;
  }
});
