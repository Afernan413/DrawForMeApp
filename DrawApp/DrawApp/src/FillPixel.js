function FillPixel() {
  const activeBox = document.getElementById("pixel-" + currentPixel);
  if (activeBox) {
    activeBox.style.backgroundColor = color;
  }
}
