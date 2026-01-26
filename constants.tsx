
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
  Comment,
  Customer
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

export const MOCK_CUSTOMERS: Customer[] = [
  // Primary Customer 1 - Ushi Wittels
  {
    id: 'cust-1',
    legalFirstName: 'Yehoshua',
    legalLastName: 'Wittels',
    displayName: 'Ushi Wittels',
    dateOfBirth: '1975-03-15',
    email: 'ushi@wittelsgroup.com',
    phone: '+1 212-555-0101',
    passportNumber: '123456789',
    passportExpiry: '2028-06-20',
    passportCountry: 'USA',
    loyaltyPrograms: [
      { program: 'United MileagePlus', number: 'MP123456789', status: '1K' },
      { program: 'Marriott Bonvoy', number: 'MB987654321', status: 'Titanium' },
      { program: 'American Express Centurion', number: 'AMEX-001', status: 'Black' }
    ],
    preferences: {
      seatPreference: 'aisle',
      dietaryRestrictions: ['Kosher'],
      hotelPreferences: 'High floor, king bed, quiet room away from elevator',
      specialRequests: 'Always arrange ground transportation'
    },
    notes: 'VIP client. Prefers direct communication via WhatsApp. Very particular about flight times - no red-eyes.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-05-20T14:30:00Z'
  },
  // Sub-customer under Ushi
  {
    id: 'cust-2',
    legalFirstName: 'Olivia',
    legalLastName: 'Wittels',
    displayName: 'Olivia Wittels',
    dateOfBirth: '1978-08-22',
    email: 'olivia@wittelsgroup.com',
    phone: '+1 212-555-0102',
    primaryCustomerId: 'cust-1', // Linked to Ushi
    passportNumber: '987654321',
    passportExpiry: '2027-09-15',
    passportCountry: 'USA',
    loyaltyPrograms: [
      { program: 'United MileagePlus', number: 'MP987654321', status: 'Gold' }
    ],
    preferences: {
      seatPreference: 'window',
      dietaryRestrictions: ['Kosher', 'Gluten-free'],
      hotelPreferences: 'Prefer suite with bathtub',
      specialRequests: ''
    },
    notes: 'Wife of Ushi. Often travels separately for personal trips.',
    createdAt: '2024-01-15T10:05:00Z',
    updatedAt: '2024-03-10T09:00:00Z'
  },
  // Another sub-customer under Ushi (child)
  {
    id: 'cust-3',
    legalFirstName: 'David',
    legalLastName: 'Wittels',
    displayName: 'David Wittels',
    dateOfBirth: '2005-11-30',
    primaryCustomerId: 'cust-1', // Linked to Ushi
    passportNumber: '456789123',
    passportExpiry: '2029-02-28',
    passportCountry: 'USA',
    preferences: {
      seatPreference: 'window',
      dietaryRestrictions: ['Kosher'],
    },
    notes: 'Son. College student - travels during breaks.',
    createdAt: '2024-01-15T10:10:00Z',
    updatedAt: '2024-01-15T10:10:00Z'
  },
  // Primary Customer 2
  {
    id: 'cust-4',
    legalFirstName: 'Marcus',
    legalLastName: 'Chen',
    displayName: 'Marcus Chen',
    dateOfBirth: '1982-07-04',
    email: 'marcus@chencapital.com',
    phone: '+1 415-555-0200',
    passportNumber: '111222333',
    passportExpiry: '2026-12-01',
    passportCountry: 'USA',
    loyaltyPrograms: [
      { program: 'Delta SkyMiles', number: 'DL555666777', status: 'Diamond' },
      { program: 'Hyatt Globalist', number: 'HY123123', status: 'Globalist' }
    ],
    preferences: {
      seatPreference: 'aisle',
      dietaryRestrictions: [],
      hotelPreferences: 'Prefers boutique hotels over large chains',
      specialRequests: 'Early check-in whenever possible'
    },
    notes: 'Tech investor. Frequent last-minute travel. Budget is not a concern.',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-05-18T11:00:00Z'
  },
  // Sub-customer under Marcus
  {
    id: 'cust-5',
    legalFirstName: 'Sarah',
    legalLastName: 'Chen',
    displayName: 'Sarah Chen',
    dateOfBirth: '1985-09-12',
    email: 'sarah@chencapital.com',
    phone: '+1 415-555-0201',
    primaryCustomerId: 'cust-4',
    passportNumber: '444555666',
    passportExpiry: '2027-03-15',
    passportCountry: 'USA',
    preferences: {
      seatPreference: 'window',
      dietaryRestrictions: ['Vegetarian'],
      hotelPreferences: 'Spa access important',
    },
    notes: 'Wife of Marcus. Prefers spa destinations.',
    createdAt: '2024-02-01T08:05:00Z',
    updatedAt: '2024-02-01T08:05:00Z'
  },
  // Primary Customer 3
  {
    id: 'cust-6',
    legalFirstName: 'Alexandra',
    legalLastName: 'Romanov',
    displayName: 'Alex Romanov',
    dateOfBirth: '1990-01-25',
    email: 'alex@romanovventures.com',
    phone: '+44 20 7946 0958',
    passportNumber: '777888999',
    passportExpiry: '2028-08-20',
    passportCountry: 'UK',
    loyaltyPrograms: [
      { program: 'British Airways Executive Club', number: 'BA12345678', status: 'Gold' },
      { program: 'Four Seasons Preferred Partner', number: 'FS-VIP-001', status: 'VIP' }
    ],
    preferences: {
      seatPreference: 'window',
      dietaryRestrictions: [],
      hotelPreferences: 'Four Seasons or Aman properties only',
      specialRequests: 'Requires NDA for all bookings'
    },
    notes: 'High-profile client. Privacy is paramount. All communications through assistant.',
    createdAt: '2024-03-10T15:00:00Z',
    updatedAt: '2024-05-01T09:30:00Z'
  }
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
