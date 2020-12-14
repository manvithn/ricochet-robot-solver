class Position {
  constructor(arg1, arg2) {
    if (arg2 === undefined) {
      this.x = arg1 % 16;
      this.y = Math.trunc(arg1 / 16);
    } else {
      this.x = arg1;
      this.y = arg2;
    }
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  hash() {
    return this.y * 16 + this.x;
  }

  inBounds() {
    return this.x >= 0 && this.x < 16 && this.y >= 0 && this.y < 16;
  }
}

class Target {
  constructor(color, position) {
    this.color = color;
    this.position = position;
  }
}

class Board {
  constructor(
    horizontalWalls,
    verticalWalls,
    robotPositions,
    pipe1Positions,
    pipe2Positions,
    target
  ) {
    this.horizontalWalls = horizontalWalls;
    this.verticalWalls = verticalWalls;
    this.robotPositions = robotPositions;
    this.pipe1Positions = pipe1Positions;
    this.pipe2Positions = pipe2Positions;
    this.target = target;
  }

  load(state) {
    for (const [i, val] of this.horizontalWalls.entries()) {
      if (val) {
        state.gridHorizontalEdges[i].click();
      }
    }
    for (const [i, val] of this.verticalWalls.entries()) {
      if (val) {
        state.gridVerticalEdges[i].click();
      }
    }

    const colorOptionMap = new Map();
    for (const img of state.colorRadioImgs) {
      colorOptionMap.set(img.parentElement.htmlFor, img);
    }

    const robotOption = document.querySelector("#robot");
    if (!robotOption) {
      console.error("robot option not found");
      return;
    }
    robotOption.click();

    for (const [color, position] of this.robotPositions) {
      colorOptionMap.get(color).click();
      state.gridSquares[position.hash()].click();
    }

    const pipe1Option = document.querySelector("#pipe1");
    if (!pipe1Option) {
      console.error("pipe1 option not found");
      return;
    }
    pipe1Option.click();

    for (const [color, positions] of this.pipe1Positions) {
      colorOptionMap.get(color).click();
      for (const p of positions) {
        state.gridSquares[p.hash()].click();
      }
    }

    const pipe2Option = document.querySelector("#pipe2");
    if (!pipe2Option) {
      console.error("pipe2 option not found");
      return;
    }
    pipe2Option.click();

    for (const [color, positions] of this.pipe2Positions) {
      colorOptionMap.get(color).click();
      for (const p of positions) {
        state.gridSquares[p.hash()].click();
      }
    }

    const targetOption = document.querySelector("#target");
    if (!targetOption) {
      console.error("target option not found");
      return;
    }
    targetOption.click();

    colorOptionMap.get(this.target.color).click();
    state.gridSquares[this.target.position.hash()].click();
  }
}

export { Position, Target, Board };
