# DrawApp (ArtByAbey)

DrawApp is a lightweight pixel-drawing desktop application built with Electron. It provides a tactile, button-driven UI for creating pixel art, shapes, and simple letter/character fills, with tools tailored for use on touchscreens or kiosk-style controllers.

Below is a short project overview, quick start, and a summary of important implementation details. A longer change log follows below for historical reference.

## Quick Links

- Source: `src/`
- Main process: `src/index.js`
- Renderer: `src/renderer.js`
- App functions: `src/AppFunctions/` (BrushState, FillPixel, History, SetButtons, SetCanvas, etc.)
- Styles: `styles/index.css`

## Highlights / Features (summary)

- Multi-monitor friendly startup (main window focused; optional fullscreen content window on secondary monitor)
- Centralized brush model (`BrushState`) and live brush preview
- Shape tools (Square, Circle, Line) with discrete shape sizes (Small/Medium/Large/XL)
- Robust bucket-fill implementation with visited-tracking and normalized color checks
- Improved background handling that updates text-containing pixels correctly
- Debounced History/Undo so multi-pixel operations are recorded as single actions
- Print styles that hide interactive outlines for clean printed output

---

## What's New

This section summarizes the main user-facing changes in plain language so you can quickly understand what's different and how it affects your workflow.

- **Multi-monitor behavior:** The main app window now opens focused on your primary display. If you have a second monitor, the app can open a fullscreen content view on that second display (useful for presentations or kiosk setups). If you only have one monitor, nothing extra will open.

- **Simpler shape sizes:** The Square and Circle tools now use four labelled sizes: Small, Medium, Large, and XL. Instead of many numeric sizes, you can pick one of these four for predictable results.

- **Background changes are smarter:** When you change the canvas background color, the app will correctly update pixels that include typed text or characters so your canvas remains visually consistent.

- **More reliable bucket-fill:** The fill (bucket) tool has been improved so it completes fills more reliably and avoids rare cases where it would hang or repeat work.

- **Undo/Redo added:** There is a basic undo/redo system so big actions (like drawing a shape, filling an area, or a long brush stroke) are treated as a single step when undone. If you don't see an Undo button where you expect it, tell me and I can add or wire it to a shortcut.

- **Print-friendly output:** When you print your artwork, the active pixel highlight is suppressed so printed images look clean without the editing outlines.

- **UI polish:** The brush preview and brush stats have been improved for clarity, and the brush menu/flows were simplified so common actions are easier to find.

If you'd like, I can also:

- Add a short in-app help screen that calls out these changes.
- Wire Undo to a specific on-screen button or keyboard shortcut (Ctrl+Z/Ctrl+Y).

For developers and power users, technical details are still available in the `src/` folder (see the Quick Links at the top of this README).

---

_If you prefer the old detailed changelog kept in this README, I can restore it to a separate `CHANGELOG.md` file instead._
