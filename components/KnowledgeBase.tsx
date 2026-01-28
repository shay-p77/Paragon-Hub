
import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader, Badge } from './Shared';
import { API_URL } from '../config';

// All country codes with flags (US first, then sorted alphabetically)
const COUNTRY_CODES = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+1268', country: 'Antigua & Barbuda', flag: '🇦🇬' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1242', country: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1246', country: 'Barbados', flag: '🇧🇧' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+501', country: 'Belize', flag: '🇧🇿' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'Bosnia', flag: '🇧🇦' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+236', country: 'Central African Rep.', flag: '🇨🇫' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'Congo (DRC)', flag: '🇨🇩' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+1767', country: 'Dominica', flag: '🇩🇲' },
  { code: '+1809', country: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+1473', country: 'Grenada', flag: '🇬🇩' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+1876', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', country: 'Palau', flag: '🇵🇼' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+1869', country: 'Saint Kitts & Nevis', flag: '🇰🇳' },
  { code: '+1758', country: 'Saint Lucia', flag: '🇱🇨' },
  { code: '+1784', country: 'Saint Vincent', flag: '🇻🇨' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+239', country: 'São Tomé & Príncipe', flag: '🇸🇹' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', country: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+670', country: 'Timor-Leste', flag: '🇹🇱' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴' },
  { code: '+1868', country: 'Trinidad & Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', country: 'Vatican City', flag: '🇻🇦' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
];

// Format phone number as user types - US format: (XXX) XXX-XXXX, others: XXX XXX XXXX
const formatPhoneNumber = (value: string, countryCode: string): string => {
  const digits = value.replace(/\D/g, '');
  if (countryCode === '+1') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  } else {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
};

// Parse phone number into country code and number
const parsePhoneNumber = (phone?: string): { countryCode: string; number: string } => {
  if (!phone) return { countryCode: '+1', number: '' };
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const cc of sortedCodes) {
    if (phone.startsWith(cc.code)) {
      const rawNumber = phone.slice(cc.code.length).trim();
      return { countryCode: cc.code, number: formatPhoneNumber(rawNumber, cc.code) };
    }
  }
  if (phone.startsWith('+')) {
    const match = phone.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) return { countryCode: match[1], number: formatPhoneNumber(match[2], match[1]) };
  }
  return { countryCode: '+1', number: phone };
};

