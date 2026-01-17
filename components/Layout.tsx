
import React from 'react';
import { User, UserRole } from '../types';
import { GoogleUser } from './Login';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  googleUser?: GoogleUser | null;
  avatarColor?: string;
  pendingRequestCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, googleUser, avatarColor, pendingRequestCount = 0 }) => {
  const tabs = [
    { id: 'home', label: 'COMMAND CENTER', roles: ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING'] },
    { id: 'ops', label: 'OPERATIONS', roles: ['ADMIN', 'OPERATIONS', 'ACCOUNTING'] },
    { id: 'sales', label: 'SALES CRM', roles: ['ADMIN', 'SALES'] },
    { id: 'accounting', label: 'ACCOUNTING', roles: ['ADMIN', 'ACCOUNTING'] },
    { id: 'knowledge', label: 'KNOWLEDGE BASE', roles: ['ADMIN', 'OPERATIONS', 'SALES'] },
    { id: 'portal', label: 'CLIENT PORTAL', roles: ['ADMIN', 'CLIENT'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col border-r border-paragon-dark">
        <div className="p-6 border-b border-slate-800">
          <h1 className="font-cinzel text-2xl font-bold tracking-widest text-paragon-gold">PARAGON</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">Hub Enterprise OS</p>
        </div>
        
        <nav className="flex-1 mt-4">
          <div className="px-6 py-2 text-[8px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-1">Navigation</div>
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-4 text-xs font-semibold tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? 'bg-paragon text-white border-r-4 border-paragon-gold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.id === 'home' && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
              {tab.id === 'ops' && pendingRequestCount > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg"
              style={{ backgroundColor: googleUser?.avatarColor || '#D4AF37' }}
            >
              {googleUser ? googleUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold truncate w-32">{googleUser ? googleUser.name : currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate w-32">{googleUser ? googleUser.email : currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
