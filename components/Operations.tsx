
import React, { useState } from 'react';
import { SectionHeader, DataTable, Badge } from './Shared';
import { MOCK_FLIGHTS, MOCK_HOTELS, MOCK_TRIPS, MOCK_USERS } from '../constants';
import { ElementStatus, BookingRequest, Comment, User, ConvertedFlight, ConvertedHotel, ConvertedLogistics } from '../types';
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
}

const Operations: React.FC<OperationsProps> = ({
  requests, comments, currentUser, onAddComment, onDeleteComment, googleUser,
  convertedFlights, convertedHotels, convertedLogistics,
  onConvertToFlight, onConvertToHotel, onConvertToLogistics,
  onUpdateFlight, onUpdateHotel, onUpdateLogistics,
  onDeleteFlight, onDeleteHotel, onDeleteLogistics
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
           <button className="bg-paragon text-white text-[10px] px-4 py-2 font-bold tracking-widest hover:bg-paragon-dark transition-colors">
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
            <div className="grid grid-cols-4 gap-4">
               {['Inquiry', 'Planning', 'Active', 'Post-Trip'].map((col, idx) => (
                <div key={idx} className="bg-slate-100 p-4 border-t-2 border-slate-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{col}</h4>
                    <span className="text-[10px] bg-white px-2 rounded-full border border-slate-200">{idx === 1 ? MOCK_TRIPS.length : 0}</span>
                  </div>
                  {idx === 1 && MOCK_TRIPS.map(t => (
                    <div key={t.id} 
                      onClick={() => setSelectedElementId(t.id)}
                      className={`bg-white p-4 border border-slate-200 shadow-sm mb-3 rounded-sm cursor-pointer hover:border-paragon transition-colors ${selectedElementId === t.id ? 'ring-2 ring-paragon border-transparent' : ''}`}
                    >
                      <h5 className="font-cinzel text-xs font-bold mb-2">{t.name}</h5>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{t.startDate}</span>
                        <Badge color="teal">{t.ownership}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedElementId && (
          <div className="col-span-4 sticky top-20 h-fit">
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-lg animate-in slide-in-from-right-4 duration-300">
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeConvertModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
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
    </div>
  );
};

export default Operations;
