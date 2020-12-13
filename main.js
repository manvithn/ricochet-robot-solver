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

function registerGrid(state) {
  const gridCornerRefs = state.gridCorners.map((e) => 0);

  function handleSquare(e) {
    function genGridImg() {
      const templateImg = state.currentImg.cloneNode();
      templateImg.classList.replace("fieldset__img", "grid__img");
      return templateImg;
    }

    const child = e.currentTarget.firstElementChild;
    if (child) {
      if (child.src === state.currentImg.src) {
        child.remove();
      } else {
        child.replaceWith(genGridImg());
      }
    } else {
      e.currentTarget.appendChild(genGridImg());
    }
  }
  for (const e of state.gridSquares) {
    e.addEventListener("click", handleSquare);
  }

  for (const [i, e] of state.gridHorizontalEdges.entries()) {
    function handleEdge(e) {
      const added = e.currentTarget.classList.toggle("grid__wall");
      const d = Math.trunc(i / 16);
      const r = i % 16;

      function handleCorner(index) {
        if (added) {
          if (gridCornerRefs[index] === 0) {
            state.gridCorners[index].classList.add("grid__wall");
          }
          gridCornerRefs[index]++;
        } else {
          gridCornerRefs[index]--;
          if (gridCornerRefs[index] === 0) {
            state.gridCorners[index].classList.remove("grid__wall");
          }
        }
      }

      if (r > 0) {
        handleCorner(d * 15 + r - 1);
      }
      if (r < 15) {
        handleCorner(d * 15 + r);
      }
    }

    e.addEventListener("click", handleEdge);
  }

  for (const [i, e] of state.gridVerticalEdges.entries()) {
    function handleEdge(e) {
      const added = e.currentTarget.classList.toggle("grid__wall");
      const d = Math.trunc(i / 15);

      function handleCorner(index) {
        if (added) {
          if (gridCornerRefs[index] === 0) {
            state.gridCorners[index].classList.add("grid__wall");
          }
          gridCornerRefs[index]++;
        } else {
          gridCornerRefs[index]--;
          if (gridCornerRefs[index] === 0) {
            state.gridCorners[index].classList.remove("grid__wall");
          }
        }
      }

      if (d > 0) {
        handleCorner(i - 15);
      }
      if (d < 15) {
        handleCorner(i);
      }
    }

    e.addEventListener("click", handleEdge);
  }
}

(function () {
  const state = new State();
  initColorRadio(state);
  registerObjectRadio(state);
  registerColorRadio(state);
  registerGrid(state);
})();
