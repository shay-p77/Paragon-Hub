
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

// Icon components for mobile nav
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const OpsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const SalesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const AccountingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const KnowledgeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PortalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const getTabIcon = (tabId: string) => {
  switch (tabId) {
    case 'home': return <HomeIcon />;
    case 'ops': return <OpsIcon />;
    case 'sales': return <SalesIcon />;
    case 'accounting': return <AccountingIcon />;
    case 'knowledge': return <KnowledgeIcon />;
    case 'portal': return <PortalIcon />;
    default: return <HomeIcon />;
  }
};

const getTabShortLabel = (tabId: string) => {
  switch (tabId) {
    case 'home': return 'Home';
    case 'ops': return 'Ops';
    case 'sales': return 'CRM';
    case 'accounting': return 'Finance';
    case 'knowledge': return 'KB';
    case 'portal': return 'Portal';
    default: return 'Home';
  }
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, googleUser, avatarColor, pendingRequestCount = 0 }) => {
  const tabs = [
    { id: 'home', label: 'COMMAND CENTER', roles: ['ADMIN', 'OPERATIONS', 'SALES', 'ACCOUNTING'] },
    { id: 'ops', label: 'OPERATIONS', roles: ['ADMIN', 'OPERATIONS', 'ACCOUNTING'] },
    { id: 'sales', label: 'CRM', roles: ['ADMIN', 'SALES'] },
    { id: 'accounting', label: 'ACCOUNTING', roles: ['ADMIN', 'ACCOUNTING'] },
    { id: 'knowledge', label: 'KNOWLEDGE BASE', roles: ['ADMIN', 'OPERATIONS', 'SALES'] },
    { id: 'portal', label: 'CLIENT PORTAL', roles: ['ADMIN', 'CLIENT'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-64 bg-slate-900 text-white flex-col border-r border-paragon-dark flex-shrink-0">
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

      {/* Main Content - With bottom padding on mobile for tab bar */}
      <main className="flex-1 overflow-auto flex flex-col pb-28 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar - Hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {visibleTabs.slice(0, 5).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                activeTab === tab.id
                  ? 'text-paragon-gold'
                  : 'text-slate-400'
              }`}
            >
              {getTabIcon(tab.id)}
              <span className="text-[9px] mt-1 font-semibold tracking-wide">{getTabShortLabel(tab.id)}</span>
              {tab.id === 'ops' && pendingRequestCount > 0 && (
                <span className="absolute top-2 right-1/2 translate-x-4 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
                </span>
              )}
              {tab.id === 'home' && (
                <span className="absolute top-3 right-1/2 translate-x-4 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
