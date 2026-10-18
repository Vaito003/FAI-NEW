import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { SearchStatus } from '../../types/pathfinder';
import { soundEngine } from '../../utils/audio';

interface PlaybackControlsProps {
  status: SearchStatus;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onResetPlayback: () => void;
  onJumpToEnd: () => void;
  onChangeSpeed: (speed: number) => void;
  onScrubStep: (step: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  status,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onResetPlayback,
  onJumpToEnd,
  onChangeSpeed,
  onScrubStep,
}) => {
  const isRunning = status === 'running';
  const hasFinished = status === 'found' || status === 'not-found';
  const hasTrace = totalSteps > 0;

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel shadow-sm">
      {/* Upper Timeline Scrub Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 min-w-[90px] text-xs font-mono text-[#706B83]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#7657E8]" />
          <span>Step {totalSteps > 0 ? currentStep : 0}/{totalSteps}</span>
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalSteps)}
            value={currentStep}
            onChange={(e) => {
              const val = Number(e.target.value);
              soundEngine.playStepBlip(val);
              onScrubStep(val);
            }}
            disabled={!hasTrace || isRunning}
            className="w-full h-2 bg-[#F0EEFA] rounded-lg appearance-none cursor-pointer accent-[#7657E8] disabled:opacity-40 border border-[#E8E4F1]"
          />
        </div>

        <span className="text-xs font-mono text-[#7657E8] min-w-[45px] text-right font-bold">
          {totalSteps > 0 ? `${Math.round((currentStep / totalSteps) * 100)}%` : '0%'}
        </span>
      </div>

      {/* Main Playback Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8E4F1]">
        {/* Playback Buttons Group */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => {
                soundEngine.playClick(450);
                onPause();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick(650);
                onPlay();
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-bold text-xs shadow-[0_4px_16px_rgba(118,87,232,0.3)] transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{hasFinished ? 'Re-run Algorithm' : currentStep > 0 ? 'Resume' : 'Run Search Engine'}</span>
            </button>
          )}

          <div className="h-5 w-px bg-[#E8E4F1] mx-1 hidden sm:block" />

          {/* Stepping Actions */}
          <button
            onClick={() => {
              soundEngine.playClick(400);
              onResetPlayback();
            }}
            disabled={currentStep === 0 || isRunning}
            className="p-2 rounded-xl bg-white border border-[#E8E4F1] text-[#706B83] hover:text-[#242038] hover:bg-[#F7F7FC] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playStepBlip(currentStep);
              onStepBackward();
            }}
            disabled={currentStep <= 0 || isRunning}
            className="p-2 rounded-xl bg-white border border-[#E8E4F1] text-[#706B83] hover:text-[#242038] hover:bg-[#F7F7FC] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Step Backward (Previous State)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playStepBlip(currentStep);
              onStepForward();
            }}
            disabled={currentStep >= totalSteps || isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E4F1] text-[#242038] hover:bg-[#F7F7FC] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono font-semibold shadow-xs"
            title="Step Forward (Single Next State)"
          >
            <SkipForward className="w-4 h-4 text-[#7657E8]" />
            <span className="hidden sm:inline">Step</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSuccessChime();
              onJumpToEnd();
            }}
            disabled={currentStep >= totalSteps || isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0EEFA] border border-[#E6DEFF] text-[#7657E8] hover:bg-[#E6DEFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono font-bold shadow-xs"
            title="Instant Jump to Solution"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Instant</span>
          </button>
        </div>

        {/* Speed presets */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#706B83] font-mono">
            <Gauge className="w-3.5 h-3.5 text-[#7657E8]" />
            <span className="hidden md:inline">SPEED:</span>
          </div>

          <div className="inline-flex rounded-xl bg-[#F0EEFA] p-1 border border-[#E8E4F1] text-xs">
            {[
              { val: 1, label: '0.25x' },
              { val: 10, label: '1x' },
              { val: 30, label: '3x' },
              { val: 80, label: 'Fast' },
              { val: 150, label: 'Max' },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => {
                  soundEngine.playClick(600);
                  onChangeSpeed(s.val);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                  speed === s.val
                    ? 'bg-[#7657E8] text-white font-bold shadow-xs'
                    : 'text-[#706B83] hover:text-[#242038]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
