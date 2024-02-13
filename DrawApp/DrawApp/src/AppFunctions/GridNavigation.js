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
  const canvas = document.getElementById("CanvasContainer").outerHTML;
  require("electron").ipcRenderer.send("canvas-update", canvas);
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
