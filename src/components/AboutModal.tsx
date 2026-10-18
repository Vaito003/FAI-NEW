import React from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Map,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-[#E8E4F1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 my-8 max-h-[90vh] overflow-y-auto text-[#242038]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4F1] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7657E8] to-[#9373FF] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(118,87,232,0.3)]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#242038]">
                About PATHFINDER AI & Viva Preparation Guide
              </h2>
              <div className="text-xs text-[#7657E8] font-mono font-medium">
                Foundations of Artificial Intelligence (FAI) Microproject
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#706B83] hover:text-[#242038] hover:bg-[#F0EEFA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Synthetic Data Disclaimer */}
        <div className="bg-[#F0EEFA] p-3.5 rounded-xl border border-[#E8E4F1] text-xs text-[#242038] flex items-start gap-3">
          <Map className="w-4 h-4 text-[#7657E8] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#242038] block mb-0.5">Synthetic State Space Notice:</strong>
            <p className="text-[#706B83] leading-relaxed text-[11px]">
              All maps, obstacle patterns, and node coordinates within this visualizer represent discrete mathematical 2D graph spaces designed for algorithmic benchmarking and educational demonstration. They do not simulate real-world geographic GIS or road network map data.
            </p>
          </div>
        </div>

        {/* Viva Quick-Sheet: 2-Minute Elevator Pitch */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7657E8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            2-Minute College Viva Elevator Pitch
          </h3>
          <div className="bg-[#F7F7FC] p-4 rounded-xl border border-[#E8E4F1] text-xs text-[#242038] leading-relaxed space-y-2">
            <p>
              "<strong>PATHFINDER AI</strong> is an interactive route planning engine built to empirically study and verify graph search algorithms under the Foundations of Artificial Intelligence syllabus.
            </p>
            <p>
              It compares <strong>Uninformed Search</strong> (BFS and DFS, which operate blind to the goal) against <strong>Informed Search</strong> (A* and Greedy Best-First, which utilize heuristic domain knowledge).
            </p>
            <p>
              By applying the <strong>admissible and consistent Manhattan distance heuristic</strong> ($h(n) \le h^*(n)$), A* is mathematically guaranteed to find the optimal shortest path while pruning up to 75% of state expansions compared to BFS and Dijkstra."
            </p>
          </div>
        </div>

        {/* Key Viva Questions & Answers */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7657E8] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Key Examiner Questions & Model Answers
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="bg-[#F7F7FC] p-3 rounded-lg border border-[#E8E4F1]">
              <strong className="text-[#242038] block mb-1">
                Q1: Why is BFS guaranteed to find the shortest path, but DFS is not?
              </strong>
              <p className="text-[#706B83] leading-relaxed text-[11px]">
                <strong>Answer:</strong> BFS uses a FIFO queue, systematically expanding all nodes at uniform depth $k$ before depth $k+1$. DFS uses a LIFO stack, plunging down a single path arbitrarily until blocked. Hence DFS returns whatever path it stumbles upon first, which is rarely optimal.
              </p>
            </div>

            <div className="bg-[#F7F7FC] p-3 rounded-lg border border-[#E8E4F1]">
              <strong className="text-[#242038] block mb-1">
                Q2: What is the formal definition of an Admissible Heuristic?
              </strong>
              <p className="text-[#706B83] leading-relaxed text-[11px]">
                <strong>Answer:</strong> A heuristic $h(n)$ is admissible if it never overestimates the true remaining cost to reach the goal: $h(n) \le h^*(n)$ for all nodes $n$. In 4-directional grid movement, Manhattan distance $|r_1 - r_2| + |c_1 - c_2|$ is the exact minimum step count, making it perfectly admissible and consistent.
              </p>
            </div>

            <div className="bg-[#F7F7FC] p-3 rounded-lg border border-[#E8E4F1]">
              <strong className="text-[#242038] block mb-1">
                Q3: What happens when h(n) = 0 in A*?
              </strong>
              <p className="text-[#706B83] leading-relaxed text-[11px]">
                <strong>Answer:</strong> When $h(n) = 0$, $f(n) = g(n) + 0 = g(n)$. Nodes are expanded solely in ascending order of their accumulated cost from start, which precisely reduces A* to Dijkstra's Algorithm (Uniform-Cost Search).
              </p>
            </div>

            <div className="bg-[#F7F7FC] p-3 rounded-lg border border-[#E8E4F1]">
              <strong className="text-[#242038] block mb-1">
                Q4: How does path recovery prevent exponential memory use?
              </strong>
              <p className="text-[#706B83] leading-relaxed text-[11px]">
                <strong>Answer:</strong> Instead of storing full paths in queue nodes, each cell stores a single backlink pointer <code className="text-[#7657E8] font-semibold">parentMap[neighbor] = current</code>. Upon reaching the goal, the optimal path is recovered by back-tracing to the start in $O(L)$ linear time.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8E4F1] text-xs">
          <span className="text-[11px] font-mono text-[#706B83]">
            Compliant with Russell & Norvig (AIMA 4th Ed.)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-semibold text-xs shadow-sm transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
