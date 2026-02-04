
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

// Markup types
export type MarkupType = 'FLAT' | 'PERCENT';

export interface MarkupSetting {
  amount: number | null;
  type: MarkupType | null;
}

export interface CustomMarkups {
  flight?: MarkupSetting;
  hotel?: MarkupSetting;
  logistics?: MarkupSetting;
  conciergePerDay?: MarkupSetting;
}

export interface SystemMarkups {
  flight: { amount: number; type: MarkupType };
  hotel: { amount: number; type: MarkupType };
  logistics: { amount: number; type: MarkupType };
  conciergePerDay: { amount: number; type: MarkupType };
}

export interface Passport {
  number: string;
  country: string;
  expiry?: string;
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

  // Travel Documents (legacy single passport - kept for backwards compatibility)
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;

  // Multiple passports support
  passports?: Passport[];

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

  // Custom markup overrides (null = use global default)
  customMarkups?: CustomMarkups | null;
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
  tripId?: string; // Link to ConciergeTrip if created from a trip
  tripName?: string; // Name of linked trip for display
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
  cost?: number; // What we paid
  chargeToClient?: number; // What we charge the client
  profitLoss: number; // chargeToClient - cost (or manual entry)
  status: 'PENDING' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED';
  createdAt: string;
  originalRequestId?: string;
  notes?: string;
  tripId?: string; // Link to ConciergeTrip
  tripName?: string;
  clientId?: string; // Link to Customer for markup lookup
  vendorId?: string; // Link to Vendor
  vendorName?: string;
}

export type HotelBookingAgency = 'PARAGON' | 'BENNISH' | 'EMBARK' | 'TAAP';
export type HotelPaymentMethod = 'AGENCY' | 'PAY_AT_CHECKIN';

// Commission split percentages by agency
export const HOTEL_COMMISSION_SPLITS: Record<HotelBookingAgency, number> = {
  PARAGON: 0.94,
  BENNISH: 0.85,
  EMBARK: 0.70,
  TAAP: 1.00,
};

export interface ConvertedHotel {
  id: string;
  description: string; // LastName-HotelName format
  hotelName: string;
  guestName: string; // Primary guest name
  paymentStatus: 'PAID' | 'UNPAID';
  confirmationNumber: string;
  roomType: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  agent: string;

  // Booking source & payment
  bookedVia: HotelBookingAgency;
  paymentMethod: HotelPaymentMethod;
  customerPayingId?: string; // Customer who is paying (may differ from guest)
  customerPayingName?: string;

  // Financial tracking
  roomRate?: number; // Room rate without taxes
  fullCharge?: number; // Full charge including taxes
  commissionPercent?: number; // Expected commission % (typically 10-15%)
  expectedCommission?: number; // Calculated: roomRate * commissionPercent
  commissionSplit?: number; // Agency split percentage (from HOTEL_COMMISSION_SPLITS)
  netCommission?: number; // Calculated: expectedCommission * commissionSplit

  // Legacy fields (kept for compatibility)
  cost?: number; // What we paid (same as fullCharge if agency paid)
  chargeToClient?: number; // What we charge the client
  profitLoss: number; // chargeToClient - cost (or manual entry)

  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  originalRequestId?: string;
  notes?: string;
  tripId?: string; // Link to ConciergeTrip
  tripName?: string;
  clientId?: string; // Link to Customer for markup lookup
  vendorId?: string; // Link to Vendor
  vendorName?: string;

  // Automation
  welcomeLetterSent?: boolean;
  welcomeLetterSentAt?: string;
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
  cost?: number; // What we paid
  chargeToClient?: number; // What we charge the client
  profitLoss: number; // chargeToClient - cost (or manual entry)
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  originalRequestId?: string;
  notes?: string;
  tripId?: string; // Link to ConciergeTrip
  tripName?: string;
  clientId?: string; // Link to Customer for markup lookup
  vendorId?: string; // Link to Vendor
  vendorName?: string;
}

// Pipeline stages for Kanban board
export type PipelineStage = 'NEW' | 'PLANNING' | 'IN_PROGRESS' | 'FINALIZING';

// Comment for pipeline tasks
export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

// Task within a pipeline trip
export interface PipelineTask {
  id: string;
  text: string;
  completed: boolean;
  assignedTo?: string; // Agent user id
  deadline?: string; // ISO date string
  description?: string; // Additional details
  comments?: TaskComment[]; // Task comments
}

// Pipeline trip for Kanban board
export interface PipelineTrip {
  id: string;
  name: string;
  clientId?: string; // Link to Customer for records
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

// Vendor types
export type VendorType = 'FLIGHT' | 'HOTEL' | 'LOGISTICS';
export type CollectionMethod = 'AUTOMATIC' | 'EMAIL' | 'FORM' | 'CHECK' | 'INVOICE' | 'OTHER';
export type PaymentFrequency = 'MONTHLY' | 'WEEKLY' | 'PER_BOOKING' | 'QUARTERLY' | 'ANNUALLY' | 'OTHER';

export interface Vendor {
  id: string;
  name: string;
  code?: string;
  type: VendorType;
  commissionPercent: number;
  collectionMethod: CollectionMethod;
  paymentFrequency: PaymentFrequency;
  collectionEmail?: string;
  collectionFormUrl?: string;
  collectionNotes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Audit log types
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_CUSTOMER'
  | 'CREATE_CUSTOMER'
  | 'UPDATE_CUSTOMER'
  | 'DELETE_CUSTOMER'
  | 'VIEW_BOOKING'
  | 'CREATE_BOOKING'
  | 'UPDATE_BOOKING'
  | 'DELETE_BOOKING'
  | 'VIEW_PII'
  | 'EXPORT_DATA'
  | 'INVITE_USER'
  | 'RESEND_INVITE'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'SETTINGS_CHANGE'
  | 'CREATE_VENDOR'
  | 'UPDATE_VENDOR'
  | 'DELETE_VENDOR'
  | 'FAILED_LOGIN'
  | 'RATE_LIMITED';

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  details?: any;
  ipAddress?: string;
  success: boolean;
  errorMessage?: string;
  timestamp: string;
}
