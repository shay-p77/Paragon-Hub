
import React, { useState } from 'react';
import { SectionHeader } from './Shared';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'users' | 'vendors' | 'contracts'>('users');

  const sections = [
    { id: 'users', label: 'User Access' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'contracts', label: 'Contracts' },
  ];

  return (
    <div className="p-4 sm:p-8">
      <SectionHeader title="Settings" subtitle="Manage system configuration, vendors, and user access" />

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
              activeSection === section.id
                ? 'bg-paragon text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* User Access Section */}
      {activeSection === 'users' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team Members</h3>
              <button className="px-3 py-1.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors">
                + Add User
              </button>
            </div>
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">User management coming soon</p>
              <p className="text-xs mt-1">Invite team members and manage their roles</p>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Section */}
      {activeSection === 'vendors' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor Directory</h3>
              <button className="px-3 py-1.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors">
                + Add Vendor
              </button>
            </div>
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">Vendor management coming soon</p>
              <p className="text-xs mt-1">Add airlines, hotels, and service providers</p>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Section */}
      {activeSection === 'contracts' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contract Management</h3>
              <button className="px-3 py-1.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors">
                + Add Contract
              </button>
            </div>
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Contract management coming soon</p>
              <p className="text-xs mt-1">Store and manage vendor agreements</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
