import { Position } from "./board.js";

const pipe1Bounce = new Map([
  ["up", "right"],
  ["down", "left"],
  ["left", "down"],
  ["right", "up"],
]);

const pipe2Bounce = new Map([
  ["up", "left"],
  ["down", "right"],
  ["left", "up"],
  ["right", "down"],
]);

const moveMap = new Map([
  ["up", (pos) => new Position(pos.x, pos.y - 1)],
  ["down", (pos) => new Position(pos.x, pos.y + 1)],
  ["left", (pos) => new Position(pos.x - 1, pos.y)],
  ["right", (pos) => new Position(pos.x + 1, pos.y)],
]);

const moveBackMap = new Map([
  ["up", (pos) => new Position(pos.x, pos.y + 1)],
  ["down", (pos) => new Position(pos.x, pos.y - 1)],
  ["left", (pos) => new Position(pos.x + 1, pos.y)],
  ["right", (pos) => new Position(pos.x - 1, pos.y)],
]);

function inBounds(pos) {
  return pos.x >= 0 && pos.x < 16 && pos.y >= 0 && pos.y < 16;
}

function hitWall(pos, walls) {
  return walls.has(pos.hash());
}

function getPipe(pos, pipes) {
  return pipes.get(pos.hash());
}

const dirHashMap = new Map([
  ["up", Math.pow(1000, 0)],
  ["down", Math.pow(1000, 1)],
  ["left", Math.pow(1000, 2)],
  ["right", Math.pow(1000, 3)],
]);

function hashPositionDir(pos, dir) {
  return dirHashMap.get(dir) * pos.hash();
}

const colorHashMap = new Map([
  ["red", Math.pow(1000, 0)],
  ["yellow", Math.pow(1000, 1)],
  ["green", Math.pow(1000, 2)],
  ["blue", Math.pow(1000, 3)],
  ["black", Math.pow(1000, 4)],
]);

function hashRobotPositions(robotPositions) {
  let n = 0;
  for (const [color, position] of robotPositions) {
    n += colorHashMap.get(color) * position.hash();
  }
  return n;
}

class Bounce {
  constructor(pos, dir) {
    this.pos = pos;
    this.dir = dir;
  }

  clone() {
    return new Bounce(this.pos.clone(), this.dir);
  }
}

class Path {
  static makePath(start, dir, end) {
    const bounces = [new Bounce(start.clone(), dir)];
    return new Path(bounces, end.clone());
  }

  static makePathFromPath(start, dir, path) {
    if (path.bounces.length === 0) {
      console.error("invalid path provided");
      return;
    }
    const bounces = path.bounces.map((b) => b.clone());
    bounces[0] = new Bounce(start.clone(), dir);
    return new Path(bounces, path.end.clone());
  }

  static makePathFromPipePath(start, dir, path) {
    if (path.bounces.length === 0) {
      console.error("invalid path provided");
      return;
    }
    const bounces = path.bounces.map((b) => b.clone());
    bounces.unshift(new Bounce(start.clone(), dir));
    return new Path(bounces, path.end.clone());
  }

  constructor(bounces, end) {
    this.bounces = bounces;
    this.end = end;
  }
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
    const horizontalWallsUp = new Set();
    const horizontalWallsDown = new Set();
    const verticalWallsLeft = new Set();
    const verticalWallsRight = new Set();
    for (const [i, e] of board.horizontalWalls.entries()) {
      if (e) {
        horizontalWallsUp.add(new Position(i).hash());
        horizontalWallsDown.add(new Position(i + 16).hash());
      }
    }
    for (const [i, e] of board.verticalWalls.entries()) {
      if (e) {
        const d = Math.trunc(i / 15);
        const r = i % 15;
        verticalWallsLeft.add(new Position(r, d).hash());
        verticalWallsRight.add(new Position(r + 1, d).hash());
      }
    }
    this.walls = new Map([
      ["up", horizontalWallsUp],
      ["down", horizontalWallsDown],
      ["left", verticalWallsLeft],
      ["right", verticalWallsRight],
    ]);

    this.robotPositions = board.robotPositions;
    this.pipe1Map = new Map();
    this.pipe2Map = new Map();
    for (const [k, v] of board.pipe1Positions.entries()) {
      for (const p of v) {
        this.pipe1Map.set(p.hash(), k);
      }
    }
    for (const [k, v] of board.pipe2Positions.entries()) {
      for (const p of v) {
        this.pipe2Map.set(p.hash(), k);
      }
    }
    this.target = board.target;

