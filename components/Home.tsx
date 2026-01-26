
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionHeader, Badge } from './Shared';
import { MOCK_USERS } from '../constants';
import { User, Comment, Announcement, BookingRequest } from '../types';
import { GoogleUser } from './Login';
import { API_URL } from '../config';

interface HomeProps {
  currentUser: User;
  announcements: Announcement[];
  comments?: Comment[];
  onAddComment?: (text: string, parentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'date' | 'author'>) => void;
  onEditAnnouncement?: (id: string, updates: { title: string; content: string; priority: 'LOW' | 'NORMAL' | 'HIGH' }) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  onPinAnnouncement?: (id: string) => Promise<void>;
  onArchiveAnnouncement?: (id: string) => Promise<void>;
  onPinComment?: (commentId: string) => Promise<void>;
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
        'TOKYO': now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cities to show on all screens (5 clocks)
  const mainCities = ['LA', 'NYC', 'LONDON', 'TEL AVIV', 'SYDNEY'];
  // Extra city to show only on mobile for even grid (6th clock)
  const mobileOnlyCity = 'TOKYO';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
      {mainCities.map((city) => (
        <div key={city} className="bg-slate-900 border border-slate-800 p-2 sm:p-4 rounded-sm text-center">
          <div className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{city}</div>
          <div className="text-sm sm:text-xl font-mono text-paragon-gold font-bold">{times[city]}</div>
        </div>
      ))}
      {/* 6th clock - only visible on mobile for even 2-column grid */}
      <div className="bg-slate-900 border border-slate-800 p-2 sm:p-4 rounded-sm text-center sm:hidden">
        <div className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{mobileOnlyCity}</div>
        <div className="text-sm sm:text-xl font-mono text-paragon-gold font-bold">{times[mobileOnlyCity]}</div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ currentUser, announcements, comments = [], onAddComment, onDeleteComment, onAddAnnouncement, onEditAnnouncement, onDeleteAnnouncement, onPinAnnouncement, onArchiveAnnouncement, onPinComment, onAddRequest, onDeleteRequest, requests = [], googleUser }) => {
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
  const [requestMode, setRequestMode] = useState<'QUICK' | 'AI_PARSE' | 'DETAIL'>('QUICK');
  const [quickSnippet, setQuickSnippet] = useState('');
  const [detailServiceType, setDetailServiceType] = useState<'FLIGHT' | 'HOTEL' | 'LOGISTICS'>('FLIGHT');
  const [detailClientName, setDetailClientName] = useState('');
  const [detailTargetDate, setDetailTargetDate] = useState('');
  const [detailSpecs, setDetailSpecs] = useState('');
  const [requestPriority, setRequestPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  // AI Parse state
  const [aiParseText, setAiParseText] = useState('');
  const [aiParseStep, setAiParseStep] = useState<'input' | 'review'>('input');
  const [aiParsedData, setAiParsedData] = useState<any>(null);
  const [aiParseError, setAiParseError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'post' | 'comment' | 'request'; id: string } | null>(null);

  // Expanded queue item state
  const [expandedQueueItem, setExpandedQueueItem] = useState<string | null>(null);

  // Edit announcement state
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');

  // Saving states for buttons
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingRequest, setIsSavingRequest] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Error toast state
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // On Duty expanded state
  const [onDutyExpanded, setOnDutyExpanded] = useState(false);

  // Real users from backend for On Duty section
  const [allUsers, setAllUsers] = useState<Array<{
    googleId: string;
    name: string;
    email: string;
    avatarColor: string;
    role: string;
    status: string;
  }>>([]);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/users`);
        if (res.ok) {
          const users = await res.json();
          setAllUsers(users);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
    // Refresh every 30 seconds to see status changes
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // User status state - initialize from googleUser's stored status
  const [userStatus, setUserStatus] = useState<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'>(
    (googleUser?.status as 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') || 'AVAILABLE'
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);


  // Function to update status in backend and localStorage
  const updateUserStatus = async (newStatus: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') => {
    setUserStatus(newStatus);
    setShowStatusDropdown(false);

    if (googleUser) {
      try {
        // Update backend
        await fetch(`${API_URL}/api/auth/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleId: googleUser.googleId, status: newStatus }),
        });

        // Update localStorage
        const updatedUser = { ...googleUser, status: newStatus };
        localStorage.setItem('paragon_user', JSON.stringify(updatedUser));

        // Update allUsers state immediately so On Duty section reflects the change
        setAllUsers(prev => prev.map(u =>
          u.googleId === googleUser.googleId ? { ...u, status: newStatus } : u
        ));
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

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
        if (editingAnnouncement) setEditingAnnouncement(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showCreateModal, showQuickAdd, deleteConfirm, editingAnnouncement]);

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setEditPriority(announcement.priority);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editTitle.trim() || !editContent.trim()) return;
    if (onEditAnnouncement) {
      setIsSavingEdit(true);
      try {
        await onEditAnnouncement(editingAnnouncement.id, {
          title: editTitle,
          content: editContent,
          priority: editPriority,
        });
        setEditingAnnouncement(null);
      } catch (error) {
        setErrorToast('Failed to save changes. Please try again.');
      } finally {
        setIsSavingEdit(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'post' && onDeleteAnnouncement) {
        await onDeleteAnnouncement(deleteConfirm.id);
      } else if (deleteConfirm.type === 'comment' && onDeleteComment) {
        await onDeleteComment(deleteConfirm.id);
      } else if (deleteConfirm.type === 'request' && onDeleteRequest) {
        await onDeleteRequest(deleteConfirm.id);
      }
      setDeleteConfirm(null);
    } catch (error) {
      setErrorToast('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (onAddAnnouncement) {
      setIsSavingPost(true);
      try {
        await onAddAnnouncement({
          title: newPostTitle,
          content: newPostContent,
          priority: newPostPriority
        });
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostPriority('NORMAL');
        setShowCreateModal(false);
      } catch (error) {
        setErrorToast('Failed to create post. Please try again.');
      } finally {
        setIsSavingPost(false);
      }
    }
  };

  // AI Parse function - parse text
  const handleAiParseText = async () => {
    if (!aiParseText.trim()) return;

    setIsParsing(true);
    setAiParseError(null);

    try {
      const response = await fetch(`${API_URL}/api/parse/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiParseText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse text');
      }

      setAiParsedData(result.data);
      setAiParseStep('review');

      // Pre-fill the detail form based on parsed data
      if (result.data.bookingType) {
        setDetailServiceType(result.data.bookingType as 'FLIGHT' | 'HOTEL' | 'LOGISTICS');
      }
      if (result.data.clientName) {
        setDetailClientName(result.data.clientName);
      }

      // Build specs from parsed data
      let specs = '';
      if (result.data.bookingType === 'FLIGHT' && result.data.flight) {
        const f = result.data.flight;
        specs = [
          f.pnr ? `PNR: ${f.pnr}` : '',
          f.airline ? `Airline: ${f.airline}` : '',
          f.routes ? `Routes: ${f.routes}` : '',
          f.dates ? `Dates: ${f.dates}` : '',
          f.passengerCount ? `Passengers: ${f.passengerCount}` : '',
          f.flightNumbers?.length ? `Flights: ${f.flightNumbers.join(', ')}` : '',
        ].filter(Boolean).join('\n');
        if (f.dates) setDetailTargetDate(f.dates.split(',')[0].trim());
      } else if (result.data.bookingType === 'HOTEL' && result.data.hotel) {
        const h = result.data.hotel;
        specs = [
          h.confirmationNumber ? `Confirmation: ${h.confirmationNumber}` : '',
          h.hotelName ? `Hotel: ${h.hotelName}` : '',
          h.roomType ? `Room: ${h.roomType}` : '',
          h.checkIn ? `Check-in: ${h.checkIn}` : '',
          h.checkOut ? `Check-out: ${h.checkOut}` : '',
          h.guestCount ? `Guests: ${h.guestCount}` : '',
        ].filter(Boolean).join('\n');
        if (h.checkIn) setDetailTargetDate(h.checkIn);
      } else if (result.data.bookingType === 'LOGISTICS' && result.data.logistics) {
        const l = result.data.logistics;
        specs = [
          l.confirmationNumber ? `Confirmation: ${l.confirmationNumber}` : '',
          l.serviceType ? `Service: ${l.serviceType}` : '',
          l.provider ? `Provider: ${l.provider}` : '',
          l.date ? `Date: ${l.date}` : '',
          l.time ? `Time: ${l.time}` : '',
          l.pickupLocation ? `Pickup: ${l.pickupLocation}` : '',
          l.dropoffLocation ? `Dropoff: ${l.dropoffLocation}` : '',
        ].filter(Boolean).join('\n');
        if (l.date) setDetailTargetDate(l.date);
      }

      if (result.data.notes) {
        specs += specs ? `\n\nNotes: ${result.data.notes}` : `Notes: ${result.data.notes}`;
      }

      setDetailSpecs(specs);

    } catch (error: any) {
      setAiParseError(error.message || 'Failed to parse confirmation');
    } finally {
      setIsParsing(false);
    }
  };

  // Use parsed data and switch to detail mode
  const handleAiParseSubmit = () => {
    setRequestMode('DETAIL');
    setAiParseStep('input');
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRequest) return;

    const agentId = googleUser?.googleId || currentUser.id;
    const agentName = googleUser?.name || currentUser.name;

    setIsSavingRequest(true);
    try {
      if (requestMode === 'QUICK') {
        if (!quickSnippet.trim()) {
          setIsSavingRequest(false);
          return;
        }
        await onAddRequest({
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
        if (!detailClientName.trim() || !detailSpecs.trim()) {
          setIsSavingRequest(false);
          return;
        }
        await onAddRequest({
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
      setAiParsedData(null);
      setAiParseText('');
      setAiParseStep('input');
      setShowQuickAdd(false);
    } catch (error) {
      setErrorToast('Failed to submit request. Please try again.');
    } finally {
      setIsSavingRequest(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 uppercase tracking-widest">Command Center</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-tight">System Status: <span className="text-emerald-500 font-bold">OPERATIONAL</span> / Active Agents: <span className="font-bold">{allUsers.filter(u => u.status !== 'OFFLINE').length}</span></p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial" ref={statusDropdownRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="w-full sm:w-auto bg-white border border-slate-200 p-3 sm:p-4 rounded-sm shadow-sm flex items-center gap-3 sm:gap-4 hover:border-paragon transition-colors"
            >
               <div className="relative">
                 <div
                   className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                   style={{ backgroundColor: googleUser?.avatarColor || '#3B82F6' }}
                 >
                   {(googleUser?.name || currentUser.name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                 </div>
                 <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                   userStatus === 'AVAILABLE' ? 'bg-emerald-500' :
                   userStatus === 'BUSY' ? 'bg-red-500' :
                   userStatus === 'AWAY' ? 'bg-amber-500' :
                   'bg-slate-400'
                 }`}></div>
               </div>
               <div className="text-left flex-1 sm:flex-initial">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userStatus}</div>
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{googleUser?.name || currentUser.name}</div>
               </div>
               <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
               </svg>
            </button>

            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-lg z-50 animate-slideUp">
                <div className="py-1">
                  <button
                    onClick={() => updateUserStatus('AVAILABLE')}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'AVAILABLE' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-slate-700">Available</span>
                  </button>
                  <button
                    onClick={() => updateUserStatus('BUSY')}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'BUSY' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-semibold text-slate-700">Busy</span>
                  </button>
                  <button
                    onClick={() => updateUserStatus('AWAY')}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${userStatus === 'AWAY' ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-semibold text-slate-700">Away</span>
                  </button>
                  <button
                    onClick={() => updateUserStatus('OFFLINE')}
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
      {(() => {
        // Filter users who are not OFFLINE (on duty)
        const onDutyUsers = allUsers.filter(u => u.status !== 'OFFLINE');
        const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'AVAILABLE': return 'bg-emerald-500';
            case 'BUSY': return 'bg-red-500';
            case 'AWAY': return 'bg-amber-500';
            default: return 'bg-slate-400';
          }
        };
        const getRoleLabel = (role: string) => {
          switch (role) {
            case 'admin': return 'Administrator';
            case 'manager': return 'Manager';
            default: return 'Concierge Agent';
          }
        };

        return (
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => setOnDutyExpanded(!onDutyExpanded)}
              className="w-full bg-white border border-slate-200 rounded-sm shadow-sm p-3 sm:p-4 flex items-center justify-between hover:border-paragon transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${onDutyUsers.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-900">On Duty Now</span>
                </div>
                <div className="flex -space-x-2">
                  {onDutyUsers.slice(0, 3).map(user => (
                    <div
                      key={user.googleId}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-[8px] sm:text-[10px] border-2 border-white"
                      style={{ backgroundColor: user.avatarColor }}
                      title={user.name}
                    >
                      {getInitials(user.name)}
                    </div>
                  ))}
                  {onDutyUsers.length > 3 && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-[8px] sm:text-[10px] border-2 border-white">
                      +{onDutyUsers.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold hidden sm:inline">
                  {onDutyUsers.length} team member{onDutyUsers.length !== 1 ? 's' : ''} online
                </span>
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${onDutyExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {onDutyExpanded && (
              <div className="bg-white border border-t-0 border-slate-200 rounded-b-sm shadow-sm p-4 sm:p-6 animate-slideUp">
                {onDutyUsers.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No team members currently on duty</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {onDutyUsers.map(user => (
                      <div key={user.googleId} className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${getStatusColor(user.status)} border-2 border-white`}></div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{getRoleLabel(user.role)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content - Operational Dispatch */}
        <div className="lg:col-span-8 order-2 lg:order-1">
           {/* Quick Add Operational Dispatch */}
           <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-auto lg:h-[400px] flex flex-col">
              <div className="bg-slate-900 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-paragon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-paragon-gold">Operational Dispatch</h3>
                </div>
                <div className="flex gap-1 sm:gap-0 w-full sm:w-auto border border-slate-600 rounded-sm overflow-hidden">
                  <button
                    onClick={() => {
                      setRequestMode('QUICK');
                      setAiParseStep('input');
                    }}
                    className={`flex-1 sm:flex-initial px-2 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                      requestMode === 'QUICK'
                        ? 'bg-paragon-gold text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    Quick
                  </button>
                  <button
                    onClick={() => {
                      setRequestMode('AI_PARSE');
                      setAiParseStep('input');
                    }}
                    className={`flex-1 sm:flex-initial px-2 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                      requestMode === 'AI_PARSE'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    AI Parse
                  </button>
                  <button
                    onClick={() => {
                      setRequestMode('DETAIL');
                      setAiParseStep('input');
                    }}
                    className={`flex-1 sm:flex-initial px-2 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                      requestMode === 'DETAIL'
                        ? 'bg-paragon-gold text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              <form onSubmit={handleQuickAddSubmit} className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
                {requestMode === 'QUICK' ? (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={quickSnippet}
                      onChange={(e) => setQuickSnippet(e.target.value)}
                      placeholder="Paste a request snippet, PNR, or client note here..."
                      className="w-full flex-1 p-4 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon-gold rounded-sm resize-none min-h-[120px]"
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
                      disabled={isSavingRequest}
                      className="mt-4 w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors flex-shrink-0 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSavingRequest ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                ) : requestMode === 'AI_PARSE' ? (
                  <div className="flex-1 flex flex-col">
                    {aiParseStep === 'input' ? (
                      <>
                        {/* AI Parse Input */}
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">AI-Powered Parsing</span>
                          </div>
                          <p className="text-[10px] text-amber-700">
                            Paste a booking confirmation, email, or itinerary. AI will extract all details.
                          </p>
                        </div>

                        <textarea
                          value={aiParseText}
                          onChange={(e) => setAiParseText(e.target.value)}
                          placeholder="Paste your booking confirmation, itinerary, or PNR details here..."
                          className="w-full flex-1 p-4 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 rounded-sm resize-none min-h-[120px]"
                        />

                        {aiParseError && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                            <p className="text-xs text-red-700">{aiParseError}</p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleAiParseText}
                          disabled={isParsing || !aiParseText.trim()}
                          className="mt-4 w-full py-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isParsing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                              Parsing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Parse with AI
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* AI Parse Review */}
                        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Parsed Successfully</span>
                            {aiParsedData?.confidence && (
                              <span className="ml-auto text-[10px] text-emerald-600 font-semibold">{aiParsedData.confidence}% confidence</span>
                            )}
                          </div>
                          <p className="text-[10px] text-emerald-700">
                            Review below. Click "Use This Data" to fill the form.
                          </p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Booking Type</div>
                            <div className="text-xs font-bold text-slate-900">{aiParsedData?.bookingType || 'Unknown'}</div>
                          </div>

                          {aiParsedData?.clientName && (
                            <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm">
                              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Client Name</div>
                              <div className="text-xs text-slate-900">{aiParsedData.clientName}</div>
                            </div>
                          )}

                          {aiParsedData?.bookingType === 'FLIGHT' && aiParsedData.flight && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-sm">
                              <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">Flight Details</div>
                              <div className="grid grid-cols-2 gap-1 text-[11px]">
                                {aiParsedData.flight.pnr && <div><span className="text-slate-500">PNR:</span> <span className="font-mono font-bold">{aiParsedData.flight.pnr}</span></div>}
                                {aiParsedData.flight.airline && <div><span className="text-slate-500">Airline:</span> {aiParsedData.flight.airline}</div>}
                                {aiParsedData.flight.routes && <div className="col-span-2"><span className="text-slate-500">Routes:</span> {aiParsedData.flight.routes}</div>}
                                {aiParsedData.flight.dates && <div><span className="text-slate-500">Dates:</span> {aiParsedData.flight.dates}</div>}
                              </div>
                            </div>
                          )}

                          {aiParsedData?.bookingType === 'HOTEL' && aiParsedData.hotel && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-sm">
                              <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1">Hotel Details</div>
                              <div className="grid grid-cols-2 gap-1 text-[11px]">
                                {aiParsedData.hotel.hotelName && <div className="col-span-2"><span className="text-slate-500">Hotel:</span> {aiParsedData.hotel.hotelName}</div>}
                                {aiParsedData.hotel.checkIn && <div><span className="text-slate-500">Check-in:</span> {aiParsedData.hotel.checkIn}</div>}
                                {aiParsedData.hotel.checkOut && <div><span className="text-slate-500">Check-out:</span> {aiParsedData.hotel.checkOut}</div>}
                              </div>
                            </div>
                          )}

                          {aiParsedData?.bookingType === 'LOGISTICS' && aiParsedData.logistics && (
                            <div className="p-2 bg-purple-50 border border-purple-200 rounded-sm">
                              <div className="text-[9px] font-bold text-purple-600 uppercase tracking-widest mb-1">Logistics Details</div>
                              <div className="grid grid-cols-2 gap-1 text-[11px]">
                                {aiParsedData.logistics.serviceType && <div><span className="text-slate-500">Service:</span> {aiParsedData.logistics.serviceType}</div>}
                                {aiParsedData.logistics.date && <div><span className="text-slate-500">Date:</span> {aiParsedData.logistics.date}</div>}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setAiParseStep('input'); setAiParsedData(null); }}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleAiParseSubmit}
                            className="flex-1 py-2.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors rounded-sm"
                          >
                            Use This Data
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-3 overflow-y-auto">
                    {/* AI Parsed indicator */}
                    {aiParsedData && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Parsed - Fields Pre-filled
                        <button
                          type="button"
                          onClick={() => setAiParsedData(null)}
                          className="ml-auto hover:opacity-70"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-shrink-0">
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
                      disabled={isSavingRequest}
                      className="w-full bg-paragon-gold text-slate-900 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors flex-shrink-0 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSavingRequest ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-slate-900"></div>
                          Submitting...
                        </>
                      ) : (
                        'Confirm Detailed Request'
                      )}
                    </button>
                  </div>
                )}
              </form>
           </div>
        </div>

        {/* Bulletin Board - Sidebar */}
        <div className="lg:col-span-4 order-1 lg:order-2">
           <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-sm shadow-sm h-auto max-h-[350px] sm:max-h-[400px] lg:h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <SectionHeader title="Bulletin Board" />
                <button onClick={() => setShowCreateModal(true)} className="text-[10px] font-bold text-paragon hover:underline uppercase tracking-widest">+ Post</button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">No Posts Yet</p>
                    <p className="text-[10px] text-slate-400">Be the first to share an update with the team</p>
                  </div>
                ) : (
                announcements.map(a => {
                  const announcementComments = comments.filter(c => c.parentId === a.id);
                  const isExpanded = expandedAnnouncement === a.id;

                  const isOwnPost = googleUser ? a.author === googleUser.name : a.author === currentUser.name;

                  return (
                   <div key={a.id} className={`border-l-2 ${a.isPinned ? 'border-amber-500 bg-amber-50' : a.priority === 'HIGH' ? 'border-red-500 bg-red-50' : 'border-paragon bg-slate-50'} rounded-r-sm group`}>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            {a.isPinned && (
                              <svg className="w-3 h-3 text-amber-500 flex-shrink-0 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 4a1 1 0 01.117 1.993L16 6h-.67l-.46 4.61a3 3 0 012.093 2.543L17 13.4V15h-4v6a1 1 0 01-2 0v-6H7v-1.6a3 3 0 011.963-2.815l.084-.024L8.587 6H8a1 1 0 01-.117-1.993L8 4h8z" />
                              </svg>
                            )}
                            <h3 className="text-xs font-bold text-slate-900 leading-tight">{a.title}</h3>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {a.isPinned && <Badge color="gold">PINNED</Badge>}
                            <Badge color={a.priority === 'HIGH' ? 'red' : 'teal'}>{a.priority}</Badge>
                            {isOwnPost && onPinAnnouncement && (
                              <button
                                onClick={() => onPinAnnouncement(a.id)}
                                className={`${a.isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'} transition-opacity`}
                                title={a.isPinned ? 'Unpin post' : 'Pin post'}
                              >
                                <svg className="w-3.5 h-3.5 rotate-45" fill={a.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M16 4h-8a1 1 0 000 2h.587l.46 4.61a3 3 0 00-2.047 2.79v1.6h4v6a1 1 0 002 0v-6h4v-1.6a3 3 0 00-2.047-2.79L14.413 6H15a1 1 0 100-2z" />
                                </svg>
                              </button>
                            )}
                            {isOwnPost && onEditAnnouncement && (
                              <button
                                onClick={() => handleEditAnnouncement(a)}
                                className="text-slate-400 hover:text-paragon opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit post"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
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
                            {isOwnPost && onArchiveAnnouncement && (
                              <button
                                onClick={() => onArchiveAnnouncement(a.id)}
                                className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Archive/Resolve post"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
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
                                const isOwnComment = googleUser ? (c.authorId === googleUser.googleId || c.authorId === googleUser.id) : c.authorId === currentUser.id;
                                // Use authorName from comment if available (saved in DB), otherwise fall back to lookup
                                const displayName = c.authorName || mockAuthor?.name || 'Unknown';
                                const authorInitial = displayName.charAt(0);
                                const avatarColor = c.authorAvatarColor || '#94a3b8';
                                return (
                                  <div key={c.id} className={`flex gap-2 group ${c.isPinned ? 'bg-amber-50 -mx-3 px-3 py-1.5 rounded-sm' : ''}`}>
                                    <div className="relative">
                                      <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 text-white"
                                        style={{ backgroundColor: avatarColor }}
                                      >
                                        {authorInitial}
                                      </div>
                                      {c.isPinned && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full flex items-center justify-center">
                                          <svg className="w-1.5 h-1.5 text-white rotate-45" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 4h-8a1 1 0 000 2h.587l.46 4.61a3 3 0 00-2.047 2.79v1.6h4v6a1 1 0 002 0v-6h4v-1.6a3 3 0 00-2.047-2.79L14.413 6H15a1 1 0 100-2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex gap-1 items-center mb-0.5">
                                          <span className="text-[9px] font-bold text-slate-900 truncate">{displayName}</span>
                                          {c.isPinned && <span className="text-[7px] font-bold text-amber-600 uppercase">Pinned</span>}
                                          <div className="ml-auto flex items-center gap-1">
                                            {isOwnPost && onPinComment && (
                                              <button
                                                onClick={() => onPinComment(c.id)}
                                                className={`text-[8px] ${c.isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'} transition-opacity`}
                                                title={c.isPinned ? 'Unpin comment' : 'Pin comment'}
                                              >
                                                <svg className="w-2.5 h-2.5 rotate-45" fill={c.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path d="M16 4h-8a1 1 0 000 2h.587l.46 4.61a3 3 0 00-2.047 2.79v1.6h4v6a1 1 0 002 0v-6h4v-1.6a3 3 0 00-2.047-2.79L14.413 6H15a1 1 0 100-2z" />
                                                </svg>
                                              </button>
                                            )}
                                            {isOwnComment && onDeleteComment && (
                                              <button
                                                onClick={() => setDeleteConfirm({ type: 'comment', id: c.id })}
                                                className="text-[8px] text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete comment"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
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
                })
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Inbound Queue (All Pending Requests) */}
      {requests && requests.filter(r => r.status === 'PENDING').length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white border border-slate-200 rounded-sm shadow-sm p-4 sm:p-6">
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
                const aUrgent = a.priority === 'URGENT' || a.priority === 'CRITICAL';
                const bUrgent = b.priority === 'URGENT' || b.priority === 'CRITICAL';
                if (aUrgent && !bUrgent) return -1;
                if (!aUrgent && bUrgent) return 1;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              })
              .map(r => {
                const clientName = r.details?.clientName || MOCK_USERS.find(u => u.id === r.clientId)?.name || '—';
                const targetDate = r.details?.targetDate ? new Date(r.details.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                const agentName = r.details?.agentName || (googleUser && (r.agentId === googleUser.googleId || r.agentId === googleUser.id) ? googleUser.name : (MOCK_USERS.find(u => u.id === r.agentId)?.name || 'Unknown'));
                const isExpanded = expandedQueueItem === r.id;
                const isOwnRequest = googleUser ? (r.agentId === googleUser.googleId || r.agentId === googleUser.id) : r.agentId === currentUser.id;

                return (
                  <div
                    key={r.id}
                    className={`bg-white border rounded-sm transition-all ${r.priority === 'URGENT' || r.priority === 'CRITICAL' ? 'border-red-300' : 'border-slate-200'}`}
                  >
                    {/* Header Row - Always Visible */}
                    <div
                      className="p-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => setExpandedQueueItem(isExpanded ? null : r.id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        r.type === 'FLIGHT' ? 'bg-red-100 text-red-600' :
                        r.type === 'HOTEL' ? 'bg-amber-100 text-amber-600' :
                        r.type === 'LOGISTICS' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {r.type === 'FLIGHT' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        ) : r.type === 'HOTEL' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ) : r.type === 'LOGISTICS' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 truncate">{clientName}</span>
                          <Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : r.type === 'LOGISTICS' ? 'blue' : 'slate'}>{r.type}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{r.notes}</p>
                      </div>
                      {(r.priority === 'URGENT' || r.priority === 'CRITICAL') && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                      )}
                      <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-3 pt-3 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Received</span>
                            <span className="font-medium text-slate-700">{new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Target Date</span>
                            <span className="font-medium text-slate-700">{targetDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Agent</span>
                            <span className="font-medium text-slate-700">{agentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Priority</span>
                            <span className={`font-bold ${r.priority === 'URGENT' || r.priority === 'CRITICAL' ? 'text-red-600' : 'text-slate-600'}`}>{r.priority}</span>
                          </div>
                        </div>
                        {r.notes && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                            <p className="text-[11px] text-slate-700 whitespace-pre-wrap">{r.notes}</p>
                          </div>
                        )}
                        {isOwnRequest && onDeleteRequest && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'request', id: r.id }); }}
                              className="flex-1 bg-red-50 text-red-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-red-100 transition-colors rounded-sm"
                            >
                              Delete Request
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-lg mx-4 animate-zoomIn"
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
                  disabled={isSavingPost}
                  className="flex-1 py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingPost ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-sm mx-4 animate-zoomIn"
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
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setEditingAnnouncement(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-lg mx-4 animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Edit Post</h3>
                <button onClick={() => setEditingAnnouncement(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  placeholder="Post title..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
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
                    onClick={() => setEditPriority('NORMAL')}
                    className={`flex-1 py-2 px-4 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                      editPriority === 'NORMAL'
                        ? 'bg-paragon text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPriority('HIGH')}
                    className={`flex-1 py-2 px-4 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                      editPriority === 'HIGH'
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
                  onClick={() => setEditingAnnouncement(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingEdit ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 bg-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-sm shadow-lg flex items-center gap-3 animate-slideUp z-50">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{errorToast}</span>
          <button
            onClick={() => setErrorToast(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
