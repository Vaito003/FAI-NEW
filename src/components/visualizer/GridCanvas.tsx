import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GridCoord, AlgorithmId } from '../../types/pathfinder';
import { calculateHeuristic } from '../../algorithms/heuristics';
import { soundEngine } from '../../utils/audio';

interface GridCanvasProps {
  rows: number;
  cols: number;
  start: GridCoord;
  target: GridCoord;
  walls: Set<string>;
  visitedSet: Set<string>;
  frontierSet: Set<string>;
  pathSet: Set<string>;
  currentNode?: GridCoord;
  algorithm: AlgorithmId;
  viewMode: '2d' | '3d';
  isDrawingEnabled: boolean;
  activeTool: 'wall' | 'erase' | 'move-start' | 'move-target';
  onToggleWall: (r: number, c: number, shouldAdd: boolean) => void;
  onSetStart: (coord: GridCoord) => void;
  onSetTarget: (coord: GridCoord) => void;
  onHoverCoord?: (coord: GridCoord | null) => void;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  rows,
  cols,
  start,
  target,
  walls,
  visitedSet,
  frontierSet,
  pathSet,
  currentNode,
  algorithm,
  viewMode,
  isDrawingEnabled,
  activeTool,
  onToggleWall,
  onSetStart,
  onSetTarget,
  onHoverCoord,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragAction, setDragAction] = useState<'paint-wall' | 'erase-wall' | 'drag-start' | 'drag-target' | null>(null);
  const [inspectedCell, setInspectedCell] = useState<{ r: number; c: number } | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Stop mouse dragging if mouse leaves window or button released
  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false);
      setDragAction(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawingEnabled) return;

    setIsMouseDown(true);
    const key = `${r},${c}`;

    // If clicking on start node
    if (r === start.r && c === start.c) {
      setDragAction('drag-start');
      soundEngine.playClick(650);
      return;
    }

    // If clicking on target node
    if (r === target.r && c === target.c) {
      setDragAction('drag-target');
      soundEngine.playClick(650);
      return;
    }

    // Explicit tool check or left/right click
    const isEraseMode = activeTool === 'erase' || e.button === 2;
    if (isEraseMode) {
      setDragAction('erase-wall');
      soundEngine.playClick(400);
      if (walls.has(key)) {
        onToggleWall(r, c, false);
      }
    } else {
      const shouldAdd = !walls.has(key);
      setDragAction(shouldAdd ? 'paint-wall' : 'erase-wall');
      soundEngine.playClick(shouldAdd ? 520 : 380);
      onToggleWall(r, c, shouldAdd);
    }
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    setInspectedCell({ r, c });
    onHoverCoord?.({ r, c });

    if (!isMouseDown || !dragAction || !isDrawingEnabled) return;
    const isStartNode = r === start.r && c === start.c;
    const isTargetNode = r === target.r && c === target.c;

    if (dragAction === 'drag-start') {
      if (!isTargetNode && !walls.has(`${r},${c}`)) {
        soundEngine.playClick(700);
        onSetStart({ r, c });
      }
    } else if (dragAction === 'drag-target') {
      if (!isStartNode && !walls.has(`${r},${c}`)) {
        soundEngine.playClick(700);
        onSetTarget({ r, c });
      }
    } else if (dragAction === 'paint-wall') {
      if (!isStartNode && !isTargetNode && !walls.has(`${r},${c}`)) {
        soundEngine.playClick(500);
        onToggleWall(r, c, true);
      }
    } else if (dragAction === 'erase-wall') {
      if (walls.has(`${r},${c}`)) {
        soundEngine.playClick(380);
        onToggleWall(r, c, false);
      }
    }
  };

  const handleCellMouseLeave = () => {
    setInspectedCell(null);
    onHoverCoord?.(null);
  };

  // Algorithm Personality Visited Class in Lavender & Violet tones
  const getVisitedClass = () => {
    switch (algorithm) {
      case 'bfs':
        return 'anim-visited-bfs border border-[#C4B5FD]';
      case 'dfs':
        return 'anim-visited-dfs border border-[#D8B4FE]';
      case 'astar':
        return 'anim-visited-astar border border-[#C4B5FD]';
      default:
        return 'anim-visited-default border border-[#C4B5FD]';
    }
  };

  const is3D = viewMode === '3d';

  // Compute cell inspection info
  const inspectionInfo = useMemo(() => {
    if (!inspectedCell) return null;
    const { r, c } = inspectedCell;
    const key = `${r},${c}`;
    const isStart = r === start.r && c === start.c;
    const isTarget = r === target.r && c === target.c;
    const isWall = walls.has(key);
    const isPath = pathSet.has(key);
    const isVisited = visitedSet.has(key);
    const isFrontier = frontierSet.has(key);

    let stateLabel = 'Unexplored';
    let stateColor = 'text-[#706B83]';

    if (isStart) {
      stateLabel = 'Start Origin';
      stateColor = 'text-[#7657E8] font-semibold';
    } else if (isTarget) {
      stateLabel = 'Target Destination';
      stateColor = 'text-[#E85DAD] font-semibold';
    } else if (isPath) {
      stateLabel = 'Optimal Path Corridor';
      stateColor = 'text-[#7657E8] font-semibold';
    } else if (isWall) {
      stateLabel = 'Impassable Barrier';
      stateColor = 'text-[#8E7EBF] font-semibold';
    } else if (isFrontier) {
      stateLabel = 'Active Exploration Frontier';
      stateColor = 'text-[#8B5CF6] font-semibold';
    } else if (isVisited) {
      stateLabel = 'Evaluated Node';
      stateColor = 'text-[#7657E8]';
    }

    const hCost = calculateHeuristic({ r, c }, target, 'manhattan');
    const startDist = Math.abs(r - start.r) + Math.abs(c - start.c);

    return {
      r,
      c,
      stateLabel,
      stateColor,
      hCost,
      startDist,
    };
  }, [inspectedCell, start, target, walls, pathSet, visitedSet, frontierSet, algorithm]);

  return (
    <div
      ref={gridContainerRef}
      className={`relative select-none overflow-hidden p-3 sm:p-6 md:p-8 rounded-2xl glass-panel shadow-sm flex items-center justify-center max-w-full min-h-[460px] md:min-h-[520px] transition-all ${
        is3D ? 'iso-stage py-12 md:py-16' : ''
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background radial atmosphere glow inside canvas */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-[#7657E8]/5 via-transparent to-transparent opacity-60" />

      {/* Main Grid Plane (Switches between 2D Planar and 3D Isometric) */}
      <div
        className={`grid gap-[1.5px] p-2.5 rounded-xl border transition-all duration-700 ease-out ${
          is3D
            ? 'iso-plane bg-white border-[#E8E4F1] ring-1 ring-[#E8E4F1]'
            : 'flat-plane bg-white border-[#E8E4F1] ring-1 ring-[#E8E4F1]'
        }`}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: 'fit-content',
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const key = `${r},${c}`;
            const isStart = r === start.r && c === start.c;
            const isTarget = r === target.r && c === target.c;
            const isWall = walls.has(key);
            const isPath = pathSet.has(key);
            const isVisited = visitedSet.has(key);
            const isFrontier = frontierSet.has(key);
            const isCurrent = currentNode && currentNode.r === r && currentNode.c === c;

            // Base styling: white pearl tile with delicate lavender borders
            let cellClass = 'bg-[#FFFFFF] hover:bg-[#F0EEFA] border border-[#E8E4F1]';
            let cellContent = null;
            let styleTransform: React.CSSProperties = {};

            if (isStart) {
              cellClass =
                'bg-[#7657E8] text-white font-bold shadow-[0_4px_12px_rgba(118,87,232,0.4)] z-20 rounded-[3px] ring-2 ring-[#E6DEFF]';
              if (is3D) {
                cellClass += ' anim-beacon';
                styleTransform = { transform: 'translateZ(10px)' };
              }
              cellContent = (
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-xs" />
                  {is3D && (
                    <div className="absolute -top-3 w-1 h-3 bg-[#A78BFA] blur-[1px] opacity-70 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            } else if (isTarget) {
              cellClass =
                'bg-[#E85DAD] text-white font-bold shadow-[0_4px_12px_rgba(232,93,173,0.4)] z-20 rounded-[3px] ring-2 ring-[#FCE7F3]';
              if (is3D) {
                cellClass += ' anim-target';
                styleTransform = { transform: 'translateZ(10px)' };
              }
              cellContent = (
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-xs animate-ping" />
                  {is3D && (
                    <div className="absolute -top-3 w-1 h-3 bg-[#F472B6] blur-[1px] opacity-70 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            } else if (isCurrent) {
              cellClass =
                'bg-[#A78BFA] scale-110 z-30 shadow-md ring-2 ring-[#7657E8] rounded-[3px]';
              if (is3D) {
                styleTransform = { transform: 'translateZ(8px)' };
              }
              cellContent = <span className="w-1.5 h-1.5 rounded-full bg-white" />;
            } else if (isPath) {
              cellClass = 'anim-path-ribbon z-10 rounded-[2px]';
              if (is3D) {
                styleTransform = { transform: 'translateZ(5px)' };
              }
            } else if (isWall) {
              cellClass = is3D
                ? 'wall-extruded z-10 rounded-[3px]'
                : 'bg-[#8E7EBF] border border-[#7664A8] shadow-inner rounded-[2px]';
            } else if (isFrontier) {
              cellClass = 'bg-[#EAE5FB] border border-[#A795EB] rounded-[2px]';
              if (is3D) {
                styleTransform = { transform: 'translateZ(2px)' };
              }
            } else if (isVisited) {
              cellClass = `${getVisitedClass()} rounded-[2px]`;
            }

            return (
              <div
                key={key}
                onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                onMouseEnter={() => handleCellMouseEnter(r, c)}
                onMouseLeave={handleCellMouseLeave}
                style={styleTransform}
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-[29px] lg:h-[29px] flex items-center justify-center cursor-pointer transition-all duration-100 ${cellClass}`}
                title={`Coordinate: (${r}, ${c})`}
              >
                {cellContent}
              </div>
            );
          })
        )}
      </div>

      {/* Cell Inspection HUD Overlay */}
      {inspectionInfo && (
        <div className="absolute top-4 left-4 z-30 px-3.5 py-2 rounded-xl bg-white/95 border border-[#E8E4F1] shadow-lg backdrop-blur-md text-xs font-mono flex items-center gap-3 animate-fade-in pointer-events-none">
          <span className="text-[#242038] font-bold">
            ({inspectionInfo.r}, {inspectionInfo.c})
          </span>
          <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
          <span className={inspectionInfo.stateColor}>{inspectionInfo.stateLabel}</span>
          <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
          <span className="text-[#706B83]">
            h(n): <span className="text-[#7657E8] font-bold">{inspectionInfo.hCost}</span>
          </span>
        </div>
      )}

      {/* Bottom Mode Indicator in Corner of Canvas */}
      <div className="absolute bottom-3 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/90 border border-[#E8E4F1] text-xs font-mono text-[#706B83] shadow-xs">
        <span className="text-[#7657E8] font-bold">{is3D ? '3D Isometric' : '2D Planar'}</span>
        <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
        <span>{rows} × {cols} Grid</span>
      </div>
    </div>
  );
};
