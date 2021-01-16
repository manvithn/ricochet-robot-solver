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
      const child = square.firstElementChild;
      if (child) {
        const resource = child.src.substring(child.src.lastIndexOf("/") + 1);
        const matchRobot = resource.match(/robot-(.*).svg/);
        if (matchRobot) {
          child.remove();
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
    const img = startSquare.firstElementChild;
    if (!img) {
      console.error("robot start img not found for animation");
    }

    const tx = endSquare.offsetLeft - startSquare.offsetLeft;
    const ty = endSquare.offsetTop - startSquare.offsetTop;
    img.animate([{ transform: `translate(${tx}px, ${ty}px)` }], {
      duration: 500,
      fill: "forwards",
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
        this.displayRobots(node.previous);
        this.animateRobots(node);
      };
      clone.firstElementChild.addEventListener("click", handleMove);
      this.solutionMoves.appendChild(clone);
    }
  }
}

export { State };
