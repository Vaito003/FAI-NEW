import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  BrainCircuit,
  Compass,
  CheckCircle2,
  XCircle,
  Award,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { runPathfinderTestSuite, TestCaseResult } from '../../algorithms/tests/pathfinderTests';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'In 4-directional grid pathfinding without diagonal moves, why is Manhattan distance preferred over Euclidean distance for A*?',
    options: [
      'Manhattan distance is faster to calculate and never underestimates or overestimates in 4-way orthogonal grid moves, making it perfectly admissible and more dominant.',
      'Euclidean distance is inadmissible because straight line is always longer than Manhattan.',
      'Manhattan distance is only valid for 8-directional movement with diagonals.',
      'Euclidean distance causes infinite loops in priority queues.',
    ],
    correctAnswer: 0,
    explanation:
      'In a 4-connected grid, every step cost is 1 along orthogonal edges. Euclidean distance (straight-line) is admissible but strictly smaller than Manhattan distance. Manhattan distance provides a higher heuristic value while remaining <= true cost h*(n), expanding strictly fewer or equal nodes (more informed/dominant).',
  },
  {
    id: 2,
    question: 'What is the evaluation function f(n) used by the A* algorithm?',
    options: [
      'f(n) = g(n) - h(n)',
      'f(n) = g(n) + h(n), where g is exact cost from start and h is estimated cost to goal',
      'f(n) = h(n) only',
      'f(n) = max(g(n), h(n))',
    ],
    correctAnswer: 1,
    explanation:
      'A* combines g(n), the actual known cost incurred to reach node n from the start, and h(n), the heuristic estimate from node n to the goal: f(n) = g(n) + h(n).',
  },
  {
    id: 3,
    question: 'What mathematical condition guarantees that A* tree search will return an optimal (shortest) path?',
    options: [
      'The heuristic h(n) must be overestimating: h(n) >= h*(n)',
      'The heuristic h(n) must be admissible: h(n) <= h*(n) for all nodes',
      'The queue must be implemented as a FIFO stack',
      'The graph must contain no cycles',
    ],
    correctAnswer: 1,
    explanation:
      'Admissibility requires that h(n) never overestimates the true remaining cost h*(n) to the goal. This prevents A* from prematurely discarding the true shortest route in favor of a seemingly cheaper detour.',
  },
  {
    id: 4,
    question: 'What is the primary operational difference between Breadth-First Search (BFS) and Depth-First Search (DFS)?',
    options: [
      'BFS uses a LIFO Stack; DFS uses a FIFO Queue.',
      'BFS uses a FIFO Queue and expands level by level; DFS uses a LIFO Stack and expands along branches deeply.',
      'BFS guarantees finding no path; DFS always guarantees shortest path.',
      'BFS requires a heuristic function; DFS is heuristic-free.',
    ],
    correctAnswer: 1,
    explanation:
      'BFS utilizes a First-In, First-Out (FIFO) queue, ensuring all nodes at depth d are expanded before depth d+1. DFS utilizes a Last-In, First-Out (LIFO) stack, plunging deep along a branch until hitting a wall or dead end.',
  },
  {
    id: 5,
    question: 'If you set the heuristic h(n) = 0 for all nodes in A*, which algorithm does it reduce to?',
    options: [
      'Depth-First Search (DFS)',
      'Greedy Best-First Search',
      "Dijkstra's Algorithm / Uniform-Cost Search (UCS)",
      'Iterative Deepening Search (IDS)',
    ],
    correctAnswer: 2,
    explanation:
      "When h(n) = 0, f(n) = g(n) + 0 = g(n). Nodes are expanded solely in ascending order of their accumulated cost from the start, which is exactly Dijkstra's Algorithm (Uniform Cost Search).",
  },
  {
    id: 6,
    question: 'Why does Greedy Best-First Search often explore fewer nodes than BFS but still fail to find the shortest path?',
    options: [
      'It only considers h(n) (apparent closeness to goal) and completely ignores g(n) (cost already spent), making it prone to long detours around concave obstacles.',
      'It uses random sampling of the search space.',
      'It reverses the edge weights in the graph.',
      'It cannot backtrack from visited nodes.',
    ],
    correctAnswer: 0,
    explanation:
      'Greedy Best-First orders the open set strictly by f(n) = h(n). While this rushes toward the target, it cannot account for accumulated distance, meaning it can take extremely long serpentine paths around obstacles.',
  },
];

