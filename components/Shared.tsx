
import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';
import { Customer, Vendor, VendorType } from '../types';

// All country codes with flags (US first, then sorted alphabetically)
export const COUNTRY_CODES = [
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
export const formatPhoneNumber = (value: string, countryCode: string): string => {
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

// All countries alphabetically sorted (for passport country dropdown)
export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua & Barbuda', 'Argentina',
  'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia & Herzegovina', 'Botswana',
  'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Congo (DRC)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
  'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 'Malaysia',
  'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts & Nevis', 'Saint Lucia', 'Saint Vincent', 'Samoa', 'San Marino', 'São Tomé & Príncipe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad & Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

// Searchable Country Select Component
export const CountrySelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Select country...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus-within:ring-2 focus-within:ring-paragon bg-white cursor-pointer flex items-center justify-between"
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="w-full outline-none text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>
            {value || placeholder}
          </span>
        )}
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map(country => (
              <button
                key={country}
                type="button"
                onClick={() => handleSelect(country)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                  country === value ? 'bg-paragon/10 text-paragon font-medium' : 'text-slate-700'
                }`}
              >
                {country}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">No countries found</div>
          )}
        </div>
      )}
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4 sm:mb-6">
    <h2 className="font-cinzel text-base sm:text-xl font-bold text-slate-900 uppercase tracking-wide">{title}</h2>
    {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
  </div>
);

export const DataTable: React.FC<{
  headers: string[];
  children: React.ReactNode;
}> = ({ headers, children }) => (
  <div className="overflow-x-auto border border-slate-200 rounded-sm shadow-sm bg-white -mx-4 sm:mx-0">
    <table className="w-full text-left text-[10px] sm:text-[11px] uppercase tracking-tight min-w-[600px]">
      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">
        {children}
      </tbody>
    </table>
  </div>
);

export const Badge: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    gold: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border text-[8px] sm:text-[10px] font-bold whitespace-nowrap ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

// Confirmation Modal for delete actions
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', variant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <svg className={`w-5 h-5 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
            <p className="text-xs text-slate-500 mt-2">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-700 text-[10px] py-2.5 px-4 font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 text-white text-[10px] py-2.5 px-4 font-bold uppercase tracking-widest transition-colors rounded-sm ${
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Client Name Autocomplete Component
interface CustomerOption {
  id: string;
  name: string;
  email?: string;
}

export const ClientAutocomplete: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSelectCustomer?: (customer: CustomerOption) => void;
  customers: CustomerOption[];
  onAddNewClient?: () => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}> = ({ value, onChange, onSelectCustomer, customers, onAddNewClient, placeholder = 'Type client name...', required = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter customers based on search (with null safety)
  const searchTerm = (searchQuery || value || '').toLowerCase();
  const filteredCustomers = customers.filter(c =>
    c?.name && c.name.toLowerCase().includes(searchTerm)
  );

  // Show "Add new client" when no exact match
  const hasExactMatch = customers.some(c => c?.name && c.name.toLowerCase() === searchTerm);
  const showAddNew = (searchQuery || value).length > 0 && !hasExactMatch && onAddNewClient;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectCustomer = (customer: CustomerOption) => {
    onChange(customer.name);
    if (onSelectCustomer) onSelectCustomer(customer);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(false);
    if (onAddNewClient) onAddNewClient();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-sm"
      />

      {isOpen && (filteredCustomers.length > 0 || showAddNew) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {filteredCustomers.slice(0, 5).map(customer => (
            <button
              key={customer.id}
              type="button"
              onClick={() => handleSelectCustomer(customer)}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
            >
              <div className="text-xs font-medium text-slate-900">{customer.name}</div>
              {customer.email && (
                <div className="text-[10px] text-slate-400">{customer.email}</div>
              )}
            </button>
          ))}

          {showAddNew && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-3 py-2 text-left hover:bg-teal-50 transition-colors flex items-center gap-2 border-t border-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-teal-700">Add new client</div>
                <div className="text-[10px] text-teal-500">Create "{searchQuery || value}" as new customer</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Agent type for dropdown
interface AgentOption {
  id: string;
  name: string;
}

// Quick Add Customer Modal - for adding customers from autocomplete
export const QuickAddCustomerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (customer: { id: string; name: string; email?: string; agentId?: string }) => void;
  initialName?: string;
  agents?: AgentOption[];
  defaultAgentId?: string;
}> = ({ isOpen, onClose, onCustomerAdded, initialName = '', agents = [], defaultAgentId = '' }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [agentId, setAgentId] = useState(defaultAgentId);
  const [saving, setSaving] = useState(false);

  // Parse initial name into first/last
  useEffect(() => {
    if (initialName && isOpen) {
      const parts = initialName.trim().split(' ');
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      } else {
        setFirstName(initialName);
        setLastName('');
      }
      setDisplayName(initialName);
    }
  }, [initialName, isOpen]);

  // Set default agent when modal opens
  useEffect(() => {
    if (isOpen && defaultAgentId) {
      setAgentId(defaultAgentId);
    }
  }, [isOpen, defaultAgentId]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setDisplayName('');
    setEmail('');
    setCountryCode('+1');
    setPhone('');
    setAgentId(defaultAgentId);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumber(value, countryCode));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) return;

    setSaving(true);
    try {
      const newCustomer: Partial<Customer> & { agentId?: string } = {
        legalFirstName: firstName.trim(),
        legalLastName: lastName.trim(),
        displayName: displayName.trim() || `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim() || undefined,
        phone: phone.trim() ? `${countryCode} ${phone.trim()}` : undefined,
        agentId: agentId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (res.ok) {
        const saved = await res.json();
        onCustomerAdded({
          id: saved.id,
          name: saved.displayName || `${saved.legalFirstName} ${saved.legalLastName}`,
          email: saved.email,
          agentId: saved.agentId
        });
        handleClose();
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={handleClose}>
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Add New Customer</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Quick add - you can edit full details later in CRM</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Legal first name"
                className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Legal last name"
                className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you refer to them (e.g., nickname)"
              className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
            <div className="flex gap-1">
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setPhone(formatPhoneNumber(phone.replace(/\D/g, ''), e.target.value));
                }}
                className="w-24 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
              >
                {COUNTRY_CODES.map((cc, idx) => (
                  <option key={`${cc.code}-${idx}`} value={cc.code}>
                    {cc.flag} {cc.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={countryCode === '+1' ? '(555) 000-0000' : '000 000 0000'}
                className="flex-1 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
              />
            </div>
          </div>
          {agents.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
              >
                <option value="">No agent assigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-100 text-slate-700 text-[10px] py-2.5 px-4 font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!firstName.trim() || !lastName.trim() || saving}
            className="flex-1 bg-paragon text-white text-[10px] py-2.5 px-4 font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Vendor option type for autocomplete
interface VendorOption {
  id: string;
  name: string;
  code?: string;
  commissionPercent?: number;
}

// Vendor Autocomplete with quick-add option
export const VendorAutocomplete: React.FC<{
  value: string;
  vendorId?: string;
  onChange: (value: string, vendorId?: string) => void;
  onSelectVendor?: (vendor: VendorOption) => void;
  vendors: VendorOption[];
  vendorType: VendorType;
  onAddNewVendor?: () => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}> = ({ value, vendorId, onChange, onSelectVendor, vendors, vendorType, onAddNewVendor, placeholder = 'Type vendor name...', required = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter vendors based on search (with null safety)
  const searchTerm = (searchQuery || value || '').toLowerCase();
  const filteredVendors = vendors.filter(v =>
    (v?.name && v.name.toLowerCase().includes(searchTerm)) ||
    (v?.code && v.code.toLowerCase().includes(searchTerm))
  );

  // Show "Add new vendor" when no exact match
  const hasExactMatch = vendors.some(v => v?.name && v.name.toLowerCase() === searchTerm);
  const showAddNew = (searchQuery || value).length > 0 && !hasExactMatch && onAddNewVendor;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue, undefined);
    setIsOpen(true);
  };

  const handleSelectVendor = (vendor: VendorOption) => {
    onChange(vendor.name, vendor.id);
    if (onSelectVendor) onSelectVendor(vendor);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(false);
    if (onAddNewVendor) onAddNewVendor();
  };

  const getTypeLabel = () => {
    switch (vendorType) {
      case 'FLIGHT': return 'flight';
      case 'HOTEL': return 'hotel';
      case 'LOGISTICS': return 'logistics';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-paragon rounded-sm"
      />

      {isOpen && (filteredVendors.length > 0 || showAddNew) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {filteredVendors.slice(0, 5).map(vendor => (
            <button
              key={vendor.id}
              type="button"
              onClick={() => handleSelectVendor(vendor)}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-slate-900">{vendor.name}</div>
                {vendor.code && (
                  <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                    {vendor.code}
                  </span>
                )}
              </div>
              {vendor.commissionPercent !== undefined && (
                <div className="text-[10px] text-emerald-600">{vendor.commissionPercent}% commission</div>
              )}
            </button>
          ))}

          {showAddNew && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 border-t border-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-blue-700">Add new {getTypeLabel()} vendor</div>
                <div className="text-[10px] text-blue-500">Create "{searchQuery || value}" as new vendor</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Quick Add Vendor Modal - for adding vendors from autocomplete
export const QuickAddVendorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVendorAdded: (vendor: { id: string; name: string; code?: string; commissionPercent?: number }) => void;
  vendorType: VendorType;
  initialName?: string;
}> = ({ isOpen, onClose, onVendorAdded, vendorType, initialName = '' }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [saving, setSaving] = useState(false);

  // Set initial name when modal opens
  useEffect(() => {
    if (initialName && isOpen) {
      setName(initialName);
    }
  }, [initialName, isOpen]);

  const resetForm = () => {
    setName('');
    setCode('');
    setCommissionPercent('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      const newVendor = {
        name: name.trim(),
        code: code.trim() || undefined,
        type: vendorType,
        commissionPercent: parseFloat(commissionPercent) || 0,
      };

      const res = await fetch(`${API_URL}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor),
      });

      if (res.ok) {
        const saved = await res.json();
        onVendorAdded({
          id: saved.id,
          name: saved.name,
          code: saved.code,
          commissionPercent: saved.commissionPercent
        });
        handleClose();
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const getTypeLabel = () => {
    switch (vendorType) {
      case 'FLIGHT': return 'Flight';
      case 'HOTEL': return 'Hotel';
      case 'LOGISTICS': return 'Logistics';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={handleClose}>
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Quick Add {getTypeLabel()} Vendor</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Add basic info now, details later in Settings</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., JOY Travel"
              className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., IH6K"
                className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commission %</label>
              <input
                type="text"
                inputMode="decimal"
                value={commissionPercent}
                onChange={(e) => {
                  // Allow only numbers and decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Prevent multiple decimal points
                  const parts = value.split('.');
                  if (parts.length > 2) return;
                  setCommissionPercent(value);
                }}
                placeholder="0"
                className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-100 text-slate-700 text-[10px] py-2.5 px-4 font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="flex-1 bg-paragon text-white text-[10px] py-2.5 px-4 font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Add Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
};
