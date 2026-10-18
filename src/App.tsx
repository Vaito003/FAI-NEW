/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OpeningExperience } from './components/landing/OpeningExperience';
import { DashboardView } from './components/dashboard/DashboardView';
import { VisualizerView } from './components/visualizer/VisualizerView';
import { CompareView } from './components/compare/CompareView';
import { LearnView } from './components/learn/LearnView';
import { SavedMazesView } from './components/mazes/SavedMazesView';
import { SavedMaze } from './types/pathfinder';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('intro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadedMazeForVisualizer, setLoadedMazeForVisualizer] = useState<SavedMaze | null>(null);
  const [triggerDemoCount, setTriggerDemoCount] = useState<number>(0);

  const handleLoadMazeIntoVisualizer = (maze: SavedMaze) => {
    setLoadedMazeForVisualizer(maze);
    setActiveTab('visualizer');
  };

  const handleLaunchDemoMode = () => {
    setActiveTab('visualizer');
    setTriggerDemoCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#242038] flex flex-col lg:flex-row font-sans selection:bg-[#E6DEFF] selection:text-[#7657E8]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onLaunchDemoMode={handleLaunchDemoMode}
        />

        <main className={`flex-1 w-full mx-auto ${activeTab === 'intro' ? 'p-0' : 'p-3 sm:p-5 lg:p-6 max-w-7xl'}`}>
          {activeTab === 'intro' && (
            <OpeningExperience
              onEnterLab={(algo) => {
                setActiveTab('visualizer');
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => {
                if (tab === 'visualizer') {
                  handleLaunchDemoMode();
                } else {
                  setActiveTab(tab);
                }
              }}
            />
          )}

          {activeTab === 'visualizer' && (
            <VisualizerView
              initialMaze={loadedMazeForVisualizer}
              onClearInitialMaze={() => setLoadedMazeForVisualizer(null)}
              triggerDemoCount={triggerDemoCount}
            />
          )}

          {activeTab === 'compare' && <CompareView />}

          {activeTab === 'learn' && <LearnView />}

          {activeTab === 'saved' && (
            <SavedMazesView onLoadMaze={handleLoadMazeIntoVisualizer} />
          )}
        </main>
      </div>
    </div>
  );
}
