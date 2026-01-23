
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

// Expandable List Item Component
const ExpandableRequestItem: React.FC<{
  request: BookingRequest;
  clientName: string;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ request, clientName, isExpanded, onToggle, onSelect, isSelected }) => {
  const priorityColors: Record<string, string> = {
    'URGENT': 'bg-red-100 text-red-700 border-red-200',
    'HIGH': 'bg-orange-100 text-orange-700 border-orange-200',
    'NORMAL': 'bg-slate-100 text-slate-700 border-slate-200',
    'LOW': 'bg-slate-50 text-slate-500 border-slate-200',
  };

  const typeIcons: Record<string, string> = {
    'FLIGHT': '✈️',
    'HOTEL': '🏨',
    'LOGISTICS': '🚗',
    'PACKAGE': '📦',
  };

  return (
    <div className={`border rounded-sm mb-2 overflow-hidden transition-all ${isSelected ? 'border-paragon bg-paragon-light/20' : 'border-slate-200 bg-white'}`}>
      {/* Header Row - Always visible */}
      <div
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{typeIcons[request.type] || '📋'}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800 truncate">{clientName}</span>
              <Badge color="slate">{request.type}</Badge>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{request.notes}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${priorityColors[request.priority] || priorityColors['NORMAL']}`}>
            {request.priority}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Submitted</p>
              <p className="text-xs font-semibold text-slate-700">{new Date(request.timestamp).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Status</p>
              <Badge color={request.status === 'CONVERTED' ? 'teal' : request.status === 'PENDING' ? 'gold' : 'slate'}>{request.status}</Badge>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Priority</p>
              <p className="text-xs font-semibold text-slate-700">{request.priority}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Type</p>
              <p className="text-xs font-semibold text-slate-700">{request.type}</p>
            </div>
          </div>

          {request.notes && (
            <div className="mb-4">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-1">Notes</p>
              <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">{request.notes}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="flex-1 sm:flex-none px-4 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors"
            >
              View Details
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-colors">
              Edit
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-colors">
              Convert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Expandable Booking Item Component
const ExpandableBookingItem: React.FC<{
  booking: any;
  type: 'flight' | 'hotel';
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ booking, type, isExpanded, onToggle, onSelect, isSelected }) => {
  return (
    <div className={`border rounded-sm mb-2 overflow-hidden transition-all ${isSelected ? 'border-paragon bg-paragon-light/20' : 'border-slate-200 bg-white'}`}>
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{type === 'flight' ? '✈️' : '🏨'}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800">{type === 'flight' ? booking.carrier : booking.name}</span>
              <span className="font-mono text-xs text-paragon font-bold">{type === 'flight' ? booking.pnr : booking.confirmation}</span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {type === 'flight'
                ? booking.segments?.map((s: any) => `${s.from}-${s.to}`).join(', ')
                : `${booking.checkIn} - ${booking.checkOut}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className="text-sm font-bold text-teal-600">+${booking.markup?.toLocaleString()}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">{type === 'flight' ? 'PNR' : 'Confirmation'}</p>
              <p className="text-xs font-mono font-bold text-paragon">{type === 'flight' ? booking.pnr : booking.confirmation}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Cost</p>
              <p className="text-xs font-semibold text-slate-700">${booking.cost?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Markup</p>
              <p className="text-xs font-semibold text-teal-600">${booking.markup?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Status</p>
              <Badge color="teal">CONFIRMED</Badge>
            </div>
          </div>

          {type === 'flight' && booking.segments && (
            <div className="mb-4">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-2">Segments</p>
              <div className="space-y-1">
                {booking.segments.map((seg: any, idx: number) => (
                  <div key={idx} className="text-xs bg-white p-2 rounded border border-slate-100 flex justify-between">
                    <span className="font-semibold">{seg.from} → {seg.to}</span>
                    <span className="text-slate-500">{seg.date} • {seg.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="flex-1 sm:flex-none px-4 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors"
            >
              View Details
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-colors">
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Expandable Customer Item Component
const ExpandableCustomerItem: React.FC<{
  customer: { name: string; status: string; accountType: string; spend: number };
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ customer, isExpanded, onToggle, onSelect, isSelected }) => {
  return (
    <div className={`border rounded-sm mb-2 overflow-hidden transition-all ${isSelected ? 'border-paragon bg-paragon-light/20' : 'border-slate-200 bg-white'}`}>
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-paragon-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-paragon-gold">{customer.name.charAt(0)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800">{customer.name}</span>
              <Badge color="teal">{customer.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{customer.accountType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className="text-sm font-bold text-slate-800">${customer.spend.toLocaleString()}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Status</p>
              <Badge color="teal">{customer.status}</Badge>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Account Type</p>
              <p className="text-xs font-semibold text-slate-700">{customer.accountType}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">YTD Spend</p>
              <p className="text-xs font-semibold text-slate-700">${customer.spend.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Last Booking</p>
              <p className="text-xs font-semibold text-slate-700">Dec 15, 2025</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="flex-1 sm:flex-none px-4 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors"
            >
              View Profile
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-colors">
              New Booking
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-colors">
              Contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CRM: React.FC<CRMProps> = ({ currentUser, requests, comments, onAddComment, onDeleteComment }) => {
  const [activeSubTab, setActiveSubTab] = useState('customers');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({
    spend: { under50k: false, fiftyTo100k: false, over100k: false },
    status: { vip: false, active: false, prospect: false, inactive: false },
    activity: { lastMonth: false, lastQuarter: false, lastYear: false }
  });

  const filterDropdownRef = useRef<HTMLDivElement>(null);

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

  // Sample customer data
  const sampleCustomers = [
    { id: 'max-power', name: 'Max Power', status: 'VIP GOLD', accountType: 'Direct Private', spend: 145200 },
    { id: 'jane-doe', name: 'Jane Doe', status: 'VIP', accountType: 'Corporate', spend: 89500 },
    { id: 'john-smith', name: 'John Smith', status: 'Active', accountType: 'Direct', spend: 34200 },
  ];

  return (
    <div className="p-4 sm:p-8">
      {/* Tab Navigation - Scrollable on mobile */}
      <div className="flex justify-between items-end mb-6 sm:mb-8 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 min-w-max">
          {[
            { id: 'customers', label: 'MY CLIENTS' },
            { id: 'my-requests', label: 'MY REQUESTS' },
            { id: 'my-bookings', label: 'MY BOOKINGS' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveSubTab(t.id); setSelectedElementId(null); setExpandedId(null); }}
              className={`pb-3 sm:pb-4 text-[10px] sm:text-xs font-bold tracking-widest transition-all whitespace-nowrap ${activeSubTab === t.id ? 'text-paragon border-b-2 border-paragon' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-8">
        <div className={selectedElementId ? 'lg:col-span-8' : 'lg:col-span-12'}>

          {/* Customers Tab */}
          {activeSubTab === 'customers' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <h3 className="text-sm font-bold text-slate-700">Customer Pipeline</h3>
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </button>

                  {showFilterDropdown && (
                    <div className="fixed inset-x-4 top-1/4 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-72 bg-white border border-slate-200 rounded-sm shadow-lg z-50">
                      <div className="p-4 space-y-4">
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
                        <div className="border-t border-slate-100 pt-4 flex gap-2">
                          <button
                            onClick={() => setFilters({
                              spend: { under50k: false, fiftyTo100k: false, over100k: false },
                              status: { vip: false, active: false, prospect: false, inactive: false },
                              activity: { lastMonth: false, lastQuarter: false, lastYear: false }
                            })}
                            className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 py-2"
                          >
                            Clear
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

              {/* Expandable Customer List */}
              <div>
                {sampleCustomers.map(customer => (
                  <ExpandableCustomerItem
                    key={customer.id}
                    customer={customer}
                    isExpanded={expandedId === customer.id}
                    onToggle={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                    onSelect={() => setSelectedElementId(customer.id)}
                    isSelected={selectedElementId === customer.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeSubTab === 'my-requests' && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 sm:mb-6">My Requests</h3>
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No requests assigned to you.</p>
                </div>
              ) : (
                myRequests.map(r => (
                  <ExpandableRequestItem
                    key={r.id}
                    request={r}
                    clientName={clients.find(c => c.id === r.clientId)?.name || 'Unknown Client'}
                    isExpanded={expandedId === r.id}
                    onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    onSelect={() => setSelectedElementId(r.id)}
                    isSelected={selectedElementId === r.id}
                  />
                ))
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeSubTab === 'my-bookings' && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 sm:mb-6">My Bookings</h3>

              {myFlights.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3">Flights</p>
                  {myFlights.map(f => (
                    <ExpandableBookingItem
                      key={f.id}
                      booking={f}
                      type="flight"
                      isExpanded={expandedId === f.id}
                      onToggle={() => setExpandedId(expandedId === f.id ? null : f.id)}
                      onSelect={() => setSelectedElementId(f.id)}
                      isSelected={selectedElementId === f.id}
                    />
                  ))}
                </div>
              )}

              {myHotels.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3">Hotels</p>
                  {myHotels.map(h => (
                    <ExpandableBookingItem
                      key={h.id}
                      booking={h}
                      type="hotel"
                      isExpanded={expandedId === h.id}
                      onToggle={() => setExpandedId(expandedId === h.id ? null : h.id)}
                      onSelect={() => setSelectedElementId(h.id)}
                      isSelected={selectedElementId === h.id}
                    />
                  ))}
                </div>
              )}

              {myFlights.length === 0 && myHotels.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No bookings yet.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Collaboration Panel - Slides up on mobile */}
        {selectedElementId && (
          <div className="lg:col-span-4 fixed inset-x-0 bottom-0 lg:relative lg:inset-auto lg:sticky lg:top-20 lg:h-fit z-40">
            <div className="bg-white border-t lg:border border-slate-200 p-4 sm:p-6 rounded-t-lg lg:rounded-sm shadow-lg max-h-[60vh] lg:max-h-none overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Collaboration Panel</h3>
                <button onClick={() => setSelectedElementId(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <Comments
                parentId={selectedElementId}
                currentUser={currentUser}
                comments={comments}
                onAddComment={(text) => onAddComment(text, selectedElementId)}
                onDeleteComment={onDeleteComment}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRM;
