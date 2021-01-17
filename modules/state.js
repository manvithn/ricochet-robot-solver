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
  static matchImg(img) {
    const resource = img.src.substring(img.src.lastIndexOf("/") + 1);
    const matchRobot = resource.match(/robot-(.*).svg/);
    const matchPipe1 = resource.match(/line-bltr-(.*).svg/);
    const matchPipe2 = resource.match(/line-tlbr-(.*).svg/);
    const matchTarget = resource.match(/star-solid-(.*).svg/);
    return [matchRobot, matchPipe1, matchPipe2, matchTarget];
  }

  static getTargetFromSquare(square) {
    const layer = square.querySelector(".grid__layer--target");
    if (!layer) {
      console.error("grid square does not contain expected layer");
      return null;
    }
    return [layer, layer.firstElementChild];
  }

  static getObjectFromSquare(square) {
    const layer = square.querySelector(".grid__layer--object");
    if (!layer) {
      console.error("grid square does not contain expected layer");
      return null;
    }
    return [layer, layer.firstElementChild];
  }

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

  clearRobots() {
    for (const square of this.gridSquares) {
      const [, img] = State.getObjectFromSquare(square);
      if (img) {
        const [matchRobot, , ,] = State.matchImg(img);
        if (matchRobot) {
          img.remove();
        }
      }
    }
  }

  displayRobots(robotPositions) {
    const colorOptionMap = new Map();
    for (const img of this.colorRadioImgs) {
      colorOptionMap.set(img.parentElement.htmlFor, img);
    }

    const robotOption = document.querySelector("#robot");
    if (!robotOption) {
      console.error("robot option not found");
      return;
    }
    robotOption.click();

    for (const [color, position] of robotPositions) {
      colorOptionMap.get(color).click();
      this.gridSquares[position.hash()].click();
    }
  }

  animateRobots(node) {
    const startPos = node.previous.get(node.color);
    const endPos = node.current.get(node.color);
    const startSquare = this.gridSquares[startPos.hash()];
    const endSquare = this.gridSquares[endPos.hash()];
    const [, img] = State.getObjectFromSquare(endSquare);
    if (!img) {
      console.error("robot start img not found for animation");
      return;
    }

    // robot is already in final position
    // derive translation to start position
    const tx = startSquare.offsetLeft - endSquare.offsetLeft;
    const ty = startSquare.offsetTop - endSquare.offsetTop;
    // use translation as starting keyframe and animate to final position
    img.animate([{ transform: `translate(${tx}px, ${ty}px)`, offset: 0 }], {
      duration: 500,
    });
  }

  clearSolution() {
    // remove all children
    this.solutionMoves.replaceChildren();
  }

  displaySolution(moves) {
    const template = document.createDocumentFragment();
    const templateMove = document.createElement("li");
    templateMove.classList.add("solution__move");
    const templateImg = document.createElement("img");
    templateImg.classList.add("solution__img");
    templateMove.appendChild(templateImg);
    template.appendChild(templateMove);

    for (const node of moves) {
      const { color, direction } = node;
      templateImg.src = `static/up-arrow-${color}.svg`;
      templateImg.alt = `${color} arrow pointing ${direction}.svg`;
      const angle = directionRotationMap.get(direction);
      templateImg.style.transform = `rotate(${angle}deg)`;

      const clone = template.cloneNode(true);
      const handleMove = () => {
        this.clearRobots();
        this.displayRobots(node.current);
        this.animateRobots(node);
      };
      clone.firstElementChild.addEventListener("click", handleMove);
      this.solutionMoves.appendChild(clone);
    }
  }
}

export { State };
