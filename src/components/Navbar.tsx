import React, { useState } from 'react';
import {
  Menu,
  HelpCircle,
  X,
  Compass,
  Keyboard,
  Info,
  Check,
  GraduationCap,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { AboutModal } from './AboutModal';

interface NavbarProps {
  activeTab: NavigationTab;
  onToggleMobileMenu: () => void;
  onLaunchDemoMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onToggleMobileMenu,
  onLaunchDemoMode,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'intro':
        return 'Opening Gateway & Laboratory Introduction';
      case 'dashboard':
        return 'System Overview & Specifications';
      case 'visualizer':
        return 'Interactive Grid & Search Visualizer';
      case 'compare':
        return 'Algorithm Shootout & Comparison Matrix';
      case 'learn':
        return 'FAI Academic Curriculum & Viva Quiz';
      case 'saved':
        return 'Benchmark Mazes & Saved Grid Archives';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 border-b border-[#E8E4F1] backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg bg-[#F0EEFA] border border-[#E8E4F1] text-[#706B83] hover:text-[#242038] lg:hidden"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="text-xs font-mono text-[#7657E8] font-semibold tracking-wider uppercase">
              PATHFINDER AI
            </div>
            <div className="text-sm font-bold text-[#242038] hidden sm:block">
              {getTabTitle()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onLaunchDemoMode && (
            <button
              onClick={onLaunchDemoMode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7657E8] to-[#9373FF] hover:from-[#6242D6] hover:to-[#815FEF] text-white text-xs font-bold shadow-[0_4px_14px_rgba(118,87,232,0.25)] transition-all active:scale-95"
              title="Run automated showcase demo with live explanation"
            >
              <Compass className="w-3.5 h-3.5 fill-current" />
              <span>Demo Mode</span>
            </button>
          )}

          <button
            onClick={() => setShowAboutModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0EEFA] hover:bg-[#E6DEFF] border border-[#E8E4F1] text-[#7657E8] text-xs font-medium transition-colors"
            title="Viva elevator pitch and examiner FAQs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#7657E8]" />
            <span className="hidden sm:inline">About & Viva Guide</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F7FC] border border-[#E8E4F1] text-[#706B83] hover:text-[#242038] text-xs font-medium transition-colors shadow-xs"
            title="Shortcuts and User Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#7657E8]" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </header>

      {/* About & Viva Guide Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Guide & Controls Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8E4F1] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E8E4F1] pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#7657E8]" />
                <h3 className="font-bold text-[#242038] text-base">
                  Pathfinder AI Quick User Guide & Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded text-[#706B83] hover:text-[#242038]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#242038]">
              <div className="flex items-start gap-3 bg-[#F0EEFA]/70 p-3 rounded-xl border border-[#E8E4F1]">
                <span className="p-1.5 rounded-lg bg-white text-[#7657E8] border border-[#E8E4F1] shrink-0 shadow-xs">
                  <Keyboard className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-[#242038] block mb-0.5">Mouse & Keyboard Interactions</strong>
                  <ul className="list-disc list-inside text-[#706B83] space-y-0.5">
                    <li><kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E8E4F1] text-[#242038] font-mono shadow-xs">Space</kbd> : Play / Pause execution</li>
                    <li><kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E8E4F1] text-[#242038] font-mono shadow-xs">→</kbd> : Step forward (single state)</li>
                    <li><kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E8E4F1] text-[#242038] font-mono shadow-xs">R</kbd> : Reset playback to Step 0</li>
                    <li><strong>Click & Drag</strong> to paint walls; <strong>Right-Click</strong> to erase.</li>
                    <li><strong>Drag</strong> the violet Start or pink Target pins to reposition.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#F0EEFA]/70 p-3 rounded-xl border border-[#E8E4F1]">
                <span className="p-1.5 rounded-lg bg-white text-[#26866A] border border-[#E8E4F1] shrink-0 shadow-xs">
                  <Check className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-[#242038] block mb-0.5">Honest Execution Telemetry</strong>
                  <p className="text-[#706B83] leading-relaxed">
                    Execution times are measured with high precision via <code className="text-[#7657E8] font-semibold">performance.now()</code>. Visited counts and step hops reflect the exact graph traversal.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E8E4F1]">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 rounded-xl bg-[#7657E8] hover:bg-[#6242D6] text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
