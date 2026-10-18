import React, { useState } from 'react';
import { AlgorithmId, SearchEvent } from '../../types/pathfinder';
import { ALGORITHM_METADATA } from '../../algorithms/metadata';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Terminal,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EducationPanelProps {
  algorithmId: AlgorithmId;
  currentEvent?: SearchEvent;
}

export const EducationPanel: React.FC<EducationPanelProps> = ({
  algorithmId,
  currentEvent,
}) => {
  const [isPseudocodeOpen, setIsPseudocodeOpen] = useState(true);
  const meta = ALGORITHM_METADATA[algorithmId] || ALGORITHM_METADATA.astar;
  const activeLine = currentEvent?.pseudocodeLine ?? 0;

  return (
    <div className="rounded-2xl glass-panel p-4 shadow-sm flex flex-col gap-4">
      {/* Header and Algorithm Characteristics */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E8E4F1] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#7657E8]" />
            <h3 className="font-bold text-[#242038] text-sm sm:text-base tracking-wide">
              {meta.name}
            </h3>
            <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
            <span className="text-xs font-mono text-[#7657E8] font-semibold">
              {meta.category}
            </span>
          </div>
          <p className="text-xs text-[#706B83] mt-1.5 max-w-2xl leading-relaxed font-normal">
            {meta.summary}
          </p>
        </div>

        {/* Guarantees and Complexity */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className={`flex items-center gap-1.5 ${meta.guaranteesShortestPath ? 'text-[#26866A] font-semibold' : 'text-[#706B83]'}`}>
            {meta.guaranteesShortestPath ? (
              <CheckCircle className="w-3.5 h-3.5 text-[#26866A]" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-[#9C96AE]" />
            )}
            <span>{meta.guaranteesShortestPath ? 'Optimal Shortest Path' : 'Non-optimal Path'}</span>
          </span>
          <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
          <span className="text-[#706B83]">
            Time: <span className="text-[#7657E8] font-semibold">{meta.timeComplexity}</span>
          </span>
          <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
          <span className="text-[#706B83]">
            Space: <span className="text-[#8B5CF6] font-semibold">{meta.spaceComplexity}</span>
          </span>
        </div>
      </div>

      {/* Live Step Reasoning Bar */}
      <div className="bg-[#F0EEFA] rounded-xl p-3 border border-[#E8E4F1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[#7657E8] shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-xs font-mono font-bold text-[#706B83] uppercase tracking-wider">
              Step Reasoning:
            </span>
            <span className="text-xs text-[#242038] font-mono font-medium">
              {currentEvent ? currentEvent.explanation : 'Press "Run Search Engine" or Step to begin live trace inspection.'}
            </span>
          </div>
        </div>

        {currentEvent && (
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            {currentEvent.gScore !== undefined && (
              <span className="bg-white px-2 py-0.5 rounded-lg text-[#7657E8] border border-[#E8E4F1] font-semibold shadow-xs">
                g={currentEvent.gScore}
              </span>
            )}
            {currentEvent.hScore !== undefined && (
              <span className="bg-white px-2 py-0.5 rounded-lg text-[#8B5CF6] border border-[#E8E4F1] font-semibold shadow-xs">
                h={currentEvent.hScore.toFixed(1)}
              </span>
            )}
            {currentEvent.fScore !== undefined && (
              <span className="bg-white px-2.5 py-0.5 rounded-lg text-[#242038] border border-[#7657E8] font-bold shadow-xs">
                f={currentEvent.fScore.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Synchronized Pseudocode Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsPseudocodeOpen(!isPseudocodeOpen)}
            className="flex items-center gap-2 text-xs font-mono font-bold text-[#706B83] uppercase tracking-wider hover:text-[#242038] transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-[#7657E8]" />
            <span>Synchronized Pseudocode Tracer</span>
            {isPseudocodeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[11px] text-[#706B83] font-mono">
            Frontier DS: <strong className="text-[#242038]">{meta.dataStructure}</strong>
          </span>
        </div>

        {isPseudocodeOpen && (
          <div className="bg-[#F7F7FC] rounded-xl border border-[#E8E4F1] font-mono text-xs overflow-x-auto divide-y divide-[#E8E4F1] shadow-xs">
            {meta.pseudocode.map((item) => {
              const isHighlighted = item.line === activeLine;
              return (
                <div
                  key={item.line}
                  className={`flex items-start gap-3 px-3 py-1.5 transition-all ${
                    isHighlighted
                      ? 'bg-[#E6DEFF] text-[#242038] border-l-4 border-l-[#7657E8] font-semibold'
                      : 'text-[#706B83] hover:bg-[#F0EEFA]'
                  }`}
                >
                  <span className="w-5 text-right text-[#9C96AE] select-none text-[11px] shrink-0">
                    {item.line}
                  </span>
                  <span className="flex-1 font-mono text-[#242038]">{item.code}</span>
                  <span className="text-[11px] text-[#706B83] italic hidden md:inline shrink-0">
                    // {item.description}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
