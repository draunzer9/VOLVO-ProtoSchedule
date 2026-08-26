'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import {
  UserRole,
  Vehicle,
  Booking,
  CoverageCell,
  ConflictAlert,
  WorkshopServiceWindow,
  AppNotification,
  TestConditionType,
  VehicleStatus,
  PostSessionReport,
  WorkshopPrepChecklist,
  PartRequisition,
} from '@/types';
import {
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_COVERAGE_CELLS,
  INITIAL_CONFLICTS,
  INITIAL_WORKSHOP_WINDOWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PART_REQUISITIONS,
  TEST_CONDITIONS,
} from '@/data/seedData';

export interface PersonaInfo {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  avatar: string;
  badge: string;
  description: string;
}

export interface LiveHandshakeAction {
  id: string;
  title: string;
  message: string;
  sourceRole: UserRole;
  targetRole: UserRole;
  targetTab: string;
  actionLabel: string;
  timestamp: string;
  data?: any;
}

export const PERSONAS: Record<UserRole, PersonaInfo> = {
  RD_LEAD: {
    id: 'lead-maria',
    name: 'Maria Lindqvist',
    role: 'RD_LEAD',
    title: 'R&D Prototype Validation Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'R&D Lead',
    description: 'Oversees test plans, tracks coverage matrix, resolves booking conflicts, signs off milestones.',
  },
  TEST_DRIVER: {
    id: 'driver-arjun',
    name: 'Arjun Mehta',
    role: 'TEST_DRIVER',
    title: 'Senior Prototype Test Driver',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    badge: 'Test Driver',
    description: 'Books test slots, executes active track drives, logs telemetry & behavioral anomaly reports.',
  },
  WORKSHOP_TECH: {
    id: 'tech-lars',
    name: 'Lars Hedlund',
    role: 'WORKSHOP_TECH',
    title: 'Master Workshop & Rig Technician',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badge: 'Workshop Tech',
    description: 'Prepares prototype vehicles, executes safety checklists, manages bay service windows.',
  },
  OVERVIEW: {
    id: 'mgr-fleet',
    name: 'All-Stakeholders Overview',
    role: 'OVERVIEW',
    title: 'Connected Services Fleet Command',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    badge: 'Fleet Command',
    description: 'High-level multi-role panoramic view across scheduling, workshop, and validation.',
  },
};

interface ProtoScheduleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentPersona: PersonaInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  vehicles: Vehicle[];
  bookings: Booking[];
  coverageCells: CoverageCell[];
  conflicts: ConflictAlert[];
  workshopWindows: WorkshopServiceWindow[];
  notifications: AppNotification[];
  liveHandshake: LiveHandshakeAction | null;
  dismissHandshake: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  depotFilter: string;
  setDepotFilter: (d: string) => void;
  powertrainFilter: string;
  setPowertrainFilter: (p: string) => void;
  // Actions
  bookSlot: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    success: boolean;
    conflict?: ConflictAlert;
    message: string;
    bookingId?: string;
  };
  resolveConflict: (
    conflictId: string,
    resolutionType: 'REASSIGN' | 'RESCHEDULE' | 'CANCEL' | 'OVERRIDE',
    payload?: { newVehicleId?: string; newDate?: string; newStartTime?: string; newEndTime?: string; notes?: string }
  ) => void;
  startTestDrive: (bookingId: string) => void;
  completeTestDrive: (bookingId: string, report: PostSessionReport) => void;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus, notes?: string) => void;
  updateWorkshopChecklist: (serviceId: string, checklistUpdates: Partial<WorkshopPrepChecklist>) => void;
  markVehicleReadyForTest: (serviceId: string) => void;
  submitWorkshopInspection: (serviceId: string, markStatus: 'AVAILABLE' | 'IN_WORKSHOP', findingsNotes?: string) => void;
  dispatchWorkshopWorkOrder: (
    bookingId: string,
    directives: string,
    bayNumber: string,
    priority: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM'
  ) => void;
  addWorkshopServiceWindow: (serviceData: Omit<WorkshopServiceWindow, 'id' | 'loggedAt' | 'status'>) => void;
  partRequisitions: PartRequisition[];
  createPartRequisition: (reqData: Omit<PartRequisition, 'id' | 'requestedAt' | 'status'>) => void;
  reviewPartRequisition: (requisitionId: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => void;
  signOffCoverageMilestone: (vehicleId: string, conditionType: TestConditionType, leadNotes?: string) => void;
  requestRepeatTest: (bookingId: string, leadNotes: string) => void;
  exportCoverageCsv: () => void;
  exportUtilizationCsv: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaultData: () => void;
  stats: {
    utilizationRate: number;
    utilizationTarget: number;
    activeTestsCount: number;
    inWorkshopCount: number;
    unresolvedConflictsCount: number;
    pendingRequisitionsCount: number;
    coverageCompletedCount: number;
    totalCoverageCells: number;
    coveragePercent: number;
  };
}

const ProtoScheduleContext = createContext<ProtoScheduleContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VEHICLES: 'proto_vehicles_v1',
  BOOKINGS: 'proto_bookings_v1',
  COVERAGE: 'proto_coverage_v1',
  CONFLICTS: 'proto_conflicts_v1',
  WORKSHOP: 'proto_workshop_v1',
  REQUISITIONS: 'proto_requisitions_v1',
  NOTIFICATIONS: 'proto_notifications_v1',
  ROLE: 'proto_role_v1',
};

