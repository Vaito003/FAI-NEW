import { GridCoord, HeuristicType, SearchEvent } from '../types/pathfinder';
import { calculateHeuristic, getNeighbors, isInBounds, reconstructPath } from './heuristics';
import { AlgorithmExecutionOutput } from './bfs';

interface AStarNode {
  coord: GridCoord;
  g: number;
  h: number;
  f: number;
}

/**
 * A* (A-Star) Search Algorithm
 * Uses evaluation function: f(n) = g(n) + h(n)
 * Where:
 *  g(n) = exact cost from start to node n
 *  h(n) = estimated heuristic cost from n to target
 *  f(n) = estimated total cost of path through n
 *
 * Guarantees optimal (shortest) path when h(n) is admissible and consistent (e.g. Manhattan distance).
 */
export function runAStar(
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord,
  walls: Set<string>,
  heuristicType: HeuristicType = 'manhattan'
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
          gScore: 0,
          hScore: 0,
          fScore: 0,
          frontierSize: 0,
          explanation: `Start and Target are identical (${start.r}, ${start.c}). Path found immediately.`,
          pseudocodeLine: 5,
        },
      ],
      found: true,
      maxFrontierSize: 1,
    };
  }

  const openSet: Map<string, AStarNode> = new Map();
  const closedSet: Set<string> = new Set();
  const parentMap: Map<string, GridCoord> = new Map();
  const gScoreMap: Map<string, number> = new Map();
  const visitedOrder: GridCoord[] = [];
  const trace: SearchEvent[] = [];

  const initialH = calculateHeuristic(start, target, heuristicType);
  gScoreMap.set(startKey, 0);

  const startNode: AStarNode = {
    coord: start,
    g: 0,
    h: initialH,
    f: initialH,
  };

  openSet.set(startKey, startNode);

  let step = 0;
  let maxFrontierSize = 1;
  let found = false;

  trace.push({
    step: step++,
    type: 'frontier_add',
    coord: start,
    gScore: 0,
    hScore: initialH,
    fScore: initialH,
    frontierSize: 1,
    explanation: `Initialized start node (${start.r}, ${start.c}) in A* Open List: g=0, h=${initialH.toFixed(1)}, f=${initialH.toFixed(1)}.`,
    pseudocodeLine: 2,
  });

  while (openSet.size > 0) {
    if (openSet.size > maxFrontierSize) {
      maxFrontierSize = openSet.size;
    }

    // Extract node with minimum f-score (tie-breaker: lower h-score)
    let bestKey: string | null = null;
    let bestNode: AStarNode | null = null;

    for (const [key, node] of openSet.entries()) {
      if (!bestNode) {
        bestKey = key;
        bestNode = node;
      } else if (node.f < bestNode.f) {
        bestKey = key;
        bestNode = node;
      } else if (node.f === bestNode.f && node.h < bestNode.h) {
        bestKey = key;
        bestNode = node;
      }
    }

    if (!bestKey || !bestNode) break;

    // Pop from open set and add to closed set
    openSet.delete(bestKey);
    closedSet.add(bestKey);
    visitedOrder.push(bestNode.coord);

    trace.push({
      step: step++,
      type: 'visit',
      coord: bestNode.coord,
      gScore: bestNode.g,
      hScore: bestNode.h,
      fScore: bestNode.f,
      frontierSize: openSet.size,
      explanation: `Selected lowest f-score node (${bestNode.coord.r}, ${bestNode.coord.c}) with f=${bestNode.f.toFixed(1)} (g=${bestNode.g}, h=${bestNode.h.toFixed(1)}).`,
      pseudocodeLine: 4,
    });

    if (bestKey === targetKey) {
      found = true;
      trace.push({
        step: step++,
        type: 'visit',
        coord: bestNode.coord,
        gScore: bestNode.g,
        hScore: 0,
        fScore: bestNode.g,
        frontierSize: openSet.size,
        explanation: `Target node (${target.r}, ${target.c}) reached! Proven optimal route with g=${bestNode.g}.`,
        pseudocodeLine: 5,
      });
      break;
    }

    const neighbors = getNeighbors(bestNode.coord, rows, cols);

    for (const neighbor of neighbors) {
      const nKey = `${neighbor.r},${neighbor.c}`;

      if (safeWalls.has(nKey) || closedSet.has(nKey)) {
        continue;
      }

      const tentativeG = bestNode.g + 1; // Unweighted edge cost = 1
      const currentG = gScoreMap.get(nKey) ?? Infinity;

      if (tentativeG < currentG) {
        // Shorter path found to this neighbor!
        gScoreMap.set(nKey, tentativeG);
        parentMap.set(nKey, bestNode.coord);

        const h = calculateHeuristic(neighbor, target, heuristicType);
        const f = tentativeG + h;

        const isUpdate = openSet.has(nKey);
        openSet.set(nKey, {
          coord: neighbor,
          g: tentativeG,
          h,
          f,
        });

        trace.push({
          step: step++,
          type: 'frontier_add',
          coord: neighbor,
          parentCoord: bestNode.coord,
          gScore: tentativeG,
          hScore: h,
          fScore: f,
          frontierSize: openSet.size,
          explanation: isUpdate
            ? `Updated node (${neighbor.r}, ${neighbor.c}) with cheaper g-score: g=${tentativeG}, f=${f.toFixed(1)}.`
            : `Discovered neighbor (${neighbor.r}, ${neighbor.c}) in frontier: g=${tentativeG}, h=${h.toFixed(1)}, f=${f.toFixed(1)}.`,
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
