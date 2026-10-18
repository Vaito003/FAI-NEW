import { GridCoord } from '../../types/pathfinder';
import { runBFS } from '../bfs';
import { runDFS } from '../dfs';
import { runAStar } from '../astar';
import { runDijkstra } from '../dijkstra';
import { runGreedy } from '../greedy';
import { verifyPathIntegrity } from '../heuristics';

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'reachability' | 'unreachable' | 'walls' | 'optimality' | 'boundary';
  passed: boolean;
  algorithm: string;
  details: string;
  expected: string;
  actual: string;
}

export function runPathfinderTestSuite(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // Helper assertion
  const record = (
    id: string,
    name: string,
    category: TestCaseResult['category'],
    passed: boolean,
    algorithm: string,
    details: string,
    expected: string,
    actual: string
  ) => {
    results.push({
      id,
      name,
      category,
      passed,
      algorithm,
      details,
      expected,
      actual,
    });
  };

  // -------------------------------------------------------------
  // Test 1: Reachable Path on Open Grid (BFS, DFS, A*)
  // -------------------------------------------------------------
  {
    const rows = 5;
    const cols = 5;
    const start: GridCoord = { r: 1, c: 1 };
    const target: GridCoord = { r: 3, c: 3 };
    const walls = new Set<string>();
    const optimalDistance = Math.abs(start.r - target.r) + Math.abs(start.c - target.c); // 4 steps

    // 1.1 BFS
    const bfsRes = runBFS(rows, cols, start, target, walls);
    const bfsIntegrity = verifyPathIntegrity(bfsRes.path, start, target, walls);
    const bfsSteps = bfsRes.path.length > 0 ? bfsRes.path.length - 1 : 0;
    record(
      't1-bfs',
      'BFS Open Grid Reachability & Optimality',
      'reachability',
      bfsRes.found && bfsIntegrity.valid && bfsSteps === optimalDistance,
      'BFS',
      bfsIntegrity.reason || `Found valid path in ${bfsSteps} steps.`,
      `4 steps (optimal)`,
      `${bfsSteps} steps`
    );

    // 1.2 A*
    const astarRes = runAStar(rows, cols, start, target, walls, 'manhattan');
    const astarIntegrity = verifyPathIntegrity(astarRes.path, start, target, walls);
    const astarSteps = astarRes.path.length > 0 ? astarRes.path.length - 1 : 0;
    record(
      't1-astar',
      'A* Open Grid Reachability & Optimality',
      'reachability',
      astarRes.found && astarIntegrity.valid && astarSteps === optimalDistance,
      'A*',
      astarIntegrity.reason || `Found valid path in ${astarSteps} steps.`,
      `4 steps (optimal)`,
      `${astarSteps} steps`
    );

    // 1.3 DFS
    const dfsRes = runDFS(rows, cols, start, target, walls);
    const dfsIntegrity = verifyPathIntegrity(dfsRes.path, start, target, walls);
    const dfsSteps = dfsRes.path.length > 0 ? dfsRes.path.length - 1 : 0;
    record(
      't1-dfs',
      'DFS Open Grid Reachability & Contiguity',
      'reachability',
      dfsRes.found && dfsIntegrity.valid && dfsSteps >= optimalDistance,
      'DFS',
      dfsIntegrity.reason || `Found valid contiguous path in ${dfsSteps} steps.`,
      `>= 4 steps`,
      `${dfsSteps} steps`
    );
  }

  // -------------------------------------------------------------
  // Test 2: Wall Avoidance Around a Solid Obstacle Barrier
  // -------------------------------------------------------------
  {
    const rows = 7;
    const cols = 7;
    const start: GridCoord = { r: 3, c: 1 };
    const target: GridCoord = { r: 3, c: 5 };
    // Vertical wall cutting rows 1 to 5 at column 3
    const walls = new Set<string>(['1,3', '2,3', '3,3', '4,3', '5,3']);

    ['bfs', 'astar', 'dfs', 'dijkstra'].forEach((algoKey) => {
      let res;
      if (algoKey === 'bfs') res = runBFS(rows, cols, start, target, walls);
      else if (algoKey === 'astar') res = runAStar(rows, cols, start, target, walls, 'manhattan');
      else if (algoKey === 'dfs') res = runDFS(rows, cols, start, target, walls);
      else res = runDijkstra(rows, cols, start, target, walls);

      const integrity = verifyPathIntegrity(res.path, start, target, walls);
      const steps = res.path.length > 0 ? res.path.length - 1 : 0;

      record(
        `t2-${algoKey}`,
        `Wall Avoidance Navigation (${algoKey.toUpperCase()})`,
        'walls',
        res.found && integrity.valid,
        algoKey.toUpperCase(),
        integrity.reason || `Navigated around vertical barrier without collision in ${steps} steps.`,
        'Valid path avoiding all 5 wall cells',
        integrity.valid ? 'Passed (Zero collisions)' : 'Failed (Collision or Disconnected)'
      );
    });
  }

  // -------------------------------------------------------------
  // Test 3: Unreachable Destination (Target Fully Enclosed by Walls)
  // -------------------------------------------------------------
  {
    const rows = 7;
    const cols = 7;
    const start: GridCoord = { r: 1, c: 1 };
    const target: GridCoord = { r: 5, c: 5 };
    // Box target in completely
    const walls = new Set<string>(['4,5', '6,5', '5,4', '5,6']);

    ['bfs', 'astar', 'dfs'].forEach((algoKey) => {
      let res;
      if (algoKey === 'bfs') res = runBFS(rows, cols, start, target, walls);
      else if (algoKey === 'astar') res = runAStar(rows, cols, start, target, walls);
      else res = runDFS(rows, cols, start, target, walls);

      const passed = !res.found && res.path.length === 0;

      record(
        `t3-${algoKey}`,
        `Trapped Target Unreachability (${algoKey.toUpperCase()})`,
        'unreachable',
        passed,
        algoKey.toUpperCase(),
        passed ? 'Correctly detected that no route exists.' : 'Erroneously reported path found!',
        'found: false, path: []',
        `found: ${res.found}, path: [${res.path.length} nodes]`
      );
    });
  }

  // -------------------------------------------------------------
  // Test 4: Shortest Path Guarantee: BFS & A* vs Sub-optimal Detour
  // -------------------------------------------------------------
  {
    const rows = 7;
    const cols = 9;
    const start: GridCoord = { r: 3, c: 1 };
    const target: GridCoord = { r: 3, c: 7 };
    // Creates a short path and a forced long detour
    const walls = new Set<string>([
      '2,2', '2,3', '2,4', '2,5', '2,6',
      '4,2', '4,3', '4,4', '4,5', '4,6',
    ]);

    const bfs = runBFS(rows, cols, start, target, walls);
    const astar = runAStar(rows, cols, start, target, walls, 'manhattan');
    const dijkstra = runDijkstra(rows, cols, start, target, walls);

    const bfsSteps = bfs.path.length - 1;
    const astarSteps = astar.path.length - 1;
    const dijkstraSteps = dijkstra.path.length - 1;

    const allOptimalEqual = bfsSteps === 6 && astarSteps === 6 && dijkstraSteps === 6;

    record(
      't4-optimality',
      'BFS, A*, and Dijkstra Equal Optimal Shortest Path',
      'optimality',
      allOptimalEqual,
      'BFS / A* / Dijkstra',
      `Corridor test: BFS=${bfsSteps}, A*=${astarSteps}, Dijkstra=${dijkstraSteps}`,
      'All equal 6 steps',
      `BFS=${bfsSteps}, A*=${astarSteps}, Dijkstra=${dijkstraSteps}`
    );
  }

  // -------------------------------------------------------------
  // Test 5: Boundary Case - Start equals Target
  // -------------------------------------------------------------
  {
    const rows = 5;
    const cols = 5;
    const coord: GridCoord = { r: 2, c: 2 };
    const walls = new Set<string>();

    const bfs = runBFS(rows, cols, coord, coord, walls);
    const astar = runAStar(rows, cols, coord, coord, walls);
    const dfs = runDFS(rows, cols, coord, coord, walls);

    const bfsPassed = bfs.found && bfs.path.length === 1 && bfs.path[0].r === 2 && bfs.path[0].c === 2;
    const astarPassed = astar.found && astar.path.length === 1 && astar.path[0].r === 2 && astar.path[0].c === 2;
    const dfsPassed = dfs.found && dfs.path.length === 1 && dfs.path[0].r === 2 && dfs.path[0].c === 2;

    record(
      't5-start-equals-target',
      'Boundary: Start equals Target (Zero Movement)',
      'boundary',
      bfsPassed && astarPassed && dfsPassed,
      'All Algorithms',
      'Start and Target at identical coordinate',
      'found: true, path: [start], 0 steps',
      `BFS=${bfs.path.length} node, A*=${astar.path.length} node, DFS=${dfs.path.length} node`
    );
  }

  // -------------------------------------------------------------
  // Test 6: Boundary Case - Adjacent Endpoints (Distance = 1)
  // -------------------------------------------------------------
  {
    const rows = 5;
    const cols = 5;
    const start: GridCoord = { r: 2, c: 2 };
    const target: GridCoord = { r: 2, c: 3 };
    const walls = new Set<string>();

    const astar = runAStar(rows, cols, start, target, walls);
    const integrity = verifyPathIntegrity(astar.path, start, target, walls);
    const steps = astar.path.length - 1;

    record(
      't6-adjacent-endpoints',
      'Boundary: Adjacent Endpoints (1-Step Jump)',
      'boundary',
      astar.found && integrity.valid && steps === 1,
      'A*',
      'Start and Target immediately neighboring',
      'found: true, path: 1 step (2 nodes)',
      `steps: ${steps}, valid: ${integrity.valid}`
    );
  }

  // -------------------------------------------------------------
  // Test 7: Boundary Case - Wall Exclusion on Start / Target
  // -------------------------------------------------------------
  {
    const rows = 5;
    const cols = 5;
    const start: GridCoord = { r: 1, c: 1 };
    const target: GridCoord = { r: 1, c: 3 };
    // Pass walls containing the exact coordinates of start and target
    const dirtyWalls = new Set<string>(['1,1', '1,3']);

    const bfs = runBFS(rows, cols, start, target, dirtyWalls);
    const astar = runAStar(rows, cols, start, target, dirtyWalls);

    const passed = bfs.found && astar.found && bfs.path[0].r === 1 && astar.path[0].r === 1;

    record(
      't7-endpoint-protection',
      'Boundary: Endpoint Wall Exclusion Safety',
      'boundary',
      passed,
      'BFS & A*',
      'Start/Target coordinates shielded from accidental wall overwrite',
      'found: true (Endpoints protected from wall corruption)',
      `BFS found: ${bfs.found}, A* found: ${astar.found}`
    );
  }

  // -------------------------------------------------------------
  // Test 8: Boundary Case - Invalid / Zero Dimensions
  // -------------------------------------------------------------
  {
    const bfs = runBFS(0, 0, { r: 0, c: 0 }, { r: 1, c: 1 }, new Set());
    const astar = runAStar(-1, 5, { r: 0, c: 0 }, { r: 0, c: 1 }, new Set());

    const passed = !bfs.found && bfs.path.length === 0 && !astar.found && astar.path.length === 0;

    record(
      't8-invalid-dims',
      'Boundary: Zero / Negative Grid Dimensions',
      'boundary',
      passed,
      'BFS & A*',
      'Handled gracefully without throwing exceptions',
      'found: false, path: []',
      `BFS found=${bfs.found}, A* found=${astar.found}`
    );
  }

  return results;
}
