var brushState = window.BrushState || require("./BrushState");
window.BrushState = brushState;
var tinycolor = window.tinycolor || require("tinycolor2");

const SQUARE_TOOL_MODE = "Square Tool";
const CIRCLE_TOOL_MODE = "Circle Tool";
const LINE_TOOL_MODE = "Line Tool";

let lineToolStartPixel = null;

function getBrushSizeValue() {
  return brushState && typeof brushState.getBrushSize === "function"
    ? brushState.getBrushSize()
    : 1;
}

function getBrushStrengthValue() {
  return brushState && typeof brushState.getBrushStrength === "function"
    ? brushState.getBrushStrength()
    : 1;
}

function getBackgroundColorValue() {
  const fallback =
    brushState && brushState.DEFAULT_BACKGROUND_COLOR
      ? brushState.DEFAULT_BACKGROUND_COLOR
      : "#FFFFFF";
  if (
    brushState &&
    typeof brushState.getBackgroundColor === "function"
  ) {
    return brushState.getBackgroundColor() || fallback;
  }
  return fallback;
}

function toDisplayColor(colorValue) {
  if (!colorValue) {
    return colorValue;
  }
  try {
    const parsed = tinycolor(colorValue);
    if (parsed.isValid()) {
      return parsed.toRgbString();
    }
  } catch (error) {
    // fall through to return raw value
  }
  return colorValue;
}

function applyColorToPixel(pixelIndex, paintColor, strength) {
  const targetBox = document.getElementById("pixel-" + pixelIndex);
  if (!targetBox) {
    return;
  }
  if (paintColor === "transparent") {
    targetBox.innerHTML = "";
    targetBox.style.backgroundColor = "";
    return;
  }
  targetBox.innerHTML = "";
  const existingColor = getComputedStyle(targetBox).backgroundColor;
  const blended = blendColors(existingColor, paintColor, strength);
  targetBox.style.backgroundColor = blended;
}

function fillPixelWithBackground(pixelIndex, backgroundColor) {
  const targetBox = document.getElementById("pixel-" + pixelIndex);
  if (!targetBox) {
    return;
  }
  targetBox.innerHTML = "";
  targetBox.style.backgroundColor = toDisplayColor(backgroundColor);
}

function clampCanvasBounds(row, col) {
  if (
    typeof pixelLength !== "number" ||
    typeof pixelHeight !== "number"
  ) {
    return false;
  }
  return row >= 0 && row < pixelHeight && col >= 0 && col < pixelLength;
}

function getPixelIndex(row, col) {
  return row * pixelLength + col;
}

function markLineStart(pixelIndex) {
  clearLineStartHighlight();
  const startPixel = document.getElementById("pixel-" + pixelIndex);
  if (startPixel) {
    startPixel.classList.add("line-start");
  }
}

function clearLineStartHighlight() {
  if (lineToolStartPixel === null) {
    return;
  }
  const startPixel = document.getElementById("pixel-" + lineToolStartPixel);
  if (startPixel) {
    startPixel.classList.remove("line-start");
  }
}

function resetLineToolProgress(shouldRefresh = true) {
  clearLineStartHighlight();
  lineToolStartPixel = null;
  if (shouldRefresh && typeof window.refreshBrushUI === "function") {
    window.refreshBrushUI();
  }
}

function getEffectiveShapeBrushSize(mode) {
  const rawSize = Math.max(1, getBrushSizeValue());
  if (typeof window.getEffectiveBrushSizeForMode === "function") {
    return window.getEffectiveBrushSizeForMode(mode, rawSize);
  }
  const maxSize =
    brushState && typeof brushState.MAX_BRUSH_SIZE === "number"
      ? brushState.MAX_BRUSH_SIZE
      : 10;
  const minSize = 3;
  let adjusted = Math.max(rawSize, minSize);
  if (adjusted % 2 === 0) {
    if (adjusted + 1 <= maxSize) {
      adjusted += 1;
    } else if (adjusted - 1 >= minSize) {
      adjusted -= 1;
    }
  }
  return Math.max(minSize, Math.min(adjusted, maxSize));
}

