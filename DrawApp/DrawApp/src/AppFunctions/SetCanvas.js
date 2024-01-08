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
    GridContainer.style.setProperty("--canvasWidth", "375px");
    GridContainer.style.setProperty("--canvasHeight", "625px");
    GridSizeTitle.innerHTML = CanvasMode;
  } else if (length == 50 && height == 30) {
    GridContainer.style.setProperty("--canvasWidth", "1050px");
    GridContainer.style.setProperty("--canvasHeight", "630px");
    GridSizeTitle.innerHTML = CanvasMode;
  } else if (length == 50 && height == 50) {
    GridContainer.style.setProperty("--canvasWidth", "635px");
    GridContainer.style.setProperty("--canvasHeight", "635px");
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
  return;
}
