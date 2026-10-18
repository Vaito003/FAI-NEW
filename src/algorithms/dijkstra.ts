import { GridCoord, SearchEvent } from '../types/pathfinder';
import { getNeighbors, isInBounds, reconstructPath } from './heuristics';
import { AlgorithmExecutionOutput } from './bfs';

interface DijkstraNode {
  coord: GridCoord;
  dist: number;
}

/**
 * Dijkstra's Algorithm (Uniform Cost Search)
 * Special case of A* where h(n) = 0 for all nodes.
 * Guarantees optimal path by expanding nodes strictly in order of g(n).
 */
export function runDijkstra(
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord,
  walls: Set<string>
): AlgorithmExecutionOutput {
  if (
    rows <= 0 ||
    cols <= 0 ||
    !isInBounds(start.r, start.c, rows, cols) ||
    !isInBounds(target.r, target.c, rows, cols)
  ) {
    return {
      path: [],
      visitedOrder: [],
      trace: [],
      found: false,
      maxFrontierSize: 0,
    };
  }

  const startKey = `${start.r},${start.c}`;
  const targetKey = `${target.r},${target.c}`;

  const safeWalls = new Set(walls);
  safeWalls.delete(startKey);
  safeWalls.delete(targetKey);

  if (start.r === target.r && start.c === target.c) {
    return {
      path: [start],
      visitedOrder: [start],
      trace: [
        {
          step: 0,
          type: 'visit',
          coord: start,
          gScore: 0,
          frontierSize: 0,
          explanation: `Start and Target are identical (${start.r}, ${start.c}). Path found immediately.`,
          pseudocodeLine: 5,
        },
      ],
      found: true,
      maxFrontierSize: 1,
    };
  }

  const distMap: Map<string, number> = new Map();
  const parentMap: Map<string, GridCoord> = new Map();
  const visitedSet: Set<string> = new Set();
  const unvisitedNodes: Map<string, DijkstraNode> = new Map();
  const visitedOrder: GridCoord[] = [];
  const trace: SearchEvent[] = [];

  distMap.set(startKey, 0);
  unvisitedNodes.set(startKey, { coord: start, dist: 0 });

  let step = 0;
  let maxFrontierSize = 1;
  let found = false;

  trace.push({
    step: step++,
    type: 'frontier_add',
    coord: start,
    gScore: 0,
    frontierSize: 1,
    explanation: `Set distance to start (${start.r}, ${start.c}) = 0. Added to Dijkstra priority queue.`,
    pseudocodeLine: 2,
  });

  while (unvisitedNodes.size > 0) {
    if (unvisitedNodes.size > maxFrontierSize) {
      maxFrontierSize = unvisitedNodes.size;
    }

    let minKey: string | null = null;
    let minDist = Infinity;

    for (const [key, node] of unvisitedNodes.entries()) {
      if (node.dist < minDist) {
        minDist = node.dist;
        minKey = key;
      }
    }

    if (!minKey || minDist === Infinity) break;

    const current = unvisitedNodes.get(minKey)!;
    unvisitedNodes.delete(minKey);
    visitedSet.add(minKey);
    visitedOrder.push(current.coord);

    trace.push({
      step: step++,
      type: 'visit',
      coord: current.coord,
      gScore: current.dist,
      frontierSize: unvisitedNodes.size,
      explanation: `Extracted minimum cost node (${current.coord.r}, ${current.coord.c}) with g=${current.dist}. Expanding neighbors radially.`,
      pseudocodeLine: 4,
    });

    if (minKey === targetKey) {
      found = true;
      trace.push({
        step: step++,
        type: 'visit',
        coord: current.coord,
        gScore: current.dist,
        frontierSize: unvisitedNodes.size,
        explanation: `Target node reached with verified optimal cost ${current.dist}.`,
        pseudocodeLine: 5,
      });
      break;
    }

    const neighbors = getNeighbors(current.coord, rows, cols);

    for (const neighbor of neighbors) {
      const nKey = `${neighbor.r},${neighbor.c}`;

      if (safeWalls.has(nKey) || visitedSet.has(nKey)) {
        continue;
      }

      const alt = current.dist + 1;
      const currentNeighborDist = distMap.get(nKey) ?? Infinity;

      if (alt < currentNeighborDist) {
        distMap.set(nKey, alt);
        parentMap.set(nKey, current.coord);
        unvisitedNodes.set(nKey, { coord: neighbor, dist: alt });

        trace.push({
          step: step++,
          type: 'frontier_add',
          coord: neighbor,
          parentCoord: current.coord,
          gScore: alt,
          frontierSize: unvisitedNodes.size,
          explanation: `Relaxed edge to neighbor (${neighbor.r}, ${neighbor.c}) with cost g=${alt}.`,
          pseudocodeLine: 8,
        });
      }
    }
  }

  const path = found ? reconstructPath(parentMap, target, start) : [];

  return {
    path,
    visitedOrder,
    trace,
    found,
    maxFrontierSize,
  };
}