function applySquareTool(paintColor) {
  const brushSize = getEffectiveShapeBrushSize(SQUARE_TOOL_MODE);
  const strength = getBrushStrengthValue();
  const backgroundColor = getBackgroundColorValue();
  const baseRow = Math.floor(currentPixel / pixelLength);
  const baseCol = currentPixel % pixelLength;
  const offset = Math.floor((brushSize - 1) / 2);
  const startRow = baseRow - offset;
  const startCol = baseCol - offset;

  for (let rowOffset = 0; rowOffset < brushSize; rowOffset++) {
    for (let colOffset = 0; colOffset < brushSize; colOffset++) {
      const targetRow = startRow + rowOffset;
      const targetCol = startCol + colOffset;
      if (!clampCanvasBounds(targetRow, targetCol)) {
        continue;
      }
      const targetIndex = getPixelIndex(targetRow, targetCol);
      const isBorder =
        brushSize === 1 ||
        rowOffset === 0 ||
        rowOffset === brushSize - 1 ||
        colOffset === 0 ||
        colOffset === brushSize - 1;
      if (isBorder) {
        applyColorToPixel(targetIndex, paintColor, strength);
      } else {
        fillPixelWithBackground(targetIndex, backgroundColor);
      }
    }
  }
}

function applyCircleTool(paintColor) {
  const brushSize = getEffectiveShapeBrushSize(CIRCLE_TOOL_MODE);
  const strength = getBrushStrengthValue();
  const backgroundColor = getBackgroundColorValue();
  const baseRow = Math.floor(currentPixel / pixelLength);
  const baseCol = currentPixel % pixelLength;
  const radius = (brushSize - 1) / 2;
  const startRow = baseRow - Math.floor((brushSize - 1) / 2);
  const startCol = baseCol - Math.floor((brushSize - 1) / 2);
  const innerRadius = Math.max(radius - 0.5, 0);
  const outerRadius = radius + 0.5;
  const innerSquared = innerRadius * innerRadius;
  const outerSquared = outerRadius * outerRadius;

  for (let rowOffset = 0; rowOffset < brushSize; rowOffset++) {
    for (let colOffset = 0; colOffset < brushSize; colOffset++) {
      const targetRow = startRow + rowOffset;
      const targetCol = startCol + colOffset;
      if (!clampCanvasBounds(targetRow, targetCol)) {
        continue;
      }
      const targetIndex = getPixelIndex(targetRow, targetCol);
      const dy = targetRow - baseRow;
      const dx = targetCol - baseCol;
      const distanceSquared = dx * dx + dy * dy;
      const isBorder =
        brushSize === 1 ||
        (distanceSquared >= innerSquared && distanceSquared <= outerSquared);
      if (isBorder) {
        applyColorToPixel(targetIndex, paintColor, strength);
      } else if (distanceSquared < innerSquared) {
        fillPixelWithBackground(targetIndex, backgroundColor);
      }
    }
  }
}

function plotLinePoint(row, col, paintColor, strength) {
  if (!clampCanvasBounds(row, col)) {
    return;
  }
  const targetIndex = getPixelIndex(row, col);
  applyColorToPixel(targetIndex, paintColor, strength);
}

function applyLineTool(paintColor) {
  if (lineToolStartPixel === null) {
    lineToolStartPixel = currentPixel;
    markLineStart(lineToolStartPixel);
    if (typeof window.refreshBrushUI === "function") {
      window.refreshBrushUI();
    }
    return;
  }

  const strength = getBrushStrengthValue();
  const startRow = Math.floor(lineToolStartPixel / pixelLength);
  const startCol = lineToolStartPixel % pixelLength;
  const endRow = Math.floor(currentPixel / pixelLength);
  const endCol = currentPixel % pixelLength;

  let x0 = startCol;
  let y0 = startRow;
  const x1 = endCol;
  const y1 = endRow;

  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    plotLinePoint(y0, x0, paintColor, strength);
    if (x0 === x1 && y0 === y1) {
      break;
    }
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }

  resetLineToolProgress();
}

window.getLineToolStartPixel = function () {
  return lineToolStartPixel;
};

window.clearLineToolProgress = function (options = {}) {
  const shouldRefresh =
    typeof options.refresh === "boolean" ? options.refresh : true;
  resetLineToolProgress(shouldRefresh);
};

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
  const paintColor = selectedColor || color;

  if (FillMode === SQUARE_TOOL_MODE) {
    applySquareTool(paintColor);
    ContentWindow();
    return;
  }

  if (FillMode === CIRCLE_TOOL_MODE) {
    applyCircleTool(paintColor);
    ContentWindow();
    return;
  }

  if (FillMode === LINE_TOOL_MODE) {
    applyLineTool(paintColor);
    ContentWindow();
    return;
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
