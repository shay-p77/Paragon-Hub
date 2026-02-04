
import React, { useState, useEffect } from 'react';
import { SectionHeader, ConfirmModal, Badge, ClientAutocomplete, QuickAddCustomerModal } from './Shared';
import { PipelineTrip, PipelineStage, PipelineTask, User, BookingRequest, ConvertedFlight, ConvertedHotel, ConvertedLogistics, Comment, TaskComment } from '../types';
import { GoogleUser } from './Login';
import { API_URL } from '../config';
import { MOCK_USERS } from '../constants';

interface ConciergeTripsProps {
  googleUser?: GoogleUser | null;
  currentUser: User;
  pipelineTrips: PipelineTrip[];
  onAddPipelineTrip: (trip: PipelineTrip) => void;
  onUpdatePipelineTrip: (id: string, updates: Partial<PipelineTrip>) => void;
  onDeletePipelineTrip: (id: string) => void;
  requests?: BookingRequest[];
  onAddRequest?: (req: Partial<BookingRequest>) => void;
  convertedFlights?: ConvertedFlight[];
  convertedHotels?: ConvertedHotel[];
  convertedLogistics?: ConvertedLogistics[];
}

// Helper to parse date strings as local time (avoids timezone offset issues)
const parseLocalDate = (dateStr: string): Date => {
  // For YYYY-MM-DD format, parse as local date to avoid UTC conversion
  if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

// Format date for display
const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '---';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString();
};

