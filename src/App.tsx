/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import AIPrompts from './pages/AIPrompts';

function MainAppContent() {
  const { currentPage, setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState<string>('ai');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-300 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl" />
      </div>

      {/* Sticky Top Nav */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onOpenNewDream={() => handleTabChange('ai')} 
      />

      {/* Main Container */}
      <main className="flex-grow pt-6 pb-16 relative z-10">
        <AIPrompts />
      </main>

      {/* Bottom Footer */}
      <Footer setActiveTab={handleTabChange} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
