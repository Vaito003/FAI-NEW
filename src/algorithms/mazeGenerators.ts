import { GridCoord } from '../types/pathfinder';

export type MazeType = 'recursive-backtracker' | 'recursive-division' | 'random-30' | 'random-45' | 'stairs' | 'spiral';

/**
 * Procedural Maze and Obstacle Generators
 */
export function generateMaze(
  type: MazeType,
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord
): Set<string> {
  const walls = new Set<string>();
  const isReserved = (r: number, c: number) =>
    (r === start.r && c === start.c) || (r === target.r && c === target.c);

  switch (type) {
    case 'recursive-backtracker':
      return generateRecursiveBacktracker(rows, cols, start, target);

    case 'recursive-division':
      return generateRecursiveDivision(rows, cols, start, target);

    case 'random-30': {
      // 30% density random obstacles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!isReserved(r, c) && Math.random() < 0.28) {
            walls.add(`${r},${c}`);
          }
        }
      }
      return walls;
    }

    case 'random-45': {
      // 45% density heavy obstacles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!isReserved(r, c) && Math.random() < 0.42) {
            walls.add(`${r},${c}`);
          }
        }
      }
      return walls;
    }

    case 'stairs': {
      // Staircase diagonal barriers
      let r = 1;
      let c = 1;
      while (r < rows - 1 && c < cols - 1) {
        if (!isReserved(r, c)) walls.add(`${r},${c}`);
        if (!isReserved(r + 1, c)) walls.add(`${r + 1},${c}`);
        r += 2;
        c += 2;
      }

      // Reverse stair from other side
      r = rows - 2;
      c = 2;
      while (r > 1 && c < cols - 2) {
        if (!isReserved(r, c)) walls.add(`${r},${c}`);
        r -= 2;
        c += 3;
      }
      return walls;
    }

    case 'spiral': {
      // Concentric labyrinth spiral
      let top = 1, bottom = rows - 2;
      let left = 1, right = cols - 2;
      let step = 0;

      while (top <= bottom && left <= right) {
        // Top row
        for (let c = left; c <= right; c++) {
          if ((step % 4 !== 0 || c !== right) && !isReserved(top, c)) walls.add(`${top},${c}`);
        }
        top += 2;

        // Right column
        for (let r = top; r <= bottom; r++) {
          if ((step % 4 !== 1 || r !== bottom) && !isReserved(r, right)) walls.add(`${r},${right}`);
        }
        right -= 2;

        // Bottom row
        if (top <= bottom) {
          for (let c = right; c >= left; c--) {
            if ((step % 4 !== 2 || c !== left) && !isReserved(bottom, c)) walls.add(`${bottom},${c}`);
          }
          bottom -= 2;
        }

        // Left column
        if (left <= right) {
          for (let r = bottom; r >= top; r--) {
            if ((step % 4 !== 3 || r !== top) && !isReserved(r, left)) walls.add(`${r},${left}`);
          }
          left += 2;
        }
        step++;
      }
      return walls;
    }

    default:
      return walls;
  }
}

/**
 * Perfect Maze generator via Randomized Depth-First Search (Recursive Backtracker)
 */
function generateRecursiveBacktracker(
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord
): Set<string> {
  const walls = new Set<string>();

  // Fill entire grid with walls first
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      walls.add(`${r},${c}`);
    }
  }

  // Cell grid in steps of 2 (odd coordinates)
  const visited = new Set<string>();
  const stack: [number, number][] = [];

  const startR = 1;
  const startC = 1;
  walls.delete(`${startR},${startC}`);
  visited.add(`${startR},${startC}`);
  stack.push([startR, startC]);

  const directions = [
    [-2, 0, -1, 0], // Up
    [0, 2, 0, 1],   // Right
    [2, 0, 1, 0],   // Down
    [0, -2, 0, -1], // Left
  ];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors: [number, number, number, number][] = [];

    // Shuffle directions
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);

    for (const [dr, dc, wr, wc] of shuffledDirs) {
      const nr = cr + dr;
      const nc = cc + dc;

      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1) {
        if (!visited.has(`${nr},${nc}`)) {
          neighbors.push([nr, nc, cr + wr, cc + wc]);
        }
      }
    }

    if (neighbors.length > 0) {
      // Pick random unvisited neighbor
      const [nr, nc, wallR, wallC] = neighbors[Math.floor(Math.random() * neighbors.length)];
      walls.delete(`${wallR},${wallC}`);
      walls.delete(`${nr},${nc}`);
      visited.add(`${nr},${nc}`);
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  // Ensure start and target are cleared, along with adjacent paths
  walls.delete(`${start.r},${start.c}`);
  walls.delete(`${target.r},${target.c}`);

  // Clear 1 neighboring cell around start and target to guarantee exit
  const clearSurrounding = (pt: GridCoord) => {
    const deltas = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of deltas) {
      const nr = pt.r + dr;
      const nc = pt.c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        walls.delete(`${nr},${nc}`);
        break; // clear at least one
      }
    }
  };
  clearSurrounding(start);
  clearSurrounding(target);

  return walls;
}

