
import React, { useState } from 'react';
import { SectionHeader, DataTable, Badge } from './Shared';
import { MOCK_FLIGHTS, MOCK_HOTELS, MOCK_TRIPS, MOCK_USERS } from '../constants';
import { ElementStatus, BookingRequest, Comment, User } from '../types';
import Comments from './Comments';

interface OperationsProps {
  requests: BookingRequest[];
  comments: Comment[];
  currentUser: User;
  onAddComment: (text: string, parentId: string) => void;
}

const Operations: React.FC<OperationsProps> = ({ requests, comments, currentUser, onAddComment }) => {
  const [subTab, setSubTab] = useState('flights');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const tabs = [
    { id: 'flights', label: 'FLIGHTS' },
    { id: 'hotels', label: 'HOTELS' },
    { id: 'logistics', label: 'LOGISTICS' },
    { id: 'trips', label: 'CONCIERGE TRIPS' },
    { id: 'queues', label: 'REQUEST QUEUES' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setSubTab(t.id); setSelectedElementId(null); }}
              className={`pb-4 text-xs font-bold tracking-widest transition-all ${
                subTab === t.id 
                  ? 'text-paragon border-b-2 border-paragon' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pb-3 flex gap-2">
           <div className="relative">
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">{requests.filter(r => r.status === 'PENDING').length}</span>
              <button onClick={() => setSubTab('queues')} className="bg-slate-100 text-slate-600 text-[10px] px-4 py-2 font-bold tracking-widest hover:bg-slate-200 transition-colors">
                PENDING REQS
              </button>
           </div>
           <button className="bg-paragon text-white text-[10px] px-4 py-2 font-bold tracking-widest hover:bg-paragon-dark transition-colors">
             NEW ELEMENT +
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className={selectedElementId ? 'col-span-8' : 'col-span-12'}>
          {subTab === 'flights' && (
            <div>
              <SectionHeader title="Global Flight Operations" subtitle="Manage commercial and private jet inventory." />
              <DataTable headers={['Status', 'Carrier', 'PNR', 'Segments', 'Pax', 'Total Cost', 'Action']}>
                {MOCK_FLIGHTS.map(f => (
                  <tr key={f.id} className={`hover:bg-slate-50 group cursor-pointer ${selectedElementId === f.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(f.id)}>
                    <td className="px-4 py-3"><Badge color={f.status === ElementStatus.TICKETED ? 'teal' : 'gold'}>{f.status}</Badge></td>
                    <td className="px-4 py-3 font-bold">{f.carrier}</td>
                    <td className="px-4 py-3 font-mono text-paragon font-bold underline">{f.pnr}</td>
                    <td className="px-4 py-3">
                      {f.segments.map((s, i) => (
                        <div key={i}>{s.from} → {s.to} ({s.flightNo})</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 italic truncate max-w-[150px]">{f.passengers.join(', ')}</td>
                    <td className="px-4 py-3 font-bold">${f.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[10px] text-slate-400 font-bold hover:text-paragon">VIEW</button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {subTab === 'hotels' && (
            <div>
              <SectionHeader title="Hotel Portfolio Management" />
              <DataTable headers={['Status', 'Hotel', 'Room Type', 'Dates', 'Cost', 'Action']}>
                {MOCK_HOTELS.map(h => (
                  <tr key={h.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === h.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(h.id)}>
                    <td className="px-4 py-3"><Badge color="gold">{h.status}</Badge></td>
                    <td className="px-4 py-3 font-bold">{h.hotelName}</td>
                    <td className="px-4 py-3">{h.roomType}</td>
                    <td className="px-4 py-3">{h.checkIn} — {h.checkOut}</td>
                    <td className="px-4 py-3 font-bold">${h.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[10px] text-slate-400 font-bold hover:text-paragon">VIEW</button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {subTab === 'queues' && (
            <div>
              <SectionHeader title="Inbound Request Queues" />
              <DataTable headers={['Recd', 'Client', 'Type', 'Notes', 'Agent', 'Priority', 'Action']}>
                {requests.map(r => (
                  <tr key={r.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === r.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(r.id)}>
                    <td className="px-4 py-3">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3 font-bold">{MOCK_USERS.find(u => u.id === r.clientId)?.name}</td>
                    <td className="px-4 py-3"><Badge color={r.type === 'FLIGHT' ? 'red' : 'gold'}>{r.type}</Badge></td>
                    <td className="px-4 py-3 italic truncate max-w-sm">{r.notes}</td>
                    <td className="px-4 py-3 font-semibold">{MOCK_USERS.find(u => u.id === r.agentId)?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold ${r.priority === 'URGENT' ? 'text-red-600' : 'text-slate-500'}`}>{r.priority}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="text-paragon font-bold text-[10px]">CONVERT</button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}
          
          {subTab === 'trips' && (
            <div className="grid grid-cols-4 gap-4">
               {['Inquiry', 'Planning', 'Active', 'Post-Trip'].map((col, idx) => (
                <div key={idx} className="bg-slate-100 p-4 border-t-2 border-slate-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{col}</h4>
                    <span className="text-[10px] bg-white px-2 rounded-full border border-slate-200">{idx === 1 ? MOCK_TRIPS.length : 0}</span>
                  </div>
                  {idx === 1 && MOCK_TRIPS.map(t => (
                    <div key={t.id} 
                      onClick={() => setSelectedElementId(t.id)}
                      className={`bg-white p-4 border border-slate-200 shadow-sm mb-3 rounded-sm cursor-pointer hover:border-paragon transition-colors ${selectedElementId === t.id ? 'ring-2 ring-paragon border-transparent' : ''}`}
                    >
                      <h5 className="font-cinzel text-xs font-bold mb-2">{t.name}</h5>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{t.startDate}</span>
                        <Badge color="teal">{t.ownership}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedElementId && (
          <div className="col-span-4 sticky top-20 h-fit">
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Collaboration Panel</h3>
                 <button onClick={() => setSelectedElementId(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mb-6 pb-4 border-b border-slate-100 uppercase">
                ID: {selectedElementId}
              </div>
              
              <Comments 
                parentId={selectedElementId} 
                currentUser={currentUser} 
                comments={comments} 
                onAddComment={(text) => onAddComment(text, selectedElementId)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Operations;