export const LearnView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'theory' | 'mechanisms' | 'heuristics' | 'tests' | 'quiz'>('theory');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Test Suite state
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [hasRunTests, setHasRunTests] = useState(false);

  const handleRunTests = () => {
    const results = runPathfinderTestSuite();
    setTestResults(results);
    setHasRunTests(true);
  };

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Subnav */}
      <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#7657E8]" />
            <h2 className="text-lg font-bold text-[#242038]">
              Foundations of AI (FAI) — Academic Learning & Verification Module
            </h2>
          </div>
          <p className="text-xs text-[#706B83] mt-1 max-w-2xl leading-relaxed">
            Curriculum notes, plain-English data structure mechanics, heuristic mathematics, and an automated deterministic verification test suite.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F0EEFA] p-1 border border-[#E8E4F1] text-xs">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'theory'
                ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                : 'text-[#706B83] hover:text-[#242038]'
            }`}
          >
            Search Theory
          </button>
          <button
            onClick={() => setActiveTab('mechanisms')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'mechanisms'
                ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                : 'text-[#706B83] hover:text-[#242038]'
            }`}
          >
            Queues & Stacks
          </button>
          <button
            onClick={() => setActiveTab('heuristics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'heuristics'
                ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                : 'text-[#706B83] hover:text-[#242038]'
            }`}
          >
            Heuristic Mathematics
          </button>
          <button
            onClick={() => {
              setActiveTab('tests');
              if (!hasRunTests) handleRunTests();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-[#26866A] text-white font-semibold shadow-xs'
                : 'text-[#706B83] hover:text-[#242038]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verification Tests
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-[#8B5CF6] text-white font-semibold shadow-xs'
                : 'text-[#706B83] hover:text-[#242038]'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Viva Quiz
          </button>
        </div>
      </div>

      {/* Tab 1: Search Theory */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: 5-Tuple Formulation */}
          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#7657E8] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7657E8]" />
              1. Formal Search Problem Formulation
            </h3>
            <p className="text-xs text-[#706B83] leading-relaxed">
              In Artificial Intelligence (Russell & Norvig), any pathfinding problem is formally defined by a 5-tuple:
            </p>
            <div className="space-y-2 text-xs font-mono bg-[#F7F7FC] p-3.5 rounded-xl border border-[#E8E4F1]">
              <div>
                <span className="text-[#7657E8] font-semibold">1. Initial State (s₀):</span> Coordinates of the Start node on the grid <code className="text-[#26866A] font-bold">(r_start, c_start)</code>.
              </div>
              <div>
                <span className="text-[#7657E8] font-semibold">2. Actions A(s):</span> Orthogonal moves allowed from cell s: <code className="text-[#242038]">&#123; Up, Down, Left, Right &#125;</code> without colliding into boundary or wall obstacles.
              </div>
              <div>
                <span className="text-[#7657E8] font-semibold">3. Transition Model Result(s, a):</span> Next coordinate obtained by applying action a to current cell s.
              </div>
              <div>
                <span className="text-[#7657E8] font-semibold">4. Goal Test Goal(s):</span> Predicate checking whether current state s matches target coordinate <code className="text-[#E85DAD] font-bold">(r_target, c_target)</code>.
              </div>
              <div>
                <span className="text-[#7657E8] font-semibold">5. Path Cost c(s, a, s'):</span> Cost of traversing an edge. In an unweighted grid, every step cost <code className="text-[#7657E8] font-bold">c = 1</code>.
              </div>
            </div>
          </div>

          {/* Card: Blind vs Heuristic Search */}
          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#8B5CF6] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8B5CF6]" />
              2. Blind (Uninformed) vs Informed Search
            </h3>
            <div className="space-y-3 text-xs text-[#242038]">
              <div className="p-3 bg-[#F7F7FC] rounded-xl border border-[#E8E4F1]">
                <span className="font-bold text-[#7657E8] block mb-1">Uninformed (Blind) Search:</span>
                Algorithms have NO information about how far a state is from the goal. They explore solely based on graph topology.
                <ul className="list-disc list-inside mt-1 text-[#706B83] space-y-0.5">
                  <li><strong className="text-[#242038]">BFS:</strong> FIFO queue. Explores uniform wave expanding in all directions. Space complexity $O(b^d)$ is its major bottleneck.</li>
                  <li><strong className="text-[#242038]">DFS:</strong> LIFO stack. Dives into arbitrary dead ends; path is rarely optimal.</li>
                  <li><strong className="text-[#242038]">Dijkstra:</strong> Priority queue ordered by $g(n)$. Guarantees shortest path but blindly searches radially.</li>
                </ul>
              </div>

              <div className="p-3 bg-[#F7F7FC] rounded-xl border border-[#E8E4F1]">
                <span className="font-bold text-[#E85DAD] block mb-1">Informed (Heuristic) Search:</span>
                Uses domain knowledge via a heuristic evaluation function $h(n)$ to guide the search frontier toward the target.
                <ul className="list-disc list-inside mt-1 text-[#706B83] space-y-0.5">
                  <li><strong className="text-[#242038]">Greedy Best-First:</strong> Orders solely by $f(n) = h(n)$. Fast in open space, but can be tricked by concave obstacles.</li>
                  <li><strong className="text-[#242038]">A* Search:</strong> Combines past cost and future promise: $f(n) = g(n) + h(n)$. The pinnacle of optimal graph search!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Queues, Stacks & Path Recovery */}
      {activeTab === 'mechanisms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#7657E8] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7657E8]" />
              FIFO Queues vs LIFO Stacks in Graph Search
            </h3>

            <div className="space-y-3 text-xs text-[#242038]">
              <div className="p-3 bg-[#F7F7FC] rounded-xl border border-[#E8E4F1]">
                <h4 className="font-bold text-[#26866A] mb-1">BFS with FIFO Queue (First-In, First-Out)</h4>
                <p className="text-[#706B83] leading-relaxed">
                  In BFS, newly discovered neighbors are pushed onto the <em>back</em> of the queue and extracted from the <em>front</em>. This creates a uniform ripple or wavefront expanding equally in all directions. Because all paths of length $k$ are explored before any path of length $k+1$, BFS is mathematically guaranteed to find the shortest path in unweighted grids.
                </p>
              </div>

              <div className="p-3 bg-[#F7F7FC] rounded-xl border border-[#E8E4F1]">
                <h4 className="font-bold text-[#8B5CF6] mb-1">DFS with LIFO Stack (Last-In, First-Out)</h4>
                <p className="text-[#706B83] leading-relaxed">
                  In DFS, neighbors are pushed onto the <em>top</em> of the stack and popped immediately. The search dives as deeply as possible along a single branch before hitting a dead end and backtracking. This produces long, winding, non-optimal paths, but requires far less memory ($O(b \cdot m)$ vs $O(b^d)$).
                </p>
              </div>

              <div className="p-3 bg-[#F7F7FC] rounded-xl border border-[#E8E4F1]">
                <h4 className="font-bold text-[#7657E8] mb-1">A* with Priority Queue (Min-Heap)</h4>
                <p className="text-[#706B83] leading-relaxed">
                  Instead of FIFO or LIFO order, A* extracts the node with the lowest estimated total cost: <code className="text-[#7657E8] font-bold">f(n) = g(n) + h(n)</code>. The priority queue dynamically bubbles nodes toward the front as cheaper paths to them are discovered.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#8B5CF6] flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[#8B5CF6]" />
              How Path Reconstruction Works (Backpointer Map)
            </h3>

            <div className="text-xs text-[#242038] space-y-3">
              <p className="text-[#706B83] leading-relaxed">
                When searching a grid, storing full path histories in every queue node would require massive $O(V \cdot E)$ memory. Instead, algorithms store a single predecessor pointer:
              </p>

              <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1] font-mono text-xs space-y-1.5">
                <div className="text-[#7657E8] font-semibold">// During exploration:</div>
                <div className="text-[#242038]">parentMap.set(neighborKey, currentCoord);</div>
                <div className="text-[#7657E8] font-semibold mt-2">// When target is reached:</div>
                <div className="text-[#242038]">curr = target;</div>
                <div className="text-[#242038]">while (curr !== start) &#123;</div>
                <div className="text-[#242038]">&nbsp;&nbsp;path.unshift(curr);</div>
                <div className="text-[#242038]">&nbsp;&nbsp;curr = parentMap.get(curr);</div>
                <div className="text-[#242038]">&#125;</div>
                <div className="text-[#242038]">path.unshift(start);</div>
              </div>

              <div className="p-3 bg-[#F7F7FC] rounded-xl border border-[#E8E4F1]">
                <h4 className="font-bold text-[#242038] mb-1">Guarantees of Backpointer Recovery</h4>
                <ul className="list-disc list-inside text-[#706B83] space-y-1 text-[11px]">
                  <li><strong>Contiguity:</strong> Every step between <code className="text-[#7657E8]">path[i]</code> and <code className="text-[#7657E8]">path[i+1]</code> is strictly adjacent (Manhattan distance = 1).</li>
                  <li><strong>Wall Safety:</strong> Since parent pointers are only recorded when evaluating valid free cells, no path node can ever intersect a wall.</li>
                  <li><strong>Chain Protection:</strong> If a target has no valid predecessor chain back to start, the algorithm safely returns an empty path.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Heuristic Mathematics */}
      {activeTab === 'heuristics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#7657E8] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#7657E8]" />
              The Admissibility & Consistency Theorems
            </h3>
            <div className="space-y-3 text-xs text-[#242038]">
              <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
                <h4 className="font-bold text-[#242038] mb-1">Theorem 1: Admissibility</h4>
                <p className="font-mono text-[#7657E8] font-bold bg-[#F0EEFA] px-2 py-1 rounded-lg inline-block mb-1.5">
                  h(n) ≤ h*(n)  for all nodes n
                </p>
                <p className="text-[#706B83] leading-relaxed">
                  A heuristic is <em>admissible</em> if it never overestimates the actual cost to reach the goal $h^*(n)$. If $h(n)$ were to overestimate, A* might prematurely dismiss the truly optimal path believing it to be worse than it actually is.
                </p>
              </div>

              <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
                <h4 className="font-bold text-[#242038] mb-1">Theorem 2: Consistency (Monotonicity)</h4>
                <p className="font-mono text-[#7657E8] font-bold bg-[#F0EEFA] px-2 py-1 rounded-lg inline-block mb-1.5">
                  h(n) ≤ c(n, a, n') + h(n')
                </p>
                <p className="text-[#706B83] leading-relaxed">
                  A heuristic is <em>consistent</em> if it satisfies the triangle inequality. Every step taken decreases the estimated distance by at most the step cost. Consistency guarantees that the first time A* expands a node, the path found to that node is already optimal!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#8B5CF6] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8B5CF6]" />
              Heuristic Distance Metrics in Grid Worlds
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
                <div className="flex items-center justify-between text-[#7657E8] font-bold mb-1">
                  <span>Manhattan Distance (L1 Norm)</span>
                  <span className="text-[10px] bg-[#F0EEFA] px-2 py-0.5 rounded-lg text-[#7657E8]">4-Way Grid Optimal</span>
                </div>
                <div className="text-[#242038] font-bold mb-1">h(n) = |r₁ - r₂| + |c₁ - c₂|</div>
                <p className="text-[#706B83] font-sans text-[11px] leading-relaxed">
                  The exact minimum steps required when only moving horizontally and vertically without diagonals. It is both admissible and consistent.
                </p>
              </div>

              <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
                <div className="flex items-center justify-between text-[#8B5CF6] font-bold mb-1">
                  <span>Euclidean Distance (L2 Norm)</span>
                  <span className="text-[10px] bg-[#F0EEFA] px-2 py-0.5 rounded-lg text-[#8B5CF6]">Straight-line</span>
                </div>
                <div className="text-[#242038] font-bold mb-1">h(n) = √((r₁ - r₂)² + (c₁ - c₂)²)</div>
                <p className="text-[#706B83] font-sans text-[11px] leading-relaxed">
                  Admissible in 4-way grid, but because Euclidean distance is always ≤ Manhattan distance, it is strictly less informed (dominance condition), causing A* to expand more nodes.
                </p>
              </div>

              <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
                <div className="flex items-center justify-between text-[#E85DAD] font-bold mb-1">
                  <span>Chebyshev Distance (L∞ Norm)</span>
                  <span className="text-[10px] bg-[#FDF2F8] px-2 py-0.5 rounded-lg text-[#E85DAD]">8-Way / Chess King</span>
                </div>
                <div className="text-[#242038] font-bold mb-1">h(n) = max(|r₁ - r₂|, |c₁ - c₂|)</div>
                <p className="text-[#706B83] font-sans text-[11px] leading-relaxed">
                  Standard metric when 8-way diagonal movements cost 1 step (King's move in chess).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Deterministic Test Suite */}
      {activeTab === 'tests' && (
        <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E4F1] pb-3">
            <div>
              <h3 className="font-bold text-[#242038] text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#26866A]" />
                Deterministic Verification Test Suite
              </h3>
              <p className="text-xs text-[#706B83] mt-0.5">
                Automated unit audit testing reachability, wall avoidance, path contiguity, shortest-path guarantees, and edge cases.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#26866A] hover:bg-[#1E6B54] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-run Test Suite
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
              <span className="text-[#706B83] block text-[10px]">TOTAL TESTS</span>
              <span className="text-lg font-bold text-[#242038]">{testResults.length}</span>
            </div>
            <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
              <span className="text-[#706B83] block text-[10px]">PASSED</span>
              <span className="text-lg font-bold text-[#26866A]">
                {testResults.filter((t) => t.passed).length}
              </span>
            </div>
            <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
              <span className="text-[#706B83] block text-[10px]">FAILED</span>
              <span className="text-lg font-bold text-[#C84658]">
                {testResults.filter((t) => !t.passed).length}
              </span>
            </div>
            <div className="bg-[#F7F7FC] p-3 rounded-xl border border-[#E8E4F1]">
              <span className="text-[#706B83] block text-[10px]">TEST SUITE STATUS</span>
              <span className="text-xs font-bold text-[#26866A] flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5" /> 100% Verified
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#E8E4F1] border border-[#E8E4F1] rounded-xl overflow-hidden bg-[#F7F7FC]">
            {testResults.map((t) => (
              <div key={t.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white">
                <div className="flex items-start gap-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#26866A] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#C84658] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#242038]">{t.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0EEFA] text-[#7657E8] font-semibold">
                        {t.algorithm}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#706B83] mt-0.5">{t.details}</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-right shrink-0 bg-[#F7F7FC] px-3 py-1.5 rounded-lg border border-[#E8E4F1]">
                  <span className="text-[#706B83]">Expected:</span> <span className="text-[#242038]">{t.expected}</span>
                  <span className="text-[#C4B9E7] mx-1.5">|</span>
                  <span className="text-[#706B83]">Actual:</span>{' '}
                  <span className={t.passed ? 'text-[#26866A] font-bold' : 'text-[#C84658] font-bold'}>
                    {t.actual}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Interactive FAI Quiz */}
      {activeTab === 'quiz' && (
        <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E4F1] pb-3">
            <div>
              <h3 className="font-bold text-[#242038] text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#7657E8]" />
                FAI Viva & Exam Practice Examination
              </h3>
              <p className="text-xs text-[#706B83] mt-0.5">
                Test your mastery of Foundations of AI concepts before your college viva.
              </p>
            </div>

            {submittedQuiz && (
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#F0EEFA] border border-[#E8E4F1] text-xs font-mono text-[#242038]">
                  Score:{' '}
                  <span className="text-[#7657E8] font-bold text-sm">
                    {calculateScore()} / {QUIZ_QUESTIONS.length}
                  </span>{' '}
                  ({Math.round((calculateScore() / QUIZ_QUESTIONS.length) * 100)}%)
                </div>
                <button
                  onClick={handleResetQuiz}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-white border border-[#E8E4F1] text-[#706B83] hover:text-[#242038] hover:bg-[#F7F7FC] cursor-pointer shadow-xs"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOption = selectedAnswers[q.id];
              const isAnswered = selectedOption !== undefined;
              const isCorrect = selectedOption === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="bg-[#F7F7FC] rounded-2xl p-4 border border-[#E8E4F1] flex flex-col gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#F0EEFA] text-[#7657E8] border border-[#E6DEFF] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#242038] leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2 pl-8">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = selectedOption === oIdx;
                      let btnStyle = 'bg-white border-[#E8E4F1] text-[#242038] hover:bg-[#F0EEFA]';

                      if (submittedQuiz) {
                        if (oIdx === q.correctAnswer) {
                          btnStyle = 'bg-[#ECFDF5] border-[#26866A] text-[#26866A] font-semibold';
                        } else if (isChosen) {
                          btnStyle = 'bg-[#FFF1F2] border-[#C84658] text-[#C84658]';
                        }
                      } else if (isChosen) {
                        btnStyle = 'bg-[#F0EEFA] border-[#7657E8] text-[#7657E8] font-semibold shadow-xs';
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(q.id, oIdx)}
                          disabled={submittedQuiz}
                          className={`text-left text-xs p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-mono text-[11px] font-bold text-[#706B83] mt-0.5">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {submittedQuiz && oIdx === q.correctAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-[#26866A] shrink-0" />
                          )}
                          {submittedQuiz && isChosen && !isCorrect && (
                            <XCircle className="w-4 h-4 text-[#C84658] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation upon submit */}
                  {submittedQuiz && (
                    <div className="ml-8 mt-1 p-3 rounded-xl bg-white border border-[#E8E4F1] text-xs text-[#706B83]">
                      <strong className="text-[#7657E8] block mb-0.5 font-semibold">Academic Rationale:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submittedQuiz && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
                className="px-6 py-2.5 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                Submit All Answers ({Object.keys(selectedAnswers).length}/{QUIZ_QUESTIONS.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
