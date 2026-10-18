import { GridCoord, HeuristicType, SearchEvent } from '../types/pathfinder';
import { calculateHeuristic, getNeighbors, isInBounds, reconstructPath } from './heuristics';
import { AlgorithmExecutionOutput } from './bfs';

interface GreedyNode {
  coord: GridCoord;
  h: number;
}

/**
 * Greedy Best-First Search
 * Uses evaluation function: f(n) = h(n)
 * Prioritizes nodes that appear closest to the target. Fast, but not optimal.
 */
export function runGreedy(
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord,
  walls: Set<string>,
  heuristicType: HeuristicType = 'manhattan'
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
          hScore: 0,
          frontierSize: 0,
          explanation: `Start and Target are identical (${start.r}, ${start.c}). Path found immediately.`,
          pseudocodeLine: 5,
        },
      ],
      found: true,
      maxFrontierSize: 1,
    };
  }

  const openSet: Map<string, GreedyNode> = new Map();
  const visitedSet: Set<string> = new Set();
  const parentMap: Map<string, GridCoord> = new Map();
  const visitedOrder: GridCoord[] = [];
  const trace: SearchEvent[] = [];

  const initialH = calculateHeuristic(start, target, heuristicType);
  openSet.set(startKey, { coord: start, h: initialH });

  let step = 0;
  let maxFrontierSize = 1;
  let found = false;

  trace.push({
    step: step++,
    type: 'frontier_add',
    coord: start,
    hScore: initialH,
    frontierSize: 1,
    explanation: `Start node (${start.r}, ${start.c}) placed in greedy priority queue with h=${initialH.toFixed(1)}.`,
    pseudocodeLine: 2,
  });

  while (openSet.size > 0) {
    if (openSet.size > maxFrontierSize) {
      maxFrontierSize = openSet.size;
    }

    let minKey: string | null = null;
    let minH = Infinity;

    for (const [key, node] of openSet.entries()) {
      if (node.h < minH) {
        minH = node.h;
        minKey = key;
      }
    }

    if (!minKey || minH === Infinity) break;

    const current = openSet.get(minKey)!;
    openSet.delete(minKey);
    visitedSet.add(minKey);
    visitedOrder.push(current.coord);

    trace.push({
      step: step++,
      type: 'visit',
      coord: current.coord,
      hScore: current.h,
      frontierSize: openSet.size,
      explanation: `Greedily selected node (${current.coord.r}, ${current.coord.c}) closest to goal (h=${current.h.toFixed(1)}).`,
      pseudocodeLine: 4,
    });

    if (minKey === targetKey) {
      found = true;
      trace.push({
        step: step++,
        type: 'visit',
        coord: current.coord,
        hScore: 0,
        frontierSize: openSet.size,
        explanation: `Target reached! Terminating greedy search.`,
        pseudocodeLine: 5,
      });
      break;
    }

    const neighbors = getNeighbors(current.coord, rows, cols);

    for (const neighbor of neighbors) {
      const nKey = `${neighbor.r},${neighbor.c}`;

      if (safeWalls.has(nKey) || visitedSet.has(nKey) || openSet.has(nKey)) {
        continue;
      }

      const h = calculateHeuristic(neighbor, target, heuristicType);
      parentMap.set(nKey, current.coord);
      openSet.set(nKey, { coord: neighbor, h });

      trace.push({
        step: step++,
        type: 'frontier_add',
        coord: neighbor,
        parentCoord: current.coord,
        hScore: h,
        frontierSize: openSet.size,
        explanation: `Added neighbor (${neighbor.r}, ${neighbor.c}) with heuristic estimate h=${h.toFixed(1)}.`,
        pseudocodeLine: 8,
      });
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
