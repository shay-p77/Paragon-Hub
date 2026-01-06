
import React from 'react';
import { SectionHeader } from './Shared';

const KnowledgeBase: React.FC = () => {
  return (
    <div className="p-8">
      <SectionHeader title="Knowledge & Experience Library" subtitle="The master directory of hotels, vendors, and destination intel." />
      
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-cinzel text-sm font-bold border-b border-slate-100 pb-2 mb-4">HOTEL MASTER</h3>
          <p className="text-[10px] text-slate-500 mb-4">12,402 properties verified. Includes insider notes, preferred contacts, and commission history.</p>
          <button className="text-[10px] font-bold text-paragon tracking-widest hover:underline uppercase">Browse Registry</button>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-cinzel text-sm font-bold border-b border-slate-100 pb-2 mb-4">VENDORS & SUPPLIERS</h3>
          <p className="text-[10px] text-slate-500 mb-4">Driver networks, yacht charters, and VIP meet-and-greet operators globally.</p>
          <button className="text-[10px] font-bold text-paragon tracking-widest hover:underline uppercase">View Directory</button>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-cinzel text-sm font-bold border-b border-slate-100 pb-2 mb-4">DESTINATION GUIDES</h3>
          <p className="text-[10px] text-slate-500 mb-4">Curated experiences, restaurants, and timing duration for perfect itinerary building.</p>
          <button className="text-[10px] font-bold text-paragon tracking-widest hover:underline uppercase">Explore Intel</button>
        </div>
      </div>

      <div className="mt-12 bg-slate-900 text-white p-8 border-l-4 border-paragon-gold">
         <h4 className="font-cinzel text-lg mb-2">ANONYMIZED COMPANY TRENDS</h4>
         <p className="text-slate-400 text-xs mb-6 max-w-2xl">Sales intelligence on what's currently selling. Restricted view for agents to understand company-wide trends without sensitive data.</p>
         <div className="grid grid-cols-4 gap-6">
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Top Destination</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">COURCHEVEL</div>
            </div>
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Most Booked (Hotel)</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">AMAN NYC</div>
            </div>
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Activity Trend</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">Yacht Charter</div>
            </div>
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Avg Margin</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">14.2%</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
