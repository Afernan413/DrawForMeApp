function SetNewFileButtons() {
  Button1.innerHTML = "Portrait";
  Button2.innerHTML = "Landscape";
  Button3.innerHTML = "Square";
  Button4.innerHTML = "";
  Button5.innerHTML = "";
  Button6.innerHTML = "Go Back";
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
  Button1.setAttribute("arrow", "LeftArrow");
  Button5.innerHTML = "Fill";
  Button6.innerHTML = "More";
}
