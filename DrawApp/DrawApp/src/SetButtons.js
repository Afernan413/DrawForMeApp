function SetNewFileButtons() {
  Button1.innerHTML = "Portrait";
  Button2.innerHTML = "Landscape";
  Button3.innerHTML = "Square";
  Button4.innerHTML = "";
  Button5.innerHTML = "";
  Button6.innerHTML = "Go Back";
  Button6.setAttribute("CurrentPage", "PickCanvas");
}
function SetNavigationButtons() {
  Button1.innerHTML =
    "<img src='../assets/Icons/LeftArrow.png' alt='Left-Arrow' />";
  Button1.setAttribute("arrow", "LeftArrow");
  Button2.innerHTML =
    "<img src='../assets/Icons/UpArrow.png' alt='Up-Arrow' />";
  Button2.setAttribute("arrow", "UpArrow");
  Button3.innerHTML =
    "<img src='../assets/Icons/DownArrow.png' alt='Down-Arrow' />";
  Button3.setAttribute("arrow", "DownArrow");
  Button4.innerHTML =
    "<img src='../assets/Icons/RightArrow.png' alt='Right-Arrow' />";
  Button4.setAttribute("arrow", "RightArrow");
  Button5.innerHTML = "Fill";
  Button6.innerHTML = "More";
  Button6.removeAttribute("CurrentPage");
}
function setMoreButtons() {
  Button1.innerHTML = "Change Color";
  Button1.removeAttribute("arrow");
  Button2.innerHTML = "Change Fill";
  Button2.removeAttribute("arrow");
  Button3.innerHTML = "Change Palette";
  Button3.removeAttribute("arrow");
  Button4.innerHTML = "Save";
  Button4.removeAttribute("arrow");
  Button5.innerHTML = "Print";
  Button6.innerHTML = "Go Back";
  Button6.removeAttribute("CurrentPage");
  Button6.setAttribute("CurrentPage", CanvasMode);
}
