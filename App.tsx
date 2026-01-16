
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Operations from './components/Operations';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import KnowledgeBase from './components/KnowledgeBase';
import ClientPortal from './components/ClientPortal';
import Home from './components/Home';
import NotificationCenter from './components/NotificationCenter';
import Login, { GoogleUser } from './components/Login';
import { MOCK_USERS, INITIAL_REQUESTS, MOCK_COMMENTS, MOCK_ANNOUNCEMENTS } from './constants';
import { User, BookingRequest, Comment, Notification, Announcement, ConvertedFlight, ConvertedHotel, ConvertedLogistics, PipelineTrip } from './types';

const App: React.FC = () => {
  // Auth state
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('paragon_user');
    if (storedUser) {
      try {
        setGoogleUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('paragon_user');
      }
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogin = (user: GoogleUser) => {
    setGoogleUser(user);
  };

  const handleLogout = () => {
    setGoogleUser(null);
    localStorage.removeItem('paragon_user');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default Admin
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState<BookingRequest[]>(INITIAL_REQUESTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [convertedFlights, setConvertedFlights] = useState<ConvertedFlight[]>([]);
  const [convertedHotels, setConvertedHotels] = useState<ConvertedHotel[]>([]);
  const [convertedLogistics, setConvertedLogistics] = useState<ConvertedLogistics[]>([]);
  const [pipelineTrips, setPipelineTrips] = useState<PipelineTrip[]>([
    // Sample data matching the screenshot
    {
      id: 'pt-1',
      name: 'Aman Tokyo Anniversary...',
      clientName: 'Alice Johnson',
      stage: 'NEW',
      hasFlights: false,
      hasHotels: false,
      hasLogistics: false,
      isUrgent: false,
      tasks: [],
      agent: 'Elena Vance',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pt-2',
      name: 'Formula 1 Paddock Club -...',
      clientName: 'Charlie Davis',
      stage: 'PLANNING',
      hasFlights: true,
      hasHotels: false,
      hasLogistics: false,
      isUrgent: true,
      tasks: [
        { id: 'task-1', text: 'Confirm paddock access', completed: false },
        { id: 'task-2', text: 'Book hospitality suite', completed: false }
      ],
      agent: 'Elena Vance',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pt-3',
      name: 'New York Spring Business...',
      clientName: 'Alice Johnson',
      stage: 'IN_PROGRESS',
      hasFlights: true,
      hasHotels: true,
      hasLogistics: false,
      isUrgent: true,
      tasks: [
        { id: 'task-3', text: 'Finalize meeting schedule', completed: true },
        { id: 'task-4', text: 'Arrange airport transfer', completed: false }
      ],
      agent: 'James Sterling',
      createdAt: new Date().toISOString()
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Ref for notification dropdown click-outside detection
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Generate a consistent color based on user's email
  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
      'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Logic to handle user tagging notifications
  const handleAddComment = (text: string, parentId: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: googleUser?.id || currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      parentId
    };
    setComments(prev => [...prev, newComment]);

    // Check for tags
    const tags = text.match(/@u\d+/g);
    if (tags) {
      const senderName = googleUser?.name || currentUser.name;
      const senderId = googleUser?.id || currentUser.id;
      tags.forEach(tag => {
        const userId = tag.substring(1);
        // Don't notify the sender (check both mock user ID and Google user ID)
        if (userId !== currentUser.id && userId !== senderId) {
          const targetUser = MOCK_USERS.find(u => u.id === userId);
          if (targetUser) {
            setNotifications(prev => [{
              id: `n-${Date.now()}`,
              userId,
              message: `${senderName} tagged you in a comment.`,
              type: 'TAG',
              read: false,
              timestamp: new Date().toISOString(),
              link: parentId
            }, ...prev]);
          }
        }
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleAddAnnouncement = (announcement: Omit<Announcement, 'id' | 'date' | 'author'>) => {
    const newAnnouncement: Announcement = {
      id: `a-${Date.now()}`,
      ...announcement,
      author: googleUser?.name || currentUser.name,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleConvertToFlight = (flight: ConvertedFlight, requestId: string) => {
    setConvertedFlights(prev => [flight, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleConvertToHotel = (hotel: ConvertedHotel, requestId: string) => {
    setConvertedHotels(prev => [hotel, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleConvertToLogistics = (logistics: ConvertedLogistics, requestId: string) => {
    setConvertedLogistics(prev => [logistics, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleUpdateFlight = (id: string, updates: Partial<ConvertedFlight>) => {
    setConvertedFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleUpdateHotel = (id: string, updates: Partial<ConvertedHotel>) => {
    setConvertedHotels(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const handleUpdateLogistics = (id: string, updates: Partial<ConvertedLogistics>) => {
    setConvertedLogistics(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleDeleteFlight = (id: string) => {
    setConvertedFlights(prev => prev.filter(f => f.id !== id));
  };

  const handleDeleteHotel = (id: string) => {
    setConvertedHotels(prev => prev.filter(h => h.id !== id));
  };

  const handleDeleteLogistics = (id: string) => {
    setConvertedLogistics(prev => prev.filter(l => l.id !== id));
  };

  const handleAddPipelineTrip = (trip: PipelineTrip) => {
    setPipelineTrips(prev => [trip, ...prev]);
  };

  const handleUpdatePipelineTrip = (id: string, updates: Partial<PipelineTrip>) => {
    setPipelineTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeletePipelineTrip = (id: string) => {
    setPipelineTrips(prev => prev.filter(t => t.id !== id));
  };

  const handleAddRequest = (req: Partial<BookingRequest>) => {
    const newReq: BookingRequest = {
      id: `req-${Date.now()}`,
      agentId: req.agentId || googleUser?.id || currentUser.id,
      clientId: req.clientId || '',
      type: req.type || 'GENERAL',
      status: req.status || 'PENDING',
      priority: req.priority || 'NORMAL',
      notes: req.notes || '',
      timestamp: req.timestamp || new Date().toISOString(),
      details: req.details,
    };
    setRequests(prev => [newReq, ...prev]);

    // Notify all users except the author when a new request is created
    const senderName = googleUser?.name || currentUser.name;
    const senderId = googleUser?.id || currentUser.id;
    const priorityText = newReq.priority === 'URGENT' || newReq.priority === 'CRITICAL' ? ' (URGENT)' : '';

    MOCK_USERS.forEach(u => {
      // Don't notify the sender (check both mock user ID and Google user ID)
      if (u.id !== currentUser.id && u.id !== senderId) {
        setNotifications(prev => [{
          id: `n-${Date.now()}-${u.id}`,
          userId: u.id,
          message: `New ${newReq.type.toLowerCase()} request from ${senderName}${priorityText}`,
          type: 'ASSIGN',
          read: false,
          timestamp: new Date().toISOString(),
          link: newReq.id
        }, ...prev]);
      }
    });
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => setNotifications([]);

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home currentUser={currentUser} announcements={announcements} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onAddAnnouncement={handleAddAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement} onAddRequest={handleAddRequest} onDeleteRequest={handleDeleteRequest} requests={requests} googleUser={googleUser} />;
      case 'ops': return <Operations requests={requests} comments={comments} currentUser={currentUser} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} googleUser={googleUser} convertedFlights={convertedFlights} convertedHotels={convertedHotels} convertedLogistics={convertedLogistics} onConvertToFlight={handleConvertToFlight} onConvertToHotel={handleConvertToHotel} onConvertToLogistics={handleConvertToLogistics} onUpdateFlight={handleUpdateFlight} onUpdateHotel={handleUpdateHotel} onUpdateLogistics={handleUpdateLogistics} onDeleteFlight={handleDeleteFlight} onDeleteHotel={handleDeleteHotel} onDeleteLogistics={handleDeleteLogistics} pipelineTrips={pipelineTrips} onAddPipelineTrip={handleAddPipelineTrip} onUpdatePipelineTrip={handleUpdatePipelineTrip} onDeletePipelineTrip={handleDeletePipelineTrip} onAddRequest={handleAddRequest} />;
      case 'sales': return <CRM currentUser={currentUser} requests={requests} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />;
      case 'accounting': return <Accounting />;
      case 'knowledge': return <KnowledgeBase />;
      case 'portal': return <ClientPortal />;
      default: return <Home currentUser={currentUser} announcements={announcements} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onAddAnnouncement={handleAddAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement} onAddRequest={handleAddRequest} onDeleteRequest={handleDeleteRequest} requests={requests} googleUser={googleUser} />;
    }
  };

  // Show loading spinner while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-paragon-gold"></div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!googleUser) {
    return <Login onLogin={handleLogin} />;
  }

  const pendingRequestCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={currentUser}
      googleUser={googleUser}
      avatarColor={googleUser ? getAvatarColor(googleUser.email) : undefined}
      pendingRequestCount={pendingRequestCount}
    >
      <div className="flex-1 bg-slate-50 overflow-auto flex flex-col relative">
        {/* Top Header/Breadcrumb */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
             <span>SYSTEM</span>
             <span>/</span>
             <span className="text-slate-900">{activeTab}</span>
          </div>
          <div className="flex gap-6 items-center">
             <div className="text-[10px] font-bold text-slate-500 uppercase flex gap-3">
                <span className="text-slate-300">Switch Role:</span>
                {MOCK_USERS.map(u => (
                   <button
                     key={u.id}
                     onClick={() => {
                       setCurrentUser(u);
                       if (u.role === 'CLIENT') setActiveTab('portal');
                       else if (u.role === 'SALES') setActiveTab('sales');
                       else setActiveTab('home');
                     }}
                     className={`hover:text-paragon transition-colors ${currentUser.id === u.id ? 'text-paragon border-b-2 border-paragon pb-0.5' : ''}`}
                   >
                     {u.role}
                   </button>
                ))}
             </div>
             <div className="h-8 w-[1px] bg-slate-200"></div>
             <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative ${unreadCount > 0 ? 'text-paragon' : 'text-slate-400 hover:text-paragon'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  {unreadCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-bold">
                      {unreadCount}
                    </div>
                  )}
                </button>
                {showNotifications && (
                   <NotificationCenter
                      notifications={userNotifications}
                      onMarkRead={markRead}
                      onClearAll={clearAll}
                   />
                )}
             </div>
             <div className="h-8 w-[1px] bg-slate-200"></div>
             {/* User Profile & Logout */}
             <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getAvatarColor(googleUser.email)} flex items-center justify-center text-white font-bold text-xs`}>
                  {getInitials(googleUser.name)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">{googleUser.name}</div>
                  <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{googleUser.email}</div>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-xs mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 mb-2">Sign Out</h3>
            <p className="text-xs text-slate-500 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
