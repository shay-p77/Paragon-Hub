
import React, { useState, useEffect } from 'react';
import { SectionHeader, DataTable, Badge, ConfirmModal, ClientAutocomplete, QuickAddCustomerModal, VendorAutocomplete, QuickAddVendorModal } from './Shared';
import { MOCK_USERS } from '../constants'; // Fallback only
import { BookingRequest, User, ConvertedFlight, ConvertedHotel, ConvertedLogistics, PipelineTrip, PipelineStage, PipelineTask, Vendor, VendorType, SystemMarkups, Customer, MarkupType, HotelBookingAgency, HotelPaymentMethod, HOTEL_COMMISSION_SPLITS } from '../types';
import { GoogleUser } from './Login';
import { API_URL } from '../config';

// Helper to parse date strings as local time (avoids timezone offset issues)
const parseLocalDate = (dateStr: string): Date => {
  // For YYYY-MM-DD format, parse as local date to avoid UTC conversion
  if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

// Format date for display using local time
const formatDisplayDate = (dateStr?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateStr) return '—';
  const date = dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? parseLocalDate(dateStr) : new Date(dateStr);
  return date.toLocaleDateString([], options || { month: 'short', day: 'numeric' });
};

interface OperationsProps {
  requests: BookingRequest[];
  comments: Comment[];
  currentUser: User;
  onAddComment: (text: string, parentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  googleUser?: GoogleUser | null;
  convertedFlights: ConvertedFlight[];
  convertedHotels: ConvertedHotel[];
  convertedLogistics: ConvertedLogistics[];
  onConvertToFlight: (flight: ConvertedFlight, requestId: string) => void;
  onConvertToHotel: (hotel: ConvertedHotel, requestId: string) => void;
  onConvertToLogistics: (logistics: ConvertedLogistics, requestId: string) => void;
  onUpdateFlight: (id: string, updates: Partial<ConvertedFlight>) => void;
  onUpdateHotel: (id: string, updates: Partial<ConvertedHotel>) => void;
  onUpdateLogistics: (id: string, updates: Partial<ConvertedLogistics>) => void;
  onDeleteFlight: (id: string) => void;
  onDeleteHotel: (id: string) => void;
  onDeleteLogistics: (id: string) => void;
  pipelineTrips: PipelineTrip[];
  onAddPipelineTrip: (trip: PipelineTrip) => void;
  onUpdatePipelineTrip: (id: string, updates: Partial<PipelineTrip>) => void;
  onDeletePipelineTrip: (id: string) => void;
  onAddRequest?: (req: Partial<BookingRequest>) => void;
  onDeleteRequest?: (requestId: string) => void;
}

const Operations: React.FC<OperationsProps> = ({
  requests, currentUser, googleUser,
  convertedFlights, convertedHotels, convertedLogistics,
  onConvertToFlight, onConvertToHotel, onConvertToLogistics,
  onUpdateFlight, onUpdateHotel, onUpdateLogistics,
  onDeleteFlight, onDeleteHotel, onDeleteLogistics,
  pipelineTrips, onAddPipelineTrip, onUpdatePipelineTrip, onDeletePipelineTrip,
  onAddRequest, onDeleteRequest
}) => {
  const [subTab, setSubTab] = useState('dashboard');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'request' | 'flight' | 'hotel' | 'logistics'; id: string; name: string } | null>(null);

  // Convert modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingRequest, setConvertingRequest] = useState<BookingRequest | null>(null);

  // Flight form state
  const [flightDescription, setFlightDescription] = useState('');
  const [flightAirline, setFlightAirline] = useState('');
  const [flightPaymentStatus, setFlightPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [flightPnr, setFlightPnr] = useState('');
  const [flightRoutes, setFlightRoutes] = useState('');
  const [flightPassengerCount, setFlightPassengerCount] = useState(1);
  const [flightDates, setFlightDates] = useState('');
  const [flightAgent, setFlightAgent] = useState('');
  const [flightCost, setFlightCost] = useState<number>(0);
  const [flightChargeToClient, setFlightChargeToClient] = useState<number>(0);
  const [flightProfitLoss, setFlightProfitLoss] = useState(0);
  const [flightStatus, setFlightStatus] = useState<'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED'>('PENDING');
  const [flightNotes, setFlightNotes] = useState('');

  // Hotel form state
  const [hotelDescription, setHotelDescription] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelGuestName, setHotelGuestName] = useState('');
  const [hotelPaymentStatus, setHotelPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [hotelConfirmation, setHotelConfirmation] = useState('');
  const [hotelRoomType, setHotelRoomType] = useState('');
  const [hotelGuestCount, setHotelGuestCount] = useState(1);
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelAgent, setHotelAgent] = useState('');
  const [hotelBookedVia, setHotelBookedVia] = useState<'PARAGON' | 'BENNISH' | 'EMBARK' | 'TAAP'>('PARAGON');
  const [hotelPaymentMethod, setHotelPaymentMethod] = useState<'AGENCY' | 'PAY_AT_CHECKIN'>('AGENCY');
  const [hotelCustomerPayingId, setHotelCustomerPayingId] = useState<string | null>(null);
  const [hotelCustomerPayingName, setHotelCustomerPayingName] = useState('');
  const [hotelRoomRate, setHotelRoomRate] = useState<number>(0);
  const [hotelFullCharge, setHotelFullCharge] = useState<number>(0);
  const [hotelCommissionPercent, setHotelCommissionPercent] = useState<number>(10);
  const [hotelCost, setHotelCost] = useState<number>(0);
  const [hotelChargeToClient, setHotelChargeToClient] = useState<number>(0);
  const [hotelProfitLoss, setHotelProfitLoss] = useState(0);
  const [hotelStatus, setHotelStatus] = useState<'PENDING' | 'CONFIRMED' | 'CANCELLED'>('PENDING');
  const [hotelNotes, setHotelNotes] = useState('');

  // Logistics form state
  const [logisticsDescription, setLogisticsDescription] = useState('');
  const [logisticsServiceType, setLogisticsServiceType] = useState('');
  const [logisticsPaymentStatus, setLogisticsPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [logisticsConfirmation, setLogisticsConfirmation] = useState('');
  const [logisticsDetails, setLogisticsDetails] = useState('');
  const [logisticsDate, setLogisticsDate] = useState('');
  const [logisticsAgent, setLogisticsAgent] = useState('');
  const [logisticsCost, setLogisticsCost] = useState<number>(0);
  const [logisticsChargeToClient, setLogisticsChargeToClient] = useState<number>(0);
  const [logisticsProfitLoss, setLogisticsProfitLoss] = useState(0);
  const [logisticsStatus, setLogisticsStatus] = useState<'PENDING' | 'CONFIRMED' | 'CANCELLED'>('PENDING');
  const [logisticsNotes, setLogisticsNotes] = useState('');

  // Global markup settings for auto-calculation
  const [globalMarkups, setGlobalMarkups] = useState<SystemMarkups | null>(null);
  const [customerDataMap, setCustomerDataMap] = useState<Record<string, Customer>>({});

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'flight' | 'hotel' | 'logistics', id: string } | null>(null);

  // Pipeline/Kanban state
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<PipelineTrip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<PipelineTrip | null>(null);
  const [draggingTripId, setDraggingTripId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [tripName, setTripName] = useState('');
  const [tripClientName, setTripClientName] = useState('');
  const [tripStage, setTripStage] = useState<PipelineStage>('NEW');
  const [tripHasFlights, setTripHasFlights] = useState(false);
  const [tripHasHotels, setTripHasHotels] = useState(false);
  const [tripHasLogistics, setTripHasLogistics] = useState(false);
  const [tripIsUrgent, setTripIsUrgent] = useState(false);
  const [tripStartDate, setTripStartDate] = useState('');
  const [tripEndDate, setTripEndDate] = useState('');
  const [tripAgent, setTripAgent] = useState('');
  const [tripNotes, setTripNotes] = useState('');
  const [tripTasks, setTripTasks] = useState<PipelineTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Dispatch modal state (for NEW ELEMENT button)
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchMode, setDispatchMode] = useState<'QUICK' | 'DETAIL' | 'AI_PARSE'>('QUICK');
  const [dispatchSnippet, setDispatchSnippet] = useState('');
  const [dispatchServiceType, setDispatchServiceType] = useState<'FLIGHT' | 'HOTEL' | 'LOGISTICS'>('FLIGHT');
  const [dispatchClientName, setDispatchClientName] = useState('');
  const [dispatchTargetDate, setDispatchTargetDate] = useState('');
  const [dispatchSpecs, setDispatchSpecs] = useState('');
  const [dispatchOrigin, setDispatchOrigin] = useState('');
  const [dispatchDestination, setDispatchDestination] = useState('');
  const [dispatchDepartDate, setDispatchDepartDate] = useState('');
  const [dispatchReturnDate, setDispatchReturnDate] = useState('');
  const [dispatchPriority, setDispatchPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  // AI Parse state
  const [aiParseText, setAiParseText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiParseError, setAiParseError] = useState<string | null>(null);
  const [aiParsedData, setAiParsedData] = useState<any>(null);
  const [aiParseStep, setAiParseStep] = useState<'input' | 'review'>('input');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Customers state for autocomplete
  const [customers, setCustomers] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerInitialName, setNewCustomerInitialName] = useState('');

  // Users/Agents state from database
  const [agents, setAgents] = useState<{ id: string; name: string; role: string }[]>([]);

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [flightVendorId, setFlightVendorId] = useState('');
  const [flightVendorName, setFlightVendorName] = useState('');
  const [hotelVendorId, setHotelVendorId] = useState('');
  const [hotelVendorName, setHotelVendorName] = useState('');
  const [logisticsVendorId, setLogisticsVendorId] = useState('');
  const [logisticsVendorName, setLogisticsVendorName] = useState('');
  const [showQuickAddVendorModal, setShowQuickAddVendorModal] = useState(false);
  const [quickAddVendorType, setQuickAddVendorType] = useState<VendorType>('FLIGHT');
  const [quickAddVendorInitialName, setQuickAddVendorInitialName] = useState('');

