import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3.5 py-2 bg-white/90 backdrop-blur-md rounded-xl border border-[#E8E4F1] text-xs text-[#706B83] shadow-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#7657E8] border border-[#E6DEFF] shadow-xs"></span>
        <span className="font-medium text-[#242038]">Start</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#E85DAD] border border-[#FCE7F3] shadow-xs"></span>
        <span className="font-medium text-[#242038]">Target</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#8E7EBF] border border-[#7664A8]"></span>
        <span>Wall Block</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#9373FF] ring-2 ring-[#E6DEFF]"></span>
        <span>Active (Current)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#DDD6FE] border border-[#C4B5FD]"></span>
        <span>Visited (Closed)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#EAE5FB] border border-[#A795EB]"></span>
        <span>Frontier (Open)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-[#7657E8] border border-[#6242D6] shadow-xs"></span>
        <span className="font-medium text-[#7657E8]">Optimal Path</span>
      </div>
    </div>
  );
};
