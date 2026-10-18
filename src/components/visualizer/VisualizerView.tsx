import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GridCoord,
  AlgorithmId,
  HeuristicType,
  SearchResult,
  SearchStatus,
  SavedMaze,
} from '../../types/pathfinder';
import { executeAlgorithm } from '../../algorithms/runner';
import { generateMaze, MazeType } from '../../algorithms/mazeGenerators';
import { saveUserMaze, PRESET_MAZES } from '../../utils/storage';
import { GridCanvas } from './GridCanvas';
import { ControlsToolbar } from './ControlsToolbar';
import { PlaybackControls } from './PlaybackControls';
import { StatsPanel } from './StatsPanel';
import { EducationPanel } from './EducationPanel';
import { Legend } from '../Legend';
import { BookmarkPlus, Check, Sparkles, X, Info } from 'lucide-react';

interface VisualizerViewProps {
  initialMaze?: SavedMaze | null;
  onClearInitialMaze?: () => void;
  triggerDemoCount?: number;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({
  initialMaze,
  onClearInitialMaze,
  triggerDemoCount = 0,
}) => {
  // Grid Dimensions
  const [dimensions, setDimensions] = useState<{ rows: number; cols: number }>({
    rows: 21,
    cols: 37,
  });

  // Coordinates
  const [start, setStart] = useState<GridCoord>({ r: 10, c: 4 });
  const [target, setTarget] = useState<GridCoord>({ r: 10, c: 32 });
  const [walls, setWalls] = useState<Set<string>>(new Set());

  // Configuration
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('astar');
  const [heuristic, setHeuristic] = useState<HeuristicType>('manhattan');
  const [activeTool, setActiveTool] = useState<'wall' | 'erase' | 'move-start' | 'move-target'>('wall');

  // Playback state
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(30); // steps per batch

  // Render sets for visualization
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [frontierSet, setFrontierSet] = useState<Set<string>>(new Set());
  const [pathSet, setPathSet] = useState<Set<string>>(new Set());
  const [currentNode, setCurrentNode] = useState<GridCoord | undefined>(undefined);

  // Hover indicator
  const [hoverCoord, setHoverCoord] = useState<GridCoord | null>(null);

  // View Modes: 3D Isometric Perspective vs 2D Planar
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Demo Mode state
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  // Save Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mazeNameInput, setMazeNameInput] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  // Animation frame reference
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial maze if passed from Saved Mazes tab
  useEffect(() => {
    if (initialMaze) {
      setDimensions({ rows: initialMaze.rows, cols: initialMaze.cols });
      setStart(initialMaze.start);
      setTarget(initialMaze.target);
      setWalls(new Set(initialMaze.walls));
      handleClearPath();
      onClearInitialMaze?.();
    }
  }, [initialMaze]);

  // Clean animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  // Sync state up to a specified step index
  const applyStepState = useCallback(
    (stepIdx: number, result: SearchResult) => {
      const newVisited = new Set<string>();
      const newFrontier = new Set<string>();
      const newPath = new Set<string>();

      const maxStep = Math.min(stepIdx, result.trace.length);

      for (let i = 0; i < maxStep; i++) {
        const ev = result.trace[i];
        const key = `${ev.coord.r},${ev.coord.c}`;
        if (ev.type === 'visit') {
          newVisited.add(key);
          newFrontier.delete(key);
        } else if (ev.type === 'frontier_add') {
          if (!newVisited.has(key)) {
            newFrontier.add(key);
          }
        }
      }

      // If at end and path found, show path
      if (stepIdx >= result.trace.length && result.found) {
        result.path.forEach((p) => newPath.add(`${p.r},${p.c}`));
      }

      setVisitedSet(newVisited);
      setFrontierSet(newFrontier);
      setPathSet(newPath);

      const activeEvent = result.trace[Math.min(stepIdx, result.trace.length - 1)];
      setCurrentNode(activeEvent ? activeEvent.coord : undefined);
    },
    []
  );

  // Playback execution loop
  useEffect(() => {
    if (status !== 'running' || !searchResult) return;

    const totalSteps = searchResult.trace.length;

    if (currentStep >= totalSteps) {
      // Completed!
      setStatus(searchResult.found ? 'found' : 'not-found');
      applyStepState(totalSteps, searchResult);
      return;
    }

    // Determine how many steps to advance based on speed
    const stepIncrement = speed >= 80 ? Math.ceil(speed / 10) : 1;
    const intervalMs = speed >= 80 ? 15 : speed >= 30 ? 25 : speed >= 10 ? 50 : 150;

    animationTimerRef.current = setTimeout(() => {
      const nextStep = Math.min(currentStep + stepIncrement, totalSteps);
      setCurrentStep(nextStep);
      applyStepState(nextStep, searchResult);

      if (nextStep >= totalSteps) {
        setStatus(searchResult.found ? 'found' : 'not-found');
      }
    }, intervalMs);

    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [status, currentStep, searchResult, speed, applyStepState]);

  // Start search
  const handleRunSearch = () => {
    // If resuming from paused state
    if (status === 'paused' && searchResult) {
      setStatus('running');
      return;
    }

    // Clear old visual sets
    setVisitedSet(new Set());
    setFrontierSet(new Set());
    setPathSet(new Set());
    setCurrentNode(undefined);

    // Compute search result
    const result = executeAlgorithm(
      algorithm,
      dimensions.rows,
      dimensions.cols,
      start,
      target,
      walls,
      heuristic
    );

    setSearchResult(result);
    setCurrentStep(0);
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleStepForward = () => {
    let result = searchResult;
    if (!result) {
      result = executeAlgorithm(
        algorithm,
        dimensions.rows,
        dimensions.cols,
        start,
        target,
        walls,
        heuristic
      );
      setSearchResult(result);
    }

    const nextStep = Math.min(currentStep + 1, result.trace.length);
    setCurrentStep(nextStep);
    applyStepState(nextStep, result);

    if (nextStep >= result.trace.length) {
      setStatus(result.found ? 'found' : 'not-found');
    } else {
      setStatus('paused');
    }
  };

  const handleStepBackward = () => {
    if (!searchResult || currentStep <= 0) return;
    const prevStep = Math.max(0, currentStep - 1);
    setCurrentStep(prevStep);
    applyStepState(prevStep, searchResult);
    setStatus('paused');
  };

  const handleResetPlayback = () => {
    if (!searchResult) return;
    setCurrentStep(0);
    applyStepState(0, searchResult);
    setStatus('paused');
  };

  const handleJumpToEnd = () => {
    let result = searchResult;
    if (!result) {
      result = executeAlgorithm(
        algorithm,
        dimensions.rows,
        dimensions.cols,
        start,
        target,
        walls,
        heuristic
      );
      setSearchResult(result);
    }
    const endStep = result.trace.length;
    setCurrentStep(endStep);
    applyStepState(endStep, result);
    setStatus(result.found ? 'found' : 'not-found');
  };

  const handleScrubStep = (stepVal: number) => {
    if (!searchResult) return;
    setCurrentStep(stepVal);
    applyStepState(stepVal, searchResult);
    if (stepVal >= searchResult.trace.length) {
      setStatus(searchResult.found ? 'found' : 'not-found');
    } else {
      setStatus('paused');
    }
  };

  // Wall toggle handler with strict endpoint protection
  const handleToggleWall = (r: number, c: number, shouldAdd: boolean) => {
    if ((r === start.r && c === start.c) || (r === target.r && c === target.c)) {
      return;
    }

    setWalls((prev) => {
      const next = new Set(prev);
      const key = `${r},${c}`;
      if (shouldAdd) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });

    if (status !== 'idle') {
      handleClearPath();
    }
  };

  const handleClearPath = () => {
    setStatus('idle');
    setSearchResult(null);
    setCurrentStep(0);
    setVisitedSet(new Set());
    setFrontierSet(new Set());
    setPathSet(new Set());
    setCurrentNode(undefined);
  };

  const handleClearWalls = () => {
    setWalls(new Set());
    handleClearPath();
  };

  const handleResetAll = () => {
    handleClearWalls();
    setStart({ r: Math.floor(dimensions.rows / 2), c: 4 });
    setTarget({ r: Math.floor(dimensions.rows / 2), c: dimensions.cols - 5 });
    setIsDemoActive(false);
  };

  const handleGenerateMaze = (type: MazeType) => {
    handleClearPath();
    setIsDemoActive(false);
    const newWalls = generateMaze(type, dimensions.rows, dimensions.cols, start, target);
    setWalls(newWalls);
  };

  const handleChangeGridDimensions = (dims: { rows: number; cols: number }) => {
    setDimensions(dims);
    setStart({ r: Math.floor(dims.rows / 2), c: 3 });
    setTarget({ r: Math.floor(dims.rows / 2), c: dims.cols - 4 });
    setWalls(new Set());
    handleClearPath();
    setIsDemoActive(false);
  };

  // Launch One-Click College Showcase Demo
  const handleLaunchDemoMode = () => {
    const showcase = PRESET_MAZES[0];
    setDimensions({ rows: showcase.rows, cols: showcase.cols });
    setStart(showcase.start);
    setTarget(showcase.target);
    setWalls(new Set(showcase.walls));
    setAlgorithm('astar');
    setHeuristic('manhattan');
    setSpeed(30);
    setIsDemoActive(true);

    // Compute immediately and begin live playback
    setVisitedSet(new Set());
    setFrontierSet(new Set());
    setPathSet(new Set());
    setCurrentNode(undefined);

    const result = executeAlgorithm(
      'astar',
      showcase.rows,
      showcase.cols,
      showcase.start,
      showcase.target,
      new Set(showcase.walls),
      'manhattan'
    );

    setSearchResult(result);
    setCurrentStep(0);
    setStatus('running');
  };

  // Watch for external demo trigger from Navbar/Dashboard
  useEffect(() => {
    if (triggerDemoCount > 0) {
      handleLaunchDemoMode();
    }
  }, [triggerDemoCount]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') {
          handlePause();
        } else {
          handleRunSearch();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (status !== 'running') {
          handleStepForward();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (status !== 'running') {
          handleStepBackward();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (status !== 'running') {
          handleResetPlayback();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, searchResult, currentStep]);

  const handleSaveCurrentMaze = () => {
    if (!mazeNameInput.trim()) return;
    saveUserMaze({
      name: mazeNameInput.trim(),
      description: `Custom ${dimensions.rows}x${dimensions.cols} grid configuration`,
      rows: dimensions.rows,
      cols: dimensions.cols,
      start,
      target,
      walls: Array.from(walls),
    });
    setMazeNameInput('');
    setShowSaveModal(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const getDemoNarration = () => {
    if (!searchResult || searchResult.trace.length === 0) {
      return 'Loading FAI Showcase Challenge...';
    }
    const progress = currentStep / searchResult.trace.length;
    if (status === 'found') {
      return `DEMO COMPLETE: Optimal path found in ${searchResult.pathLength} steps! Notice how A* expanded far fewer nodes compared to blind search by using the Manhattan heuristic f(n) = g(n) + h(n).`;
    }
    if (progress < 0.25) {
      return 'STAGE 1 (Heuristic Launch): A* computes Manhattan distance h=30 to target (10, 33). Frontier is ordered by lowest f = g + h.';
    } else if (progress < 0.55) {
      return 'STAGE 2 (Bottleneck Funnel): At Column 11, the priority queue directs expansion through the narrow center opening without wasting states on the solid outer walls.';
    } else if (progress < 0.85) {
      return 'STAGE 3 (Concave Trap Avoidance): The U-shaped barrier at Columns 17-22 traps Greedy search, but A* balances g(n) with h(n), smoothly bypassing the dead end.';
    } else {
      return 'STAGE 4 (Target Reach): Optimal path secured! Backpointers reconstruct the shortest route backwards from target to start.';
    }
  };

  const activeEvent = searchResult?.trace[Math.min(currentStep, (searchResult.trace.length || 1) - 1)];

  return (
    <div className="flex flex-col gap-4">
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-white border border-[#26866A] text-[#26866A] px-4 py-2.5 rounded-xl shadow-xl animate-fade-in text-xs font-semibold">
          <Check className="w-4 h-4 text-[#26866A]" />
          Maze saved to "Saved Mazes" library!
        </div>
      )}

      {/* Top action row: Legend + Demo Mode + Save Maze */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Legend />

        <div className="flex items-center gap-2">
          {hoverCoord && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E4F1] rounded-xl text-xs font-mono text-[#706B83] shadow-xs">
              <span>Cell:</span>
              <span className="text-[#7657E8] font-bold">({hoverCoord.r}, {hoverCoord.c})</span>
              <span className="text-[#E8E4F1]">|</span>
              <span>Dist to Goal:</span>
              <span className="text-[#E85DAD] font-bold">
                {Math.abs(hoverCoord.r - target.r) + Math.abs(hoverCoord.c - target.c)}
              </span>
            </div>
          )}

          <button
            onClick={handleLaunchDemoMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#7657E8] to-[#9373FF] hover:from-[#6242D6] hover:to-[#815FEF] text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Load showcase maze and run narrated demonstration"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Showcase Demo</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E4F1] hover:border-[#C4B9E7] text-[#706B83] hover:text-[#242038] rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-[#7657E8]" />
            <span className="hidden sm:inline">Save Maze</span>
          </button>
        </div>
      </div>

      {/* Interactive Demo Narration Banner */}
      {isDemoActive && (
        <div className="bg-[#F0EEFA] border border-[#7657E8] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-lg bg-[#7657E8] text-white font-extrabold font-mono text-[10px] tracking-wide shrink-0">
              SHOWCASE WALKTHROUGH
            </span>
            <span className="text-[#242038] font-medium leading-relaxed">
              {getDemoNarration()}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLaunchDemoMode}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F7F7FC] text-[#7657E8] border border-[#E8E4F1] text-[11px] font-mono shadow-xs cursor-pointer"
            >
              Replay
            </button>
            <button
              onClick={() => setIsDemoActive(false)}
              className="p-1 rounded text-[#706B83] hover:text-[#242038] cursor-pointer"
              title="Close Walkthrough Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Toolbar */}
      <ControlsToolbar
        selectedAlgorithm={algorithm}
        onSelectAlgorithm={(algo) => {
          setAlgorithm(algo);
          if (status !== 'idle') handleClearPath();
        }}
        heuristic={heuristic}
        onChangeHeuristic={(h) => {
          setHeuristic(h);
          if (status !== 'idle') handleClearPath();
        }}
        onGenerateMaze={handleGenerateMaze}
        onClearWalls={handleClearWalls}
        onClearPath={handleClearPath}
        onResetAll={handleResetAll}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        gridDimensions={dimensions}
        onChangeGridDimensions={handleChangeGridDimensions}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === '3d' ? '2d' : '3d'))}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode((z) => !z)}
        disabled={status === 'running'}
      />

      {/* Interactive Grid Canvas */}
      <GridCanvas
        rows={dimensions.rows}
        cols={dimensions.cols}
        start={start}
        target={target}
        walls={walls}
        visitedSet={visitedSet}
        frontierSet={frontierSet}
        pathSet={pathSet}
        currentNode={currentNode}
        algorithm={algorithm}
        viewMode={viewMode}
        isDrawingEnabled={status !== 'running'}
        activeTool={activeTool}
        onToggleWall={handleToggleWall}
        onSetStart={(coord) => {
          if (coord.r === target.r && coord.c === target.c) return;
          setWalls((prev) => {
            const next = new Set(prev);
            next.delete(`${coord.r},${coord.c}`);
            return next;
          });
          setStart(coord);
          if (status !== 'idle') handleClearPath();
        }}
        onSetTarget={(coord) => {
          if (coord.r === start.r && coord.c === start.c) return;
          setWalls((prev) => {
            const next = new Set(prev);
            next.delete(`${coord.r},${coord.c}`);
            return next;
          });
          setTarget(coord);
          if (status !== 'idle') handleClearPath();
        }}
        onHoverCoord={setHoverCoord}
      />

      {/* Playback Scrub and Speed Control Bar */}
      <PlaybackControls
        status={status}
        currentStep={currentStep}
        totalSteps={searchResult?.trace.length ?? 0}
        speed={speed}
        onPlay={handleRunSearch}
        onPause={handlePause}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onResetPlayback={handleResetPlayback}
        onJumpToEnd={handleJumpToEnd}
        onChangeSpeed={setSpeed}
        onScrubStep={handleScrubStep}
      />

      {/* Real-time Statistics Telemetry */}
      <StatsPanel
        status={status}
        currentResult={searchResult}
        currentlyExploredCount={visitedSet.size}
        currentPathLength={
          status === 'found'
            ? searchResult?.pathLength ?? 0
            : pathSet.size > 0
            ? Math.max(0, pathSet.size - 1)
            : 0
        }
      />

      {/* Academic Pseudocode and Step Telemetry (Hidden in Zen Presentation Mode) */}
      {!isZenMode && (
        <EducationPanel
          algorithmId={algorithm}
          currentEvent={activeEvent}
        />
      )}

      {/* Save Maze Dialog Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8E4F1] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-[#242038]">
            <div>
              <h3 className="font-bold text-[#242038] text-base">Save Grid Configuration</h3>
              <p className="text-xs text-[#706B83] mt-1">
                Store your custom obstacles, start pin, and target pin to your browser's local library.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#242038]">Maze Name</label>
              <input
                type="text"
                placeholder="e.g., Narrow Spiral Challenge"
                value={mazeNameInput}
                onChange={(e) => setMazeNameInput(e.target.value)}
                autoFocus
                className="bg-[#F7F7FC] border border-[#E8E4F1] rounded-xl px-3 py-2 text-xs text-[#242038] placeholder:text-[#9C96AE] focus:outline-none focus:border-[#7657E8]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4F1]">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3.5 py-1.5 text-xs text-[#706B83] hover:text-[#242038] rounded-lg hover:bg-[#F0EEFA] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentMaze}
                disabled={!mazeNameInput.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
