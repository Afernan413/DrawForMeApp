let currentPixel = 0;
let Navigating = false;
function ensureBrushOverlay() {
  const grid = document.getElementById("CanvasContainer");
  if (!grid) {
    return null;
  }
  let overlay = grid.querySelector("#BrushFootprintOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "BrushFootprintOverlay";
    grid.appendChild(overlay);
  }
  return overlay;
}

function updatePixel() {
  const allPixels = document.querySelectorAll(".pixelCanvas");
  allPixels.forEach((pixel) => {
    pixel.classList.remove("active");
    pixel.classList.remove("brush-preview");
  });

  const activeBox = document.getElementById("pixel-" + currentPixel);
  if (activeBox) {
    if (typeof FillMode !== "undefined" && FillMode != "Brush") {
      activeBox.classList.add("active");
    }
  }

  const overlay = ensureBrushOverlay();
  if (overlay) {
    overlay.classList.remove("active");
    overlay.style.display = "none";
  }

  if (
    typeof FillMode !== "undefined" &&
    FillMode === "Brush" &&
    window.BrushState &&
    typeof window.BrushState.getBrushSize === "function" &&
    typeof pixelLength === "number" &&
    typeof pixelHeight === "number"
  ) {
    const brushSize = window.BrushState.getBrushSize();
    const baseRow = Math.floor(currentPixel / pixelLength);
    const baseCol = currentPixel % pixelLength;
    const startRow = baseRow - Math.floor((brushSize - 1) / 2);
    const startCol = baseCol - Math.floor((brushSize - 1) / 2);

    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -Infinity;
    let maxCol = -Infinity;

    for (let rowOffset = 0; rowOffset < brushSize; rowOffset++) {
      for (let colOffset = 0; colOffset < brushSize; colOffset++) {
        const targetRow = startRow + rowOffset;
        const targetCol = startCol + colOffset;
        if (
          targetRow < 0 ||
          targetRow >= pixelHeight ||
          targetCol < 0 ||
          targetCol >= pixelLength
        ) {
          continue;
        }
        const targetIndex = targetRow * pixelLength + targetCol;
        const targetPixel = document.getElementById("pixel-" + targetIndex);
        if (!targetPixel) {
          continue;
        }
        minRow = Math.min(minRow, targetRow);
        minCol = Math.min(minCol, targetCol);
        maxRow = Math.max(maxRow, targetRow);
        maxCol = Math.max(maxCol, targetCol);
      }
    }

    if (
      overlay &&
      minRow !== Infinity &&
      minCol !== Infinity &&
      maxRow !== -Infinity &&
      maxCol !== -Infinity
    ) {
      const topLeftIndex = minRow * pixelLength + minCol;
      const bottomRightIndex = maxRow * pixelLength + maxCol;
      const topLeftPixel = document.getElementById("pixel-" + topLeftIndex);
      const bottomRightPixel = document.getElementById(
        "pixel-" + bottomRightIndex
      );
      if (topLeftPixel && bottomRightPixel) {
        const left = topLeftPixel.offsetLeft;
        const top = topLeftPixel.offsetTop;
        const right =
          bottomRightPixel.offsetLeft + bottomRightPixel.offsetWidth;
        const bottom =
          bottomRightPixel.offsetTop + bottomRightPixel.offsetHeight;

        overlay.style.left = `${left}px`;
        overlay.style.top = `${top}px`;
        overlay.style.width = `${Math.max(0, right - left)}px`;
        overlay.style.height = `${Math.max(0, bottom - top)}px`;
        overlay.style.display = "block";
        overlay.classList.add("active");
      }
    }
  }

  ContentWindow();
  return;
}

function NavigateGrid(Movement) {
  updatePixel();
  if (Movement == Button1) {
    console.log("Left Arrow Clicked");
    console.log(currentPixel);
    currentPixel = Math.max(0, currentPixel - 1);
    console.log("new current pixel " + currentPixel);
    updatePixel();
    Button1.removeEventListener("click", () => {});
  }
  if (Movement == Button2) {
    console.log("Up Arrow Clicked");
    console.log(currentPixel);
    if (currentPixel < pixelLength) {
      currentPixel = currentPixel;
    } else {
      currentPixel = Math.max(0, currentPixel - pixelLength);
    }
    console.log("new current pixel " + currentPixel);
    updatePixel();
  }
  if (Movement == Button3) {
    console.log("Down Arrow Clicked");
    console.log(currentPixel);
    if (currentPixel > pixelHeight * pixelLength - pixelLength - 1) {
      currentPixel = currentPixel;
    } else {
      currentPixel = Math.min(
        pixelLength * pixelHeight - 1,
        currentPixel + pixelLength
      );
    }
    console.log("new current pixel " + currentPixel);
    updatePixel();
  }
  if (Movement == Button4) {
    console.log("Right Arrow Clicked");
    console.log(currentPixel);
    currentPixel = Math.min(pixelLength * pixelHeight - 1, currentPixel + 1);
    console.log("new current pixel " + currentPixel);
    updatePixel();
  }
  return;
}
