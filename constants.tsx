
import React from 'react';
import { 
  FlightElement, 
  HotelElement, 
  LogisticsElement, 
  ConciergeTrip, 
  ElementStatus, 
  TripStage,
  Transaction,
  User,
  BookingRequest,
  Announcement,
  Comment
} from './types';

export const COLORS = {
  TEAL: '#00668F',
  GOLD: '#C5A059',
  SLATE: '#1e293b'
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'James Sterling', role: 'ADMIN', email: 'j.sterling@paragon.com' },
  { id: 'u2', name: 'Elena Vance', role: 'SALES', email: 'e.vance@paragon.com' },
  { id: 'u3', name: 'Robert Finch', role: 'ACCOUNTING', email: 'r.finch@paragon.com' },
  { id: 'u4', name: 'Max Power', role: 'CLIENT', email: 'max@powercorp.com' }
];

export const MOCK_FLIGHTS: FlightElement[] = [
  {
    id: 'f1',
    type: 'FLIGHT',
    status: ElementStatus.TICKETED,
    ownership: 'DIRECT',
    pnr: 'XR7M8P',
    airlinePnr: 'LH1234',
    carrier: 'Lufthansa',
    segments: [{ from: 'JFK', to: 'FRA', departure: '2024-10-12T22:00', arrival: '2024-10-13T10:00', flightNo: 'LH401' }],
    passengers: ['Sterling/James MR'],
    cost: 8500,
    markup: 500,
    commission: 1200,
    ticketingStatus: 'OK/TKT',
    agentId: 'u2'
  }
];

export const MOCK_HOTELS: HotelElement[] = [
  {
    id: 'h1',
    type: 'HOTEL',
    status: ElementStatus.BOOKED,
    ownership: 'DIRECT',
    hotelName: 'Hôtel de Crillon',
    roomType: 'Les Grands Appartements',
    checkIn: '2024-10-14',
    checkOut: '2024-10-20',
    guests: ['Sterling/James MR'],
    cost: 12000,
    commission: 1200,
    supplier: 'Virtuoso',
    agentId: 'u2'
  }
];

export const MOCK_TRIPS: ConciergeTrip[] = [
  {
    id: 't1',
    name: 'Paris Autumn Gala 2024',
    stage: TripStage.PLANNING,
    ownership: 'DIRECT',
    clientId: 'u4',
    elements: ['f1', 'h1'],
    serviceFee: 2500,
    startDate: '2024-10-12',
    endDate: '2024-10-20',
    agentId: 'u2'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', date: '2024-05-20', description: 'Flight Payment - XR7M8P', amount: 9000, type: 'CREDIT', status: 'PENDING', category: 'Flights' },
  { id: 'tx2', date: '2024-05-21', description: 'Hotel Commission Expected', amount: 1200, type: 'DEBIT', status: 'REVIEWED', category: 'Commissions' }
];

export const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: 'req1',
    agentId: 'u2',
    clientId: 'u4',
    type: 'FLIGHT',
    status: 'PENDING',
    priority: 'URGENT',
    notes: 'Need heavy jet JFK-GVA tomorrow 9am',
    timestamp: '2024-05-22T08:00:00Z'
  },
  {
    id: 'req2',
    agentId: 'u2',
    clientId: 'u4',
    type: 'HOTEL',
    status: 'IN_REVIEW',
    priority: 'NORMAL',
    notes: 'Check for availability at Badrutt\'s Palace St. Moritz',
    timestamp: '2024-05-22T09:30:00Z'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Winter Season Capacity Warning', content: 'Swiss Alpine resorts reporting 95% occupancy for Christmas week. Confirm all Gstaad/St. Moritz inquiries within 2h.', priority: 'HIGH', author: 'James Sterling', date: '2024-05-22' },
  { id: 'a2', title: 'New Partner: VistaJet Integration', content: 'Our private aviation portal now features real-time empty leg availability from VistaJet. Check the ops dashboard.', priority: 'NORMAL', author: 'Elena Vance', date: '2024-05-21' }
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', authorId: 'u2', parentId: 'f1', text: 'Client requested vegetarian meal for this segment @u1', timestamp: '2024-05-22T10:00:00Z' },
  { id: 'c2', authorId: 'u1', parentId: 'f1', text: 'Confirmed with Lufthansa. Updated PNR notes.', timestamp: '2024-05-22T10:15:00Z' }
];
