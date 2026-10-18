import { GridCoord, HeuristicType } from '../types/pathfinder';

/**
 * Calculates heuristic distance between two nodes
 */
export function calculateHeuristic(
  a: GridCoord,
  b: GridCoord,
  type: HeuristicType = 'manhattan'
): number {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);

  switch (type) {
    case 'manhattan':
      // Admissible & consistent for 4-directional grid movement: |r1 - r2| + |c1 - c2|
      return dr + dc;
    case 'euclidean':
      // Straight-line Euclidean distance sqrt(dr^2 + dc^2)
      return Math.sqrt(dr * dr + dc * dc);
    case 'chebyshev':
      // Max(dr, dc)
      return Math.max(dr, dc);
    default:
      return dr + dc;
  }
}

/**
 * Check if coordinate is inside grid boundaries
 */
export function isInBounds(r: number, c: number, rows: number, cols: number): boolean {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

/**
 * Get 4-directional orthogonal neighbors (Up, Right, Down, Left)
 */
export function getNeighbors(coord: GridCoord, rows: number, cols: number): GridCoord[] {
  const deltas = [
    { r: -1, c: 0 }, // Up
    { r: 0, c: 1 },  // Right
    { r: 1, c: 0 },  // Down
    { r: 0, c: -1 }, // Left
  ];

  const neighbors: GridCoord[] = [];
  for (const d of deltas) {
    const nr = coord.r + d.r;
    const nc = coord.c + d.c;
    if (isInBounds(nr, nc, rows, cols)) {
      neighbors.push({ r: nr, c: nc });
    }
  }
  return neighbors;
}

/**
 * Reconstructs path backwards from target using parent pointer map.
 * Strictly guarantees that returned path is contiguous from start to target.
 * Returns empty array if chain is broken or target unreachable.
 */
export function reconstructPath(
  parentMap: Map<string, GridCoord>,
  target: GridCoord,
  start: GridCoord
): GridCoord[] {
  if (start.r === target.r && start.c === target.c) {
    return [start];
  }

  const path: GridCoord[] = [];
  let curr: GridCoord | undefined = target;
  let currKey = `${curr.r},${curr.c}`;
  const startKey = `${start.r},${start.c}`;

  // Trace backwards from target
  while (curr && currKey !== startKey) {
    path.unshift(curr);
    curr = parentMap.get(currKey);
    if (!curr) {
      // Broken chain: no parent link back to start
      return [];
    }
    currKey = `${curr.r},${curr.c}`;
  }

  path.unshift(start);
  return path;
}

/**
 * Verification utility: audits that a path is 100% valid:
 * 1. Begins at start
 * 2. Ends at target
 * 3. Every adjacent pair has Manhattan distance = 1 (orthogonal 4-way move)
 * 4. No node in path lies on a wall
 */
export function verifyPathIntegrity(
  path: GridCoord[],
  start: GridCoord,
  target: GridCoord,
  walls: Set<string>
): { valid: boolean; reason?: string } {
  if (start.r === target.r && start.c === target.c) {
    if (path.length === 1 && path[0].r === start.r && path[0].c === start.c) {
      return { valid: true };
    }
    return { valid: false, reason: 'Start equals target, but path is invalid' };
  }

  if (path.length < 2) {
    return { valid: false, reason: `Path length is too short: ${path.length}` };
  }

  if (path[0].r !== start.r || path[0].c !== start.c) {
    return { valid: false, reason: 'Path does not begin at start coordinate' };
  }

  if (path[path.length - 1].r !== target.r || path[path.length - 1].c !== target.c) {
    return { valid: false, reason: 'Path does not terminate at target coordinate' };
  }

  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    const key = `${node.r},${node.c}`;
    if (walls.has(key)) {
      return { valid: false, reason: `Path intersects wall at (${node.r}, ${node.c})` };
    }

    if (i < path.length - 1) {
      const nextNode = path[i + 1];
      const dist = Math.abs(node.r - nextNode.r) + Math.abs(node.c - nextNode.c);
      if (dist !== 1) {
        return {
          valid: false,
          reason: `Invalid non-adjacent step between (${node.r},${node.c}) and (${nextNode.r},${nextNode.c}) (dist=${dist})`,
        };
      }
    }
  }

  return { valid: true };
}
