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

    for (const { color, direction } of moves) {
      templateImg.src = `static/up-arrow-${color}.svg`;
      templateImg.alt = `${color} arrow pointing ${direction}.svg`;
      const angle = directionRotationMap.get(direction);
      templateImg.style.transform = `rotate(${angle}deg)`;
      this.solutionMoves.appendChild(template.cloneNode(true));
    }
  }
}

export { State };
