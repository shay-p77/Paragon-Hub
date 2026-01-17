
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionHeader, Badge } from './Shared';
import { MOCK_USERS } from '../constants';
import { User, Comment, Announcement, BookingRequest } from '../types';
import { GoogleUser } from './Login';

interface HomeProps {
  currentUser: User;
  announcements: Announcement[];
  comments?: Comment[];
  onAddComment?: (text: string, parentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'date' | 'author'>) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  onAddRequest?: (req: any) => void;
  onDeleteRequest?: (requestId: string) => void;
  requests?: BookingRequest[];
  googleUser?: GoogleUser | null;
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

const Home: React.FC<HomeProps> = ({ currentUser, announcements, comments = [], onAddComment, onDeleteComment, onAddAnnouncement, onDeleteAnnouncement, onAddRequest, onDeleteRequest, requests = [], googleUser }) => {
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
  const [requestPriority, setRequestPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'post' | 'comment' | 'request'; id: string } | null>(null);

  // On Duty expanded state
  const [onDutyExpanded, setOnDutyExpanded] = useState(false);

  // User status state
  const [userStatus, setUserStatus] = useState<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'>('AVAILABLE');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Expanded content state for long posts and comments
  const [expandedPostContent, setExpandedPostContent] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Track which posts/comments are actually truncated (overflow detection)
  const [truncatedPosts, setTruncatedPosts] = useState<Set<string>>(new Set());
  const [truncatedComments, setTruncatedComments] = useState<Set<string>>(new Set());

  // Refs to measure text overflow
  const postRefs = useRef<Map<string, HTMLParagraphElement>>(new Map());
  const commentRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  // Check if elements are truncated (works with line-clamp)
  const checkTruncation = useCallback(() => {
    const newTruncatedPosts = new Set<string>();
    postRefs.current.forEach((el, id) => {
      if (el) {
        // Check for horizontal overflow (text wider than container)
        if (el.scrollWidth > el.clientWidth) {
          newTruncatedPosts.add(id);
          return;
        }
        // For line-clamp, we need to temporarily remove it to measure true height
        const originalStyle = el.style.cssText;
        const originalClass = el.className;
        el.style.webkitLineClamp = 'unset';
        el.style.display = 'block';
        el.style.overflow = 'visible';
        el.className = el.className.replace('line-clamp-2', '');
        const fullHeight = el.scrollHeight;
        el.style.cssText = originalStyle;
        el.className = originalClass;
        const clampedHeight = el.clientHeight;
        if (fullHeight > clampedHeight + 1) {
          newTruncatedPosts.add(id);
        }
      }
    });
    setTruncatedPosts(newTruncatedPosts);

    const newTruncatedComments = new Set<string>();
    commentRefs.current.forEach((el, id) => {
      if (el) {
        // Check for horizontal overflow
        if (el.scrollWidth > el.clientWidth) {
          newTruncatedComments.add(id);
          return;
        }
        // Same approach for comments
        const originalStyle = el.style.cssText;
        const originalClass = el.className;
        el.style.webkitLineClamp = 'unset';
        el.style.display = 'block';
        el.style.overflow = 'visible';
        el.className = el.className.replace('line-clamp-2', '');
        const fullHeight = el.scrollHeight;
        el.style.cssText = originalStyle;
        el.className = originalClass;
        const clampedHeight = el.clientHeight;
        if (fullHeight > clampedHeight + 1) {
          newTruncatedComments.add(id);
        }
      }
    });
    setTruncatedComments(newTruncatedComments);
  }, []);

  // Check truncation on mount and when content changes
  useEffect(() => {
    // Small delay to let DOM render and measure correctly
    const timeoutId = setTimeout(checkTruncation, 50);
    window.addEventListener('resize', checkTruncation);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [announcements, comments, checkTruncation]);

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
    } else if (deleteConfirm.type === 'request' && onDeleteRequest) {
      onDeleteRequest(deleteConfirm.id);
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

    const agentId = googleUser?.id || currentUser.id;
    const agentName = googleUser?.name || currentUser.name;

    if (requestMode === 'QUICK') {
      if (!quickSnippet.trim()) return;
      onAddRequest({
        agentId,
        clientId: '',
        type: 'GENERAL',
        status: 'PENDING',
        priority: requestPriority,
        notes: quickSnippet,
        timestamp: new Date().toISOString(),
        details: {
          agentName
        }
      });
      setQuickSnippet('');
    } else {
      if (!detailClientName.trim() || !detailSpecs.trim()) return;
      onAddRequest({
        agentId,
        clientId: '',
        type: detailServiceType,
        status: 'PENDING',
        priority: requestPriority,
        notes: detailSpecs,
        timestamp: new Date().toISOString(),
        details: {
          clientName: detailClientName,
          targetDate: detailTargetDate,
          agentName
        }
      });
      setDetailClientName('');
      setDetailTargetDate('');
      setDetailSpecs('');
    }
    setRequestPriority('NORMAL');
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
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4 hover:border-paragon transition-colors"
            >
               <div className={`w-2 h-2 rounded-full ${
                 userStatus === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' :
                 userStatus === 'BUSY' ? 'bg-red-500' :
                 userStatus === 'AWAY' ? 'bg-amber-500' :
                 'bg-slate-400'
               }`}></div>
               <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userStatus}</div>
                  <div className="text-xs font-bold text-slate-900">{googleUser?.name || currentUser.name}</div>
               </div>
               <svg className={`w-4 h-4 text-slate-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
               </svg>
            </button>

            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  <button
                    onClick={() => { setUserStatus('AVAILABLE'); setShowStatusDropdown(false); }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'AVAILABLE' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-slate-700">Available</span>
                  </button>
                  <button
                    onClick={() => { setUserStatus('BUSY'); setShowStatusDropdown(false); }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'BUSY' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-semibold text-slate-700">Busy</span>
                  </button>
                  <button
                    onClick={() => { setUserStatus('AWAY'); setShowStatusDropdown(false); }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'AWAY' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-semibold text-slate-700">Away</span>
                  </button>
                  <button
                    onClick={() => { setUserStatus('OFFLINE'); setShowStatusDropdown(false); }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'OFFLINE' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span className="text-xs font-semibold text-slate-700">Offline</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WorldClock />

      {/* On Duty Now - Expandable Indicator */}
      <div className="mb-8">
        <button
          onClick={() => setOnDutyExpanded(!onDutyExpanded)}
          className="w-full bg-white border border-slate-200 rounded-sm shadow-sm p-4 flex items-center justify-between hover:border-paragon transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">On Duty Now</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-[10px] border-2 border-white">JS</div>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-[10px] border-2 border-white">SK</div>
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-[10px] border-2 border-white">EV</div>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">3 team members online</span>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${onDutyExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {onDutyExpanded && (
          <div className="bg-white border border-t-0 border-slate-200 rounded-b-sm shadow-sm p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-3 gap-6">
              {/* Jonathan Sterling */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">JS</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Jonathan Sterling</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Senior Concierge</div>
                </div>
              </div>

              {/* Sarah Kensington */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">SK</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Sarah Kensington</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Lifestyle Manager</div>
                </div>
              </div>

              {/* Elena Vance */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">EV</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Elena Vance</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Global Logistics</div>
                </div>
              </div>
            </div>
            {/* <button className="w-full mt-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-paragon transition-colors border-t border-slate-100 pt-6">
              Launch Team Sync
            </button> */}
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content - Operational Dispatch */}
        <div className="col-span-8">
           {/* Quick Add Operational Dispatch */}
           <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-[400px] flex flex-col">
              <div className="bg-slate-900 p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-paragon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-paragon-gold">Operational Dispatch</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRequestMode('QUICK');
                      // Clear detail fields when switching to quick
                      setDetailClientName('');
                      setDetailTargetDate('');
                      setDetailSpecs('');
                    }}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                      requestMode === 'QUICK'
                        ? 'bg-paragon-gold text-slate-900'
                        : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                  >
                    QUICK ADD
                  </button>
                  <button
                    onClick={() => {
                      setRequestMode('DETAIL');
                      // Clear quick field when switching to detail
                      setQuickSnippet('');
                    }}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                      requestMode === 'DETAIL'
                        ? 'bg-paragon-gold text-slate-900'
                        : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                  >
                    DETAIL ADD
                  </button>
                </div>
              </div>

              <form onSubmit={handleQuickAddSubmit} className="p-6 flex-1 flex flex-col overflow-hidden">
                {requestMode === 'QUICK' ? (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={quickSnippet}
                      onChange={(e) => setQuickSnippet(e.target.value)}
                      placeholder="Paste a request snippet, PNR, or client note here..."
                      className="w-full flex-1 p-4 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon-gold rounded-sm resize-none"
                      required
                    />
                    <div className="mt-4 flex-shrink-0">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRequestPriority('NORMAL')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                            requestPriority === 'NORMAL'
                              ? 'bg-paragon-gold text-slate-900'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequestPriority('URGENT')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                            requestPriority === 'URGENT'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Urgent
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 w-full bg-paragon-gold text-slate-900 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors flex-shrink-0 rounded-sm"
                    >
                      Confirm Quick Request
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="grid grid-cols-3 gap-4 flex-shrink-0">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Service Type</label>
                        <select
                          value={detailServiceType}
                          onChange={(e) => setDetailServiceType(e.target.value as any)}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon-gold rounded-sm"
                        >
                          <option value="FLIGHT">Aviation (Flight)</option>
                          <option value="HOTEL">Hotel</option>
                          <option value="LOGISTICS">Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Client Name</label>
                        <input
                          type="text"
                          value={detailClientName}
                          onChange={(e) => setDetailClientName(e.target.value)}
                          placeholder="e.g. Alice Johnson"
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon-gold rounded-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Target Date</label>
                        <input
                          type="date"
                          value={detailTargetDate}
                          onChange={(e) => setDetailTargetDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon-gold rounded-sm"
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex-shrink-0">Request Specifications</label>
                      <textarea
                        value={detailSpecs}
                        onChange={(e) => setDetailSpecs(e.target.value)}
                        placeholder="Enter detailed flight numbers, hotel preferences, or special instructions..."
                        className="w-full flex-1 p-3 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon-gold resize-none rounded-sm"
                        required
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRequestPriority('NORMAL')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                            requestPriority === 'NORMAL'
                              ? 'bg-paragon-gold text-slate-900'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequestPriority('URGENT')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                            requestPriority === 'URGENT'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Urgent
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-paragon-gold text-slate-900 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors flex-shrink-0 rounded-sm"
                    >
                      Confirm Detailed Request
                    </button>
                  </div>
                )}
              </form>
           </div>
        </div>

        {/* Bulletin Board - Sidebar */}
        <div className="col-span-4">
           <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <SectionHeader title="Bulletin Board" />
                <button onClick={() => setShowCreateModal(true)} className="text-[10px] font-bold text-paragon hover:underline uppercase tracking-widest">+ Post</button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {announcements.map(a => {
                  const announcementComments = comments.filter(c => c.parentId === a.id);
                  const isExpanded = expandedAnnouncement === a.id;

                  const isOwnPost = googleUser ? a.author === googleUser.name : a.author === currentUser.name;

                  return (
                   <div key={a.id} className={`border-l-2 ${a.priority === 'HIGH' ? 'border-red-500 bg-red-50' : 'border-paragon bg-slate-50'} rounded-r-sm group`}>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-xs font-bold text-slate-900 leading-tight">{a.title}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <Badge color={a.priority === 'HIGH' ? 'red' : 'teal'}>{a.priority}</Badge>
                            {isOwnPost && onDeleteAnnouncement && (
                              <button
                                onClick={() => setDeleteConfirm({ type: 'post', id: a.id })}
                                className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete post"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mb-3">
                          <p
                            ref={(el) => {
                              if (el) postRefs.current.set(a.id, el);
                              else postRefs.current.delete(a.id);
                            }}
                            className={`text-[11px] text-slate-600 leading-relaxed break-words ${expandedPostContent === a.id ? '' : 'line-clamp-2'}`}
                          >
                            {a.content}
                          </p>
                          {(truncatedPosts.has(a.id) || expandedPostContent === a.id) && (
                            <button
                              onClick={() => setExpandedPostContent(expandedPostContent === a.id ? null : a.id)}
                              className="text-[9px] text-paragon hover:underline font-semibold mt-1 flex items-center gap-0.5"
                            >
                              {expandedPostContent === a.id ? 'Show less' : 'Show more'}
                              <svg className={`w-3 h-3 transition-transform ${expandedPostContent === a.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                           <span>{a.author}</span>
                           <button
                             onClick={() => setExpandedAnnouncement(isExpanded ? null : a.id)}
                             className="text-paragon hover:underline flex items-center gap-1"
                           >
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                             </svg>
                             {announcementComments.length}
                           </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white">
                          <div className="p-3 space-y-2 max-h-40 overflow-auto">
                            {announcementComments.length === 0 ? (
                              <p className="text-[9px] text-slate-400 italic text-center py-2">No comments yet</p>
                            ) : (
                              announcementComments.map(c => {
                                const mockAuthor = MOCK_USERS.find(u => u.id === c.authorId);
                                const isOwnComment = googleUser ? c.authorId === googleUser.id : c.authorId === currentUser.id;
                                // If it's the current google user's comment, show their name; otherwise try mock user or show "Unknown"
                                const authorName = (googleUser && c.authorId === googleUser.id) ? googleUser.name : (mockAuthor?.name || 'Unknown');
                                const authorInitial = authorName.charAt(0);
                                return (
                                  <div key={c.id} className="flex gap-2 group">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[7px] font-bold flex-shrink-0">
                                      {authorInitial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex gap-1 items-center mb-0.5">
                                          <span className="text-[9px] font-bold text-slate-900 truncate">{authorName}</span>
                                          {isOwnComment && onDeleteComment && (
                                            <button
                                              onClick={() => setDeleteConfirm({ type: 'comment', id: c.id })}
                                              className="ml-auto text-[8px] text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                              title="Delete comment"
                                            >
                                              ✕
                                            </button>
                                          )}
                                       </div>
                                       <div className="text-[10px] text-slate-700 leading-snug">
                                          <span
                                            ref={(el) => {
                                              if (el) commentRefs.current.set(c.id, el);
                                              else commentRefs.current.delete(c.id);
                                            }}
                                            className={`break-words ${expandedComments.has(c.id) ? '' : 'line-clamp-2'}`}
                                          >
                                            {c.text}
                                          </span>
                                          {(truncatedComments.has(c.id) || expandedComments.has(c.id)) && (
                                            <button
                                              onClick={() => {
                                                const newSet = new Set(expandedComments);
                                                if (newSet.has(c.id)) {
                                                  newSet.delete(c.id);
                                                } else {
                                                  newSet.add(c.id);
                                                }
                                                setExpandedComments(newSet);
                                              }}
                                              className="text-[8px] text-paragon hover:underline font-semibold ml-1 inline-flex items-center gap-0.5"
                                            >
                                              {expandedComments.has(c.id) ? 'less' : 'more'}
                                              <svg className={`w-2 h-2 transition-transform ${expandedComments.has(c.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                              </svg>
                                            </button>
                                          )}
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
                              className="p-3 border-t border-slate-100"
                            >
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  className="flex-1 p-1.5 text-[10px] border border-slate-200 outline-none focus:ring-1 focus:ring-paragon rounded-sm"
                                />
                                <button type="submit" className="px-2 py-1.5 bg-paragon text-white text-[9px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors">
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
      </div>

      {/* Inbound Queue (All Pending Requests) */}
      {requests && requests.filter(r => r.status === 'PENDING').length > 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-sm shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Inbound Queue ({requests.filter(r => r.status === 'PENDING').length})</h3>
            </div>
          </div>
          <div className="space-y-2">
            {requests
              .filter(r => r.status === 'PENDING')
              .sort((a, b) => {
                // URGENT/CRITICAL items first
                const aUrgent = a.priority === 'URGENT' || a.priority === 'CRITICAL';
                const bUrgent = b.priority === 'URGENT' || b.priority === 'CRITICAL';
                if (aUrgent && !bUrgent) return -1;
                if (!aUrgent && bUrgent) return 1;
                // Then by timestamp (newest first)
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              })
              .map(r => {
                const isOwnRequest = googleUser ? r.agentId === googleUser.id : r.agentId === currentUser.id;
                return (
                  <div key={r.id} className={`bg-slate-50 border ${r.priority === 'URGENT' || r.priority === 'CRITICAL' ? 'border-red-300 bg-red-50' : 'border-slate-200'} p-3 rounded-sm hover:border-paragon transition-colors group`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : 'slate'}>{r.type}</Badge>
                        <span className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={r.priority === 'URGENT' || r.priority === 'CRITICAL' ? 'red' : 'slate'}>{r.priority}</Badge>
                        <div className="w-4">
                          {isOwnRequest && onDeleteRequest && (
                            <button
                              onClick={() => setDeleteConfirm({ type: 'request' as any, id: r.id })}
                              className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete request"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-700 truncate">{r.notes}</p>
                  </div>
                );
              })}
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
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
                  <h3 className="text-sm font-bold text-slate-900">Delete {deleteConfirm.type === 'post' ? 'Post' : deleteConfirm.type === 'comment' ? 'Comment' : 'Request'}</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this {deleteConfirm.type}? This will permanently remove it{deleteConfirm.type === 'request' ? ' from the queue' : ' from the bulletin board'}.
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
