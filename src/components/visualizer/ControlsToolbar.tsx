import React from 'react';
import { AlgorithmId, HeuristicType } from '../../types/pathfinder';
import { MazeType } from '../../algorithms/mazeGenerators';
import {
  Sparkles,
  RefreshCw,
  Trash2,
  Brush,
  Eraser,
  MapPin,
  Flag,
  Grid,
  Box,
  Maximize2,
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ControlsToolbarProps {
  selectedAlgorithm: AlgorithmId;
  onSelectAlgorithm: (algo: AlgorithmId) => void;
  heuristic: HeuristicType;
  onChangeHeuristic: (h: HeuristicType) => void;
  onGenerateMaze: (type: MazeType) => void;
  onClearWalls: () => void;
  onClearPath: () => void;
  onResetAll: () => void;
  activeTool: 'wall' | 'erase' | 'move-start' | 'move-target';
  onSelectTool: (tool: 'wall' | 'erase' | 'move-start' | 'move-target') => void;
  gridDimensions: { rows: number; cols: number };
  onChangeGridDimensions: (dimensions: { rows: number; cols: number }) => void;
  viewMode: '2d' | '3d';
  onToggleViewMode: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  disabled: boolean;
}

export const ControlsToolbar: React.FC<ControlsToolbarProps> = ({
  selectedAlgorithm,
  onSelectAlgorithm,
  heuristic,
  onChangeHeuristic,
  onGenerateMaze,
  onClearWalls,
  onClearPath,
  onResetAll,
  activeTool,
  onSelectTool,
  gridDimensions,
  onChangeGridDimensions,
  viewMode,
  onToggleViewMode,
  isZenMode,
  onToggleZenMode,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel shadow-sm">
      {/* Top Row: Algorithm Selection, Heuristics & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Algorithm Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#706B83] flex items-center gap-1.5">
            Algorithm:
          </span>

          <div className="inline-flex rounded-xl bg-[#F0EEFA] p-1 border border-[#E8E4F1] shadow-inner">
            {[
              { id: 'astar' as AlgorithmId, label: 'A* Intelligence' },
              { id: 'bfs' as AlgorithmId, label: 'BFS Wavefront' },
              { id: 'dfs' as AlgorithmId, label: 'DFS Depth Trail' },
              { id: 'dijkstra' as AlgorithmId, label: 'Dijkstra (UCS)' },
              { id: 'greedy' as AlgorithmId, label: 'Greedy Best-First' },
            ].map((algo) => (
              <button
                key={algo.id}
                onClick={() => {
                  soundEngine.playClick(650);
                  onSelectAlgorithm(algo.id);
                }}
                disabled={disabled}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedAlgorithm === algo.id
                    ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                    : 'text-[#706B83] hover:text-[#242038] hover:bg-white/80'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {algo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Options: Heuristic Metric, 2D/3D View Switcher, Zen Mode, Grid Size */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heuristic selection for A* and Greedy */}
          {(selectedAlgorithm === 'astar' || selectedAlgorithm === 'greedy') && (
            <div className="flex items-center gap-1.5 bg-[#F0EEFA] px-2.5 py-1.5 rounded-xl border border-[#E8E4F1] text-xs">
              <span className="text-[#706B83] text-[11px] font-mono">h(n):</span>
              <select
                value={heuristic}
                onChange={(e) => onChangeHeuristic(e.target.value as HeuristicType)}
                disabled={disabled}
                className="bg-white text-[#7657E8] font-mono text-xs rounded-lg border border-[#E8E4F1] px-2 py-0.5 focus:outline-none focus:border-[#7657E8] font-semibold"
              >
                <option value="manhattan">Manhattan (4-Way Optimal)</option>
                <option value="euclidean">Euclidean (Straight-Line)</option>
                <option value="chebyshev">Chebyshev (Max Norm)</option>
              </select>
            </div>
          )}

          {/* 2D / 3D Isometric View Mode Switcher */}
          <button
            onClick={() => {
              soundEngine.playClick(800);
              onToggleViewMode();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
              viewMode === '3d'
                ? 'bg-[#F0EEFA] border-[#7657E8] text-[#7657E8] shadow-xs'
                : 'bg-white border-[#E8E4F1] text-[#706B83] hover:text-[#242038]'
            }`}
            title="Toggle between 3D Isometric Perspective and 2D Planar Grid"
          >
            <Box className="w-3.5 h-3.5" />
            <span>{viewMode === '3d' ? '3D Isometric' : '2D Planar'}</span>
          </button>

          {/* Zen Presentation Mode Switcher */}
          <button
            onClick={onToggleZenMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              isZenMode
                ? 'bg-[#FDF2F8] border-[#E85DAD] text-[#E85DAD] shadow-xs'
                : 'bg-white border-[#E8E4F1] text-[#706B83] hover:text-[#242038]'
            }`}
            title="Toggle Zen Presentation Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isZenMode ? 'Exit Zen' : 'Zen Lab'}</span>
          </button>

          {/* Grid Dimensions */}
          <div className="flex items-center gap-1.5 bg-[#F0EEFA] px-2.5 py-1.5 rounded-xl border border-[#E8E4F1] text-xs">
            <Grid className="w-3.5 h-3.5 text-[#706B83]" />
            <select
              value={`${gridDimensions.rows}x${gridDimensions.cols}`}
              onChange={(e) => {
                const [r, c] = e.target.value.split('x').map(Number);
                onChangeGridDimensions({ rows: r, cols: c });
              }}
              disabled={disabled}
              className="bg-white text-[#242038] text-xs font-mono rounded-lg border border-[#E8E4F1] px-2 py-0.5 focus:outline-none focus:border-[#7657E8]"
            >
              <option value="15x25">Compact (15 × 25)</option>
              <option value="21x37">Standard (21 × 37)</option>
              <option value="25x47">Wide (25 × 47)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Row: Drawing tools, Procedural Mazes & Reset actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#E8E4F1]">
        {/* Interactive Tool mode buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundEngine.playClick(500);
              onSelectTool('wall');
            }}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeTool === 'wall'
                ? 'bg-[#F0EEFA] border-[#7657E8] text-[#7657E8] shadow-xs font-semibold'
                : 'bg-white border-[#E8E4F1] text-[#706B83] hover:text-[#242038]'
            }`}
            title="Draw Obstacle Walls (or click-drag on canvas)"
          >
            <Brush className="w-3.5 h-3.5" />
            Draw Walls
          </button>

          <button
            onClick={() => {
              soundEngine.playClick(400);
              onSelectTool('erase');
            }}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeTool === 'erase'
                ? 'bg-[#F0EEFA] border-[#7657E8] text-[#7657E8] shadow-xs font-semibold'
                : 'bg-white border-[#E8E4F1] text-[#706B83] hover:text-[#242038]'
            }`}
            title="Erase Obstacle Walls (or right-click drag)"
          >
            <Eraser className="w-3.5 h-3.5" />
            Erase Walls
          </button>

          <button
            onClick={() => {
              soundEngine.playClick(600);
              onSelectTool('move-start');
            }}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeTool === 'move-start'
                ? 'bg-[#F0EEFA] border-[#7657E8] text-[#7657E8] shadow-xs font-semibold'
                : 'bg-white border-[#E8E4F1] text-[#706B83] hover:text-[#242038]'
            }`}
            title="Move Start Node (Violet Marker)"
          >
            <MapPin className="w-3.5 h-3.5 text-[#7657E8]" />
            Move Start
          </button>

          <button
            onClick={() => {
              soundEngine.playClick(600);
              onSelectTool('move-target');
            }}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeTool === 'move-target'
                ? 'bg-[#FDF2F8] border-[#E85DAD] text-[#E85DAD] shadow-xs font-semibold'
                : 'bg-white border-[#E8E4F1] text-[#706B83] hover:text-[#242038]'
            }`}
            title="Move Target Node (Pink Marker)"
          >
            <Flag className="w-3.5 h-3.5 text-[#E85DAD]" />
            Move Target
          </button>
        </div>

        {/* Maze Generators Dropdown & Reset Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#706B83]">Maze:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  soundEngine.playClick(650);
                  onGenerateMaze(e.target.value as MazeType);
                  e.target.value = '';
                }
              }}
              disabled={disabled}
              className="bg-white text-[#242038] text-xs font-mono rounded-xl border border-[#E8E4F1] px-3 py-1.5 focus:outline-none focus:border-[#7657E8]"
            >
              <option value="" disabled>
                Generate Pattern...
              </option>
              <option value="recursive-backtracker">DFS Perfect Maze (Backtracker)</option>
              <option value="recursive-division">Recursive Division Chambers</option>
              <option value="random-30">Random Obstacles (30% Density)</option>
              <option value="random-45">Random Obstacles (45% Dense)</option>
              <option value="stairs">Diagonal Staircase Traps</option>
              <option value="spiral">Concentric Spiral Labyrinth</option>
            </select>
          </div>

          <button
            onClick={onClearWalls}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#706B83] bg-white border border-[#E8E4F1] hover:bg-[#F7F7FC] hover:text-[#242038] transition-all active:scale-95 shadow-xs"
            title="Clear all obstacle walls"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#706B83]" />
            Clear Walls
          </button>

          <button
            onClick={onClearPath}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#7657E8] bg-white border border-[#E8E4F1] hover:bg-[#F0EEFA] transition-all active:scale-95 shadow-xs"
            title="Clear visited states and search route"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#7657E8]" />
            Clear Path
          </button>

          <button
            onClick={onResetAll}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#C84658] bg-[#FFF1F2] border border-[#FFE4E6] hover:bg-[#FFE4E6] transition-all active:scale-95"
            title="Reset grid completely to defaults"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
