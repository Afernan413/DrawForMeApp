let currentPixel = 0;
let Navigating = false;
function updatePixel() {
  document.querySelectorAll(".pixelCanvas").forEach((pixel) => {
    pixel.classList.remove("active");
  });

  const activeBox = document.getElementById("pixel-" + currentPixel);
  if (activeBox) {
    activeBox.classList.add("active");
  }
  ContentWindow();
  return;
}

function NavigateGrid(Movement) {
  updatePixel();
  if (Movement == Button1) {
    currentPixel = Math.max(0, currentPixel - 1);
    updatePixel();
  }
  if (Movement == Button2) {
    if (currentPixel < pixelLength) {
      currentPixel = currentPixel;
    } else {
      currentPixel = Math.max(0, currentPixel - pixelLength);
    }
    updatePixel();
  }
  if (Movement == Button3) {
    if (currentPixel > pixelHeight * pixelLength - pixelLength - 1) {
      currentPixel = currentPixel;
    } else {
      currentPixel = Math.min(
        pixelLength * pixelHeight - 1,
        currentPixel + pixelLength
      );
    }
    updatePixel();
  }
  if (Movement == Button4) {
    currentPixel = Math.min(pixelLength * pixelHeight - 1, currentPixel + 1);
    updatePixel();
  }
  return;
}
