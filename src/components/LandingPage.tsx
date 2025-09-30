'use client';

import { useState } from 'react';
import ParticleNetwork from './ParticleNetwork';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewSampleData: () => void;
}

export default function LandingPage({ onGetStarted, onViewSampleData }: LandingPageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: '📊',
      title: 'Upload CSV Files',
      description: 'Drag and drop your CSV files or click to browse. Supports files up to 5MB with automatic data validation.'
    },
    {
      icon: '✏️',
      title: 'Edit Data Manually',
      description: 'Add, edit, or delete rows directly in an interactive table. Perfect for quick data entry and corrections.'
    },
    {
      icon: '📈',
      title: 'Multiple Chart Types',
      description: 'Create bar charts, line graphs, pie charts, and scatter plots. Switch between chart types instantly.'
    },
    {
      icon: '🎨',
      title: 'Customize Everything',
      description: 'Change colors, titles, axis labels, and more. Make your charts match your brand or presentation style.'
    },
    {
      icon: '💾',
      title: 'Export & Share',
      description: 'Download your charts as PNG, SVG, or PDF files. Perfect for presentations, reports, and sharing.'
    },
    {
      icon: '🚀',
      title: 'No Backend Required',
      description: 'Everything runs in your browser. Your data never leaves your device - complete privacy and security.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 content-layer shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow shadow-lg hover-glow transition-all duration-300">
                <span className="text-white font-bold text-xs sm:text-sm">📊</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Datuum</h1>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="#features" 
                className="text-gray-600 hover:text-blue-600  transition-colors duration-200 font-medium relative group"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600  transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-600 hover:text-blue-600  transition-colors duration-200 font-medium relative group"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600  transition-all duration-200 group-hover:w-full"></span>
              </a>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover-lift btn-enhanced shadow-lg"
              >
                Get Started
              </button>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200  py-4">
              <div className="flex flex-col space-y-3">
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-blue-600  transition-colors px-2 py-1 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-gray-600 hover:text-blue-600  transition-colors px-2 py-1 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  How it Works
                </a>
                <button
                  onClick={() => {
                    onGetStarted();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-left w-fit hover-lift shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden content-layer">
        {/* Particle Network Background - Hero Section Only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none background-elements">
          <ParticleNetwork />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900  mb-4 sm:mb-6 animate-fade-in-up leading-tight">
              <span className="block sm:inline gradient-text-animated">
                Visualize fast. Decide faster.
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600  mb-6 sm:mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 px-2">
              Create stunning, interactive visualizations from your CSV data in seconds. 
              No coding, no backend, no hassle - just upload, customize, and export.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up animation-delay-400 px-4">
              <button
                onClick={onGetStarted}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover-glow btn-enhanced"
              >
                {isHovered ? '🚀 Start Visualizing' : '📊 Start Visualizing'}
              </button>
              <button 
                onClick={onViewSampleData}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300  text-gray-700  text-base sm:text-lg font-semibold rounded-xl hover:border-gray-400  hover:bg-gray-50  transition-all duration-200 hover-lift"
              >
                View Sample Data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white content-layer relative overflow-hidden">
        {/* Subtle background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-float-up"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-float-down" style={{ animationDelay: '5s' }}></div>
          <div className="absolute top-2/3 left-1/3 w-16 h-16 bg-indigo-100 rounded-full opacity-30 animate-drift" style={{ animationDelay: '10s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Visualize</span> Data
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Powerful features designed to make data visualization simple, fast, and beautiful.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group subtle-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-gray-50 content-layer relative overflow-hidden">
        {/* Subtle background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-cyan-100 rounded-full opacity-25 animate-float-up" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-emerald-100 rounded-full opacity-25 animate-float-down" style={{ animationDelay: '8s' }}></div>
          <div className="absolute top-1/4 right-1/2 w-12 h-12 bg-pink-100 rounded-full opacity-25 animate-drift" style={{ animationDelay: '12s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Get started in three simple steps. No registration required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">📁</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">1. Upload Your Data</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Drag and drop your CSV file or enter data manually in our interactive table.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">🎨</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">2. Customize Your Chart</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Choose chart type, colors, titles, and axis labels to match your needs.
              </p>
            </div>
            
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">💾</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">3. Export & Share</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Download your chart as PNG, SVG, or PDF and share with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 content-layer">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Beautiful Charts?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join multiple users who trust Datuum for their data visualization needs.
          </p>
          <button
            onClick={onGetStarted}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 text-base sm:text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg glow-on-hover w-full sm:w-auto"
          >
            Start Visualizing Now - It&apos;s Free!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 content-layer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow shadow-lg">
                  <span className="text-white font-bold text-xs sm:text-sm">📊</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Datuum</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4">
                The simplest way to create beautiful data visualizations from your CSV files. 
                No coding required, complete privacy, and completely free.
              </p>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Features</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li>CSV Upload</li>
                <li>Manual Data Entry</li>
                <li>Multiple Chart Types</li>
                <li>Export Options</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2024 Datuum. Built with Next.js, Chart.js, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
