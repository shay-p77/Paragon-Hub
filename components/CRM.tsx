
import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader, DataTable, Badge } from './Shared';
import { MOCK_USERS, MOCK_FLIGHTS, MOCK_HOTELS } from '../constants';
import { User, BookingRequest, Comment } from '../types';
import Comments from './Comments';

interface CRMProps {
  currentUser: User;
  requests: BookingRequest[];
  comments: Comment[];
  onAddComment: (text: string, parentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

const CRM: React.FC<CRMProps> = ({ currentUser, requests, comments, onAddComment, onDeleteComment }) => {
  const [activeSubTab, setActiveSubTab] = useState('customers');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({
    spend: { under50k: false, fiftyTo100k: false, over100k: false },
    status: { vip: false, active: false, prospect: false, inactive: false },
    activity: { lastMonth: false, lastQuarter: false, lastYear: false }
  });

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const myRequests = requests.filter(r => r.agentId === currentUser.id);
  const myFlights = MOCK_FLIGHTS.filter(f => f.agentId === currentUser.id);
  const myHotels = MOCK_HOTELS.filter(h => h.agentId === currentUser.id);
  const clients = MOCK_USERS.filter(u => u.role === 'CLIENT');

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          {[
            { id: 'customers', label: 'MY CLIENTS' },
            { id: 'my-requests', label: 'MY REQUESTS' },
            { id: 'my-bookings', label: 'MY BOOKINGS' },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveSubTab(t.id); setSelectedElementId(null); }} className={`pb-4 text-xs font-bold tracking-widest transition-all ${activeSubTab === t.id ? 'text-paragon border-b-2 border-paragon' : 'text-slate-400 hover:text-slate-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className={selectedElementId ? 'col-span-8' : 'col-span-12'}>
          {activeSubTab === 'customers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-700">Customer Pipeline</h3>
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {(Object.values(filters.spend).some(v => v) || Object.values(filters.status).some(v => v) || Object.values(filters.activity).some(v => v)) && (
                      <span className="w-2 h-2 bg-paragon rounded-full"></span>
                    )}
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-sm shadow-lg z-50">
                      <div className="p-4 space-y-4">
                        {/* Spend Filters */}
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Spend</h4>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.spend.under50k} onChange={() => setFilters({...filters, spend: {...filters.spend, under50k: !filters.spend.under50k}})} className="accent-paragon" />
                              <span className="text-xs">Under $50,000</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.spend.fiftyTo100k} onChange={() => setFilters({...filters, spend: {...filters.spend, fiftyTo100k: !filters.spend.fiftyTo100k}})} className="accent-paragon" />
                              <span className="text-xs">$50,000 - $100,000</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.spend.over100k} onChange={() => setFilters({...filters, spend: {...filters.spend, over100k: !filters.spend.over100k}})} className="accent-paragon" />
                              <span className="text-xs">Over $100,000</span>
                            </label>
                          </div>
                        </div>

                        {/* Status Filters */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Status</h4>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.status.vip} onChange={() => setFilters({...filters, status: {...filters.status, vip: !filters.status.vip}})} className="accent-paragon" />
                              <span className="text-xs">VIP</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.status.active} onChange={() => setFilters({...filters, status: {...filters.status, active: !filters.status.active}})} className="accent-paragon" />
                              <span className="text-xs">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.status.prospect} onChange={() => setFilters({...filters, status: {...filters.status, prospect: !filters.status.prospect}})} className="accent-paragon" />
                              <span className="text-xs">Prospect</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.status.inactive} onChange={() => setFilters({...filters, status: {...filters.status, inactive: !filters.status.inactive}})} className="accent-paragon" />
                              <span className="text-xs">Inactive</span>
                            </label>
                          </div>
                        </div>

                        {/* Activity Filters */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Activity</h4>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.activity.lastMonth} onChange={() => setFilters({...filters, activity: {...filters.activity, lastMonth: !filters.activity.lastMonth}})} className="accent-paragon" />
                              <span className="text-xs">Booked in last month</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.activity.lastQuarter} onChange={() => setFilters({...filters, activity: {...filters.activity, lastQuarter: !filters.activity.lastQuarter}})} className="accent-paragon" />
                              <span className="text-xs">Booked in last quarter</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={filters.activity.lastYear} onChange={() => setFilters({...filters, activity: {...filters.activity, lastYear: !filters.activity.lastYear}})} className="accent-paragon" />
                              <span className="text-xs">Booked in last year</span>
                            </label>
                          </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="border-t border-slate-100 pt-4 flex gap-2">
                          <button
                            onClick={() => setFilters({
                              spend: { under50k: false, fiftyTo100k: false, over100k: false },
                              status: { vip: false, active: false, prospect: false, inactive: false },
                              activity: { lastMonth: false, lastQuarter: false, lastYear: false }
                            })}
                            className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 py-2"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => setShowFilterDropdown(false)}
                            className="flex-1 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm hover:bg-paragon-dark transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DataTable headers={['Customer Name', 'Status', 'Account Type', 'Spend YTD', 'Action']}>
                  <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedElementId('max-power-profile')}>
                    <td className="px-4 py-3 font-bold">Max Power</td>
                    <td className="px-4 py-3"><Badge color="teal">VIP GOLD</Badge></td>
                    <td className="px-4 py-3">Direct Private</td>
                    <td className="px-4 py-3 font-bold">$145,200</td>
                    <td className="px-4 py-3 text-right"><button className="text-[10px] font-bold text-paragon">VIEW</button></td>
                  </tr>
                </DataTable>
            </div>
          )}

          {activeSubTab === 'my-requests' && (
            <DataTable headers={['Submitted', 'Client', 'Type', 'Notes', 'Priority', 'Status', 'Action']}>
              {myRequests.map(r => (
                <tr key={r.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === r.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(r.id)}>
                  <td className="px-4 py-3">{new Date(r.timestamp).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold">{clients.find(c => c.id === r.clientId)?.name}</td>
                  <td className="px-4 py-3"><Badge color="slate">{r.type}</Badge></td>
                  <td className="px-4 py-3 italic truncate max-w-xs">{r.notes}</td>
                  <td className="px-4 py-3 font-bold">{r.priority}</td>
                  <td className="px-4 py-3"><Badge color={r.status === 'CONVERTED' ? 'teal' : 'gold'}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-right"><button className="text-[10px] font-bold text-slate-400">EDIT</button></td>
                </tr>
              ))}
            </DataTable>
          )}

          {activeSubTab === 'my-bookings' && (
            <div className="space-y-12">
              <DataTable headers={['Flight', 'PNR', 'Segments', 'Cost', 'Markup', 'Action']}>
                {myFlights.map(f => (
                  <tr key={f.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === f.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(f.id)}>
                    <td className="px-4 py-3 font-bold">{f.carrier}</td>
                    <td className="px-4 py-3 font-mono text-paragon font-bold underline">{f.pnr}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{f.segments.map(s => `${s.from}-${s.to}`).join(', ')}</td>
                    <td className="px-4 py-3 font-bold">${f.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-teal-600 font-bold">${f.markup.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right"><button className="text-[10px] font-bold">VIEW</button></td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

        </div>

        {selectedElementId && (
          <div className="col-span-4 sticky top-20 h-fit">
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-lg">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Collaboration Panel</h3>
                 <button onClick={() => setSelectedElementId(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
              </div>
              <Comments parentId={selectedElementId} currentUser={currentUser} comments={comments} onAddComment={(text) => onAddComment(text, selectedElementId)} onDeleteComment={onDeleteComment} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRM;
