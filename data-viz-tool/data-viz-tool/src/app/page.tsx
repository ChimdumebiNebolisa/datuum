'use client';

import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import DataVisualizationApp from '@/components/DataVisualizationApp';
import SampleDataViewer from '@/components/SampleDataViewer';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'sample'>('landing');

  const handleGetStarted = () => {
    setCurrentView('app');
  };

  const handleViewSampleData = () => {
    setCurrentView('sample');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onViewSampleData={handleViewSampleData} 
        />
      )}
      {currentView === 'app' && (
        <DataVisualizationApp onBackToLanding={handleBackToLanding} />
      )}
      {currentView === 'sample' && (
        <SampleDataViewer onBackToLanding={handleBackToLanding} />
      )}
    </>
  );
}