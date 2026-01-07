
import React, { useState } from 'react';
import { SectionHeader, DataTable, Badge } from './Shared';
import { MOCK_USERS, MOCK_FLIGHTS, MOCK_HOTELS } from '../constants';
import { User, BookingRequest, Comment } from '../types';
import Comments from './Comments';

interface CRMProps {
  currentUser: User;
  requests: BookingRequest[];
  onAddRequest: (req: Partial<BookingRequest>) => void;
  comments: Comment[];
  onAddComment: (text: string, parentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

const CRM: React.FC<CRMProps> = ({ currentUser, requests, onAddRequest, comments, onAddComment, onDeleteComment }) => {
  const [activeSubTab, setActiveSubTab] = useState('customers');
  const [requestType, setRequestType] = useState<'QUICK' | 'DETAILED'>('QUICK');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const [detailedType, setDetailedType] = useState<'FLIGHT' | 'HOTEL' | 'LOGISTICS'>('FLIGHT');
  const [selectedClient, setSelectedClient] = useState(MOCK_USERS.find(u => u.role === 'CLIENT')?.id || '');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL');

  const myRequests = requests.filter(r => r.agentId === currentUser.id);
  const myFlights = MOCK_FLIGHTS.filter(f => f.agentId === currentUser.id);
  const myHotels = MOCK_HOTELS.filter(h => h.agentId === currentUser.id);
  const clients = MOCK_USERS.filter(u => u.role === 'CLIENT');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const snippet = formData.get('snippet') as string;
    if (!snippet) return;
    onAddRequest({ agentId: currentUser.id, clientId: selectedClient, type: 'GENERAL', status: 'PENDING', priority: 'NORMAL', notes: snippet, timestamp: new Date().toISOString() });
    (e.target as HTMLFormElement).reset();
  };

  const handleDetailedAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRequest({ agentId: currentUser.id, clientId: selectedClient, type: detailedType as any, status: 'PENDING', priority, notes, timestamp: new Date().toISOString() });
    setNotes('');
    setActiveSubTab('my-requests');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          {[
            { id: 'customers', label: 'CUSTOMERS' },
            { id: 'new-request', label: 'NEW REQUEST' },
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
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-3 space-y-6">
                <div className="bg-white p-6 border border-slate-200 rounded-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Pipeline Filters</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold mb-2">Total Spend {'>'}</label>
                      <input type="range" className="w-full accent-paragon" />
                    </div>
                    <div className="pt-4">
                      <button className="w-full bg-slate-900 text-white text-[10px] py-2 font-bold uppercase tracking-widest">Apply Filter</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-9">
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

          {activeSubTab === 'new-request' && (
            <div className="max-w-xl mx-auto py-8">
              <SectionHeader title="Booking Request" />
              <div className="flex gap-4 p-1 bg-slate-100 rounded-sm mb-6">
                <button onClick={() => setRequestType('QUICK')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${requestType === 'QUICK' ? 'bg-white text-paragon shadow-sm' : 'text-slate-400'}`}>Quick</button>
                <button onClick={() => setRequestType('DETAILED')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${requestType === 'DETAILED' ? 'bg-white text-paragon shadow-sm' : 'text-slate-400'}`}>Detailed</button>
              </div>
              <div className="bg-white border border-slate-200 p-8 shadow-sm">
                {requestType === 'QUICK' ? (
                   <form onSubmit={handleQuickAdd} className="space-y-4">
                      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full p-2 border border-slate-200 text-xs">
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <textarea name="snippet" placeholder="Paste PNR or Email..." className="w-full h-32 p-3 border border-slate-200 text-xs" required />
                      <button type="submit" className="w-full bg-slate-900 text-white py-3 text-[10px] font-bold uppercase">Submit</button>
                   </form>
                ) : (
                  <form onSubmit={handleDetailedAdd} className="space-y-4">
                      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full p-2 border border-slate-200 text-xs">
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select value={detailedType} onChange={(e) => setDetailedType(e.target.value as any)} className="w-full p-2 border border-slate-200 text-xs">
                         <option value="FLIGHT">Flight</option>
                         <option value="HOTEL">Hotel</option>
                         <option value="LOGISTICS">Logistics</option>
                      </select>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Details..." className="w-full h-32 p-3 border border-slate-200 text-xs" required />
                      <button type="submit" className="w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase">Send to Ops</button>
                  </form>
                )}
              </div>
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
