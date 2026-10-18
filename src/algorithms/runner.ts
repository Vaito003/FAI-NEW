import { AlgorithmId, GridCoord, HeuristicType, SearchResult } from '../types/pathfinder';
import { runBFS } from './bfs';
import { runDFS } from './dfs';
import { runAStar } from './astar';
import { runDijkstra } from './dijkstra';
import { runGreedy } from './greedy';

export function executeAlgorithm(
  algorithm: AlgorithmId,
  rows: number,
  cols: number,
  start: GridCoord,
  target: GridCoord,
  walls: Set<string>,
  heuristicType: HeuristicType = 'manhattan'
): SearchResult {
  const startTime = performance.now();

  let output;
  switch (algorithm) {
    case 'bfs':
      output = runBFS(rows, cols, start, target, walls);
      break;
    case 'dfs':
      output = runDFS(rows, cols, start, target, walls);
      break;
    case 'astar':
      output = runAStar(rows, cols, start, target, walls, heuristicType);
      break;
    case 'dijkstra':
      output = runDijkstra(rows, cols, start, target, walls);
      break;
    case 'greedy':
      output = runGreedy(rows, cols, start, target, walls, heuristicType);
      break;
    default:
      output = runAStar(rows, cols, start, target, walls, heuristicType);
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(2));
  const nodesVisitedCount = output.visitedOrder.length;
  const pathNodeCount = output.path.length;
  const pathLength = pathNodeCount > 0 ? pathNodeCount - 1 : 0;
  const explorationEfficiency = nodesVisitedCount > 0 ? parseFloat((pathLength / nodesVisitedCount).toFixed(3)) : 0;

  return {
    algorithm,
    found: output.found,
    path: output.path,
    visitedOrder: output.visitedOrder,
    trace: output.trace,
    executionTimeMs,
    nodesVisitedCount,
    pathLength,
    pathNodeCount,
    maxFrontierSize: output.maxFrontierSize,
    explorationEfficiency,
  };
}
