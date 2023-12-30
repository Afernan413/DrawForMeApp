let currentPixel = 0;

function updatePixel() {
  document.querySelectorAll(".pixelCanvas").forEach((pixel) => {
    pixel.classList.remove("active");
  });

  const activeBox = document.getElementById("pixel-" + currentPixel);
  if (activeBox) {
    activeBox.classList.add("active");
  }
}

function NavigateGrid() {
  updatePixel();
  Button1.addEventListener("click", () => {
    console.log("Left Arrow Clicked");
    console.log(currentPixel);
    currentPixel = Math.max(0, currentPixel - 1);
    console.log("new current pixel " + currentPixel);
    updatePixel();
  });
  Button2.addEventListener("click", () => {
    console.log("Up Arrow Clicked");
    console.log(currentPixel);
    if (currentPixel < pixelLength) {
      currentPixel = currentPixel;
    } else {
      currentPixel = Math.max(0, currentPixel - pixelLength);
    }
    console.log("new current pixel " + currentPixel);
    updatePixel();
  });
  Button3.addEventListener("click", () => {
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
  });
  Button4.addEventListener("click", () => {
    console.log("Right Arrow Clicked");
    console.log(currentPixel);
    currentPixel = Math.min(pixelLength * pixelHeight - 1, currentPixel + 1);
    console.log("new current pixel " + currentPixel);
    updatePixel();
  });
}
