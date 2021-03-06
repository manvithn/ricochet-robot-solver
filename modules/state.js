import { Utils } from "./img_utils.js";

const objectSrcMap = new Map([
  ["robot", "robot"],
  ["target", "star-solid"],
  ["pipe1", "line-bltr"],
  ["pipe2", "line-tlbr"],
]);

const directionRotationMap = new Map([
  ["up", 0],
  ["down", 180],
  ["left", 270],
  ["right", 90],
]);

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

    this.colorRadioImgs = document.querySelectorAll(
      "#color .fieldset__label img"
    );

    const grid = document.querySelector(".grid");
    if (!grid) {
      console.error("grid not found");
      return;
    }
    const gridElements = [...grid.children];
    this.gridSquares = gridElements.filter((e) => e.matches(".grid__square"));
    this.gridHorizontalEdges = gridElements.filter((e) =>
      e.matches(".grid__edge--horizontal:not(.grid__wall--border)")
    );
    this.gridVerticalEdges = gridElements.filter((e) =>
      e.matches(".grid__edge--vertical:not(.grid__wall--border)")
    );
    this.gridCorners = gridElements.filter((e) =>
      e.matches(".grid__corner:not(.grid__wall--border)")
    );

    this.solution = null;
    const solutionMoves = document.querySelector(".solution__moves");
    if (!solutionMoves) {
      console.error("solution moves not found");
      return;
    }
    this.solutionMoves = solutionMoves;
  }

  updateColorRadioImgs(obj) {
    for (const img of this.colorRadioImgs) {
      img.src = `static/${objectSrcMap.get(obj.id)}-${
        img.parentElement.htmlFor
      }.svg`;
      img.alt = `${img.parentElement.htmlFor} ${obj.id}`;
    }
  }

  moveRobots(robotPositions) {
    const robotImgs = new Map();
    for (const square of this.gridSquares) {
      const [, img] = Utils.getObjectFromSquare(square);
      if (img) {
        const [matchRobot, , ,] = Utils.matchImg(img);
        if (matchRobot) {
          img.remove();
          robotImgs.set(matchRobot[1], img);
        }
      }
    }

    for (const [color, position] of robotPositions) {
      const square = this.gridSquares[position.hash()];
      const [layer, obj] = Utils.getObjectFromSquare(square);
      if (obj) {
        console.error("Trying to move robot to position with existing image");
        return;
      }
      if (!robotImgs.has(color)) {
        console.error("Missing robots in current state");
        return;
      }
      layer.appendChild(robotImgs.get(color));
    }
  }

  animateRobots(pathState) {
    const positions = pathState.path.bounces.map((b) => b.pos);
    positions.push(pathState.path.end);

    // compute translations and lengths and so we can derive the correct offsets
    const keyframeInfo = [];
    let distance = 0;
    for (let i = positions.length - 1, tx = 0, ty = 0; i > 0; --i) {
      const startPos = positions[i - 1];
      const endPos = positions[i];
      const startSquare = this.gridSquares[startPos.hash()];
      const endSquare = this.gridSquares[endPos.hash()];

      // derive translation to start position
      const dx = startSquare.offsetLeft - endSquare.offsetLeft;
      const dy = startSquare.offsetTop - endSquare.offsetTop;
      tx += dx;
      ty += dy;
      const length = Math.abs(dx) + Math.abs(dy);
      distance += length;
      keyframeInfo.push({
        tx: tx,
        ty: ty,
        length: length,
      });
    }
    keyframeInfo.reverse();

    let traversed = 0;
    const keyframes = keyframeInfo.map((info) => {
      const kf = {
        transform: `translate(${info.tx}px, ${info.ty}px)`,
        offset: traversed / distance,
      };
      traversed += info.length;
      return kf;
    });

    this.moveRobots(pathState.endPositions);

    const endSq = this.gridSquares[pathState.path.end.hash()];
    const [, img] = Utils.getObjectFromSquare(endSq);
    if (!img) {
      console.error("robot start img not found for animation");
      return;
    }
    // robot is in final position
    // use translations as starting keyframe and animate to final position
    return img.animate(keyframes, { duration: distance * 2 });
  }

  displaySolution(pathStates) {
    const template = document.createDocumentFragment();
    const templateMove = document.createElement("li");
    templateMove.classList.add("solution__move");
    const templateImg = document.createElement("img");
    templateImg.classList.add("solution__img");
    templateMove.appendChild(templateImg);
    template.appendChild(templateMove);

    for (const p of pathStates) {
      const { color, dir } = p;
      templateImg.src = `static/up-arrow-${color}.svg`;
      templateImg.alt = `${color} arrow pointing ${dir}.svg`;
      const angle = directionRotationMap.get(dir);
      templateImg.style.transform = `rotate(${angle}deg)`;

      const clone = template.cloneNode(true);
      const handleMove = () => {
        this.animateRobots(p);
      };
      clone.firstElementChild.addEventListener("click", handleMove);
      this.solutionMoves.appendChild(clone);
    }
  }

  setSolution(solution) {
    this.solution = solution;
    this.displaySolution(solution);
  }

  clearSolution() {
    // remove all children
    this.solutionMoves.replaceChildren();
    this.solution = null;
  }

  enablePlay() {
    const play = document.querySelector("#play");
    if (!play) {
      console.error("play button not found");
      return;
    }
    play.disabled = false;
  }

  playSolution() {
    if (!this.solution) {
      console.error("playSolution called when solution has not been set");
      return;
    }
    (async () => {
      for (const p of this.solution) {
        const animation = this.animateRobots(p);
        await animation.finished;
      }
    })();
  }
}

export { State };
