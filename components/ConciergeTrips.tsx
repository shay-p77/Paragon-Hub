
import React, { useState } from 'react';
import { SectionHeader } from './Shared';
import { PipelineTrip, PipelineStage, PipelineTask, User } from '../types';
import { GoogleUser } from './Login';

interface ConciergeTripsProps {
  googleUser?: GoogleUser | null;
  currentUser: User;
  pipelineTrips: PipelineTrip[];
  onAddPipelineTrip: (trip: PipelineTrip) => void;
  onUpdatePipelineTrip: (id: string, updates: Partial<PipelineTrip>) => void;
  onDeletePipelineTrip: (id: string) => void;
}

const ConciergeTrips: React.FC<ConciergeTripsProps> = ({
  googleUser,
  currentUser,
  pipelineTrips,
  onAddPipelineTrip,
  onUpdatePipelineTrip,
  onDeletePipelineTrip,
}) => {
  // Pipeline/Kanban state
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<PipelineTrip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<PipelineTrip | null>(null);
  const [draggingTripId, setDraggingTripId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [tripName, setTripName] = useState('');
  const [tripClientName, setTripClientName] = useState('');
  const [tripStage, setTripStage] = useState<PipelineStage>('NEW');
  const [tripHasFlights, setTripHasFlights] = useState(false);
  const [tripHasHotels, setTripHasHotels] = useState(false);
  const [tripHasLogistics, setTripHasLogistics] = useState(false);
  const [tripIsUrgent, setTripIsUrgent] = useState(false);
  const [tripStartDate, setTripStartDate] = useState('');
  const [tripEndDate, setTripEndDate] = useState('');
  const [tripAgent, setTripAgent] = useState('');
  const [tripNotes, setTripNotes] = useState('');
  const [tripTasks, setTripTasks] = useState<PipelineTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Pipeline modal functions
  const openPipelineModal = (trip?: PipelineTrip, stage?: PipelineStage) => {
    if (trip) {
      setEditingTrip(trip);
      setTripName(trip.name);
      setTripClientName(trip.clientName);
      setTripStage(trip.stage);
      setTripHasFlights(trip.hasFlights);
      setTripHasHotels(trip.hasHotels);
      setTripHasLogistics(trip.hasLogistics);
      setTripIsUrgent(trip.isUrgent);
      setTripStartDate(trip.startDate || '');
      setTripEndDate(trip.endDate || '');
      setTripAgent(trip.agent);
      setTripNotes(trip.notes || '');
      setTripTasks([...trip.tasks]);
    } else {
      setEditingTrip(null);
      setTripName('');
      setTripClientName('');
      setTripStage(stage || 'NEW');
      setTripHasFlights(false);
      setTripHasHotels(false);
      setTripHasLogistics(false);
      setTripIsUrgent(false);
      setTripStartDate('');
      setTripEndDate('');
      setTripAgent(googleUser?.name || currentUser.name);
      setTripNotes('');
      setTripTasks([]);
    }
    setNewTaskText('');
    setShowPipelineModal(true);
  };

  const closePipelineModal = () => {
    setShowPipelineModal(false);
    setEditingTrip(null);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTripTasks(prev => [...prev, {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false
    }]);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    setTripTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTripTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleSubmitPipelineTrip = () => {
    if (!tripName.trim() || !tripClientName.trim()) return;

    if (editingTrip) {
      onUpdatePipelineTrip(editingTrip.id, {
        name: tripName,
        clientName: tripClientName,
        stage: tripStage,
        hasFlights: tripHasFlights,
        hasHotels: tripHasHotels,
        hasLogistics: tripHasLogistics,
        isUrgent: tripIsUrgent,
        startDate: tripStartDate || undefined,
        endDate: tripEndDate || undefined,
        agent: tripAgent,
        notes: tripNotes || undefined,
        tasks: tripTasks
      });
    } else {
      const newTrip: PipelineTrip = {
        id: `pt-${Date.now()}`,
        name: tripName,
        clientName: tripClientName,
        stage: tripStage,
        hasFlights: tripHasFlights,
        hasHotels: tripHasHotels,
        hasLogistics: tripHasLogistics,
        isUrgent: tripIsUrgent,
        startDate: tripStartDate || undefined,
        endDate: tripEndDate || undefined,
        agent: tripAgent,
        notes: tripNotes || undefined,
        tasks: tripTasks,
        createdAt: new Date().toISOString()
      };
      onAddPipelineTrip(newTrip);
    }
    closePipelineModal();
  };

  const handleMoveTrip = (tripId: string, newStage: PipelineStage) => {
    onUpdatePipelineTrip(tripId, { stage: newStage });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tripId: string) => {
    setDraggingTripId(tripId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tripId);
  };

  const handleDragEnd = () => {
    setDraggingTripId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: PipelineStage) => {
    e.preventDefault();
    const tripId = e.dataTransfer.getData('text/plain');
    if (tripId && draggingTripId) {
      handleMoveTrip(tripId, stageId);
    }
    setDraggingTripId(null);
    setDragOverStage(null);
  };

  const handleQuickToggleTask = (tripId: string, taskId: string) => {
    const trip = pipelineTrips.find(t => t.id === tripId);
    if (!trip) return;
    const updatedTasks = trip.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdatePipelineTrip(tripId, { tasks: updatedTasks });
  };

  const pipelineStages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'NEW', label: 'Pending / Potential', color: 'border-slate-400' },
    { id: 'PLANNING', label: 'Planning', color: 'border-amber-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-paragon' },
    { id: 'FINALIZING', label: 'Finalizing', color: 'border-emerald-500' }
  ];

  // Stats
  const totalTrips = pipelineTrips.length;
  const urgentTrips = pipelineTrips.filter(t => t.isUrgent).length;
  const completedTasks = pipelineTrips.reduce((sum, t) => sum + t.tasks.filter(task => task.completed).length, 0);
  const totalTasks = pipelineTrips.reduce((sum, t) => sum + t.tasks.length, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SectionHeader title="Concierge Trips" subtitle="Manage client trips through the pipeline" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Active Trips</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalTrips}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Urgent</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{urgentTrips}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Tasks Done</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{completedTasks}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
          <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Total Tasks</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-600">{totalTasks}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => openPipelineModal()}
            className="bg-paragon text-white text-[10px] px-4 py-2.5 font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
          >
            + New Trip
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {pipelineStages.map(stage => {
          const stageTrips = pipelineTrips.filter(t => t.stage === stage.id);
          return (
            <div
              key={stage.id}
              className={`bg-slate-100 p-3 sm:p-4 border-t-4 ${stage.color} rounded-sm min-h-[200px] sm:min-h-[400px] lg:min-h-[500px] transition-colors ${dragOverStage === stage.id ? 'bg-slate-200 ring-2 ring-paragon ring-opacity-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{stage.label}</h4>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold">{stageTrips.length}</span>
              </div>

              {/* Trip Cards */}
              <div className="space-y-3">
                {stageTrips.map(trip => (
                  <div
                    key={trip.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, trip.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setViewingTrip(trip)}
                    className={`bg-white p-4 border border-slate-200 shadow-sm rounded-sm cursor-grab hover:border-paragon transition-all ${draggingTripId === trip.id ? 'opacity-50 cursor-grabbing' : ''}`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-xs text-slate-900 leading-tight pr-2">{trip.name}</h5>
                      {trip.isUrgent && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1"></span>
                      )}
                    </div>

                    {/* Client Name */}
                    <p className="text-[10px] text-slate-500 mb-3">{trip.clientName}</p>

                    {/* Service Icons */}
                    <div className="flex gap-2 mb-3">
                      {trip.hasFlights && (
                        <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center" title="Flights">
                          <svg className="w-3.5 h-3.5 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </span>
                      )}
                      {trip.hasHotels && (
                        <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center" title="Hotels">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </span>
                      )}
                      {trip.hasLogistics && (
                        <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center" title="Logistics">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Tasks Preview */}
                    {trip.tasks.length > 0 && (
                      <div className="border-t border-slate-100 pt-2 mt-2">
                        <div className="space-y-1">
                          {trip.tasks.slice(0, 3).map(task => (
                            <div
                              key={task.id}
                              onClick={(e) => { e.stopPropagation(); handleQuickToggleTask(trip.id, task.id); }}
                              className="flex items-center gap-2 group"
                            >
                              <div className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center cursor-pointer ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}>
                                {task.completed && (
                                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-[9px] ${task.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{task.text}</span>
                            </div>
                          ))}
                          {trip.tasks.length > 3 && (
                            <p className="text-[8px] text-slate-400 pl-5">+{trip.tasks.length - 3} more tasks</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add New Card Button */}
                <button
                  onClick={() => openPipelineModal(undefined, stage.id)}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-sm text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:border-paragon hover:text-paragon transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Modal (Create/Edit Trip) */}
      {showPipelineModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closePipelineModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  {editingTrip ? 'Edit Trip' : 'New Concierge Trip'}
                </h2>
                <button onClick={closePipelineModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Name & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trip Name *</label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g., Paris Anniversary Trip"
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={tripClientName}
                    onChange={(e) => setTripClientName(e.target.value)}
                    placeholder="Client name"
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              {/* Stage & Agent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stage</label>
                  <select
                    value={tripStage}
                    onChange={(e) => setTripStage(e.target.value as PipelineStage)}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  >
                    <option value="NEW">New / Potential</option>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FINALIZING">Finalizing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agent</label>
                  <input
                    type="text"
                    value={tripAgent}
                    onChange={(e) => setTripAgent(e.target.value)}
                    placeholder="Agent name"
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={tripEndDate}
                    onChange={(e) => setTripEndDate(e.target.value)}
                    min={tripStartDate}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              {/* Services & Priority */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Services Required</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripHasFlights}
                      onChange={(e) => setTripHasFlights(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
                    />
                    <span className="text-xs text-slate-600">Flights</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripHasHotels}
                      onChange={(e) => setTripHasHotels(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
                    />
                    <span className="text-xs text-slate-600">Hotels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripHasLogistics}
                      onChange={(e) => setTripHasLogistics(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-paragon focus:ring-paragon"
                    />
                    <span className="text-xs text-slate-600">Logistics / Transfers</span>
                  </label>
                  <div className="w-px bg-slate-200 mx-2"></div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tripIsUrgent}
                      onChange={(e) => setTripIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs text-red-600 font-semibold">Urgent</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  placeholder="Additional details, preferences, or requirements..."
                  rows={3}
                  className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                />
              </div>

              {/* Tasks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Tasks</label>
                <div className="space-y-2 mb-3">
                  {tripTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 group">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}
                      >
                        {task.completed && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-xs flex-1 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                    placeholder="Add a task..."
                    className="flex-1 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-between">
              <div>
                {editingTrip && (
                  <button
                    onClick={() => { onDeletePipelineTrip(editingTrip.id); closePipelineModal(); }}
                    className="px-4 py-2 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-sm"
                  >
                    Delete Trip
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closePipelineModal}
                  className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPipelineTrip}
                  disabled={!tripName.trim() || !tripClientName.trim()}
                  className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTrip ? 'Save Changes' : 'Create Trip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Trip Modal */}
      {viewingTrip && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setViewingTrip(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900">{viewingTrip.name}</h2>
                    {viewingTrip.isUrgent && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold uppercase rounded">Urgent</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{viewingTrip.clientName}</p>
                </div>
                <button onClick={() => setViewingTrip(null)} className="text-slate-400 hover:text-slate-600 text-xl ml-4">&times;</button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Stage & Agent */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stage</label>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-sm ${
                    viewingTrip.stage === 'NEW' ? 'bg-slate-100 text-slate-600' :
                    viewingTrip.stage === 'PLANNING' ? 'bg-amber-100 text-amber-700' :
                    viewingTrip.stage === 'IN_PROGRESS' ? 'bg-paragon/10 text-paragon' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {viewingTrip.stage === 'NEW' ? 'New / Potential' :
                     viewingTrip.stage === 'PLANNING' ? 'Planning' :
                     viewingTrip.stage === 'IN_PROGRESS' ? 'In Progress' : 'Finalizing'}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agent</label>
                  <p className="text-sm text-slate-900 font-medium">{viewingTrip.agent}</p>
                </div>
              </div>

              {/* Dates */}
              {(viewingTrip.startDate || viewingTrip.endDate) && (
                <div className="flex gap-4">
                  {viewingTrip.startDate && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
                      <p className="text-sm text-slate-900">{new Date(viewingTrip.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingTrip.endDate && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                      <p className="text-sm text-slate-900">{new Date(viewingTrip.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Services */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Services</label>
                <div className="flex gap-3">
                  {viewingTrip.hasFlights && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-sm">
                      <svg className="w-4 h-4 text-paragon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Flights</span>
                    </div>
                  )}
                  {viewingTrip.hasHotels && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-sm">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Hotels</span>
                    </div>
                  )}
                  {viewingTrip.hasLogistics && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-sm">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Logistics</span>
                    </div>
                  )}
                  {!viewingTrip.hasFlights && !viewingTrip.hasHotels && !viewingTrip.hasLogistics && (
                    <p className="text-xs text-slate-400 italic">No services selected</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {viewingTrip.notes && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-sm">{viewingTrip.notes}</p>
                </div>
              )}

              {/* Tasks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Tasks ({viewingTrip.tasks.filter(t => t.completed).length}/{viewingTrip.tasks.length} completed)
                </label>
                {viewingTrip.tasks.length > 0 ? (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-sm">
                    {viewingTrip.tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleQuickToggleTask(viewingTrip.id, task.id)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 group-hover:border-paragon'}`}>
                          {task.completed && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tasks added</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-between">
              <button
                onClick={() => { onDeletePipelineTrip(viewingTrip.id); setViewingTrip(null); }}
                className="px-4 py-2 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-sm"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingTrip(null)}
                  className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => { openPipelineModal(viewingTrip); setViewingTrip(null); }}
                  className="px-6 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
                >
                  Edit Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConciergeTrips;
