export interface GridCoord {
  r: number;
  c: number;
}

export type CellType = 'empty' | 'wall' | 'start' | 'target';

export type AlgorithmId = 'bfs' | 'dfs' | 'astar' | 'dijkstra' | 'greedy';

export type HeuristicType = 'manhattan' | 'euclidean' | 'chebyshev';

export type SearchStatus = 'idle' | 'running' | 'paused' | 'found' | 'not-found';

export interface SearchEvent {
  step: number;
  type: 'visit' | 'frontier_add' | 'dead_end';
  coord: GridCoord;
  parentCoord?: GridCoord;
  gScore?: number;
  hScore?: number;
  fScore?: number;
  frontierSize: number;
  explanation: string;
  pseudocodeLine: number;
}

export interface SearchResult {
  algorithm: AlgorithmId;
  found: boolean;
  path: GridCoord[];
  visitedOrder: GridCoord[];
  trace: SearchEvent[];
  executionTimeMs: number;
  nodesVisitedCount: number;
  pathLength: number; // Step moves (edges)
  pathNodeCount: number; // Total nodes including start
  maxFrontierSize: number;
  explorationEfficiency: number; // pathLength / nodesVisitedCount
}

export interface AlgorithmMetadata {
  id: AlgorithmId;
  name: string;
  shortName: string;
  category: 'Uninformed (Blind)' | 'Informed (Heuristic)' | 'Uninformed (Uniform Cost)';
  guaranteesShortestPath: boolean;
  complete: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  dataStructure: string;
  summary: string;
  heuristicFormula?: string;
  pseudocode: {
    line: number;
    code: string;
    description: string;
  }[];
}

export interface SavedMaze {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  start: GridCoord;
  target: GridCoord;
  walls: string[]; // Set serialized as "r,c" strings
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  isPreset?: boolean;
  createdAt: number;
}

export interface ComparisonRecord {
  algorithm: AlgorithmId;
  name: string;
  found: boolean;
  pathLength: number;
  nodesVisitedCount: number;
  executionTimeMs: number;
  maxFrontierSize: number;
  guaranteesOptimal: boolean;
  complete: boolean;
  path: GridCoord[];
  visitedOrder: GridCoord[];
}
