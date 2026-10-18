import React from 'react';
import { SearchResult, SearchStatus } from '../../types/pathfinder';
import {
  Timer,
  Compass,
  Footprints,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
} from 'lucide-react';

interface StatsPanelProps {
  status: SearchStatus;
  currentResult: SearchResult | null;
  currentlyExploredCount: number;
  currentPathLength: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  status,
  currentResult,
  currentlyExploredCount,
  currentPathLength,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#7657E8]">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            Exploring frontier...
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#F59E0B]">
            <Activity className="w-3.5 h-3.5" />
            Playback paused
          </span>
        );
      case 'found':
        return (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#26866A]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#26866A]" />
            Optimal route secured
          </span>
        );
      case 'not-found':
        return (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#C84658]">
            <AlertCircle className="w-3.5 h-3.5 text-[#C84658]" />
            Destination unreachable
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#706B83]">
            <HelpCircle className="w-3.5 h-3.5 text-[#9C96AE]" />
            Awaiting search
          </span>
        );
    }
  };

  const executionTimeDisplay = currentResult ? `${currentResult.executionTimeMs} ms` : '—';
  const maxFrontierDisplay = currentResult ? currentResult.maxFrontierSize : '—';
  const efficiencyDisplay =
    currentResult && currentResult.nodesVisitedCount > 0 && currentResult.pathLength > 0
      ? `${(currentResult.explorationEfficiency * 100).toFixed(1)}%`
      : '—';

  return (
    <div className="rounded-2xl glass-panel p-4 shadow-sm flex flex-col gap-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E4F1]">
        <h3 className="text-xs font-semibold text-[#242038] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#7657E8]" />
          Live Search Telemetry
        </h3>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Visited Nodes */}
        <div className="bg-[#F7F7FC] rounded-xl p-3 border border-[#E8E4F1] flex flex-col relative overflow-hidden group hover:border-[#7657E8]/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7657E8]" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#706B83] mb-1 font-mono">
            <Footprints className="w-3.5 h-3.5 text-[#7657E8]" />
            <span>NODES VISITED</span>
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#242038]">
            {currentlyExploredCount}
          </span>
          <span className="text-[10px] text-[#706B83] mt-0.5">Explored state space</span>
        </div>

        {/* Path Length */}
        <div className="bg-[#F7F7FC] rounded-xl p-3 border border-[#E8E4F1] flex flex-col relative overflow-hidden group hover:border-[#E85DAD]/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#E85DAD]" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#706B83] mb-1 font-mono">
            <Compass className="w-3.5 h-3.5 text-[#E85DAD]" />
            <span>PATH COST</span>
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#242038]">
            {currentPathLength} <span className="text-xs font-normal text-[#706B83]">steps</span>
          </span>
          <span className="text-[10px] text-[#706B83] mt-0.5">
            {status === 'found'
              ? `${currentResult?.pathNodeCount ?? 0} contiguous nodes`
              : 'Direct route hops'}
          </span>
        </div>

        {/* Algorithm Execution Time */}
        <div className="bg-[#F7F7FC] rounded-xl p-3 border border-[#E8E4F1] flex flex-col relative overflow-hidden group hover:border-[#26866A]/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#26866A]" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#706B83] mb-1 font-mono">
            <Timer className="w-3.5 h-3.5 text-[#26866A]" />
            <span>EXECUTION TIME</span>
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#242038]">
            {executionTimeDisplay}
          </span>
          <span className="text-[10px] text-[#706B83] mt-0.5">performance.now() time</span>
        </div>

        {/* Max Frontier Load */}
        <div className="bg-[#F7F7FC] rounded-xl p-3 border border-[#E8E4F1] flex flex-col relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#8B5CF6]" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#706B83] mb-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>PEAK FRONTIER</span>
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#242038]">
            {maxFrontierDisplay}
          </span>
          <span className="text-[10px] text-[#706B83] mt-0.5">Max queue/stack load</span>
        </div>

        {/* Search Efficiency */}
        <div className="bg-[#F7F7FC] rounded-xl p-3 border border-[#E8E4F1] flex flex-col relative overflow-hidden group hover:border-[#7657E8]/40 transition-colors col-span-2 sm:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7657E8]" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#706B83] mb-1 font-mono">
            <Activity className="w-3.5 h-3.5 text-[#7657E8]" />
            <span>SEARCH EFFICIENCY</span>
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#242038]">
            {efficiencyDisplay}
          </span>
          <span className="text-[10px] text-[#706B83] mt-0.5">Path / Visited ratio</span>
        </div>
      </div>
    </div>
  );
};
