import { SavedMaze } from '../types/pathfinder';

const STORAGE_KEY_MAZES = 'pathfinder_ai_saved_mazes';
const STORAGE_KEY_PREFS = 'pathfinder_ai_preferences';

export interface UserPreferences {
  defaultAlgorithm: string;
  defaultSpeed: number;
  gridRows: number;
  gridCols: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
  heuristic: 'manhattan' | 'euclidean' | 'chebyshev';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultAlgorithm: 'astar',
  defaultSpeed: 25,
  gridRows: 21,
  gridCols: 37,
  soundEnabled: false,
  reducedMotion: false,
  heuristic: 'manhattan',
};

// Built-in presets for FAI college demonstrations
export const PRESET_MAZES: SavedMaze[] = [
  {
    id: 'preset-college-showcase',
    name: 'FAI Grand Showcase Benchmark',
    description: 'A benchmark grid featuring dual bottlenecks, a concave barrier, and deceptive detours. Demonstrates why A* prunes 70%+ of states compared to blind search.',
    rows: 21,
    cols: 37,
    start: { r: 10, c: 3 },
    target: { r: 10, c: 33 },
    difficulty: 'Hard',
    isPreset: true,
    createdAt: 1700000000000,
    walls: [
      // Left vertical bottleneck with small center opening
      ...Array.from({ length: 21 }, (_, r) => `${r},11`).filter((_, r) => r !== 9 && r !== 10 && r !== 11),
      // Central concave trap facing target
      '6,17', '6,18', '6,19', '6,20', '6,21', '6,22',
      '14,17', '14,18', '14,19', '14,20', '14,21', '14,22',
      '7,22', '8,22', '9,22', '10,22', '11,22', '12,22', '13,22',
      // Right diagonal staggered barriers
      ...Array.from({ length: 16 }, (_, r) => `${r},28`).filter((_, r) => r !== 5 && r !== 15),
    ],
  },
  {
    id: 'preset-bottleneck',
    name: 'Dual Bottleneck Trap',
    description: 'Forces algorithms through narrow chokepoints. Highlights how A* navigates directly through passages while BFS exhausts wide areas.',
    rows: 21,
    cols: 37,
    start: { r: 10, c: 4 },
    target: { r: 10, c: 32 },
    difficulty: 'Medium',
    isPreset: true,
    createdAt: 1700000001000,
    walls: [
      ...Array.from({ length: 21 }, (_, r) => `${r},12`).filter((_, r) => r !== 5 && r !== 15),
      ...Array.from({ length: 21 }, (_, r) => `${r},24`).filter((_, r) => r !== 7 && r !== 13),
    ],
  },
  {
    id: 'preset-concave-trap',
    name: 'Deceptive Concave Trap',
    description: 'A large U-shaped basin pointing at the goal. Greedy Best-First rushes right in and gets stuck, whereas A* evaluates alternate routes efficiently.',
    rows: 21,
    cols: 37,
    start: { r: 10, c: 5 },
    target: { r: 10, c: 30 },
    difficulty: 'Hard',
    isPreset: true,
    createdAt: 1700000002000,
    walls: [
      ...Array.from({ length: 14 }, (_, i) => `5,${12 + i}`),
      ...Array.from({ length: 11 }, (_, i) => `${5 + i},25`),
      ...Array.from({ length: 14 }, (_, i) => `15,${12 + i}`),
    ],
  },
  {
    id: 'preset-slalom',
    name: 'The Zig-Zag Slalom',
    description: 'Alternating vertical barriers test path optimality. Demonstrates the extreme difference between DFS tortuous winding vs BFS/A* optimal paths.',
    rows: 21,
    cols: 37,
    start: { r: 3, c: 3 },
    target: { r: 17, c: 33 },
    difficulty: 'Medium',
    isPreset: true,
    createdAt: 1700000003000,
    walls: [
      ...Array.from({ length: 16 }, (_, r) => `${r},9`),
      ...Array.from({ length: 16 }, (_, r) => `${20 - r},17`),
      ...Array.from({ length: 16 }, (_, r) => `${r},25`),
    ],
  },
  {
    id: 'preset-open-field',
    name: 'Open Plains Benchmark',
    description: 'An open field with scattered obstacles. Notice how Dijkstra sweeps in a full circle, while A* shoots straight toward the target like a laser.',
    rows: 21,
    cols: 37,
    start: { r: 10, c: 4 },
    target: { r: 10, c: 32 },
    difficulty: 'Easy',
    isPreset: true,
    createdAt: 1700000004000,
    walls: [
      '8,16', '9,16', '10,16', '11,16', '12,16',
      '7,22', '8,22', '12,22', '13,22',
      '5,10', '6,10', '14,10', '15,10',
      '4,28', '5,28', '15,28', '16,28',
    ],
  },
];

/**
 * Validates a maze object to protect against corrupted LocalStorage
 */
function isValidMaze(obj: any): obj is SavedMaze {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.rows === 'number' &&
    typeof obj.cols === 'number' &&
    obj.rows > 0 &&
    obj.cols > 0 &&
    obj.start &&
    typeof obj.start.r === 'number' &&
    typeof obj.start.c === 'number' &&
    obj.target &&
    typeof obj.target.r === 'number' &&
    typeof obj.target.c === 'number' &&
    Array.isArray(obj.walls)
  );
}

export function getSavedMazes(): SavedMaze[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MAZES);
    if (!raw) return PRESET_MAZES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return PRESET_MAZES;
    const validUserMazes = parsed.filter(isValidMaze);
    return [...PRESET_MAZES, ...validUserMazes];
  } catch (err) {
    console.warn('Could not read or parse saved mazes from localStorage. Recovering with presets:', err);
    return PRESET_MAZES;
  }
}

export function saveUserMaze(maze: Omit<SavedMaze, 'id' | 'createdAt' | 'isPreset'>): SavedMaze {
  const newMaze: SavedMaze = {
    ...maze,
    id: `custom-${Date.now()}`,
    isPreset: false,
    createdAt: Date.now(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_MAZES);
    let existing: SavedMaze[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existing = parsed.filter(isValidMaze);
        }
      } catch {
        existing = [];
      }
    }
    existing.unshift(newMaze);
    localStorage.setItem(STORAGE_KEY_MAZES, JSON.stringify(existing));
  } catch (err) {
    console.warn('Could not save maze to localStorage:', err);
  }

  return newMaze;
}

export function deleteUserMaze(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MAZES);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const filtered = parsed.filter((m: any) => isValidMaze(m) && m.id !== id);
    localStorage.setItem(STORAGE_KEY_MAZES, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Could not delete maze from localStorage:', err);
  }
}

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || !parsed) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (err) {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save preferences:', err);
  }
}