export const ProtoScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('RD_LEAD');
  const [activeTab, setActiveTab] = useState<string>('fleet');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [coverageCells, setCoverageCells] = useState<CoverageCell[]>(INITIAL_COVERAGE_CELLS);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>(INITIAL_CONFLICTS);
  const [workshopWindows, setWorkshopWindows] = useState<WorkshopServiceWindow[]>(INITIAL_WORKSHOP_WINDOWS);
  const [partRequisitions, setPartRequisitions] = useState<PartRequisition[]>(INITIAL_PART_REQUISITIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [liveHandshake, setLiveHandshake] = useState<LiveHandshakeAction | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [depotFilter, setDepotFilter] = useState<string>('ALL');
  const [powertrainFilter, setPowertrainFilter] = useState<string>('ALL');

  // Broadcast Channel for live cross-tab synchronization
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('protoschedule_live_sync');
        broadcastRef.current = bc;

        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'SYNC_STATE') {
            const { newVehicles, newBookings, newCoverage, newConflicts, newWorkshop, newRequisitions, newNotifications, handshake } = event.data;
            if (newVehicles) setVehicles(newVehicles);
            if (newBookings) setBookings(newBookings);
            if (newCoverage) setCoverageCells(newCoverage);
            if (newConflicts) setConflicts(newConflicts);
            if (newWorkshop) setWorkshopWindows(newWorkshop);
            if (newRequisitions) setPartRequisitions(newRequisitions);
            if (newNotifications) setNotifications(newNotifications);
            if (handshake) setLiveHandshake(handshake);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // Storage event fallback for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      try {
        if (e.key === STORAGE_KEYS.VEHICLES && e.newValue) setVehicles(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.BOOKINGS && e.newValue) setBookings(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.COVERAGE && e.newValue) setCoverageCells(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.CONFLICTS && e.newValue) setConflicts(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.WORKSHOP && e.newValue) setWorkshopWindows(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.REQUISITIONS && e.newValue) setPartRequisitions(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.NOTIFICATIONS && e.newValue) setNotifications(JSON.parse(e.newValue));
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (broadcastRef.current) broadcastRef.current.close();
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole | null;
      if (savedRole && PERSONAS[savedRole]) setRoleState(savedRole);

      const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

      const savedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedCoverage = localStorage.getItem(STORAGE_KEYS.COVERAGE);
      if (savedCoverage) setCoverageCells(JSON.parse(savedCoverage));

      const savedConflicts = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
      if (savedConflicts) setConflicts(JSON.parse(savedConflicts));

      const savedWorkshop = localStorage.getItem(STORAGE_KEYS.WORKSHOP);
      if (savedWorkshop) setWorkshopWindows(JSON.parse(savedWorkshop));

      const savedRequisitions = localStorage.getItem(STORAGE_KEYS.REQUISITIONS);
      if (savedRequisitions) setPartRequisitions(JSON.parse(savedRequisitions));

      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
  }, []);

  // Save changes to localStorage & broadcast to peer tabs
  const saveAll = (
    newVehicles: Vehicle[],
    newBookings: Booking[],
    newCoverage: CoverageCell[],
    newConflicts: ConflictAlert[],
    newWorkshop: WorkshopServiceWindow[],
    newNotifications: AppNotification[],
    handshake?: LiveHandshakeAction,
    newRequisitions?: PartRequisition[]
  ) => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(newVehicles));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(newBookings));
      localStorage.setItem(STORAGE_KEYS.COVERAGE, JSON.stringify(newCoverage));
      localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(newConflicts));
      localStorage.setItem(STORAGE_KEYS.WORKSHOP, JSON.stringify(newWorkshop));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
      if (newRequisitions) {
        localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(newRequisitions));
      }

      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: 'SYNC_STATE',
          newVehicles,
          newBookings,
          newCoverage,
          newConflicts,
          newWorkshop,
          newRequisitions: newRequisitions || partRequisitions,
          newNotifications,
          handshake,
        });
      }

      if (handshake) {
        setLiveHandshake(handshake);
      }
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
    } catch (e) {}
  };

  const dismissHandshake = () => {
    setLiveHandshake(null);
  };

  const currentPersona = useMemo(() => PERSONAS[role], [role]);

  // Helper for time overlap
  const isTimeOverlapping = (
    dateA: string,
    startA: string,
    endA: string,
    dateB: string,
    startB: string,
    endB: string
  ) => {
    if (dateA !== dateB) return false;
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const sA = toMinutes(startA);
    const eA = toMinutes(endA);
    const sB = toMinutes(startB);
    const eB = toMinutes(endB);
    return sA < eB && sB < eA;
  };

  // 1. Book Slot with Conflict Detection & Handshake
  const bookSlot = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const bookingId = `book-${Date.now().toString(36)}`;
    const vehicle = vehicles.find((v) => v.id === bookingData.vehicleId);
    if (!vehicle) {
      return { success: false, message: 'Invalid vehicle selected' };
    }

    // Check existing confirmed/in-progress bookings
    const overlappingBooking = bookings.find(
      (b) =>
        b.vehicleId === bookingData.vehicleId &&
        (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') &&
        isTimeOverlapping(b.date, b.startTime, b.endTime, bookingData.date, bookingData.startTime, bookingData.endTime)
    );

    // Check workshop service windows
    const overlappingWorkshop = workshopWindows.find(
      (w) =>
        w.vehicleId === bookingData.vehicleId &&
        w.status !== 'COMPLETED' &&
        isTimeOverlapping(w.date, w.startTime, w.endTime, bookingData.date, bookingData.startTime, bookingData.endTime)
    );

    if (overlappingBooking) {
      const conflictId = `conf-${Date.now().toString(36)}`;
      const newConflict: ConflictAlert = {
        id: conflictId,
        type: 'DOUBLE_BOOKING',
        severity: 'CRITICAL',
        vehicleId: vehicle.id,
        vehicleCode: vehicle.code,
        vehicleName: vehicle.name,
        conflictingBookingIds: [overlappingBooking.id, bookingId],
        detectedAt: new Date().toISOString(),
        description: `Double-booking attempt: ${bookingData.driverName} attempted to book ${vehicle.code} on ${bookingData.date} (${bookingData.startTime}-${bookingData.endTime}), colliding with ${overlappingBooking.driverName}'s confirmed reservation (${overlappingBooking.startTime}-${overlappingBooking.endTime}).`,
        suggestedAction: `Reassign ${bookingData.driverName} to an available peer vehicle or select an open slot.`,
        resolved: false,
      };

      const newBooking: Booking = {
        ...bookingData,
        id: bookingId,
        status: 'CONFLICT',
        createdAt: new Date().toISOString(),
      };

      const newNotification: AppNotification = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        title: `Double-Booking Blocked: ${vehicle.code}`,
        message: `Conflict flagged for ${bookingData.driverName} against ${overlappingBooking.driverName}. Zero silent conflicts allowed.`,
        type: 'CRITICAL',
        read: false,
        category: 'CONFLICT',
        actionLabel: 'Resolve in Hub',
        actionTab: 'conflicts',
      };

      const handshake: LiveHandshakeAction = {
        id: `hs-${Date.now()}`,
        title: 'Collision Detected by System Engine',
        message: `${bookingData.driverName}'s slot on ${vehicle.code} collided with ${overlappingBooking.driverName}. Maria (R&D Lead) notified to resolve.`,
        sourceRole: 'TEST_DRIVER',
        targetRole: 'RD_LEAD',
        targetTab: 'conflicts',
        actionLabel: 'Switch to Maria & Resolve Conflict',
        timestamp: new Date().toLocaleTimeString(),
      };

      const updatedBookings = [newBooking, ...bookings];
      const updatedConflicts = [newConflict, ...conflicts];
      const updatedNotifications = [newNotification, ...notifications];

      setBookings(updatedBookings);
      setConflicts(updatedConflicts);
      setNotifications(updatedNotifications);
      setLiveHandshake(handshake);
      saveAll(vehicles, updatedBookings, coverageCells, updatedConflicts, workshopWindows, updatedNotifications, handshake);

      return {
        success: false,
        conflict: newConflict,
        message: `Double-booking conflict detected! ${vehicle.code} is already reserved by ${overlappingBooking.driverName} during that slot.`,
        bookingId,
      };
    }

    if (overlappingWorkshop) {
      const conflictId = `conf-${Date.now().toString(36)}`;
      const newConflict: ConflictAlert = {
        id: conflictId,
        type: 'WORKSHOP_COLLISION',
        severity: 'CRITICAL',
        vehicleId: vehicle.id,
        vehicleCode: vehicle.code,
        vehicleName: vehicle.name,
        conflictingBookingIds: [bookingId],
        detectedAt: new Date().toISOString(),
        description: `Workshop Collision: ${vehicle.code} has a workshop maintenance window logged by ${overlappingWorkshop.technicianName} (${overlappingWorkshop.serviceType}) during ${bookingData.startTime}-${bookingData.endTime}.`,
        suggestedAction: `Reschedule test run after workshop bay release at ${overlappingWorkshop.endTime} or reassign to an available prototype.`,
        resolved: false,
      };

      const newBooking: Booking = {
        ...bookingData,
        id: bookingId,
        status: 'CONFLICT',
        createdAt: new Date().toISOString(),
      };

      const newNotification: AppNotification = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        title: `Workshop Collision on ${vehicle.code}`,
        message: `Booking for ${bookingData.driverName} conflicts with workshop service in ${overlappingWorkshop.bayNumber}.`,
        type: 'WARNING',
        read: false,
        category: 'CONFLICT',
        actionLabel: 'View Conflict',
        actionTab: 'conflicts',
      };

      const handshake: LiveHandshakeAction = {
        id: `hs-${Date.now()}`,
        title: 'Workshop Service Window Collision',
        message: `${vehicle.code} is in Lars' service window during ${bookingData.startTime}-${bookingData.endTime}. R&D Lead intervention available.`,
        sourceRole: 'TEST_DRIVER',
        targetRole: 'RD_LEAD',
        targetTab: 'conflicts',
        actionLabel: 'Switch to Maria & Reassign',
        timestamp: new Date().toLocaleTimeString(),
      };

      const updatedBookings = [newBooking, ...bookings];
      const updatedConflicts = [newConflict, ...conflicts];
      const updatedNotifications = [newNotification, ...notifications];

      setBookings(updatedBookings);
      setConflicts(updatedConflicts);
      setNotifications(updatedNotifications);
      setLiveHandshake(handshake);
      saveAll(vehicles, updatedBookings, coverageCells, updatedConflicts, workshopWindows, updatedNotifications, handshake);

      return {
        success: false,
        conflict: newConflict,
        message: `Workshop conflict! Vehicle is scheduled for ${overlappingWorkshop.serviceType} in ${overlappingWorkshop.bayNumber}.`,
        bookingId,
      };
    }

    // Successful booking
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicle.id && v.status === 'AVAILABLE'
        ? { ...v, status: 'RESERVED' as VehicleStatus, assignedDriverName: bookingData.driverName, activeSlotId: bookingId }
        : v
    );

    const updatedCoverage = coverageCells.map((c) =>
      c.vehicleId === vehicle.id && c.conditionType === bookingData.testCondition && c.status === 'NOT_STARTED'
        ? { ...c, status: 'SCHEDULED' as const, bookingId }
        : c
    );

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Booking Confirmed: ${vehicle.code}`,
      message: `${bookingData.driverName} confirmed for ${bookingData.testConditionLabel} on ${bookingData.date} (${bookingData.startTime}-${bookingData.endTime}). Lars preps vehicle at 08:00.`,
      type: 'SUCCESS',
      read: false,
      category: 'BOOKING',
      actionLabel: 'View Schedule',
      actionTab: 'fleet',
    };

    // Role handshake: Notify Lars (Workshop Tech) that vehicle needs pre-drive prep
    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `New Booking Confirmed: ${vehicle.code}`,
      message: `${bookingData.driverName} booked ${vehicle.code} for ${bookingData.testConditionLabel}. Lars received pre-drive safety checklist.`,
      sourceRole: 'TEST_DRIVER',
      targetRole: 'WORKSHOP_TECH',
      targetTab: 'workshop',
      actionLabel: 'Switch to Lars & Prep Vehicle',
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedBookings = [newBooking, ...bookings];
    const updatedNotifications = [newNotification, ...notifications];

    setVehicles(updatedVehicles);
    setBookings(updatedBookings);
    setCoverageCells(updatedCoverage);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, updatedBookings, updatedCoverage, conflicts, workshopWindows, updatedNotifications, handshake);

    return {
      success: true,
      message: `Reservation confirmed for ${vehicle.code} on ${bookingData.date} (${bookingData.startTime} - ${bookingData.endTime}).`,
      bookingId,
    };
  };

  // 2. Resolve Conflict
  const resolveConflict = (
    conflictId: string,
    resolutionType: 'REASSIGN' | 'RESCHEDULE' | 'CANCEL' | 'OVERRIDE',
    payload?: { newVehicleId?: string; newDate?: string; newStartTime?: string; newEndTime?: string; notes?: string }
  ) => {
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    let updatedBookings = [...bookings];
    let updatedVehicles = [...vehicles];
    let resolutionMessage = '';

    if (resolutionType === 'REASSIGN' && payload?.newVehicleId) {
      const targetVehicle = vehicles.find((v) => v.id === payload.newVehicleId);
      if (targetVehicle) {
        updatedBookings = updatedBookings.map((b) => {
          if (conflict.conflictingBookingIds.includes(b.id) && b.status === 'CONFLICT') {
            return {
              ...b,
              vehicleId: targetVehicle.id,
              vehicleCode: targetVehicle.code,
              vehicleName: targetVehicle.name,
              status: 'CONFIRMED' as const,
              notes: `${b.notes || ''} [Reassigned from ${conflict.vehicleCode} by Maria Lindqvist]`,
            };
          }
          return b;
        });
        resolutionMessage = `Reassigned booking to alternative prototype ${targetVehicle.code} (${targetVehicle.name}).`;
      }
    } else if (resolutionType === 'RESCHEDULE' && payload?.newDate && payload?.newStartTime && payload?.newEndTime) {
      updatedBookings = updatedBookings.map((b) => {
        if (conflict.conflictingBookingIds.includes(b.id) && b.status === 'CONFLICT') {
          return {
            ...b,
            date: payload.newDate!,
            startTime: payload.newStartTime!,
            endTime: payload.newEndTime!,
            status: 'CONFIRMED' as const,
            notes: `${b.notes || ''} [Rescheduled to ${payload.newDate} ${payload.newStartTime}-${payload.newEndTime}]`,
          };
        }
        return b;
      });
      resolutionMessage = `Rescheduled slot to open window on ${payload.newDate} (${payload.newStartTime} - ${payload.newEndTime}).`;
    } else if (resolutionType === 'CANCEL') {
      updatedBookings = updatedBookings.map((b) => {
        if (conflict.conflictingBookingIds.includes(b.id) && b.status === 'CONFLICT') {
          return { ...b, status: 'CANCELLED' as const };
        }
        return b;
      });
      resolutionMessage = `Cancelled conflicting booking. Driver notified with priority re-booking allowance.`;
    } else if (resolutionType === 'OVERRIDE') {
      updatedBookings = updatedBookings.map((b) => {
        if (conflict.conflictingBookingIds.includes(b.id) && b.status === 'CONFLICT') {
          return { ...b, status: 'CONFIRMED' as const, notes: `${b.notes || ''} [R&D Lead Override by Maria Lindqvist]` };
        }
        return b;
      });
      resolutionMessage = `R&D Lead Override granted. Priority track test authorized.`;
    }

    const updatedConflicts = conflicts.map((c) =>
      c.id === conflictId
        ? {
            ...c,
            resolved: true,
            resolvedAt: new Date().toISOString(),
            resolutionType,
            resolutionNotes: payload?.notes || resolutionMessage,
          }
        : c
    );

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Conflict Resolved (${resolutionType})`,
      message: `${conflict.vehicleCode}: ${resolutionMessage}`,
      type: 'SUCCESS',
      read: false,
      category: 'CONFLICT',
      actionLabel: 'View Schedule',
      actionTab: 'fleet',
    };

    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `Maria Resolved Conflict (${resolutionType})`,
      message: `${conflict.vehicleCode}: ${resolutionMessage}. Driver Arjun schedule updated.`,
      sourceRole: 'RD_LEAD',
      targetRole: 'TEST_DRIVER',
      targetTab: 'cockpit',
      actionLabel: 'Switch to Arjun & View Cockpit',
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedNotifications = [newNotification, ...notifications];

    setBookings(updatedBookings);
    setConflicts(updatedConflicts);
    setVehicles(updatedVehicles);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, updatedBookings, coverageCells, updatedConflicts, workshopWindows, updatedNotifications, handshake);
  };

  // 3. Start Test Drive
  const startTestDrive = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'IN_PROGRESS' as const } : b));
    const updatedVehicles = vehicles.map((v) =>
      v.id === booking.vehicleId
        ? {
            ...v,
            status: 'IN_TESTING' as VehicleStatus,
            assignedDriverName: booking.driverName,
            assignedDriverId: booking.driverId,
            activeSlotId: booking.id,
            lastUpdated: new Date().toISOString(),
          }
        : v
    );

    const updatedCoverage = coverageCells.map((c) =>
      c.vehicleId === booking.vehicleId && c.conditionType === booking.testCondition
        ? { ...c, status: 'IN_PROGRESS' as const, bookingId }
        : c
    );

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Test Drive Started: ${booking.vehicleCode}`,
      message: `${booking.driverName} initiated live test drive on ${booking.testConditionLabel}.`,
      type: 'INFO',
      read: false,
      category: 'TELEMETRY',
      actionLabel: 'Driver Cockpit',
      actionTab: 'cockpit',
    };

    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `Live Session Active: ${booking.vehicleCode}`,
      message: `${booking.driverName} is on track at ${booking.depotLocation}. Live speed & telemetry streaming.`,
      sourceRole: 'TEST_DRIVER',
      targetRole: 'RD_LEAD',
      targetTab: 'cockpit',
      actionLabel: 'View Live Telemetry',
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedNotifications = [newNotification, ...notifications];

    setBookings(updatedBookings);
    setVehicles(updatedVehicles);
    setCoverageCells(updatedCoverage);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, updatedBookings, updatedCoverage, conflicts, workshopWindows, updatedNotifications, handshake);
  };

  // 4. Complete Test Drive & Post-Session Report -> Sinks to Maria & Lars
  const completeTestDrive = (bookingId: string, report: PostSessionReport) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'COMPLETED' as const,
            postSessionReport: report,
          }
        : b
    );

    const isWorkshopFlagged = report.testResult === 'FLAGGED_FOR_WORKSHOP';
    const isRepeat = report.testResult === 'REPEAT_REQUIRED';
    const isComplete = report.testResult === 'PASSED';

    const nextStatus: VehicleStatus = isWorkshopFlagged
      ? 'PENDING_TRIAGE'
      : isRepeat
      ? 'AVAILABLE'
      : 'AVAILABLE';

    const updatedVehicles = vehicles.map((v) => {
      if (v.id === booking.vehicleId) {
        const nextOdo = v.odometerKm + report.distanceDrivenKm;
        const nextBattery = Math.max(15, v.batterySoC - Math.round(report.energyConsumedKwh / 4));
        return {
          ...v,
          status: nextStatus,
          odometerKm: nextOdo,
          batterySoC: nextBattery,
          activeIssuesCount: report.behavioralAnomalies.length > 0 ? v.activeIssuesCount + 1 : v.activeIssuesCount,
          lastUpdated: new Date().toISOString(),
        };
      }
      return v;
    });

    // Coverage matrix cell status update
    const updatedCoverage = coverageCells.map((c) => {
      if (c.vehicleId === booking.vehicleId && c.conditionType === booking.testCondition) {
        return {
          ...c,
          status: isComplete ? ('COMPLETE' as const) : ('NOT_STARTED' as const),
          completedDate: isComplete ? new Date().toISOString().split('T')[0] : undefined,
          completedByDriver: isComplete ? booking.driverName : undefined,
          signOffLead: isComplete
            ? 'Pending Maria Review'
            : isWorkshopFlagged
            ? 'Pending Maria R&D Triage'
            : 'Repeat Required',
          notes: isWorkshopFlagged
            ? `Flagged for R&D Triage: ${report.behavioralAnomalies.join('; ') || report.mechanicalNotes}`
            : report.mechanicalNotes,
        };
      }
      return c;
    });

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: isWorkshopFlagged
        ? `Anomaly Report: ${booking.vehicleCode}`
        : `Driver Report Submitted: ${booking.vehicleCode}`,
      message: isWorkshopFlagged
        ? `${booking.driverName} reported ${report.behavioralAnomalies.length} issue(s) on ${booking.vehicleCode}. Maria must review and dispatch work order to Lars.`
        : `${booking.driverName} logged ${report.distanceDrivenKm} km on ${booking.testConditionLabel}. Maria review ready!`,
      type: isWorkshopFlagged ? 'WARNING' : 'SUCCESS',
      read: false,
      category: isWorkshopFlagged ? 'COVERAGE' : 'COVERAGE',
      actionLabel: isWorkshopFlagged ? 'R&D Triage' : 'Review & Sign Off',
      actionTab: 'coverage',
    };

    // Cross-Role Handshake Alert: Route to Maria for R&D Triage first!
    const handshake: LiveHandshakeAction = isWorkshopFlagged
      ? {
          id: `hs-${Date.now()}`,
          title: `🚨 Anomaly Report: ${booking.vehicleCode} Needs R&D Triage`,
          message: `${booking.driverName} flagged ${booking.vehicleCode} (${report.behavioralAnomalies.length} anomalies). Maria must review & dispatch engineering directives to Lars.`,
          sourceRole: 'TEST_DRIVER',
          targetRole: 'RD_LEAD',
          targetTab: 'coverage',
          actionLabel: 'Switch to Maria & Dispatch Work Order',
          timestamp: new Date().toLocaleTimeString(),
          data: { bookingId, vehicleCode: booking.vehicleCode, anomalies: report.behavioralAnomalies },
        }
      : {
          id: `hs-${Date.now()}`,
          title: `Drive Completed: ${booking.vehicleCode}!`,
          message: `${booking.driverName} completed "${booking.testConditionLabel}" (${report.distanceDrivenKm} km - PASSED). Maria can sign off coverage milestone.`,
          sourceRole: 'TEST_DRIVER',
          targetRole: 'RD_LEAD',
          targetTab: 'coverage',
          actionLabel: 'Switch to Maria & Sign Off Milestone',
          timestamp: new Date().toLocaleTimeString(),
          data: { bookingId, vehicleCode: booking.vehicleCode, conditionLabel: booking.testConditionLabel },
        };

    const updatedNotifications = [newNotification, ...notifications];

    setBookings(updatedBookings);
    setVehicles(updatedVehicles);
    setCoverageCells(updatedCoverage);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, updatedBookings, updatedCoverage, conflicts, workshopWindows, updatedNotifications, handshake);
  };

  // 5. Dispatch Workshop Work Order (Maria R&D Lead -> Lars Workshop Tech)
  const dispatchWorkshopWorkOrder = (
    bookingId: string,
    directives: string,
    bayNumber: string,
    priority: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM'
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId && b.postSessionReport) {
        return {
          ...b,
          postSessionReport: {
            ...b.postSessionReport,
            rAndDDirectiveNotes: directives,
            dispatchedToWorkshopAt: new Date().toISOString(),
            dispatchedBay: bayNumber,
            repairPriority: priority,
          },
        };
      }
      return b;
    });

    const updatedVehicles = vehicles.map((v) =>
      v.id === booking.vehicleId
        ? { ...v, status: 'IN_WORKSHOP' as VehicleStatus, lastUpdated: new Date().toISOString() }
        : v
    );

    const updatedCoverage = coverageCells.map((c) =>
      c.vehicleId === booking.vehicleId && c.conditionType === booking.testCondition
        ? { ...c, signOffLead: `In Workshop (${bayNumber})`, notes: `R&D Directive: ${directives}` }
        : c
    );

    const newService: WorkshopServiceWindow = {
      id: `serv-${Date.now().toString(36)}`,
      vehicleId: booking.vehicleId,
      vehicleCode: booking.vehicleCode,
      vehicleName: booking.vehicleName,
      bayNumber,
      technicianName: 'Lars Hedlund',
      serviceType: 'POST_DRIVE_INSPECTION',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:45',
      endTime: '18:00',
      status: 'QUEUED',
      checklist: {
        tirePressureChecked: false,
        telemetryLoggerMounted: true,
        ballastCalibrated: false,
        highVoltageSafetyVerified: false,
        firmwareFlashed: false,
        brakesInspected: false,
      },
      findingsNotes: `Driver Anomaly: ${booking.postSessionReport?.behavioralAnomalies.join('; ') || 'Inspection requested'}. Driver Notes: ${booking.postSessionReport?.mechanicalNotes}`,
      rAndDDirectives: directives,
      dispatchedBy: 'Maria Lindqvist (R&D Lead)',
      priority,
      reportedByDriverId: booking.driverId,
      reportedByDriverName: booking.driverName,
      originalBookingId: booking.id,
      loggedAt: new Date().toISOString(),
    };

    const updatedWorkshop = [newService, ...workshopWindows];

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Work Order Dispatched: ${booking.vehicleCode}`,
      message: `Maria dispatched technical directives to ${bayNumber} (${priority}). Lars can begin repair execution.`,
      type: 'INFO',
      read: false,
      category: 'WORKSHOP',
      actionLabel: 'Workshop Center',
      actionTab: 'workshop',
    };

    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `🚀 Work Order Dispatched: ${booking.vehicleCode}`,
      message: `Maria Lindqvist dispatched engineering directives to ${bayNumber} (${priority}): "${directives}". Lars can start repairs.`,
      sourceRole: 'RD_LEAD',
      targetRole: 'WORKSHOP_TECH',
      targetTab: 'workshop',
      actionLabel: 'Switch to Lars & Execute Work Order',
      timestamp: new Date().toLocaleTimeString(),
      data: { bookingId, vehicleCode: booking.vehicleCode, bayNumber, priority, directives },
    };

    const updatedNotifications = [newNotification, ...notifications];

    setBookings(updatedBookings);
    setVehicles(updatedVehicles);
    setCoverageCells(updatedCoverage);
    setWorkshopWindows(updatedWorkshop);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, updatedBookings, updatedCoverage, conflicts, updatedWorkshop, updatedNotifications, handshake);
  };

  // 5. Update Vehicle Status directly
  const updateVehicleStatus = (vehicleId: string, status: VehicleStatus, notes?: string) => {
    const updatedVehicles = vehicles.map((v) => (v.id === vehicleId ? { ...v, status, lastUpdated: new Date().toISOString() } : v));
    const targetVeh = vehicles.find((v) => v.id === vehicleId);

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Vehicle Status Changed: ${targetVeh?.code || vehicleId}`,
      message: `Status updated to ${status} ${notes ? `(${notes})` : ''}.`,
      type: 'INFO',
      read: false,
      category: 'WORKSHOP',
      actionLabel: 'Fleet Board',
      actionTab: 'fleet',
    };

    const updatedNotifications = [newNotification, ...notifications];

    setVehicles(updatedVehicles);
    setNotifications(updatedNotifications);
    saveAll(updatedVehicles, bookings, coverageCells, conflicts, workshopWindows, updatedNotifications);
  };

  // 6. Workshop Actions (Lars -> Arjun Handshake)
  const updateWorkshopChecklist = (serviceId: string, checklistUpdates: Partial<WorkshopPrepChecklist>) => {
    const updated = workshopWindows.map((w) =>
      w.id === serviceId
        ? {
            ...w,
            checklist: { ...w.checklist, ...checklistUpdates },
          }
        : w
    );
    setWorkshopWindows(updated);
    saveAll(vehicles, bookings, coverageCells, conflicts, updated, notifications);
  };

  const markVehicleReadyForTest = (serviceId: string) => {
    const service = workshopWindows.find((w) => w.id === serviceId);
    if (!service) return;

    const updatedWorkshop = workshopWindows.map((w) =>
      w.id === serviceId
        ? {
            ...w,
            status: 'READY_FOR_TEST' as const,
            checklist: {
              tirePressureChecked: true,
              telemetryLoggerMounted: true,
              ballastCalibrated: true,
              highVoltageSafetyVerified: true,
              firmwareFlashed: true,
              brakesInspected: true,
            },
          }
        : w
    );

    const updatedVehicles = vehicles.map((v) =>
      v.id === service.vehicleId ? { ...v, workshopPrepCompleted: true, lastUpdated: new Date().toISOString() } : v
    );

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Vehicle Certified Ready: ${service.vehicleCode}`,
      message: `Lars Hedlund completed safety prep for ${service.vehicleCode}. Staged at paddock for driver pickup.`,
      type: 'SUCCESS',
      read: false,
      category: 'WORKSHOP',
      actionLabel: 'Driver Cockpit',
      actionTab: 'cockpit',
    };

    // Handshake: Notify Driver Arjun that vehicle is prepped and ready for departure
    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `Vehicle Ready for Pickup: ${service.vehicleCode}`,
      message: `Lars signed off all 6 safety checks for ${service.vehicleCode}. Arjun can now start the live test drive at Hällered track.`,
      sourceRole: 'WORKSHOP_TECH',
      targetRole: 'TEST_DRIVER',
      targetTab: 'cockpit',
      actionLabel: 'Switch to Arjun & Start Track Drive',
      timestamp: new Date().toLocaleTimeString(),
      data: { vehicleId: service.vehicleId, vehicleCode: service.vehicleCode },
    };

    const updatedNotifications = [newNotification, ...notifications];

    setWorkshopWindows(updatedWorkshop);
    setVehicles(updatedVehicles);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, bookings, coverageCells, conflicts, updatedWorkshop, updatedNotifications, handshake);
  };

  const submitWorkshopInspection = (serviceId: string, markStatus: 'AVAILABLE' | 'IN_WORKSHOP', findingsNotes?: string) => {
    const service = workshopWindows.find((w) => w.id === serviceId);
    if (!service) return;

    const isHoldInBay = markStatus === 'IN_WORKSHOP';

    const updatedWorkshop = workshopWindows.map((w) =>
      w.id === serviceId
        ? {
            ...w,
            status: isHoldInBay ? ('IN_PROGRESS' as const) : ('COMPLETED' as const),
            findingsNotes: findingsNotes || (isHoldInBay ? 'Held in bay for extended repairs / component replacement.' : w.findingsNotes),
          }
        : w
    );

    const updatedVehicles = vehicles.map((v) =>
      v.id === service.vehicleId
        ? {
            ...v,
            status: isHoldInBay ? ('IN_WORKSHOP' as VehicleStatus) : ('AVAILABLE' as VehicleStatus),
            activeIssuesCount: isHoldInBay ? Math.max(1, v.activeIssuesCount) : 0,
            workshopPrepCompleted: !isHoldInBay,
            lastUpdated: new Date().toISOString(),
          }
        : v
    );

    // If the vehicle was previously flagged for workshop, automatically queue a Re-Test session for the driver who reported the issue!
    let updatedBookings = [...bookings];
    const prevBooking = bookings.find(
      (b) => b.vehicleId === service.vehicleId && b.postSessionReport?.testResult === 'FLAGGED_FOR_WORKSHOP'
    );
    const targetDriverId = service.reportedByDriverId || prevBooking?.driverId || 'driver-arjun';
    const targetDriverName = service.reportedByDriverName || prevBooking?.driverName || 'Arjun Mehta';

    if (!isHoldInBay) {
      const newRetestBooking: Booking = {
        id: `book-retest-${Date.now().toString(36)}`,
        vehicleId: service.vehicleId,
        vehicleCode: service.vehicleCode,
        vehicleName: service.vehicleName,
        driverId: targetDriverId,
        driverName: targetDriverName,
        rAndDLead: 'Maria Lindqvist',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '17:00',
        testCondition: prevBooking?.testCondition || 'HIGHWAY_AERO',
        testConditionLabel: prevBooking ? `Re-Test: ${prevBooking.testConditionLabel}` : 'Post-Repair Re-Test Verification',
        targetMilestone: 'Validation Milestone MS-3B',
        status: 'CONFIRMED',
        depotLocation: 'Hällered Proving Ground',
        notes: `Re-Test Verification Run for ${targetDriverName} after Lars completed workshop repairs in ${service.bayNumber}: "${findingsNotes || 'Directives executed'}"`,
        createdAt: new Date().toISOString(),
      };

      updatedBookings = [newRetestBooking, ...bookings];
      setBookings(updatedBookings);
    }

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: isHoldInBay
        ? `Vehicle Held in Bay: ${service.vehicleCode}`
        : `Vehicle Repaired & Released: ${service.vehicleCode}`,
      message: isHoldInBay
        ? `Lars set ${service.vehicleCode} to Hold in Bay (${service.bayNumber}) for active repairs.`
        : `Lars completed post-drive intake and returned ${service.vehicleCode} to Available status. Queued for ${targetDriverName} for re-test.`,
      type: isHoldInBay ? 'WARNING' : 'SUCCESS',
      read: false,
      category: 'WORKSHOP',
      actionLabel: isHoldInBay ? 'Workshop Queue' : 'Driver Cockpit',
      actionTab: isHoldInBay ? 'workshop' : 'cockpit',
    };

    const handshake: LiveHandshakeAction = isHoldInBay
      ? {
          id: `hs-${Date.now()}`,
          title: `Vehicle Held in Bay: ${service.vehicleCode}`,
          message: `Lars Hedlund held ${service.vehicleCode} in ${service.bayNumber} (Status: IN_PROGRESS). R&D lead & fleet notified.`,
          sourceRole: 'WORKSHOP_TECH',
          targetRole: 'RD_LEAD',
          targetTab: 'fleet',
          actionLabel: 'View Fleet Status',
          timestamp: new Date().toLocaleTimeString(),
        }
      : {
          id: `hs-${Date.now()}`,
          title: `Vehicle Repaired & Released: ${service.vehicleCode}`,
          message: `Lars certified ${service.vehicleCode} after workshop repairs. Queued for ${targetDriverName} for immediate track re-test validation.`,
          sourceRole: 'WORKSHOP_TECH',
          targetRole: 'TEST_DRIVER',
          targetTab: 'cockpit',
          actionLabel: `Switch to ${targetDriverName.split(' ')[0]} & Start Re-Test Drive`,
          timestamp: new Date().toLocaleTimeString(),
          data: { vehicleId: service.vehicleId, vehicleCode: service.vehicleCode, driverId: targetDriverId, driverName: targetDriverName },
        };

    const updatedNotifications = [newNotification, ...notifications];

    setWorkshopWindows(updatedWorkshop);
    setVehicles(updatedVehicles);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(updatedVehicles, updatedBookings, coverageCells, conflicts, updatedWorkshop, updatedNotifications, handshake);
  };

  const addWorkshopServiceWindow = (serviceData: Omit<WorkshopServiceWindow, 'id' | 'loggedAt' | 'status'>) => {
    const newService: WorkshopServiceWindow = {
      ...serviceData,
      id: `serv-${Date.now().toString(36)}`,
      status: 'QUEUED',
      loggedAt: new Date().toISOString(),
    };

    const updatedWorkshop = [newService, ...workshopWindows];

    const overlappingBookings = bookings.filter(
      (b) =>
        b.vehicleId === serviceData.vehicleId &&
        (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') &&
        isTimeOverlapping(b.date, b.startTime, b.endTime, serviceData.date, serviceData.startTime, serviceData.endTime)
    );

    let updatedConflicts = [...conflicts];
    let updatedNotifications = [...notifications];

    if (overlappingBookings.length > 0) {
      const conflictId = `conf-${Date.now().toString(36)}`;
      const newConflict: ConflictAlert = {
        id: conflictId,
        type: 'WORKSHOP_COLLISION',
        severity: 'CRITICAL',
        vehicleId: serviceData.vehicleId,
        vehicleCode: serviceData.vehicleCode,
        vehicleName: serviceData.vehicleName,
        conflictingBookingIds: overlappingBookings.map((b) => b.id),
        detectedAt: new Date().toISOString(),
        description: `Workshop Collision: Lars scheduled ${serviceData.serviceType} in ${serviceData.bayNumber} on ${serviceData.date} (${serviceData.startTime}-${serviceData.endTime}), which impacts booked test drive(s).`,
        suggestedAction: `Reassign drivers to peer vehicles or adjust service timing.`,
        resolved: false,
      };
      updatedConflicts = [newConflict, ...conflicts];

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        title: `Workshop Conflict Detected: ${serviceData.vehicleCode}`,
        message: `Service in ${serviceData.bayNumber} overlaps with active test drive bookings.`,
        type: 'CRITICAL',
        read: false,
        category: 'CONFLICT',
        actionLabel: 'Resolve in Hub',
        actionTab: 'conflicts',
      };
      updatedNotifications = [newNotif, ...notifications];
    }

    setWorkshopWindows(updatedWorkshop);
    setConflicts(updatedConflicts);
    setNotifications(updatedNotifications);
    saveAll(vehicles, bookings, coverageCells, updatedConflicts, updatedWorkshop, updatedNotifications);
  };

  // 6.2 Part Requisition & Procurement Approval (Lars -> Maria Handshake)
  const createPartRequisition = (reqData: Omit<PartRequisition, 'id' | 'requestedAt' | 'status'>) => {
    const newReq: PartRequisition = {
      ...reqData,
      id: `req-${Date.now().toString(36)}`,
      requestedAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
    };

    const updatedRequisitions = [newReq, ...partRequisitions];

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Parts Approval Requested: ${reqData.vehicleCode}`,
      message: `Lars Hedlund requested "${reqData.partName}" (€${reqData.estimatedCostEur.toLocaleString()}). Maria Lindqvist approval required to release procurement.`,
      type: 'WARNING',
      read: false,
      category: 'WORKSHOP',
      actionLabel: 'Review Requisition',
      actionTab: 'coverage',
    };

    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `Parts Procurement Requested: ${reqData.vehicleCode}`,
      message: `Lars requested '${reqData.partName}' (€${reqData.estimatedCostEur.toLocaleString()}) for ${reqData.vehicleCode}. Maria must review & approve.`,
      sourceRole: 'WORKSHOP_TECH',
      targetRole: 'RD_LEAD',
      targetTab: 'coverage',
      actionLabel: 'Switch to Maria & Approve Part',
      timestamp: new Date().toLocaleTimeString(),
      data: { requisitionId: newReq.id, vehicleCode: reqData.vehicleCode },
    };

    const updatedNotifications = [newNotification, ...notifications];

    setPartRequisitions(updatedRequisitions);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(vehicles, bookings, coverageCells, conflicts, workshopWindows, updatedNotifications, handshake, updatedRequisitions);
  };

  const reviewPartRequisition = (requisitionId: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => {
    const req = partRequisitions.find((r) => r.id === requisitionId);
    if (!req) return;

    const isApproved = decision === 'APPROVED';

    const updatedRequisitions = partRequisitions.map((r) =>
      r.id === requisitionId
        ? {
            ...r,
            status: decision,
            reviewedBy: 'Maria Lindqvist (R&D Lead)',
            reviewedAt: new Date().toISOString(),
            approvalNotes: notes || (isApproved ? 'Approved by R&D Lead. Procurement released.' : 'Alternative part or repair suggested.'),
          }
        : r
    );

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: isApproved
        ? `Part Requisition Approved: ${req.vehicleCode}`
        : `Part Requisition Rejected: ${req.vehicleCode}`,
      message: isApproved
        ? `Maria Lindqvist approved '${req.partName}' (€${req.estimatedCostEur.toLocaleString()}). Lars can proceed with installation.`
        : `Maria Lindqvist rejected '${req.partName}'. Note: ${notes || 'Check workshop diagnostics.'}`,
      type: isApproved ? 'SUCCESS' : 'WARNING',
      read: false,
      category: 'WORKSHOP',
      actionLabel: 'Open Workshop',
      actionTab: 'workshop',
    };

    const handshake: LiveHandshakeAction = isApproved
      ? {
          id: `hs-${Date.now()}`,
          title: `Part Approved by Maria: ${req.vehicleCode}`,
          message: `Maria authorized procurement for '${req.partName}'. Lars can now install in ${req.allocatedBay || 'Bay'}.`,
          sourceRole: 'RD_LEAD',
          targetRole: 'WORKSHOP_TECH',
          targetTab: 'workshop',
          actionLabel: 'Switch to Lars & Install Part',
          timestamp: new Date().toLocaleTimeString(),
          data: { requisitionId: req.id, vehicleCode: req.vehicleCode },
        }
      : {
          id: `hs-${Date.now()}`,
          title: `Part Rejected by Maria: ${req.vehicleCode}`,
          message: `Maria rejected request for '${req.partName}': ${notes || 'See engineering remarks.'}`,
          sourceRole: 'RD_LEAD',
          targetRole: 'WORKSHOP_TECH',
          targetTab: 'workshop',
          actionLabel: 'Switch to Lars & View Details',
          timestamp: new Date().toLocaleTimeString(),
        };

    const updatedNotifications = [newNotification, ...notifications];

    setPartRequisitions(updatedRequisitions);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(vehicles, bookings, coverageCells, conflicts, workshopWindows, updatedNotifications, handshake, updatedRequisitions);
  };

  // 7. R&D Lead Sign-off & Milestone Approval (Maria -> Driver Handshake)
  const signOffCoverageMilestone = (vehicleId: string, conditionType: TestConditionType, leadNotes?: string) => {
    const updatedCoverage = coverageCells.map((c) =>
      c.vehicleId === vehicleId && c.conditionType === conditionType
        ? {
            ...c,
            status: 'COMPLETE' as const,
            completedDate: new Date().toISOString().split('T')[0],
            signOffLead: 'Maria Lindqvist',
            notes: leadNotes || 'Validated by R&D Lead Maria Lindqvist for Production Gate Review.',
          }
        : c
    );

    // Also mark the booking report signed off
    const updatedBookings = bookings.map((b) => {
      if (b.vehicleId === vehicleId && b.testCondition === conditionType && b.postSessionReport) {
        return {
          ...b,
          postSessionReport: {
            ...b.postSessionReport,
            signedOffByLead: true,
            leadNotes: leadNotes || 'Approved by Maria Lindqvist.',
          },
        };
      }
      return b;
    });

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const condMeta = TEST_CONDITIONS.find((t) => t.type === conditionType);

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Milestone Approved: ${vehicle?.code || vehicleId}`,
      message: `Maria Lindqvist signed off "${condMeta?.label || conditionType}". Coverage updated!`,
      type: 'SUCCESS',
      read: false,
      category: 'COVERAGE',
      actionLabel: 'View Matrix',
      actionTab: 'coverage',
    };

    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `Milestone Signed Off by Maria!`,
      message: `Maria approved "${condMeta?.label || conditionType}" for ${vehicle?.code}. Test driver validated for MS-3B.`,
      sourceRole: 'RD_LEAD',
      targetRole: 'TEST_DRIVER',
      targetTab: 'cockpit',
      actionLabel: 'Switch to Arjun & View Report',
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedNotifications = [newNotification, ...notifications];

    setCoverageCells(updatedCoverage);
    setBookings(updatedBookings);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(vehicles, updatedBookings, updatedCoverage, conflicts, workshopWindows, updatedNotifications, handshake);
  };

  const requestRepeatTest = (bookingId: string, leadNotes: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId && b.postSessionReport) {
        return {
          ...b,
          postSessionReport: {
            ...b.postSessionReport,
            testResult: 'REPEAT_REQUIRED' as const,
            signedOffByLead: false,
            leadNotes: `Repeat Requested by Maria: ${leadNotes}`,
          },
        };
      }
      return b;
    });

    const updatedCoverage = coverageCells.map((c) =>
      c.vehicleId === booking.vehicleId && c.conditionType === booking.testCondition
        ? { ...c, status: 'NOT_STARTED' as const, notes: `Repeat required: ${leadNotes}` }
        : c
    );

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `Repeat Test Requested: ${booking.vehicleCode}`,
      message: `Maria requested repeat run for ${booking.testConditionLabel}: "${leadNotes}"`,
      type: 'WARNING',
      read: false,
      category: 'COVERAGE',
      actionLabel: 'Driver Cockpit',
      actionTab: 'cockpit',
    };

    const handshake: LiveHandshakeAction = {
      id: `hs-${Date.now()}`,
      title: `Repeat Test Requested: ${booking.vehicleCode}`,
      message: `Maria flagged "${booking.testConditionLabel}" for re-testing: "${leadNotes}". Arjun can book repeat slot.`,
      sourceRole: 'RD_LEAD',
      targetRole: 'TEST_DRIVER',
      targetTab: 'cockpit',
      actionLabel: 'Switch to Arjun & Re-Book',
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedNotifications = [newNotification, ...notifications];

    setBookings(updatedBookings);
    setCoverageCells(updatedCoverage);
    setNotifications(updatedNotifications);
    setLiveHandshake(handshake);
    saveAll(vehicles, updatedBookings, updatedCoverage, conflicts, workshopWindows, updatedNotifications, handshake);
  };

  // 8. Export CSVs
  const exportCoverageCsv = () => {
    const headers = ['Vehicle Code', 'Vehicle Name', 'Powertrain', 'Test Condition', 'Status', 'Completed Date', 'Tested By', 'Lead Sign-off'];
    const rows = coverageCells.map((cell) => {
      const v = vehicles.find((veh) => veh.id === cell.vehicleId);
      const c = TEST_CONDITIONS.find((cond) => cond.type === cell.conditionType);
      return [
        `"${v?.code || cell.vehicleId}"`,
        `"${v?.name || ''}"`,
        `"${v?.powertrain || ''}"`,
        `"${c?.label || cell.conditionType}"`,
        `"${cell.status}"`,
        `"${cell.completedDate || 'N/A'}"`,
        `"${cell.completedByDriver || 'N/A'}"`,
        `"${cell.signOffLead || 'N/A'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ProtoSchedule_Test_Coverage_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUtilizationCsv = () => {
    const headers = ['Vehicle Code', 'Vehicle Name', 'Category', 'Powertrain', 'Depot', 'Current Status', 'Battery SoC %', 'Odometer (km)', 'Active Issues', 'Total Booked Sessions'];
    const rows = vehicles.map((v) => {
      const bookedCount = bookings.filter((b) => b.vehicleId === v.id).length;
      return [
        `"${v.code}"`,
        `"${v.name}"`,
        `"${v.category}"`,
        `"${v.powertrain}"`,
        `"${v.depotLocation}"`,
        `"${v.status}"`,
        `"${v.batterySoC}%"`,
        `"${v.odometerKm}"`,
        `"${v.activeIssuesCount}"`,
        `"${bookedCount}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ProtoSchedule_Fleet_Utilisation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 9. Notifications
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveAll(vehicles, bookings, coverageCells, conflicts, workshopWindows, updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveAll(vehicles, bookings, coverageCells, conflicts, workshopWindows, updated);
  };

  const resetToDefaultData = () => {
    setVehicles(INITIAL_VEHICLES);
    setBookings(INITIAL_BOOKINGS);
    setCoverageCells(INITIAL_COVERAGE_CELLS);
    setConflicts(INITIAL_CONFLICTS);
    setWorkshopWindows(INITIAL_WORKSHOP_WINDOWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setLiveHandshake(null);
    saveAll(
      INITIAL_VEHICLES,
      INITIAL_BOOKINGS,
      INITIAL_COVERAGE_CELLS,
      INITIAL_CONFLICTS,
      INITIAL_WORKSHOP_WINDOWS,
      INITIAL_NOTIFICATIONS
    );
  };

  // Compute Live Stats
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const busyVehicles = vehicles.filter((v) => v.status === 'IN_TESTING' || v.status === 'RESERVED').length;
    const calculatedUtilization = totalVehicles > 0 ? Math.round((busyVehicles / totalVehicles) * 100 * 0.85 + 20) : 54;
    const utilizationRate = Math.min(94, Math.max(54, calculatedUtilization));

    const activeTestsCount = vehicles.filter((v) => v.status === 'IN_TESTING').length;
    const inWorkshopCount = vehicles.filter((v) => v.status === 'IN_WORKSHOP').length;
    const unresolvedConflictsCount = conflicts.filter((c) => !c.resolved).length;
    const pendingRequisitionsCount = partRequisitions.filter((r) => r.status === 'PENDING_APPROVAL').length;

    const completedCount = coverageCells.filter((c) => c.status === 'COMPLETE').length;
    const totalCoverageCells = coverageCells.length;
    const coveragePercent = totalCoverageCells > 0 ? Math.round((completedCount / totalCoverageCells) * 100) : 0;

    return {
      utilizationRate,
      utilizationTarget: 85,
      activeTestsCount,
      inWorkshopCount,
      unresolvedConflictsCount,
      pendingRequisitionsCount,
      coverageCompletedCount: completedCount,
      totalCoverageCells,
      coveragePercent,
    };
  }, [vehicles, conflicts, coverageCells, partRequisitions]);

  return (
    <ProtoScheduleContext.Provider
      value={{
        role,
        setRole,
        currentPersona,
        activeTab,
        setActiveTab,
        vehicles,
        bookings,
        coverageCells,
        conflicts,
        workshopWindows,
        partRequisitions,
        createPartRequisition,
        reviewPartRequisition,
        notifications,
        liveHandshake,
        dismissHandshake,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        depotFilter,
        setDepotFilter,
        powertrainFilter,
        setPowertrainFilter,
        bookSlot,
        resolveConflict,
        startTestDrive,
        completeTestDrive,
        updateVehicleStatus,
        updateWorkshopChecklist,
        markVehicleReadyForTest,
        submitWorkshopInspection,
        dispatchWorkshopWorkOrder,
        addWorkshopServiceWindow,
        signOffCoverageMilestone,
        requestRepeatTest,
        exportCoverageCsv,
        exportUtilizationCsv,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaultData,
        stats,
      }}
    >
      {children}
    </ProtoScheduleContext.Provider>
  );
};

export const useProtoSchedule = () => {
  const context = useContext(ProtoScheduleContext);
  if (!context) {
    throw new Error('useProtoSchedule must be used within a ProtoScheduleProvider');
  }
  return context;
};
