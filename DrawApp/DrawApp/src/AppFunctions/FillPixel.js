function FillPixel(color, Letter) {
  const activeBox = document.getElementById("pixel-" + currentPixel);
  const PreviewBox = document.getElementById("CurrentSelectionContainer");
  if (FillMode == "Circle") {
    activeBox.innerHTML = `<div class="Pixelcircle"></div>`;
  }
  if (FillMode == "Letter") {
    activeBox.innerHTML = `<div class="PixelLetter">${Letter}</div>`;
  }
  if (color == "transparent") {
    activeBox.innerHTML = "";
  }
  activeBox.style.backgroundColor =
    getComputedStyle(PreviewBox).backgroundColor;
  return;
}