// Types for Knowledge Base
type KnowledgeCategory = 'PROCEDURE' | 'LOCATION' | 'CONTACT' | 'NOTE';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  subcategory?: string;
  location?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactEntry {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

interface NoteEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const MOCK_PROCEDURES: KnowledgeEntry[] = [
  {
    id: 'proc-1',
    title: 'Virtuoso Booking Process',
    content: 'Step 1: Log into Virtuoso portal. Step 2: Search for property availability. Step 3: Submit booking request with client details. Step 4: Wait for confirmation (usually 24-48hrs). Step 5: Send confirmation to client with amenities list.',
    category: 'PROCEDURE',
    subcategory: 'Hotels',
    tags: ['virtuoso', 'hotels', 'booking'],
    createdBy: 'James Sterling',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-04-20T14:30:00Z'
  },
  {
    id: 'proc-2',
    title: 'Private Jet Ticketing Deadlines',
    content: 'Empty legs: Confirm within 2 hours of quote. Charter bookings: 50% deposit within 24hrs, balance 72hrs before departure. Always verify catering requirements 48hrs in advance.',
    category: 'PROCEDURE',
    subcategory: 'Aviation',
    tags: ['aviation', 'jets', 'deadlines'],
    createdBy: 'Elena Vance',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z'
  },
  {
    id: 'proc-3',
    title: 'Client Onboarding Checklist',
    content: '1. Collect passport copies for all travelers. 2. Get dietary restrictions and allergies. 3. Preferred airline and seating. 4. Hotel room preferences (floor, view, bed type). 5. Emergency contact info. 6. Payment method on file.',
    category: 'PROCEDURE',
    subcategory: 'Client Management',
    tags: ['onboarding', 'clients', 'checklist'],
    createdBy: 'James Sterling',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-05-01T16:00:00Z'
  },
  {
    id: 'proc-4',
    title: 'Cancellation & Refund Policy',
    content: 'Hotels: Follow property cancellation policy, typically 24-72hrs. Flights: Commercial - airline policy applies. Private - check charter agreement. Always document cancellation requests in writing.',
    category: 'PROCEDURE',
    subcategory: 'Policies',
    tags: ['cancellation', 'refunds', 'policy'],
    createdBy: 'Robert Finch',
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2024-03-20T08:00:00Z'
  }
];

const MOCK_LOCATIONS: KnowledgeEntry[] = [
  {
    id: 'loc-1',
    title: 'St. Moritz - Winter Season Guide',
    content: 'Peak season: Dec 20 - Jan 5, Feb school holidays. Book Badrutt\'s Palace minimum 6 months ahead. Corviglia ski area best for intermediates. King\'s Club for nightlife. Recommend minimum 4-night stay.',
    category: 'LOCATION',
    location: 'St. Moritz, Switzerland',
    tags: ['switzerland', 'ski', 'winter', 'luxury'],
    createdBy: 'Elena Vance',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-11-15T09:00:00Z'
  },
  {
    id: 'loc-2',
    title: 'Monaco Grand Prix - Logistics',
    content: 'Race weekend: Hotels 300% markup, book 1 year ahead. Best views: Fairmont hairpin suite, Yacht in harbor. Helicopter from Nice: 7 mins. VIP Paddock access through FOM or team contacts. Dress code enforced in Paddock Club.',
    category: 'LOCATION',
    location: 'Monaco',
    tags: ['monaco', 'f1', 'events', 'luxury'],
    createdBy: 'James Sterling',
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-05-10T11:00:00Z'
  },
  {
    id: 'loc-3',
    title: 'Maldives - Resort Comparison',
    content: 'Soneva Fushi: Best for families, incredible kids club. Cheval Blanc: Ultra-luxury, French cuisine. One&Only Reethi Rah: Largest villas, great spa. Arrival: Seaplane from Male (30-45 min). Best months: Nov-Apr.',
    category: 'LOCATION',
    location: 'Maldives',
    tags: ['maldives', 'beach', 'resorts', 'honeymoon'],
    createdBy: 'Elena Vance',
    createdAt: '2024-03-05T16:00:00Z',
    updatedAt: '2024-03-05T16:00:00Z'
  },
  {
    id: 'loc-4',
    title: 'Courchevel 1850 - Insider Tips',
    content: 'Top hotels: Airelles, Cheval Blanc, K2. Altiport accepts private jets up to midsize. Le Cap Horn for lunch on slopes. Recommend ski instructor Pierre Grunberg. New Year\'s fireworks best viewed from Bellecote terrace.',
    category: 'LOCATION',
    location: 'Courchevel, France',
    tags: ['france', 'ski', 'winter', 'luxury'],
    createdBy: 'James Sterling',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  }
];

const MOCK_NOTES: NoteEntry[] = [
  {
    id: 'note-1',
    title: 'Aman Tokyo Cherry Blossom Tip',
    content: 'Ask for Yuki at Aman Tokyo for special cherry blossom season arrangements. She can arrange private temple visits during peak season.',
    tags: ['tokyo', 'aman', 'tip'],
    createdBy: 'Elena Vance',
    createdAt: '2024-03-25T14:00:00Z',
    updatedAt: '2024-03-25T14:00:00Z'
  },
  {
    id: 'note-2',
    title: 'Monaco F1 Driver Contact',
    content: 'New reliable driver in Monaco: Jean-Pierre, +377 93 25 12 34. Available 24/7 during race weekend. Speaks English, French, Italian.',
    tags: ['monaco', 'driver', 'f1'],
    createdBy: 'James Sterling',
    createdAt: '2024-04-10T09:00:00Z',
    updatedAt: '2024-04-10T09:00:00Z'
  },
  {
    id: 'note-3',
    title: 'Cheval Blanc St Barths Renovation',
    content: 'Heads up: Cheval Blanc St Barths undergoing partial renovation until March 2025. Pool area affected. Offer clients upgrade or alternative.',
    tags: ['st barths', 'hotel', 'renovation'],
    createdBy: 'Robert Finch',
    createdAt: '2024-05-01T11:00:00Z',
    updatedAt: '2024-05-01T11:00:00Z'
  }
];

const MOCK_CONTACTS: ContactEntry[] = [
  {
    id: 'contact-1',
    name: 'Marco Benedetti',
    role: 'Head Concierge',
    company: 'Hotel de Crillon',
    location: 'Paris, France',
    phone: '+33 1 44 71 15 00',
    email: 'm.benedetti@rosewoodhotels.com',
    notes: 'Can arrange after-hours Louvre access. Prefers WhatsApp. Tips well for restaurant reservations.',
    tags: ['paris', 'luxury', 'concierge'],
    createdBy: 'Elena Vance',
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'contact-2',
    name: 'Hans Mueller',
    role: 'Charter Manager',
    company: 'Swiss Private Aviation',
    location: 'Zurich, Switzerland',
    phone: '+41 44 123 4567',
    email: 'h.mueller@swissprivate.ch',
    notes: 'Best rates for Geneva-St. Moritz transfers. 24hr response time. Accepts last-minute bookings.',
    tags: ['aviation', 'switzerland', 'charter'],
    createdBy: 'James Sterling',
    createdAt: '2024-01-08T09:00:00Z'
  },
  {
    id: 'contact-3',
    name: 'Sofia Rossi',
    role: 'VIP Relations',
    company: 'Aman Resorts',
    location: 'Global',
    phone: '+65 6715 8888',
    email: 's.rossi@aman.com',
    notes: 'Direct line for Aman Jet bookings. Can expedite villa requests. Annual client review in November.',
    tags: ['aman', 'hotels', 'vip'],
    createdBy: 'Elena Vance',
    createdAt: '2024-03-01T11:00:00Z'
  },
  {
    id: 'contact-4',
    name: 'Pierre Dubois',
    role: 'Owner',
    company: 'Côte d\'Azur Yacht Charters',
    location: 'Monaco',
    phone: '+377 93 50 12 34',
    email: 'pierre@cayachts.mc',
    notes: 'Fleet of 5 yachts (80-150ft). F1 weekend premium 200%. Catering partnerships with local chefs.',
    tags: ['monaco', 'yachts', 'charter'],
    createdBy: 'James Sterling',
    createdAt: '2024-04-10T14:00:00Z'
  },
  {
    id: 'contact-5',
    name: 'Yuki Tanaka',
    role: 'Guest Relations Manager',
    company: 'Aman Tokyo',
    location: 'Tokyo, Japan',
    phone: '+81 3 5224 3333',
    email: 'y.tanaka@aman.com',
    notes: 'Speaks fluent English. Can arrange exclusive temple visits. Best contact for cherry blossom season.',
    tags: ['tokyo', 'japan', 'aman', 'hotels'],
    createdBy: 'Elena Vance',
    createdAt: '2024-02-20T08:00:00Z'
  }
];

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'procedures' | 'locations' | 'contacts' | 'notes'>('procedures');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | ContactEntry | NoteEntry | null>(null);

  // Data state - fetch from API
  const [procedures, setProcedures] = useState<KnowledgeEntry[]>([]);
  const [locations, setLocations] = useState<KnowledgeEntry[]>([]);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proceduresRes, locationsRes, notesRes, contactsRes] = await Promise.all([
          fetch(`${API_URL}/api/knowledge/procedures`),
          fetch(`${API_URL}/api/knowledge/locations`),
          fetch(`${API_URL}/api/knowledge/notes`),
          fetch(`${API_URL}/api/knowledge/contacts`),
        ]);

        if (proceduresRes.ok) {
          const data = await proceduresRes.json();
          setProcedures(data.length > 0 ? data : MOCK_PROCEDURES);
        } else {
          setProcedures(MOCK_PROCEDURES);
        }

        if (locationsRes.ok) {
          const data = await locationsRes.json();
          setLocations(data.length > 0 ? data : MOCK_LOCATIONS);
        } else {
          setLocations(MOCK_LOCATIONS);
        }

        if (notesRes.ok) {
          const data = await notesRes.json();
          setNotes(data.length > 0 ? data : MOCK_NOTES);
        } else {
          setNotes(MOCK_NOTES);
        }

        if (contactsRes.ok) {
          const data = await contactsRes.json();
          setContacts(data.length > 0 ? data : MOCK_CONTACTS);
        } else {
          setContacts(MOCK_CONTACTS);
        }
      } catch (error) {
        console.error('Error fetching knowledge base data:', error);
        // Fall back to mock data on error
        setProcedures(MOCK_PROCEDURES);
        setLocations(MOCK_LOCATIONS);
        setNotes(MOCK_NOTES);
        setContacts(MOCK_CONTACTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Quick add form state - now category is selected first
  const [quickAddCategory, setQuickAddCategory] = useState<'PROCEDURE' | 'LOCATION' | 'CONTACT' | 'NOTE' | null>(null);

  // Procedure form state
  const [procTitle, setProcTitle] = useState('');
  const [procSubcategory, setProcSubcategory] = useState('');
  const [procContent, setProcContent] = useState('');
  const [procTags, setProcTags] = useState('');

  // Location form state
  const [locTitle, setLocTitle] = useState('');
  const [locLocation, setLocLocation] = useState('');
  const [locContent, setLocContent] = useState('');
  const [locTags, setLocTags] = useState('');

  // Note form state (quick capture)
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [contactCountryCode, setContactCountryCode] = useState('+1');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // Edit modal state
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | ContactEntry | NoteEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<KnowledgeEntry | ContactEntry | NoteEntry | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTags, setEditTags] = useState('');
  // Contact edit fields
  const [editContactName, setEditContactName] = useState('');
  const [editContactRole, setEditContactRole] = useState('');
  const [editContactCompany, setEditContactCompany] = useState('');
  const [editContactLocation, setEditContactLocation] = useState('');
  const [editContactCountryCode, setEditContactCountryCode] = useState('+1');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactNotes, setEditContactNotes] = useState('');

  const quickAddRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  // Close quick add when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setShowQuickAdd(false);
      }
    };

    if (showQuickAdd) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickAdd]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setSelectedEntry(null);
        setEditingEntry(null);
        setDeleteConfirm(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const resetQuickAddForm = () => {
    setQuickAddCategory(null);
    setProcTitle('');
    setProcSubcategory('');
    setProcContent('');
    setProcTags('');
    setLocTitle('');
    setLocLocation('');
    setLocContent('');
    setLocTags('');
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setContactName('');
    setContactRole('');
    setContactCompany('');
    setContactLocation('');
    setContactPhone('');
    setContactCountryCode('+1');
    setContactEmail('');
    setContactNotes('');
  };

  const handleEditEntry = (entry: KnowledgeEntry | ContactEntry | NoteEntry) => {
    setEditingEntry(entry);
    if ('name' in entry) {
      // Contact
      setEditContactName(entry.name);
      setEditContactRole(entry.role);
      setEditContactCompany(entry.company);
      setEditContactLocation(entry.location);
      const parsedPhone = parsePhoneNumber(entry.phone);
      setEditContactCountryCode(parsedPhone.countryCode);
      setEditContactPhone(parsedPhone.number);
      setEditContactEmail(entry.email || '');
      setEditContactNotes(entry.notes || '');
    } else {
      // Knowledge entry (procedure, location, note)
      setEditTitle(entry.title);
      setEditContent(entry.content);
      if ('subcategory' in entry) setEditSubcategory(entry.subcategory || '');
      if ('location' in entry) setEditLocation(entry.location || '');
      setEditTags(entry.tags.join(', '));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      if ('name' in editingEntry) {
        // Update contact
        const res = await fetch(`${API_URL}/api/knowledge/contacts/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editContactName,
            role: editContactRole,
            company: editContactCompany,
            location: editContactLocation,
            phone: editContactPhone ? `${editContactCountryCode} ${editContactPhone}` : '',
            email: editContactEmail,
            notes: editContactNotes,
            tags: editingEntry.tags,
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
          setSelectedEntry(updated);
        }
      } else {
        // Update knowledge entry
        const res = await fetch(`${API_URL}/api/knowledge/entries/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
            subcategory: editSubcategory,
            location: editLocation,
            tags: editTags.split(',').map(t => t.trim()).filter(t => t),
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          if ('category' in editingEntry) {
            if (editingEntry.category === 'PROCEDURE') {
              setProcedures(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else if (editingEntry.category === 'LOCATION') {
              setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
            } else if (editingEntry.category === 'NOTE') {
              setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
            }
          }
          setSelectedEntry(updated);
        }
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }

    setEditingEntry(null);
  };

  const handleDeleteEntry = async () => {
    if (!deleteConfirm) return;

    try {
      if ('name' in deleteConfirm) {
        // Delete contact
        await fetch(`${API_URL}/api/knowledge/contacts/${deleteConfirm.id}`, { method: 'DELETE' });
        setContacts(prev => prev.filter(c => c.id !== deleteConfirm.id));
      } else {
        // Delete knowledge entry
        await fetch(`${API_URL}/api/knowledge/entries/${deleteConfirm.id}`, { method: 'DELETE' });
        if ('category' in deleteConfirm) {
          if (deleteConfirm.category === 'PROCEDURE') {
            setProcedures(prev => prev.filter(p => p.id !== deleteConfirm.id));
          } else if (deleteConfirm.category === 'LOCATION') {
            setLocations(prev => prev.filter(l => l.id !== deleteConfirm.id));
          } else if (deleteConfirm.category === 'NOTE') {
            setNotes(prev => prev.filter(n => n.id !== deleteConfirm.id));
          }
        }
      }
      // Clear selected entry if it was the deleted one
      if (selectedEntry?.id === deleteConfirm.id) {
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }

    setDeleteConfirm(null);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get current user from localStorage
    const storedUser = localStorage.getItem('paragon_user');
    const userName = storedUser ? JSON.parse(storedUser).name : 'Current User';

    try {
      if (quickAddCategory === 'PROCEDURE' || quickAddCategory === 'LOCATION' || quickAddCategory === 'NOTE') {
        const entryData = {
          title: quickAddCategory === 'PROCEDURE' ? procTitle : quickAddCategory === 'LOCATION' ? locTitle : noteTitle,
          content: quickAddCategory === 'PROCEDURE' ? procContent : quickAddCategory === 'LOCATION' ? locContent : noteContent,
          category: quickAddCategory,
          subcategory: quickAddCategory === 'PROCEDURE' ? procSubcategory : undefined,
          location: quickAddCategory === 'LOCATION' ? locLocation : undefined,
          tags: quickAddCategory === 'PROCEDURE' ? procTags.split(',').map(t => t.trim()).filter(t => t) :
                quickAddCategory === 'LOCATION' ? locTags.split(',').map(t => t.trim()).filter(t => t) :
                noteTags.split(',').map(t => t.trim()).filter(t => t),
          createdBy: userName,
        };

        const res = await fetch(`${API_URL}/api/knowledge/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
        });

        if (res.ok) {
          const newEntry = await res.json();
          if (quickAddCategory === 'PROCEDURE') {
            setProcedures(prev => [newEntry, ...prev]);
            setActiveTab('procedures');
          } else if (quickAddCategory === 'LOCATION') {
            setLocations(prev => [newEntry, ...prev]);
            setActiveTab('locations');
          } else {
            setNotes(prev => [newEntry, ...prev]);
            setActiveTab('notes');
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to save entry:', res.status, errorData);
          alert(`Failed to save: ${errorData.error || res.statusText}`);
          return;
        }
      } else if (quickAddCategory === 'CONTACT') {
        const contactData = {
          name: contactName,
          role: contactRole,
          company: contactCompany,
          location: contactLocation,
          phone: contactPhone ? `${contactCountryCode} ${contactPhone}` : '',
          email: contactEmail || '',
          notes: contactNotes || '',
          tags: [],
          createdBy: userName,
        };

        const res = await fetch(`${API_URL}/api/knowledge/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });

        if (res.ok) {
          const newContact = await res.json();
          setContacts(prev => [newContact, ...prev]);
          setActiveTab('contacts');
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to save contact:', res.status, errorData);
          alert(`Failed to save contact: ${errorData.error || res.statusText}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save'}`);
      return;
    }

    setShowQuickAdd(false);
    resetQuickAddForm();
  };

  // Filter entries based on search
  const filteredProcedures = procedures.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLocations = locations.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hotels': return 'teal';
      case 'Aviation': return 'gold';
      case 'Client Management': return 'slate';
      case 'Policies': return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-900 tracking-wide">Knowledge Base</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Business procedures, destination intel, and contact directory</p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-2 bg-paragon text-white px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Quick Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedures, locations, contacts..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 sm:gap-8 border-b border-slate-200 mb-4 sm:mb-6 overflow-x-auto pb-0 -mb-[1px]">
        {[
          { id: 'procedures', label: 'PROCS', fullLabel: 'PROCEDURES', count: filteredProcedures.length },
          { id: 'locations', label: 'LOCS', fullLabel: 'LOCATIONS', count: filteredLocations.length },
          { id: 'contacts', label: 'CONTACTS', fullLabel: 'CONTACTS', count: filteredContacts.length },
          { id: 'notes', label: 'NOTES', fullLabel: 'NOTES', count: filteredNotes.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 sm:pb-4 text-[10px] sm:text-xs font-bold tracking-widest transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-paragon border-b-2 border-paragon'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="sm:hidden">{tab.label}</span>
            <span className="hidden sm:inline">{tab.fullLabel}</span>
            <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-paragon text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-paragon"></div>
            <span className="text-xs text-slate-400 uppercase tracking-widest">Loading knowledge base...</span>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className={selectedEntry ? 'lg:col-span-7' : 'lg:col-span-12'}>
          {/* Procedures Tab */}
          {activeTab === 'procedures' && (
            <div className="space-y-4">
              {filteredProcedures.map(proc => (
                <div
                  key={proc.id}
                  onClick={() => setSelectedEntry(proc)}
                  className={`bg-white border border-slate-200 p-5 rounded-sm cursor-pointer hover:shadow-md transition-shadow ${
                    selectedEntry?.id === proc.id ? 'ring-2 ring-paragon' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-slate-900">{proc.title}</h3>
                    {proc.subcategory && <Badge color={getCategoryColor(proc.subcategory)}>{proc.subcategory}</Badge>}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{proc.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {proc.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400">Updated {new Date(proc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {filteredProcedures.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No procedures found</p>
                </div>
              )}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredLocations.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedEntry(loc)}
                  className={`bg-white border border-slate-200 p-5 rounded-sm cursor-pointer hover:shadow-md transition-shadow ${
                    selectedEntry?.id === loc.id ? 'ring-2 ring-paragon' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] text-paragon font-bold uppercase tracking-wider">{loc.location}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">{loc.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3">{loc.content}</p>
                  <div className="flex gap-1 flex-wrap">
                    {loc.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {filteredLocations.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <p className="text-sm">No locations found</p>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedEntry(contact)}
                  className={`bg-white border border-slate-200 p-4 rounded-sm cursor-pointer hover:shadow-md transition-shadow ${
                    selectedEntry?.id === contact.id ? 'ring-2 ring-paragon' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-paragon-gold flex items-center justify-center text-white font-bold text-sm">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{contact.name}</h3>
                        <p className="text-xs text-slate-500">{contact.role} at {contact.company}</p>
                        <p className="text-[10px] text-paragon mt-1">{contact.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {contact.phone && (
                        <p className="text-xs text-slate-600">{contact.phone}</p>
                      )}
                      {contact.email && (
                        <p className="text-[10px] text-slate-400">{contact.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No contacts found</p>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setSelectedEntry(note)}
                  className={`bg-white border border-slate-200 p-5 rounded-sm cursor-pointer hover:shadow-md transition-shadow ${
                    selectedEntry?.id === note.id ? 'ring-2 ring-paragon' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-paragon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <h3 className="font-bold text-sm text-slate-900">{note.title}</h3>
                    </div>
                    <span className="text-[9px] text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{note.content}</p>
                  <div className="flex gap-1">
                    {note.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No notes found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedEntry && (
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-sm sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Details</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditEntry(selectedEntry)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-paragon hover:bg-slate-50 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(selectedEntry)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                  <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
                </div>
              </div>

              {'name' in selectedEntry ? (
                // Contact detail
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-paragon-gold flex items-center justify-center text-white font-bold text-lg">
                      {selectedEntry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-slate-900">{selectedEntry.name}</h2>
                      <p className="text-sm text-slate-500">{selectedEntry.role}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company</label>
                      <p className="text-sm text-slate-900">{selectedEntry.company}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</label>
                      <p className="text-sm text-slate-900">{selectedEntry.location}</p>
                    </div>
                    {selectedEntry.phone && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone</label>
                        <p className="text-sm text-paragon font-medium">{selectedEntry.phone}</p>
                      </div>
                    )}
                    {selectedEntry.email && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                        <p className="text-sm text-paragon font-medium">{selectedEntry.email}</p>
                      </div>
                    )}
                  </div>

                  {selectedEntry.notes && (
                    <div className="bg-slate-50 p-4 rounded-sm mb-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Notes</label>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedEntry.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-1 flex-wrap">
                    {selectedEntry.tags.map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                // Procedure/Location/Note detail
                <div>
                  <h2 className="font-bold text-lg text-slate-900 mb-2">{selectedEntry.title}</h2>
                  {'location' in selectedEntry && selectedEntry.location && (
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-sm text-paragon">{selectedEntry.location}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-sm mb-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>

                  <div className="flex gap-1 flex-wrap mb-4">
                    {selectedEntry.tags.map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-1">
                    <p>Created by {selectedEntry.createdBy}</p>
                    <p>Last updated {new Date(selectedEntry.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4 animate-fadeIn">
          <div ref={quickAddRef} className="bg-white w-full max-w-lg max-h-[70vh] md:max-h-[80vh] flex flex-col rounded-sm shadow-2xl animate-zoomIn overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {quickAddCategory && (
                  <button
                    onClick={() => setQuickAddCategory(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="font-cinzel text-lg font-bold">
                  {!quickAddCategory ? 'Add to Knowledge Base' :
                   quickAddCategory === 'PROCEDURE' ? 'Add Procedure' :
                   quickAddCategory === 'LOCATION' ? 'Add Location' :
                   quickAddCategory === 'CONTACT' ? 'Add Contact' : 'Add Note'}
                </h2>
              </div>
              <button onClick={() => { setShowQuickAdd(false); resetQuickAddForm(); }} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>

            {/* Step 1: Category Selection */}
            {!quickAddCategory && (
              <div className="p-4 sm:p-6">
                <p className="text-xs text-slate-500 mb-4">What would you like to add?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setQuickAddCategory('PROCEDURE')}
                    className="p-4 border border-slate-200 rounded-sm hover:border-paragon hover:bg-paragon/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-slate-900">Procedure</span>
                    </div>
                    <p className="text-[10px] text-slate-500">SOPs, booking processes, policies</p>
                  </button>

                  <button
                    onClick={() => setQuickAddCategory('LOCATION')}
                    className="p-4 border border-slate-200 rounded-sm hover:border-paragon hover:bg-paragon/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-slate-900">Location</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Destination intel, travel tips</p>
                  </button>

                  <button
                    onClick={() => setQuickAddCategory('CONTACT')}
                    className="p-4 border border-slate-200 rounded-sm hover:border-paragon hover:bg-paragon/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-slate-900">Contact</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Vendors, concierges, partners</p>
                  </button>

                  <button
                    onClick={() => setQuickAddCategory('NOTE')}
                    className="p-4 border border-slate-200 rounded-sm hover:border-paragon hover:bg-paragon/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-slate-900">Quick Note</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Tips, reminders, quick capture</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Category-specific forms */}
            {quickAddCategory === 'PROCEDURE' && (
              <form onSubmit={handleQuickAddSubmit} className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Title *</label>
                  <input
                    type="text"
                    value={procTitle}
                    onChange={(e) => setProcTitle(e.target.value)}
                    placeholder="E.g., 'Virtuoso Hotel Booking Process'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Subcategory</label>
                  <select
                    value={procSubcategory}
                    onChange={(e) => setProcSubcategory(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  >
                    <option value="">Select a subcategory...</option>
                    <option value="Hotels">Hotels</option>
                    <option value="Aviation">Aviation</option>
                    <option value="Ticketing">Ticketing</option>
                    <option value="Client Management">Client Management</option>
                    <option value="Cancellation">Cancellation</option>
                    <option value="Policies">Policies</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Content / Steps *</label>
                  <textarea
                    value={procContent}
                    onChange={(e) => setProcContent(e.target.value)}
                    placeholder="Enter the procedure steps or details..."
                    className="w-full p-3 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none h-32"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={procTags}
                    onChange={(e) => setProcTags(e.target.value)}
                    placeholder="E.g., 'virtuoso, hotels, booking'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm">
                  Save Procedure
                </button>
              </form>
            )}

            {quickAddCategory === 'LOCATION' && (
              <form onSubmit={handleQuickAddSubmit} className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Title *</label>
                  <input
                    type="text"
                    value={locTitle}
                    onChange={(e) => setLocTitle(e.target.value)}
                    placeholder="E.g., 'Monaco Grand Prix - VIP Guide'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location *</label>
                  <input
                    type="text"
                    value={locLocation}
                    onChange={(e) => setLocLocation(e.target.value)}
                    placeholder="E.g., 'Monaco' or 'Tokyo, Japan'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Details *</label>
                  <textarea
                    value={locContent}
                    onChange={(e) => setLocContent(e.target.value)}
                    placeholder="Enter destination details, tips, insider info..."
                    className="w-full p-3 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none h-32"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={locTags}
                    onChange={(e) => setLocTags(e.target.value)}
                    placeholder="E.g., 'monaco, f1, luxury, events'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm">
                  Save Location
                </button>
              </form>
            )}

            {quickAddCategory === 'CONTACT' && (
              <form onSubmit={handleQuickAddSubmit} className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Full name"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Role *</label>
                    <input
                      type="text"
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      placeholder="E.g., Concierge"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Company *</label>
                    <input
                      type="text"
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      placeholder="E.g., Hotel de Crillon"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location *</label>
                    <input
                      type="text"
                      value={contactLocation}
                      onChange={(e) => setContactLocation(e.target.value)}
                      placeholder="E.g., Paris, France"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                    <div className="flex gap-2">
                      <select
                        value={contactCountryCode}
                        onChange={(e) => setContactCountryCode(e.target.value)}
                        className="w-28 p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      >
                        {COUNTRY_CODES.map(cc => (
                          <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.flag} {cc.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value, contactCountryCode))}
                        placeholder={contactCountryCode === '+1' ? '(555) 123-4567' : '555 123 4567'}
                        className="flex-1 p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Notes</label>
                  <textarea
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Any helpful notes about this contact..."
                    className="w-full p-3 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none h-24"
                  />
                </div>
                <button type="submit" className="w-full bg-paragon text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm">
                  Save Contact
                </button>
              </form>
            )}

            {quickAddCategory === 'NOTE' && (
              <form onSubmit={handleQuickAddSubmit} className="p-4 flex-1 overflow-y-auto">
                <p className="text-xs text-slate-500 mb-4">
                  Quickly capture a tip, reminder, or piece of info. You can always edit or recategorize later.
                </p>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Title *</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="E.g., 'Aman Tokyo Cherry Blossom Tip'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Content *</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter your note, tip, or quick capture..."
                    className="w-full p-3 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none h-32"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="E.g., 'tip, tokyo, important'"
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-paragon-gold text-slate-900 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-gold/90 transition-colors rounded-sm">
                  Save Note
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4 animate-fadeIn"
          onClick={() => setEditingEntry(null)}
        >
          <div
            ref={editModalRef}
            className="bg-white w-full max-w-lg max-h-[70vh] md:max-h-[80vh] flex flex-col rounded-sm shadow-2xl animate-zoomIn overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-cinzel text-lg font-bold">
                {'name' in editingEntry ? 'Edit Contact' : 'Edit Entry'}
              </h2>
              <button onClick={() => setEditingEntry(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>

            {'name' in editingEntry ? (
              // Contact edit form
              <form onSubmit={handleSaveEdit} className="p-3 sm:p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Name *</label>
                    <input
                      type="text"
                      value={editContactName}
                      onChange={(e) => setEditContactName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Role *</label>
                    <input
                      type="text"
                      value={editContactRole}
                      onChange={(e) => setEditContactRole(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Company *</label>
                    <input
                      type="text"
                      value={editContactCompany}
                      onChange={(e) => setEditContactCompany(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location *</label>
                    <input
                      type="text"
                      value={editContactLocation}
                      onChange={(e) => setEditContactLocation(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                    <div className="flex gap-2">
                      <select
                        value={editContactCountryCode}
                        onChange={(e) => setEditContactCountryCode(e.target.value)}
                        className="w-28 p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      >
                        {COUNTRY_CODES.map(cc => (
                          <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.flag} {cc.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={editContactPhone}
                        onChange={(e) => setEditContactPhone(formatPhoneNumber(e.target.value, editContactCountryCode))}
                        placeholder={editContactCountryCode === '+1' ? '(555) 123-4567' : '555 123 4567'}
                        className="flex-1 p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                    <input
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Notes</label>
                  <textarea
                    value={editContactNotes}
                    onChange={(e) => setEditContactNotes(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none h-24"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // Knowledge entry edit form
              <form onSubmit={handleSaveEdit} className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    required
                  />
                </div>
                {'category' in editingEntry && editingEntry.category === 'PROCEDURE' && (
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Subcategory</label>
                    <select
                      value={editSubcategory}
                      onChange={(e) => setEditSubcategory(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    >
                      <option value="">Select subcategory</option>
                      <option value="Hotels">Hotels</option>
                      <option value="Aviation">Aviation</option>
                      <option value="Client Management">Client Management</option>
                      <option value="Policies">Policies</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                )}
                {'category' in editingEntry && editingEntry.category === 'LOCATION' && (
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="E.g., 'Monaco'"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Content *</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm resize-none h-32"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-sm mx-4"
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
                  <h3 className="text-sm font-bold text-slate-900">
                    Delete {'name' in deleteConfirm ? 'Contact' : 'Entry'}
                  </h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete "{'name' in deleteConfirm ? deleteConfirm.name : deleteConfirm.title}"? This will permanently remove it from the knowledge base.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEntry}
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

export default KnowledgeBase;

/* COMMENTED OUT - Original placeholder content
const KnowledgeBaseOriginal: React.FC = () => {
  return (
    <div className="p-8">
      <SectionHeader title="Knowledge & Experience Library" subtitle="The master directory of hotels, vendors, and destination intel." />

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-cinzel text-sm font-bold border-b border-slate-100 pb-2 mb-4">HOTEL MASTER</h3>
          <p className="text-[10px] text-slate-500 mb-4">12,402 properties verified. Includes insider notes, preferred contacts, and commission history.</p>
          <button className="text-[10px] font-bold text-paragon tracking-widest hover:underline uppercase">Browse Registry</button>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-cinzel text-sm font-bold border-b border-slate-100 pb-2 mb-4">VENDORS & SUPPLIERS</h3>
          <p className="text-[10px] text-slate-500 mb-4">Driver networks, yacht charters, and VIP meet-and-greet operators globally.</p>
          <button className="text-[10px] font-bold text-paragon tracking-widest hover:underline uppercase">View Directory</button>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-cinzel text-sm font-bold border-b border-slate-100 pb-2 mb-4">DESTINATION GUIDES</h3>
          <p className="text-[10px] text-slate-500 mb-4">Curated experiences, restaurants, and timing duration for perfect itinerary building.</p>
          <button className="text-[10px] font-bold text-paragon tracking-widest hover:underline uppercase">Explore Intel</button>
        </div>
      </div>

      <div className="mt-12 bg-slate-900 text-white p-8 border-l-4 border-paragon-gold">
         <h4 className="font-cinzel text-lg mb-2">ANONYMIZED COMPANY TRENDS</h4>
         <p className="text-slate-400 text-xs mb-6 max-w-2xl">Sales intelligence on what's currently selling. Restricted view for agents to understand company-wide trends without sensitive data.</p>
         <div className="grid grid-cols-4 gap-6">
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Top Destination</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">COURCHEVEL</div>
            </div>
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Most Booked (Hotel)</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">AMAN NYC</div>
            </div>
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Activity Trend</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">Yacht Charter</div>
            </div>
            <div className="bg-slate-800 p-4 border border-slate-700">
               <div className="text-[10px] uppercase text-slate-400 mb-1">Avg Margin</div>
               <div className="font-bold text-xl font-cinzel text-paragon-gold">14.2%</div>
            </div>
         </div>
      </div>
    </div>
  );
};
*/
