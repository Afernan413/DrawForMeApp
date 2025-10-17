const path = require("path");
const fs = require("fs");
const { app } = require("@electron/remote");
const swal = require("sweetalert");

const projectsDirectory = path.join(app.getPath("home"), "ArtByAbey", "Projects");

fs.mkdirSync(projectsDirectory, { recursive: true });

let projects = [];
let currentFile = 1;
let FileName;

function getProjectFilePath(name) {
  return path.join(projectsDirectory, `${name}.json`);
}

function normalizeDisplayPath(directoryPath) {
  return path.normalize(directoryPath);
}

function sanitizeFileName(name) {
  if (!name) {
    return "";
  }
  return name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").trim();
}

function refreshProjectCache() {
  projects = fs
    .readdirSync(projectsDirectory, { withFileTypes: false })
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -5))
    .sort((a, b) => a.localeCompare(b));

  if (projects.length === 0) {
    currentFile = 1;
  } else if (currentFile > projects.length) {
    currentFile = projects.length;
  } else if (currentFile < 1) {
    currentFile = 1;
  }
}

function renderProjectList() {
  const fileList = document.getElementById("FileList");
  if (!fileList) {
    return;
  }

  fileList.innerHTML = "";
  projects.forEach((project, index) => {
    const listItem = document.createElement("div");
    listItem.className = "File";
    listItem.id = `file-${index + 1}`;
    listItem.textContent = project;
    fileList.appendChild(listItem);
  });

  updateFileSelection();
}

function GetProjects() {
  refreshProjectCache();

  const fileSelection = document.getElementById("FileSelection");
  if (fileSelection) {
    fileSelection.hidden = false;
  }

  const pathLocation = document.getElementById("PathLocation");
  if (pathLocation) {
    pathLocation.textContent = `File Path: ${normalizeDisplayPath(projectsDirectory)}`;
  }

  renderProjectList();
  setFileLookupButtons();
}

function updateFileSelection() {
  document.querySelectorAll("div.File").forEach((file) => {
    file.classList.remove("active");
  });

  const activeFile = document.getElementById(`file-${currentFile}`);
  if (activeFile) {
    activeFile.classList.add("active");
    activeFile.scrollIntoView({ block: "nearest" });
  }
}

function moveSelection(step) {
  if (!projects.length) {
    return;
  }

  currentFile = Math.min(Math.max(currentFile + step, 1), projects.length);
  updateFileSelection();
}

function navigateFileList(Movement) {
  if (Movement === Button1) {
    moveSelection(1);
  } else if (Movement === Button2) {
    moveSelection(4);
  } else if (Movement === Button3) {
    moveSelection(-1);
  } else if (Movement === Button4) {
    moveSelection(-4);
  }
}

function selectFile() {
  const activeFile = document.getElementById(`file-${currentFile}`);
  if (!activeFile) {
    return;
  }

  FileName = activeFile.textContent;
  const filePath = getProjectFilePath(FileName);
  if (!fs.existsSync(filePath)) {
    swal("The selected file could not be found. Please refresh your projects.", {
      buttons: false,
      timer: 2500,
    });
    refreshProjectCache();
    renderProjectList();
    return;
  }

  const selectedFile = fs.readFileSync(filePath, "utf8");
  const fileSelection = document.getElementById("FileSelection");
  if (fileSelection) {
    fileSelection.hidden = true;
  }

  if (selectedFile.includes("Portrait")) {
    CanvasMode = "Portrait";
  } else if (selectedFile.includes("Landscape")) {
    CanvasMode = "Landscape";
  } else {
    CanvasMode = "Square";
  }

  CurrentPage = CanvasMode + "InitialColorFile";
  window[CanvasMode.toString() + "Mode"]();

  const statusContainer = document.getElementById("FileStatusContainer");
  if (statusContainer) {
    statusContainer.textContent = `'${FileName}'`;
  }

  GridContainer.outerHTML = selectedFile;
  GridContainer = document.querySelector("#CanvasContainer");
  updatePixel();
  document.getElementById("PrimaryButtons_1").disabled = false;
}

function saveFile(mode) {
  const canvasElement = document.getElementById("CanvasContainer");
  if (!canvasElement) {
    return;
  }

  const fileContent = canvasElement.outerHTML.toString();

  if (mode === "setCurrent") {
    if (!FileName) {
      saveFile("setDefault");
      return;
    }

    fs.writeFileSync(getProjectFilePath(FileName), fileContent);
    document.getElementById("PrimaryButtons_1").disabled = false;
    swal(`File saved in ${normalizeDisplayPath(projectsDirectory)}`, {
      buttons: false,
      timer: 2500,
    });
    refreshProjectCache();
    currentFile = projects.indexOf(FileName) + 1 || currentFile;
    renderProjectList();
    return;
  }

  if (mode === "setNew") {
    const customFileNameBar = document.getElementById("CustomFileNameBar");
    if (customFileNameBar) {
      customFileNameBar.hidden = false;
      customFileNameBar.innerText = "";
      customFileNameBar.style.setProperty(
        "max-width",
        canvasElement.style.getPropertyValue("--canvasWidth")
      );
    }
    saveKeyboardButtons();
    return;
  }

  if (mode === "setDefault") {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const suffix = hours >= 12 ? "PM" : "AM";
    hours = ((hours + 11) % 12) + 1;

    const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    const generatedName = `${CanvasMode} ${now.toDateString()} ${paddedHours} ${paddedMinutes} ${paddedSeconds} ${suffix}`;
    FileName = sanitizeFileName(generatedName) || "NewFile";

    fs.writeFileSync(getProjectFilePath(FileName), fileContent);

    const statusContainer = document.getElementById("FileStatusContainer");
    if (statusContainer) {
      statusContainer.textContent = `'${FileName}'`;
    }

    document.getElementById("PrimaryButtons_1").disabled = false;
    swal(`File saved in ${normalizeDisplayPath(projectsDirectory)}`, {
      buttons: false,
      timer: 2500,
    });
    refreshProjectCache();
    currentFile = projects.indexOf(FileName) + 1 || projects.length;
    renderProjectList();
    return;
  }
}

function setNewName() {
  const canvasElement = document.getElementById("CanvasContainer");
  if (!canvasElement) {
    return;
  }

  const customFileNameBar = document.getElementById("CustomFileNameBar");
  if (!customFileNameBar) {
    return;
  }

  const proposedName = sanitizeFileName(customFileNameBar.innerHTML) || "NewFile";
  FileName = proposedName;

  fs.writeFileSync(
    getProjectFilePath(FileName),
    canvasElement.outerHTML.toString()
  );

  customFileNameBar.hidden = true;

  const statusContainer = document.getElementById("FileStatusContainer");
  if (statusContainer) {
    statusContainer.textContent = `'${FileName}'`;
  }

  document.getElementById("PrimaryButtons_1").disabled = false;
  swal(`File saved in ${normalizeDisplayPath(projectsDirectory)}`, {
    buttons: false,
    timer: 2500,
  });

  refreshProjectCache();
  currentFile = projects.indexOf(FileName) + 1 || projects.length;
  renderProjectList();
}
