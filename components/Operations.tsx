
import React, { useState } from 'react';
import { SectionHeader, DataTable, Badge } from './Shared';
import { MOCK_FLIGHTS, MOCK_HOTELS, MOCK_TRIPS, MOCK_USERS } from '../constants';
import { ElementStatus, BookingRequest, Comment, User, ConvertedFlight, ConvertedHotel, ConvertedLogistics, PipelineTrip, PipelineStage, PipelineTask } from '../types';
import Comments from './Comments';
import { GoogleUser } from './Login';

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
}

const Operations: React.FC<OperationsProps> = ({
  requests, comments, currentUser, onAddComment, onDeleteComment, googleUser,
  convertedFlights, convertedHotels, convertedLogistics,
  onConvertToFlight, onConvertToHotel, onConvertToLogistics,
  onUpdateFlight, onUpdateHotel, onUpdateLogistics,
  onDeleteFlight, onDeleteHotel, onDeleteLogistics,
  pipelineTrips, onAddPipelineTrip, onUpdatePipelineTrip, onDeletePipelineTrip,
  onAddRequest
}) => {
  const [subTab, setSubTab] = useState('flights');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

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
  const [flightProfitLoss, setFlightProfitLoss] = useState(0);
  const [flightStatus, setFlightStatus] = useState<'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED'>('PENDING');

  // Hotel form state
  const [hotelDescription, setHotelDescription] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelPaymentStatus, setHotelPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [hotelConfirmation, setHotelConfirmation] = useState('');
  const [hotelRoomType, setHotelRoomType] = useState('');
  const [hotelGuestCount, setHotelGuestCount] = useState(1);
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelAgent, setHotelAgent] = useState('');
  const [hotelProfitLoss, setHotelProfitLoss] = useState(0);
  const [hotelStatus, setHotelStatus] = useState<'PENDING' | 'CONFIRMED' | 'CANCELLED'>('PENDING');

  // Logistics form state
  const [logisticsDescription, setLogisticsDescription] = useState('');
  const [logisticsServiceType, setLogisticsServiceType] = useState('');
  const [logisticsPaymentStatus, setLogisticsPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [logisticsConfirmation, setLogisticsConfirmation] = useState('');
  const [logisticsDetails, setLogisticsDetails] = useState('');
  const [logisticsDate, setLogisticsDate] = useState('');
  const [logisticsAgent, setLogisticsAgent] = useState('');
  const [logisticsProfitLoss, setLogisticsProfitLoss] = useState(0);
  const [logisticsStatus, setLogisticsStatus] = useState<'PENDING' | 'CONFIRMED' | 'CANCELLED'>('PENDING');

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
  const [dispatchMode, setDispatchMode] = useState<'QUICK' | 'DETAIL'>('QUICK');
  const [dispatchSnippet, setDispatchSnippet] = useState('');
  const [dispatchServiceType, setDispatchServiceType] = useState<'FLIGHT' | 'HOTEL' | 'LOGISTICS'>('FLIGHT');
  const [dispatchClientName, setDispatchClientName] = useState('');
  const [dispatchTargetDate, setDispatchTargetDate] = useState('');
  const [dispatchSpecs, setDispatchSpecs] = useState('');
  const [dispatchPriority, setDispatchPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  const closeDispatchModal = () => {
    setShowDispatchModal(false);
    setDispatchMode('QUICK');
    setDispatchSnippet('');
    setDispatchServiceType('FLIGHT');
    setDispatchClientName('');
    setDispatchTargetDate('');
    setDispatchSpecs('');
    setDispatchPriority('NORMAL');
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRequest) return;

    const agentId = googleUser?.id || currentUser.id;
    const agentName = googleUser?.name || currentUser.name;

    if (dispatchMode === 'QUICK') {
      if (!dispatchSnippet.trim()) return;
      onAddRequest({
        agentId,
        clientId: '',
        type: 'GENERAL',
        status: 'PENDING',
        priority: dispatchPriority,
        notes: dispatchSnippet,
        timestamp: new Date().toISOString(),
        details: { agentName }
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
          agentName
        }
      });
    }
    closeDispatchModal();
  };

  const openConvertModal = (request: BookingRequest) => {
    setConvertingRequest(request);
    // Pre-fill some fields based on request data
    const clientName = request.details?.clientName || '';
    if (request.type === 'FLIGHT') {
      setFlightDescription(clientName ? `${clientName}-` : '');
      setFlightAgent('');
    } else if (request.type === 'HOTEL') {
      setHotelDescription(clientName ? `${clientName}-` : '');
      setHotelAgent('');
    } else {
      setLogisticsDescription(clientName || '');
      setLogisticsAgent('');
    }
    setShowConvertModal(true);
  };

  const closeConvertModal = () => {
    setShowConvertModal(false);
    setConvertingRequest(null);
    // Reset all form fields
    setFlightDescription(''); setFlightAirline(''); setFlightPaymentStatus('UNPAID');
    setFlightPnr(''); setFlightRoutes(''); setFlightPassengerCount(1);
    setFlightDates(''); setFlightAgent(''); setFlightProfitLoss(0); setFlightStatus('PENDING');
    setHotelDescription(''); setHotelName(''); setHotelPaymentStatus('UNPAID');
    setHotelConfirmation(''); setHotelRoomType(''); setHotelGuestCount(1);
    setHotelCheckIn(''); setHotelCheckOut(''); setHotelAgent(''); setHotelProfitLoss(0); setHotelStatus('PENDING');
    setLogisticsDescription(''); setLogisticsServiceType(''); setLogisticsPaymentStatus('UNPAID');
    setLogisticsConfirmation(''); setLogisticsDetails(''); setLogisticsDate('');
    setLogisticsAgent(''); setLogisticsProfitLoss(0); setLogisticsStatus('PENDING');
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
        profitLoss: flightProfitLoss,
        status: flightStatus,
        createdAt: new Date().toISOString(),
        originalRequestId: convertingRequest.id
      };
      onConvertToFlight(newFlight, convertingRequest.id);
    } else if (convertingRequest.type === 'HOTEL') {
      const newHotel: ConvertedHotel = {
        id: `ch-${Date.now()}`,
        description: hotelDescription,
        hotelName: hotelName,
        paymentStatus: hotelPaymentStatus,
        confirmationNumber: hotelConfirmation,
        roomType: hotelRoomType,
        guestCount: hotelGuestCount,
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        agent: hotelAgent,
        profitLoss: hotelProfitLoss,
        status: hotelStatus,
        createdAt: new Date().toISOString(),
        originalRequestId: convertingRequest.id
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
        profitLoss: logisticsProfitLoss,
        status: logisticsStatus,
        createdAt: new Date().toISOString(),
        originalRequestId: convertingRequest.id
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
        setFlightProfitLoss(flight.profitLoss);
        setFlightStatus(flight.status);
      }
    } else if (type === 'hotel') {
      const hotel = convertedHotels.find(h => h.id === id);
      if (hotel) {
        setHotelDescription(hotel.description);
        setHotelName(hotel.hotelName);
        setHotelPaymentStatus(hotel.paymentStatus);
        setHotelConfirmation(hotel.confirmationNumber);
        setHotelRoomType(hotel.roomType);
        setHotelGuestCount(hotel.guestCount);
        setHotelCheckIn(hotel.checkIn);
        setHotelCheckOut(hotel.checkOut);
        setHotelAgent(hotel.agent);
        setHotelProfitLoss(hotel.profitLoss);
        setHotelStatus(hotel.status);
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
        setLogisticsProfitLoss(logistics.profitLoss);
        setLogisticsStatus(logistics.status);
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
    setFlightDates(''); setFlightAgent(''); setFlightProfitLoss(0); setFlightStatus('PENDING');
    setHotelDescription(''); setHotelName(''); setHotelPaymentStatus('UNPAID');
    setHotelConfirmation(''); setHotelRoomType(''); setHotelGuestCount(1);
    setHotelCheckIn(''); setHotelCheckOut(''); setHotelAgent(''); setHotelProfitLoss(0); setHotelStatus('PENDING');
    setLogisticsDescription(''); setLogisticsServiceType(''); setLogisticsPaymentStatus('UNPAID');
    setLogisticsConfirmation(''); setLogisticsDetails(''); setLogisticsDate('');
    setLogisticsAgent(''); setLogisticsProfitLoss(0); setLogisticsStatus('PENDING');
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
        profitLoss: flightProfitLoss,
        status: flightStatus
      });
    } else if (editingItem.type === 'hotel') {
      onUpdateHotel(editingItem.id, {
        description: hotelDescription,
        hotelName: hotelName,
        paymentStatus: hotelPaymentStatus,
        confirmationNumber: hotelConfirmation,
        roomType: hotelRoomType,
        guestCount: hotelGuestCount,
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        agent: hotelAgent,
        profitLoss: hotelProfitLoss,
        status: hotelStatus
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
        profitLoss: logisticsProfitLoss,
        status: logisticsStatus
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
    { id: 'trips', label: 'CONCIERGE TRIPS' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setSubTab(t.id); setSelectedElementId(null); }}
              className={`pb-4 text-xs font-bold tracking-widest transition-all ${
                subTab === t.id 
                  ? 'text-paragon border-b-2 border-paragon' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pb-3 flex gap-2">
           <div className="relative">
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">{requests.filter(r => r.status === 'PENDING').length}</span>
              <button onClick={() => setSubTab('pending')} className="bg-slate-100 text-slate-600 text-[10px] px-4 py-2 font-bold tracking-widest hover:bg-slate-200 transition-colors">
                PENDING REQS
              </button>
           </div>
           <button
             onClick={() => setShowDispatchModal(true)}
             className="bg-paragon text-white text-[10px] px-4 py-2 font-bold tracking-widest hover:bg-paragon-dark transition-colors"
           >
             NEW ELEMENT +
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className={selectedElementId ? 'col-span-8' : 'col-span-12'}>
          {subTab === 'flights' && (
            <div>
              <SectionHeader title="Global Flight Operations" subtitle="Manage commercial and private jet inventory." />

              {/* Converted Flights */}
              {convertedFlights.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Completed Bookings</h4>
                  <DataTable headers={['Status', 'Description', 'Airline', 'PNR', 'Flights', 'Pax', 'Agent', 'P/L', 'Payment', 'Action']}>
                    {convertedFlights.map(f => (
                      <tr key={f.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === f.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(f.id)}>
                        <td className="px-4 py-3">
                          <Badge color={f.status === 'TICKETED' ? 'teal' : f.status === 'CONFIRMED' ? 'gold' : f.status === 'CANCELLED' ? 'red' : 'slate'}>
                            {f.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-bold">{f.description}</td>
                        <td className="px-4 py-3">{f.airline}</td>
                        <td className="px-4 py-3 font-mono text-paragon font-bold">{f.pnr}</td>
                        <td className="px-4 py-3">{f.flights}</td>
                        <td className="px-4 py-3">{f.passengerCount}</td>
                        <td className="px-4 py-3 font-semibold">{f.agent}</td>
                        <td className={`px-4 py-3 font-bold ${f.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${f.profitLoss.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={f.paymentStatus === 'PAID' ? 'teal' : 'red'}>{f.paymentStatus}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal('flight', f.id); }}
                            className="text-[10px] text-slate-400 font-bold hover:text-paragon"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteFlight(f.id); }}
                            className="text-[10px] text-red-400 font-bold hover:text-red-600"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              )}

              {/* Mock Flights (Original) */}
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Existing Inventory</h4>
              <DataTable headers={['Status', 'Carrier', 'PNR', 'Segments', 'Pax', 'Total Cost', 'Action']}>
                {MOCK_FLIGHTS.map(f => (
                  <tr key={f.id} className={`hover:bg-slate-50 group cursor-pointer ${selectedElementId === f.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(f.id)}>
                    <td className="px-4 py-3"><Badge color={f.status === ElementStatus.TICKETED ? 'teal' : 'gold'}>{f.status}</Badge></td>
                    <td className="px-4 py-3 font-bold">{f.carrier}</td>
                    <td className="px-4 py-3 font-mono text-paragon font-bold underline">{f.pnr}</td>
                    <td className="px-4 py-3">
                      {f.segments.map((s, i) => (
                        <div key={i}>{s.from} → {s.to} ({s.flightNo})</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 italic truncate max-w-[150px]">{f.passengers.join(', ')}</td>
                    <td className="px-4 py-3 font-bold">${f.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[10px] text-slate-400 font-bold hover:text-paragon">VIEW</button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {subTab === 'hotels' && (
            <div>
              <SectionHeader title="Hotel Portfolio Management" />

              {/* Converted Hotels */}
              {convertedHotels.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Completed Bookings</h4>
                  <DataTable headers={['Status', 'Description', 'Hotel', 'Room', 'Dates', 'Guests', 'Agent', 'P/L', 'Payment', 'Action']}>
                    {convertedHotels.map(h => (
                      <tr key={h.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === h.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(h.id)}>
                        <td className="px-4 py-3">
                          <Badge color={h.status === 'CONFIRMED' ? 'teal' : h.status === 'CANCELLED' ? 'red' : 'slate'}>
                            {h.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-bold">{h.description}</td>
                        <td className="px-4 py-3">{h.hotelName}</td>
                        <td className="px-4 py-3">{h.roomType}</td>
                        <td className="px-4 py-3">{h.checkIn} — {h.checkOut}</td>
                        <td className="px-4 py-3">{h.guestCount}</td>
                        <td className="px-4 py-3 font-semibold">{h.agent}</td>
                        <td className={`px-4 py-3 font-bold ${h.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${h.profitLoss.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={h.paymentStatus === 'PAID' ? 'teal' : 'red'}>{h.paymentStatus}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal('hotel', h.id); }}
                            className="text-[10px] text-slate-400 font-bold hover:text-paragon"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteHotel(h.id); }}
                            className="text-[10px] text-red-400 font-bold hover:text-red-600"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              )}

              {/* Mock Hotels (Original) */}
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Existing Inventory</h4>
              <DataTable headers={['Status', 'Hotel', 'Room Type', 'Dates', 'Cost', 'Action']}>
                {MOCK_HOTELS.map(h => (
                  <tr key={h.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === h.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(h.id)}>
                    <td className="px-4 py-3"><Badge color="gold">{h.status}</Badge></td>
                    <td className="px-4 py-3 font-bold">{h.hotelName}</td>
                    <td className="px-4 py-3">{h.roomType}</td>
                    <td className="px-4 py-3">{h.checkIn} — {h.checkOut}</td>
                    <td className="px-4 py-3 font-bold">${h.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[10px] text-slate-400 font-bold hover:text-paragon">VIEW</button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {subTab === 'logistics' && (
            <div>
              <SectionHeader title="Logistics & Ground Transportation" subtitle="Manage transfers, car services, and other logistics." />

              {/* Converted Logistics */}
              {convertedLogistics.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Completed Bookings</h4>
                  <DataTable headers={['Status', 'Description', 'Service', 'Details', 'Date', 'Agent', 'P/L', 'Payment', 'Action']}>
                    {convertedLogistics.map(l => (
                      <tr key={l.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === l.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(l.id)}>
                        <td className="px-4 py-3">
                          <Badge color={l.status === 'CONFIRMED' ? 'teal' : l.status === 'CANCELLED' ? 'red' : 'slate'}>
                            {l.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-bold">{l.description}</td>
                        <td className="px-4 py-3">{l.serviceType}</td>
                        <td className="px-4 py-3 italic truncate max-w-[200px]">{l.details}</td>
                        <td className="px-4 py-3">{l.date}</td>
                        <td className="px-4 py-3 font-semibold">{l.agent}</td>
                        <td className={`px-4 py-3 font-bold ${l.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${l.profitLoss.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={l.paymentStatus === 'PAID' ? 'teal' : 'red'}>{l.paymentStatus}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal('logistics', l.id); }}
                            className="text-[10px] text-slate-400 font-bold hover:text-paragon"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteLogistics(l.id); }}
                            className="text-[10px] text-red-400 font-bold hover:text-red-600"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              )}

              {/* Placeholder for existing logistics */}
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">No existing logistics inventory</p>
                <p className="text-xs mt-1">Complete pending requests to add logistics here</p>
              </div>
            </div>
          )}

          {subTab === 'pending' && (
            <div>
              <SectionHeader title="Pending Requests" />
              <DataTable headers={['Recd', 'Client', 'Type', 'Target Date', 'Notes', 'Agent', 'Priority', 'Action']}>
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
                  // Get client name from details field or fall back to looking up clientId
                  const clientName = r.details?.clientName || MOCK_USERS.find(u => u.id === r.clientId)?.name || '—';
                  const targetDate = r.details?.targetDate ? new Date(r.details.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                  // Get agent name from details (for Google users) or fall back to mock user lookup
                  const agentName = r.details?.agentName || (googleUser && r.agentId === googleUser.id ? googleUser.name : (MOCK_USERS.find(u => u.id === r.agentId)?.name || 'Unknown'));

                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 cursor-pointer ${selectedElementId === r.id ? 'bg-paragon-light/30' : ''}`} onClick={() => setSelectedElementId(r.id)}>
                      <td className="px-4 py-3">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 font-bold">{clientName}</td>
                      <td className="px-4 py-3"><Badge color={r.type === 'FLIGHT' ? 'red' : r.type === 'HOTEL' ? 'gold' : 'slate'}>{r.type}</Badge></td>
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
                      </td>
                    </tr>
                  );
                })}
              </DataTable>
            </div>
          )}
          
          {subTab === 'trips' && (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-slate-900 tracking-wide">Concierge Command</h2>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Unified Operational Control</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openPipelineModal()}
                    className="bg-paragon text-white text-[10px] px-5 py-2.5 font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                  >
                    Request New Booking
                  </button>
                  <button className="bg-slate-800 text-white text-[10px] px-4 py-2.5 font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors rounded-sm">
                    Pipeline
                  </button>
                  <button className="bg-slate-100 text-slate-500 text-[10px] px-4 py-2.5 font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm">
                    External Sync
                  </button>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-4 gap-4">
                {pipelineStages.map(stage => {
                  const stageTrips = pipelineTrips.filter(t => t.stage === stage.id);
                  return (
                    <div
                      key={stage.id}
                      className={`bg-slate-100 p-4 border-t-4 ${stage.color} rounded-sm min-h-[500px] transition-colors ${dragOverStage === stage.id ? 'bg-slate-200 ring-2 ring-paragon ring-opacity-50' : ''}`}
                      onDragOver={(e) => handleDragOver(e, stage.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage.id)}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{stage.label}</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold">{stageTrips.length}</span>
                      </div>

                      {/* Trip Cards */}
                      <div className="space-y-3">
                        {stageTrips.map(trip => (
                          <div
                            key={trip.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, trip.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setViewingTrip(trip)}
                            className={`bg-white p-4 border border-slate-200 shadow-sm rounded-sm cursor-grab hover:border-paragon transition-all ${selectedElementId === trip.id ? 'ring-2 ring-paragon border-transparent' : ''} ${draggingTripId === trip.id ? 'opacity-50 cursor-grabbing' : ''}`}
                          >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-xs text-slate-900 leading-tight pr-2">{trip.name}</h5>
                              {trip.isUrgent && (
                                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1"></span>
                              )}
                            </div>

                            {/* Client Name */}
                            <p className="text-[10px] text-slate-500 mb-3">{trip.clientName}</p>

                            {/* Service Icons */}
                            <div className="flex gap-2 mb-3">
                              {trip.hasFlights && (
                                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center" title="Flights">
                                  <svg className="w-3.5 h-3.5 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                </span>
                              )}
                              {trip.hasHotels && (
                                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center" title="Hotels">
                                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </span>
                              )}
                              {trip.hasLogistics && (
                                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center" title="Logistics">
                                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </span>
                              )}
                            </div>

                            {/* Tasks Preview */}
                            {trip.tasks.length > 0 && (
                              <div className="border-t border-slate-100 pt-2 mt-2">
                                <div className="space-y-1">
                                  {trip.tasks.slice(0, 3).map(task => (
                                    <div
                                      key={task.id}
                                      onClick={(e) => { e.stopPropagation(); handleQuickToggleTask(trip.id, task.id); }}
                                      className="flex items-center gap-2 group"
                                    >
                                      <div className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center cursor-pointer ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}>
                                        {task.completed && (
                                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-[9px] ${task.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{task.text}</span>
                                    </div>
                                  ))}
                                  {trip.tasks.length > 3 && (
                                    <p className="text-[8px] text-slate-400 pl-5">+{trip.tasks.length - 3} more tasks</p>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                        ))}

                        {/* Add New Card Button */}
                        <button
                          onClick={() => openPipelineModal(undefined, stage.id)}
                          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-sm text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:border-paragon hover:text-paragon transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selectedElementId && (
          <div className="col-span-4 sticky top-20 h-fit">
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-lg animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Collaboration Panel</h3>
                 <button onClick={() => setSelectedElementId(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
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
      </div>

      {/* Convert Modal */}
      {showConvertModal && convertingRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeConvertModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Complete {convertingRequest.type} Request
                </h2>
                <button onClick={closeConvertModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Fill in the details to complete this booking</p>
            </div>

            <div className="p-6">
              {/* Flight Form */}
              {convertingRequest.type === 'FLIGHT' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (LastName-FlightNo)</label>
                      <input
                        type="text"
                        value={flightDescription}
                        onChange={(e) => setFlightDescription(e.target.value)}
                        placeholder="Smith-AA123"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Airline</label>
                      <input
                        type="text"
                        value={flightAirline}
                        onChange={(e) => setFlightAirline(e.target.value)}
                        placeholder="American Airlines"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={flightPaymentStatus}
                        onChange={(e) => setFlightPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Passenger #</label>
                      <input
                        type="number"
                        min="1"
                        value={flightPassengerCount}
                        onChange={(e) => setFlightPassengerCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dates</label>
                      <input
                        type="text"
                        value={flightDates}
                        onChange={(e) => setFlightDates(e.target.value)}
                        placeholder="Jan 15 - Jan 20"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <input
                        type="text"
                        value={flightAgent}
                        onChange={(e) => setFlightAgent(e.target.value)}
                        placeholder="Enter agent name"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={flightProfitLoss}
                        onChange={(e) => setFlightProfitLoss(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select
                      value={flightStatus}
                      onChange={(e) => setFlightStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED')}
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="TICKETED">Ticketed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Hotel Form */}
              {convertingRequest.type === 'HOTEL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (LastName-Hotel)</label>
                      <input
                        type="text"
                        value={hotelDescription}
                        onChange={(e) => setHotelDescription(e.target.value)}
                        placeholder="Smith-RitzCarlton"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hotel Name</label>
                      <input
                        type="text"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        placeholder="The Ritz-Carlton"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={hotelPaymentStatus}
                        onChange={(e) => setHotelPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room Type</label>
                      <input
                        type="text"
                        value={hotelRoomType}
                        onChange={(e) => setHotelRoomType(e.target.value)}
                        placeholder="Deluxe Suite"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest #</label>
                      <input
                        type="number"
                        min="1"
                        value={hotelGuestCount}
                        onChange={(e) => setHotelGuestCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-In</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-Out</label>
                      <input
                        type="date"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        min={hotelCheckIn || new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <input
                        type="text"
                        value={hotelAgent}
                        onChange={(e) => setHotelAgent(e.target.value)}
                        placeholder="Enter agent name"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={hotelProfitLoss}
                        onChange={(e) => setHotelProfitLoss(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select
                      value={hotelStatus}
                      onChange={(e) => setHotelStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Logistics / General Form */}
              {(convertingRequest.type === 'LOGISTICS' || convertingRequest.type === 'GENERAL') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={logisticsDescription}
                        onChange={(e) => setLogisticsDescription(e.target.value)}
                        placeholder="Smith-Transfer"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Type</label>
                      <input
                        type="text"
                        value={logisticsServiceType}
                        onChange={(e) => setLogisticsServiceType(e.target.value)}
                        placeholder="Car Service, Transfer, etc."
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={logisticsPaymentStatus}
                        onChange={(e) => setLogisticsPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={logisticsDate}
                        onChange={(e) => setLogisticsDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <input
                        type="text"
                        value={logisticsAgent}
                        onChange={(e) => setLogisticsAgent(e.target.value)}
                        placeholder="Enter agent name"
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={logisticsProfitLoss}
                        onChange={(e) => setLogisticsProfitLoss(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={logisticsStatus}
                        onChange={(e) => setLogisticsStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={closeConvertModal}
                className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitConvert}
                className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
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
            className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}
                </h2>
                <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <div className="p-6">
              {/* Flight Edit Form */}
              {editingItem.type === 'flight' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={flightDescription}
                        onChange={(e) => setFlightDescription(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Airline</label>
                      <input
                        type="text"
                        value={flightAirline}
                        onChange={(e) => setFlightAirline(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={flightPaymentStatus}
                        onChange={(e) => setFlightPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Flights (Routes)</label>
                    <input
                      type="text"
                      value={flightRoutes}
                      onChange={(e) => setFlightRoutes(e.target.value)}
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Passenger #</label>
                      <input
                        type="number"
                        min="1"
                        value={flightPassengerCount}
                        onChange={(e) => setFlightPassengerCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dates</label>
                      <input
                        type="text"
                        value={flightDates}
                        onChange={(e) => setFlightDates(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <input
                        type="text"
                        value={flightAgent}
                        onChange={(e) => setFlightAgent(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={flightProfitLoss}
                        onChange={(e) => setFlightProfitLoss(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select
                      value={flightStatus}
                      onChange={(e) => setFlightStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED')}
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="TICKETED">Ticketed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Hotel Edit Form */}
              {editingItem.type === 'hotel' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={hotelDescription}
                        onChange={(e) => setHotelDescription(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hotel Name</label>
                      <input
                        type="text"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={hotelPaymentStatus}
                        onChange={(e) => setHotelPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room Type</label>
                      <input
                        type="text"
                        value={hotelRoomType}
                        onChange={(e) => setHotelRoomType(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest #</label>
                      <input
                        type="number"
                        min="1"
                        value={hotelGuestCount}
                        onChange={(e) => setHotelGuestCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-In</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-Out</label>
                      <input
                        type="date"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <input
                        type="text"
                        value={hotelAgent}
                        onChange={(e) => setHotelAgent(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={hotelProfitLoss}
                        onChange={(e) => setHotelProfitLoss(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select
                      value={hotelStatus}
                      onChange={(e) => setHotelStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Logistics Edit Form */}
              {editingItem.type === 'logistics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={logisticsDescription}
                        onChange={(e) => setLogisticsDescription(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Type</label>
                      <input
                        type="text"
                        value={logisticsServiceType}
                        onChange={(e) => setLogisticsServiceType(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                      <select
                        value={logisticsPaymentStatus}
                        onChange={(e) => setLogisticsPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
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
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Details</label>
                    <textarea
                      value={logisticsDetails}
                      onChange={(e) => setLogisticsDetails(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={logisticsDate}
                        onChange={(e) => setLogisticsDate(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                      <input
                        type="text"
                        value={logisticsAgent}
                        onChange={(e) => setLogisticsAgent(e.target.value)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profit/Loss ($)</label>
                      <input
                        type="number"
                        value={logisticsProfitLoss}
                        onChange={(e) => setLogisticsProfitLoss(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                      <select
                        value={logisticsStatus}
                        onChange={(e) => setLogisticsStatus(e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                        className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Trip Modal */}
      {showPipelineModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closePipelineModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  {editingTrip ? 'Edit Trip' : 'New Booking Request'}
                </h2>
                <button onClick={closePipelineModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {editingTrip ? 'Update the trip details below' : 'Create a new prospect or trip in the pipeline'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trip Name *</label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Paris Anniversary Trip"
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={tripClientName}
                    onChange={(e) => setTripClientName(e.target.value)}
                    placeholder="e.g. Alice Johnson"
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stage</label>
                  <select
                    value={tripStage}
                    onChange={(e) => setTripStage(e.target.value as PipelineStage)}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  >
                    <option value="NEW">New</option>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FINALIZING">Finalizing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                  <input
                    type="text"
                    value={tripAgent}
                    onChange={(e) => setTripAgent(e.target.value)}
                    placeholder="Agent name"
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={tripEndDate}
                    onChange={(e) => setTripEndDate(e.target.value)}
                    min={tripStartDate}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              {/* Services & Priority */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Services Required</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripHasFlights}
                      onChange={(e) => setTripHasFlights(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
                    />
                    <span className="text-xs text-slate-600">Flights</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripHasHotels}
                      onChange={(e) => setTripHasHotels(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
                    />
                    <span className="text-xs text-slate-600">Hotels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripHasLogistics}
                      onChange={(e) => setTripHasLogistics(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
                    />
                    <span className="text-xs text-slate-600">Logistics / Transfers</span>
                  </label>
                  <div className="w-px bg-slate-200 mx-2"></div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripIsUrgent}
                      onChange={(e) => setTripIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs text-red-600 font-semibold">Urgent</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  placeholder="Additional details, preferences, or requirements..."
                  rows={3}
                  className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                />
              </div>

              {/* Tasks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Tasks</label>
                <div className="space-y-2 mb-3">
                  {tripTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 group">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}
                      >
                        {task.completed && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-xs flex-1 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                    placeholder="Add a task..."
                    className="flex-1 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-between">
              <div>
                {editingTrip && (
                  <button
                    onClick={() => { onDeletePipelineTrip(editingTrip.id); closePipelineModal(); }}
                    className="px-4 py-2 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-sm"
                  >
                    Delete Trip
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closePipelineModal}
                  className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPipelineTrip}
                  disabled={!tripName.trim() || !tripClientName.trim()}
                  className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTrip ? 'Save Changes' : 'Create Trip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Trip Modal */}
      {viewingTrip && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setViewingTrip(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
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
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-sm ${
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
                      <p className="text-sm text-slate-900">{new Date(viewingTrip.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingTrip.endDate && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                      <p className="text-sm text-slate-900">{new Date(viewingTrip.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Services */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Services</label>
                <div className="flex gap-3">
                  {viewingTrip.hasFlights && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-sm">
                      <svg className="w-4 h-4 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Flights</span>
                    </div>
                  )}
                  {viewingTrip.hasHotels && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-sm">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Hotels</span>
                    </div>
                  )}
                  {viewingTrip.hasLogistics && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-sm">
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
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-sm">{viewingTrip.notes}</p>
                </div>
              )}

              {/* Tasks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Tasks ({viewingTrip.tasks.filter(t => t.completed).length}/{viewingTrip.tasks.length} completed)
                </label>
                {viewingTrip.tasks.length > 0 ? (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-sm">
                    {viewingTrip.tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleQuickToggleTask(viewingTrip.id, task.id)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 group-hover:border-paragon'}`}>
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
                className="px-4 py-2 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-sm"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingTrip(null)}
                  className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => { openPipelineModal(viewingTrip); setViewingTrip(null); }}
                  className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
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
            className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-zoomIn"
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
              <div className="flex border border-slate-200 rounded-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDispatchMode('QUICK')}
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
                  onClick={() => setDispatchMode('DETAIL')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    dispatchMode === 'DETAIL'
                      ? 'bg-paragon text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Detailed Request
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 flex-1 flex flex-col overflow-hidden">
              {dispatchMode === 'QUICK' ? (
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={dispatchSnippet}
                    onChange={(e) => setDispatchSnippet(e.target.value)}
                    placeholder="Paste a request snippet, PNR, or client note here..."
                    className="w-full flex-1 p-4 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none min-h-[150px]"
                    required
                  />
                  <div className="mt-4 flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDispatchPriority('NORMAL')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
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
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
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
                    className="mt-4 w-full py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                  >
                    Submit Request
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="grid grid-cols-3 gap-4 flex-shrink-0">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Service Type</label>
                      <select
                        value={dispatchServiceType}
                        onChange={(e) => setDispatchServiceType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-sm"
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
                        value={dispatchClientName}
                        onChange={(e) => setDispatchClientName(e.target.value)}
                        placeholder="e.g. Alice Johnson"
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-sm"
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
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex-shrink-0">Request Specifications</label>
                    <textarea
                      value={dispatchSpecs}
                      onChange={(e) => setDispatchSpecs(e.target.value)}
                      placeholder="Enter detailed flight numbers, hotel preferences, or special instructions..."
                      className="w-full flex-1 p-3 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon resize-none rounded-sm min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDispatchPriority('NORMAL')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
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
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
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
                    className="w-full py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                  >
                    Submit Detailed Request
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
