"use strict";

class State {
  constructor() {
    const currentImg = document.querySelector(
      "#color .fieldset__input:checked + .fieldset__label img"
    );
    if (!currentImg) {
      console.error("current img not found");
      return;
    }
    this.currentImg = currentImg;
  }
}

function registerObjectRadio(state) {
  const objectRadio = document.querySelector("#object .fieldset__options");
  if (!objectRadio) {
    console.error("object radio options not found");
    return;
  }

  const colorRadioImgs = document.querySelectorAll(
    "#color .fieldset__label img"
  );
  const objectSrcMap = new Map([
    ["robot", "robot"],
    ["target", "star-solid"],
    ["pipe1", "line-bltr"],
    ["pipe2", "line-tlbr"],
  ]);
  function handleObjectRadio(e) {
    for (const img of colorRadioImgs) {
      img.src = `static/${objectSrcMap.get(e.target.id)}-${
        img.parentElement.htmlFor
      }.svg`;
      img.alt = `${img.parentElement.htmlFor} ${e.target.id}`;
    }
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
  registerObjectRadio(state);
  registerColorRadio(state);
}

registerHandlers();
