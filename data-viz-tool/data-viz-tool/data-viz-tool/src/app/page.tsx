'use client';

import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import DataVisualizationApp from '@/components/DataVisualizationApp';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');

  const handleGetStarted = () => {
    setCurrentView('app');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <DataVisualizationApp onBackToLanding={handleBackToLanding} />
      )}
    </>
  );
}