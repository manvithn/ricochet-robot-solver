import State from "./modules/state.js";

function initColorRadio(state) {
  const currentObj = document.querySelector("#object .fieldset__input:checked");
  if (!currentObj) {
    console.error("current obj not found");
    return;
  }

  state.updateColorRadioImgs(currentObj);
}

function registerObjectRadio(state) {
  const objectRadio = document.querySelector("#object .fieldset__options");
  if (!objectRadio) {
    console.error("object radio options not found");
    return;
  }

  function handleObjectRadio(e) {
    state.updateColorRadioImgs(e.target);
  }
  objectRadio.addEventListener("input", handleObjectRadio);
}

function registerColorRadio(state) {
  const colorRadio = document.querySelector("#color .fieldset__options");
  if (!colorRadio) {
    console.error("color radio options not found");
    return;
  }

  function handleColorRadio(e) {
    state.currentImg = e.target.nextElementSibling.firstElementChild;
  }
  colorRadio.addEventListener("input", handleColorRadio);
}

function registerHandlers() {
  const state = new State();
  initColorRadio(state);
  registerObjectRadio(state);
  registerColorRadio(state);
}

registerHandlers();
