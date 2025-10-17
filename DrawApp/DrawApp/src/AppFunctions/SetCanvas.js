let pixelLength;
let pixelHeight;
let CanvasMode;

function clearGrid() {
  const canvasContainer = document.getElementById("CanvasContainer");
  if (canvasContainer) {
    canvasContainer.innerHTML = "";
    canvasContainer.removeAttribute("style");
  }

  GridContainer = document.querySelector("#CanvasContainer");
  if (GridContainer) {
    GridContainer.innerHTML = "";
    GridContainer.removeAttribute("style");
  }

  ContentWindow();
}
function createGrid(length, height) {
  GridContainer = document.querySelector("#CanvasContainer");
  GridContainer.innerHTML = "";
  GridContainer.style.setProperty("--length", length);
  GridContainer.style.setProperty("--height", height);
  if (length == 30 && height == 50) {
    GridContainer.setAttribute("CanvasType", "Portrait");
    GridContainer.style.setProperty("--canvasWidth", "40vh");
    GridContainer.style.setProperty("--canvasHeight", "60vh");
  } else if (length == 50 && height == 30) {
    GridContainer.style.setProperty("margin-top", "10vh");
    GridContainer.setAttribute("CanvasType", "Landscape");
    GridContainer.style.setProperty("--canvasWidth", "60vh");
    GridContainer.style.setProperty("--canvasHeight", "40vh");
  } else if (length == 50 && height == 50) {
    GridContainer.setAttribute("CanvasType", "Square");
    GridContainer.style.setProperty("--canvasWidth", "60vh");
    GridContainer.style.setProperty("--canvasHeight", "60vh");
  }
  for (let i = 0; i < length * height; i++) {
    const gridItem = document.createElement("div");

    gridItem.classList.add("pixelCanvas");
    gridItem.id = "pixel-" + i;
    GridContainer.appendChild(gridItem);
  }
  pixelLength = length;
  pixelHeight = height;
  ContentWindow();
  return;
}
