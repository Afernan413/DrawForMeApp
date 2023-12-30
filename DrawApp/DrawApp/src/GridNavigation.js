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
  return;
}

function NavigateGrid() {
  updatePixel();
  Button1.addEventListener("click", () => {
    if (Button1.getAttribute("arrow") == "LeftArrow") {
      console.log("Left Arrow Clicked");
      console.log(currentPixel);
      currentPixel = Math.max(0, currentPixel - 1);
      console.log("new current pixel " + currentPixel);
      updatePixel();
      return;
    }
  });
  Button2.addEventListener("click", () => {
    if (Button2.getAttribute("arrow") == "UpArrow") {
      console.log("Up Arrow Clicked");
      console.log(currentPixel);
      if (currentPixel < pixelLength) {
        currentPixel = currentPixel;
      } else {
        currentPixel = Math.max(0, currentPixel - pixelLength);
      }
      console.log("new current pixel " + currentPixel);
      updatePixel();
      return;
    }
  });
  Button3.addEventListener("click", () => {
    if (Button3.getAttribute("arrow") == "DownArrow") {
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
      return;
    }
  });
  Button4.addEventListener("click", () => {
    if (Button4.getAttribute("arrow") == "RightArrow") {
      console.log("Right Arrow Clicked");
      console.log(currentPixel);
      currentPixel = Math.min(pixelLength * pixelHeight - 1, currentPixel + 1);
      console.log("new current pixel " + currentPixel);
      updatePixel();
      return;
    }
    return;
  });
}
