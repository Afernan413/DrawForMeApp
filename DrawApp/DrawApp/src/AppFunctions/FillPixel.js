var brushState = window.BrushState || require("./BrushState");
window.BrushState = brushState;
var tinycolor = window.tinycolor || require("tinycolor2");

function blendColors(baseColor, overlayColor, overlayOpacity) {  
  const base = tinycolor(baseColor).toRgb();
  const overlay = tinycolor(overlayColor).toRgb();
  const alpha = Math.max(0, Math.min(1, overlayOpacity));
  const baseAlpha = base.a;
  const outAlpha = alpha + baseAlpha * (1 - alpha);

  if (outAlpha === 0) {
    return "rgba(0, 0, 0, 0)";
  }

  const r = (overlay.r * alpha + base.r * baseAlpha * (1 - alpha)) / outAlpha;
  const g = (overlay.g * alpha + base.g * baseAlpha * (1 - alpha)) / outAlpha;
  const b = (overlay.b * alpha + base.b * baseAlpha * (1 - alpha)) / outAlpha;

  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(
    outAlpha.toFixed(2)
  )})`;
}

function applySolidBrush(color, selectedColor) {
  const brushSize = brushState.getBrushSize ? brushState.getBrushSize() : 1;
  const brushStrength = brushState.getBrushStrength
    ? brushState.getBrushStrength()
    : 1;
  const currentRow = Math.floor(currentPixel / pixelLength);
  const currentCol = currentPixel % pixelLength;
  const startRow = currentRow - Math.floor((brushSize - 1) / 2);
  const startCol = currentCol - Math.floor((brushSize - 1) / 2);

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
      const targetBox = document.getElementById("pixel-" + targetIndex);

      if (!targetBox) {
        continue;
      }

      if (color == "transparent") {
        targetBox.innerHTML = "";
        targetBox.style.backgroundColor = "";
        continue;
      }

      targetBox.innerHTML = "";
      const existingColor = getComputedStyle(targetBox).backgroundColor;
      const blended = blendColors(existingColor, selectedColor, brushStrength);
      targetBox.style.backgroundColor = blended;
    }
  }
}

function FillPixel(color, Letter) {
  if (
    CurrentPage == CanvasMode + "SetCustomNameLetters" ||
    CurrentPage == CanvasMode + "SetCustomNameLettersMore"
  ) {
    document.getElementById("CustomFileNameBar").innerHTML += Letter;
    return;
  }
  const PreviewBox = document.getElementById("CurrentSelectionContainer");
  const activeBox = document.getElementById("pixel-" + currentPixel);
  const selectedColor = PreviewBox.style.getPropertyValue("--backgroundColor");

  if (FillMode == "Circle") {
    activeBox.innerHTML = `<div class="Pixelcircle"></div>`;
  }
  if (FillMode == "Letter") {
    if (Shift == true) {
      Shift = false;
    }

    activeBox.innerHTML = `<div class="PixelLetter">${Letter}</div>`;
    if (currentPixel !== document.querySelectorAll(".pixelCanvas").length - 1) {
      currentPixel++;
      updatePixel();
    }
  }
  if (FillMode == "Solid") {
    applySolidBrush(color, selectedColor);
  } else {
    if (color == "transparent") {
      activeBox.innerHTML = "";
      activeBox.style.backgroundColor = "";
    }
  }
  ContentWindow();
  return;
}
