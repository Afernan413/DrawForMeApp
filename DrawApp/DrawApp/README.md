# DrawApp Change Log

This document tracks feature additions and implementation details as they roll into the project.

## October 2025 – Brush System Enhancements

- Added a shared `BrushState` module (`src/AppFunctions/BrushState.js`) that centralizes brush size and opacity, exposes reset helpers, and clamps values.
- Wired brush controls through the renderer so `refreshBrushUI()` keeps the preview square and stats text in sync after any adjustment.
- Introduced solid-brush square footprint logic across `FillPixel` and `GridNavigation`, ensuring even-sized brushes (2×2, 4×4, etc.) paint and preview accurately around the active pixel.
- Updated UI elements (`index.html`, `styles/index.css`) to add a brush preview square, stats panel, and square outline styling that matches the active pixel border.
- Cleaned up button flows (`SetButtons.js`) to expose a brush menu for size/opacity tweaks while keeping color tools focused on brush operations.
- Cleaned up the active pixel outline
- Text is now typed without effecting pixel color and different opacity fills will not effect letters/shapes
  > TODO
  - Choose background color
    - have it so you can pick a color and then it makes the entire background that  color for the piece you're working on
  - MS Paint "Fill" effect aka the old "bucket" effect
    - a color is filled in within a shape, AKA if you make a square, it will fill in the square
  - Undo button
    - when I made a mistake, I would have to reapply the color. I was thinking it might be easier to have an Undo button that's easy to access
  - Make line
    - set two points of a line and it fills in the line with a specified color
  - Type bigger on the buttons
    - the on screen buttons are small, it's too small
 
## UI flow update (Oct 21, 2025)

- The "More" -> "Change Brush" flow was simplified into a single top-level Change Brush menu with these entries: Change Color, Change Size, Change Opacity, Standard, Eraser, Go Back.
- "Change Opacity" now opens the dedicated opacity controls (Increase/Decrease/Reset) via the Brush Strength screen.
- "Standard" resets brush size and opacity to defaults and returns the user to the main navigation (instead of opening the brush menu).

This change removes the previous redundant ChangeColorFromChangeBrush path and unifies the palette/brush behavior.

## Background Color & Eraser Enhancements (Oct 23, 2025)

- Added background color memory to `BrushState` and applied it during canvas resets/initialization so sessions remember the selected background.
- Implemented a "Change Background" flow under the More menu: palette picks now drill into dedicated background selections before applying across untouched pixels.
- Updated the eraser to sync with the background color, display a custom icon in the brush preview, and hide the opacity readout in the stats panel when active.
- While erasing, opacity controls are disabled and hidden across button flows (Change Brush, Brush Menu, Select Color More, Brush Strength) to avoid confusing state changes.
- Persisted the chosen background in the canvas HTML (`data-background-color` attribute) so saved projects reopen with the exact background instead of resetting to white.

## Shape & Line Tools (Oct 23, 2025)

- Added a dedicated Shape Tools menu (square, circle, line) under Change Fill; each tool now asks for a color before activation and sets the global fill mode (`Square Tool`, `Circle Tool`, `Line Tool`).
- Square and circle tools wrap the current pixel in a scalable outline that respects brush size, blends using brush opacity, and automatically restores the interior to the canvas background color.
- Line tool collects two Fill presses to draw a Bresenham line between the chosen pixels, highlights the starting point, and reports its status in the brush stats panel.
- Change Brush now adapts per tool: square/circle expose color, size, and opacity adjustments without eraser; line offers color and opacity only.

## Bucket-fill / Flood Fill Fix (Oct 24, 2025)

- Fixed a potential infinite-loop / excessive-queue issue in the bucket-fill implementation (`src/AppFunctions/FillPixel.js` → `applyBucketTool`). The old implementation re-enqueued neighbor pixels based on raw string comparisons and did not track visited pixels which could lead to repeated processing (and apparent infinite loops) in some brush/opacity combinations.
- What changed:
  - Color normalization: comparisons now use a canonical RGBA numeric string (via `tinycolor`) so `rgb(...)` vs `rgba(..., 1)` format differences don't break equality checks.
  - Visited tracking: the algorithm now uses a queue of pixel indices plus a `visited` Set so each pixel is enqueued at most once (prevents redundant duplicates and cycles).
  - Strength respected: the bucket-fill now passes brush strength into the pixel write operation so blended writes are applied consistently during the fill.
  - Safety cap: a conservative iteration cap is in place during debugging to avoid locking the renderer; this can be tuned or removed once validated.
- Why this helps: marking visited avoids exponential duplicate enqueueing; normalizing colors avoids brittle string-equals; and passing strength prevents no-op writes that would otherwise leave pixels equal to the start color and allow re-enqueueing.
- Files touched: `src/AppFunctions/FillPixel.js` (implemented robust flood-fill), small logging and safety checks added for diagnostics.

If you hit the bucket-fill in the wild and still see unexpected behavior, enable the DevTools console and look for `applyBucketTool` debug messages which will indicate repeated indices, blended color results, or if the iteration cap was reached. We can follow up with a tolerance-based color match (color-distance) if you prefer fills to treat visually similar colors as equivalent.

## Small UI polish & usability tweaks (Oct 25, 2025)

- Current Page label: a compact `CurrentPageLabel` paragraph was added above the primary button deck (`index.html`) and is updated by the renderer. It displays a short, human-friendly page name (Canvas-mode prefix removed) so users can quickly confirm where they are in the navigation flow.
- Filename truncation: the FileStatus display now truncates overly long project names to the first 20 characters followed by `...` (implemented in `src/AppFunctions/GetProjects.js` via `setFileStatusDisplay`). The internal `FileName` variable is preserved for I/O; only the displayed label is shortened to avoid visual overflow.
- Context-aware buttons: `SetButtons.js` was made slightly smarter about tool contexts — the More menu may show `Edit <ToolName>` when a shape/brush tool is active, Change Brush hides or shows the opacity/eraser controls depending on the current tool or transparent-selection state, and Brush Menu similarly adapts for line/shape tools. This reduces confusing or invalid button choices.

These tweaks are intentionally lightweight and non-invasive; they aim to reduce UI clutter and make navigation clearer without changing core behavior. If you prefer the page label to be event-driven (updated only when pages change) rather than polled, we can wire `setCurrentPageLabel()` calls into `SetButtons.js` setters instead.