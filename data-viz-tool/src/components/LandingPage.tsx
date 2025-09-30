'use client';

import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isHovered, setIsHovered] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📊</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">DataViz Pro</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Data Into
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Beautiful Charts
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create stunning, interactive visualizations from your CSV data in seconds. 
              No coding, no backend, no hassle - just upload, customize, and export.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isHovered ? '🚀 Start Visualizing' : '📊 Start Visualizing'}
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                View Sample Data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Visualize Data
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make data visualization simple, fast, and beautiful.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps. No registration required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Upload Your Data</h3>
              <p className="text-gray-600">
                Drag and drop your CSV file or enter data manually in our interactive table.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Customize Your Chart</h3>
              <p className="text-gray-600">
                Choose chart type, colors, titles, and axis labels to match your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Export & Share</h3>
              <p className="text-gray-600">
                Download your chart as PNG, SVG, or PDF and share with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Beautiful Charts?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust DataViz Pro for their data visualization needs.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Visualizing Now - It&apos;s Free!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <h3 className="text-xl font-bold">DataViz Pro</h3>
              </div>
              <p className="text-gray-400 mb-4">
                The simplest way to create beautiful data visualizations from your CSV files. 
                No coding required, complete privacy, and completely free.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>CSV Upload</li>
                <li>Manual Data Entry</li>
                <li>Multiple Chart Types</li>
                <li>Export Options</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DataViz Pro. Built with Next.js, Chart.js, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
