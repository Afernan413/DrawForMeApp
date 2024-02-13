let pixelLength;
let pixelHeight;
let CanvasMode;

function clearGrid() {
  GridContainer.innerHTML = "";
  GridContainer.style = "";
  return;
}
function createGrid(length, height) {
  GridContainer.innerHTML = "";
  GridContainer.style.setProperty("--length", length);
  GridContainer.style.setProperty("--height", height);
  if (length == 30 && height == 50) {
    GridContainer.setAttribute("CanvasType", "Portrait");
    GridContainer.style.setProperty("--canvasWidth", "40vh");
    GridContainer.style.setProperty("--canvasHeight", "60vh");
    GridSizeTitle.innerHTML = CanvasMode;
  } else if (length == 50 && height == 30) {
    GridContainer.style.setProperty("margin-top", "10vh");
    GridContainer.setAttribute("CanvasType", "Landscape");
    GridContainer.style.setProperty("--canvasWidth", "60vh");
    GridContainer.style.setProperty("--canvasHeight", "40vh");
    GridSizeTitle.innerHTML = CanvasMode;
  } else if (length == 50 && height == 50) {
    GridContainer.setAttribute("CanvasType", "Square");
    GridContainer.style.setProperty("--canvasWidth", "60vh");
    GridContainer.style.setProperty("--canvasHeight", "60vh");
    GridSizeTitle.innerHTML = CanvasMode;
  }
  for (let i = 0; i < length * height; i++) {
    const gridItem = document.createElement("div");

    gridItem.classList.add("pixelCanvas");
    gridItem.id = "pixel-" + i;
    GridContainer.appendChild(gridItem);
  }
  pixelLength = length;
  pixelHeight = height;
  const canvas = document.getElementById("CanvasContainer").outerHTML;

  require("electron").ipcRenderer.send("canvas-update", canvas);
  return;
}
