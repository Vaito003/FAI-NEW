import { GridCoord, SearchEvent } from '../types/pathfinder';
import { getNeighbors, isInBounds, reconstructPath } from './heuristics';

export interface AlgorithmExecutionOutput {
  path: GridCoord[];
  visitedOrder: GridCoord[];
  trace: SearchEvent[];
  found: boolean;
  maxFrontierSize: number;
}

/**
 * Breadth-First Search (BFS)
 * Uses a FIFO Queue data structure.
 * Guarantees shortest path in unweighted uniform-cost graphs.
 */
export function runBFS(
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord,
  walls: Set<string>
): AlgorithmExecutionOutput {
  // Boundary validation
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

  // Ensure walls do not block start or target coordinates
  const safeWalls = new Set(walls);
  safeWalls.delete(startKey);
  safeWalls.delete(targetKey);

  // Edge case: Start is already Target
  if (start.r === target.r && start.c === target.c) {
    return {
      path: [start],
      visitedOrder: [start],
      trace: [
        {
          step: 0,
          type: 'visit',
          coord: start,
          frontierSize: 0,
          explanation: `Start and Target are identical (${start.r}, ${start.c}). Path found immediately.`,
          pseudocodeLine: 5,
        },
      ],
      found: true,
      maxFrontierSize: 1,
    };
  }

  const queue: GridCoord[] = [start];
  const visitedSet = new Set<string>();
  const parentMap = new Map<string, GridCoord>();
  const visitedOrder: GridCoord[] = [];
  const trace: SearchEvent[] = [];

  visitedSet.add(startKey);
  let step = 0;
  let maxFrontierSize = 1;
  let found = false;

  trace.push({
    step: step++,
    type: 'frontier_add',
    coord: start,
    frontierSize: 1,
    explanation: `Initialized BFS FIFO Queue with start node (${start.r}, ${start.c}).`,
    pseudocodeLine: 2,
  });

  while (queue.length > 0) {
    if (queue.length > maxFrontierSize) {
      maxFrontierSize = queue.length;
    }

    const current = queue.shift()!;
    const currKey = `${current.r},${current.c}`;
    visitedOrder.push(current);

    trace.push({
      step: step++,
      type: 'visit',
      coord: current,
      frontierSize: queue.length,
      explanation: `Dequeued (${current.r}, ${current.c}) from front of queue. Exploring orthogonal neighbors.`,
      pseudocodeLine: 4,
    });

    if (currKey === targetKey) {
      found = true;
      trace.push({
        step: step++,
        type: 'visit',
        coord: current,
        frontierSize: queue.length,
        explanation: `Target node (${target.r}, ${target.c}) reached! Minimum uniform depth discovered.`,
        pseudocodeLine: 5,
      });
      break;
    }

    const neighbors = getNeighbors(current, rows, cols);
    let addedCount = 0;

    for (const neighbor of neighbors) {
      const nKey = `${neighbor.r},${neighbor.c}`;

      if (safeWalls.has(nKey) || visitedSet.has(nKey)) {
        continue;
      }

      visitedSet.add(nKey);
      parentMap.set(nKey, current);
      queue.push(neighbor);
      addedCount++;

      trace.push({
        step: step++,
        type: 'frontier_add',
        coord: neighbor,
        parentCoord: current,
        frontierSize: queue.length,
        explanation: `Discovered unvisited neighbor (${neighbor.r}, ${neighbor.c}). Enqueued to FIFO queue.`,
        pseudocodeLine: 8,
      });
    }

    if (addedCount === 0 && queue.length === 0 && !found) {
      trace.push({
        step: step++,
        type: 'dead_end',
        coord: current,
        frontierSize: 0,
        explanation: `Frontier exhausted without reaching target. Unreachable destination.`,
        pseudocodeLine: 10,
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
