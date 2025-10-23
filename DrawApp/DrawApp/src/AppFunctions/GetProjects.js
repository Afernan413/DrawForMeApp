const DocumentsPath = app.getPath("home");
var ProjectsPath;
var projects = [];
var projectNames = [];
let currentFile = 1;
let FileName;
var doneTyping = false;
var brushState = window.BrushState || require("./BrushState");
window.BrushState = brushState;
try {
  fs.mkdirSync(DocumentsPath + "/ArtByAbey/Projects", { recursive: true });
  ProjectsPath = DocumentsPath + "/ArtByAbey/Projects";
} catch (error) {
  console.log("The directory already exists");
}
ProjectsPath = DocumentsPath + "/ArtByAbey/Projects";

function GetProjects() {
  document.getElementById("FileSelection").removeAttribute("hidden");
  fs.readdirSync(ProjectsPath).forEach((file) => {
    if (file.includes(".json")) {
      if (projects.includes(file.replace(".json", "")) === false) {
        projects.push(file.replace(".json", ""));
      }
    }
  });
  document.getElementById("PathLocation").innerHTML =
    "File Path: " + ProjectsPath.replaceAll("\\", "/");
  if (document.getElementById("FileList").innerHTML == "") {
    let counter = 1;
    projects.forEach((project) => {
      document.getElementById("FileList").innerHTML +=
        `<div class="File" id="file-${counter++}">${project}</div>`;
    });
  }
  if (projects.length !== 0) {
    document
      .querySelector("#FileList > div:nth-child(1)")
      .classList.add("active");
  }
  setFileLookupButtons();
  return;
}
function updateFileSelection() {
  document.querySelectorAll("div.File").forEach((file) => {
    file.classList.remove("active");
  });
  const activeFile = document.getElementById("file-" + currentFile);
  if (activeFile) {
    activeFile.classList.add("active");
  }
  if (activeFile) {
    activeFile.scrollIntoViewIfNeeded();
  }
  return;
}
function navigateFileList(Movement) {
  if (Movement == Button1) {
    console.log("Down Arrow Clicked");
    if (currentFile + 1 <= projects.length) {
      currentFile += 1;
    }
    console.log(currentFile);
    updateFileSelection();
    Button1.removeEventListener("click", () => {});
  }
  if (Movement == Button2) {
    console.log("DownDown Arrow Clicked");
    if (currentFile + 4 <= projects.length) {
      currentFile += 4;
    } else {
      currentFile = projects.length;
    }
    console.log(currentFile);
    updateFileSelection();
    Button2.removeEventListener("click", () => {});
  }
  if (Movement == Button3) {
    console.log("Up Arrow Clicked");
    if (currentFile - 1 >= 1) {
      currentFile -= 1;
    }
    console.log(currentFile);
    updateFileSelection();
    Button3.removeEventListener("click", () => {});
  }
  if (Movement == Button4) {
    console.log("UpUp Arrow Clicked");
    if (currentFile - 4 >= 1) {
      currentFile -= 4;
    } else {
      currentFile = 1;
    }
    console.log(currentFile);
    updateFileSelection();
    Button4.removeEventListener("click", () => {});
  }
  return;
}
function selectFile() {
  const activeFile = document.getElementById("file-" + currentFile);
  if (!activeFile) return;
  FileName = activeFile.innerHTML;
  var selectedFile = fs
    .readFileSync(ProjectsPath + "/" + activeFile.innerHTML + ".json")
    .toString();
  document.getElementById("FileSelection").setAttribute("hidden", "");
  if (selectedFile.includes("Portrait") === true) {
    CanvasMode = "Portrait";
  } else if (selectedFile.includes("Landscape") === true) {
    CanvasMode = "Landscape";
  } else if (selectedFile.includes("Square") === true) {
    CanvasMode = "Square";
  }
  CurrentPage = CanvasMode + "InitialColorFile";
  window[CanvasMode.toString() + "Mode"]();

  document.getElementById("FileStatusContainer").innerHTML =
    "'" + activeFile.innerHTML + "'";
  GridContainer.outerHTML = selectedFile;
  GridContainer = document.querySelector("#CanvasContainer");
  if (GridContainer) {
    const restoredAttribute = GridContainer.getAttribute(
      "data-background-color"
    );
    const restoredBackground =
      restoredAttribute && restoredAttribute.trim().length > 0
        ? restoredAttribute
        : GridContainer.style.backgroundColor;
    if (restoredBackground) {
      let normalizedBackground = restoredBackground;
      if (window.tinycolor) {
        try {
          const parsed = window.tinycolor(restoredBackground);
          if (parsed.isValid()) {
            normalizedBackground = parsed.toHexString();
          }
        } catch (error) {
          normalizedBackground = restoredBackground;
        }
      }
      GridContainer.style.backgroundColor = normalizedBackground;
      GridContainer.setAttribute("data-background-color", normalizedBackground);
      if (
        brushState &&
        typeof brushState.setBackgroundColor === "function"
      ) {
        brushState.setBackgroundColor(normalizedBackground);
      }
    }
  }
  updatePixel();
  if (typeof window.refreshBrushUI === "function") {
    window.refreshBrushUI();
  }
  if (typeof ContentWindow === "function") {
    ContentWindow();
  }
  document.getElementById("PrimaryButtons_1").disabled = false;

  return;
}
function saveFile(mode) {
  let fileContent = document
    .getElementById("CanvasContainer")
    .outerHTML.toString();
  if (mode == "setCurrent") {
    FileName = FileName;
    fs.writeFileSync(ProjectsPath + "/" + FileName + ".json", fileContent);
    document.getElementById("PrimaryButtons_1").disabled = false;
    swal("File saved in " + ProjectsPath.replaceAll("/", "\\"), {
      buttons: false,
      timer: 2500,
    });
    return;
  } else if (mode == "setNew") {
    //document.getElementById("CanvasSizeTitle").setAttribute("hidden", "");
    document.getElementById("CustomFileNameBar").removeAttribute("hidden");
    document
      .getElementById("CustomFileNameBar")
      .style.setProperty(
        "max-width",
        document
          .getElementById("CanvasContainer")
          .style.getPropertyValue("--canvasWidth")
      );
    saveKeyboardButtons();
  } else if (mode == "setDefault") {
    var hours = new Date().getHours();
    var minute = new Date().getMinutes();
    var seconds = new Date().getSeconds();
    var suffix = hours >= 12 ? "PM" : "AM";
    hours = ((hours + 11) % 12) + 1;
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minute < 10) {
      minute = "0" + minute;
    }
    if (fs.existsSync(ProjectsPath + "/" + FileName + ".json") === true) {
      fs.unlinkSync(ProjectsPath + "/" + FileName + ".json");
    }
    FileName =
      CanvasMode +
      " " +
      new Date().toDateString() +
      " " +
      hours +
      " " +
      minute +
      " " +
      seconds +
      " " +
      suffix;
    fs.writeFileSync(ProjectsPath + "/" + FileName + ".json", fileContent);
    document.getElementById("FileStatusContainer").innerHTML =
      "'" + FileName + "'";
    document.getElementById("PrimaryButtons_1").disabled = false;
    swal("File saved in " + ProjectsPath.replaceAll("/", "\\"), {
      buttons: false,
      timer: 2500,
    });
    return;
  }

  return;
}
function setNewName() {
  let fileContent = document
    .getElementById("CanvasContainer")
    .outerHTML.toString();
  if (fs.existsSync(ProjectsPath + "/" + FileName + ".json") === true) {
    fs.unlinkSync(ProjectsPath + "/" + FileName + ".json");
  }
  FileName = document.getElementById("CustomFileNameBar").innerHTML;
  //if the filename is empty, set it to NewFile
  if (FileName.trim() === "") {
    FileName = "NewFile";
  }
  //remove any illegal characters from the filename
  FileName = FileName.replace(/[\\\/:\*\?"<>\|]/g, "_");
  fs.writeFileSync(ProjectsPath + "/" + FileName + ".json", fileContent);
  document.getElementById("CustomFileNameBar").setAttribute("hidden", "");
  document.getElementById("FileStatusContainer").innerHTML =
    "'" + FileName + "'";
  swal("File saved in " + ProjectsPath.replaceAll("/", "\\"), {
    buttons: false,
    timer: 2500,
  });
  return;
}
