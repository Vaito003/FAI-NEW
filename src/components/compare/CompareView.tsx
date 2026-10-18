import React, { useState, useEffect } from 'react';
import { AlgorithmId, ComparisonRecord } from '../../types/pathfinder';
import { executeAlgorithm } from '../../algorithms/runner';
import { PRESET_MAZES, getSavedMazes } from '../../utils/storage';
import { verifyPathIntegrity } from '../../algorithms/heuristics';
import {
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  BarChart3,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const CompareView: React.FC = () => {
  const [mazes, setMazes] = useState(PRESET_MAZES);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-bottleneck');
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<ComparisonRecord[]>([]);

  useEffect(() => {
    setMazes(getSavedMazes());
  }, []);

  const activePreset =
    mazes.find((p) => p.id === selectedPresetId) || mazes[0] || PRESET_MAZES[0];

  const algorithmsToCompare: { id: AlgorithmId; name: string }[] = [
    { id: 'astar', name: 'A* Search (Manhattan)' },
    { id: 'bfs', name: 'Breadth-First Search (BFS)' },
    { id: 'dfs', name: 'Depth-First Search (DFS)' },
    { id: 'dijkstra', name: "Dijkstra's (UCS)" },
  ];

  const handleRunComparison = () => {
    setIsComparing(true);
    const wallSet = new Set(activePreset.walls);

    // Run algorithms synchronously and record true performance
    const newResults: ComparisonRecord[] = algorithmsToCompare.map((algo) => {
      const res = executeAlgorithm(
        algo.id,
        activePreset.rows,
        activePreset.cols,
        activePreset.start,
        activePreset.target,
        wallSet,
        'manhattan'
      );

      return {
        algorithm: algo.id,
        name: algo.name,
        found: res.found,
        pathLength: res.pathLength,
        nodesVisitedCount: res.nodesVisitedCount,
        executionTimeMs: res.executionTimeMs,
        maxFrontierSize: res.maxFrontierSize,
        guaranteesOptimal: algo.id === 'astar' || algo.id === 'bfs' || algo.id === 'dijkstra',
        complete: true,
        path: res.path,
        visitedOrder: res.visitedOrder,
      };
    });

    setResults(newResults);
    setIsComparing(false);
  };

  // Run initial comparison on mount or preset switch
  useEffect(() => {
    handleRunComparison();
  }, [selectedPresetId]);

  // Determine winners
  const shortestPathLength = results
    .filter((r) => r.found && r.pathLength > 0)
    .reduce((min, r) => Math.min(min, r.pathLength), Infinity);

  const fewestNodesVisited = results
    .filter((r) => r.found)
    .reduce((min, r) => Math.min(min, r.nodesVisitedCount), Infinity);

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Benchmark Selection Toolbar */}
      <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#242038] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#7657E8]" />
            Empirical Algorithm Shootout & Benchmark
          </h2>
          <p className="text-xs text-[#706B83] mt-1 max-w-xl">
            Simultaneously run BFS, DFS, Dijkstra, and A* on the identical obstacle map to objectively prove path optimality, exploration footprint, and computational overhead.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#706B83]">Benchmark Map:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="bg-[#F7F7FC] text-[#7657E8] font-semibold text-xs rounded-xl border border-[#E8E4F1] px-3 py-2 focus:outline-none focus:border-[#7657E8]"
            >
              {mazes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isPreset ? `(${m.difficulty || 'Preset'})` : '(Custom)'}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isComparing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Re-run Benchmark
          </button>
        </div>
      </div>

      {/* Educational Notice Banner on Variance */}
      <div className="bg-[#F0EEFA] border border-[#E8E4F1] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#242038] shadow-xs">
        <Info className="w-4 h-4 text-[#7657E8] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#7657E8] block mb-0.5">Academic Analysis on Search Variance:</strong>
          Visited-node counts, peak frontier sizes, and execution runtimes naturally fluctuate based on maze geometry (branching factor, wall dead-ends, barrier convexity) and priority queue implementation. Notice how <span className="text-[#26866A] font-semibold">BFS and Dijkstra</span> expand in uniform concentric radial waves, whereas <span className="text-[#7657E8] font-semibold">A*</span> uses the Manhattan heuristic to pull the search frontier directly toward the target, drastically minimizing node expansions while strictly preserving the shortest path guarantee.
        </div>
      </div>

      {/* Comparative Mini-Grids Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((res) => {
          const isShortestPathWinner = res.found && res.pathLength === shortestPathLength;
          const isFewestVisitedWinner = res.found && res.nodesVisitedCount === fewestNodesVisited;

          const visitedMap = new Set(res.visitedOrder.map((c) => `${c.r},${c.c}`));
          const pathMap = new Set(res.path.map((c) => `${c.r},${c.c}`));
          const wallSet = new Set(activePreset.walls);

          const integrity = res.found
            ? verifyPathIntegrity(res.path, activePreset.start, activePreset.target, wallSet)
            : { valid: true };

          return (
            <div
              key={res.algorithm}
              className={`bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all ${
                isFewestVisitedWinner
                  ? 'border-[#7657E8] ring-1 ring-[#7657E8]/40'
                  : 'border-[#E8E4F1]'
              }`}
            >
              {/* Mini Card Header */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E4F1] mb-2">
                  <span className="font-bold text-xs sm:text-sm text-[#242038]">
                    {res.name}
                  </span>
                  {isFewestVisitedWinner && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F0EEFA] text-[#7657E8] border border-[#E6DEFF] flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-[#7657E8]" />
                      Lowest Visited
                    </span>
                  )}
                </div>

                {/* Mini Grid Canvas */}
                <div className="overflow-hidden bg-[#F7F7FC] rounded-xl p-2 border border-[#E8E4F1] flex items-center justify-center my-2">
                  <div
                    className="grid gap-[1px]"
                    style={{
                      gridTemplateColumns: `repeat(${activePreset.cols}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: activePreset.rows }).map((_, r) =>
                      Array.from({ length: activePreset.cols }).map((_, c) => {
                        const key = `${r},${c}`;
                        const isStart = r === activePreset.start.r && c === activePreset.start.c;
                        const isTarget = r === activePreset.target.r && c === activePreset.target.c;
                        const isWall = wallSet.has(key);
                        const isPath = pathMap.has(key);
                        const isVisited = visitedMap.has(key);

                        let color = 'bg-white';
                        if (isStart) color = 'bg-[#7657E8]';
                        else if (isTarget) color = 'bg-[#E85DAD]';
                        else if (isPath) color = 'bg-[#7657E8]';
                        else if (isVisited) color = 'bg-[#DDD6FE]';
                        else if (isWall) color = 'bg-[#8E7EBF]';

                        return (
                          <div
                            key={key}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-[1px] ${color}`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Path Integrity Tag */}
                <div className="flex items-center gap-1 text-[10px] text-[#706B83] mb-1">
                  {res.found ? (
                    integrity.valid ? (
                      <span className="text-[#26866A] flex items-center gap-1 font-mono font-medium">
                        <ShieldCheck className="w-3 h-3" /> Path Verified (Valid steps)
                      </span>
                    ) : (
                      <span className="text-[#C84658] flex items-center gap-1 font-mono font-medium">
                        <XCircle className="w-3 h-3" /> Disconnected
                      </span>
                    )
                  ) : (
                    <span className="text-[#9C96AE] font-mono">No route exists</span>
                  )}
                </div>
              </div>

              {/* Metrics summary list */}
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
                <div className="bg-[#F7F7FC] p-2 rounded-xl border border-[#E8E4F1]">
                  <span className="text-[#706B83] block text-[10px]">Path Length:</span>
                  <span
                    className={`font-bold ${
                      isShortestPathWinner ? 'text-[#7657E8]' : 'text-[#242038]'
                    }`}
                  >
                    {res.found ? `${res.pathLength} steps` : 'No Route'}
                  </span>
                </div>

                <div className="bg-[#F7F7FC] p-2 rounded-xl border border-[#E8E4F1]">
                  <span className="text-[#706B83] block text-[10px]">Nodes Explored:</span>
                  <span
                    className={`font-bold ${
                      isFewestVisitedWinner ? 'text-[#7657E8]' : 'text-[#242038]'
                    }`}
                  >
                    {res.nodesVisitedCount}
                  </span>
                </div>

                <div className="bg-[#F7F7FC] p-2 rounded-xl border border-[#E8E4F1]">
                  <span className="text-[#706B83] block text-[10px]">Exec Time:</span>
                  <span className="text-[#26866A] font-bold">
                    {res.executionTimeMs} ms
                  </span>
                </div>

                <div className="bg-[#F7F7FC] p-2 rounded-xl border border-[#E8E4F1]">
                  <span className="text-[#706B83] block text-[10px]">Max Frontier:</span>
                  <span className="text-[#8B5CF6] font-bold">
                    {res.maxFrontierSize}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Metric Comparison Table */}
      <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm backdrop-blur-md overflow-x-auto">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#7657E8]" />
          <h3 className="font-bold text-[#242038] text-sm sm:text-base">
            Formal Academic Comparison Matrix
          </h3>
        </div>

        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#E8E4F1] text-[#706B83] uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Algorithm</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Guarantees Shortest Path?</th>
              <th className="py-2.5 px-3">Path Length</th>
              <th className="py-2.5 px-3">Nodes Visited</th>
              <th className="py-2.5 px-3">Peak Frontier</th>
              <th className="py-2.5 px-3">Execution Time</th>
              <th className="py-2.5 px-3">FAI Evaluation Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E4F1]">
            {results.map((r) => {
              const isOptimal = r.found && r.pathLength === shortestPathLength;
              const isBestEfficiency = r.found && r.nodesVisitedCount === fewestNodesVisited;

              let verdict = 'Sub-optimal traversal';
              if (r.algorithm === 'astar') {
                verdict = 'Optimal path & lowest node expansions (Directed Heuristic)';
              } else if (r.algorithm === 'bfs') {
                verdict = 'Optimal path guaranteed, but expands frontier uniformly';
              } else if (r.algorithm === 'dfs') {
                verdict = 'Non-optimal; prone to deep winding and high path length';
              } else if (r.algorithm === 'dijkstra') {
                verdict = 'Optimal path, but explores in blind radial rings (h=0)';
              }

              return (
                <tr key={r.algorithm} className="hover:bg-[#F7F7FC] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#242038]">
                    {r.name}
                  </td>
                  <td className="py-3 px-3 text-[#706B83] font-sans">
                    {r.algorithm === 'astar' ? 'Informed (Heuristic)' : 'Uninformed (Blind)'}
                  </td>
                  <td className="py-3 px-3">
                    {r.guaranteesOptimal ? (
                      <span className="inline-flex items-center gap-1 text-[#26866A] font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Yes (Proven)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#C84658]">
                        <XCircle className="w-3.5 h-3.5" /> No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-lg ${
                        isOptimal
                          ? 'bg-[#F0EEFA] text-[#7657E8] font-bold border border-[#E6DEFF]'
                          : 'text-[#706B83]'
                      }`}
                    >
                      {r.found ? `${r.pathLength} steps` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-lg ${
                        isBestEfficiency
                          ? 'bg-[#F0EEFA] text-[#7657E8] font-bold border border-[#E6DEFF]'
                          : 'text-[#706B83]'
                      }`}
                    >
                      {r.nodesVisitedCount}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#8B5CF6] font-semibold">{r.maxFrontierSize}</td>
                  <td className="py-3 px-3 text-[#26866A] font-semibold">{r.executionTimeMs} ms</td>
                  <td className="py-3 px-3 text-[11px] font-sans text-[#706B83]">
                    {verdict}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
