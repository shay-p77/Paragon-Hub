
import React, { useState, useEffect } from 'react';
import { SectionHeader } from './Shared';
import { Customer, LoyaltyProgram, BookingRequest } from '../types';
import { GoogleUser } from './Login';
import { API_URL } from '../config';

interface CRMProps {
  requests?: BookingRequest[];
  googleUser?: GoogleUser | null;
  onDeleteRequest?: (requestId: string) => void;
}

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
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  if (countryCode === '+1') {
    // US/Canada format: (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  } else {
    // International format: XXX XXX XXXX (groups of 3-3-4)
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
};

// Helper to parse phone number into country code and number
const parsePhoneNumber = (phone?: string): { countryCode: string; number: string } => {
  if (!phone) return { countryCode: '+1', number: '' };

  // Try to match known country codes (sort by length desc to match longer codes first)
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const cc of sortedCodes) {
    if (phone.startsWith(cc.code)) {
      const rawNumber = phone.slice(cc.code.length).trim();
      return { countryCode: cc.code, number: formatPhoneNumber(rawNumber, cc.code) };
    }
  }

  // If starts with + but not in our list, try to extract it
  if (phone.startsWith('+')) {
    const match = phone.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return { countryCode: match[1], number: formatPhoneNumber(match[2], match[1]) };
    }
  }

  return { countryCode: '+1', number: phone };
};

