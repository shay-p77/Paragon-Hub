
import React, { useState, useEffect } from 'react';
import { SectionHeader } from './Shared';
import { API_URL } from '../config';
import { UserRole, Vendor, VendorType, CollectionMethod, PaymentFrequency, AuditLog } from '../types';

interface TeamMember {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  isActive: boolean;
  avatarColor?: string;
  invitedAt?: string;
  lastLogin?: string;
  googleId?: string;
}

interface SettingsProps {
  currentUserRole?: UserRole;
}

// Invite User Modal
const InviteUserModal: React.FC<{
  onInvite: (email: string, name: string, role: UserRole) => void;
  onClose: () => void;
}> = ({ onInvite, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onInvite(email, name, role);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-sm shadow-2xl animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-cinzel text-lg font-bold text-slate-900">Invite Team Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@company.com"
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
            >
              <option value="ADMIN">Admin - Full access</option>
              <option value="OPERATIONS">Operations - Ops, Command Center, CRM, Clients, KB</option>
              <option value="SALES">Concierge - CRM, Command Center, Clients, KB</option>
              <option value="ACCOUNTING">Accounting - Finance, Command Center, Ops</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal: React.FC<{
  user: TeamMember;
  onSave: (userId: string, updates: { role?: UserRole; isActive?: boolean; name?: string }) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user._id, { name, role, isActive });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-sm shadow-2xl animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-cinzel text-lg font-bold text-slate-900">Edit User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm bg-slate-50 text-slate-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
            >
              <option value="ADMIN">Admin - Full access</option>
              <option value="OPERATIONS">Operations - Ops, Command Center, CRM, Clients, KB</option>
              <option value="SALES">Concierge - CRM, Command Center, Clients, KB</option>
              <option value="ACCOUNTING">Accounting - Finance, Command Center, Ops</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
              />
              <span className="text-sm text-slate-700">Account Active</span>
            </label>
            <p className="text-[10px] text-slate-400 mt-1 ml-7">Inactive users cannot log in</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Vendor Modal
const VendorModal: React.FC<{
  vendor?: Vendor | null;
  vendorType: VendorType;
  onSave: (vendor: Partial<Vendor>) => void;
  onClose: () => void;
}> = ({ vendor, vendorType, onSave, onClose }) => {
  const [name, setName] = useState(vendor?.name || '');
  const [code, setCode] = useState(vendor?.code || '');
  const [commissionPercent, setCommissionPercent] = useState(vendor?.commissionPercent?.toString() || '');
  const [collectionMethod, setCollectionMethod] = useState<CollectionMethod>(vendor?.collectionMethod || 'OTHER');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(vendor?.paymentFrequency || 'MONTHLY');
  const [collectionEmail, setCollectionEmail] = useState(vendor?.collectionEmail || '');
  const [collectionFormUrl, setCollectionFormUrl] = useState(vendor?.collectionFormUrl || '');
  const [collectionNotes, setCollectionNotes] = useState(vendor?.collectionNotes || '');
  const [contactName, setContactName] = useState(vendor?.contactName || '');
  const [contactEmail, setContactEmail] = useState(vendor?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(vendor?.contactPhone || '');
  const [notes, setNotes] = useState(vendor?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: vendor?.id,
      name: name.trim(),
      code: code.trim(),
      type: vendorType,
      commissionPercent: parseFloat(commissionPercent) || 0,
      collectionMethod,
      paymentFrequency,
      collectionEmail,
      collectionFormUrl,
      collectionNotes,
      contactName,
      contactEmail,
      contactPhone,
      notes,
    });
  };

  const getTypeLabel = () => {
    switch (vendorType) {
      case 'FLIGHT': return 'Flight';
      case 'HOTEL': return 'Hotel';
      case 'LOGISTICS': return 'Logistics';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-sm shadow-2xl animate-zoomIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-cinzel text-lg font-bold text-slate-900">
            {vendor ? 'Edit' : 'Add'} {getTypeLabel()} Vendor
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Vendor Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., JOY Travel"
                className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Vendor Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., IH6K"
                className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
              />
            </div>
          </div>

          {/* Commission Settings */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Commission Settings</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Commission %</label>
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
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Collection Method</label>
                <select
                  value={collectionMethod}
                  onChange={(e) => setCollectionMethod(e.target.value as CollectionMethod)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
                >
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="EMAIL">Email Required</option>
                  <option value="FORM">Form Required</option>
                  <option value="CHECK">Check by Mail</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Payment Frequency</label>
                <select
                  value={paymentFrequency}
                  onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon bg-white"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="PER_BOOKING">Per Booking</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collection Details */}
          {(collectionMethod === 'EMAIL' || collectionMethod === 'FORM') && (
            <div className="grid grid-cols-2 gap-4">
              {collectionMethod === 'EMAIL' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Collection Email</label>
                  <input
                    type="email"
                    value={collectionEmail}
                    onChange={(e) => setCollectionEmail(e.target.value)}
                    placeholder="claims@vendor.com"
                    className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                  />
                </div>
              )}
              {collectionMethod === 'FORM' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Form URL</label>
                  <input
                    type="url"
                    value={collectionFormUrl}
                    onChange={(e) => setCollectionFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Collection Notes</label>
            <textarea
              value={collectionNotes}
              onChange={(e) => setCollectionNotes(e.target.value)}
              placeholder="Additional instructions for claiming commission..."
              rows={2}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon resize-none"
            />
          </div>

          {/* Contact Info */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">General Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-slate-200 rounded-sm text-sm outline-none focus:ring-2 focus:ring-paragon resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
            >
              {vendor ? 'Save Changes' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ currentUserRole = 'ADMIN' }) => {
  const isAdmin = currentUserRole === 'ADMIN';

  const [activeSection, setActiveSection] = useState<'users' | 'vendors' | 'activity'>('users');
  const [vendorSubTab, setVendorSubTab] = useState<VendorType>('FLIGHT');
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [deleteVendorConfirm, setDeleteVendorConfirm] = useState<{ id: string; name: string } | null>(null);

  // Build sections based on role
  const sections = [
    { id: 'users', label: 'User Access' },
    ...(isAdmin ? [{ id: 'vendors', label: 'Vendors' }] : []),
    ...(isAdmin ? [{ id: 'activity', label: 'Activity Log' }] : []),
  ];

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch vendors when vendor tab is active
  useEffect(() => {
    if (activeSection === 'vendors') {
      fetchVendors();
    }
  }, [activeSection]);

  // Fetch audit logs when activity tab is active
  useEffect(() => {
    if (activeSection === 'activity') {
      fetchAuditLogs();
    }
  }, [activeSection]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        // Filter out CLIENT users - they're auto-created and not team members
        const teamMembers = data.filter((u: TeamMember) => u.role !== 'CLIENT');
        setUsers(teamMembers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/vendors`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/audit-logs?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleInvite = async (email: string, name: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_URL}/api/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });

      if (res.ok) {
        setShowInviteModal(false);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to invite user');
      }
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to invite user');
    }
  };

  const handleResendInvite = async (userId: string) => {
    setResendingInvite(userId);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/resend-invite`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Invite resent successfully!');
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to resend invite');
      }
    } catch (error) {
      console.error('Resend invite error:', error);
      alert('Failed to resend invite');
    } finally {
      setResendingInvite(null);
    }
  };

  const handleUpdateUser = async (userId: string, updates: { role?: UserRole; isActive?: boolean; name?: string }) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user');
    }
  };

  const handleSaveVendor = async (vendorData: Partial<Vendor>) => {
    try {
      const isEdit = !!vendorData.id;
      const url = isEdit ? `${API_URL}/api/vendors/${vendorData.id}` : `${API_URL}/api/vendors`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
      });

      if (res.ok) {
        setShowVendorModal(false);
        setEditingVendor(null);
        fetchVendors();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save vendor');
      }
    } catch (error) {
      console.error('Save vendor error:', error);
      alert('Failed to save vendor');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVendors();
        setDeleteVendorConfirm(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete vendor');
      }
    } catch (error) {
      console.error('Delete vendor error:', error);
      alert('Failed to delete vendor');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'OPERATIONS': return 'bg-blue-100 text-blue-700';
      case 'SALES': return 'bg-emerald-100 text-emerald-700';
      case 'ACCOUNTING': return 'bg-amber-100 text-amber-700';
      case 'CLIENT': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SALES': return 'Concierge';
      case 'CLIENT': return 'Client';
      default: return role.charAt(0) + role.slice(1).toLowerCase();
    }
  };

  const getStatusDot = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-slate-300';
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500';
      case 'BUSY': return 'bg-red-500';
      case 'AWAY': return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isPendingUser = (user: TeamMember) => {
    return !user.lastLogin && user.googleId?.startsWith('invited-');
  };

  const getCollectionMethodLabel = (method: string) => {
    switch (method) {
      case 'AUTOMATIC': return 'Automatic';
      case 'EMAIL': return 'Email';
      case 'FORM': return 'Form';
      case 'CHECK': return 'Check';
      case 'INVOICE': return 'Invoice';
      default: return 'Other';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'Logged in';
      case 'LOGOUT': return 'Logged out';
      case 'VIEW_CUSTOMER': return 'Viewed customer';
      case 'CREATE_CUSTOMER': return 'Created customer';
      case 'UPDATE_CUSTOMER': return 'Updated customer';
      case 'DELETE_CUSTOMER': return 'Deleted customer';
      case 'VIEW_BOOKING': return 'Viewed booking';
      case 'CREATE_BOOKING': return 'Created booking';
      case 'UPDATE_BOOKING': return 'Updated booking';
      case 'DELETE_BOOKING': return 'Deleted booking';
      case 'INVITE_USER': return 'Invited user';
      case 'RESEND_INVITE': return 'Resent invite';
      case 'UPDATE_USER': return 'Updated user';
      case 'DELETE_USER': return 'Deleted user';
      case 'CREATE_VENDOR': return 'Created vendor';
      case 'UPDATE_VENDOR': return 'Updated vendor';
      case 'DELETE_VENDOR': return 'Deleted vendor';
      case 'FAILED_LOGIN': return 'Failed login attempt';
      default: return action;
    }
  };

  const filteredVendors = vendors.filter(v => v.type === vendorSubTab);

  return (
    <div className="p-4 sm:p-8">
      <SectionHeader title="Settings" subtitle="Manage system configuration, vendors, and user access" />

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
              activeSection === section.id
                ? 'bg-paragon text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* User Access Section */}
      {activeSection === 'users' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team Members</h3>
                <p className="text-xs text-slate-500 mt-1">{users.length} users - {users.filter(u => u.isActive).length} active</p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite User
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="animate-spin w-8 h-8 border-2 border-paragon border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm">No team members yet</p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-4 text-paragon font-bold text-sm hover:text-paragon-dark"
                >
                  + Invite your first team member
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {users.map(user => (
                  <div key={user._id} className={`p-4 sm:p-5 flex items-center justify-between gap-4 ${!user.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: user.avatarColor || '#64748B' }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusDot(user.status, user.isActive)}`}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-800 truncate">{user.name}</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                          {!user.isActive && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-600">
                              Inactive
                            </span>
                          )}
                          {isPendingUser(user) && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-600">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {user.lastLogin ? `Last login: ${formatDate(user.lastLogin)}` : 'Never logged in'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Resend Invite Button - only show for pending users */}
                      {isPendingUser(user) && (
                        <button
                          onClick={() => handleResendInvite(user._id)}
                          disabled={resendingInvite === user._id}
                          className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50"
                          title="Resend invite"
                        >
                          {resendingInvite === user._id ? (
                            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-slate-400 hover:text-paragon hover:bg-slate-50 rounded transition-colors"
                        title="Edit user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendors Section */}
      {activeSection === 'vendors' && isAdmin && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm">
            {/* Vendor Sub-tabs */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex gap-2">
                {(['FLIGHT', 'HOTEL', 'LOGISTICS'] as VendorType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setVendorSubTab(type)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
                      vendorSubTab === type
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'FLIGHT' ? 'Flight' : type === 'HOTEL' ? 'Hotel' : 'Logistics'} Vendors
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setEditingVendor(null); setShowVendorModal(true); }}
                className="px-3 py-1.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors"
              >
                + Add Vendor
              </button>
            </div>

            {vendorsLoading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="animate-spin w-8 h-8 border-2 border-paragon border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm">Loading vendors...</p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm">No {vendorSubTab.toLowerCase()} vendors yet</p>
                <button
                  onClick={() => { setEditingVendor(null); setShowVendorModal(true); }}
                  className="mt-4 text-paragon font-bold text-sm hover:text-paragon-dark"
                >
                  + Add your first vendor
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredVendors.map(vendor => (
                  <div key={vendor.id} className="border-b border-slate-100 last:border-b-0">
                    {/* Main Row - Clickable to expand */}
                    <div
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedVendorId(expandedVendorId === vendor.id ? null : vendor.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Expand/Collapse Icon */}
                        <svg
                          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expandedVendorId === vendor.id ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-800">{vendor.name}</span>
                            {vendor.code && (
                              <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {vendor.code}
                              </span>
                            )}
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                              {vendor.commissionPercent}% commission
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                            <span>{getCollectionMethodLabel(vendor.collectionMethod)}</span>
                            <span>-</span>
                            <span>{vendor.paymentFrequency.charAt(0) + vendor.paymentFrequency.slice(1).toLowerCase().replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setEditingVendor(vendor); setShowVendorModal(true); }}
                          className="p-2 text-slate-400 hover:text-paragon hover:bg-slate-50 rounded transition-colors"
                          title="Edit vendor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteVendorConfirm({ id: vendor.id, name: vendor.name })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete vendor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedVendorId === vendor.id && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 ml-7 border-t border-slate-100 bg-slate-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                          {/* Commission Settings */}
                          <div>
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Commission Settings</h5>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-slate-500">Commission:</span> <span className="font-medium text-slate-800">{vendor.commissionPercent}%</span></p>
                              <p><span className="text-slate-500">Collection:</span> <span className="font-medium text-slate-800">{getCollectionMethodLabel(vendor.collectionMethod)}</span></p>
                              <p><span className="text-slate-500">Frequency:</span> <span className="font-medium text-slate-800">{vendor.paymentFrequency.charAt(0) + vendor.paymentFrequency.slice(1).toLowerCase().replace('_', ' ')}</span></p>
                            </div>
                          </div>

                          {/* Collection Details */}
                          <div>
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Collection Details</h5>
                            <div className="space-y-1 text-sm">
                              {vendor.collectionEmail ? (
                                <p><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800">{vendor.collectionEmail}</span></p>
                              ) : null}
                              {vendor.collectionFormUrl ? (
                                <p><span className="text-slate-500">Form:</span> <a href={vendor.collectionFormUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-paragon hover:underline">{vendor.collectionFormUrl}</a></p>
                              ) : null}
                              {vendor.collectionNotes ? (
                                <p><span className="text-slate-500">Notes:</span> <span className="font-medium text-slate-800">{vendor.collectionNotes}</span></p>
                              ) : null}
                              {!vendor.collectionEmail && !vendor.collectionFormUrl && !vendor.collectionNotes && (
                                <p className="text-slate-400 italic">No collection details</p>
                              )}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div>
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact Information</h5>
                            <div className="space-y-1 text-sm">
                              {vendor.contactName ? (
                                <p><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">{vendor.contactName}</span></p>
                              ) : null}
                              {vendor.contactEmail ? (
                                <p><span className="text-slate-500">Email:</span> <a href={`mailto:${vendor.contactEmail}`} className="font-medium text-paragon hover:underline">{vendor.contactEmail}</a></p>
                              ) : null}
                              {vendor.contactPhone ? (
                                <p><span className="text-slate-500">Phone:</span> <a href={`tel:${vendor.contactPhone}`} className="font-medium text-paragon hover:underline">{vendor.contactPhone}</a></p>
                              ) : null}
                              {!vendor.contactName && !vendor.contactEmail && !vendor.contactPhone && (
                                <p className="text-slate-400 italic">No contact info</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* General Notes */}
                        {vendor.notes && (
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</h5>
                            <p className="text-sm text-slate-700">{vendor.notes}</p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex gap-4 text-[10px] text-slate-400">
                          <span>Created: {formatDate(vendor.createdAt)}</span>
                          <span>Updated: {formatDate(vendor.updatedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Log Section */}
      {activeSection === 'activity' && isAdmin && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Activity</h3>
              <p className="text-xs text-slate-500 mt-1">System-wide user activity log</p>
            </div>

            {logsLoading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="animate-spin w-8 h-8 border-2 border-paragon border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm">Loading activity log...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No activity recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.success ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">
                        <span className="font-semibold">{log.userName || log.userEmail || 'System'}</span>
                        {' '}
                        <span className="text-slate-600">{getActionLabel(log.action)}</span>
                        {log.resourceName && (
                          <>
                            {' '}
                            <span className="text-slate-400">-</span>
                            {' '}
                            <span className="font-medium text-slate-700">{log.resourceName}</span>
                          </>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateTime(log.timestamp)}
                        {log.ipAddress && ` - ${log.ipAddress}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteUserModal
          onInvite={handleInvite}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleUpdateUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {showVendorModal && (
        <VendorModal
          vendor={editingVendor}
          vendorType={vendorSubTab}
          onSave={handleSaveVendor}
          onClose={() => { setShowVendorModal(false); setEditingVendor(null); }}
        />
      )}

      {/* Delete Vendor Confirmation Modal */}
      {deleteVendorConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setDeleteVendorConfirm(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-sm shadow-2xl animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-cinzel text-lg font-bold text-slate-900 text-center mb-2">Delete Vendor</h3>
              <p className="text-sm text-slate-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteVendorConfirm.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteVendorConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteVendor(deleteVendorConfirm.id)}
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

export default Settings;
