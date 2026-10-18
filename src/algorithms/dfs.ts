import { GridCoord, SearchEvent } from '../types/pathfinder';
import { getNeighbors, isInBounds, reconstructPath } from './heuristics';
import { AlgorithmExecutionOutput } from './bfs';

/**
 * Depth-First Search (DFS)
 * Uses a LIFO Stack data structure.
 * Explores along current path as far as possible before backtracking.
 * May return a longer valid path than BFS/A*.
 */
export function runDFS(
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

  // Edge case: Start is Target
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

  const stack: { coord: GridCoord; parent?: GridCoord }[] = [{ coord: start }];
  const visitedSet = new Set<string>();
  const parentMap = new Map<string, GridCoord>();
  const visitedOrder: GridCoord[] = [];
  const trace: SearchEvent[] = [];

  let step = 0;
  let maxFrontierSize = 1;
  let found = false;

  trace.push({
    step: step++,
    type: 'frontier_add',
    coord: start,
    frontierSize: 1,
    explanation: `Pushed start node (${start.r}, ${start.c}) onto DFS LIFO Stack.`,
    pseudocodeLine: 2,
  });

  while (stack.length > 0) {
    if (stack.length > maxFrontierSize) {
      maxFrontierSize = stack.length;
    }

    const { coord: current, parent } = stack.pop()!;
    const currKey = `${current.r},${current.c}`;

    if (visitedSet.has(currKey)) {
      continue;
    }

    visitedSet.add(currKey);
    if (parent) {
      parentMap.set(currKey, parent);
    }
    visitedOrder.push(current);

    trace.push({
      step: step++,
      type: 'visit',
      coord: current,
      frontierSize: stack.length,
      explanation: `Popped (${current.r}, ${current.c}) from top of stack. Expanding deeper down this branch.`,
      pseudocodeLine: 4,
    });

    if (currKey === targetKey) {
      found = true;
      trace.push({
        step: step++,
        type: 'visit',
        coord: current,
        frontierSize: stack.length,
        explanation: `Target node (${target.r}, ${target.c}) reached along current depth branch!`,
        pseudocodeLine: 5,
      });
      break;
    }

    const neighbors = getNeighbors(current, rows, cols);
    let pushedNeighbors = 0;

    // Push neighbors in reverse order so first neighbor is popped first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      const nKey = `${neighbor.r},${neighbor.c}`;

      if (safeWalls.has(nKey) || visitedSet.has(nKey)) {
        continue;
      }

      stack.push({ coord: neighbor, parent: current });
      pushedNeighbors++;

      trace.push({
        step: step++,
        type: 'frontier_add',
        coord: neighbor,
        parentCoord: current,
        frontierSize: stack.length,
        explanation: `Pushed unexplored neighbor (${neighbor.r}, ${neighbor.c}) onto LIFO Stack.`,
        pseudocodeLine: 8,
      });
    }

    if (pushedNeighbors === 0 && stack.length > 0) {
      trace.push({
        step: step++,
        type: 'dead_end',
        coord: current,
        frontierSize: stack.length,
        explanation: `Hit dead end at (${current.r}, ${current.c}). Backtracking up the stack.`,
        pseudocodeLine: 9,
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
