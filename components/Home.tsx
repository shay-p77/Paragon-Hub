
import React, { useState, useEffect } from 'react';
import { SectionHeader, Badge } from './Shared';
import { MOCK_ANNOUNCEMENTS, MOCK_USERS } from '../constants';
import { User } from '../types';

interface HomeProps {
  currentUser: User;
}

const WorldClock: React.FC = () => {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimes({
        'LONDON': now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'NYC': now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'DUBAI': now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'SINGAPORE': now.toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'GVA': now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-5 gap-4 mb-8">
      {Object.entries(times).map(([city, time]) => (
        <div key={city} className="bg-slate-900 border border-slate-800 p-4 rounded-sm text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{city}</div>
          <div className="text-xl font-mono text-paragon-gold font-bold">{time}</div>
        </div>
      ))}
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'Elena Vance', text: 'Anyone have a driver contact for Courchevel tonight?', time: '09:42' },
    { id: 2, user: 'James Sterling', text: 'Check the Knowledge Base under Alpine Logistics. High-End Gstaad team just expanded there.', time: '09:45' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    setMessages([...messages, {
      id: Date.now(),
      user: currentUser.name,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatMessage('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-slate-900 uppercase tracking-widest">Command Center</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">System Status: <span className="text-emerald-500 font-bold">OPERATIONAL</span> / Active Agents: 14</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On-Call Lead</div>
                <div className="text-xs font-bold text-slate-900">James Sterling</div>
             </div>
          </div>
        </div>
      </div>

      <WorldClock />

      <div className="grid grid-cols-12 gap-8">
        {/* Main Bulletin */}
        <div className="col-span-8 space-y-8">
           <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <SectionHeader title="Bulletin Board" />
                <button className="text-[10px] font-bold text-paragon hover:underline uppercase tracking-widest">Create Post +</button>
              </div>
              <div className="space-y-6">
                {MOCK_ANNOUNCEMENTS.map(a => (
                   <div key={a.id} className={`p-6 border-l-4 ${a.priority === 'HIGH' ? 'border-red-500 bg-red-50' : 'border-paragon bg-slate-50'} rounded-r-sm`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                        <Badge color={a.priority === 'HIGH' ? 'red' : 'teal'}>{a.priority}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">{a.content}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                         <span>Posted by {a.author}</span>
                         <span>{a.date}</span>
                      </div>
                   </div>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-900 text-white p-8 rounded-sm shadow-xl">
                 <h3 className="font-cinzel text-lg font-bold mb-4 text-paragon-gold">ACTIVE INCIDENTS</h3>
                 <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-paragon-gold">!</div>
                       <div>
                          <p className="text-xs font-bold">Lufthansa Strike Warning</p>
                          <p className="text-[10px] text-slate-400">Affecting FRA/MUC hubs on May 25th.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-paragon-gold">!</div>
                       <div>
                          <p className="text-xs font-bold">Aspen Airport Closure</p>
                          <p className="text-[10px] text-slate-400">Maintenance scheduled June 1-10. Reroute to EGE.</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
                 <h3 className="font-cinzel text-sm font-bold mb-4 uppercase tracking-widest">QUICK ACTIONS</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {['PNR Parse', 'Jet Quote', 'Hotel Book', 'Client Search'].map(action => (
                       <button key={action} className="p-3 border border-slate-100 bg-slate-50 text-[10px] font-bold uppercase hover:bg-paragon hover:text-white transition-all rounded-sm">{action}</button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Global Internal Chat */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col h-[600px]">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Internal Comms</h3>
              <span className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 <span className="text-[9px] font-bold text-slate-400">GLOBAL CHANNEL</span>
              </span>
           </div>
           
           <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map(m => (
                 <div key={m.id} className={`max-w-[85%] ${m.user === currentUser.name ? 'ml-auto text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                       {m.user !== currentUser.name && <span className="text-[10px] font-bold text-paragon">{m.user}</span>}
                       <span className="text-[9px] text-slate-300 font-mono">{m.time}</span>
                    </div>
                    <div className={`p-3 text-xs rounded-lg ${m.user === currentUser.name ? 'bg-paragon text-white' : 'bg-slate-100 text-slate-700'}`}>
                       {m.text}
                    </div>
                 </div>
              ))}
           </div>

           <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100">
              <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Type message... (use @ to tag)"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full p-3 pr-12 text-xs border border-slate-200 rounded-sm focus:ring-1 focus:ring-paragon outline-none"
                 />
                 <button type="submit" className="absolute right-2 top-2 p-1.5 text-paragon hover:text-paragon-dark">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
