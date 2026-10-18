import React from 'react';
import {
  Compass,
  BarChart2,
  GraduationCap,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  GitCompare,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: 'visualizer' | 'compare' | 'learn' | 'saved') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#F7F7FC] to-[#F0EEFA] border border-[#E8E4F1] p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7657E8]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#E85DAD]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#7657E8] font-semibold mb-3">
              <span>Foundations of AI Microproject</span>
              <span aria-hidden="true" className="text-[#C4B9E7]">·</span>
              <span>Graph Search & Heuristics</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#242038] tracking-tight leading-tight">
              PATHFINDER AI
            </h1>
            <h2 className="text-base sm:text-lg font-medium text-[#7657E8] mt-1">
              Intelligent Route Planning & Algorithm Visualizer
            </h2>

            <p className="text-xs sm:text-sm text-[#706B83] mt-3 leading-relaxed">
              Explore how artificial intelligence navigates complex environments. Watch blind algorithms (BFS, DFS) contrast with heuristic-guided search (A*, Greedy Best-First) across interactive grid worlds with honest, real-time performance telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => onNavigate('visualizer')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Interactive Visualizer
              </button>

              <button
                onClick={() => onNavigate('compare')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F7FC] border border-[#E8E4F1] text-[#242038] font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
              >
                <GitCompare className="w-4 h-4 text-[#7657E8]" />
                Algorithm Shootout
              </button>

              <button
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0EEFA] hover:bg-[#E6DEFF] border border-[#E8E4F1] text-[#7657E8] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#26866A]" />
                Deterministic Test Suite
              </button>
            </div>
          </div>

          {/* Quick Stat Pill Widget */}
          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 flex flex-col gap-3 min-w-[220px] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#242038]">
              <Cpu className="w-4 h-4 text-[#7657E8]" />
              Engine Architecture
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#706B83]">
                <span>Execution:</span>
                <span className="text-[#26866A] font-semibold">Pure Client-side</span>
              </div>
              <div className="flex justify-between text-[#706B83]">
                <span>Heuristics:</span>
                <span className="text-[#7657E8] font-semibold">Manhattan / Euclidean</span>
              </div>
              <div className="flex justify-between text-[#706B83]">
                <span>Optimality:</span>
                <span className="text-[#242038] font-semibold">Admissible h(n) ≤ h*(n)</span>
              </div>
              <div className="flex justify-between text-[#706B83]">
                <span>Deployment:</span>
                <span className="text-[#8B5CF6] font-semibold">Vercel Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature & Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Visualizer */}
        <div
          onClick={() => onNavigate('visualizer')}
          className="group bg-white border border-[#E8E4F1] hover:border-[#7657E8] rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFA] border border-[#E6DEFF] flex items-center justify-center text-[#7657E8] mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#242038] text-sm group-hover:text-[#7657E8] transition-colors">
            Interactive Visualizer
          </h3>
          <p className="text-xs text-[#706B83] mt-1 leading-relaxed">
            Draw custom walls, drag start/target pins, step through traces, scrub timelines, and generate procedural mazes.
          </p>
          <div className="flex items-center gap-1 text-[#7657E8] font-semibold text-xs mt-4">
            <span>Explore Grid</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Compare Algorithms */}
        <div
          onClick={() => onNavigate('compare')}
          className="group bg-white border border-[#E8E4F1] hover:border-[#7657E8] rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFA] border border-[#E6DEFF] flex items-center justify-center text-[#8B5CF6] mb-3 group-hover:scale-110 transition-transform">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#242038] text-sm group-hover:text-[#8B5CF6] transition-colors">
            Compare Shootout
          </h3>
          <p className="text-xs text-[#706B83] mt-1 leading-relaxed">
            Side-by-side execution of BFS, DFS, Dijkstra, and A* on identical challenges with real execution times and winners.
          </p>
          <div className="flex items-center gap-1 text-[#8B5CF6] font-semibold text-xs mt-4">
            <span>View Shootout</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Academic Textbook */}
        <div
          onClick={() => onNavigate('learn')}
          className="group bg-white border border-[#E8E4F1] hover:border-[#7657E8] rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFA] border border-[#E6DEFF] flex items-center justify-center text-[#7657E8] mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#242038] text-sm group-hover:text-[#7657E8] transition-colors">
            FAI Learning Module
          </h3>
          <p className="text-xs text-[#706B83] mt-1 leading-relaxed">
            Study problem formulation, consistency proofs, heuristic distance formulas, and test your skills with the college viva quiz.
          </p>
          <div className="flex items-center gap-1 text-[#7657E8] font-semibold text-xs mt-4">
            <span>Read Theory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Saved Mazes */}
        <div
          onClick={() => onNavigate('saved')}
          className="group bg-white border border-[#E8E4F1] hover:border-[#7657E8] rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFA] border border-[#E6DEFF] flex items-center justify-center text-[#26866A] mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#242038] text-sm group-hover:text-[#26866A] transition-colors">
            Benchmark Mazes
          </h3>
          <p className="text-xs text-[#706B83] mt-1 leading-relaxed">
            Load challenging test cases like Concave Traps, Dual Bottlenecks, Zig-Zags, or save and share your own designs via JSON.
          </p>
          <div className="flex items-center gap-1 text-[#26866A] font-semibold text-xs mt-4">
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* College FAI Syllabus Alignment Section */}
      <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4F1]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#26866A]" />
            <h3 className="font-bold text-[#242038] text-sm sm:text-base">
              Foundations of Artificial Intelligence (FAI) Syllabus Checklist
            </h3>
          </div>
          <span className="text-xs font-mono text-[#7657E8] bg-[#F0EEFA] px-2.5 py-1 rounded-lg border border-[#E6DEFF] font-semibold">
            College Microproject Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F7F7FC] p-4 rounded-xl border border-[#E8E4F1] flex flex-col gap-2">
            <span className="font-bold text-[#7657E8]">Uninformed Search</span>
            <p className="text-[#706B83] leading-relaxed">
              Demonstrates Breadth-First Search (FIFO queue) and Depth-First Search (LIFO stack) with step-by-step frontier exploration and visited set cycle prevention.
            </p>
          </div>

          <div className="bg-[#F7F7FC] p-4 rounded-xl border border-[#E8E4F1] flex flex-col gap-2">
            <span className="font-bold text-[#8B5CF6]">Informed / Heuristic Search</span>
            <p className="text-[#706B83] leading-relaxed">
              Demonstrates A* search evaluation function <code className="text-[#7657E8] font-bold">f(n) = g(n) + h(n)</code> alongside Greedy Best-First Search <code className="text-[#7657E8] font-bold">f(n) = h(n)</code>.
            </p>
          </div>

          <div className="bg-[#F7F7FC] p-4 rounded-xl border border-[#E8E4F1] flex flex-col gap-2">
            <span className="font-bold text-[#26866A]">Heuristic Admissibility</span>
            <p className="text-[#706B83] leading-relaxed">
              Features Manhattan, Euclidean, and Chebyshev metrics proving how admissible heuristics never overestimate the distance to goal, ensuring shortest path optimality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
