
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Operations from './components/Operations';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import KnowledgeBase from './components/KnowledgeBase';
import ClientPortal from './components/ClientPortal';
import Home from './components/Home';
import NotificationCenter from './components/NotificationCenter';
import { MOCK_USERS, INITIAL_REQUESTS, MOCK_COMMENTS, MOCK_ANNOUNCEMENTS } from './constants';
import { User, BookingRequest, Comment, Notification, Announcement } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default Admin
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState<BookingRequest[]>(INITIAL_REQUESTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Logic to handle user tagging notifications
  const handleAddComment = (text: string, parentId: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      parentId
    };
    setComments(prev => [...prev, newComment]);

    // Check for tags
    const tags = text.match(/@u\d+/g);
    if (tags) {
      tags.forEach(tag => {
        const userId = tag.substring(1);
        if (userId !== currentUser.id) {
          const targetUser = MOCK_USERS.find(u => u.id === userId);
          if (targetUser) {
            setNotifications(prev => [{
              id: `n-${Date.now()}`,
              userId,
              message: `${currentUser.name} tagged you in a comment.`,
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
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };

  const handleAddRequest = (req: Partial<BookingRequest>) => {
    const newReq: BookingRequest = {
      id: `req-${Date.now()}`,
      agentId: req.agentId || currentUser.id,
      clientId: req.clientId || '',
      type: req.type || 'GENERAL',
      status: req.status || 'PENDING',
      priority: req.priority || 'NORMAL',
      notes: req.notes || '',
      timestamp: req.timestamp || new Date().toISOString(),
    };
    setRequests(prev => [newReq, ...prev]);

    // Notify Ops if Admin/Sales adds a request
    if (currentUser.role !== 'OPERATIONS') {
      const opsUsers = MOCK_USERS.filter(u => u.role === 'OPERATIONS' || u.role === 'ADMIN');
      opsUsers.forEach(u => {
        setNotifications(prev => [{
          id: `n-${Date.now()}`,
          userId: u.id,
          message: `New booking request from ${currentUser.name}.`,
          type: 'ASSIGN',
          read: false,
          timestamp: new Date().toISOString(),
          link: newReq.id
        }, ...prev]);
      });
    }
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => setNotifications([]);

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home currentUser={currentUser} announcements={announcements} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onAddAnnouncement={handleAddAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement} onAddRequest={handleAddRequest} requests={requests} />;
      case 'ops': return <Operations requests={requests} comments={comments} currentUser={currentUser} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />;
      case 'sales': return <CRM currentUser={currentUser} requests={requests} onAddRequest={handleAddRequest} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />;
      case 'accounting': return <Accounting />;
      case 'knowledge': return <KnowledgeBase />;
      case 'portal': return <ClientPortal />;
      default: return <Home currentUser={currentUser} announcements={announcements} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onAddAnnouncement={handleAddAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement} onAddRequest={handleAddRequest} requests={requests} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser}
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
             <div className="relative">
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
          </div>
        </div>

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default App;