    this.paths = new Map();
    this.precomputePaths();
  }

  precompute(start, color, dir, visited) {
    const shash = start.hash();

    const vhash = hashPositionDir(start, dir);
    if (visited.has(vhash)) {
      // this is an infinite loop, mark as invalid
      this.paths.get(shash).get(color).set(dir, null);
      return;
    }
    visited.add(vhash);

    if (this.paths.get(shash).get(color).has(dir)) {
      // this is an already computed position
      return;
    }

    const pos = moveMap.get(dir)(start);
    const phash = pos.hash();
    if (inBounds(pos) && !hitWall(pos, this.walls.get(dir))) {
      const pipe1Color = getPipe(pos, this.pipe1Map);
      const pipe2Color = getPipe(pos, this.pipe2Map);
      if (pipe1Color) {
        let posDir;
        let makePathFunc;
        if (pipe1Color === color) {
          posDir = dir;
          makePathFunc = Path.makePathFromPath;
        } else {
          posDir = pipe1Bounce.get(dir);
          makePathFunc = Path.makePathFromPipePath;
        }
        this.precompute(pos, color, posDir, visited);
        const next = this.paths.get(phash).get(color).get(posDir);
        // if next is null, then pos is also an invalid move, since we cannot
        // end on a pipe
        const val = next === null ? null : makePathFunc(start, dir, next);
        this.paths.get(shash).get(color).set(dir, val);
      } else if (pipe2Color) {
        let posDir;
        let makePathFunc;
        if (pipe2Color === color) {
          posDir = dir;
          makePathFunc = Path.makePathFromPath;
        } else {
          posDir = pipe2Bounce.get(dir);
          makePathFunc = Path.makePathFromPipePath;
        }
        this.precompute(pos, color, posDir, visited);
        const next = this.paths.get(phash).get(color).get(posDir);
        // if next is null, then pos is also an invalid move, since we cannot
        // end on a pipe
        const val = next === null ? null : makePathFunc(start, dir, next);
        this.paths.get(shash).get(color).set(dir, val);
      } else {
        this.precompute(pos, color, dir, visited);
        const next = this.paths.get(phash).get(color).get(dir);
        // if next is null, then pos is the last valid move
        const val =
          next === null
            ? Path.makePath(start, dir, pos)
            : Path.makePathFromPath(start, dir, next);
        this.paths.get(shash).get(color).set(dir, val);
      }
    } else {
      // this is an invalid move, mark as invalid
      this.paths.get(shash).get(color).set(dir, null);
    }
  }

  precomputePaths() {
    for (let x = 0; x < 16; ++x) {
      for (let y = 0; y < 16; ++y) {
        const p = new Position(x, y).hash();
        const map = new Map();
        for (const color of this.robotPositions.keys()) {
          map.set(color, new Map());
        }
        this.paths.set(p, map);
      }
    }

    for (let x = 0; x < 16; ++x) {
      for (let y = 0; y < 16; ++y) {
        const pos = new Position(x, y);
        for (const color of this.robotPositions.keys()) {
          this.precompute(pos, color, "up", new Set());
          this.precompute(pos, color, "down", new Set());
          this.precompute(pos, color, "left", new Set());
          this.precompute(pos, color, "right", new Set());
        }
      }
    }
  }

  intersect(start, dir, end, robotPositions, robotColor) {
    const comparableFunc = Position.isdirectionalComparable(dir);
    const compareFunc = Position.directionalCompare(dir);
    const moveBackFunc = moveBackMap.get(dir);
    const intersections = [];
    for (const [k, v] of robotPositions) {
      if (
        k !== robotColor &&
        comparableFunc(start, v) &&
        compareFunc(start, v) <= 0 &&
        compareFunc(v, end) <= 0
      ) {
        intersections.push(moveBackFunc(v));
      }
    }
    if (intersections.length) {
      return intersections.reduce((a, b) => (compareFunc(a, b) < 0 ? a : b));
    }
    return null;
  }

  findEnd(path, robotPositions, robotColor) {
    for (let i = 0; i < path.bounces.length - 1; ++i) {
      const curr = path.bounces[i].pos;
      const dir = path.bounces[i].dir;
      const next = path.bounces[i + 1].pos;
      const stop = this.intersect(curr, dir, next, robotPositions, robotColor);
      if (stop) {
        return curr.equals(stop) ? null : stop;
      }
    }
    const curr = path.bounces[path.bounces.length - 1].pos;
    const dir = path.bounces[path.bounces.length - 1].dir;
    const next = path.end;
    const stop = this.intersect(curr, dir, next, robotPositions, robotColor);
    if (stop) {
      return curr.equals(stop) ? null : stop;
    }
    return path.end.clone();
  }

  computePosition(robotPositions, robotColor, dir) {
    const start = robotPositions.get(robotColor);
    const path = this.paths.get(start.hash()).get(robotColor).get(dir);
    if (!path) {
      return null;
    }
    const end = this.findEnd(path, robotPositions, robotColor);
    if (!end) {
      return null;
    }
    const ret = new Map();
    for (const [k, v] of robotPositions) {
      const val = k === robotColor ? end.clone() : v.clone();
      ret.set(k, val);
    }
    return ret;
  }

  solve() {
    function getSolution(positions) {
      const moves = [];
      while (positions) {
        const h = hashRobotPositions(positions);
        const n = nodes.get(h);
        moves.push(n);
        positions = n.previous;
      }
      return moves.reverse().slice(1);
    }

    const tcolor = this.target.color;
    const tposition = this.target.position;

    // check if already solved
    if (this.robotPositions.get(tcolor).equals(tposition)) {
      return [];
    }

    const nodes = new Map();
    nodes.set(
      hashRobotPositions(this.robotPositions),
      new Node(this.robotPositions, null, null, null)
    );
    const explore = [this.robotPositions];

    while (explore.length) {
      const current = explore.shift();
      for (const color of current.keys()) {
        for (const direction of ["up", "down", "left", "right"]) {
          const next = this.computePosition(current, color, direction);

          if (!next) {
            // this is an invalid move
            continue;
          }

          if (nodes.has(hashRobotPositions(next))) {
            // we've already visited this board state
            // the current path must be at least as long as the existing path
            continue;
          }
          nodes.set(
            hashRobotPositions(next),
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
