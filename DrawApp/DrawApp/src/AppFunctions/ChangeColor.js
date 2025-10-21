function ChangeColor() {
  // Always open the normal ChangeColor screen
  setChangeColorButtons();
  let btns = document.querySelectorAll(".MainButtons");
  return btns;
}

function ChangeBrush() {
  // opens the ChangeBrush top-level menu
  setChangeBrushButtons();
  let btns = document.querySelectorAll(".MainButtons");
  return btns;
}

function ChangeFill() {
  setChangeFillButtons();
  console.log("Change Fill Clicked");
  return;
}