  // Fetch customers, agents, vendors, and global markup settings
  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/customers`);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.map((c: any) => ({ id: c.id, name: c.displayName || `${c.legalFirstName} ${c.legalLastName}`, email: c.email })));
          // Also build a map of full customer data for markup lookup
          const customerMap: Record<string, Customer> = {};
          data.forEach((c: Customer) => {
            customerMap[c.id] = c;
          });
          setCustomerDataMap(customerMap);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/users`);
        if (res.ok) {
          const data = await res.json();
          // Filter out CLIENT role, only keep staff
          setAgents(data.filter((u: any) => u.role !== 'CLIENT').map((u: any) => ({
            id: u.googleId,
            name: u.name,
            role: u.role
          })));
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendors`);
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    const fetchGlobalMarkups = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.markups) {
            setGlobalMarkups(data.markups);
          }
        }
      } catch (error) {
        console.error('Error fetching global markups:', error);
      }
    };

    fetchCustomers();
    fetchAgents();
    fetchVendors();
    fetchGlobalMarkups();
  }, []);

  // Calculate charge to client based on cost and markup
  const calculateChargeFromMarkup = (cost: number, markupType: 'FLIGHT' | 'HOTEL' | 'LOGISTICS', clientId?: string): number => {
    if (!cost || cost <= 0) return 0;

    // Get markup setting - first check customer's custom markup, then fall back to global
    let markupAmount = 0;
    let markupIsFlatOrPercent: MarkupType = 'FLAT';

    const customer = clientId ? customerDataMap[clientId] : null;
    const markupKey = markupType.toLowerCase() as 'flight' | 'hotel' | 'logistics';

    // Check for customer-specific markup
    if (customer?.customMarkups?.[markupKey]?.amount !== null && customer?.customMarkups?.[markupKey]?.amount !== undefined) {
      markupAmount = customer.customMarkups[markupKey]!.amount!;
      markupIsFlatOrPercent = customer.customMarkups[markupKey]!.type || 'FLAT';
    } else if (globalMarkups?.[markupKey]) {
      // Fall back to global default
      markupAmount = globalMarkups[markupKey].amount;
      markupIsFlatOrPercent = globalMarkups[markupKey].type;
    }

    // Calculate charge based on markup type
    if (markupIsFlatOrPercent === 'PERCENT') {
      return cost * (1 + markupAmount / 100);
    } else {
      return cost + markupAmount;
    }
  };

  const closeDispatchModal = () => {
    setShowDispatchModal(false);
    setDispatchMode('QUICK');
    setDispatchSnippet('');
    setDispatchServiceType('FLIGHT');
    setDispatchClientName('');
    setDispatchTargetDate('');
    setDispatchSpecs('');
    setDispatchPriority('NORMAL');
    // Reset AI parse state
    setAiParseText('');
    setAiParsing(false);
    setAiParseError(null);
    setAiParsedData(null);
    setAiParseStep('input');
  };


  // AI Parse functions
  const handleAiParseText = async () => {
    if (!aiParseText.trim()) return;

    setAiParsing(true);
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
        setDispatchServiceType(result.data.bookingType as 'FLIGHT' | 'HOTEL' | 'LOGISTICS');
      }
      if (result.data.clientName) {
        setDispatchClientName(result.data.clientName);
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
        if (f.dates) setDispatchTargetDate(f.dates.split(',')[0].trim());
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
        if (h.checkIn) setDispatchTargetDate(h.checkIn);
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
        if (l.date) setDispatchTargetDate(l.date);
      }

      if (result.data.notes) {
        specs += specs ? `\n\nNotes: ${result.data.notes}` : `Notes: ${result.data.notes}`;
      }

      setDispatchSpecs(specs);

    } catch (error: any) {
      setAiParseError(error.message || 'Failed to parse confirmation');
    } finally {
      setAiParsing(false);
    }
  };

  const handleAiParsePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiParsing(true);
    setAiParseError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${API_URL}/api/parse/pdf`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse PDF');
      }

      setAiParsedData(result.data);
      setAiParseStep('review');

      // Pre-fill the detail form (same logic as text parse)
      if (result.data.bookingType) {
        setDispatchServiceType(result.data.bookingType as 'FLIGHT' | 'HOTEL' | 'LOGISTICS');
      }
      if (result.data.clientName) {
        setDispatchClientName(result.data.clientName);
      }

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
        if (f.dates) setDispatchTargetDate(f.dates.split(',')[0].trim());
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
        if (h.checkIn) setDispatchTargetDate(h.checkIn);
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
        if (l.date) setDispatchTargetDate(l.date);
      }

      if (result.data.notes) {
        specs += specs ? `\n\nNotes: ${result.data.notes}` : `Notes: ${result.data.notes}`;
      }

      setDispatchSpecs(specs);

    } catch (error: any) {
      setAiParseError(error.message || 'Failed to parse PDF');
    } finally {
      setAiParsing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAiParseSubmit = () => {
    // Switch to detail mode with pre-filled data
    setDispatchMode('DETAIL');
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRequest) return;

    const agentId = googleUser?.googleId || currentUser.id;
    const agentName = googleUser?.name || currentUser.name;

    if (dispatchMode === 'QUICK') {
      if (!dispatchSnippet.trim()) return;
      onAddRequest({
        agentId,
        clientId: '',
        type: dispatchServiceType,
        status: 'PENDING',
        priority: dispatchPriority,
        notes: dispatchSnippet,
        timestamp: new Date().toISOString(),
        details: {
          agentName,
          clientName: dispatchClientName || undefined
        }
      });
    } else {
      if (!dispatchClientName.trim() || !dispatchSpecs.trim()) return;
      onAddRequest({
        agentId,
        clientId: '',
        type: dispatchServiceType,
        status: 'PENDING',
        priority: dispatchPriority,
        notes: dispatchSpecs,
        timestamp: new Date().toISOString(),
        details: {
          clientName: dispatchClientName,
          targetDate: dispatchTargetDate,
          origin: dispatchOrigin || undefined,
          destination: dispatchDestination || undefined,
          departDate: dispatchDepartDate || undefined,
          returnDate: dispatchReturnDate || undefined,
          agentName
        }
      });
    }
    // Reset all fields
    setDispatchOrigin('');
    setDispatchDestination('');
    setDispatchDepartDate('');
    setDispatchReturnDate('');
    closeDispatchModal();
  };

  const openConvertModal = (request: BookingRequest) => {
    setConvertingRequest(request);
    const details = request.details || {};
    const clientName = details.clientName || '';

    if (request.type === 'FLIGHT') {
      // Pre-fill flight fields from request details
      setFlightDescription(clientName ? `${clientName}-` : '');
      setFlightAirline(details.airline || '');
      setFlightPassengerCount(details.passengerCount || details.passengers || 1);
      setFlightAgent(details.agentName || request.agentName || '');

      // Build routes from origin/destination
      if (details.origin && details.destination) {
        setFlightRoutes(`${details.origin}-${details.destination}`);
      }

      // Build dates string from depart/return dates
      const dates: string[] = [];
      if (details.departDate) dates.push(details.departDate);
      if (details.returnDate) dates.push(details.returnDate);
      if (dates.length > 0) {
        setFlightDates(dates.join(' - '));
      }
    } else if (request.type === 'HOTEL') {
      // Pre-fill hotel fields from request details
      setHotelDescription(clientName ? `${clientName}-` : '');
      setHotelName(details.hotelName || '');
      setHotelGuestCount(details.guestCount || details.guests || 1);
      setHotelRoomType(details.roomType || '');
      setHotelAgent(details.agentName || request.agentName || '');

      // Pre-fill dates
      if (details.checkIn || details.departDate) {
        setHotelCheckIn(details.checkIn || details.departDate || '');
      }
      if (details.checkOut || details.returnDate) {
        setHotelCheckOut(details.checkOut || details.returnDate || '');
      }
    } else {
      // Pre-fill logistics fields from request details
      setLogisticsDescription(clientName || '');
      setLogisticsServiceType(details.serviceType || '');
      setLogisticsDetails(details.logisticsDetails || request.notes || '');
      setLogisticsAgent(details.agentName || request.agentName || '');

      // Pre-fill date
      if (details.date || details.targetDate || details.departDate) {
        setLogisticsDate(details.date || details.targetDate || details.departDate || '');
      }
    }
    setShowConvertModal(true);
  };

  const closeConvertModal = () => {
    setShowConvertModal(false);
    setConvertingRequest(null);
    // Reset all form fields
    setFlightDescription(''); setFlightAirline(''); setFlightPaymentStatus('UNPAID');
    setFlightPnr(''); setFlightRoutes(''); setFlightPassengerCount(1);
    setFlightDates(''); setFlightAgent(''); setFlightCost(0); setFlightChargeToClient(0); setFlightProfitLoss(0); setFlightStatus('PENDING'); setFlightNotes('');
    setFlightVendorId(''); setFlightVendorName('');
    setHotelDescription(''); setHotelName(''); setHotelPaymentStatus('UNPAID');
    setHotelConfirmation(''); setHotelRoomType(''); setHotelGuestCount(1);
    setHotelCheckIn(''); setHotelCheckOut(''); setHotelAgent(''); setHotelCost(0); setHotelChargeToClient(0); setHotelProfitLoss(0); setHotelStatus('PENDING'); setHotelNotes('');
    setHotelVendorId(''); setHotelVendorName('');
    setLogisticsDescription(''); setLogisticsServiceType(''); setLogisticsPaymentStatus('UNPAID');
    setLogisticsConfirmation(''); setLogisticsDetails(''); setLogisticsDate('');
    setLogisticsAgent(''); setLogisticsCost(0); setLogisticsChargeToClient(0); setLogisticsProfitLoss(0); setLogisticsStatus('PENDING'); setLogisticsNotes('');
    setLogisticsVendorId(''); setLogisticsVendorName('');
  };

  const handleSubmitConvert = () => {
    if (!convertingRequest) return;

    if (convertingRequest.type === 'FLIGHT') {
      const newFlight: ConvertedFlight = {
        id: `cf-${Date.now()}`,
        description: flightDescription,
        airline: flightAirline,
        paymentStatus: flightPaymentStatus,
        pnr: flightPnr,
        flights: flightRoutes,
        passengerCount: flightPassengerCount,
        dates: flightDates,
        agent: flightAgent,
        cost: flightCost || undefined,
        chargeToClient: flightChargeToClient || undefined,
        profitLoss: flightProfitLoss,
        status: flightStatus,
        createdAt: new Date().toISOString(),
        originalRequestId: convertingRequest.id,
        notes: flightNotes || undefined,
        tripId: convertingRequest.tripId,
        tripName: convertingRequest.tripName,
        clientId: convertingRequest.clientId || undefined,
        vendorId: flightVendorId || undefined,
        vendorName: flightVendorName || undefined,
      };
      onConvertToFlight(newFlight, convertingRequest.id);
    } else if (convertingRequest.type === 'HOTEL') {
      const expectedComm = hotelRoomRate * hotelCommissionPercent / 100;
      const netComm = expectedComm * HOTEL_COMMISSION_SPLITS[hotelBookedVia];
      const newHotel: ConvertedHotel = {
        id: `ch-${Date.now()}`,
        description: hotelDescription,
        hotelName: hotelName,
        guestName: hotelGuestName,
        paymentStatus: hotelPaymentStatus,
        confirmationNumber: hotelConfirmation,
        roomType: hotelRoomType,
        guestCount: hotelGuestCount,
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        agent: hotelAgent,
        bookedVia: hotelBookedVia,
        paymentMethod: hotelPaymentMethod,
        customerPayingId: hotelCustomerPayingId || undefined,
        customerPayingName: hotelCustomerPayingName || undefined,
        roomRate: hotelRoomRate || undefined,
        fullCharge: hotelFullCharge || undefined,
        commissionPercent: hotelCommissionPercent,
        expectedCommission: expectedComm || undefined,
        commissionSplit: HOTEL_COMMISSION_SPLITS[hotelBookedVia],
        netCommission: netComm || undefined,
        cost: hotelCost || undefined,
        chargeToClient: hotelChargeToClient || undefined,
        profitLoss: hotelProfitLoss,
        status: hotelStatus,
        createdAt: new Date().toISOString(),
        originalRequestId: convertingRequest.id,
        notes: hotelNotes || undefined,
        tripId: convertingRequest.tripId,
        tripName: convertingRequest.tripName,
        clientId: convertingRequest.clientId || undefined,
        vendorId: hotelVendorId || undefined,
        vendorName: hotelVendorName || undefined,
      };
      onConvertToHotel(newHotel, convertingRequest.id);
    } else {
      const newLogistics: ConvertedLogistics = {
        id: `cl-${Date.now()}`,
        description: logisticsDescription,
        serviceType: logisticsServiceType,
        paymentStatus: logisticsPaymentStatus,
        confirmationNumber: logisticsConfirmation,
        details: logisticsDetails,
        date: logisticsDate,
        agent: logisticsAgent,
        cost: logisticsCost || undefined,
        chargeToClient: logisticsChargeToClient || undefined,
        profitLoss: logisticsProfitLoss,
        status: logisticsStatus,
        createdAt: new Date().toISOString(),
        originalRequestId: convertingRequest.id,
        notes: logisticsNotes || undefined,
        tripId: convertingRequest.tripId,
        tripName: convertingRequest.tripName,
        clientId: convertingRequest.clientId || undefined,
        vendorId: logisticsVendorId || undefined,
        vendorName: logisticsVendorName || undefined,
      };
      onConvertToLogistics(newLogistics, convertingRequest.id);
    }
    closeConvertModal();
  };

  // Open edit modal and populate with existing data
  const openEditModal = (type: 'flight' | 'hotel' | 'logistics', id: string) => {
    setEditingItem({ type, id });
    if (type === 'flight') {
      const flight = convertedFlights.find(f => f.id === id);
      if (flight) {
        setFlightDescription(flight.description);
        setFlightAirline(flight.airline);
        setFlightPaymentStatus(flight.paymentStatus);
        setFlightPnr(flight.pnr);
        setFlightRoutes(flight.flights);
        setFlightPassengerCount(flight.passengerCount);
        setFlightDates(flight.dates);
        setFlightAgent(flight.agent);
        setFlightCost(flight.cost || 0);
        setFlightChargeToClient(flight.chargeToClient || 0);
        setFlightProfitLoss(flight.profitLoss);
        setFlightStatus(flight.status);
        setFlightNotes(flight.notes || '');
        setFlightVendorId(flight.vendorId || '');
        setFlightVendorName(flight.vendorName || '');
      }
    } else if (type === 'hotel') {
      const hotel = convertedHotels.find(h => h.id === id);
      if (hotel) {
        setHotelDescription(hotel.description);
        setHotelName(hotel.hotelName);
        setHotelGuestName(hotel.guestName || '');
        setHotelPaymentStatus(hotel.paymentStatus);
        setHotelConfirmation(hotel.confirmationNumber);
        setHotelRoomType(hotel.roomType);
        setHotelGuestCount(hotel.guestCount);
        setHotelCheckIn(hotel.checkIn);
        setHotelCheckOut(hotel.checkOut);
        setHotelAgent(hotel.agent);
        setHotelBookedVia(hotel.bookedVia || 'PARAGON');
        setHotelPaymentMethod(hotel.paymentMethod || 'AGENCY');
        setHotelCustomerPayingId(hotel.customerPayingId || null);
        setHotelCustomerPayingName(hotel.customerPayingName || '');
        setHotelRoomRate(hotel.roomRate || 0);
        setHotelFullCharge(hotel.fullCharge || 0);
        setHotelCommissionPercent(hotel.commissionPercent || 10);
        setHotelCost(hotel.cost || 0);
        setHotelChargeToClient(hotel.chargeToClient || 0);
        setHotelProfitLoss(hotel.profitLoss);
        setHotelStatus(hotel.status);
        setHotelNotes(hotel.notes || '');
        setHotelVendorId(hotel.vendorId || '');
        setHotelVendorName(hotel.vendorName || '');
      }
    } else {
      const logistics = convertedLogistics.find(l => l.id === id);
      if (logistics) {
        setLogisticsDescription(logistics.description);
        setLogisticsServiceType(logistics.serviceType);
        setLogisticsPaymentStatus(logistics.paymentStatus);
        setLogisticsConfirmation(logistics.confirmationNumber);
        setLogisticsDetails(logistics.details);
        setLogisticsDate(logistics.date);
        setLogisticsAgent(logistics.agent);
        setLogisticsCost(logistics.cost || 0);
        setLogisticsChargeToClient(logistics.chargeToClient || 0);
        setLogisticsProfitLoss(logistics.profitLoss);
        setLogisticsStatus(logistics.status);
        setLogisticsNotes(logistics.notes || '');
        setLogisticsVendorId(logistics.vendorId || '');
        setLogisticsVendorName(logistics.vendorName || '');
      }
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    // Reset all form fields
    setFlightDescription(''); setFlightAirline(''); setFlightPaymentStatus('UNPAID');
    setFlightPnr(''); setFlightRoutes(''); setFlightPassengerCount(1);
    setFlightDates(''); setFlightAgent(''); setFlightCost(0); setFlightChargeToClient(0); setFlightProfitLoss(0); setFlightStatus('PENDING'); setFlightNotes('');
    setFlightVendorId(''); setFlightVendorName('');
    setHotelDescription(''); setHotelName(''); setHotelPaymentStatus('UNPAID');
    setHotelConfirmation(''); setHotelRoomType(''); setHotelGuestCount(1);
    setHotelCheckIn(''); setHotelCheckOut(''); setHotelAgent(''); setHotelCost(0); setHotelChargeToClient(0); setHotelProfitLoss(0); setHotelStatus('PENDING'); setHotelNotes('');
    setHotelVendorId(''); setHotelVendorName('');
    setLogisticsDescription(''); setLogisticsServiceType(''); setLogisticsPaymentStatus('UNPAID');
    setLogisticsConfirmation(''); setLogisticsDetails(''); setLogisticsDate('');
    setLogisticsAgent(''); setLogisticsCost(0); setLogisticsChargeToClient(0); setLogisticsProfitLoss(0); setLogisticsStatus('PENDING'); setLogisticsNotes('');
    setLogisticsVendorId(''); setLogisticsVendorName('');
  };

  const handleSubmitEdit = () => {
    if (!editingItem) return;

    if (editingItem.type === 'flight') {
      onUpdateFlight(editingItem.id, {
        description: flightDescription,
        airline: flightAirline,
        paymentStatus: flightPaymentStatus,
        pnr: flightPnr,
        flights: flightRoutes,
        passengerCount: flightPassengerCount,
        dates: flightDates,
        agent: flightAgent,
        cost: flightCost || undefined,
        chargeToClient: flightChargeToClient || undefined,
        profitLoss: flightProfitLoss,
        status: flightStatus,
        notes: flightNotes || undefined,
        vendorId: flightVendorId || undefined,
        vendorName: flightVendorName || undefined,
      });
    } else if (editingItem.type === 'hotel') {
      const expectedComm = hotelRoomRate * hotelCommissionPercent / 100;
      const netComm = expectedComm * HOTEL_COMMISSION_SPLITS[hotelBookedVia];
      onUpdateHotel(editingItem.id, {
        description: hotelDescription,
        hotelName: hotelName,
        guestName: hotelGuestName,
        paymentStatus: hotelPaymentStatus,
        confirmationNumber: hotelConfirmation,
        roomType: hotelRoomType,
        guestCount: hotelGuestCount,
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        agent: hotelAgent,
        bookedVia: hotelBookedVia,
        paymentMethod: hotelPaymentMethod,
        customerPayingId: hotelCustomerPayingId || undefined,
        customerPayingName: hotelCustomerPayingName || undefined,
        roomRate: hotelRoomRate || undefined,
        fullCharge: hotelFullCharge || undefined,
        commissionPercent: hotelCommissionPercent,
        expectedCommission: expectedComm || undefined,
        commissionSplit: HOTEL_COMMISSION_SPLITS[hotelBookedVia],
        netCommission: netComm || undefined,
        cost: hotelCost || undefined,
        chargeToClient: hotelChargeToClient || undefined,
        profitLoss: hotelProfitLoss,
        status: hotelStatus,
        notes: hotelNotes || undefined,
        vendorId: hotelVendorId || undefined,
        vendorName: hotelVendorName || undefined,
      });
    } else {
      onUpdateLogistics(editingItem.id, {
        description: logisticsDescription,
        serviceType: logisticsServiceType,
        paymentStatus: logisticsPaymentStatus,
        confirmationNumber: logisticsConfirmation,
        details: logisticsDetails,
        date: logisticsDate,
        agent: logisticsAgent,
        cost: logisticsCost || undefined,
        chargeToClient: logisticsChargeToClient || undefined,
        profitLoss: logisticsProfitLoss,
        status: logisticsStatus,
        notes: logisticsNotes || undefined,
        vendorId: logisticsVendorId || undefined,
        vendorName: logisticsVendorName || undefined,
      });
    }
    closeEditModal();
  };

  // Pipeline modal functions
  const openPipelineModal = (trip?: PipelineTrip, stage?: PipelineStage) => {
    if (trip) {
      setEditingTrip(trip);
      setTripName(trip.name);
      setTripClientName(trip.clientName);
      setTripStage(trip.stage);
      setTripHasFlights(trip.hasFlights);
      setTripHasHotels(trip.hasHotels);
      setTripHasLogistics(trip.hasLogistics);
      setTripIsUrgent(trip.isUrgent);
      setTripStartDate(trip.startDate || '');
      setTripEndDate(trip.endDate || '');
      setTripAgent(trip.agent);
      setTripNotes(trip.notes || '');
      setTripTasks([...trip.tasks]);
    } else {
      setEditingTrip(null);
      setTripName('');
      setTripClientName('');
      setTripStage(stage || 'NEW');
      setTripHasFlights(false);
      setTripHasHotels(false);
      setTripHasLogistics(false);
      setTripIsUrgent(false);
      setTripStartDate('');
      setTripEndDate('');
      setTripAgent(googleUser?.name || currentUser.name);
      setTripNotes('');
      setTripTasks([]);
    }
    setNewTaskText('');
    setShowPipelineModal(true);
  };

  const closePipelineModal = () => {
    setShowPipelineModal(false);
    setEditingTrip(null);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTripTasks(prev => [...prev, {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false
    }]);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    setTripTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTripTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleSubmitPipelineTrip = () => {
    if (!tripName.trim() || !tripClientName.trim()) return;

    if (editingTrip) {
      onUpdatePipelineTrip(editingTrip.id, {
        name: tripName,
        clientName: tripClientName,
        stage: tripStage,
        hasFlights: tripHasFlights,
        hasHotels: tripHasHotels,
        hasLogistics: tripHasLogistics,
        isUrgent: tripIsUrgent,
        startDate: tripStartDate || undefined,
        endDate: tripEndDate || undefined,
        agent: tripAgent,
        notes: tripNotes || undefined,
        tasks: tripTasks
      });
    } else {
      const newTrip: PipelineTrip = {
        id: `pt-${Date.now()}`,
        name: tripName,
        clientName: tripClientName,
        stage: tripStage,
        hasFlights: tripHasFlights,
        hasHotels: tripHasHotels,
        hasLogistics: tripHasLogistics,
        isUrgent: tripIsUrgent,
        startDate: tripStartDate || undefined,
        endDate: tripEndDate || undefined,
        agent: tripAgent,
        notes: tripNotes || undefined,
        tasks: tripTasks,
        createdAt: new Date().toISOString()
      };
      onAddPipelineTrip(newTrip);
    }
    closePipelineModal();
  };

  const handleMoveTrip = (tripId: string, newStage: PipelineStage) => {
    onUpdatePipelineTrip(tripId, { stage: newStage });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tripId: string) => {
    setDraggingTripId(tripId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tripId);
  };

  const handleDragEnd = () => {
    setDraggingTripId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: PipelineStage) => {
    e.preventDefault();
    const tripId = e.dataTransfer.getData('text/plain');
    if (tripId && draggingTripId) {
      handleMoveTrip(tripId, stageId);
    }
    setDraggingTripId(null);
    setDragOverStage(null);
  };

  const handleQuickToggleTask = (tripId: string, taskId: string) => {
    const trip = pipelineTrips.find(t => t.id === tripId);
    if (!trip) return;
    const updatedTasks = trip.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdatePipelineTrip(tripId, { tasks: updatedTasks });
  };

  const pipelineStages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'NEW', label: 'New', color: 'border-slate-400' },
    { id: 'PLANNING', label: 'Planning', color: 'border-amber-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-paragon' },
    { id: 'FINALIZING', label: 'Finalizing', color: 'border-emerald-500' }
  ];

  const tabs = [
    { id: 'flights', label: 'FLIGHTS' },
    { id: 'hotels', label: 'HOTELS' },
    { id: 'logistics', label: 'LOGISTICS' },
  ];

  // Calculate stats for category boxes
  const pendingFlightRequests = requests.filter(r => r.type === 'FLIGHT' && r.status === 'PENDING').length;
  const pendingHotelRequests = requests.filter(r => r.type === 'HOTEL' && r.status === 'PENDING').length;
  const pendingLogisticsRequests = requests.filter(r => r.type === 'LOGISTICS' && r.status === 'PENDING').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const flightsToday = convertedFlights.filter(f => {
    const flightDate = new Date(f.dates?.split(' - ')[0] || f.createdAt);
    return flightDate >= today && flightDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }).length;
  const flightsThisWeek = convertedFlights.filter(f => {
    const flightDate = new Date(f.dates?.split(' - ')[0] || f.createdAt);
    return flightDate >= today && flightDate < weekFromNow;
  }).length;

  const checkInsToday = convertedHotels.filter(h => {
    const checkIn = new Date(h.checkIn);
    return checkIn >= today && checkIn < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }).length;
  const checkInsThisWeek = convertedHotels.filter(h => {
    const checkIn = new Date(h.checkIn);
    return checkIn >= today && checkIn < weekFromNow;
  }).length;

  const logisticsToday = convertedLogistics.filter(l => {
    const logDate = new Date(l.date);
    return logDate >= today && logDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }).length;
  const logisticsThisWeek = convertedLogistics.filter(l => {
    const logDate = new Date(l.date);
    return logDate >= today && logDate < weekFromNow;
  }).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3">
            {subTab !== 'dashboard' && (
              <button
                onClick={() => setSubTab('dashboard')}
                className="text-slate-400 hover:text-paragon transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 uppercase tracking-widest">
              {subTab === 'dashboard' ? 'Operations' : subTab === 'flights' ? 'Flight Database' : subTab === 'hotels' ? 'Hotel Database' : subTab === 'logistics' ? 'Logistics Database' : 'Operations'}
            </h1>
          </div>
          {subTab === 'dashboard' && (
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-tight">
              Open Requests: <span className="font-bold text-amber-600">{requests.filter(r => r.status === 'PENDING').length}</span> /
              Total Bookings: <span className="font-bold">{convertedFlights.length + convertedHotels.length + convertedLogistics.length}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowDispatchModal(true)}
          className="bg-paragon text-white text-[9px] sm:text-[10px] px-4 py-2 font-bold tracking-widest hover:bg-paragon-dark transition-colors"
        >
          + NEW BOOKING
        </button>
      </div>

      {/* Dashboard View */}
      {subTab === 'dashboard' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Requests Queue - Main Feature */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="bg-slate-900 p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-paragon-gold">Open Requests Queue</h2>
              </div>
              <span className="text-[10px] text-slate-400">{requests.filter(r => r.status === 'PENDING').length} pending</span>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {requests.filter(r => r.status === 'PENDING').length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs">No pending requests in the queue</p>
                </div>
              ) : (
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
                      const clientName = r.details?.clientName || r.clientName || '—';
                      const targetDate = r.details?.targetDate ? formatDisplayDate(r.details.targetDate) : '—';
                      const isExpanded = selectedRequestId === r.id;

                      return (
                        <div
                          key={r.id}
                          className={`border rounded-xl transition-all ${isExpanded ? 'border-paragon bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <div
                            className="p-3 flex items-center gap-3 cursor-pointer"
                            onClick={() => setSelectedRequestId(isExpanded ? null : r.id)}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              r.type === 'FLIGHT' ? 'bg-red-100 text-red-600' :
                              r.type === 'HOTEL' ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {r.type === 'FLIGHT' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              ) : r.type === 'HOTEL' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-xs text-slate-900">{clientName}</span>
                                <Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : 'slate'}>{r.type}</Badge>
                                {(r.priority === 'URGENT' || r.priority === 'CRITICAL') && (
                                  <Badge color="red">URGENT</Badge>
                                )}
                                {r.tripName && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                                    {r.tripName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{r.notes || 'No details'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[10px] font-medium text-slate-600">{targetDate}</div>
                              <div className="text-[9px] text-slate-400">{formatDisplayDate(r.timestamp)}</div>
                            </div>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {isExpanded && (
                            <div className="px-3 pb-3 border-t border-slate-200">
                              {r.tripName && (
                                <div className="pt-3 pb-2">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">Linked Trip: </span>
                                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{r.tripName}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-[11px]">
                                <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Assigned To</span><span className="font-medium text-slate-700">{r.agentName || 'Unassigned'}</span></div>
                                <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Start Date</span><span className="font-medium text-slate-700">{r.details?.targetDate || '—'}</span></div>
                                <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Priority</span><span className="font-medium text-slate-700">{r.priority}</span></div>
                                <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Created</span><span className="font-medium text-slate-700">{new Date(r.timestamp).toLocaleString()}</span></div>
                              </div>
                              {r.notes && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                                  <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{r.notes}</p>
                                </div>
                              )}
                              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConvertingRequest(r); setShowConvertModal(true); }}
                                  className="flex-1 bg-paragon text-white text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-paragon-dark transition-colors rounded-xl"
                                >
                                  Convert to Booking
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'request', id: r.id, name: `${r.type} request for ${clientName}` }); }}
                                  className="bg-red-100 text-red-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Category Boxes - 1/3 width each */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Flights Box */}
            <button
              onClick={() => setSubTab('flights')}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6 hover:border-paragon hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Flights</h3>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Open Requests</span>
                  <span className="font-bold text-amber-600">{pendingFlightRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Flying Today</span>
                  <span className="font-bold text-slate-900">{flightsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">This Week</span>
                  <span className="font-bold text-slate-900">{flightsThisWeek}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Total in Database</span>
                  <span className="font-bold text-slate-900">{convertedFlights.length}</span>
                </div>
              </div>
              <div className="mt-4 text-[10px] text-paragon font-bold uppercase tracking-wider group-hover:underline">
                View All Flights →
              </div>
            </button>

            {/* Hotels Box */}
            <button
              onClick={() => setSubTab('hotels')}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6 hover:border-paragon hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Hotels</h3>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Open Requests</span>
                  <span className="font-bold text-amber-600">{pendingHotelRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-ins Today</span>
                  <span className="font-bold text-slate-900">{checkInsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">This Week</span>
                  <span className="font-bold text-slate-900">{checkInsThisWeek}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Total in Database</span>
                  <span className="font-bold text-slate-900">{convertedHotels.length}</span>
                </div>
              </div>
              <div className="mt-4 text-[10px] text-paragon font-bold uppercase tracking-wider group-hover:underline">
                View All Hotels →
              </div>
            </button>

            {/* Logistics Box */}
            <button
              onClick={() => setSubTab('logistics')}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6 hover:border-paragon hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Logistics</h3>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Open Requests</span>
                  <span className="font-bold text-amber-600">{pendingLogisticsRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Today</span>
                  <span className="font-bold text-slate-900">{logisticsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">This Week</span>
                  <span className="font-bold text-slate-900">{logisticsThisWeek}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Total in Database</span>
                  <span className="font-bold text-slate-900">{convertedLogistics.length}</span>
                </div>
              </div>
              <div className="mt-4 text-[10px] text-paragon font-bold uppercase tracking-wider group-hover:underline">
                View All Logistics →
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Database Views */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
        <div>
          {subTab === 'flights' && (() => {
            // Separate flights by age: < 7 days = Completed Bookings, >= 7 days = Existing Inventory
            const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const recentFlights = convertedFlights.filter(f => now - new Date(f.createdAt).getTime() < WEEK_MS);
            const olderFlights = convertedFlights.filter(f => now - new Date(f.createdAt).getTime() >= WEEK_MS);

            // Mobile card render
            const renderFlightCardMobile = (f: ConvertedFlight) => {
              const isExpanded = expandedItemId === f.id;
              return (
                <div key={f.id} className="bg-white border border-slate-200 rounded-xl transition-all">
                  <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : f.id)}>
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 truncate">{f.description}</span>
                        <Badge color={f.status === 'TICKETED' ? 'teal' : f.status === 'CONFIRMED' ? 'gold' : f.status === 'CANCELLED' ? 'red' : 'slate'}>{f.status}</Badge>
                        {f.tripName && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{f.tripName}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{f.airline} • {f.pnr}</p>
                    </div>
                    <Badge color={f.paymentStatus === 'PAID' ? 'teal' : 'red'}>{f.paymentStatus}</Badge>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-3 pt-3 text-[11px]">
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Routes</span><span className="font-medium text-slate-700">{f.flights}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Passengers</span><span className="font-medium text-slate-700">{f.passengerCount}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Dates</span><span className="font-medium text-slate-700">{f.dates || '-'}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Agent</span><span className="font-medium text-slate-700">{f.agent}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Profit/Loss</span><span className={`font-bold ${f.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${f.profitLoss.toLocaleString()}</span></div>
                      </div>
                      {f.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                          <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{f.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal('flight', f.id); }} className="flex-1 bg-slate-100 text-slate-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors rounded-xl">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'flight', id: f.id, name: f.description || f.pnr || 'this flight' }); }} className="flex-1 bg-red-100 text-red-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            // Desktop table render
            const renderFlightsTable = (flights: ConvertedFlight[]) => (
              <DataTable headers={['Status', 'Description', 'Airline', 'PNR', 'Routes', 'Pax', 'Dates', 'Agent', 'P/L', 'Payment', 'Action']}>
                {flights.map(f => {
                  const isExpanded = expandedItemId === f.id;
                  return (
                    <React.Fragment key={f.id}>
                      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : f.id)}>
                        <td className="px-4 py-3"><Badge color={f.status === 'TICKETED' ? 'teal' : f.status === 'CONFIRMED' ? 'gold' : f.status === 'CANCELLED' ? 'red' : 'slate'}>{f.status}</Badge></td>
                        <td className="px-4 py-3">
                          <span className="font-bold">{f.description}</span>
                          {f.tripName && <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{f.tripName}</span>}
                        </td>
                        <td className="px-4 py-3">{f.airline}</td>
                        <td className="px-4 py-3 font-mono text-paragon font-bold">{f.pnr}</td>
                        <td className="px-4 py-3">{f.flights}</td>
                        <td className="px-4 py-3">{f.passengerCount}</td>
                        <td className="px-4 py-3 text-slate-600">{f.dates || '-'}</td>
                        <td className="px-4 py-3 font-semibold">{f.agent}</td>
                        <td className={`px-4 py-3 font-bold ${f.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${f.profitLoss.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge color={f.paymentStatus === 'PAID' ? 'teal' : 'red'}>{f.paymentStatus}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <svg className={`w-4 h-4 text-slate-400 transition-transform inline ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={11} className="px-4 py-3">
                            {f.notes && (
                              <div className="mb-3 pb-3 border-b border-slate-200">
                                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">{f.notes}</p>
                              </div>
                            )}
                            <div className="flex gap-3 items-center">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal('flight', f.id); }} className="bg-slate-200 text-slate-700 text-[10px] py-2 px-4 font-bold uppercase tracking-wider hover:bg-slate-300 transition-colors rounded-xl">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'flight', id: f.id, name: f.description || f.pnr || 'this flight' }); }} className="bg-red-100 text-red-600 text-[10px] py-2 px-4 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl">Delete</button>
                              <span className="text-[10px] text-slate-400 ml-auto">Created: {formatDisplayDate(f.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </DataTable>
            );

            return (
            <div>
              <SectionHeader title="Global Flight Operations" subtitle="Manage commercial and private jet inventory." />

              {/* Completed Bookings (less than 7 days old) */}
              {recentFlights.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Completed Bookings</h4>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-2">{recentFlights.map(renderFlightCardMobile)}</div>
                  {/* Desktop */}
                  <div className="hidden lg:block">{renderFlightsTable(recentFlights)}</div>
                </div>
              )}

              {/* Existing Inventory (7+ days old) */}
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Existing Inventory</h4>
              {olderFlights.length > 0 ? (
                <>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-2">{olderFlights.map(renderFlightCardMobile)}</div>
                  {/* Desktop */}
                  <div className="hidden lg:block">{renderFlightsTable(olderFlights)}</div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No existing inventory</p>
                  <p className="text-xs mt-1">Completed bookings older than 7 days will appear here</p>
                </div>
              )}
            </div>
            );
          })()}

          {subTab === 'hotels' && (() => {
            // Separate hotels by age: < 7 days = Completed Bookings, >= 7 days = Existing Inventory
            const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const recentHotels = convertedHotels.filter(h => now - new Date(h.createdAt).getTime() < WEEK_MS);
            const olderHotels = convertedHotels.filter(h => now - new Date(h.createdAt).getTime() >= WEEK_MS);

            // Mobile card render
            const renderHotelCardMobile = (h: ConvertedHotel) => {
              const isExpanded = expandedItemId === h.id;
              return (
                <div key={h.id} className="bg-white border border-slate-200 rounded-xl transition-all">
                  <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : h.id)}>
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 truncate">{h.description}</span>
                        <Badge color={h.status === 'CONFIRMED' ? 'teal' : h.status === 'CANCELLED' ? 'red' : 'slate'}>{h.status}</Badge>
                        {h.tripName && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{h.tripName}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{h.hotelName}</p>
                    </div>
                    <Badge color={h.paymentStatus === 'PAID' ? 'teal' : 'red'}>{h.paymentStatus}</Badge>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-3 pt-3 text-[11px]">
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Confirmation #</span><span className="font-medium text-slate-700 font-mono">{h.confirmationNumber || '-'}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Room Type</span><span className="font-medium text-slate-700">{h.roomType}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Guests</span><span className="font-medium text-slate-700">{h.guestCount}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Check-In</span><span className="font-medium text-slate-700">{h.checkIn}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Check-Out</span><span className="font-medium text-slate-700">{h.checkOut}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Agent</span><span className="font-medium text-slate-700">{h.agent}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Profit/Loss</span><span className={`font-bold ${h.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${h.profitLoss.toLocaleString()}</span></div>
                      </div>
                      {h.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                          <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{h.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal('hotel', h.id); }} className="flex-1 bg-slate-100 text-slate-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors rounded-xl">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'hotel', id: h.id, name: h.hotelName || h.description || 'this hotel booking' }); }} className="flex-1 bg-red-100 text-red-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            // Desktop table render
            const renderHotelsTable = (hotels: ConvertedHotel[]) => (
              <DataTable headers={['Status', 'Description', 'Hotel', 'Conf #', 'Room', 'Dates', 'Guests', 'Agent', 'P/L', 'Payment', 'Action']}>
                {hotels.map(h => {
                  const isExpanded = expandedItemId === h.id;
                  return (
                    <React.Fragment key={h.id}>
                      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : h.id)}>
                        <td className="px-4 py-3"><Badge color={h.status === 'CONFIRMED' ? 'teal' : h.status === 'CANCELLED' ? 'red' : 'slate'}>{h.status}</Badge></td>
                        <td className="px-4 py-3">
                          <span className="font-bold">{h.description}</span>
                          {h.tripName && <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{h.tripName}</span>}
                        </td>
                        <td className="px-4 py-3">{h.hotelName}</td>
                        <td className="px-4 py-3 font-mono text-paragon font-bold">{h.confirmationNumber || '-'}</td>
                        <td className="px-4 py-3">{h.roomType}</td>
                        <td className="px-4 py-3">{h.checkIn} — {h.checkOut}</td>
                        <td className="px-4 py-3">{h.guestCount}</td>
                        <td className="px-4 py-3 font-semibold">{h.agent}</td>
                        <td className={`px-4 py-3 font-bold ${h.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${h.profitLoss.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge color={h.paymentStatus === 'PAID' ? 'teal' : 'red'}>{h.paymentStatus}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <svg className={`w-4 h-4 text-slate-400 transition-transform inline ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={11} className="px-4 py-3">
                            {h.notes && (
                              <div className="mb-3 pb-3 border-b border-slate-200">
                                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">{h.notes}</p>
                              </div>
                            )}
                            <div className="flex gap-3 items-center">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal('hotel', h.id); }} className="bg-slate-200 text-slate-700 text-[10px] py-2 px-4 font-bold uppercase tracking-wider hover:bg-slate-300 transition-colors rounded-xl">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'hotel', id: h.id, name: h.hotelName || h.description || 'this hotel booking' }); }} className="bg-red-100 text-red-600 text-[10px] py-2 px-4 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl">Delete</button>
                              <span className="text-[10px] text-slate-400 ml-auto">Created: {formatDisplayDate(h.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </DataTable>
            );

            return (
            <div>
              <SectionHeader title="Hotel Portfolio Management" />

              {/* Completed Bookings (less than 7 days old) */}
              {recentHotels.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Completed Bookings</h4>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-2">{recentHotels.map(renderHotelCardMobile)}</div>
                  {/* Desktop */}
                  <div className="hidden lg:block">{renderHotelsTable(recentHotels)}</div>
                </div>
              )}

              {/* Existing Inventory (7+ days old) */}
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Existing Inventory</h4>
              {olderHotels.length > 0 ? (
                <>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-2">{olderHotels.map(renderHotelCardMobile)}</div>
                  {/* Desktop */}
                  <div className="hidden lg:block">{renderHotelsTable(olderHotels)}</div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No existing inventory</p>
                  <p className="text-xs mt-1">Completed bookings older than 7 days will appear here</p>
                </div>
              )}
            </div>
            );
          })()}

          {subTab === 'logistics' && (() => {
            // Separate logistics by age: < 7 days = Completed Bookings, >= 7 days = Existing Inventory
            const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const recentLogistics = convertedLogistics.filter(l => now - new Date(l.createdAt).getTime() < WEEK_MS);
            const olderLogistics = convertedLogistics.filter(l => now - new Date(l.createdAt).getTime() >= WEEK_MS);

            // Mobile card render
            const renderLogisticsCardMobile = (l: ConvertedLogistics) => {
              const isExpanded = expandedItemId === l.id;
              return (
                <div key={l.id} className="bg-white border border-slate-200 rounded-xl transition-all">
                  <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : l.id)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 truncate">{l.description}</span>
                        <Badge color={l.status === 'CONFIRMED' ? 'teal' : l.status === 'CANCELLED' ? 'red' : 'slate'}>{l.status}</Badge>
                        {l.tripName && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{l.tripName}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{l.serviceType} • {l.date}</p>
                    </div>
                    <Badge color={l.paymentStatus === 'PAID' ? 'teal' : 'red'}>{l.paymentStatus}</Badge>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-3 pt-3 text-[11px]">
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Confirmation #</span><span className="font-medium text-slate-700 font-mono">{l.confirmationNumber || '-'}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Date</span><span className="font-medium text-slate-700">{l.date}</span></div>
                      </div>
                      <div className="pt-3 text-[11px]">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Details</span>
                        <span className="font-medium text-slate-700">{l.details || '-'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 text-[11px]">
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Agent</span><span className="font-medium text-slate-700">{l.agent}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase tracking-wider">Profit/Loss</span><span className={`font-bold ${l.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${l.profitLoss.toLocaleString()}</span></div>
                      </div>
                      {l.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                          <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{l.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal('logistics', l.id); }} className="flex-1 bg-slate-100 text-slate-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors rounded-xl">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'logistics', id: l.id, name: l.serviceType || l.description || 'this logistics booking' }); }} className="flex-1 bg-red-100 text-red-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            // Desktop table render
            const renderLogisticsTable = (logistics: ConvertedLogistics[]) => (
              <DataTable headers={['Status', 'Description', 'Service', 'Conf #', 'Details', 'Date', 'Agent', 'P/L', 'Payment', 'Action']}>
                {logistics.map(l => {
                  const isExpanded = expandedItemId === l.id;
                  return (
                    <React.Fragment key={l.id}>
                      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : l.id)}>
                        <td className="px-4 py-3"><Badge color={l.status === 'CONFIRMED' ? 'teal' : l.status === 'CANCELLED' ? 'red' : 'slate'}>{l.status}</Badge></td>
                        <td className="px-4 py-3">
                          <span className="font-bold">{l.description}</span>
                          {l.tripName && <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{l.tripName}</span>}
                        </td>
                        <td className="px-4 py-3">{l.serviceType}</td>
                        <td className="px-4 py-3 font-mono text-paragon font-bold">{l.confirmationNumber || '-'}</td>
                        <td className="px-4 py-3 italic truncate max-w-[200px]">{l.details || '-'}</td>
                        <td className="px-4 py-3">{l.date}</td>
                        <td className="px-4 py-3 font-semibold">{l.agent}</td>
                        <td className={`px-4 py-3 font-bold ${l.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${l.profitLoss.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge color={l.paymentStatus === 'PAID' ? 'teal' : 'red'}>{l.paymentStatus}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <svg className={`w-4 h-4 text-slate-400 transition-transform inline ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={10} className="px-4 py-3">
                            {l.notes && (
                              <div className="mb-3 pb-3 border-b border-slate-200">
                                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Notes</span>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">{l.notes}</p>
                              </div>
                            )}
                            <div className="flex gap-3 items-center">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal('logistics', l.id); }} className="bg-slate-200 text-slate-700 text-[10px] py-2 px-4 font-bold uppercase tracking-wider hover:bg-slate-300 transition-colors rounded-xl">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'logistics', id: l.id, name: l.serviceType || l.description || 'this logistics booking' }); }} className="bg-red-100 text-red-600 text-[10px] py-2 px-4 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl">Delete</button>
                              <span className="text-[10px] text-slate-400 ml-auto">Created: {formatDisplayDate(l.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </DataTable>
            );

            return (
            <div>
              <SectionHeader title="Logistics & Ground Transportation" subtitle="Manage transfers, car services, and other logistics." />

              {/* Completed Bookings (less than 7 days old) */}
              {recentLogistics.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Completed Bookings</h4>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-2">{recentLogistics.map(renderLogisticsCardMobile)}</div>
                  {/* Desktop */}
                  <div className="hidden lg:block">{renderLogisticsTable(recentLogistics)}</div>
                </div>
              )}

              {/* Existing Inventory (7+ days old) */}
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Existing Inventory</h4>
              {olderLogistics.length > 0 ? (
                <>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-2">{olderLogistics.map(renderLogisticsCardMobile)}</div>
                  {/* Desktop */}
                  <div className="hidden lg:block">{renderLogisticsTable(olderLogistics)}</div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No existing inventory</p>
                  <p className="text-xs mt-1">Completed bookings older than 7 days will appear here</p>
                </div>
              )}
            </div>
            );
          })()}

          {subTab === 'pending' && (
            <div>
              <SectionHeader title="Pending Requests" />

              {/* Mobile: Expandable List */}
              <div className="lg:hidden space-y-2">
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
                    const targetDate = r.details?.targetDate ? formatDisplayDate(r.details.targetDate, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    const agentName = r.details?.agentName || (googleUser && (r.agentId === googleUser.googleId || r.agentId === googleUser.id) ? googleUser.name : (agents.find(u => u.id === r.agentId)?.name || MOCK_USERS.find(u => u.id === r.agentId)?.name || 'Unknown'));
                    const isExpanded = expandedItemId === r.id;
                    const isOwnRequest = googleUser ? (r.agentId === googleUser.googleId || r.agentId === googleUser.id) : r.agentId === currentUser.id;

                    return (
                      <div
                        key={r.id}
                        className="bg-white border border-slate-200 rounded-xl transition-all"
                      >
                        {/* Header Row - Always Visible */}
                        <div
                          className="p-3 flex items-center gap-3 cursor-pointer"
                          onClick={() => setExpandedItemId(isExpanded ? null : r.id)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            r.type === 'FLIGHT' ? 'bg-red-100 text-red-600' :
                            r.type === 'HOTEL' ? 'bg-amber-100 text-amber-600' :
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
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-slate-900 truncate">{clientName}</span>
                              <Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : 'slate'}>{r.type}</Badge>
                              {r.tripName && (
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded-xl border border-purple-200 flex items-center gap-1">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                  </svg>
                                  {r.tripName}
                                </span>
                              )}
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
                                <span className="font-medium text-slate-700">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); openConvertModal(r); }}
                                className="flex-1 bg-paragon text-white text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-paragon-dark transition-colors rounded-xl"
                              >
                                Complete
                              </button>
                              {isOwnRequest && onDeleteRequest && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this request?')) onDeleteRequest(r.id); }}
                                  className="bg-red-100 text-red-600 text-[10px] py-2 px-3 font-bold uppercase tracking-wider hover:bg-red-200 transition-colors rounded-xl"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {requests.filter(r => r.status === 'PENDING').length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">No pending requests</p>
                  </div>
                )}
              </div>

              {/* Desktop: Table */}
              <div className="hidden lg:block">
                <DataTable headers={['Recd', 'Client', 'Type', 'Target Date', 'Notes', 'Agent', 'Priority', 'Action']}>
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
                    const targetDate = r.details?.targetDate ? formatDisplayDate(r.details.targetDate, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    const agentName = r.details?.agentName || (googleUser && (r.agentId === googleUser.googleId || r.agentId === googleUser.id) ? googleUser.name : (agents.find(u => u.id === r.agentId)?.name || MOCK_USERS.find(u => u.id === r.agentId)?.name || 'Unknown'));
                    const isOwnRequest = googleUser ? (r.agentId === googleUser.googleId || r.agentId === googleUser.id) : r.agentId === currentUser.id;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedItemId(expandedItemId === r.id ? null : r.id)}>
                        <td className="px-4 py-3">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 py-3 font-bold">{clientName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : 'slate'}>{r.type}</Badge>
                            {r.tripName && (
                              <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded-xl border border-purple-200">
                                {r.tripName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{targetDate}</td>
                        <td className="px-4 py-3 italic truncate max-w-sm">{r.notes}</td>
                        <td className="px-4 py-3 font-semibold">{agentName}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold ${r.priority === 'URGENT' || r.priority === 'CRITICAL' ? 'text-red-600' : 'text-slate-500'}`}>{r.priority}</span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openConvertModal(r); }}
                            className="text-paragon font-bold text-[10px] hover:text-paragon-dark"
                          >
                            COMPLETE
                          </button>
                          {isOwnRequest && onDeleteRequest && (
                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm('Delete this request?')) onDeleteRequest(r.id); }}
                              className="text-red-600 font-bold text-[10px] hover:text-red-700"
                            >
                              DELETE
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              </div>
            </div>
          )}
        </div>

        {/* Collaboration Panel - commented out for later
        {selectedElementId && (
          <div className="lg:col-span-4 fixed inset-x-0 bottom-0 lg:relative lg:inset-auto lg:sticky lg:top-20 lg:h-fit z-40">
            <div className="bg-white border-t lg:border border-slate-200 p-4 sm:p-6 rounded-t-lg lg:rounded-xl shadow-lg max-h-[60vh] lg:max-h-none overflow-auto animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Collaboration Panel</h3>
                 <button onClick={() => setSelectedElementId(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mb-6 pb-4 border-b border-slate-100 uppercase">
                ID: {selectedElementId}
              </div>

              <Comments
                parentId={selectedElementId}
                currentUser={currentUser}
                comments={comments}
                onAddComment={(text) => onAddComment(text, selectedElementId)}
                onDeleteComment={onDeleteComment}
              />
            </div>
          </div>
        )}
        */}
      </div>

      {/* Convert Modal */}
      {showConvertModal && convertingRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeConvertModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Complete {convertingRequest.type} Request
                </h2>
                <button onClick={closeConvertModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Fill in the details to complete this booking</p>
            </div>

            <div className="p-4 sm:p-6">
              {/* Flight Form */}
              {convertingRequest.type === 'FLIGHT' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (LastName-FlightNo)</label>
                      <input
                        type="text"
                        value={flightDescription}
                        onChange={(e) => setFlightDescription(e.target.value)}
                        placeholder="Smith-AA123"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Airline</label>
                      <input
                        type="text"
                        value={flightAirline}
                        onChange={(e) => setFlightAirline(e.target.value)}
                        placeholder="American Airlines"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={flightPaymentStatus}
                        onChange={(e) => setFlightPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PNR/PCC</label>
                      <input
                        type="text"
                        value={flightPnr}
                        onChange={(e) => setFlightPnr(e.target.value)}
                        placeholder="ABC123"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Flights (Routes)</label>
                    <input
                      type="text"
                      value={flightRoutes}
                      onChange={(e) => setFlightRoutes(e.target.value)}
                      placeholder="JFK-LAX, LAX-SFO"
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Passenger #</label>
                      <input
                        type="number"
                        min="1"
                        value={flightPassengerCount}
                        onChange={(e) => setFlightPassengerCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dates</label>
                      <input
                        type="text"
                        value={flightDates}
                        onChange={(e) => setFlightDates(e.target.value)}
                        placeholder="Jan 15 - Jan 20"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                    <select
                      value={flightAgent}
                      onChange={(e) => setFlightAgent(e.target.value)}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                    >
                      <option value="">Select agent...</option>
                      {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cost, Charge, and Profit/Loss */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={flightCost || ''}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setFlightCost(cost);
                          // Auto-calculate charge based on client markup
                          const charge = calculateChargeFromMarkup(cost, 'FLIGHT', convertingRequest?.clientId);
                          setFlightChargeToClient(charge);
                          setFlightProfitLoss(charge - cost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charge to Client ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={flightChargeToClient || ''}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setFlightChargeToClient(charge);
                          setFlightProfitLoss(charge - flightCost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={flightProfitLoss}
                        readOnly
                        className={`w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 ${flightProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor</label>
                      <VendorAutocomplete
                        value={flightVendorName}
                        vendorId={flightVendorId}
                        onChange={(name, id) => { setFlightVendorName(name); setFlightVendorId(id || ''); }}
                        vendors={vendors.filter(v => v.type === 'FLIGHT')}
                        vendorType="FLIGHT"
                        onAddNewVendor={() => {
                          setQuickAddVendorType('FLIGHT');
                          setQuickAddVendorInitialName(flightVendorName);
                          setShowQuickAddVendorModal(true);
                        }}
                        placeholder="Search vendors..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={flightStatus}
                        onChange={(e) => setFlightStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="TICKETED">Ticketed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                    <textarea
                      value={flightNotes}
                      onChange={(e) => setFlightNotes(e.target.value)}
                      placeholder="Additional notes about this booking..."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Hotel Form */}
              {convertingRequest.type === 'HOTEL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (LastName-Hotel)</label>
                      <input
                        type="text"
                        value={hotelDescription}
                        onChange={(e) => setHotelDescription(e.target.value)}
                        placeholder="Smith-RitzCarlton"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hotel Name</label>
                      <input
                        type="text"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        placeholder="The Ritz-Carlton"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={hotelGuestName}
                      onChange={(e) => setHotelGuestName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Booked Via</label>
                      <select
                        value={hotelBookedVia}
                        onChange={(e) => setHotelBookedVia(e.target.value as HotelBookingAgency)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PARAGON">Paragon (94% split)</option>
                        <option value="BENNISH">Bennish (85% split)</option>
                        <option value="EMBARK">Embark (70% split)</option>
                        <option value="TAAP">TAAP (100% split)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                      <select
                        value={hotelPaymentMethod}
                        onChange={(e) => setHotelPaymentMethod(e.target.value as HotelPaymentMethod)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="AGENCY">Paid by Agency</option>
                        <option value="PAY_AT_CHECKIN">Pay at Check-in</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={hotelPaymentStatus}
                        onChange={(e) => setHotelPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirmation #</label>
                      <input
                        type="text"
                        value={hotelConfirmation}
                        onChange={(e) => setHotelConfirmation(e.target.value)}
                        placeholder="CONF123456"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room Type</label>
                      <input
                        type="text"
                        value={hotelRoomType}
                        onChange={(e) => setHotelRoomType(e.target.value)}
                        placeholder="Deluxe Suite"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest #</label>
                      <input
                        type="number"
                        min="1"
                        value={hotelGuestCount}
                        onChange={(e) => setHotelGuestCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-In</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-Out</label>
                      <input
                        type="date"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        min={hotelCheckIn || new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                    <select
                      value={hotelAgent}
                      onChange={(e) => setHotelAgent(e.target.value)}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                    >
                      <option value="">Select agent...</option>
                      {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Room Rate & Full Charge */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room Rate (w/o taxes) ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelRoomRate || ''}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          setHotelRoomRate(rate);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Charge (w/ taxes) ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelFullCharge || ''}
                        onChange={(e) => {
                          const fullCharge = parseFloat(e.target.value) || 0;
                          setHotelFullCharge(fullCharge);
                          setHotelCost(fullCharge);
                          const charge = calculateChargeFromMarkup(fullCharge, 'HOTEL', convertingRequest?.clientId);
                          setHotelChargeToClient(charge);
                          setHotelProfitLoss(charge - fullCharge);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  {/* Commission Calculation */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Comm. % (of room rate)</label>
                      <select
                        value={hotelCommissionPercent}
                        onChange={(e) => setHotelCommissionPercent(parseInt(e.target.value))}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                        <option value={12}>12%</option>
                        <option value={8}>8%</option>
                        <option value={20}>20%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Comm. ($)</label>
                      <input
                        type="number"
                        value={(hotelRoomRate * hotelCommissionPercent / 100).toFixed(2)}
                        readOnly
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Net Comm. ({Math.round(HOTEL_COMMISSION_SPLITS[hotelBookedVia] * 100)}%)</label>
                      <input
                        type="number"
                        value={(hotelRoomRate * hotelCommissionPercent / 100 * HOTEL_COMMISSION_SPLITS[hotelBookedVia]).toFixed(2)}
                        readOnly
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl bg-emerald-50 text-emerald-600 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Cost, Charge, and Profit/Loss */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelCost || ''}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setHotelCost(cost);
                          // Auto-calculate charge based on client markup
                          const charge = calculateChargeFromMarkup(cost, 'HOTEL', convertingRequest?.clientId);
                          setHotelChargeToClient(charge);
                          setHotelProfitLoss(charge - cost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charge to Client ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelChargeToClient || ''}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setHotelChargeToClient(charge);
                          setHotelProfitLoss(charge - hotelCost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={hotelProfitLoss}
                        readOnly
                        className={`w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 ${hotelProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}
                      />
                    </div>
                  </div>

                  {/* Customer Paying */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Paying (if different from guest)</label>
                    <ClientAutocomplete
                      value={hotelCustomerPayingName}
                      onChange={(val) => setHotelCustomerPayingName(val)}
                      customers={customers}
                      onSelectCustomer={(c) => {
                        setHotelCustomerPayingId(c.id);
                        setHotelCustomerPayingName(c.name);
                      }}
                      onAddNewClient={() => {
                        setNewCustomerInitialName(hotelCustomerPayingName);
                        setShowAddCustomerModal(true);
                      }}
                      placeholder="Search or leave blank if same as guest..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor</label>
                      <VendorAutocomplete
                        value={hotelVendorName}
                        vendorId={hotelVendorId}
                        onChange={(name, id) => { setHotelVendorName(name); setHotelVendorId(id || ''); }}
                        vendors={vendors.filter(v => v.type === 'HOTEL')}
                        vendorType="HOTEL"
                        onAddNewVendor={() => {
                          setQuickAddVendorType('HOTEL');
                          setQuickAddVendorInitialName(hotelVendorName);
                          setShowQuickAddVendorModal(true);
                        }}
                        placeholder="Search vendors..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={hotelStatus}
                        onChange={(e) => setHotelStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                    <textarea
                      value={hotelNotes}
                      onChange={(e) => setHotelNotes(e.target.value)}
                      placeholder="Additional notes about this booking..."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Logistics / General Form */}
              {(convertingRequest.type === 'LOGISTICS' || convertingRequest.type === 'GENERAL') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={logisticsDescription}
                        onChange={(e) => setLogisticsDescription(e.target.value)}
                        placeholder="Smith-Transfer"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Type</label>
                      <input
                        type="text"
                        value={logisticsServiceType}
                        onChange={(e) => setLogisticsServiceType(e.target.value)}
                        placeholder="Car Service, Transfer, etc."
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={logisticsPaymentStatus}
                        onChange={(e) => setLogisticsPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirmation #</label>
                      <input
                        type="text"
                        value={logisticsConfirmation}
                        onChange={(e) => setLogisticsConfirmation(e.target.value)}
                        placeholder="CONF123456"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Details</label>
                    <textarea
                      value={logisticsDetails}
                      onChange={(e) => setLogisticsDetails(e.target.value)}
                      placeholder="Pickup location, special instructions, etc."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={logisticsDate}
                        onChange={(e) => setLogisticsDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <select
                        value={logisticsAgent}
                        onChange={(e) => setLogisticsAgent(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                      >
                        <option value="">Select agent...</option>
                        {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                          <option key={user.id} value={user.name}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cost, Charge, and Profit/Loss */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={logisticsCost || ''}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setLogisticsCost(cost);
                          // Auto-calculate charge based on client markup
                          const charge = calculateChargeFromMarkup(cost, 'LOGISTICS', convertingRequest?.clientId);
                          setLogisticsChargeToClient(charge);
                          setLogisticsProfitLoss(charge - cost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charge to Client ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={logisticsChargeToClient || ''}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setLogisticsChargeToClient(charge);
                          setLogisticsProfitLoss(charge - logisticsCost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={logisticsProfitLoss}
                        readOnly
                        className={`w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 ${logisticsProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor</label>
                      <VendorAutocomplete
                        value={logisticsVendorName}
                        vendorId={logisticsVendorId}
                        onChange={(name, id) => { setLogisticsVendorName(name); setLogisticsVendorId(id || ''); }}
                        vendors={vendors.filter(v => v.type === 'LOGISTICS')}
                        vendorType="LOGISTICS"
                        onAddNewVendor={() => {
                          setQuickAddVendorType('LOGISTICS');
                          setQuickAddVendorInitialName(logisticsVendorName);
                          setShowQuickAddVendorModal(true);
                        }}
                        placeholder="Search vendors..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={logisticsStatus}
                        onChange={(e) => setLogisticsStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                    <textarea
                      value={logisticsNotes}
                      onChange={(e) => setLogisticsNotes(e.target.value)}
                      placeholder="Additional notes about this booking..."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={closeConvertModal}
                className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitConvert}
                className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-xl"
              >
                Complete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}
                </h2>
                <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Flight Edit Form */}
              {editingItem.type === 'flight' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={flightDescription}
                        onChange={(e) => setFlightDescription(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Airline</label>
                      <input
                        type="text"
                        value={flightAirline}
                        onChange={(e) => setFlightAirline(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={flightPaymentStatus}
                        onChange={(e) => setFlightPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PNR/PCC</label>
                      <input
                        type="text"
                        value={flightPnr}
                        onChange={(e) => setFlightPnr(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Flights (Routes)</label>
                    <input
                      type="text"
                      value={flightRoutes}
                      onChange={(e) => setFlightRoutes(e.target.value)}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Passenger #</label>
                      <input
                        type="number"
                        min="1"
                        value={flightPassengerCount}
                        onChange={(e) => setFlightPassengerCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dates</label>
                      <input
                        type="text"
                        value={flightDates}
                        onChange={(e) => setFlightDates(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <select
                        value={flightAgent}
                        onChange={(e) => setFlightAgent(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                      >
                        <option value="">Select agent...</option>
                        {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                          <option key={user.id} value={user.name}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Cost, Charge, and Profit/Loss */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={flightCost || ''}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setFlightCost(cost);
                          setFlightProfitLoss(flightChargeToClient - cost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charge to Client ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={flightChargeToClient || ''}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setFlightChargeToClient(charge);
                          setFlightProfitLoss(charge - flightCost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={flightProfitLoss}
                        readOnly
                        className={`w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 ${flightProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor</label>
                      <VendorAutocomplete
                        value={flightVendorName}
                        vendorId={flightVendorId}
                        onChange={(name, id) => { setFlightVendorName(name); setFlightVendorId(id || ''); }}
                        vendors={vendors.filter(v => v.type === 'FLIGHT')}
                        vendorType="FLIGHT"
                        onAddNewVendor={() => {
                          setQuickAddVendorType('FLIGHT');
                          setQuickAddVendorInitialName(flightVendorName);
                          setShowQuickAddVendorModal(true);
                        }}
                        placeholder="Search vendors..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={flightStatus}
                        onChange={(e) => setFlightStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="TICKETED">Ticketed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                    <textarea
                      value={flightNotes}
                      onChange={(e) => setFlightNotes(e.target.value)}
                      placeholder="Additional notes about this booking..."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Hotel Edit Form */}
              {editingItem.type === 'hotel' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={hotelDescription}
                        onChange={(e) => setHotelDescription(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hotel Name</label>
                      <input
                        type="text"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={hotelGuestName}
                      onChange={(e) => setHotelGuestName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Booked Via</label>
                      <select
                        value={hotelBookedVia}
                        onChange={(e) => setHotelBookedVia(e.target.value as HotelBookingAgency)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PARAGON">Paragon (94% split)</option>
                        <option value="BENNISH">Bennish (85% split)</option>
                        <option value="EMBARK">Embark (70% split)</option>
                        <option value="TAAP">TAAP (100% split)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                      <select
                        value={hotelPaymentMethod}
                        onChange={(e) => setHotelPaymentMethod(e.target.value as HotelPaymentMethod)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="AGENCY">Paid by Agency</option>
                        <option value="PAY_AT_CHECKIN">Pay at Check-in</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={hotelPaymentStatus}
                        onChange={(e) => setHotelPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirmation #</label>
                      <input
                        type="text"
                        value={hotelConfirmation}
                        onChange={(e) => setHotelConfirmation(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room Type</label>
                      <input
                        type="text"
                        value={hotelRoomType}
                        onChange={(e) => setHotelRoomType(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest #</label>
                      <input
                        type="number"
                        min="1"
                        value={hotelGuestCount}
                        onChange={(e) => setHotelGuestCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-In</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-Out</label>
                      <input
                        type="date"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                    <select
                      value={hotelAgent}
                      onChange={(e) => setHotelAgent(e.target.value)}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                    >
                      <option value="">Select agent...</option>
                      {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Room Rate & Full Charge */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room Rate (w/o taxes) ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelRoomRate || ''}
                        onChange={(e) => setHotelRoomRate(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Charge (w/ taxes) ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelFullCharge || ''}
                        onChange={(e) => {
                          const fullCharge = parseFloat(e.target.value) || 0;
                          setHotelFullCharge(fullCharge);
                          setHotelCost(fullCharge);
                          setHotelProfitLoss(hotelChargeToClient - fullCharge);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  {/* Commission Calculation */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Comm. %</label>
                      <select
                        value={hotelCommissionPercent}
                        onChange={(e) => setHotelCommissionPercent(parseInt(e.target.value))}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                        <option value={12}>12%</option>
                        <option value={8}>8%</option>
                        <option value={20}>20%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Comm.</label>
                      <input
                        type="number"
                        value={(hotelRoomRate * hotelCommissionPercent / 100).toFixed(2)}
                        readOnly
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Net Comm. ({Math.round(HOTEL_COMMISSION_SPLITS[hotelBookedVia] * 100)}%)</label>
                      <input
                        type="number"
                        value={(hotelRoomRate * hotelCommissionPercent / 100 * HOTEL_COMMISSION_SPLITS[hotelBookedVia]).toFixed(2)}
                        readOnly
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl bg-emerald-50 text-emerald-600 font-semibold"
                      />
                    </div>
                  </div>
                  {/* Cost, Charge, and Profit/Loss */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelCost || ''}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setHotelCost(cost);
                          setHotelProfitLoss(hotelChargeToClient - cost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charge to Client ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hotelChargeToClient || ''}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setHotelChargeToClient(charge);
                          setHotelProfitLoss(charge - hotelCost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={hotelProfitLoss}
                        readOnly
                        className={`w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 ${hotelProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}
                      />
                    </div>
                  </div>
                  {/* Customer Paying */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Paying (if different)</label>
                    <ClientAutocomplete
                      value={hotelCustomerPayingName}
                      onChange={(val) => setHotelCustomerPayingName(val)}
                      customers={customers}
                      onSelectCustomer={(c) => {
                        setHotelCustomerPayingId(c.id);
                        setHotelCustomerPayingName(c.name);
                      }}
                      onAddNewClient={() => {
                        setNewCustomerInitialName(hotelCustomerPayingName);
                        setShowAddCustomerModal(true);
                      }}
                      placeholder="Search or leave blank..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor</label>
                      <VendorAutocomplete
                        value={hotelVendorName}
                        vendorId={hotelVendorId}
                        onChange={(name, id) => { setHotelVendorName(name); setHotelVendorId(id || ''); }}
                        vendors={vendors.filter(v => v.type === 'HOTEL')}
                        vendorType="HOTEL"
                        onAddNewVendor={() => {
                          setQuickAddVendorType('HOTEL');
                          setQuickAddVendorInitialName(hotelVendorName);
                          setShowQuickAddVendorModal(true);
                        }}
                        placeholder="Search vendors..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={hotelStatus}
                        onChange={(e) => setHotelStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                    <textarea
                      value={hotelNotes}
                      onChange={(e) => setHotelNotes(e.target.value)}
                      placeholder="Additional notes about this booking..."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Logistics Edit Form */}
              {editingItem.type === 'logistics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={logisticsDescription}
                        onChange={(e) => setLogisticsDescription(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Type</label>
                      <input
                        type="text"
                        value={logisticsServiceType}
                        onChange={(e) => setLogisticsServiceType(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={logisticsPaymentStatus}
                        onChange={(e) => setLogisticsPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirmation #</label>
                      <input
                        type="text"
                        value={logisticsConfirmation}
                        onChange={(e) => setLogisticsConfirmation(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Details</label>
                    <textarea
                      value={logisticsDetails}
                      onChange={(e) => setLogisticsDetails(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={logisticsDate}
                        onChange={(e) => setLogisticsDate(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <select
                        value={logisticsAgent}
                        onChange={(e) => setLogisticsAgent(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                      >
                        <option value="">Select agent...</option>
                        {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                          <option key={user.id} value={user.name}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Cost, Charge, and Profit/Loss */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={logisticsCost || ''}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setLogisticsCost(cost);
                          setLogisticsProfitLoss(logisticsChargeToClient - cost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charge to Client ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={logisticsChargeToClient || ''}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setLogisticsChargeToClient(charge);
                          setLogisticsProfitLoss(charge - logisticsCost);
                        }}
                        placeholder="0.00"
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={logisticsProfitLoss}
                        readOnly
                        className={`w-full p-2 border border-slate-200 text-xs rounded-xl bg-slate-50 ${logisticsProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor</label>
                      <VendorAutocomplete
                        value={logisticsVendorName}
                        vendorId={logisticsVendorId}
                        onChange={(name, id) => { setLogisticsVendorName(name); setLogisticsVendorId(id || ''); }}
                        vendors={vendors.filter(v => v.type === 'LOGISTICS')}
                        vendorType="LOGISTICS"
                        onAddNewVendor={() => {
                          setQuickAddVendorType('LOGISTICS');
                          setQuickAddVendorInitialName(logisticsVendorName);
                          setShowQuickAddVendorModal(true);
                        }}
                        placeholder="Search vendors..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={logisticsStatus}
                        onChange={(e) => setLogisticsStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                    <textarea
                      value={logisticsNotes}
                      onChange={(e) => setLogisticsNotes(e.target.value)}
                      placeholder="Additional notes about this booking..."
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Trip Modal - Removed, now in ConciergeTrips tab */}
      {false && viewingTrip && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setViewingTrip(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900">{viewingTrip.name}</h2>
                    {viewingTrip.isUrgent && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold uppercase rounded">Urgent</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{viewingTrip.clientName}</p>
                </div>
                <button onClick={() => setViewingTrip(null)} className="text-slate-400 hover:text-slate-600 text-xl ml-4">&times;</button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Stage & Agent */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stage</label>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-xl ${
                    viewingTrip.stage === 'NEW' ? 'bg-slate-100 text-slate-600' :
                    viewingTrip.stage === 'PLANNING' ? 'bg-amber-100 text-amber-700' :
                    viewingTrip.stage === 'IN_PROGRESS' ? 'bg-paragon/10 text-paragon' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {viewingTrip.stage === 'NEW' ? 'New' :
                     viewingTrip.stage === 'PLANNING' ? 'Planning' :
                     viewingTrip.stage === 'IN_PROGRESS' ? 'In Progress' : 'Finalizing'}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agent</label>
                  <p className="text-sm text-slate-900 font-medium">{viewingTrip.agent}</p>
                </div>
              </div>

              {/* Dates */}
              {(viewingTrip.startDate || viewingTrip.endDate) && (
                <div className="flex gap-4">
                  {viewingTrip.startDate && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
                      <p className="text-sm text-slate-900">{formatDisplayDate(viewingTrip.startDate)}</p>
                    </div>
                  )}
                  {viewingTrip.endDate && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                      <p className="text-sm text-slate-900">{formatDisplayDate(viewingTrip.endDate)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Services */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Services</label>
                <div className="flex gap-3">
                  {viewingTrip.hasFlights && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                      <svg className="w-4 h-4 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Flights</span>
                    </div>
                  )}
                  {viewingTrip.hasHotels && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Hotels</span>
                    </div>
                  )}
                  {viewingTrip.hasLogistics && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Logistics</span>
                    </div>
                  )}
                  {!viewingTrip.hasFlights && !viewingTrip.hasHotels && !viewingTrip.hasLogistics && (
                    <p className="text-xs text-slate-400 italic">No services selected</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {viewingTrip.notes && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{viewingTrip.notes}</p>
                </div>
              )}

              {/* Tasks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Tasks ({viewingTrip.tasks.filter(t => t.completed).length}/{viewingTrip.tasks.length} completed)
                </label>
                {viewingTrip.tasks.length > 0 ? (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl">
                    {viewingTrip.tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleQuickToggleTask(viewingTrip.id, task.id)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={`w-4 h-4 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 group-hover:border-paragon'}`}>
                          {task.completed && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tasks added</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-between">
              <button
                onClick={() => { onDeletePipelineTrip(viewingTrip.id); setViewingTrip(null); }}
                className="px-4 py-2 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-xl"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingTrip(null)}
                  className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => { openPipelineModal(viewingTrip); setViewingTrip(null); }}
                  className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-xl"
                >
                  Edit Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal (NEW ELEMENT) */}
      {showDispatchModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeDispatchModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Operational Dispatch</h2>
                <button onClick={closeDispatchModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Submit a new request to the inbound queue</p>
            </div>

            {/* Mode Toggle */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setDispatchMode('QUICK'); setAiParseStep('input'); }}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    dispatchMode === 'QUICK'
                      ? 'bg-paragon text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Quick Snippet
                </button>
                <button
                  type="button"
                  onClick={() => { setDispatchMode('AI_PARSE'); setAiParseStep('input'); }}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    dispatchMode === 'AI_PARSE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  AI Parse
                </button>
                <button
                  type="button"
                  onClick={() => { setDispatchMode('DETAIL'); setAiParseStep('input'); }}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    dispatchMode === 'DETAIL'
                      ? 'bg-paragon text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 flex-1 flex flex-col overflow-hidden">
              {dispatchMode === 'QUICK' ? (
                <div className="flex-1 flex flex-col">
                  {/* Client Selection */}
                  <div className="mb-4 flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Client Name *</label>
                    <ClientAutocomplete
                      value={dispatchClientName}
                      onChange={setDispatchClientName}
                      customers={customers}
                      onAddNewClient={() => {
                        setNewCustomerInitialName(dispatchClientName);
                        setShowAddCustomerModal(true);
                      }}
                      placeholder="Select or type client name..."
                      required
                    />
                  </div>
                  {/* Service Type Selection */}
                  <div className="mb-4 flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Service Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDispatchServiceType('FLIGHT')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchServiceType === 'FLIGHT'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        Flight
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchServiceType('HOTEL')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchServiceType === 'HOTEL'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        Hotel
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchServiceType('LOGISTICS')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchServiceType === 'LOGISTICS'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        Logistics
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={dispatchSnippet}
                    onChange={(e) => setDispatchSnippet(e.target.value)}
                    placeholder="Describe the booking request details..."
                    className="w-full flex-1 p-4 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-xl resize-none min-h-[100px]"
                    required
                  />
                  <div className="mt-4 flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDispatchPriority('NORMAL')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchPriority === 'NORMAL'
                            ? 'bg-paragon-gold text-slate-900'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchPriority('URGENT')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchPriority === 'URGENT'
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
                    className="mt-4 w-full py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-xl"
                  >
                    Submit Request
                  </button>
                </div>
              ) : dispatchMode === 'AI_PARSE' ? (
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  {aiParseStep === 'input' ? (
                    <>
                      {/* AI Parse Input */}
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">AI-Powered Parsing</span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          Paste a booking confirmation email or upload a PDF. Our AI will automatically extract flight, hotel, or logistics details.
                        </p>
                      </div>

                      <textarea
                        value={aiParseText}
                        onChange={(e) => setAiParseText(e.target.value)}
                        placeholder="Paste your booking confirmation, itinerary, or PNR details here...

Example:
BOOKING CONFIRMATION
Confirmation Number: ABC123
Guest: John Smith
Hotel: The Ritz-Carlton, New York
Check-in: January 25, 2026
Check-out: January 28, 2026
Room Type: Deluxe King"
                        className="w-full flex-1 p-4 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 rounded-xl resize-none min-h-[180px]"
                      />

                      {aiParseError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-xs text-red-700">{aiParseError}</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={handleAiParseText}
                          disabled={aiParsing || !aiParseText.trim()}
                          className="flex-1 py-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {aiParsing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                              Parsing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Parse Text
                            </>
                          )}
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".pdf"
                          onChange={handleAiParsePdf}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={aiParsing}
                          className="flex-1 py-3 bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {aiParsing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                              Parsing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Upload PDF
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                      {/* AI Parse Review */}
                      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Parsed Successfully</span>
                          {aiParsedData?.confidence && (
                            <span className="ml-auto text-[10px] text-emerald-600 font-semibold">{aiParsedData.confidence}% confidence</span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Review the extracted information below. Click "Use This Data" to pre-fill the detailed form, or go back to try again.
                        </p>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Booking Type</div>
                          <div className="text-sm font-bold text-slate-900">{aiParsedData?.bookingType || 'Unknown'}</div>
                        </div>

                        {aiParsedData?.clientName && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Client Name</div>
                            <div className="text-sm text-slate-900">{aiParsedData.clientName}</div>
                          </div>
                        )}

                        {aiParsedData?.bookingType === 'FLIGHT' && aiParsedData.flight && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Flight Details</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {aiParsedData.flight.pnr && <div><span className="text-slate-500">PNR:</span> <span className="font-mono font-bold">{aiParsedData.flight.pnr}</span></div>}
                              {aiParsedData.flight.airline && <div><span className="text-slate-500">Airline:</span> {aiParsedData.flight.airline}</div>}
                              {aiParsedData.flight.routes && <div className="col-span-2"><span className="text-slate-500">Routes:</span> {aiParsedData.flight.routes}</div>}
                              {aiParsedData.flight.dates && <div><span className="text-slate-500">Dates:</span> {aiParsedData.flight.dates}</div>}
                              {aiParsedData.flight.passengerCount && <div><span className="text-slate-500">Passengers:</span> {aiParsedData.flight.passengerCount}</div>}
                            </div>
                          </div>
                        )}

                        {aiParsedData?.bookingType === 'HOTEL' && aiParsedData.hotel && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Hotel Details</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {aiParsedData.hotel.confirmationNumber && <div><span className="text-slate-500">Conf #:</span> <span className="font-mono font-bold">{aiParsedData.hotel.confirmationNumber}</span></div>}
                              {aiParsedData.hotel.hotelName && <div><span className="text-slate-500">Hotel:</span> {aiParsedData.hotel.hotelName}</div>}
                              {aiParsedData.hotel.roomType && <div><span className="text-slate-500">Room:</span> {aiParsedData.hotel.roomType}</div>}
                              {aiParsedData.hotel.checkIn && <div><span className="text-slate-500">Check-in:</span> {aiParsedData.hotel.checkIn}</div>}
                              {aiParsedData.hotel.checkOut && <div><span className="text-slate-500">Check-out:</span> {aiParsedData.hotel.checkOut}</div>}
                              {aiParsedData.hotel.guestCount && <div><span className="text-slate-500">Guests:</span> {aiParsedData.hotel.guestCount}</div>}
                            </div>
                          </div>
                        )}

                        {aiParsedData?.bookingType === 'LOGISTICS' && aiParsedData.logistics && (
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2">Logistics Details</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {aiParsedData.logistics.confirmationNumber && <div><span className="text-slate-500">Conf #:</span> <span className="font-mono font-bold">{aiParsedData.logistics.confirmationNumber}</span></div>}
                              {aiParsedData.logistics.serviceType && <div><span className="text-slate-500">Service:</span> {aiParsedData.logistics.serviceType}</div>}
                              {aiParsedData.logistics.provider && <div><span className="text-slate-500">Provider:</span> {aiParsedData.logistics.provider}</div>}
                              {aiParsedData.logistics.date && <div><span className="text-slate-500">Date:</span> {aiParsedData.logistics.date}</div>}
                              {aiParsedData.logistics.pickupLocation && <div className="col-span-2"><span className="text-slate-500">Pickup:</span> {aiParsedData.logistics.pickupLocation}</div>}
                              {aiParsedData.logistics.dropoffLocation && <div className="col-span-2"><span className="text-slate-500">Dropoff:</span> {aiParsedData.logistics.dropoffLocation}</div>}
                            </div>
                          </div>
                        )}

                        {aiParsedData?.notes && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</div>
                            <div className="text-xs text-slate-700">{aiParsedData.notes}</div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => { setAiParseStep('input'); setAiParsedData(null); }}
                          className="flex-1 py-3 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-xl"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleAiParseSubmit}
                          className="flex-1 py-3 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors rounded-xl"
                        >
                          Use This Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Service Type</label>
                      <select
                        value={dispatchServiceType}
                        onChange={(e) => setDispatchServiceType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                      >
                        <option value="FLIGHT">Aviation (Flight)</option>
                        <option value="HOTEL">Hotel</option>
                        <option value="LOGISTICS">Logistics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Client Name</label>
                      <ClientAutocomplete
                        value={dispatchClientName}
                        onChange={setDispatchClientName}
                        customers={customers}
                        onAddNewClient={() => {
                          setNewCustomerInitialName(dispatchClientName);
                          setShowAddCustomerModal(true);
                        }}
                        placeholder="e.g. Alice Johnson"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Target Date</label>
                      <input
                        type="date"
                        value={dispatchTargetDate}
                        onChange={(e) => setDispatchTargetDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                      />
                    </div>
                  </div>
                  {/* Service-Specific Fields */}
                  {dispatchServiceType === 'FLIGHT' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Origin</label>
                        <input
                          type="text"
                          value={dispatchOrigin}
                          onChange={(e) => setDispatchOrigin(e.target.value)}
                          placeholder="e.g. JFK, New York"
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Destination</label>
                        <input
                          type="text"
                          value={dispatchDestination}
                          onChange={(e) => setDispatchDestination(e.target.value)}
                          placeholder="e.g. LAX, Los Angeles"
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Depart Date</label>
                        <input
                          type="date"
                          value={dispatchDepartDate}
                          onChange={(e) => setDispatchDepartDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Return Date</label>
                        <input
                          type="date"
                          value={dispatchReturnDate}
                          onChange={(e) => setDispatchReturnDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  {dispatchServiceType === 'HOTEL' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Hotel / Location</label>
                        <input
                          type="text"
                          value={dispatchDestination}
                          onChange={(e) => setDispatchDestination(e.target.value)}
                          placeholder="e.g. Four Seasons NYC"
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Check-In Date</label>
                        <input
                          type="date"
                          value={dispatchDepartDate}
                          onChange={(e) => setDispatchDepartDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Check-Out Date</label>
                        <input
                          type="date"
                          value={dispatchReturnDate}
                          onChange={(e) => setDispatchReturnDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  {dispatchServiceType === 'LOGISTICS' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Pickup Location</label>
                        <input
                          type="text"
                          value={dispatchOrigin}
                          onChange={(e) => setDispatchOrigin(e.target.value)}
                          placeholder="e.g. JFK Airport"
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Dropoff Location</label>
                        <input
                          type="text"
                          value={dispatchDestination}
                          onChange={(e) => setDispatchDestination(e.target.value)}
                          placeholder="e.g. Four Seasons NYC"
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Service Date</label>
                        <input
                          type="date"
                          value={dispatchDepartDate}
                          onChange={(e) => setDispatchDepartDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Request Specifications</label>
                    <textarea
                      value={dispatchSpecs}
                      onChange={(e) => setDispatchSpecs(e.target.value)}
                      placeholder="Enter detailed flight numbers, hotel preferences, or special instructions..."
                      className="w-full p-3 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon resize-none rounded-xl min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDispatchPriority('NORMAL')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchPriority === 'NORMAL'
                            ? 'bg-paragon-gold text-slate-900'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchPriority('URGENT')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                          dispatchPriority === 'URGENT'
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
                    className="w-full py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-xl"
                  >
                    Submit Detailed Request
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            switch (deleteConfirm.type) {
              case 'request':
                onDeleteRequest?.(deleteConfirm.id);
                break;
              case 'flight':
                onDeleteFlight(deleteConfirm.id);
                break;
              case 'hotel':
                onDeleteHotel(deleteConfirm.id);
                break;
              case 'logistics':
                onDeleteLogistics(deleteConfirm.id);
                break;
            }
          }
        }}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Quick Add Customer Modal */}
      <QuickAddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onCustomerAdded={(newCustomer) => {
          setCustomers(prev => [...prev, newCustomer]);
          setDispatchClientName(newCustomer.name);
        }}
        initialName={newCustomerInitialName}
        agents={agents.map(a => ({ id: a.id, name: a.name }))}
        defaultAgentId={googleUser?.googleId || googleUser?.id || currentUser.id}
      />

      {/* Quick Add Vendor Modal */}
      <QuickAddVendorModal
        isOpen={showQuickAddVendorModal}
        onClose={() => {
          setShowQuickAddVendorModal(false);
          setQuickAddVendorInitialName('');
        }}
        onVendorAdded={(newVendor) => {
          // Extend the partial vendor to a full Vendor object
          const fullVendor: Vendor = {
            id: newVendor.id,
            name: newVendor.name,
            code: newVendor.code,
            type: quickAddVendorType,
            commissionPercent: newVendor.commissionPercent || 0,
            collectionMethod: 'OTHER',
            paymentFrequency: 'MONTHLY',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setVendors(prev => [...prev, fullVendor]);
          // Set the appropriate vendor field based on type
          if (quickAddVendorType === 'FLIGHT') {
            setFlightVendorId(newVendor.id);
            setFlightVendorName(newVendor.name);
          } else if (quickAddVendorType === 'HOTEL') {
            setHotelVendorId(newVendor.id);
            setHotelVendorName(newVendor.name);
          } else {
            setLogisticsVendorId(newVendor.id);
            setLogisticsVendorName(newVendor.name);
          }
        }}
        initialName={quickAddVendorInitialName}
        vendorType={quickAddVendorType}
      />
    </div>
  );
};

export default Operations;
