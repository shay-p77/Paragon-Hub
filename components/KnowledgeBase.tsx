
import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader, Badge } from './Shared';

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
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  const quickAddRef = useRef<HTMLDivElement>(null);

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
    setContactEmail('');
    setContactNotes('');
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the future, this would save to backend
    console.log('Quick add submitted:', { category: quickAddCategory });
    setShowQuickAdd(false);
    resetQuickAddForm();
  };

  // Filter entries based on search
  const filteredProcedures = MOCK_PROCEDURES.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLocations = MOCK_LOCATIONS.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredContacts = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotes = MOCK_NOTES.filter(n =>
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
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-slate-900 tracking-wide">Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">Business procedures, destination intel, and contact directory</p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-2 bg-paragon text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Quick Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedures, locations, contacts..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-6">
        {[
          { id: 'procedures', label: 'PROCEDURES', count: filteredProcedures.length },
          { id: 'locations', label: 'LOCATIONS', count: filteredLocations.length },
          { id: 'contacts', label: 'CONTACTS', count: filteredContacts.length },
          { id: 'notes', label: 'NOTES', count: filteredNotes.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-bold tracking-widest transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-paragon border-b-2 border-paragon'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-paragon text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-12 gap-6">
        <div className={selectedEntry ? 'col-span-7' : 'col-span-12'}>
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
            <div className="grid grid-cols-2 gap-4">
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
          <div className="col-span-5">
            <div className="bg-white border border-slate-200 p-6 rounded-sm sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-paragon">Details</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // TODO: Implement edit functionality with backend
                      console.log('Edit entry:', selectedEntry.id);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-paragon hover:bg-slate-50 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
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

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div ref={quickAddRef} className="bg-white w-full max-w-lg max-h-[80vh] flex flex-col rounded-sm shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
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
              <div className="p-6">
                <p className="text-xs text-slate-500 mb-4">What would you like to add?</p>
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+33 1 44 71 15 00"
                      className="w-full p-2 bg-white border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-paragon rounded-sm"
                    />
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
