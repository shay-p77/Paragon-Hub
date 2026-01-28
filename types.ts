
export type Ownership = 'DIRECT' | 'AGENCY';

export enum ElementStatus {
  INQUIRY = 'INQUIRY',
  REQUESTED = 'REQUESTED',
  QUOTED = 'QUOTED',
  BOOKED = 'BOOKED',
  TICKETED = 'TICKETED',
  CANCELLED = 'CANCELLED'
}

export enum TripStage {
  INQUIRY = 'Inquiry',
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived'
}

export interface FlightElement {
  id: string;
  type: 'FLIGHT';
  status: ElementStatus;
  ownership: Ownership;
  pnr: string;
  airlinePnr?: string;
  carrier: string;
  segments: {
    from: string;
    to: string;
    departure: string;
    arrival: string;
    flightNo: string;
  }[];
  passengers: string[];
  cost: number;
  markup: number;
  commission: number;
  ticketingStatus: string;
  agentId?: string;
}

export interface HotelElement {
  id: string;
  type: 'HOTEL';
  status: ElementStatus;
  ownership: Ownership;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: string[];
  cost: number;
  commission: number;
  supplier: string;
  agentId?: string;
}

export interface LogisticsElement {
  id: string;
  type: 'LOGISTICS';
  status: ElementStatus;
  ownership: Ownership;
  serviceType: string;
  details: string;
  date: string;
  cost: number;
  markup: number;
  agentId?: string;
}

export type TripElement = FlightElement | HotelElement | LogisticsElement;

export interface ConciergeTrip {
  id: string;
  name: string;
  stage: TripStage;
  ownership: Ownership;
  clientId: string;
  agentId?: string;
  elements: string[];
  serviceFee: number;
  startDate: string;
  endDate: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  status: 'PENDING' | 'REVIEWED' | 'POSTED';
  elementId?: string;
  tripId?: string;
  category: string;
}

export type UserRole = 'ADMIN' | 'OPERATIONS' | 'SALES' | 'ACCOUNTING' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

// Customer (CRM) types
export interface LoyaltyProgram {
  program: string; // "United MileagePlus", "Marriott Bonvoy", etc.
  number: string;
  status?: string; // "Gold", "Platinum", etc.
}

export interface CustomerPreferences {
  seatPreference?: 'aisle' | 'window' | 'middle';
  dietaryRestrictions?: string[];
  hotelPreferences?: string;
  specialRequests?: string;
}

export interface Customer {
  id: string;
  // Basic Info
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  displayName: string; // How we refer to them (e.g., "Ushi" instead of "Yehoshua")
  dateOfBirth?: string;
  email?: string;
  phone?: string;

  // Relationship - if set, this customer belongs to a primary
  primaryCustomerId?: string;

  // Travel Documents
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;

  // Loyalty Programs
  loyaltyPrograms?: LoyaltyProgram[];

  // Preferences
  preferences?: CustomerPreferences;

  // Notes
  notes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Agent ownership (for CRM filtering)
  agentId?: string;
}

export interface BookingRequest {
  id: string;
  agentId: string;
  agentName: string;
  clientId: string;
  clientName: string;
  type: 'FLIGHT' | 'HOTEL' | 'LOGISTICS' | 'GENERAL';
  status: 'PENDING' | 'IN_REVIEW' | 'CONVERTED' | 'REJECTED';
  priority: 'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL';
  notes: string;
  timestamp: string;
  details?: any;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName?: string; // Name of the author (for display)
  authorAvatarColor?: string; // Avatar color of the author
  text: string;
  timestamp: string;
  parentId: string; // ID of the flight, hotel, trip, or request
  isPinned?: boolean; // Whether the comment is pinned (max 2 per post)
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'TAG' | 'ASSIGN' | 'STATUS' | 'CHAT';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  author: string;
  authorId?: string;
  date: string;
  isPinned?: boolean; // Whether the post is pinned (max 2 total)
  isArchived?: boolean; // Whether the post has been archived/resolved
}

// Converted element types (after completing a request)
export interface ConvertedFlight {
  id: string;
  description: string; // LastName-FlightNumber format
  airline: string;
  paymentStatus: 'PAID' | 'UNPAID';
  pnr: string;
  flights: string; // e.g., "JFK-LAX, LAX-SFO"
  passengerCount: number;
  dates: string;
  agent: string; // Text field - agent who did the booking
  profitLoss: number;
  status: 'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED';
  createdAt: string;
  originalRequestId?: string;
  notes?: string;
}

export interface ConvertedHotel {
  id: string;
  description: string; // LastName-HotelName format
  hotelName: string;
  paymentStatus: 'PAID' | 'UNPAID';
  confirmationNumber: string;
  roomType: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  agent: string;
  profitLoss: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  originalRequestId?: string;
  notes?: string;
}

export interface ConvertedLogistics {
  id: string;
  description: string;
  serviceType: string; // Car service, Transfer, etc.
  paymentStatus: 'PAID' | 'UNPAID';
  confirmationNumber: string;
  details: string;
  date: string;
  agent: string;
  profitLoss: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  originalRequestId?: string;
  notes?: string;
}

// Pipeline stages for Kanban board
export type PipelineStage = 'NEW' | 'PLANNING' | 'IN_PROGRESS' | 'FINALIZING';

// Task within a pipeline trip
export interface PipelineTask {
  id: string;
  text: string;
  completed: boolean;
}

// Pipeline trip for Kanban board
export interface PipelineTrip {
  id: string;
  name: string;
  clientName: string;
  stage: PipelineStage;
  hasFlights: boolean;
  hasHotels: boolean;
  hasLogistics: boolean;
  isUrgent: boolean;
  tasks: PipelineTask[];
  startDate?: string;
  endDate?: string;
  agent: string;
  notes?: string;
  createdAt: string;
}
