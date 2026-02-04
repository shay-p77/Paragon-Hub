
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from './components/Layout';
import Operations from './components/Operations';
import CRM from './components/CRM';
import ClientDatabase from './components/ClientDatabase';
import ConciergeTrips from './components/ConciergeTrips';
import Accounting from './components/Accounting';
import KnowledgeBase from './components/KnowledgeBase';
import ClientPortal from './components/ClientPortal';
import Home from './components/Home';
import Settings from './components/Settings';
import SabreTool from './components/SabreTool';
import NotificationCenter from './components/NotificationCenter';
import Login, { GoogleUser } from './components/Login';
import AIChatWidget from './components/AIChatWidget';
import { MOCK_USERS } from './constants';
import { User, BookingRequest, Comment, Notification, Announcement, ConvertedFlight, ConvertedHotel, ConvertedLogistics, PipelineTrip } from './types';
import { API_URL } from './config';

const App: React.FC = () => {
  // Auth state
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('paragon_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setGoogleUser(user);

          // Set status to AVAILABLE when restoring session from localStorage
          // This ensures users appear "on duty" when they return after being away
          if (user.googleId) {
            try {
              await fetch(`${API_URL}/api/auth/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ googleId: user.googleId, status: 'AVAILABLE' }),
              });
              // Update localStorage with new status
              const updatedUser = { ...user, status: 'AVAILABLE' };
              localStorage.setItem('paragon_user', JSON.stringify(updatedUser));
            } catch (error) {
              console.error('Failed to restore session status:', error);
            }
          }
        } catch (e) {
          localStorage.removeItem('paragon_user');
        }
      }
      setIsAuthLoading(false);
    };

    restoreSession();
  }, []);

  const handleLogin = (user: GoogleUser) => {
    setGoogleUser(user);
  };

  const handleLogout = async () => {
    // Set status to OFFLINE before logging out
    if (googleUser?.googleId) {
      try {
        await fetch(`${API_URL}/api/auth/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleId: googleUser.googleId, status: 'OFFLINE' }),
        });
      } catch (error) {
        console.error('Failed to set offline status:', error);
      }
    }
    setGoogleUser(null);
    localStorage.removeItem('paragon_user');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  // Inactivity timeout (12 hours for all-day shift workers)
  const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours
  const WARNING_BEFORE = 60 * 1000; // Show warning 1 minute before logout
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    // Hide warning if showing
    setShowTimeoutWarning(false);
    setTimeoutCountdown(60);

    if (!googleUser) return;

    // Set warning timer (fires 1 minute before logout)
    warningTimer.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      setTimeoutCountdown(60);
      // Start countdown
      countdownInterval.current = setInterval(() => {
        setTimeoutCountdown(prev => {
          if (prev <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    // Set logout timer
    inactivityTimer.current = setTimeout(() => {
      setShowTimeoutWarning(false);
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [googleUser]);

  // Set up activity listeners
  useEffect(() => {
    if (!googleUser) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [googleUser, resetInactivityTimer]);

  // Heartbeat - tell server user is still active (every 2 minutes)
  useEffect(() => {
    if (!googleUser?.googleId) return;

    const sendHeartbeat = async () => {
      try {
        await fetch(`${API_URL}/api/auth/heartbeat`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleId: googleUser.googleId }),
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    // Send immediately on login
    sendHeartbeat();

    // Then every 2 minutes
    const heartbeatInterval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => clearInterval(heartbeatInterval);
  }, [googleUser?.googleId]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!googleUser?.googleId) return;

    const pollNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications?userId=${encodeURIComponent(googleUser.googleId)}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        // Silently fail - don't spam console
      }
    };

    // Poll every 30 seconds
    const notificationInterval = setInterval(pollNotifications, 30 * 1000);

    return () => clearInterval(notificationInterval);
  }, [googleUser?.googleId]);

  const [currentUser] = useState<User>(MOCK_USERS[0]); // Fallback user data
  const [activeTab, setActiveTab] = useState(() => {
    // Restore tab from localStorage on initial load
    const savedTab = localStorage.getItem('paragon_active_tab');
    return savedTab || 'home';
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('paragon_active_tab', activeTab);
  }, [activeTab]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teamUsers, setTeamUsers] = useState<Array<{ googleId: string; name: string; email: string; role: string }>>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch data from API - reusable for initial load and pull-to-refresh
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setDataLoading(true);
    setDataError(null);
    try {
      const [announcementsRes, commentsRes, requestsRes, usersRes, pipelineRes] = await Promise.all([
        fetch(`${API_URL}/api/announcements`),
        fetch(`${API_URL}/api/comments`),
        fetch(`${API_URL}/api/requests`),
        fetch(`${API_URL}/api/auth/users`),
        fetch(`${API_URL}/api/pipeline`),
      ]);

      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data);
      }
      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data);
      }
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data);

        // Reconstruct converted bookings from requests with status CONVERTED
        const convertedRequests = data.filter((r: BookingRequest) => r.status === 'CONVERTED');

        const flights: ConvertedFlight[] = [];
        const hotels: ConvertedHotel[] = [];
        const logistics: ConvertedLogistics[] = [];

        convertedRequests.forEach((r: BookingRequest) => {
          const details = r.details || {};
          const bookingId = details.convertedBookingId || r.id;

          if (r.type === 'FLIGHT') {
            flights.push({
              id: bookingId,
              description: `${r.clientName || 'Client'}-${details.pnr || 'Flight'}`,
              airline: details.airline || '',
              paymentStatus: details.paymentStatus || 'UNPAID',
              pnr: details.pnr || '',
              flights: details.flights || '',
              passengerCount: details.passengerCount || 1,
              dates: details.dates || '',
              agent: details.bookingAgent || r.agentName,
              profitLoss: details.profitLoss || 0,
              status: details.bookingStatus || 'CONFIRMED',
              createdAt: r.timestamp,
              originalRequestId: r.id,
              tripId: r.tripId,
              tripName: r.tripName,
              vendorId: details.vendorId,
              vendorName: details.vendorName,
            });
          } else if (r.type === 'HOTEL') {
            hotels.push({
              id: bookingId,
              description: `${r.clientName || 'Client'}-${details.hotelName || 'Hotel'}`,
              hotelName: details.hotelName || '',
              paymentStatus: details.paymentStatus || 'UNPAID',
              confirmationNumber: details.confirmationNumber || '',
              roomType: details.roomType || '',
              guestCount: details.guestCount || 1,
              checkIn: details.checkIn || '',
              checkOut: details.checkOut || '',
              agent: details.bookingAgent || r.agentName,
              profitLoss: details.profitLoss || 0,
              status: details.bookingStatus || 'CONFIRMED',
              createdAt: r.timestamp,
              originalRequestId: r.id,
              tripId: r.tripId,
              tripName: r.tripName,
              vendorId: details.vendorId,
              vendorName: details.vendorName,
            });
          } else if (r.type === 'LOGISTICS') {
            logistics.push({
              id: bookingId,
              description: `${r.clientName || 'Client'}-${details.serviceType || 'Logistics'}`,
              serviceType: details.serviceType || '',
              paymentStatus: details.paymentStatus || 'UNPAID',
              confirmationNumber: details.confirmationNumber || '',
              details: details.logisticsDetails || '',
              date: details.date || '',
              agent: details.bookingAgent || r.agentName,
              profitLoss: details.profitLoss || 0,
              status: details.bookingStatus || 'CONFIRMED',
              createdAt: r.timestamp,
              originalRequestId: r.id,
              tripId: r.tripId,
              tripName: r.tripName,
              vendorId: details.vendorId,
              vendorName: details.vendorName,
            });
          }
        });

        setConvertedFlights(flights);
        setConvertedHotels(hotels);
        setConvertedLogistics(logistics);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setTeamUsers(data);
      }
      if (pipelineRes.ok) {
        const data = await pipelineRes.json();
        setPipelineTrips(data);
      }

      // Fetch notifications for current user
      if (googleUser?.googleId) {
        try {
          const notificationsRes = await fetch(`${API_URL}/api/notifications?userId=${encodeURIComponent(googleUser.googleId)}`);
          if (notificationsRes.ok) {
            const notifData = await notificationsRes.json();
            setNotifications(notifData);
          }
        } catch (notifError) {
          console.error('Error fetching notifications:', notifError);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setDataError('Failed to connect to server. Some features may not work.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (googleUser) {
      await fetchData(false);
    }
  }, [googleUser, fetchData]);

  // Fetch data on mount
  useEffect(() => {
    if (googleUser) {
      fetchData();
    } else {
      setDataLoading(false);
    }
  }, [googleUser, fetchData]);

  // Set initial tab based on user role
  useEffect(() => {
    if (googleUser?.role) {
      // CLIENT users can ONLY see Client Portal
      if (googleUser.role === 'CLIENT') {
        setActiveTab('portal');
      }
      // All other roles start at Command Center (home) which is valid for them
    }
  }, [googleUser?.role]);

  const [convertedFlights, setConvertedFlights] = useState<ConvertedFlight[]>([]);
  const [convertedHotels, setConvertedHotels] = useState<ConvertedHotel[]>([]);
  const [convertedLogistics, setConvertedLogistics] = useState<ConvertedLogistics[]>([]);
  const [pipelineTrips, setPipelineTrips] = useState<PipelineTrip[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userStatus, setUserStatus] = useState<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'>(
    (googleUser?.status as 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') || 'AVAILABLE'
  );

  // Ref for notification dropdown click-outside detection
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Update user status
  const updateUserStatus = async (newStatus: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') => {
    setUserStatus(newStatus);
    setShowProfileDropdown(false);

    if (googleUser) {
      try {
        await fetch(`${API_URL}/api/auth/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleId: googleUser.googleId, status: newStatus }),
        });

        const updatedUser = { ...googleUser, status: newStatus };
        localStorage.setItem('paragon_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

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
  const handleAddComment = async (text: string, parentId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: googleUser?.googleId || currentUser.id,
          authorName: googleUser?.name || currentUser.name,
          authorAvatarColor: googleUser?.avatarColor || '#3B82F6',
          text,
          parentId
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);

        // Check for @mentions (matches @name patterns)
        const mentionPattern = /@(\w+)/g;
        const mentions = text.match(mentionPattern);
        if (mentions) {
          const senderName = googleUser?.name || currentUser.name;
          const senderGoogleId = googleUser?.googleId;
          const notificationsToCreate: Array<{ userId: string; message: string; type: string; link: string }> = [];

          mentions.forEach(mention => {
            const mentionName = mention.substring(1).toLowerCase();
            // Find user by name (case-insensitive partial match)
            const targetUser = teamUsers.find(u =>
              u.name.toLowerCase().includes(mentionName) && u.googleId !== senderGoogleId
            );
            if (targetUser) {
              notificationsToCreate.push({
                userId: targetUser.googleId,
                message: `${senderName} tagged you in a comment.`,
                type: 'TAG',
                link: parentId
              });
            }
          });

          // Save notifications to database
          if (notificationsToCreate.length > 0) {
            try {
              await fetch(`${API_URL}/api/notifications/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notifications: notificationsToCreate }),
              });
            } catch (notifError) {
              console.error('Error creating tag notifications:', notifError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`${API_URL}/api/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddAnnouncement = async (announcement: Omit<Announcement, 'id' | 'date' | 'author'>) => {
    try {
      const res = await fetch(`${API_URL}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcement,
          author: googleUser?.name || currentUser.name,
          authorId: googleUser?.googleId || currentUser.id,
        }),
      });

      if (res.ok) {
        const newAnnouncement = await res.json();
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      }
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await fetch(`${API_URL}/api/announcements/${announcementId}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      // Also delete associated comments
      setComments(prev => prev.filter(c => c.parentId !== announcementId));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleEditAnnouncement = async (id: string, updates: { title: string; content: string; priority: 'LOW' | 'NORMAL' | 'HIGH' }) => {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedAnnouncement = await res.json();
        setAnnouncements(prev => prev.map(a => a.id === id ? updatedAnnouncement : a));
      }
    } catch (error) {
      console.error('Error editing announcement:', error);
    }
  };

  const handlePinAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${id}/pin`, {
        method: 'PUT',
      });

      if (res.ok) {
        const updatedAnnouncement = await res.json();
        // Re-sort announcements so pinned ones come first
        setAnnouncements(prev => {
          const updated = prev.map(a => a.id === id ? updatedAnnouncement : a);
          return updated.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        });
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to pin');
      }
    } catch (error) {
      console.error('Error pinning announcement:', error);
      throw error;
    }
  };

  const handleArchiveAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${id}/archive`, {
        method: 'PUT',
      });

      if (res.ok) {
        const updatedAnnouncement = await res.json();
        if (updatedAnnouncement.isArchived) {
          // Remove from list when archived
          setAnnouncements(prev => prev.filter(a => a.id !== id));
        } else {
          // Add back when unarchived (shouldn't happen in normal flow)
          setAnnouncements(prev => {
            const updated = prev.map(a => a.id === id ? updatedAnnouncement : a);
            return updated.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          });
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to archive');
      }
    } catch (error) {
      console.error('Error archiving announcement:', error);
      throw error;
    }
  };

  const handlePinComment = async (commentId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${commentId}/pin`, {
        method: 'PUT',
      });

      if (res.ok) {
        const updatedComment = await res.json();
        // Re-sort comments so pinned ones come first within their parent
        setComments(prev => {
          const updated = prev.map(c => c.id === commentId ? updatedComment : c);
          return updated.sort((a, b) => {
            if (a.parentId !== b.parentId) return 0;
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });
        });
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to pin');
      }
    } catch (error) {
      console.error('Error pinning comment:', error);
      throw error;
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await fetch(`${API_URL}/api/requests/${requestId}`, { method: 'DELETE' });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleConvertToFlight = async (flight: ConvertedFlight, requestId: string) => {
    setConvertedFlights(prev => [flight, ...prev]);
    // Build booking details to persist
    const bookingDetails = {
      pnr: flight.pnr,
      airline: flight.airline,
      flights: flight.flights,
      passengerCount: flight.passengerCount,
      dates: flight.dates,
      bookingAgent: flight.agent,
      profitLoss: flight.profitLoss,
      paymentStatus: flight.paymentStatus,
      bookingStatus: flight.status,
      convertedBookingId: flight.id,
      vendorId: flight.vendorId,
      vendorName: flight.vendorName,
    };
    // Mark request as CONVERTED in state with booking details
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'CONVERTED' as const,
      details: { ...r.details, ...bookingDetails }
    } : r));
    try {
      await fetch(`${API_URL}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONVERTED', details: bookingDetails }),
      });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleConvertToHotel = async (hotel: ConvertedHotel, requestId: string) => {
    setConvertedHotels(prev => [hotel, ...prev]);
    // Build booking details to persist
    const bookingDetails = {
      confirmationNumber: hotel.confirmationNumber,
      hotelName: hotel.hotelName,
      roomType: hotel.roomType,
      guestCount: hotel.guestCount,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      bookingAgent: hotel.agent,
      profitLoss: hotel.profitLoss,
      paymentStatus: hotel.paymentStatus,
      bookingStatus: hotel.status,
      convertedBookingId: hotel.id,
      vendorId: hotel.vendorId,
      vendorName: hotel.vendorName,
    };
    // Mark request as CONVERTED in state with booking details
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'CONVERTED' as const,
      details: { ...r.details, ...bookingDetails }
    } : r));
    try {
      await fetch(`${API_URL}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONVERTED', details: bookingDetails }),
      });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleConvertToLogistics = async (logistics: ConvertedLogistics, requestId: string) => {
    setConvertedLogistics(prev => [logistics, ...prev]);
    // Build booking details to persist
    const bookingDetails = {
      confirmationNumber: logistics.confirmationNumber,
      serviceType: logistics.serviceType,
      logisticsDetails: logistics.details,
      date: logistics.date,
      bookingAgent: logistics.agent,
      profitLoss: logistics.profitLoss,
      paymentStatus: logistics.paymentStatus,
      bookingStatus: logistics.status,
      convertedBookingId: logistics.id,
      vendorId: logistics.vendorId,
      vendorName: logistics.vendorName,
    };
    // Mark request as CONVERTED in state with booking details
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'CONVERTED' as const,
      details: { ...r.details, ...bookingDetails }
    } : r));
    try {
      await fetch(`${API_URL}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONVERTED', details: bookingDetails }),
      });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleUpdateFlight = async (id: string, updates: Partial<ConvertedFlight>) => {
    setConvertedFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    // Find the original request and update it in DB
    const flight = convertedFlights.find(f => f.id === id);
    if (flight?.originalRequestId) {
      const bookingDetails = {
        pnr: updates.pnr ?? flight.pnr,
        airline: updates.airline ?? flight.airline,
        flights: updates.flights ?? flight.flights,
        passengerCount: updates.passengerCount ?? flight.passengerCount,
        dates: updates.dates ?? flight.dates,
        bookingAgent: updates.agent ?? flight.agent,
        profitLoss: updates.profitLoss ?? flight.profitLoss,
        paymentStatus: updates.paymentStatus ?? flight.paymentStatus,
        bookingStatus: updates.status ?? flight.status,
        vendorId: updates.vendorId ?? flight.vendorId,
        vendorName: updates.vendorName ?? flight.vendorName,
      };
      // Update request in state
      setRequests(prev => prev.map(r => r.id === flight.originalRequestId ? {
        ...r,
        details: { ...r.details, ...bookingDetails }
      } : r));
      try {
        await fetch(`${API_URL}/api/requests/${flight.originalRequestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details: bookingDetails }),
        });
      } catch (error) {
        console.error('Error updating request:', error);
      }
    }
  };

  const handleUpdateHotel = async (id: string, updates: Partial<ConvertedHotel>) => {
    setConvertedHotels(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    // Find the original request and update it in DB
    const hotel = convertedHotels.find(h => h.id === id);
    if (hotel?.originalRequestId) {
      const bookingDetails = {
        confirmationNumber: updates.confirmationNumber ?? hotel.confirmationNumber,
        hotelName: updates.hotelName ?? hotel.hotelName,
        roomType: updates.roomType ?? hotel.roomType,
        guestCount: updates.guestCount ?? hotel.guestCount,
        checkIn: updates.checkIn ?? hotel.checkIn,
        checkOut: updates.checkOut ?? hotel.checkOut,
        bookingAgent: updates.agent ?? hotel.agent,
        profitLoss: updates.profitLoss ?? hotel.profitLoss,
        paymentStatus: updates.paymentStatus ?? hotel.paymentStatus,
        bookingStatus: updates.status ?? hotel.status,
        vendorId: updates.vendorId ?? hotel.vendorId,
        vendorName: updates.vendorName ?? hotel.vendorName,
      };
      // Update request in state
      setRequests(prev => prev.map(r => r.id === hotel.originalRequestId ? {
        ...r,
        details: { ...r.details, ...bookingDetails }
      } : r));
      try {
        await fetch(`${API_URL}/api/requests/${hotel.originalRequestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details: bookingDetails }),
        });
      } catch (error) {
        console.error('Error updating request:', error);
      }
    }
  };

  const handleUpdateLogistics = async (id: string, updates: Partial<ConvertedLogistics>) => {
    setConvertedLogistics(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    // Find the original request and update it in DB
    const logistics = convertedLogistics.find(l => l.id === id);
    if (logistics?.originalRequestId) {
      const bookingDetails = {
        confirmationNumber: updates.confirmationNumber ?? logistics.confirmationNumber,
        serviceType: updates.serviceType ?? logistics.serviceType,
        logisticsDetails: updates.details ?? logistics.details,
        date: updates.date ?? logistics.date,
        bookingAgent: updates.agent ?? logistics.agent,
        profitLoss: updates.profitLoss ?? logistics.profitLoss,
        paymentStatus: updates.paymentStatus ?? logistics.paymentStatus,
        bookingStatus: updates.status ?? logistics.status,
        vendorId: updates.vendorId ?? logistics.vendorId,
        vendorName: updates.vendorName ?? logistics.vendorName,
      };
      // Update request in state
      setRequests(prev => prev.map(r => r.id === logistics.originalRequestId ? {
        ...r,
        details: { ...r.details, ...bookingDetails }
      } : r));
      try {
        await fetch(`${API_URL}/api/requests/${logistics.originalRequestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details: bookingDetails }),
        });
      } catch (error) {
        console.error('Error updating request:', error);
      }
    }
  };

  const handleDeleteFlight = async (id: string) => {
    const flight = convertedFlights.find(f => f.id === id);
    if (flight?.originalRequestId) {
      try {
        await fetch(`${API_URL}/api/requests/${flight.originalRequestId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting flight:', error);
      }
    }
    setConvertedFlights(prev => prev.filter(f => f.id !== id));
  };

  const handleDeleteHotel = async (id: string) => {
    const hotel = convertedHotels.find(h => h.id === id);
    if (hotel?.originalRequestId) {
      try {
        await fetch(`${API_URL}/api/requests/${hotel.originalRequestId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting hotel:', error);
      }
    }
    setConvertedHotels(prev => prev.filter(h => h.id !== id));
  };

  const handleDeleteLogistics = async (id: string) => {
    const logistics = convertedLogistics.find(l => l.id === id);
    if (logistics?.originalRequestId) {
      try {
        await fetch(`${API_URL}/api/requests/${logistics.originalRequestId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting logistics:', error);
      }
    }
    setConvertedLogistics(prev => prev.filter(l => l.id !== id));
  };

  const handleAddPipelineTrip = async (trip: PipelineTrip) => {
    try {
      const res = await fetch(`${API_URL}/api/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        const newTrip = await res.json();
        setPipelineTrips(prev => [newTrip, ...prev]);
      }
    } catch (error) {
      console.error('Error adding pipeline trip:', error);
    }
  };

  const handleUpdatePipelineTrip = async (id: string, updates: Partial<PipelineTrip>) => {
    // Update locally first for instant feedback
    setPipelineTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      await fetch(`${API_URL}/api/pipeline/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating pipeline trip:', error);
    }
  };

  const handleDeletePipelineTrip = async (id: string) => {
    setPipelineTrips(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_URL}/api/pipeline/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting pipeline trip:', error);
    }
  };

  const handleAddRequest = async (req: Partial<BookingRequest>) => {
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: req.agentId || googleUser?.googleId || currentUser.id,
          agentName: googleUser?.name || currentUser.name,
          clientId: req.clientId || '',
          clientName: (req.details as any)?.clientName || req.clientName || '',
          type: req.type || 'GENERAL',
          priority: req.priority || 'NORMAL',
          notes: req.notes || '',
          details: req.details,
          tripId: req.tripId,
          tripName: req.tripName,
        }),
      });

      if (res.ok) {
        const newReq = await res.json();
        setRequests(prev => [newReq, ...prev]);

        // Notify all team users except the author when a new request is created
        const senderName = googleUser?.name || currentUser.name;
        const senderGoogleId = googleUser?.googleId;
        const priorityText = newReq.priority === 'URGENT' || newReq.priority === 'CRITICAL' ? ' (URGENT)' : '';

        // Build notifications for all team members (except sender and clients)
        const notificationsToCreate = teamUsers
          .filter(u => u.googleId !== senderGoogleId && u.role !== 'CLIENT')
          .map(u => ({
            userId: u.googleId,
            message: `New ${newReq.type.toLowerCase()} request from ${senderName}${priorityText}`,
            type: 'REQUEST',
            link: newReq.id
          }));

        // Save notifications to database
        if (notificationsToCreate.length > 0) {
          try {
            await fetch(`${API_URL}/api/notifications/bulk`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notifications: notificationsToCreate }),
            });
          } catch (notifError) {
            console.error('Error creating notifications:', notifError);
          }
        }
      }
    } catch (error) {
      console.error('Error adding request:', error);
    }
  };

  const markRead = async (id: string) => {
    // Update locally first for instant feedback
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Then persist to server
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAll = async () => {
    if (!googleUser?.googleId) return;
    setNotifications([]);
    try {
      await fetch(`${API_URL}/api/notifications?userId=${encodeURIComponent(googleUser.googleId)}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const userNotifications = notifications.filter(n => n.userId === googleUser?.googleId);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home currentUser={currentUser} announcements={announcements} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onAddAnnouncement={handleAddAnnouncement} onEditAnnouncement={handleEditAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement} onPinAnnouncement={handlePinAnnouncement} onArchiveAnnouncement={handleArchiveAnnouncement} onPinComment={handlePinComment} onAddRequest={handleAddRequest} onDeleteRequest={handleDeleteRequest} requests={requests} googleUser={googleUser} />;
      case 'ops': return <Operations requests={requests} comments={comments} currentUser={currentUser} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} googleUser={googleUser} convertedFlights={convertedFlights} convertedHotels={convertedHotels} convertedLogistics={convertedLogistics} onConvertToFlight={handleConvertToFlight} onConvertToHotel={handleConvertToHotel} onConvertToLogistics={handleConvertToLogistics} onUpdateFlight={handleUpdateFlight} onUpdateHotel={handleUpdateHotel} onUpdateLogistics={handleUpdateLogistics} onDeleteFlight={handleDeleteFlight} onDeleteHotel={handleDeleteHotel} onDeleteLogistics={handleDeleteLogistics} pipelineTrips={pipelineTrips} onAddPipelineTrip={handleAddPipelineTrip} onUpdatePipelineTrip={handleUpdatePipelineTrip} onDeletePipelineTrip={handleDeletePipelineTrip} onAddRequest={handleAddRequest} onDeleteRequest={handleDeleteRequest} />;
      case 'sales': return <CRM requests={requests} googleUser={googleUser} onDeleteRequest={handleDeleteRequest} />;
      case 'concierge': return <ConciergeTrips googleUser={googleUser} currentUser={currentUser} pipelineTrips={pipelineTrips} onAddPipelineTrip={handleAddPipelineTrip} onUpdatePipelineTrip={handleUpdatePipelineTrip} onDeletePipelineTrip={handleDeletePipelineTrip} requests={requests} onAddRequest={handleAddRequest} convertedFlights={convertedFlights} convertedHotels={convertedHotels} convertedLogistics={convertedLogistics} />;
      case 'clientdb': return <ClientDatabase googleUser={googleUser} pipelineTrips={pipelineTrips} convertedFlights={convertedFlights} convertedHotels={convertedHotels} convertedLogistics={convertedLogistics} requests={requests} />;
      case 'accounting': return <Accounting />;
      case 'knowledge': return <KnowledgeBase />;
      case 'sabre': return <SabreTool googleUser={googleUser} />;
      case 'portal': return <ClientPortal />;
      case 'settings': return <Settings currentUserRole={googleUser?.role as any} />;
      default: return <Home currentUser={currentUser} announcements={announcements} comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onAddAnnouncement={handleAddAnnouncement} onEditAnnouncement={handleEditAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement} onPinAnnouncement={handlePinAnnouncement} onArchiveAnnouncement={handleArchiveAnnouncement} onPinComment={handlePinComment} onAddRequest={handleAddRequest} onDeleteRequest={handleDeleteRequest} requests={requests} googleUser={googleUser} />;
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
      <div className="flex-1 bg-slate-50 flex flex-col min-h-0 relative">
        {/* Top Header/Breadcrumb */}
        <div className="min-h-[3.5rem] bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-8 flex-shrink-0 z-10 shadow-sm safe-area-top">
          {/* Mobile: Show logo, Desktop: Show breadcrumb */}
          <div className="flex items-center gap-2">
            <h1 className="md:hidden font-cinzel text-lg font-bold tracking-widest text-paragon">PARAGON</h1>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span>SYSTEM</span>
              <span>/</span>
              <span className="text-slate-900">{activeTab}</span>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-6 items-center">
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
             {googleUser?.role === 'ADMIN' && (
               <button
                 onClick={() => setActiveTab('settings')}
                 className={`p-2 transition-colors ${activeTab === 'settings' ? 'text-paragon' : 'text-slate-400 hover:text-paragon'}`}
                 title="Settings"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </button>
             )}
             <div className="h-8 w-[1px] bg-slate-200"></div>
             {/* User Profile with Status Dropdown */}
             <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 rounded-lg p-1.5 transition-colors"
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: googleUser.avatarColor || '#3B82F6' }}
                    >
                      {getInitials(googleUser.name)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      userStatus === 'AVAILABLE' ? 'bg-emerald-500' :
                      userStatus === 'BUSY' ? 'bg-red-500' :
                      userStatus === 'AWAY' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`}></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">{googleUser.name}</div>
                    <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{googleUser.email}</div>
                  </div>
                  <svg className={`w-3 h-3 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 animate-slideUp">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                    </div>
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
                    <div className="border-t border-slate-100">
                      <button
                        onClick={() => { setShowProfileDropdown(false); setShowLogoutConfirm(true); }}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-xs font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Error Banner */}
        {dataError && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-red-700">{dataError}</span>
            </div>
            <button
              onClick={() => setDataError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto min-h-0 pb-20 md:pb-0">
          {dataLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-paragon"></div>
                <span className="text-xs text-slate-400 uppercase tracking-widest">Loading data...</span>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4 p-6 animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 mb-2">Sign Out</h3>
            <p className="text-xs text-slate-500 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-xl"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactivity Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-zoomIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Session Timeout Warning</h3>
                <p className="text-xs text-slate-500">You will be logged out due to inactivity</p>
              </div>
            </div>
            <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Time Remaining</p>
              <p className="text-3xl font-bold text-slate-900 font-mono">{timeoutCountdown}s</p>
            </div>
            <button
              onClick={resetInactivityTimer}
              className="w-full py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-xl"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Widget */}
      <AIChatWidget
        isOpen={showAIChat}
        onToggle={() => setShowAIChat(!showAIChat)}
        user={googleUser ? { name: googleUser.name, email: googleUser.email, picture: googleUser.picture } : null}
      />
    </Layout>
  );
};

export default App;
