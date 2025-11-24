var brushState = window.BrushState || require("./BrushState");
window.BrushState = brushState;

let pixelLength;
let pixelHeight;
let CanvasMode;

function clearGrid() {
  const canvasEl = document.getElementById("CanvasContainer");
  canvasEl.innerHTML = "";
  // clear content and hide the container until a new grid is created
  try {
    canvasEl.innerHTML = "";
    canvasEl.removeAttribute("style");
    canvasEl.setAttribute("hidden", "");
  } catch (e) {}
  try {
    GridContainer.innerHTML = "";
    GridContainer.removeAttribute("style");
    GridContainer.setAttribute("hidden", "");
  } catch (e) {}
  if (brushState && typeof brushState.resetBackgroundColor === "function") {
    const defaultBackground = brushState.resetBackgroundColor();
    canvasEl.style.backgroundColor = defaultBackground;
    GridContainer.style.backgroundColor = defaultBackground;
    canvasEl.setAttribute("data-background-color", defaultBackground);
    GridContainer.setAttribute("data-background-color", defaultBackground);
  }
  childWdindow.reload();
  return;
}
function createGrid(length, height) {
  GridContainer.innerHTML = "";
  GridContainer.removeAttribute("hidden");
  GridContainer.style.setProperty("--length", length);
  GridContainer.style.setProperty("--height", height);
  const backgroundColor =
    brushState && typeof brushState.getBackgroundColor === "function"
      ? brushState.getBackgroundColor()
      : brushState && brushState.DEFAULT_BACKGROUND_COLOR
        ? brushState.DEFAULT_BACKGROUND_COLOR
        : "#FFFFFF";
  GridContainer.style.backgroundColor = backgroundColor;
  GridContainer.setAttribute("data-background-color", backgroundColor);
  if (length == 30 && height == 50) {
    GridContainer.setAttribute("CanvasType", "Portrait");
    GridContainer.style.setProperty("--canvasWidth", "40vh");
    GridContainer.style.setProperty("--canvasHeight", "60vh");
    //GridSizeTitle.innerHTML = CanvasMode;
  } else if (length == 50 && height == 30) {
    GridContainer.style.setProperty("margin-top", "10vh");
    GridContainer.setAttribute("CanvasType", "Landscape");
    GridContainer.style.setProperty("--canvasWidth", "60vh");
    GridContainer.style.setProperty("--canvasHeight", "40vh");
   // GridSizeTitle.innerHTML = CanvasMode;
  } else if (length == 50 && height == 50) {
    GridContainer.setAttribute("CanvasType", "Square");
    GridContainer.style.setProperty("--canvasWidth", "60vh");
    GridContainer.style.setProperty("--canvasHeight", "60vh");
   // GridSizeTitle.innerHTML = CanvasMode;
  }
  for (let i = 0; i < length * height; i++) {
    const gridItem = document.createElement("div");

    gridItem.classList.add("pixelCanvas");
    gridItem.id = "pixel-" + i;
    GridContainer.appendChild(gridItem);
  }
  // ensure the container is visible now that pixels exist
  try {
    GridContainer.removeAttribute("hidden");
    const canvasEl = document.getElementById("CanvasContainer");
    if (canvasEl) canvasEl.removeAttribute("hidden");
  } catch (e) {}
  pixelLength = length;
  pixelHeight = height;
  ContentWindow();
  return;
}
