import { Position } from "./board.js";

const colorHashMap = new Map([
  ["red", Math.pow(1000, 0)],
  ["yellow", Math.pow(1000, 1)],
  ["green", Math.pow(1000, 2)],
  ["blue", Math.pow(1000, 3)],
  ["black", Math.pow(1000, 4)],
]);

function robotPositionsHash(robotPositions) {
  let n = 0;
  for (const [color, position] of robotPositions) {
    n += colorHashMap.get(color) * position.hash();
  }
  return n;
}

class Node {
  constructor(currentPos, previousPos, color, direction) {
    this.current = currentPos;
    this.previous = previousPos;
    this.color = color;
    this.direction = direction;
  }

  isRoot() {
    return this.previous ? true : false;
  }
}

class Solver {
  constructor(board) {
    this.horizontalWallsUp = new Set();
    this.horizontalWallsDown = new Set();
    this.verticalWallsLeft = new Set();
    this.verticalWallsRight = new Set();
    for (const [i, e] of board.horizontalWalls.entries()) {
      if (e) {
        this.horizontalWallsUp.add(new Position(i).hash());
        this.horizontalWallsDown.add(new Position(i + 16).hash());
      }
    }
    for (const [i, e] of board.verticalWalls.entries()) {
      if (e) {
        const d = Math.trunc(i / 15);
        const r = i % 15;
        this.verticalWallsLeft.add(new Position(r, d).hash());
        this.verticalWallsRight.add(new Position(r + 1, d).hash());
      }
    }

    this.robotPositions = board.robotPositions;
    this.pipe1Positions = board.pipe1Positions;
    this.pipe2Positions = board.pipe2Positions;
    this.target = board.target;
  }

  hitWall(pos, walls) {
    return walls.has(pos.hash());
  }

  hitRobot(pos, robotPositions, robotColor) {
    for (const [k, v] of robotPositions) {
      if (robotColor !== k) {
        if (pos.equals(v)) {
          return true;
        }
      }
    }
    return false;
  }

  computePosition(robotPositions, robotColor, dir) {
    const ret = new Map();
    for (const [k, v] of robotPositions) {
      ret.set(k, new Position(v.x, v.y));
    }
    const pos = ret.get(robotColor);
    // const pipe1 = this.pipe1Positions[robotColor];
    // const pipe2 = this.pipe2Positions[robotColor];
    switch (dir) {
      case "up":
        do {
          pos.y--;
        } while (
          pos.inBounds() &&
          !this.hitWall(pos, this.horizontalWallsUp) &&
          !this.hitRobot(pos, robotPositions, robotColor)
        );
        pos.y++;
        break;
      case "down":
        do {
          pos.y++;
        } while (
          pos.inBounds() &&
          !this.hitWall(pos, this.horizontalWallsDown) &&
          !this.hitRobot(pos, robotPositions, robotColor)
        );
        pos.y--;
        break;
      case "left":
        do {
          pos.x--;
        } while (
          pos.inBounds() &&
          !this.hitWall(pos, this.verticalWallsLeft) &&
          !this.hitRobot(pos, robotPositions, robotColor)
        );
        pos.x++;
        break;
      case "right":
        do {
          pos.x++;
        } while (
          pos.inBounds() &&
          !this.hitWall(pos, this.verticalWallsRight) &&
          !this.hitRobot(pos, robotPositions, robotColor)
        );
        pos.x--;
        break;
      default:
        console.error("invalid direction");
    }
    return ret;
  }

  solve() {
    const tcolor = this.target.color;
    const tposition = this.target.position;

    // check if already solved
    if (this.robotPositions.get(tcolor).equals(tposition)) {
      return [];
    }

    const nodes = new Map();
    nodes.set(
      robotPositionsHash(this.robotPositions),
      new Node(this.robotPositions, null, null, null)
    );
    const explore = [this.robotPositions];

    function getSolution(positions) {
      const moves = [];
      while (positions) {
        const h = robotPositionsHash(positions);
        const n = nodes.get(h);
        moves.push(n);
        positions = n.previous;
      }
      return moves.reverse().slice(1);
    }

    while (explore.length) {
      const current = explore.shift();
      for (const color of current.keys()) {
        for (const direction of ["up", "down", "left", "right"]) {
          const next = this.computePosition(current, color, direction);

          if (nodes.has(robotPositionsHash(next))) {
            // we've already seen visited this board state
            // the current path must be at least as long as the existing path
            continue;
          }
          nodes.set(
            robotPositionsHash(next),
            new Node(next, current, color, direction)
          );
          explore.push(next);

          if (next.get(tcolor).equals(tposition)) {
            // we've reached the target, return solution
            return getSolution(next);
          }
        }
      }
    }

    // no solution has been found
    return null;
  }
}

export { Node, Solver };
