import React from 'react';
import {
  Compass,
  LayoutDashboard,
  GitCompare,
  GraduationCap,
  Layers,
  Sparkles,
} from 'lucide-react';

export type NavigationTab = 'intro' | 'dashboard' | 'visualizer' | 'compare' | 'learn' | 'saved';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'intro' as NavigationTab,
      label: 'Opening Gateway',
      icon: Sparkles,
      note: 'Landing',
    },
    {
      id: 'visualizer' as NavigationTab,
      label: 'Interactive Grid',
      icon: Compass,
      note: 'Core Lab',
    },
    {
      id: 'compare' as NavigationTab,
      label: 'Compare Shootout',
      icon: GitCompare,
      note: 'BFS vs A*',
    },
    {
      id: 'learn' as NavigationTab,
      label: 'FAI Syllabus & Viva',
      icon: GraduationCap,
      note: 'Quiz',
    },
    {
      id: 'saved' as NavigationTab,
      label: 'Saved Mazes',
      icon: Layers,
      note: null,
    },
    {
      id: 'dashboard' as NavigationTab,
      label: 'Overview & Specs',
      icon: LayoutDashboard,
      note: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white/95 border-r border-[#E8E4F1] backdrop-blur-xl flex flex-col justify-between p-4 shadow-sm transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7657E8] to-[#9373FF] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(118,87,232,0.3)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-[#242038] flex items-center gap-1.5">
                <span>PATHFINDER</span>
                <span className="text-[#7657E8] font-mono text-xs">AI</span>
              </div>
              <div className="text-[11px] text-[#706B83]">
                Route Planning Laboratory
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-[#706B83] mb-1">
              Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F0EEFA] text-[#7657E8] border border-[#E6DEFF] font-semibold shadow-xs'
                      : 'text-[#706B83] hover:text-[#242038] hover:bg-[#F7F7FC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#7657E8]' : 'text-[#706B83]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.note && (
                    <span className={`text-[11px] font-mono ${isActive ? 'text-[#7657E8]' : 'text-[#9C96AE]'}`}>
                      {item.note}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info: College Microproject Attribution */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#E8E4F1]">
          <div className="bg-[#F0EEFA]/80 border border-[#E8E4F1] rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between text-[#706B83] font-medium mb-1">
              <span>Course Project</span>
              <span className="text-[#26866A] font-semibold">Foundations of AI</span>
            </div>
            <p className="text-[11px] text-[#706B83] leading-snug">
              Autonomous state-space search across dimensional grid worlds.
            </p>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] font-mono text-[#706B83]">
            <span>Client-Side Runtime</span>
            <span className="text-[#7657E8] font-semibold">Vercel Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
