import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from './Shared';

interface PassengerInput {
  text: string;
  gender: 'M' | 'F';
  passengerType: 'adult' | 'child' | 'infant_lap' | 'auto';
}

interface ParsedPassenger {
  firstName: string;
  lastName: string;
  dob: Date;
  dobFormatted: string;
  email?: string;
  gender: 'M' | 'F';
  passengerType: 'adult' | 'child' | 'infant_lap';
  age: number;
  passengerNumber?: number;
  associatedAdultNumber?: number;
}

interface SabreToolProps {
  googleUser?: { name?: string; picture?: string } | null;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_MAP: { [key: string]: number } = {
  'jan': 0, 'january': 0,
  'feb': 1, 'february': 1,
  'mar': 2, 'march': 2,
  'apr': 3, 'april': 3,
  'may': 4,
  'jun': 5, 'june': 5,
  'jul': 6, 'july': 6,
  'aug': 7, 'august': 7,
  'sep': 8, 'sept': 8, 'september': 8,
  'oct': 9, 'october': 9,
  'nov': 10, 'november': 10,
  'dec': 11, 'december': 11
};

const SabreTool: React.FC<SabreToolProps> = ({ googleUser }) => {
  const initialPassengers: PassengerInput[] = Array(10).fill(null).map(() => ({
    text: '',
    gender: 'M' as const,
    passengerType: 'auto' as const
  }));

  const [passengers, setPassengers] = useState<PassengerInput[]>(initialPassengers);
  const [dateFormat, setDateFormat] = useState<'DMY' | 'MDY'>('MDY');
  const [nameOrder, setNameOrder] = useState<'regular' | 'family_first'>('regular');
  const [showPDT, setShowPDT] = useState(true);
  const [returnFlightDate, setReturnFlightDate] = useState<string>('');
  const [output, setOutput] = useState({ names: '', docs: '' });
  const [copied, setCopied] = useState<'names' | 'docs' | null>(null);

  // Parse two-digit year: if < 30, assume 20XX, else 19XX
  const parseYear = (yearStr: string): number => {
    const year = parseInt(yearStr, 10);
    if (yearStr.length === 2) {
      return year < 30 ? 2000 + year : 1900 + year;
    }
    return year;
  };

  // Format date to DDMMMYY (e.g., 20MAY93)
  const formatDateSabre = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day}${month}${year}`;
  };

  // Calculate age on a specific date
  const calculateAge = (birthDate: Date, onDate: Date): number => {
    let age = onDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = onDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && onDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Parse date from various formats
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    dateStr = dateStr.trim();

    // Remove ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
    dateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

    // Pre-formatted Sabre date: 01MAY91
    const sabreMatch = dateStr.match(/^(\d{1,2})([A-Z]{3})(\d{2})$/i);
    if (sabreMatch) {
      const day = parseInt(sabreMatch[1], 10);
      const monthIdx = MONTH_MAP[sabreMatch[2].toLowerCase()];
      const year = parseYear(sabreMatch[3]);
      if (monthIdx !== undefined) {
        return new Date(year, monthIdx, day);
      }
    }

    // ISO format: 1994-10-10
    const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    }

    // Named month formats: June 12, 1987 | 15 Jun 2000 | Sep 23, 1978 | 6 Apr 2000
    const namedMonthMatch1 = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/);
    if (namedMonthMatch1) {
      const monthIdx = MONTH_MAP[namedMonthMatch1[1].toLowerCase()];
      const day = parseInt(namedMonthMatch1[2], 10);
      const year = parseYear(namedMonthMatch1[3]);
      if (monthIdx !== undefined) {
        return new Date(year, monthIdx, day);
      }
    }

    const namedMonthMatch2 = dateStr.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
    if (namedMonthMatch2) {
      const day = parseInt(namedMonthMatch2[1], 10);
      const monthIdx = MONTH_MAP[namedMonthMatch2[2].toLowerCase()];
      const year = parseYear(namedMonthMatch2[3]);
      if (monthIdx !== undefined) {
        return new Date(year, monthIdx, day);
      }
    }

    // Numeric formats with separators: 06-08-1985 | 04/03/2002 | 07.11.1969
    const numericMatch = dateStr.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/);
    if (numericMatch) {
      let day: number, month: number;
      const year = parseYear(numericMatch[3]);

      if (dateFormat === 'DMY') {
        day = parseInt(numericMatch[1], 10);
        month = parseInt(numericMatch[2], 10) - 1;
      } else {
        month = parseInt(numericMatch[1], 10) - 1;
        day = parseInt(numericMatch[2], 10);
      }

      return new Date(year, month, day);
    }

    // Space-separated numeric: 01 06 14
    const spacedNumericMatch = dateStr.match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})$/);
    if (spacedNumericMatch) {
      let day: number, month: number;
      const year = parseYear(spacedNumericMatch[3]);

      if (dateFormat === 'DMY') {
        day = parseInt(spacedNumericMatch[1], 10);
        month = parseInt(spacedNumericMatch[2], 10) - 1;
      } else {
        month = parseInt(spacedNumericMatch[1], 10) - 1;
        day = parseInt(spacedNumericMatch[2], 10);
      }

      return new Date(year, month, day);
    }

    return null;
  };

  // Parse a single passenger row
  const parsePassengerRow = (input: PassengerInput, returnDate: Date): ParsedPassenger | null => {
    if (!input.text.trim()) return null;

    let text = input.text.trim();
    let email: string | undefined;

    // Extract email if present
    const emailMatch = text.match(/\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s*$/);
    if (emailMatch) {
      email = emailMatch[1];
      text = text.replace(emailMatch[0], '').trim();
    }

    // Find where the date starts
    // Look for patterns that indicate a date
    const datePatterns = [
      /\b(\d{1,2}[-\/.\s]\d{1,2}[-\/.\s]\d{2,4})\s*$/,
      /\b(\d{4}-\d{1,2}-\d{1,2})\s*$/,
      /\b([A-Za-z]+\s+\d{1,2},?\s+\d{2,4})\s*$/,
      /\b(\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\s*$/,
      /\b(\d{1,2}[A-Za-z]{3}\d{2})\s*$/,
      /\b(\d{1,2}\s+\d{1,2}\s+\d{2,4})\s*$/,
    ];

    let dateStr = '';
    let namePart = text;

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        dateStr = match[1];
        namePart = text.substring(0, text.lastIndexOf(match[1])).trim();
        break;
      }
    }

    if (!dateStr) {
      // Try to find any date-like sequence at the end
      const words = text.split(/\s+/);
      for (let i = words.length - 1; i >= 0; i--) {
        const potentialDate = words.slice(i).join(' ');
        const parsed = parseDate(potentialDate);
        if (parsed) {
          dateStr = potentialDate;
          namePart = words.slice(0, i).join(' ');
          break;
        }
      }
    }

    const dob = parseDate(dateStr);
    if (!dob) return null;

    // Parse name
    let firstName = '';
    let lastName = '';

    // Check for = sign indicating last name start
    if (namePart.includes('=')) {
      const eqIndex = namePart.indexOf('=');
      firstName = namePart.substring(0, eqIndex).trim();
      lastName = namePart.substring(eqIndex + 1).trim();
    } else if (nameOrder === 'family_first') {
      // Family name first mode: first word is last name
      const words = namePart.split(/\s+/);
      lastName = words[0] || '';
      firstName = words.slice(1).join(' ');
    } else {
      // Regular mode: last word is last name
      const words = namePart.split(/\s+/);
      lastName = words[words.length - 1] || '';
      firstName = words.slice(0, -1).join(' ');
    }

    // Clean up names
    firstName = firstName.toUpperCase().trim();
    lastName = lastName.toUpperCase().trim();

    if (!firstName || !lastName) return null;

    // Calculate age
    const age = calculateAge(dob, returnDate);

    // Determine passenger type
    let passengerType: 'adult' | 'child' | 'infant_lap';
    if (input.passengerType !== 'auto') {
      passengerType = input.passengerType;
    } else if (age < 2) {
      passengerType = 'infant_lap';
    } else if (age < 12) {
      passengerType = 'child';
    } else {
      passengerType = 'adult';
    }

    return {
      firstName,
      lastName,
      dob,
      dobFormatted: formatDateSabre(dob),
      email,
      gender: input.gender,
      passengerType,
      age
    };
  };

  // Generate Sabre output
  const generateOutput = useCallback(() => {
    if (!returnFlightDate) {
      setOutput({ names: '', docs: '' });
      return;
    }

    const returnDate = new Date(returnFlightDate);
    if (isNaN(returnDate.getTime())) {
      setOutput({ names: '', docs: '' });
      return;
    }

    // Parse all passengers
    const parsed: ParsedPassenger[] = [];
    for (const pax of passengers) {
      const result = parsePassengerRow(pax, returnDate);
      if (result) {
        parsed.push(result);
      }
    }

    if (parsed.length === 0) {
      setOutput({ names: '', docs: '' });
      return;
    }

    // Separate adults/children from infants
    const standardPax = parsed.filter(p => p.passengerType !== 'infant_lap');
    const infants = parsed.filter(p => p.passengerType === 'infant_lap');

    // Number standard passengers sequentially
    standardPax.forEach((pax, idx) => {
      pax.passengerNumber = idx + 1;
    });

    // Associate infants with adults
    // Sort adults by age (oldest first), prioritize females
    const adults = standardPax.filter(p => p.passengerType === 'adult');
    const sortedAdults = [...adults].sort((a, b) => {
      // Females first
      if (a.gender === 'F' && b.gender !== 'F') return -1;
      if (a.gender !== 'F' && b.gender === 'F') return 1;
      // Then by age (oldest first)
      return b.age - a.age;
    });

    const adultInfantCount: Map<number, number> = new Map();
    sortedAdults.forEach(a => adultInfantCount.set(a.passengerNumber!, 0));

    for (const infant of infants) {
      // Find an adult with less than 1 infant
      const availableAdult = sortedAdults.find(a => (adultInfantCount.get(a.passengerNumber!) || 0) < 1);
      if (availableAdult) {
        infant.associatedAdultNumber = availableAdult.passengerNumber;
        adultInfantCount.set(availableAdult.passengerNumber!, 1);
      } else if (sortedAdults.length > 0) {
        // If all adults have infants, assign to first adult anyway (edge case)
        infant.associatedAdultNumber = sortedAdults[0].passengerNumber;
      } else {
        // No adults at all - use passenger number 1
        infant.associatedAdultNumber = 1;
      }
    }

    // Generate Names section
    const nameLines: string[] = [];
    for (const pax of standardPax) {
      nameLines.push(`-${pax.passengerNumber}${pax.lastName}/${pax.firstName}*${pax.dobFormatted}§`);
    }
    for (const infant of infants) {
      nameLines.push(`-i/${infant.lastName}/${infant.firstName}*${infant.dobFormatted}§`);
    }

    // Generate 3DOCS section
    const docsLines: string[] = [];

    // Standard passengers first
    for (const pax of standardPax) {
      const genderCode = pax.gender;
      docsLines.push(`3DOCS/DB/${pax.dobFormatted}/${genderCode}/${pax.lastName}/${pax.firstName}-${pax.passengerNumber}.1§`);
    }

    // PDT for children
    if (showPDT) {
      for (const pax of standardPax) {
        if (pax.passengerType === 'child') {
          docsLines.push(`PDTCNN-${pax.passengerNumber}.1§`);
        }
      }
    }

    // Infant docs and special codes
    for (const infant of infants) {
      const genderCode = infant.gender === 'M' ? 'MI' : 'FI';
      docsLines.push(`3DOCS/DB/${infant.dobFormatted}/${genderCode}/${infant.lastName}/${infant.firstName}-${infant.associatedAdultNumber}.1§`);
      docsLines.push(`3INFT/${infant.lastName}/${infant.firstName}/${infant.dobFormatted}-${infant.associatedAdultNumber}.1§`);
      docsLines.push(`3BSCT-${infant.associatedAdultNumber}.1§`);
    }

    // Email section
    for (const pax of standardPax) {
      if (pax.email) {
        const emailUpper = pax.email.toUpperCase();
        const emailCtce = emailUpper.replace('@', '//');
        docsLines.push(`PE/${emailUpper}§`);
        docsLines.push(`3CTCE/${emailCtce}-${pax.passengerNumber}§`);
      }
    }

    setOutput({
      names: nameLines.join('\n'),
      docs: docsLines.join('\n')
    });
  }, [passengers, dateFormat, nameOrder, showPDT, returnFlightDate]);

  // Regenerate output when inputs change
  useEffect(() => {
    generateOutput();
  }, [generateOutput]);

  const handlePassengerChange = (index: number, field: keyof PassengerInput, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleReset = () => {
    setPassengers(initialPassengers);
    setOutput({ names: '', docs: '' });
  };

  const handleCopy = async (type: 'names' | 'docs') => {
    const text = type === 'names' ? output.names : output.docs;
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const fullOutput = output.names + '\n' + output.docs;
    if (fullOutput.trim()) {
      await navigator.clipboard.writeText(fullOutput);
      setCopied('docs');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <SectionHeader
        title="Sabre Name Tool"
        subtitle="Convert passenger information to Sabre GDS format quickly and accurately."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column - Input */}
        <div className="space-y-4">
          {/* Settings Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date Format
                  <span className="ml-1 text-slate-400 cursor-help" title="How to interpret ambiguous numeric dates like 01/02/2000">ℹ️</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateFormat"
                      checked={dateFormat === 'MDY'}
                      onChange={() => setDateFormat('MDY')}
                      className="text-paragon focus:ring-paragon"
                    />
                    <span className="text-sm">M/D/Y</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateFormat"
                      checked={dateFormat === 'DMY'}
                      onChange={() => setDateFormat('DMY')}
                      className="text-paragon focus:ring-paragon"
                    />
                    <span className="text-sm">D/M/Y</span>
                  </label>
                </div>
              </div>

              {/* Name Order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name Order
                  <span className="ml-1 text-slate-400 cursor-help" title="How names are entered: 'Regular' = First Last, 'Family Name First' = Last First">ℹ️</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="nameOrder"
                      checked={nameOrder === 'regular'}
                      onChange={() => setNameOrder('regular')}
                      className="text-paragon focus:ring-paragon"
                    />
                    <span className="text-sm">Regular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="nameOrder"
                      checked={nameOrder === 'family_first'}
                      onChange={() => setNameOrder('family_first')}
                      className="text-paragon focus:ring-paragon"
                    />
                    <span className="text-sm">Family First</span>
                  </label>
                </div>
              </div>

              {/* Show PDT */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Child PDT Codes</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="showPDT"
                      checked={showPDT}
                      onChange={() => setShowPDT(true)}
                      className="text-paragon focus:ring-paragon"
                    />
                    <span className="text-sm">Show PDT</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="showPDT"
                      checked={!showPDT}
                      onChange={() => setShowPDT(false)}
                      className="text-paragon focus:ring-paragon"
                    />
                    <span className="text-sm">Hide PDT</span>
                  </label>
                </div>
              </div>

              {/* Return Flight Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Return Flight Date
                  <span className="ml-1 text-slate-400 cursor-help" title="Used to calculate passenger ages">ℹ️</span>
                </label>
                <input
                  type="date"
                  value={returnFlightDate}
                  onChange={(e) => setReturnFlightDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-paragon focus:border-paragon text-sm"
                />
              </div>
            </div>
          </div>

          {/* Passenger Input Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Passengers</h3>
              <div className="text-xs text-slate-500">
                Format: Name DOB [email] • Use = to mark last name start
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {passengers.map((pax, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 w-6">{idx + 1}.</span>

                  {/* Name/DOB Input */}
                  <input
                    type="text"
                    value={pax.text}
                    onChange={(e) => handlePassengerChange(idx, 'text', e.target.value)}
                    placeholder="e.g., John Doe 05/20/1993 john@email.com"
                    className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-paragon focus:border-paragon text-sm"
                  />

                  {/* Gender Selection */}
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`gender-${idx}`}
                        checked={pax.gender === 'M'}
                        onChange={() => handlePassengerChange(idx, 'gender', 'M')}
                        className="text-paragon focus:ring-paragon w-3 h-3"
                      />
                      <span className="text-xs">M</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`gender-${idx}`}
                        checked={pax.gender === 'F'}
                        onChange={() => handlePassengerChange(idx, 'gender', 'F')}
                        className="text-paragon focus:ring-paragon w-3 h-3"
                      />
                      <span className="text-xs">F</span>
                    </label>
                  </div>

                  {/* Passenger Type */}
                  <select
                    value={pax.passengerType}
                    onChange={(e) => handlePassengerChange(idx, 'passengerType', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-paragon focus:border-paragon text-xs bg-white"
                  >
                    <option value="auto">Auto</option>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="infant_lap">Infant Lap</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
            >
              Reset
            </button>
            <button
              onClick={handleCopyAll}
              disabled={!output.names && !output.docs}
              className="flex-1 px-4 py-2 bg-paragon text-white rounded-lg hover:bg-paragon-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? '✓ Copied!' : 'Convert & Copy All'}
            </button>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-4">
          {/* Names Output */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Names</h3>
              <button
                onClick={() => handleCopy('names')}
                disabled={!output.names}
                className="px-3 py-1 text-xs bg-paragon text-white rounded hover:bg-paragon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied === 'names' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              value={output.names}
              placeholder="Names output will appear here..."
              className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-sm resize-none"
            />
          </div>

          {/* 3DOCS Output */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">3DOCS & Commands</h3>
              <button
                onClick={() => handleCopy('docs')}
                disabled={!output.docs}
                className="px-3 py-1 text-xs bg-paragon text-white rounded hover:bg-paragon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied === 'docs' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              value={output.docs}
              placeholder="3DOCS and additional commands will appear here..."
              className="w-full h-64 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-sm resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Format Guide</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li><strong>Name input:</strong> First Middle Last DOB [email]</li>
              <li><strong>Complex names:</strong> Use = to mark where last name starts (e.g., "John =Van Der Berg 05/20/1990")</li>
              <li><strong>Date formats:</strong> 05/20/1993, May 20 1993, 20 May 93, 1993-05-20, 20MAY93</li>
              <li><strong>Ages:</strong> Infant (&lt;2), Child (2-11), Adult (12+) - calculated from Return Flight Date</li>
              <li><strong>Infants:</strong> Associated with oldest female adult, or oldest adult if no females</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SabreTool;
