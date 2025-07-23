import React from 'react';
import Navbar from '../layouts/Navbar';

const PricingPage = () => (
  <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden">
    <Navbar />
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold text-white mb-4">Pricing</h1>
      <p className="text-lg text-[#a2abb3]">This is a sample Pricing page. Add your pricing plans here.</p>
    </div>
  </div>
);

export default PricingPage; 