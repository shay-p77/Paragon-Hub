
import React, { useState, useEffect } from 'react';
import { SectionHeader } from './Shared';
import { API_URL } from '../config';
import { UserRole } from '../types';

interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  isActive: boolean;
  avatarColor?: string;
  invitedAt?: string;
  lastLogin?: string;
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
              <option value="OPERATIONS">Operations - Ops, Command Center, CRM, KB</option>
              <option value="SALES">Concierge - CRM, Command Center, KB</option>
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
              <option value="ADMIN">Admin</option>
              <option value="OPERATIONS">Operations</option>
              <option value="SALES">Concierge</option>
              <option value="ACCOUNTING">Accounting</option>
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

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'users' | 'vendors' | 'contracts'>('users');
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);

  const sections = [
    { id: 'users', label: 'User Access' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'contracts', label: 'Contracts' },
  ];

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'OPERATIONS': return 'bg-blue-100 text-blue-700';
      case 'SALES': return 'bg-emerald-100 text-emerald-700';
      case 'ACCOUNTING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SALES': return 'Concierge';
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
                <p className="text-xs text-slate-500 mt-1">{users.length} users • {users.filter(u => u.isActive).length} active</p>
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
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {user.lastLogin ? `Last login: ${formatDate(user.lastLogin)}` : 'Never logged in'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
      {activeSection === 'vendors' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor Directory</h3>
              <button className="px-3 py-1.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors">
                + Add Vendor
              </button>
            </div>
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">Vendor management coming soon</p>
              <p className="text-xs mt-1">Add airlines, hotels, and service providers</p>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Section */}
      {activeSection === 'contracts' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contract Management</h3>
              <button className="px-3 py-1.5 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-paragon-dark transition-colors">
                + Add Contract
              </button>
            </div>
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Contract management coming soon</p>
              <p className="text-xs mt-1">Store and manage vendor agreements</p>
            </div>
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
    </div>
  );
};

export default Settings;
