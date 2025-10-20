let currentPixel = 0;
let Navigating = false;
function updatePixel() {
  const allPixels = document.querySelectorAll(".pixelCanvas");
  allPixels.forEach((pixel) => {
    pixel.classList.remove("active");
    pixel.classList.remove("brush-preview");
  });

  const activeBox = document.getElementById("pixel-" + currentPixel);
  if (activeBox) {
    activeBox.classList.add("active");
  }

  if (
    typeof FillMode !== "undefined" &&
    FillMode === "Solid" &&
    window.BrushState &&
    typeof window.BrushState.getBrushSize === "function" &&
    typeof pixelLength === "number" &&
    typeof pixelHeight === "number"
  ) {
    const brushSize = window.BrushState.getBrushSize();
    const brushStrength = window.BrushState.getBrushStrength
      ? window.BrushState.getBrushStrength()
      : 1;
    const baseRow = Math.floor(currentPixel / pixelLength);
    const baseCol = currentPixel % pixelLength;
    const startRow = baseRow - Math.floor((brushSize - 1) / 2);
    const startCol = baseCol - Math.floor((brushSize - 1) / 2);

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
        targetPixel.classList.add("brush-preview");
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
