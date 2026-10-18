import React, { useState, useEffect } from 'react';
import { SavedMaze } from '../../types/pathfinder';
import { getSavedMazes, deleteUserMaze, saveUserMaze } from '../../utils/storage';
import {
  FolderOpen,
  ArrowRight,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';

interface SavedMazesViewProps {
  onLoadMaze: (maze: SavedMaze) => void;
}

export const SavedMazesView: React.FC<SavedMazesViewProps> = ({ onLoadMaze }) => {
  const [mazes, setMazes] = useState<SavedMaze[]>([]);
  const [filter, setFilter] = useState<'all' | 'presets' | 'custom'>('all');
  const [importError, setImportError] = useState<string | null>(null);

  const refreshMazes = () => {
    setMazes(getSavedMazes());
  };

  useEffect(() => {
    refreshMazes();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved custom maze?')) {
      deleteUserMaze(id);
      refreshMazes();
    }
  };

  const handleExportJSON = (maze: SavedMaze, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(maze, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${maze.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.rows || !parsed.cols || !parsed.start || !parsed.target || !Array.isArray(parsed.walls)) {
          throw new Error('Invalid maze JSON structure.');
        }

        saveUserMaze({
          name: parsed.name || 'Imported Maze',
          description: parsed.description || 'Imported from JSON',
          rows: parsed.rows,
          cols: parsed.cols,
          start: parsed.start,
          target: parsed.target,
          walls: parsed.walls,
        });

        refreshMazes();
        setImportError(null);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredMazes = mazes.filter((m) => {
    if (filter === 'presets') return m.isPreset;
    if (filter === 'custom') return !m.isPreset;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Filter Bar */}
      <div className="bg-white border border-[#E8E4F1] rounded-2xl p-5 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#242038] flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#7657E8]" />
            Maze Library & Benchmark Archives
          </h2>
          <p className="text-xs text-[#706B83] mt-1 max-w-xl">
            Pre-loaded academic challenge maps designed to expose algorithmic strengths and weaknesses, plus your personal saved configurations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
          <div className="inline-flex rounded-xl bg-[#F0EEFA] p-1 border border-[#E8E4F1] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                  : 'text-[#706B83] hover:text-[#242038]'
              }`}
            >
              All ({mazes.length})
            </button>
            <button
              onClick={() => setFilter('presets')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'presets'
                  ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                  : 'text-[#706B83] hover:text-[#242038]'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'custom'
                  ? 'bg-[#7657E8] text-white font-semibold shadow-xs'
                  : 'text-[#706B83] hover:text-[#242038]'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Import JSON button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E4F1] hover:border-[#7657E8] text-[#706B83] hover:text-[#242038] rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-xs">
            <Upload className="w-3.5 h-3.5 text-[#7657E8]" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importError && (
        <div className="bg-[#FFF1F2] border border-[#FFE4E6] text-[#C84658] px-4 py-2 rounded-xl text-xs">
          {importError}
        </div>
      )}

      {/* Grid of Mazes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMazes.map((maze) => {
          const wallSet = new Set(maze.walls);

          return (
            <div
              key={maze.id}
              onClick={() => onLoadMaze(maze)}
              className="group bg-white border border-[#E8E4F1] hover:border-[#7657E8] rounded-2xl p-4 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E4F1] mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#242038] group-hover:text-[#7657E8] transition-colors">
                      {maze.name}
                    </span>
                    {maze.isPreset && (
                      <span className="text-[10px] bg-[#F0EEFA] text-[#7657E8] px-2 py-0.5 rounded-lg border border-[#E6DEFF] font-mono font-semibold">
                        Built-in
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleExportJSON(maze, e)}
                      title="Export as JSON file"
                      className="p-1 rounded-lg text-[#706B83] hover:text-[#242038] hover:bg-[#F0EEFA]"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {!maze.isPreset && (
                      <button
                        onClick={(e) => handleDelete(maze.id, e)}
                        title="Delete custom maze"
                        className="p-1 rounded-lg text-[#706B83] hover:text-[#C84658] hover:bg-[#FFF1F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#706B83] line-clamp-2 mb-3 leading-relaxed">
                  {maze.description}
                </p>

                {/* Thumbnail Canvas */}
                <div className="bg-[#F7F7FC] rounded-xl p-2 border border-[#E8E4F1] flex items-center justify-center my-2">
                  <div
                    className="grid gap-[1px]"
                    style={{
                      gridTemplateColumns: `repeat(${maze.cols}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: maze.rows }).map((_, r) =>
                      Array.from({ length: maze.cols }).map((_, c) => {
                        const key = `${r},${c}`;
                        const isStart = r === maze.start.r && c === maze.start.c;
                        const isTarget = r === maze.target.r && c === maze.target.c;
                        const isWall = wallSet.has(key);

                        let color = 'bg-white';
                        if (isStart) color = 'bg-[#7657E8]';
                        else if (isTarget) color = 'bg-[#E85DAD]';
                        else if (isWall) color = 'bg-[#8E7EBF]';

                        return (
                          <div
                            key={key}
                            className={`w-1.5 h-1.5 rounded-[0.5px] ${color}`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom stats and action */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8E4F1] mt-3 text-xs">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#706B83]">
                  <span>{maze.rows}×{maze.cols}</span>
                  <span>•</span>
                  <span>{maze.walls.length} walls</span>
                </div>

                <div className="flex items-center gap-1 text-[#7657E8] font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
