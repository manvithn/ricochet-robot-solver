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
  static generateBoardFromState(state) {
    const horizontalWalls = [];
    for (const e of state.gridHorizontalEdges) {
      if (e.matches(".grid__wall")) {
        horizontalWalls.push(1);
      } else {
        horizontalWalls.push(0);
      }
    }

    const verticalWalls = [];
    for (const e of state.gridVerticalEdges) {
      if (e.matches(".grid__wall")) {
        verticalWalls.push(1);
      } else {
        verticalWalls.push(0);
      }
    }

    const robotPositions = new Map();
    const pipe1Positions = new Map();
    const pipe2Positions = new Map();
    let target;
    for (const [i, e] of state.gridSquares.entries()) {
      const img = e.firstElementChild;
      if (img) {
        const resource = img.src.substring(img.src.lastIndexOf("/") + 1);
        const matchRobot = resource.match(/robot-(.*).svg/);
        const matchPipe1 = resource.match(/line-bltr-(.*).svg/);
        const matchPipe2 = resource.match(/line-tlbr-(.*).svg/);
        const matchTarget = resource.match(/star-solid-(.*).svg/);
        if (matchRobot) {
          robotPositions.set(matchRobot[1], new Position(i));
        } else if (matchPipe1) {
          if (pipe1Positions.has(matchPipe1[1])) {
            pipe1Positions.get(matchPipe1[1]).push(new Position(i));
          } else {
            pipe1Positions.set(matchPipe1[1], [new Position(i)]);
          }
        } else if (matchPipe2) {
          if (pipe2Positions.has(matchPipe2[1])) {
            pipe2Positions.get(matchPipe2[1]).push(new Position(i));
          } else {
            pipe2Positions.set(matchPipe2[1], [new Position(i)]);
          }
        } else if (matchTarget) {
          if (target) {
            alert("Only one target can be set");
            return;
          }
          target = new Target(matchTarget[1], new Position(i));
        }
      }
    }
    if (!target) {
      alert("No target has been set");
      return;
    }

    return new Board(
      horizontalWalls,
      verticalWalls,
      robotPositions,
      pipe1Positions,
      pipe2Positions,
      target
    );
  }

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

  loadBoardToState(state) {
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
