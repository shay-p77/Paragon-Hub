
import React, { useState, useEffect } from 'react';
import { SectionHeader } from './Shared';
import { Customer, LoyaltyProgram } from '../types';
import { GoogleUser } from './Login';
import { API_URL } from '../config';

interface ClientDatabaseProps {
  googleUser?: GoogleUser | null;
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

// Customer Form Modal Component (Full form for add/edit)
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

  const addLoyaltyProgram = () => {
    setLoyaltyPrograms([...loyaltyPrograms, { program: '', number: '', status: '' }]);
  };

  const updateLoyaltyProgram = (index: number, field: keyof LoyaltyProgram, value: string) => {
    const updated = [...loyaltyPrograms];
    updated[index] = { ...updated[index], [field]: value };
    setLoyaltyPrograms(updated);
  };

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
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <h2 className="font-cinzel text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Date of Birth
                  <span className="ml-1 text-emerald-600 text-[8px]">ENCRYPTED</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Email
                  <span className="ml-1 text-emerald-600 text-[8px]">ENCRYPTED</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Phone
                  <span className="ml-1 text-emerald-600 text-[8px]">ENCRYPTED</span>
                </label>
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
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Primary Customer (if sub-customer)</label>
              <select
                value={primaryCustomerId}
                onChange={(e) => setPrimaryCustomerId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
              >
                <option value="">-- None (This is a primary customer) --</option>
                {primaryCustomers
                  .filter(pc => pc.id !== customer?.id)
                  .map(pc => (
                    <option key={pc.id} value={pc.id}>{pc.displayName}</option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Travel Documents */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Travel Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Passport Number
                  <span className="ml-1 text-emerald-600 text-[8px]">ENCRYPTED</span>
                </label>
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
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Loyalty Programs
                <span className="ml-1 text-emerald-600 text-[8px]">NUMBERS ENCRYPTED</span>
              </h3>
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
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Notes
              <span className="ml-1 text-emerald-600 text-[8px]">ENCRYPTED</span>
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any important information about this customer..."
              rows={3}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon resize-none"
            />
          </div>
        </form>

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

// Customer Detail Modal
const CustomerDetailModal: React.FC<{
  customer: Customer;
  primaryCustomer?: Customer;
  subCustomers: Customer[];
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}> = ({ customer, primaryCustomer, subCustomers, onClose, onEdit }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[70vh] md:max-h-[80vh] flex flex-col rounded-sm shadow-2xl animate-zoomIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-paragon/10 flex items-center justify-center">
                <span className="font-bold text-paragon text-lg">
                  {customer.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="font-cinzel text-xl font-bold text-slate-900">{customer.displayName}</h2>
                <p className="text-xs text-slate-500">
                  {customer.legalFirstName} {customer.legalLastName}
                  {primaryCustomer && (
                    <span className="ml-2 text-paragon">| Under {primaryCustomer.displayName}'s account</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Contact & Basic Info */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              Personal Information
              <span className="text-emerald-600 text-[8px] bg-emerald-50 px-1.5 py-0.5 rounded">PII ENCRYPTED</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Date of Birth</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(customer.dateOfBirth)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{customer.email || '---'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-slate-700">{customer.phone || '---'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Created</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Travel Documents */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Travel Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passport Number</p>
                <p className="text-sm font-mono font-semibold text-slate-700">{customer.passportNumber || '---'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passport Expiry</p>
                <p className={`text-sm font-semibold ${customer.passportExpiry && new Date(customer.passportExpiry) < new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) ? 'text-amber-600' : 'text-slate-700'}`}>
                  {formatDate(customer.passportExpiry)}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Country</p>
                <p className="text-sm font-semibold text-slate-700">{customer.passportCountry || '---'}</p>
              </div>
            </div>
          </div>

          {/* Loyalty Programs */}
          {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Loyalty Programs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Seat</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{customer.preferences.seatPreference || '---'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Dietary</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {customer.preferences.dietaryRestrictions?.length ? customer.preferences.dietaryRestrictions.join(', ') : '---'}
                  </p>
                </div>
                {customer.preferences.hotelPreferences && (
                  <div className="bg-slate-50 p-3 rounded sm:col-span-2">
                    <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Hotel</p>
                    <p className="text-sm text-slate-700">{customer.preferences.hotelPreferences}</p>
                  </div>
                )}
                {customer.preferences.specialRequests && (
                  <div className="bg-slate-50 p-3 rounded sm:col-span-4">
                    <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Special Requests</p>
                    <p className="text-sm text-slate-700">{customer.preferences.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-Customers */}
          {subCustomers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Associated Travelers ({subCustomers.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subCustomers.map(sub => (
                  <div key={sub.id} className="bg-slate-50 p-3 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="font-bold text-slate-500 text-xs">
                          {sub.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{sub.displayName}</p>
                        <p className="text-[10px] text-slate-400">{sub.email || 'No email'}</p>
                      </div>
                    </div>
                  </div>
                ))}
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

const ClientDatabase: React.FC<ClientDatabaseProps> = ({ googleUser }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'primary' | 'sub'>('all');

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/customers`);
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
  }, []);

  // Get primary customers
  const primaryCustomers = customers.filter(c => !c.primaryCustomerId);

  // Get sub-customers for a customer
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

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(c => {
      // Apply type filter
      if (filterType === 'primary' && c.primaryCustomerId) return false;
      if (filterType === 'sub' && !c.primaryCustomerId) return false;

      // Apply search
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.displayName.toLowerCase().includes(query) ||
        c.legalFirstName.toLowerCase().includes(query) ||
        c.legalLastName.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle save
  const handleSaveCustomer = async (customer: Customer) => {
    try {
      const isExisting = customers.some(c => c.id === customer.id);

      if (isExisting) {
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
        const res = await fetch(`${API_URL}/api/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...customer,
            createdBy: googleUser?.name || 'Unknown',
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

  // Handle delete
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
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Stats
  const totalCustomers = customers.length;
  const primaryCount = primaryCustomers.length;
  const subCount = customers.filter(c => c.primaryCustomerId).length;
  const withLoyalty = customers.filter(c => c.loyaltyPrograms && c.loyaltyPrograms.length > 0).length;
  const withPassport = customers.filter(c => c.passportNumber).length;

  return (
    <div className="p-4 sm:p-8">
      <SectionHeader
        title="Client Database"
        subtitle="Complete customer catalogue with encrypted PII storage"
      />

      {/* Security Banner */}
      <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-sm p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-800">AES-256-GCM Encryption Active</p>
          <p className="text-[10px] text-emerald-600">Passport numbers, DOB, phone, email, notes, and loyalty numbers are encrypted at rest</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalCustomers}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">All records</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Primary</p>
          <p className="text-xl sm:text-2xl font-bold text-paragon">{primaryCount}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Account holders</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Sub</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-600">{subCount}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Associated travelers</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Loyalty</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">{withLoyalty}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">With programs</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Passport</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{withPassport}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">On file</p>
        </div>
      </div>

      {/* Search, Filter, and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2.5 border border-slate-200 rounded-sm text-xs outline-none focus:ring-2 focus:ring-paragon bg-white"
          >
            <option value="all">All Customers</option>
            <option value="primary">Primary Only</option>
            <option value="sub">Sub-Customers</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2.5 border border-slate-200 rounded-sm text-xs outline-none focus:ring-2 focus:ring-paragon bg-white"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="updated-desc">Recently Updated</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-paragon mx-auto mb-4"></div>
          <p className="text-sm">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-sm border border-slate-200">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium">{searchQuery ? 'No customers match your search.' : 'No customers yet.'}</p>
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
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-bold tracking-widest text-slate-500">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Passport</div>
            <div className="col-span-2">Loyalty</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Customer Rows */}
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map(customer => {
              const isPrimary = !customer.primaryCustomerId;
              const subCount = getSubCustomers(customer.id).length;
              const primary = getPrimaryCustomer(customer.id);

              return (
                <div
                  key={customer.id}
                  className="lg:grid lg:grid-cols-12 gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  {/* Name */}
                  <div className="col-span-3 flex items-center gap-3 mb-3 lg:mb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPrimary ? 'bg-paragon/10' : 'bg-slate-100'}`}>
                      <span className={`font-bold text-sm ${isPrimary ? 'text-paragon' : 'text-slate-500'}`}>
                        {customer.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-800 truncate">{customer.displayName}</p>
                        {isPrimary && subCount > 0 && (
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">
                            +{subCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {isPrimary ? 'Primary' : `Under ${primary?.displayName || 'Unknown'}`}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    <p className="text-xs text-slate-700 truncate">{customer.email || '---'}</p>
                    <p className="text-[10px] text-slate-400">{customer.phone || '---'}</p>
                  </div>

                  {/* Passport */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    {customer.passportNumber ? (
                      <>
                        <p className="text-xs font-mono text-slate-700">{customer.passportCountry || '---'}</p>
                        <p className={`text-[10px] ${customer.passportExpiry && new Date(customer.passportExpiry) < new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                          Exp: {formatDate(customer.passportExpiry)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-300">No passport</p>
                    )}
                  </div>

                  {/* Loyalty */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {customer.loyaltyPrograms.slice(0, 2).map((lp, idx) => (
                          <span key={idx} className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                            {lp.status || lp.program.split(' ')[0]}
                          </span>
                        ))}
                        {customer.loyaltyPrograms.length > 2 && (
                          <span className="text-[9px] text-slate-400">+{customer.loyaltyPrograms.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300">None</p>
                    )}
                  </div>

                  {/* Created */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    <p className="text-xs text-slate-600">{formatDate(customer.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center gap-1 justify-end lg:justify-start">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}
                      className="p-1.5 text-slate-400 hover:text-paragon hover:bg-paragon/5 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${customer.displayName}? This cannot be undone.`)) {
                          handleDeleteCustomer(customer.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          primaryCustomer={getPrimaryCustomer(selectedCustomer.id)}
          subCustomers={getSubCustomers(selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)}
          onEdit={(c) => { setSelectedCustomer(null); setEditingCustomer(c); }}
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
    </div>
  );
};

export default ClientDatabase;