/**
 * Recursive Division Maze generator
 */
function generateRecursiveDivision(
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord
): Set<string> {
  const walls = new Set<string>();

  // Outer border
  for (let r = 0; r < rows; r++) {
    walls.add(`${r},0`);
    walls.add(`${r},${cols - 1}`);
  }
  for (let c = 0; c < cols; c++) {
    walls.add(`0,${c}`);
    walls.add(`${rows - 1},${c}`);
  }

  const isReserved = (r: number, c: number) =>
    (r === start.r && c === start.c) || (r === target.r && c === target.c);

  function divide(r1: number, r2: number, c1: number, c2: number, orientation: 'H' | 'V') {
    if (r2 - r1 < 2 || c2 - c1 < 2) return;

    if (orientation === 'H') {
      // Horizontal cut
      const possibleWallRows: number[] = [];
      for (let r = r1 + 1; r < r2; r += 2) possibleWallRows.push(r);
      if (possibleWallRows.length === 0) return;
      const wallRow = possibleWallRows[Math.floor(Math.random() * possibleWallRows.length)];

      const possiblePassages: number[] = [];
      for (let c = c1; c <= c2; c += 2) possiblePassages.push(c);
      const passageCol = possiblePassages[Math.floor(Math.random() * possiblePassages.length)];

      for (let c = c1; c <= c2; c++) {
        if (c !== passageCol && !isReserved(wallRow, c)) {
          walls.add(`${wallRow},${c}`);
        }
      }

      divide(r1, wallRow - 1, c1, c2, chooseOrientation(wallRow - 1 - r1, c2 - c1));
      divide(wallRow + 1, r2, c1, c2, chooseOrientation(r2 - (wallRow + 1), c2 - c1));
    } else {
      // Vertical cut
      const possibleWallCols: number[] = [];
      for (let c = c1 + 1; c < c2; c += 2) possibleWallCols.push(c);
      if (possibleWallCols.length === 0) return;
      const wallCol = possibleWallCols[Math.floor(Math.random() * possibleWallCols.length)];

      const possiblePassages: number[] = [];
      for (let r = r1; r <= r2; r += 2) possiblePassages.push(r);
      const passageRow = possiblePassages[Math.floor(Math.random() * possiblePassages.length)];

      for (let r = r1; r <= r2; r++) {
        if (r !== passageRow && !isReserved(r, wallCol)) {
          walls.add(`${r},${wallCol}`);
        }
      }

      divide(r1, r2, c1, wallCol - 1, chooseOrientation(r2 - r1, wallCol - 1 - c1));
      divide(r1, r2, wallCol + 1, c2, chooseOrientation(r2 - r1, c2 - (wallCol + 1)));
    }
  }

  function chooseOrientation(height: number, width: number): 'H' | 'V' {
    if (width > height) return 'V';
    if (height > width) return 'H';
    return Math.random() < 0.5 ? 'H' : 'V';
  }

  divide(1, rows - 2, 1, cols - 2, chooseOrientation(rows, cols));

  // Guarantee start and target are preserved
  walls.delete(`${start.r},${start.c}`);
  walls.delete(`${target.r},${target.c}`);

  return walls;
}
