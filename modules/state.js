const objectSrcMap = new Map([
  ["robot", "robot"],
  ["target", "star-solid"],
  ["pipe1", "line-bltr"],
  ["pipe2", "line-tlbr"],
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
  }

  updateColorRadioImgs(obj) {
    for (const img of this.colorRadioImgs) {
      img.src = `static/${objectSrcMap.get(obj.id)}-${
        img.parentElement.htmlFor
      }.svg`;
      img.alt = `${img.parentElement.htmlFor} ${obj.id}`;
    }
  }
}

export { State };
