import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';
import { executeAlgorithm } from '../../algorithms/runner';
import { GridCoord, AlgorithmId } from '../../types/pathfinder';
import { soundEngine } from '../../utils/audio';

interface OpeningExperienceProps {
  onEnterLab: (algorithm?: AlgorithmId) => void;
}

export const OpeningExperience: React.FC<OpeningExperienceProps> = ({ onEnterLab }) => {
  // Dimensions for hero interactive canvas (13 rows x 27 cols)
  const rows = 13;
  const cols = 27;

  const [start, setStart] = useState<GridCoord>({ r: 6, c: 2 });
  const [target, setTarget] = useState<GridCoord>({ r: 6, c: 24 });
  const [activeAlgo, setActiveAlgo] = useState<AlgorithmId>('astar');
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  // Procedural barrier setup with clean geometric layout
  const [walls, setWalls] = useState<Set<string>>(() => {
    const initialWalls = new Set<string>();
    // Left staggered barrier
    for (let r = 2; r <= 10; r++) {
      if (r !== 4 && r !== 8) {
        initialWalls.add(`${r},8`);
      }
    }
    // Right staggered barrier
    for (let r = 2; r <= 10; r++) {
      if (r !== 3 && r !== 9) {
        initialWalls.add(`${r},18`);
      }
    }
    // Center island obstacles
    initialWalls.add('4,13');
    initialWalls.add('5,13');
    initialWalls.add('7,13');
    initialWalls.add('8,13');
    return initialWalls;
  });

  const [pathNodes, setPathNodes] = useState<GridCoord[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<GridCoord[]>([]);
  const [execTime, setExecTime] = useState<number>(0);
  const [animatedPathCount, setAnimatedPathCount] = useState<number>(0);
  const animIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Compute live solution whenever start, target, walls, or algo changes
  useEffect(() => {
    const res = executeAlgorithm(
      activeAlgo,
      rows,
      cols,
      start,
      target,
      walls,
      'manhattan'
    );
    setPathNodes(res.path);
    setVisitedNodes(res.visitedOrder);
    setExecTime(res.executionTimeMs);
    setAnimatedPathCount(res.path.length); // initially full
  }, [activeAlgo, start, target, walls]);

  // Animated path pulsation loop
  useEffect(() => {
    if (pathNodes.length === 0) return;

    let current = 0;
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    animIntervalRef.current = setInterval(() => {
      current = (current + 1) % (pathNodes.length + 8);
      setAnimatedPathCount(Math.min(current, pathNodes.length));
    }, 45);

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [pathNodes]);

  const handleCellClick = (r: number, c: number) => {
    if ((r === start.r && c === start.c) || (r === target.r && c === target.c)) return;
    soundEngine.playClick(520);

    setWalls((prev) => {
      const next = new Set(prev);
      const key = `${r},${c}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleResetWalls = () => {
    soundEngine.playClick(400);
    setWalls(new Set());
  };

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleEnter = (algo?: AlgorithmId) => {
    soundEngine.playSuccessChime();
    onEnterLab(algo || activeAlgo);
  };

  const pathSubset = pathNodes.slice(0, animatedPathCount);
  const pathSet = new Set(pathSubset.map((p) => `${p.r},${p.c}`));
  const fullPathSet = new Set(pathNodes.map((p) => `${p.r},${p.c}`));
  const visitedSet = new Set(visitedNodes.map((v) => `${v.r},${v.c}`));

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-between px-4 sm:px-8 py-8 md:py-12 overflow-hidden cyber-grid-bg select-none">
      {/* Ambient Pearl & Lavender Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-gradient-to-tr from-[#7657E8]/10 via-[#E85DAD]/5 to-transparent rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-[#E6DEFF]/40 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#F0EEFA] rounded-full blur-[90px] pointer-events-none" />

      {/* Top Academic & Audio Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-xs font-mono text-[#706B83]">
        <div className="flex items-center gap-2">
          <span className="text-[#242038] font-medium">Foundations of Artificial Intelligence</span>
          <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
          <span className="text-[#7657E8] font-semibold">Route Planning Laboratory</span>
        </div>

        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 border border-[#E8E4F1] hover:border-[#C4B9E7] text-[#706B83] hover:text-[#242038] transition-colors shadow-xs"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#9C96AE]" /> : <Volume2 className="w-3.5 h-3.5 text-[#7657E8]" />}
          <span>{isMuted ? 'Muted' : 'Audio Active'}</span>
        </button>
      </div>

      {/* Central Hero Block: Oversized Editorial Typography */}
      <div className="relative z-10 text-center max-w-4xl mt-6 sm:mt-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EEFA] border border-[#E8E4F1] text-xs font-mono text-[#7657E8] font-semibold mb-4 shadow-xs">
          <Compass className="w-3.5 h-3.5 text-[#7657E8]" />
          <span>Interactive AI Search Lab</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-[#242038] leading-none font-sans">
          PATHFINDER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7657E8] via-[#8B5CF6] to-[#E85DAD]">AI</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-[#706B83] font-normal mt-5 max-w-2xl leading-relaxed tracking-wide">
          Every path reveals a different kind of intelligence.
        </p>

        {/* Enter Laboratory Action Button */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleEnter('astar')}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-bold text-sm tracking-wide shadow-[0_8px_25px_rgba(118,87,232,0.3)] transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Enter Laboratory</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button
            onClick={() => handleEnter('bfs')}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F7FC] border border-[#E8E4F1] text-[#242038] text-sm font-semibold shadow-xs transition-all hover:border-[#C4B9E7] cursor-pointer"
          >
            Direct Visualizer
          </button>
        </div>
      </div>

      {/* Live Interactive Hero Maze Canvas Preview */}
      <div className="relative z-10 w-full max-w-4xl mt-8 mb-4 flex flex-col items-center">
        {/* Sub-toolbar for preview algorithm selection & interactive hint */}
        <div className="flex flex-wrap items-center justify-between w-full px-4 py-2.5 bg-white/95 border border-[#E8E4F1] rounded-t-xl backdrop-blur-md text-xs text-[#242038] shadow-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7657E8]" />
            <span className="font-semibold text-[#242038]">Interactive Sandbox:</span>
            <span className="text-[#706B83] text-xs hidden sm:inline">
              Click cells to place or remove walls
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'astar' as AlgorithmId, label: 'A* Intelligence' },
              { id: 'bfs' as AlgorithmId, label: 'BFS Wavefront' },
              { id: 'dfs' as AlgorithmId, label: 'DFS Depth Trail' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  soundEngine.playClick(700);
                  setActiveAlgo(a.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeAlgo === a.id
                    ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                    : 'text-[#706B83] hover:text-[#242038] hover:bg-[#F0EEFA]'
                }`}
              >
                {a.label}
              </button>
            ))}

            <button
              onClick={handleResetWalls}
              className="p-1 rounded text-[#706B83] hover:text-[#242038] hover:bg-[#F0EEFA] ml-1"
              title="Clear Barriers"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Interactive Grid Board */}
        <div
          className="w-full bg-white border-x border-b border-[#E8E4F1] p-3 sm:p-4 rounded-b-xl shadow-md flex flex-col items-center overflow-x-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="grid gap-[2px] bg-[#F0EEFA] p-2 rounded-lg border border-[#E8E4F1]"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: '860px',
            }}
          >
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const key = `${r},${c}`;
                const isStart = r === start.r && c === start.c;
                const isTarget = r === target.r && c === target.c;
                const isWall = walls.has(key);
                const isPathAnimated = pathSet.has(key);
                const isFullPath = fullPathSet.has(key);
                const isVisited = visitedSet.has(key);

                let cellBg = 'bg-white hover:bg-[#F7F7FC] border border-[#E8E4F1]';
                let cellContent = null;

                if (isStart) {
                  cellBg = 'bg-[#7657E8] ring-2 ring-[#E6DEFF] shadow-xs z-20 rounded-[2px]';
                  cellContent = <span className="w-2 h-2 rounded-full bg-white shadow-xs" />;
                } else if (isTarget) {
                  cellBg = 'bg-[#E85DAD] ring-2 ring-[#FCE7F3] shadow-xs z-20 rounded-[2px]';
                  cellContent = <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />;
                } else if (isPathAnimated) {
                  cellBg = 'bg-[#7657E8] shadow-xs z-10 rounded-[2px]';
                } else if (isFullPath) {
                  cellBg = 'bg-[#E6DEFF] border border-[#C4B9E7] rounded-[2px]';
                } else if (isWall) {
                  cellBg = 'bg-[#8E7EBF] border border-[#7664A8] shadow-inner rounded-[2px]';
                } else if (isVisited) {
                  cellBg = 'bg-[#F0EEFA] border border-[#E8E4F1] rounded-[2px]';
                }

                return (
                  <div
                    key={key}
                    onClick={() => handleCellClick(r, c)}
                    className={`aspect-square rounded-[2px] flex items-center justify-center cursor-pointer transition-all duration-100 ${cellBg}`}
                    title={`Coordinate: (${r}, ${c})`}
                  >
                    {cellContent}
                  </div>
                );
              })
            )}
          </div>

          {/* Live mini stats telemetry footer */}
          <div className="flex flex-wrap items-center justify-between w-full max-w-[860px] pt-3 text-xs font-mono text-[#706B83]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7657E8]" /> Start: ({start.r}, {start.c})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E85DAD]" /> Target: ({target.r}, {target.c})
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span>
                Path Length: <strong className="text-[#7657E8] tabular-nums font-semibold">{pathNodes.length > 0 ? pathNodes.length - 1 : 0} steps</strong>
              </span>
              <span>
                Explored: <strong className="text-[#242038] tabular-nums font-semibold">{visitedNodes.length} nodes</strong>
              </span>
              <span>
                Computed: <strong className="text-[#26866A] tabular-nums font-semibold">{execTime} ms</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Technical Specifications Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-xs font-mono text-[#706B83]">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#7657E8]" />
          <span>Client-Side TypeScript</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#7657E8]" />
          <span>2D Planar & 3D Isometric Viewports</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#26866A]" />
          <span>Provable Heuristic Optimality</span>
        </div>
      </div>
    </div>
  );
};
