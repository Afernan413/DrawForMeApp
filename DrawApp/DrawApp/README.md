# ArtByAbey

## Overview
ArtByAbey is a dual-window Electron drawing experience designed for classrooms and workshops. The primary window hosts the editing controls, while a mirrored projection window displays the canvas at scale for observers. Users can author pixel-based artwork, save projects to disk, reopen prior sessions, and export creations to physical printers or PDF.

## Application Flow
1. Launching the app creates two windows: the control surface and the mirrored display.
2. From the home view, choose to start a new canvas (portrait, landscape, or square) or reopen a saved project.
3. Navigation buttons drive the pixel cursor, fill tools, palette selection, and save/print actions.
4. Canvas updates immediately sync to the projection window via IPC so collaborators always see the latest state.

## Project Layout
```
DrawApp/
├── forge.config.js          # Electron Forge configuration
├── package.json             # Scripts, dependencies, product metadata
├── src/
│   ├── index.js             # Main process entry (window lifecycle, IPC)
│   ├── preload.js           # Reserved for future isolated preload logic
│   ├── index.html           # Primary renderer markup
│   ├── ContentScreen.html   # Secondary display markup
│   ├── renderer.js          # UI logic, button routing, state transitions
│   └── AppFunctions/        # Feature-specific helpers (grid, printing, etc.)
└── styles/
    └── index.css            # Shared styling for both windows
```

## Requirements
- Node.js 18+
- npm 9+
- macOS, Windows, or Linux with printer access for hardware output (optional)

## Development Workflow
```bash
npm install         # install dependencies
npm start           # launch with Electron Forge (hot reload in dev builds)
```

### Troubleshooting in Development
- Ensure only one instance of the app runs at a time; closing all windows exits Electron.
- If the projection window appears on the primary display, drag it to a secondary monitor and Electron will remember the bounds for that session.
- The project and artwork folders are created under `~/ArtByAbey/Projects` and `~/ArtByAbey/Artworks` respectively.

## Distribution Builds
Electron Forge and Electron Builder are both configured. Pick one distribution path:

### Using Electron Forge Makers
```bash
npm run make
```
Outputs platform-specific installers/archives under `out/` (macOS `.zip`, Windows `.squirrel`, Linux `.deb/.rpm`).

### Using Electron Builder
```bash
npm run app:dist
```
Packages the app with Electron Builder, honoring the `productName` declared in `package.json`.

### Windows Store-Style Folder (Development)
```bash
npm run package-win
```
Produces a portable Windows build inside `release-builds/`.

## Key Modules
- **Main Process (`src/index.js`)**: Manages the control and projection windows, synchronizes IPC, and guards dev tooling. The window menu is removed by default for a clean kiosk experience.
- **Renderer (`src/renderer.js`)**: Central orchestrator for button clicks, palette management, navigation, and canvas updates. All auxiliary helpers live under `src/AppFunctions/`.
- **Storage (`GetProjects.js`)**: Handles serialization of canvas HTML, filename sanitization, and refreshes the project list live after saves.
- **Printing (`Printing.js`)**: Lists available printers, lets users navigate via hardware buttons, and supports PDF export with sanitized filenames.
- **Grid (`SetCanvas.js`, `GridNavigation.js`, `FillPixel.js`)**: Builds the pixel matrix and applies fills based on the active mode (solid, circle, letter/symbol).

## Data & Persistence
- Projects save as HTML fragments inside `~/ArtByAbey/Projects`.
- PDF exports land in `~/ArtByAbey/Artworks`.
- Filenames are sanitized automatically to avoid invalid filesystem characters.

## Future Enhancements
1. Migrate the renderer to a fully isolated `contextBridge` preload to disable `nodeIntegration` for tighter security.
2. Introduce automated tests (e.g., Spectron or Playwright) covering navigation, save/load cycles, and printing fallbacks.
3. Extract the button routing logic in `renderer.js` into a state machine module to simplify future feature additions.
4. Support configurable palettes and canvas presets via a JSON config file for easier customization.
5. Add telemetry-free logging with log levels gated behind an environment flag instead of `console.log` statements.

## Support & Maintenance
- Reinstall dependencies after pulling updates that modify `package.json`: `rm -rf node_modules && npm install`.
- When shipping new art assets (icons, fonts), place them under `assets/` and reference them relatively from the renderer.
- Keep Electron and Forge versions aligned (`npm outdated`) before preparing new platform releases.