// Customer Form Modal Component
const CustomerFormModal: React.FC<{
  customer?: Customer;
  primaryCustomers: Customer[];
  onSave: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
  onClose: () => void;
}> = ({ customer, primaryCustomers, onSave, onDelete, onClose }) => {
  const isEditing = !!customer;
  const parsedPhone = parsePhoneNumber(customer?.phone);

  // Form state
  const [legalFirstName, setLegalFirstName] = useState(customer?.legalFirstName || '');
  const [legalMiddleName, setLegalMiddleName] = useState(customer?.legalMiddleName || '');
  const [legalLastName, setLegalLastName] = useState(customer?.legalLastName || '');
  const [displayName, setDisplayName] = useState(customer?.displayName || '');
  const [dateOfBirth, setDateOfBirth] = useState(customer?.dateOfBirth || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [countryCode, setCountryCode] = useState(parsedPhone.countryCode);
  const [phone, setPhone] = useState(parsedPhone.number);
  const [primaryCustomerId, setPrimaryCustomerId] = useState(customer?.primaryCustomerId || '');
  const [passportNumber, setPassportNumber] = useState(customer?.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState(customer?.passportExpiry || '');
  const [passportCountry, setPassportCountry] = useState(customer?.passportCountry || '');
  const [seatPreference, setSeatPreference] = useState<'aisle' | 'window' | 'middle' | ''>(customer?.preferences?.seatPreference || '');
  const [dietaryRestrictions, setDietaryRestrictions] = useState(customer?.preferences?.dietaryRestrictions?.join(', ') || '');
  const [hotelPreferences, setHotelPreferences] = useState(customer?.preferences?.hotelPreferences || '');
  const [specialRequests, setSpecialRequests] = useState(customer?.preferences?.specialRequests || '');
  const [notes, setNotes] = useState(customer?.notes || '');
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>(customer?.loyaltyPrograms || []);

  // Add loyalty program
  const addLoyaltyProgram = () => {
    setLoyaltyPrograms([...loyaltyPrograms, { program: '', number: '', status: '' }]);
  };

  // Update loyalty program
  const updateLoyaltyProgram = (index: number, field: keyof LoyaltyProgram, value: string) => {
    const updated = [...loyaltyPrograms];
    updated[index] = { ...updated[index], [field]: value };
    setLoyaltyPrograms(updated);
  };

  // Remove loyalty program
  const removeLoyaltyProgram = (index: number) => {
    setLoyaltyPrograms(loyaltyPrograms.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: customer?.id || `cust-${Date.now()}`,
      legalFirstName,
      legalMiddleName: legalMiddleName || undefined,
      legalLastName,
      displayName: displayName || `${legalFirstName} ${legalLastName}`,
      dateOfBirth: dateOfBirth || undefined,
      email: email || undefined,
      phone: phone ? `${countryCode} ${phone}` : undefined,
      primaryCustomerId: primaryCustomerId || undefined,
      passportNumber: passportNumber || undefined,
      passportExpiry: passportExpiry || undefined,
      passportCountry: passportCountry || undefined,
      loyaltyPrograms: loyaltyPrograms.filter(lp => lp.program && lp.number),
      preferences: {
        seatPreference: seatPreference || undefined,
        dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        hotelPreferences: hotelPreferences || undefined,
        specialRequests: specialRequests || undefined,
      },
      notes: notes || undefined,
      createdAt: customer?.createdAt || now,
      updatedAt: now,
    };

    onSave(newCustomer);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[70vh] md:max-h-[85vh] flex flex-col rounded-sm shadow-2xl animate-zoomIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <h2 className="font-cinzel text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Legal First Name *</label>
                <input
                  type="text"
                  value={legalFirstName}
                  onChange={(e) => setLegalFirstName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Legal Middle Name</label>
                <input
                  type="text"
                  value={legalMiddleName}
                  onChange={(e) => setLegalMiddleName(e.target.value)}
                  placeholder="Optional"
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Legal Last Name *</label>
                <input
                  type="text"
                  value={legalLastName}
                  onChange={(e) => setLegalLastName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={`${legalFirstName} ${legalLastName}`.trim() || 'How you refer to them'}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
                  >
                    {COUNTRY_CODES.map(cc => (
                      <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.flag} {cc.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value, countryCode))}
                    placeholder={countryCode === '+1' ? '(555) 123-4567' : '555 123 4567'}
                    className="flex-1 p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Link to Primary Customer */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Account Association</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Primary Customer (if this is a sub-customer)</label>
              <select
                value={primaryCustomerId}
                onChange={(e) => setPrimaryCustomerId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
              >
                <option value="">— None (This is a primary customer) —</option>
                {primaryCustomers
                  .filter(pc => pc.id !== customer?.id)
                  .map(pc => (
                    <option key={pc.id} value={pc.id}>{pc.displayName}</option>
                  ))
                }
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Leave empty if this customer is the account holder</p>
            </div>
          </div>

          {/* Travel Documents */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Travel Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Passport Number</label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Passport Expiry</label>
                <input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Passport Country</label>
                <input
                  type="text"
                  value={passportCountry}
                  onChange={(e) => setPassportCountry(e.target.value)}
                  placeholder="e.g., USA"
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
            </div>
          </div>

          {/* Loyalty Programs */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loyalty Programs</h3>
              <button
                type="button"
                onClick={addLoyaltyProgram}
                className="text-[10px] text-paragon font-bold hover:text-paragon-dark"
              >
                + Add Program
              </button>
            </div>
            {loyaltyPrograms.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No loyalty programs added</p>
            ) : (
              <div className="space-y-3">
                {loyaltyPrograms.map((lp, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded items-end">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Program</label>
                      <input
                        type="text"
                        value={lp.program}
                        onChange={(e) => updateLoyaltyProgram(idx, 'program', e.target.value)}
                        placeholder="e.g., United MileagePlus"
                        className="w-full p-2 border border-slate-200 rounded-sm text-xs outline-none focus:ring-2 focus:ring-paragon"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Number</label>
                      <input
                        type="text"
                        value={lp.number}
                        onChange={(e) => updateLoyaltyProgram(idx, 'number', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-sm text-xs outline-none focus:ring-2 focus:ring-paragon font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Status</label>
                      <input
                        type="text"
                        value={lp.status || ''}
                        onChange={(e) => updateLoyaltyProgram(idx, 'status', e.target.value)}
                        placeholder="e.g., Gold, 1K"
                        className="w-full p-2 border border-slate-200 rounded-sm text-xs outline-none focus:ring-2 focus:ring-paragon"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLoyaltyProgram(idx)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Seat Preference</label>
                <select
                  value={seatPreference}
                  onChange={(e) => setSeatPreference(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
                >
                  <option value="">No preference</option>
                  <option value="aisle">Aisle</option>
                  <option value="window">Window</option>
                  <option value="middle">Middle</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Dietary Restrictions</label>
                <input
                  type="text"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g., Kosher, Vegetarian (comma-separated)"
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Hotel Preferences</label>
                <input
                  type="text"
                  value={hotelPreferences}
                  onChange={(e) => setHotelPreferences(e.target.value)}
                  placeholder="e.g., High floor, king bed, quiet room"
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Special Requests</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., Always arrange ground transportation"
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any important information about this customer..."
              rows={3}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 flex gap-3 flex-shrink-0">
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${customer?.displayName || 'this customer'}? This cannot be undone.`)) {
                  onDelete(customer!.id);
                }
              }}
              className="py-2.5 px-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors rounded-sm"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
          >
            {isEditing ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer List Item Component
const CustomerListItem: React.FC<{
  customer: Customer;
  subCustomers: Customer[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  isSelected: boolean;
}> = ({ customer, subCustomers, isExpanded, onToggle, onSelect, onEdit, onDelete, isSelected }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`border rounded-sm mb-2 overflow-hidden transition-all ${isSelected ? 'border-paragon bg-paragon-light/20' : 'border-slate-200 bg-white'}`}>
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-paragon/10 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-paragon text-sm">{getInitials(customer.displayName)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800">{customer.displayName}</span>
              {subCustomers.length > 0 && (
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  +{subCustomers.length} {subCustomers.length === 1 ? 'traveler' : 'travelers'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{customer.email || customer.phone || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
            <span className="hidden sm:inline text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">
              {customer.loyaltyPrograms[0].status || customer.loyaltyPrograms[0].program}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4">
          {/* Customer Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Legal Name</p>
              <p className="text-xs font-semibold text-slate-700">{customer.legalFirstName} {customer.legalMiddleName ? `${customer.legalMiddleName} ` : ''}{customer.legalLastName}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Date of Birth</p>
              <p className="text-xs font-semibold text-slate-700">{formatDate(customer.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Phone</p>
              <p className="text-xs font-semibold text-slate-700">{customer.phone || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Seat Pref</p>
              <p className="text-xs font-semibold text-slate-700 capitalize">{customer.preferences?.seatPreference || '—'}</p>
            </div>
          </div>

          {/* Loyalty Programs */}
          {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
            <div className="mb-4">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-2">Loyalty Programs</p>
              <div className="flex flex-wrap gap-2">
                {customer.loyaltyPrograms.map((lp, idx) => (
                  <span key={idx} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded">
                    <span className="font-semibold">{lp.program}</span>
                    {lp.status && <span className="text-amber-600 ml-1">({lp.status})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="mb-4">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-1">Notes</p>
              <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">{customer.notes}</p>
            </div>
          )}

          {/* Sub-Customers */}
          {subCustomers.length > 0 && (
            <div className="mb-4">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-2">Associated Travelers</p>
              <div className="space-y-2">
                {subCustomers.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-white p-2 rounded border border-slate-100 hover:border-paragon transition-colors"
                  >
                    <div
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onSelect(sub); }}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="font-bold text-slate-500 text-[10px]">{getInitials(sub.displayName)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{sub.displayName}</p>
                        <p className="text-[10px] text-slate-400">{sub.preferences?.seatPreference ? `${sub.preferences.seatPreference} seat` : 'No preferences'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(sub); }}
                        className="p-1.5 text-slate-400 hover:text-paragon hover:bg-slate-100 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${sub.displayName}? This cannot be undone.`)) {
                            onDelete(sub.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(customer); }}
              className="flex-1 sm:flex-none px-4 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors"
            >
              View Full Profile
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Customer Detail Modal
const CustomerDetailModal: React.FC<{
  customer: Customer;
  primaryCustomer?: Customer;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}> = ({ customer, primaryCustomer, onClose, onEdit }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[70vh] md:max-h-[80vh] flex flex-col rounded-sm shadow-2xl animate-zoomIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-start">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-slate-900">{customer.displayName}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {customer.legalFirstName} {customer.legalMiddleName ? `${customer.legalMiddleName} ` : ''}{customer.legalLastName}
              {primaryCustomer && (
                <span className="ml-2 text-paragon">• Under {primaryCustomer.displayName}'s account</span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Date of Birth</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(customer.dateOfBirth)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-700">{customer.email || '—'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-slate-700">{customer.phone || '—'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passport Country</p>
                <p className="text-sm font-semibold text-slate-700">{customer.passportCountry || '—'}</p>
              </div>
            </div>
          </div>

          {/* Travel Documents */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Travel Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passport Number</p>
                <p className="text-sm font-mono font-semibold text-slate-700">{customer.passportNumber || '—'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passport Expiry</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(customer.passportExpiry)}</p>
              </div>
            </div>
          </div>

          {/* Loyalty Programs */}
          {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Loyalty Programs</h3>
              <div className="space-y-2">
                {customer.loyaltyPrograms.map((lp, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{lp.program}</p>
                      <p className="text-xs font-mono text-slate-500">{lp.number}</p>
                    </div>
                    {lp.status && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">{lp.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {customer.preferences && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Seat Preference</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{customer.preferences.seatPreference || '—'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Dietary Restrictions</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {customer.preferences.dietaryRestrictions?.length ? customer.preferences.dietaryRestrictions.join(', ') : '—'}
                  </p>
                </div>
                {customer.preferences.hotelPreferences && (
                  <div className="bg-slate-50 p-3 rounded sm:col-span-2">
                    <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Hotel Preferences</p>
                    <p className="text-sm text-slate-700">{customer.preferences.hotelPreferences}</p>
                  </div>
                )}
                {customer.preferences.specialRequests && (
                  <div className="bg-slate-50 p-3 rounded sm:col-span-2">
                    <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Special Requests</p>
                    <p className="text-sm text-slate-700">{customer.preferences.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Notes</h3>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(customer); }}
            className="flex-1 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
          >
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
};

const CRM: React.FC<CRMProps> = ({ requests = [], googleUser, onDeleteRequest }) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'my-requests' | 'my-bookings'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Fetch customers from API - filter by current agent's ID
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const agentId = googleUser?.googleId || googleUser?.id;
        if (!agentId) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/customers?agentId=${encodeURIComponent(agentId)}`);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [googleUser]);

  // Filter requests for current user (check both googleId and MongoDB id for backwards compatibility)
  const isOwnRequest = (r: { agentId: string }) =>
    r.agentId === googleUser?.googleId || r.agentId === googleUser?.id;

  const myRequests = requests
    .filter(r => isOwnRequest(r) && r.status !== 'CONVERTED')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const myBookings = requests
    .filter(r => isOwnRequest(r) && r.status === 'CONVERTED')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Get primary customers (those without a primaryCustomerId)
  const primaryCustomers = customers.filter(c => !c.primaryCustomerId);

  // Get sub-customers for a primary customer
  const getSubCustomers = (primaryId: string) => {
    return customers.filter(c => c.primaryCustomerId === primaryId);
  };

  // Get primary customer for a sub-customer
  const getPrimaryCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer?.primaryCustomerId) {
      return customers.find(c => c.id === customer.primaryCustomerId);
    }
    return undefined;
  };

  // Handle save (add or edit)
  const handleSaveCustomer = async (customer: Customer) => {
    try {
      const isExisting = customers.some(c => c.id === customer.id);

      if (isExisting) {
        // Update existing customer
        const res = await fetch(`${API_URL}/api/customers/${customer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer),
        });

        if (res.ok) {
          const updated = await res.json();
          setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        } else {
          const error = await res.json().catch(() => ({}));
          alert(`Failed to update customer: ${error.error || res.statusText}`);
          return;
        }
      } else {
        // Create new customer
        const res = await fetch(`${API_URL}/api/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...customer,
            createdBy: googleUser?.name || 'Unknown',
            agentId: googleUser?.googleId || googleUser?.id || '',
          }),
        });

        if (res.ok) {
          const newCustomer = await res.json();
          setCustomers(prev => [newCustomer, ...prev]);
        } else {
          const error = await res.json().catch(() => ({}));
          alert(`Failed to create customer: ${error.error || res.statusText}`);
          return;
        }
      }

      setShowAddModal(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save customer'}`);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        setEditingCustomer(null);
        setSelectedCustomer(null);
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Failed to delete customer: ${error.error || res.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete customer'}`);
    }
  };

  // Filter customers by search
  const filteredCustomers = primaryCustomers.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const subCustomers = getSubCustomers(c.id);
    return (
      c.displayName.toLowerCase().includes(query) ||
      c.legalFirstName.toLowerCase().includes(query) ||
      c.legalLastName.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      subCustomers.some(sub =>
        sub.displayName.toLowerCase().includes(query) ||
        sub.legalFirstName.toLowerCase().includes(query) ||
        sub.legalLastName.toLowerCase().includes(query)
      )
    );
  });

  // Format date helper
  const formatRequestDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'URGENT': return 'bg-amber-100 text-amber-700';
      case 'NORMAL': return 'bg-blue-100 text-blue-700';
      case 'LOW': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-700';
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FLIGHT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'HOTEL':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'LOGISTICS':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <SectionHeader title="CRM" subtitle="Manage customers, requests, and bookings" />

      {/* Subtabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('customers')}
          className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 -mb-[2px] ${
            activeSubTab === 'customers'
              ? 'text-paragon border-paragon'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
         My Customers
        </button>
        <button
          onClick={() => setActiveSubTab('my-requests')}
          className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${
            activeSubTab === 'my-requests'
              ? 'text-paragon border-paragon'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          My Requests
          {myRequests.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeSubTab === 'my-requests' ? 'bg-paragon/10' : 'bg-slate-100'}`}>
              {myRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('my-bookings')}
          className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${
            activeSubTab === 'my-bookings'
              ? 'text-paragon border-paragon'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          My Bookings
          {myBookings.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeSubTab === 'my-bookings' ? 'bg-paragon/10' : 'bg-slate-100'}`}>
              {myBookings.length}
            </span>
          )}
        </button>
      </div>

      {/* My Requests Tab */}
      {activeSubTab === 'my-requests' && (
        <div>
          {myRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium">No active requests</p>
              <p className="text-xs mt-1">Create requests from Command Center or Operations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map(request => {
                const isExpanded = expandedRequestId === request.id;
                return (
                  <div key={request.id} className={`bg-white border rounded-sm overflow-hidden transition-all ${isExpanded ? 'border-paragon' : 'border-slate-200 hover:border-slate-300'}`}>
                    {/* Header - Always visible */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                            {getTypeIcon(request.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-800">{request.type}</span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getStatusColor(request.status)}`}>
                                {request.status.replace('_', ' ')}
                              </span>
                            </div>
                            {request.details?.clientName && (
                              <p className="text-xs text-slate-600 mt-1">Client: {request.details.clientName}</p>
                            )}
                            {!isExpanded && request.details && (
                              <div className="mt-1 text-[10px] text-slate-400">
                                {request.details.origin && request.details.destination && (
                                  <span>{request.details.origin} → {request.details.destination}</span>
                                )}
                                {request.details.hotelName && (
                                  <span>{request.details.hotelName}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-[10px] text-slate-400">{formatRequestDate(request.timestamp)}</p>
                          <svg
                            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                        {/* Travel Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          {request.type === 'FLIGHT' && (
                            <>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Origin</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.origin || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Destination</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.destination || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Depart Date</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.departDate ? formatRequestDate(request.details.departDate) : '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Return Date</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.returnDate ? formatRequestDate(request.details.returnDate) : '—'}</p>
                              </div>
                              {request.details?.airline && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Airline</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.airline}</p>
                                </div>
                              )}
                              {request.details?.flightNumber && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Flight #</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.flightNumber}</p>
                                </div>
                              )}
                              {request.details?.cabinClass && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Cabin Class</p>
                                  <p className="text-xs font-semibold text-slate-700 capitalize">{request.details.cabinClass}</p>
                                </div>
                              )}
                              {request.details?.passengers && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passengers</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.passengers}</p>
                                </div>
                              )}
                            </>
                          )}
                          {request.type === 'HOTEL' && (
                            <>
                              <div className="sm:col-span-2">
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Hotel</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.hotelName || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Check-In</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.checkIn ? formatRequestDate(request.details.checkIn) : '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Check-Out</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.checkOut ? formatRequestDate(request.details.checkOut) : '—'}</p>
                              </div>
                              {request.details?.roomType && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Room Type</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.roomType}</p>
                                </div>
                              )}
                              {request.details?.guests && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Guests</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.guests}</p>
                                </div>
                              )}
                            </>
                          )}
                          {request.type === 'LOGISTICS' && (
                            <>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Pickup</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.origin || request.details?.pickupLocation || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Drop-off</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.destination || request.details?.dropoffLocation || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Date</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.departDate ? formatRequestDate(request.details.departDate) : '—'}</p>
                              </div>
                              {request.details?.vehicleType && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Vehicle</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.vehicleType}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Notes */}
                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-1">Notes</p>
                            <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 whitespace-pre-wrap">{request.notes}</p>
                          </div>
                        )}

                        {/* Footer with status info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getStatusColor(request.status)}`}>
                              {request.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Created: {formatRequestDate(request.timestamp)}
                            </span>
                          </div>
                          {onDeleteRequest && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete this request? This cannot be undone.`)) {
                                  onDeleteRequest(request.id);
                                }
                              }}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                            >
                              Delete Request
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Bookings Tab */}
      {activeSubTab === 'my-bookings' && (
        <div>
          {myBookings.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">No completed bookings yet</p>
              <p className="text-xs mt-1">Bookings will appear here when requests are converted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map(request => {
                const isExpanded = expandedBookingId === request.id;
                return (
                  <div key={request.id} className={`bg-white border rounded-sm overflow-hidden transition-all ${isExpanded ? 'border-emerald-400' : 'border-emerald-200 hover:border-emerald-300'}`}>
                    {/* Header - Always visible */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedBookingId(isExpanded ? null : request.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                            {getTypeIcon(request.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-800">{request.type}</span>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                BOOKED
                              </span>
                            </div>
                            {request.details?.clientName && (
                              <p className="text-xs text-slate-600 mt-1">Client: {request.details.clientName}</p>
                            )}
                            {!isExpanded && request.details && (
                              <div className="mt-1 text-[10px] text-slate-400">
                                {request.details.origin && request.details.destination && (
                                  <span>{request.details.origin} → {request.details.destination}</span>
                                )}
                                {request.details.hotelName && (
                                  <span>{request.details.hotelName}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-[10px] text-slate-400">{formatRequestDate(request.timestamp)}</p>
                          <svg
                            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-emerald-100 bg-emerald-50/30 p-4">
                        {/* Travel Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          {request.type === 'FLIGHT' && (
                            <>
                              {/* Booking Confirmation Info */}
                              {request.details?.pnr && (
                                <div className="sm:col-span-2 bg-white p-2 rounded border border-emerald-200">
                                  <p className="text-[9px] uppercase text-emerald-600 font-bold tracking-wider">PNR / Record Locator</p>
                                  <p className="text-sm font-mono font-bold text-slate-800">{request.details.pnr}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Origin</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.origin || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Destination</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.destination || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Flights</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.flights || `${request.details?.origin || ''} → ${request.details?.destination || ''}` || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Dates</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.dates || (request.details?.departDate ? formatRequestDate(request.details.departDate) : '—')}</p>
                              </div>
                              {request.details?.airline && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Airline</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.airline}</p>
                                </div>
                              )}
                              {(request.details?.passengerCount || request.details?.passengers) && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passengers</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.passengerCount || request.details.passengers}</p>
                                </div>
                              )}
                              {request.details?.cabinClass && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Cabin Class</p>
                                  <p className="text-xs font-semibold text-slate-700 capitalize">{request.details.cabinClass}</p>
                                </div>
                              )}
                              {request.details?.paymentStatus && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Payment</p>
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${request.details.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {request.details.paymentStatus}
                                  </span>
                                </div>
                              )}
                              {request.details?.bookingStatus && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Booking Status</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.bookingStatus}</p>
                                </div>
                              )}
                            </>
                          )}
                          {request.type === 'HOTEL' && (
                            <>
                              {/* Booking Confirmation Info */}
                              {request.details?.confirmationNumber && (
                                <div className="sm:col-span-2 bg-white p-2 rounded border border-emerald-200">
                                  <p className="text-[9px] uppercase text-emerald-600 font-bold tracking-wider">Confirmation Number</p>
                                  <p className="text-sm font-mono font-bold text-slate-800">{request.details.confirmationNumber}</p>
                                </div>
                              )}
                              <div className="sm:col-span-2">
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Hotel</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.hotelName || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Check-In</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.checkIn ? formatRequestDate(request.details.checkIn) : '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Check-Out</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.checkOut ? formatRequestDate(request.details.checkOut) : '—'}</p>
                              </div>
                              {request.details?.roomType && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Room Type</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.roomType}</p>
                                </div>
                              )}
                              {(request.details?.guestCount || request.details?.guests) && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Guests</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.guestCount || request.details.guests}</p>
                                </div>
                              )}
                              {request.details?.paymentStatus && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Payment</p>
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${request.details.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {request.details.paymentStatus}
                                  </span>
                                </div>
                              )}
                              {request.details?.bookingStatus && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Booking Status</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.bookingStatus}</p>
                                </div>
                              )}
                            </>
                          )}
                          {request.type === 'LOGISTICS' && (
                            <>
                              {/* Booking Confirmation Info */}
                              {request.details?.confirmationNumber && (
                                <div className="sm:col-span-2 bg-white p-2 rounded border border-emerald-200">
                                  <p className="text-[9px] uppercase text-emerald-600 font-bold tracking-wider">Confirmation Number</p>
                                  <p className="text-sm font-mono font-bold text-slate-800">{request.details.confirmationNumber}</p>
                                </div>
                              )}
                              {request.details?.serviceType && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Service Type</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.serviceType}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Pickup</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.origin || request.details?.pickupLocation || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Drop-off</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.destination || request.details?.dropoffLocation || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Date</p>
                                <p className="text-xs font-semibold text-slate-700">{request.details?.date || (request.details?.departDate ? formatRequestDate(request.details.departDate) : '—')}</p>
                              </div>
                              {request.details?.logisticsDetails && (
                                <div className="sm:col-span-2">
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Details</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.logisticsDetails}</p>
                                </div>
                              )}
                              {request.details?.paymentStatus && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Payment</p>
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${request.details.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {request.details.paymentStatus}
                                  </span>
                                </div>
                              )}
                              {request.details?.bookingStatus && (
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Booking Status</p>
                                  <p className="text-xs font-semibold text-slate-700">{request.details.bookingStatus}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Booking Agent */}
                        {request.details?.bookingAgent && (
                          <div className="mb-4">
                            <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-1">Booked By</p>
                            <p className="text-xs font-semibold text-slate-700">{request.details.bookingAgent}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-1">Notes</p>
                            <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 whitespace-pre-wrap">{request.notes}</p>
                          </div>
                        )}

                        {/* Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Created: {formatRequestDate(request.timestamp)}
                            </span>
                          </div>
                          {onDeleteRequest && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete this booking? This cannot be undone.`)) {
                                  onDeleteRequest(request.id);
                                }
                              }}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                            >
                              Delete Booking
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeSubTab === 'customers' && (
        <>
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Accounts</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{primaryCustomers.length}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Primary customers</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Travelers</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{customers.length}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Including family</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">With Loyalty</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">
            {customers.filter(c => c.loyaltyPrograms && c.loyaltyPrograms.length > 0).length}
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5">Have programs</p>
        </div>
      </div>

      {/* Customer List */}
      <div className="mb-4">
        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">{searchQuery ? 'No customers match your search.' : 'No customers yet.'}</p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-paragon font-bold text-sm hover:text-paragon-dark"
            >
              + Add your first customer
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredCustomers.map(customer => (
            <CustomerListItem
              key={customer.id}
              customer={customer}
              subCustomers={getSubCustomers(customer.id)}
              isExpanded={expandedId === customer.id}
              onToggle={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
              onSelect={(c) => setSelectedCustomer(c)}
              onEdit={(c) => setEditingCustomer(c)}
              onDelete={handleDeleteCustomer}
              isSelected={selectedCustomer?.id === customer.id}
            />
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          primaryCustomer={getPrimaryCustomer(selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)}
          onEdit={(c) => setEditingCustomer(c)}
        />
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <CustomerFormModal
          primaryCustomers={primaryCustomers}
          onSave={handleSaveCustomer}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <CustomerFormModal
          customer={editingCustomer}
          primaryCustomers={primaryCustomers}
          onSave={handleSaveCustomer}
          onDelete={handleDeleteCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}
        </>
      )}
    </div>
  );
};

export default CRM;
