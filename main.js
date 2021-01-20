import { State } from "./modules/state.js";
import { Utils } from "./modules/img_utils.js";
import { Position, Target, Board } from "./modules/board.js";
import { Solver } from "./modules/solver.js";

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

    const [, , , matchTarget] = Utils.matchImg(state.currentImg);
    const [layer, child] = matchTarget
      ? Utils.getTargetFromSquare(e.currentTarget)
      : Utils.getObjectFromSquare(e.currentTarget);
    if (child) {
      if (child.src === state.currentImg.src) {
        child.remove();
      } else {
        child.replaceWith(genGridImg());
      }
    } else {
      layer.appendChild(genGridImg());
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

function registerSolve(state) {
  const solve = document.querySelector("#solve");
  if (!solve) {
    console.error("solve button not found");
    return;
  }

  function handleSolve() {
    state.clearSolution();
    const board = Board.generateBoardFromState(state);
    const solver = new Solver(board);
    state.setSolution(solver.solve());
    state.enablePlay();
  }
  solve.addEventListener("click", handleSolve);
}

function registerPlay(state) {
  const play = document.querySelector("#play");
  if (!play) {
    console.error("play button not found");
    return;
  }

  function handlePlay() {
    state.playSolution();
  }
  play.addEventListener("click", handlePlay);
}

(function () {
  const state = new State();
  initColorRadio(state);
  registerObjectRadio(state);
  registerColorRadio(state);
  registerGrid(state);
  registerSolve(state);
  registerPlay(state);

  // prettier-ignore
  const horizontalWalls = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
  ];
  // prettier-ignore
  const verticalWalls = [
    0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
  ];
  const robotPositions = new Map([
    ["red", new Position(0, 0)],
    ["yellow", new Position(1, 0)],
    ["green", new Position(2, 0)],
    ["blue", new Position(3, 0)],
    ["black", new Position(4, 0)],
  ]);
  const pipe1Positions = new Map();
  const pipe2Positions = new Map([
    ["red", [new Position(4, 2)]],
    ["yellow", [new Position(0, 2)]],
  ]);
  const target = new Target("black", new Position(6, 3));
  const board = new Board(
    horizontalWalls,
    verticalWalls,
    robotPositions,
    pipe1Positions,
    pipe2Positions,
    target
  );
  board.loadBoardToState(state);
})();
