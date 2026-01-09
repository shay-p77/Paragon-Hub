
import React, { useState, useEffect } from 'react';
import { SectionHeader, Badge } from './Shared';
import { MOCK_USERS } from '../constants';
import { User, Comment, Announcement, BookingRequest } from '../types';

interface HomeProps {
  currentUser: User;
  announcements: Announcement[];
  comments?: Comment[];
  onAddComment?: (text: string, parentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'date' | 'author'>) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  onAddRequest?: (req: any) => void;
  requests?: BookingRequest[];
}

const WorldClock: React.FC = () => {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimes({
        'LA': now.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'NYC': now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'LONDON': now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'TEL AVIV': now.toLocaleTimeString('en-US', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'SYDNEY': now.toLocaleTimeString('en-US', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

const Home: React.FC<HomeProps> = ({ currentUser, announcements, comments = [], onAddComment, onDeleteComment, onAddAnnouncement, onDeleteAnnouncement, onAddRequest, requests = [] }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'Elena Vance', text: 'Anyone have a driver contact for Courchevel tonight?', time: '09:42' },
    { id: 2, user: 'James Sterling', text: 'Check the Knowledge Base under Alpine Logistics. High-End Gstaad team just expanded there.', time: '09:45' },
  ]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPriority, setNewPostPriority] = useState<'HIGH' | 'NORMAL'>('NORMAL');

  // Quick Add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [requestMode, setRequestMode] = useState<'QUICK' | 'DETAIL'>('QUICK');
  const [quickSnippet, setQuickSnippet] = useState('');
  const [detailServiceType, setDetailServiceType] = useState<'FLIGHT' | 'HOTEL' | 'LOGISTICS'>('FLIGHT');
  const [detailClientName, setDetailClientName] = useState('');
  const [detailTargetDate, setDetailTargetDate] = useState('');
  const [detailSpecs, setDetailSpecs] = useState('');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showQuickAdd) setShowQuickAdd(false);
        if (deleteConfirm) setDeleteConfirm(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showCreateModal, showQuickAdd, deleteConfirm]);

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'post' && onDeleteAnnouncement) {
      onDeleteAnnouncement(deleteConfirm.id);
    } else if (deleteConfirm.type === 'comment' && onDeleteComment) {
      onDeleteComment(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

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

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (onAddAnnouncement) {
      onAddAnnouncement({
        title: newPostTitle,
        content: newPostContent,
        priority: newPostPriority
      });
    }
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostPriority('NORMAL');
    setShowCreateModal(false);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRequest) return;

    if (requestMode === 'QUICK') {
      if (!quickSnippet.trim()) return;
      onAddRequest({
        agentId: currentUser.id,
        clientId: '',
        type: 'GENERAL',
        status: 'PENDING',
        priority: 'NORMAL',
        notes: quickSnippet,
        timestamp: new Date().toISOString()
      });
      setQuickSnippet('');
    } else {
      if (!detailClientName.trim() || !detailSpecs.trim()) return;
      onAddRequest({
        agentId: currentUser.id,
        clientId: '',
        type: detailServiceType,
        status: 'PENDING',
        priority: 'NORMAL',
        notes: `Client: ${detailClientName}\nTarget Date: ${detailTargetDate}\nSpecs: ${detailSpecs}`,
        timestamp: new Date().toISOString()
      });
      setDetailClientName('');
      setDetailTargetDate('');
      setDetailSpecs('');
    }
    setShowQuickAdd(false);
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
           {/* Quick Add Operational Dispatch */}
           <div className="bg-white border-2 border-paragon rounded-sm shadow-sm">
              <div className="bg-gradient-to-r from-paragon to-paragon-dark p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Operational Dispatch</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRequestMode('QUICK')}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      requestMode === 'QUICK'
                        ? 'bg-white text-paragon'
                        : 'bg-paragon-dark/50 text-white/70 hover:text-white'
                    }`}
                  >
                    QUICK ADD
                  </button>
                  <button
                    onClick={() => setRequestMode('DETAIL')}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      requestMode === 'DETAIL'
                        ? 'bg-white text-paragon'
                        : 'bg-paragon-dark/50 text-white/70 hover:text-white'
                    }`}
                  >
                    DETAIL ADD
                  </button>
                </div>
              </div>

              <form onSubmit={handleQuickAddSubmit} className="p-6">
                {requestMode === 'QUICK' ? (
                  <div>
                    <textarea
                      value={quickSnippet}
                      onChange={(e) => setQuickSnippet(e.target.value)}
                      placeholder="Paste a request snippet, PNR, or client note here..."
                      className="w-full h-32 p-4 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none"
                      required
                    />
                    <button
                      type="submit"
                      className="mt-4 w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors"
                    >
                      Confirm Quick Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Service Type</label>
                        <select
                          value={detailServiceType}
                          onChange={(e) => setDetailServiceType(e.target.value as any)}
                          className="w-full p-2 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-paragon"
                        >
                          <option value="FLIGHT">Aviation (Flight)</option>
                          <option value="HOTEL">Hotel</option>
                          <option value="LOGISTICS">Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Client Name</label>
                        <input
                          type="text"
                          value={detailClientName}
                          onChange={(e) => setDetailClientName(e.target.value)}
                          placeholder="e.g. Alice Johnson"
                          className="w-full p-2 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-paragon"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Target Date</label>
                        <input
                          type="date"
                          value={detailTargetDate}
                          onChange={(e) => setDetailTargetDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-paragon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Request Specifications</label>
                      <textarea
                        value={detailSpecs}
                        onChange={(e) => setDetailSpecs(e.target.value)}
                        placeholder="Enter detailed flight numbers, hotel preferences, or special instructions..."
                        className="w-full h-24 p-3 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-paragon resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors"
                    >
                      Confirm Detailed Request
                    </button>
                  </div>
                )}
              </form>
           </div>

           <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <SectionHeader title="Bulletin Board" />
                <button onClick={() => setShowCreateModal(true)} className="text-[10px] font-bold text-paragon hover:underline uppercase tracking-widest">Create Post +</button>
              </div>
              <div className="space-y-6">
                {announcements.map(a => {
                  const announcementComments = comments.filter(c => c.parentId === a.id);
                  const isExpanded = expandedAnnouncement === a.id;

                  const isOwnPost = a.author === currentUser.name;

                  return (
                   <div key={a.id} className={`border-l-4 ${a.priority === 'HIGH' ? 'border-red-500 bg-red-50' : 'border-paragon bg-slate-50'} rounded-r-sm group`}>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge color={a.priority === 'HIGH' ? 'red' : 'teal'}>{a.priority}</Badge>
                            {isOwnPost && onDeleteAnnouncement && (
                              <button
                                onClick={() => setDeleteConfirm({ type: 'post', id: a.id })}
                                className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete post"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">{a.content}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                           <span>Posted by {a.author}</span>
                           <div className="flex gap-4 items-center">
                             <button
                               onClick={() => setExpandedAnnouncement(isExpanded ? null : a.id)}
                               className="text-paragon hover:underline flex items-center gap-1"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                               </svg>
                               {announcementComments.length} Comments
                             </button>
                             <span>{a.date}</span>
                           </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white">
                          <div className="p-4 space-y-3 max-h-60 overflow-auto">
                            {announcementComments.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic text-center py-2">No comments yet. Be the first to comment!</p>
                            ) : (
                              announcementComments.map(c => {
                                const author = MOCK_USERS.find(u => u.id === c.authorId);
                                const isOwnComment = c.authorId === currentUser.id;
                                return (
                                  <div key={c.id} className="flex gap-3 group">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                                      {author?.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex gap-2 items-center mb-0.5">
                                          <span className="text-[10px] font-bold text-slate-900">{author?.name}</span>
                                          <span className="text-[9px] text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                          {isOwnComment && onDeleteComment && (
                                            <button
                                              onClick={() => setDeleteConfirm({ type: 'comment', id: c.id })}
                                              className="ml-auto text-[9px] text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                              title="Delete comment"
                                            >
                                              ✕
                                            </button>
                                          )}
                                       </div>
                                       <div className="text-[11px] text-slate-700 leading-normal">
                                          {c.text}
                                       </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {onAddComment && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!commentText.trim()) return;
                                onAddComment(commentText, a.id);
                                setCommentText('');
                              }}
                              className="p-4 border-t border-slate-100"
                            >
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  className="flex-1 p-2 text-xs border border-slate-200 outline-none focus:ring-1 focus:ring-paragon rounded-sm"
                                />
                                <button type="submit" className="px-4 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors">
                                  Post
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                   </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* On Duty Now */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-sm shadow-sm p-8">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">On Duty Now</h3>
           </div>

           <div className="space-y-4">
              {/* Jonathan Sterling */}
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                       JS
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                 </div>
                 <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">Jonathan Sterling</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Senior Concierge</div>
                 </div>
              </div>

              {/* Sarah Kensington */}
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                       SK
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                 </div>
                 <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">Sarah Kensington</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Lifestyle Manager</div>
                 </div>
              </div>

              {/* Elena Vance */}
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                       EV
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                 </div>
                 <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">Elena Vance</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Global Logistics</div>
                 </div>
              </div>
           </div>

           <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-paragon transition-colors">
              Launch Team Sync
           </button>
        </div>
      </div>

      {/* Inbound Queue (Recent Requests) */}
      {requests && requests.length > 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-sm shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Inbound Queue ({requests.filter(r => r.status === 'PENDING').length})</h3>
            </div>
            <button className="text-[9px] font-bold text-paragon hover:underline uppercase tracking-widest">View All →</button>
          </div>
          <div className="space-y-2">
            {requests.filter(r => r.status === 'PENDING').slice(0, 2).map(r => (
              <div key={r.id} className="bg-slate-50 border border-slate-200 p-3 rounded-sm hover:border-paragon transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : 'slate'}>{r.type}</Badge>
                    <span className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <Badge color={r.priority === 'URGENT' || r.priority === 'CRITICAL' ? 'red' : 'slate'}>{r.priority}</Badge>
                </div>
                <p className="text-[11px] text-slate-700 truncate">{r.notes}</p>
              </div>
            ))}
            {requests.filter(r => r.status === 'PENDING').length === 0 && (
              <p className="text-[10px] text-slate-400 italic text-center py-4">All requests processed. Great work!</p>
            )}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Create Bulletin Post</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  placeholder="Post title..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Content</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full p-3 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm h-32"
                  placeholder="Post content..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPostPriority('NORMAL')}
                    className={`flex-1 py-2 px-4 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                      newPostPriority === 'NORMAL'
                        ? 'bg-paragon text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPostPriority('HIGH')}
                    className={`flex-1 py-2 px-4 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                      newPostPriority === 'HIGH'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    High Priority
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Delete {deleteConfirm.type === 'post' ? 'Post' : 'Comment'}</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this {deleteConfirm.type}? This will permanently remove it from the bulletin board.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