const ConciergeTrips: React.FC<ConciergeTripsProps> = ({
  googleUser,
  currentUser,
  pipelineTrips,
  onAddPipelineTrip,
  onUpdatePipelineTrip,
  onDeletePipelineTrip,
  requests = [],
  onAddRequest,
  convertedFlights = [],
  convertedHotels = [],
  convertedLogistics = [],
}) => {
  // Pipeline/Kanban state
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<PipelineTrip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<PipelineTrip | null>(null);
  const [draggingTripId, setDraggingTripId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [tripName, setTripName] = useState('');
  const [tripClientId, setTripClientId] = useState<string | null>(null);
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
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Task detail modal state
  const [viewingTask, setViewingTask] = useState<PipelineTask | null>(null);
  const [viewingTaskTripId, setViewingTaskTripId] = useState<string | null>(null); // Track which trip the task belongs to
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [newTaskComment, setNewTaskComment] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Add request modal state
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'FLIGHT' | 'HOTEL' | 'LOGISTICS'>('FLIGHT');
  const [requestNotes, setRequestNotes] = useState('');
  const [requestPriority, setRequestPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [requestTargetDate, setRequestTargetDate] = useState('');
  const [requestTripId, setRequestTripId] = useState<string | null>(null);
  const [requestTripName, setRequestTripName] = useState<string>('');
  const [requestClientName, setRequestClientName] = useState<string>('');

  // Expanded itinerary item state
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Expanded task state (for inline task preview)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Customers state for autocomplete
  const [customers, setCustomers] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerInitialName, setNewCustomerInitialName] = useState('');

  // Users/Agents state from database
  const [agents, setAgents] = useState<{ id: string; name: string; role: string }[]>([]);

  // Fetch customers and agents
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/customers`);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.map((c: any) => ({ id: c.id, name: c.displayName || `${c.legalFirstName} ${c.legalLastName}`, email: c.email })));
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/users`);
        if (res.ok) {
          const data = await res.json();
          // Filter out CLIENT role, only keep staff
          setAgents(data.filter((u: any) => u.role !== 'CLIENT').map((u: any) => ({
            id: u.googleId,
            name: u.name,
            role: u.role
          })));
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchCustomers();
    fetchAgents();
  }, []);

  // Keep viewingTrip and viewingTask in sync with pipelineTrips when data changes (e.g., after saving comments)
  useEffect(() => {
    if (viewingTrip) {
      const updatedTrip = pipelineTrips.find(t => t.id === viewingTrip.id);
      if (updatedTrip && JSON.stringify(updatedTrip) !== JSON.stringify(viewingTrip)) {
        setViewingTrip(updatedTrip);
        // Also update viewingTask if it's from this trip
        if (viewingTask && viewingTaskTripId === updatedTrip.id) {
          const updatedTask = updatedTrip.tasks.find(t => t.id === viewingTask.id);
          if (updatedTask) {
            setViewingTask(updatedTask);
            setTaskComments(updatedTask.comments || []);
          }
        }
      }
    }
  }, [pipelineTrips]);

  // Get linked items for a trip
  const getTripRequests = (tripId: string) => requests.filter(r => r.tripId === tripId && r.status === 'PENDING');
  const getTripFlights = (tripId: string) => convertedFlights.filter(f => f.tripId === tripId);
  const getTripHotels = (tripId: string) => convertedHotels.filter(h => h.tripId === tripId);
  const getTripLogistics = (tripId: string) => convertedLogistics.filter(l => l.tripId === tripId);

  // Open add request modal for a specific trip
  const openAddRequestModal = (trip: PipelineTrip, type: 'FLIGHT' | 'HOTEL' | 'LOGISTICS') => {
    setRequestTripId(trip.id);
    setRequestTripName(trip.name);
    setRequestClientName(trip.clientName);
    setRequestType(type);
    setRequestNotes('');
    setRequestPriority('NORMAL');
    setRequestTargetDate(trip.startDate || '');
    setShowAddRequestModal(true);
  };

  const closeAddRequestModal = () => {
    setShowAddRequestModal(false);
    setRequestTripId(null);
    setRequestTripName('');
    setRequestClientName('');
    setRequestNotes('');
    setRequestPriority('NORMAL');
    setRequestTargetDate('');
  };

  const handleSubmitRequest = () => {
    if (!onAddRequest || !requestTripId) return;

    onAddRequest({
      agentId: googleUser?.googleId || currentUser.id,
      agentName: googleUser?.name || currentUser.name,
      type: requestType,
      priority: requestPriority,
      notes: requestNotes || '',
      tripId: requestTripId,
      tripName: requestTripName,
      clientName: requestClientName,
      details: {
        clientName: requestClientName,
        targetDate: requestTargetDate,
      },
    });

    closeAddRequestModal();
  };

  // Pipeline modal functions
  const openPipelineModal = (trip?: PipelineTrip, stage?: PipelineStage) => {
    if (trip) {
      setEditingTrip(trip);
      setTripName(trip.name);
      setTripClientId(trip.clientId || null);
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
      setTripClientId(null);
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
      completed: false,
      assignedTo: newTaskAssignee || undefined,
      deadline: newTaskDeadline || undefined
    }]);
    setNewTaskText('');
    setNewTaskAssignee('');
    setNewTaskDeadline('');
  };

  // Open task detail modal
  const openTaskDetail = (task: PipelineTask, tripId?: string) => {
    setViewingTask(task);
    setViewingTaskTripId(tripId || editingTrip?.id || null);
    setEditingTaskDescription(task.description || '');
    // Load comments from the task
    setTaskComments(task.comments || []);
    setNewTaskComment('');
  };

  // Close task detail modal
  const closeTaskDetail = () => {
    setViewingTask(null);
    setViewingTaskTripId(null);
    setTaskComments([]);
    setNewTaskComment('');
    setEditingTaskDescription('');
  };

  // Save task description
  const saveTaskDescription = () => {
    if (!viewingTask) return;

    // Update local state for edit modal
    setTripTasks(prev => prev.map(t =>
      t.id === viewingTask.id ? { ...t, description: editingTaskDescription } : t
    ));
    setViewingTask(prev => prev ? { ...prev, description: editingTaskDescription } : null);

    // Also save to database if we know the trip ID
    if (viewingTaskTripId) {
      const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
      if (trip) {
        const updatedTasks = trip.tasks.map(t =>
          t.id === viewingTask.id ? { ...t, description: editingTaskDescription } : t
        );
        onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
      }
    }
  };

  // Add comment to task
  const addTaskComment = () => {
    if (!viewingTask || !newTaskComment.trim()) return;
    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      authorId: googleUser?.googleId || currentUser.id,
      authorName: googleUser?.name || currentUser.name,
      text: newTaskComment.trim(),
      timestamp: new Date().toISOString(),
    };
    const updatedComments = [...taskComments, comment];
    setTaskComments(updatedComments);
    setNewTaskComment('');

    // Save to database
    if (viewingTaskTripId) {
      const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
      if (trip) {
        const updatedTasks = trip.tasks.map(t =>
          t.id === viewingTask.id ? { ...t, comments: updatedComments } : t
        );
        onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
      }
    }
  };

  // Edit comment
  const startEditingComment = (comment: TaskComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const saveEditedComment = () => {
    if (!viewingTask || !editingCommentId || !editingCommentText.trim()) return;

    const updatedComments = taskComments.map(c =>
      c.id === editingCommentId ? { ...c, text: editingCommentText.trim() } : c
    );
    setTaskComments(updatedComments);
    setEditingCommentId(null);
    setEditingCommentText('');

    // Save to database
    if (viewingTaskTripId) {
      const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
      if (trip) {
        const updatedTasks = trip.tasks.map(t =>
          t.id === viewingTask.id ? { ...t, comments: updatedComments } : t
        );
        onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
      }
    }
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  // Delete comment
  const deleteTaskComment = (commentId: string) => {
    if (!viewingTask) return;

    const updatedComments = taskComments.filter(c => c.id !== commentId);
    setTaskComments(updatedComments);

    // Save to database
    if (viewingTaskTripId) {
      const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
      if (trip) {
        const updatedTasks = trip.tasks.map(t =>
          t.id === viewingTask.id ? { ...t, comments: updatedComments } : t
        );
        onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
      }
    }
  };

  // Update task assignee
  const updateTaskAssignee = (taskId: string, assigneeId: string) => {
    setTripTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, assignedTo: assigneeId || undefined } : t
    ));
    if (viewingTask?.id === taskId) {
      setViewingTask(prev => prev ? { ...prev, assignedTo: assigneeId || undefined } : null);
    }
    // Save to database
    if (viewingTaskTripId) {
      const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
      if (trip) {
        const updatedTasks = trip.tasks.map(t =>
          t.id === taskId ? { ...t, assignedTo: assigneeId || undefined } : t
        );
        onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
      }
    }
  };

  // Update task deadline
  const updateTaskDeadline = (taskId: string, deadline: string) => {
    setTripTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, deadline: deadline || undefined } : t
    ));
    if (viewingTask?.id === taskId) {
      setViewingTask(prev => prev ? { ...prev, deadline: deadline || undefined } : null);
    }
    // Save to database
    if (viewingTaskTripId) {
      const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
      if (trip) {
        const updatedTasks = trip.tasks.map(t =>
          t.id === taskId ? { ...t, deadline: deadline || undefined } : t
        );
        onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
      }
    }
  };

  // Get agent name from id (prefer real agents, fallback to MOCK_USERS)
  const getAgentName = (agentId: string) => {
    const realAgent = agents.find(u => u.id === agentId);
    if (realAgent) return realAgent.name;
    const mockAgent = MOCK_USERS.find(u => u.id === agentId);
    return mockAgent?.name || agentId;
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
        clientId: tripClientId || undefined,
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
        clientId: tripClientId || undefined,
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
                  <ClientAutocomplete
                    value={tripClientName}
                    onChange={setTripClientName}
                    onSelectCustomer={(customer) => setTripClientId(customer.id)}
                    customers={customers}
                    onAddNewClient={() => {
                      setNewCustomerInitialName(tripClientName);
                      setShowAddCustomerModal(true);
                    }}
                    placeholder="Client name"
                    required
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
                    <div key={task.id} className="flex items-start gap-2 group p-2 bg-slate-50 rounded-sm hover:bg-slate-100 transition-colors">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center mt-0.5 ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}
                      >
                        {task.completed && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => openTaskDetail(task)}
                      >
                        <span className={`text-xs block ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {task.assignedTo && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-medium rounded-sm">
                              {getAgentName(task.assignedTo)}
                            </span>
                          )}
                          {task.deadline && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded-sm ${
                              parseLocalDate(task.deadline) < new Date() && !task.completed
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              Due: {formatDisplayDate(task.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Add Task Form */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-sm border border-slate-200">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                    placeholder="Task description..."
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                    >
                      <option value="">Assign to...</option>
                      {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon bg-white"
                      placeholder="Deadline"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTask}
                    disabled={!newTaskText.trim()}
                    className="w-full px-3 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-between">
              <div>
                {editingTrip && (
                  <button
                    onClick={() => setDeleteConfirm({ id: editingTrip.id, name: editingTrip.name || 'this trip' })}
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
                      <p className="text-sm text-slate-900">{formatDisplayDate(viewingTrip.startDate)}</p>
                    </div>
                  )}
                  {viewingTrip.endDate && (
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                      <p className="text-sm text-slate-900">{formatDisplayDate(viewingTrip.endDate)}</p>
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
                  <div className="space-y-2">
                    {viewingTrip.tasks.map(task => {
                      const hasDetails = task.description || task.assignedTo || task.deadline || (task.comments && task.comments.length > 0);
                      const isExpanded = expandedTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          className={`bg-slate-50 rounded-sm border border-slate-200 overflow-hidden transition-all ${task.completed ? 'opacity-70' : ''}`}
                        >
                          {/* Task Header Row */}
                          <div className="flex items-center gap-3 p-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleQuickToggleTask(viewingTrip.id, task.id); }}
                              className={`w-5 h-5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}
                            >
                              {task.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                              {/* Quick info badges */}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {task.assignedTo && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-medium rounded-sm">{getAgentName(task.assignedTo)}</span>
                                )}
                                {task.deadline && (
                                  <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded-sm ${
                                    parseLocalDate(task.deadline) < new Date() && !task.completed
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-amber-100 text-amber-600'
                                  }`}>
                                    Due: {formatDisplayDate(task.deadline)}
                                  </span>
                                )}
                                {task.description && (
                                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-medium rounded-sm">
                                    📝 Notes
                                  </span>
                                )}
                                {task.comments && task.comments.length > 0 && (
                                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-medium rounded-sm">
                                    💬 {task.comments.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${hasDetails ? 'hover:bg-slate-200 text-slate-500' : 'text-slate-300 cursor-default'}`}
                              title={hasDetails ? (isExpanded ? 'Collapse' : 'Expand details') : 'No additional details'}
                            >
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-white p-3 space-y-3">
                              {/* Description/Notes */}
                              {task.description && (
                                <div>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Notes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{task.description}</p>
                                </div>
                              )}

                              {/* Comments Preview */}
                              {task.comments && task.comments.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Recent Comments ({task.comments.length})</p>
                                  <div className="space-y-2">
                                    {task.comments.slice(-2).map(comment => (
                                      <div key={comment.id} className="bg-slate-50 rounded-sm p-2">
                                        <div className="flex justify-between items-center mb-0.5">
                                          <span className="text-[9px] font-bold text-slate-700">{comment.authorName}</span>
                                          <span className="text-[8px] text-slate-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 line-clamp-2">{comment.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Edit Details Button */}
                              <button
                                onClick={() => openTaskDetail(task, viewingTrip.id)}
                                className="w-full mt-2 px-3 py-2 bg-paragon/10 text-paragon text-[10px] font-bold uppercase tracking-wider hover:bg-paragon/20 transition-colors rounded-sm flex items-center justify-center gap-2"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Task Details
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tasks added</p>
                )}
              </div>

              {/* Itinerary & Requests Section */}
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trip Itinerary</label>
                  {onAddRequest && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAddRequestModal(viewingTrip, 'FLIGHT')}
                        className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 rounded-sm transition-colors"
                      >
                        + Flight
                      </button>
                      <button
                        onClick={() => openAddRequestModal(viewingTrip, 'HOTEL')}
                        className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-sm transition-colors"
                      >
                        + Hotel
                      </button>
                      <button
                        onClick={() => openAddRequestModal(viewingTrip, 'LOGISTICS')}
                        className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-sm transition-colors"
                      >
                        + Transfer
                      </button>
                    </div>
                  )}
                </div>

                {/* Pending Requests */}
                {getTripRequests(viewingTrip.id).length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-2">Pending Requests</p>
                    <div className="space-y-2">
                      {getTripRequests(viewingTrip.id).map(req => (
                        <div key={req.id} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-sm">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                          <span className="text-xs font-medium text-amber-800">{req.type}</span>
                          <span className="text-xs text-amber-600 truncate flex-1">{req.notes || 'Awaiting fulfillment'}</span>
                          {req.priority === 'URGENT' && <Badge color="red">URGENT</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmed Bookings */}
                {(getTripFlights(viewingTrip.id).length > 0 || getTripHotels(viewingTrip.id).length > 0 || getTripLogistics(viewingTrip.id).length > 0) ? (
                  <div className="space-y-2">
                    {getTripFlights(viewingTrip.id).map(f => (
                      <div key={f.id} className="bg-slate-50 rounded-sm overflow-hidden border border-slate-100">
                        <div
                          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => setExpandedItemId(expandedItemId === f.id ? null : f.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{f.airline} - {f.pnr}</p>
                            <p className="text-[10px] text-slate-500">{f.flights} • {f.dates}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge color={f.paymentStatus === 'PAID' ? 'teal' : 'red'}>{f.paymentStatus}</Badge>
                            <Badge color={f.status === 'TICKETED' ? 'teal' : f.status === 'CONFIRMED' ? 'gold' : 'slate'}>{f.status}</Badge>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedItemId === f.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {expandedItemId === f.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-200 bg-white space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-400">Passengers:</span>
                                <span className="ml-1 text-slate-700 font-medium">{f.passengerCount}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Agent:</span>
                                <span className="ml-1 text-slate-700 font-medium">{f.agent}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">P&L:</span>
                                <span className={`ml-1 font-medium ${f.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${f.profitLoss >= 0 ? '+' : ''}{f.profitLoss.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Created:</span>
                                <span className="ml-1 text-slate-700 font-medium">{new Date(f.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {f.notes && (
                              <div className="text-[10px]">
                                <span className="text-slate-400">Notes:</span>
                                <p className="text-slate-600 mt-0.5">{f.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {getTripHotels(viewingTrip.id).map(h => (
                      <div key={h.id} className="bg-slate-50 rounded-sm overflow-hidden border border-slate-100">
                        <div
                          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => setExpandedItemId(expandedItemId === h.id ? null : h.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{h.hotelName}</p>
                            <p className="text-[10px] text-slate-500">{h.roomType} • {h.checkIn} to {h.checkOut}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge color={h.paymentStatus === 'PAID' ? 'teal' : 'red'}>{h.paymentStatus}</Badge>
                            <Badge color={h.status === 'CONFIRMED' ? 'teal' : 'slate'}>{h.status}</Badge>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedItemId === h.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {expandedItemId === h.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-200 bg-white space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-400">Confirmation:</span>
                                <span className="ml-1 text-slate-700 font-medium">{h.confirmationNumber}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Guests:</span>
                                <span className="ml-1 text-slate-700 font-medium">{h.guestCount}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Agent:</span>
                                <span className="ml-1 text-slate-700 font-medium">{h.agent}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">P&L:</span>
                                <span className={`ml-1 font-medium ${h.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${h.profitLoss >= 0 ? '+' : ''}{h.profitLoss.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {h.notes && (
                              <div className="text-[10px]">
                                <span className="text-slate-400">Notes:</span>
                                <p className="text-slate-600 mt-0.5">{h.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {getTripLogistics(viewingTrip.id).map(l => (
                      <div key={l.id} className="bg-slate-50 rounded-sm overflow-hidden border border-slate-100">
                        <div
                          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => setExpandedItemId(expandedItemId === l.id ? null : l.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{l.serviceType}</p>
                            <p className="text-[10px] text-slate-500">{l.date} • {l.details}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge color={l.paymentStatus === 'PAID' ? 'teal' : 'red'}>{l.paymentStatus}</Badge>
                            <Badge color={l.status === 'CONFIRMED' ? 'teal' : 'slate'}>{l.status}</Badge>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedItemId === l.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {expandedItemId === l.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-200 bg-white space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-400">Confirmation:</span>
                                <span className="ml-1 text-slate-700 font-medium">{l.confirmationNumber}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Agent:</span>
                                <span className="ml-1 text-slate-700 font-medium">{l.agent}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">P&L:</span>
                                <span className={`ml-1 font-medium ${l.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${l.profitLoss >= 0 ? '+' : ''}{l.profitLoss.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Created:</span>
                                <span className="ml-1 text-slate-700 font-medium">{new Date(l.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {l.notes && (
                              <div className="text-[10px]">
                                <span className="text-slate-400">Notes:</span>
                                <p className="text-slate-600 mt-0.5">{l.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : getTripRequests(viewingTrip.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No bookings yet. Add a request to get started.</p>
                ) : null}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-between">
              <button
                onClick={() => setDeleteConfirm({ id: viewingTrip.id, name: viewingTrip.name || 'this trip' })}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDeletePipelineTrip(deleteConfirm.id);
            closePipelineModal();
            setViewingTrip(null);
          }
        }}
        title="Delete Trip"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will remove all associated tasks and cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Add Request Modal */}
      {showAddRequestModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeAddRequestModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-md mx-4 animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Add {requestType === 'FLIGHT' ? 'Flight' : requestType === 'HOTEL' ? 'Hotel' : 'Transfer'} Request
                  </h2>
                  <p className="text-sm text-slate-500">For: {requestTripName}</p>
                </div>
                <button onClick={closeAddRequestModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Request Type Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Request Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRequestType('FLIGHT')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                      requestType === 'FLIGHT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Flight
                  </button>
                  <button
                    onClick={() => setRequestType('HOTEL')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                      requestType === 'HOTEL' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Hotel
                  </button>
                  <button
                    onClick={() => setRequestType('LOGISTICS')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                      requestType === 'LOGISTICS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {/* Client Name (read-only from trip) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Client</label>
                <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded-sm">{requestClientName}</p>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Target Date {requestType === 'FLIGHT' ? '(Departure)' : requestType === 'HOTEL' ? '(Check-in)' : '(Service Date)'}
                </label>
                <input
                  type="date"
                  value={requestTargetDate}
                  onChange={(e) => setRequestTargetDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-sm p-2 text-sm focus:outline-none focus:border-paragon"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRequestPriority('NORMAL')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                      requestPriority === 'NORMAL' ? 'bg-paragon text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setRequestPriority('URGENT')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                      requestPriority === 'URGENT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              {/* Notes/Details */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Request Details
                </label>
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder={
                    requestType === 'FLIGHT' ? 'e.g., JFK to LAX, 2 passengers, prefer morning departure...' :
                    requestType === 'HOTEL' ? 'e.g., 5-star hotel near downtown, 2 nights, king bed...' :
                    'e.g., Airport pickup, sedan for 2 pax, flight arrives 3pm...'
                  }
                  rows={4}
                  className="w-full border border-slate-200 rounded-sm p-2 text-sm focus:outline-none focus:border-paragon resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={closeAddRequestModal}
                className="flex-1 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex-1 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm"
              >
                Submit to Operations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeTaskDetail}
        >
          <div
            className="bg-white rounded-sm shadow-2xl w-full max-w-lg mx-4 animate-zoomIn max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      // Update local state
                      handleToggleTask(viewingTask.id);
                      setViewingTask(prev => prev ? { ...prev, completed: !prev.completed } : null);
                      // Save to database if we have a trip ID
                      if (viewingTaskTripId) {
                        const trip = pipelineTrips.find(t => t.id === viewingTaskTripId);
                        if (trip) {
                          const updatedTasks = trip.tasks.map(t =>
                            t.id === viewingTask.id ? { ...t, completed: !t.completed } : t
                          );
                          onUpdatePipelineTrip(viewingTaskTripId, { tasks: updatedTasks });
                        }
                      }
                    }}
                    className={`w-5 h-5 rounded-sm border flex-shrink-0 flex items-center justify-center mt-0.5 ${viewingTask.completed ? 'bg-paragon border-paragon' : 'border-slate-300 hover:border-paragon'}`}
                  >
                    {viewingTask.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <h2 className={`text-lg font-bold ${viewingTask.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {viewingTask.text}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {viewingTask.assignedTo && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-medium rounded-sm">
                          {getAgentName(viewingTask.assignedTo)}
                        </span>
                      )}
                      {viewingTask.deadline && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded-sm ${
                          parseLocalDate(viewingTask.deadline) < new Date() && !viewingTask.completed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          Due: {formatDisplayDate(viewingTask.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={closeTaskDetail} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Assignment & Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned To</label>
                  <select
                    value={viewingTask.assignedTo || ''}
                    onChange={(e) => updateTaskAssignee(viewingTask.id, e.target.value)}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  >
                    <option value="">Unassigned</option>
                    {(agents.length > 0 ? agents : MOCK_USERS.filter(u => u.role !== 'CLIENT')).map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deadline</label>
                  <input
                    type="date"
                    value={viewingTask.deadline || ''}
                    onChange={(e) => updateTaskDeadline(viewingTask.id, e.target.value)}
                    className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description / Notes</label>
                <textarea
                  value={editingTaskDescription}
                  onChange={(e) => setEditingTaskDescription(e.target.value)}
                  onBlur={saveTaskDescription}
                  placeholder="Add more details about this task..."
                  rows={3}
                  className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                />
              </div>

              {/* Comments Section */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Comments</label>
                <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                  {taskComments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No comments yet</p>
                  ) : (
                    taskComments.map(comment => {
                      const isOwner = comment.authorId === (googleUser?.googleId || currentUser.id);
                      const isEditing = editingCommentId === comment.id;
                      return (
                        <div key={comment.id} className="bg-slate-50 rounded-sm p-3 group">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-700">{comment.authorName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-400">{new Date(comment.timestamp).toLocaleString()}</span>
                              {isOwner && !isEditing && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditingComment(comment)}
                                    className="text-slate-400 hover:text-paragon p-0.5"
                                    title="Edit"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => deleteTaskComment(comment.id)}
                                    className="text-slate-400 hover:text-red-500 p-0.5"
                                    title="Delete"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="mt-1">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="w-full p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2 mt-1">
                                <button
                                  onClick={cancelEditingComment}
                                  className="px-2 py-1 text-[9px] text-slate-500 hover:text-slate-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEditedComment}
                                  disabled={!editingCommentText.trim()}
                                  className="px-2 py-1 text-[9px] bg-paragon text-white rounded-sm hover:bg-paragon-dark disabled:opacity-50"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600">{comment.text}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskComment}
                    onChange={(e) => setNewTaskComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTaskComment()}
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-paragon"
                  />
                  <button
                    type="button"
                    onClick={addTaskComment}
                    disabled={!newTaskComment.trim()}
                    className="px-3 py-2 bg-paragon text-white text-[10px] font-bold uppercase tracking-widest hover:bg-paragon-dark transition-colors rounded-sm disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={closeTaskDetail}
                className="px-6 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      <QuickAddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onCustomerAdded={(newCustomer) => {
          setCustomers(prev => [...prev, newCustomer]);
          setTripClientId(newCustomer.id);
          setTripClientName(newCustomer.name);
        }}
        initialName={newCustomerInitialName}
        agents={agents.map(a => ({ id: a.id, name: a.name }))}
        defaultAgentId={googleUser?.googleId || googleUser?.id || currentUser.id}
      />
    </div>
  );
};

export default ConciergeTrips;
