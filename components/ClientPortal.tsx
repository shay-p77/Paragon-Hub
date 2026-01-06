
import React from 'react';
import { SectionHeader, Badge } from './Shared';

const ClientPortal: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
       <div className="mb-12 text-center">
          <h1 className="font-cinzel text-3xl font-bold text-slate-900 tracking-widest mb-2">THE PARAGON COLLECTION</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold">Exclusive Member Access</p>
       </div>

       <div className="grid grid-cols-12 gap-8">
          {/* Side Menu */}
          <div className="col-span-3 space-y-4">
             {['Overview', 'Upcoming Travels', 'Travel Documents', 'Family & Guests', 'Billing & Ledger', 'Settings'].map((m, i) => (
                <button key={i} className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${i === 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}>
                   {m}
                </button>
             ))}
          </div>

          {/* Main Content Area */}
          <div className="col-span-9 space-y-8">
             <div className="bg-white border border-slate-200 p-8">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <Badge color="teal">UPCOMING</Badge>
                      <h2 className="font-cinzel text-2xl font-bold mt-2">Paris Autumn Gala</h2>
                      <p className="text-xs text-slate-500">October 12 - October 20, 2024</p>
                   </div>
                   <button className="bg-paragon text-white px-6 py-2 text-[10px] font-bold tracking-widest hover:bg-paragon-dark transition-colors">
                      VIEW ITINERARY
                   </button>
                </div>
                
                <div className="border-t border-slate-100 pt-6 flex gap-12">
                   <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Flight Status</p>
                      <p className="text-sm font-semibold">LH401 - Confirmed</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Accommodation</p>
                      <p className="text-sm font-semibold">Hôtel de Crillon</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Concierge</p>
                      <p className="text-sm font-semibold">Elena Vance</p>
                   </div>
                </div>
             </div>

             <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center rounded-sm">
                 <h4 className="font-cinzel text-lg mb-2">ADD TRAVEL DOCUMENT</h4>
                 <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-wider font-bold">Secure Passport & Visa Vault</p>
                 <div className="flex justify-center gap-4">
                    <button className="bg-white border border-slate-300 text-[10px] font-bold px-8 py-3 tracking-widest hover:bg-slate-100 transition-colors">UPLOAD PDF</button>
                    <button className="bg-white border border-slate-300 text-[10px] font-bold px-8 py-3 tracking-widest hover:bg-slate-100 transition-colors">TAKE PHOTO</button>
                 </div>
             </div>

             <SectionHeader title="Account Ledger" />
             <div className="bg-white border border-slate-200 divide-y divide-slate-100 text-[11px]">
                <div className="p-4 flex justify-between items-center font-bold text-slate-400 uppercase tracking-widest">
                   <span>Description</span>
                   <span>Amount</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                   <span>Trip Deposit - Paris Autumn Gala</span>
                   <span className="font-bold">$25,000.00</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                   <span>Concierge Fee - October</span>
                   <span className="font-bold">$2,500.00</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ClientPortal;
