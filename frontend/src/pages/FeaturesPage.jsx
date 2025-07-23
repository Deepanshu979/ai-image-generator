import React from 'react';
import Navbar from '../layouts/Navbar';

const FeaturesPage = () => (
  <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden">
    <Navbar />
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold text-white mb-4">Features</h1>
      <p className="text-lg text-[#a2abb3]">This is a sample Features page. List your product features here.</p>
    </div>
  </div>
);

export default FeaturesPage; 