'use client';

import React, { useState, useMemo } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { TEST_CONDITIONS } from '@/data/seedData';
import { TestConditionType, CoverageCell, Vehicle, Booking, PartRequisition } from '@/types';
import { getStatusBadge, getPowertrainBadge } from '@/lib/utils';
import { Vehicle3DViewer } from '@/components/Vehicle3DViewer';
import {
  Layers,
  CheckCircle2,
  Clock,
  Circle,
  Download,
  Filter,
  Search,
  CheckSquare,
  Sparkles,
  UserCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  Zap,
  RotateCcw,
  ShieldCheck,
  Car,
  AlertTriangle,
  Send,
  Wrench,
  ChevronRight,
  Eye,
  Crosshair,
  Package,
  Check,
  X,
  BatteryCharging,
  Radio,
  Gauge,
  Activity,
} from 'lucide-react';

interface TestCoverageMatrixProps {
  onOpenBookingModal: (vehicleId?: string) => void;
}

export const TestCoverageMatrix: React.FC<TestCoverageMatrixProps> = ({
  onOpenBookingModal,
}) => {
  const {
    vehicles,
    bookings,
    coverageCells,
    partRequisitions,
    reviewPartRequisition,
    signOffCoverageMilestone,
    requestRepeatTest,
    dispatchWorkshopWorkOrder,
    exportCoverageCsv,
    stats,
    role,
    currentPersona,
  } = useProtoSchedule();

  const [selectedCell, setSelectedCell] = useState<{
    cell: CoverageCell;
    vehicle: Vehicle;
    condition: (typeof TEST_CONDITIONS)[0];
  } | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [signOffNotes, setSignOffNotes] = useState<string>('');
  const [selectedAnomalyBookingFor3D, setSelectedAnomalyBookingFor3D] = useState<Booking | null>(null);
  const [selectedVehicleFor3D, setSelectedVehicleFor3D] = useState<Vehicle | null>(null);

  // Triage state per booking
  const [triageDirectives, setTriageDirectives] = useState<Record<string, string>>({});
  const [triageBays, setTriageBays] = useState<Record<string, string>>({});
  const [triagePriorities, setTriagePriorities] = useState<Record<string, 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM'>>({});

  // Part requisition review notes
  const [requisitionNotes, setRequisitionNotes] = useState<Record<string, string>>({});

  const categories = Array.from(new Set(TEST_CONDITIONS.map((c) => c.category)));

  const filteredConditions = useMemo(() => {
    return TEST_CONDITIONS.filter((c) => categoryFilter === 'ALL' || c.category === categoryFilter);
  }, [categoryFilter]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => vehicleFilter === 'ALL' || v.id === vehicleFilter);
  }, [vehicles, vehicleFilter]);

  // 1. Pending Part Requisitions for Maria
  const pendingPartRequisitions = useMemo(() => {
    return partRequisitions.filter((r) => r.status === 'PENDING_APPROVAL');
  }, [partRequisitions]);

  // 2. Find all completed driver sessions that PASSED and need Maria's R&D milestone sign-off
  const pendingSignOffBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status === 'COMPLETED' &&
        b.postSessionReport &&
        b.postSessionReport.testResult === 'PASSED' &&
        !b.postSessionReport.signedOffByLead
    );
  }, [bookings]);

  // 3. Find all driver anomaly reports that need Maria's R&D Triage & Work Order Directives
  const pendingAnomalyReports = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status === 'COMPLETED' &&
        b.postSessionReport &&
        b.postSessionReport.testResult === 'FLAGGED_FOR_WORKSHOP' &&
        !b.postSessionReport.rAndDDirectiveNotes
    );
  }, [bookings]);

  // Active in-progress test drives
  const activeTestBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'IN_PROGRESS');
  }, [bookings]);

  const quickDirectivePresets = [
    'Calibrate LiDAR mounting tilt (+1.2°) & inspect 5G logger wiring',
    'Replace front brake pads with high-friction track compound & bleed lines',
    'Flash ECU/TCU firmware patch v4.2.1 for regenerative braking torque curve',
    'HV battery coolant loop purge & megawatt isolation verification',
    'Inspect steering linkage torque & balance wheel rims for high-speed aero',
  ];

  const handleDispatch = (bookingId: string) => {
    const directives = triageDirectives[bookingId] || 'Inspect reported anomalies, perform hardware calibration, and certify safe for track re-test.';
    const bay = triageBays[bookingId] || 'Bay 01 - Autonomous & Sensor Lab';
    const priority = triagePriorities[bookingId] || 'P0_CRITICAL';

    dispatchWorkshopWorkOrder(bookingId, directives, bay, priority);
  };

  const getCellStatusBadge = (
    cell: CoverageCell,
    vehicleId: string,
    conditionType: TestConditionType
  ) => {
    // Check if there is an active test drive on track right now for this vehicle & scenario
    const isLiveOnTrack = activeTestBookings.some(
      (b) => b.vehicleId === vehicleId && b.testCondition === conditionType
    );

    if (isLiveOnTrack) {
      return {
        label: '⚡ Live On Track',
        bg: 'bg-blue-950/90 border-blue-400 text-cyan-300 shadow-glow animate-pulse',
        icon: Zap,
        iconColor: 'text-cyan-300 animate-bounce',
      };
    }

    // Check if there is a completed drive report flagged for workshop on this cell
    const flaggedBooking = bookings.find(
      (b) =>
        b.vehicleId === vehicleId &&
        b.testCondition === conditionType &&
        b.postSessionReport?.testResult === 'FLAGGED_FOR_WORKSHOP' &&
        cell.status !== 'COMPLETE'
    );

    if (flaggedBooking) {
      return {
        label: '⚠ Flagged (Triage)',
        bg: 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-sm',
        icon: AlertTriangle,
        iconColor: 'text-rose-400',
      };
    }

    // Check if there is a completed drive report passed and waiting for sign-off
    const passedBooking = bookings.find(
      (b) =>
        b.vehicleId === vehicleId &&
        b.testCondition === conditionType &&
        b.postSessionReport?.testResult === 'PASSED' &&
        !b.postSessionReport?.signedOffByLead &&
        cell.status !== 'COMPLETE'
    );

    if (passedBooking) {
      return {
        label: '🔍 Ready for Sign-Off',
        bg: 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-glow',
        icon: Sparkles,
        iconColor: 'text-cyan-400',
      };
    }

    switch (cell.status) {
      case 'COMPLETE':
        return {
          label: 'Complete',
          bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:border-emerald-400',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Testing',
          bg: 'bg-blue-950/80 border-blue-500/50 text-blue-300 hover:border-blue-400 animate-pulse',
          icon: Zap,
          iconColor: 'text-blue-400',
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          bg: 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300 hover:border-indigo-400',
          icon: Clock,
          iconColor: 'text-indigo-400',
        };
      case 'NOT_STARTED':
      default:
        return {
          label: 'Not Started',
          bg: 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700',
          icon: Circle,
          iconColor: 'text-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Matrix Summary & Export */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0A1E38] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">2D Test Coverage &amp; Real-Time Fleet Matrix</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live validation progress, real-time CAN Bus status, and milestone sign-offs across all prototype models.
            </p>
          </div>
        </div>

        {/* Matrix Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Total Progress:</span>
            <span className="font-bold text-cyan-300">
              {stats.coverageCompletedCount} / {stats.totalCoverageCells} ({stats.coveragePercent}%)
            </span>
          </div>

          <button
            onClick={exportCoverageCsv}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME FLEET OPERATIONAL STATUS RIBBON */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Real-Time Fleet Operational State ({vehicles.length} Vehicles)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">● 5G CAN Bus Live Sync Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {vehicles.map((v) => {
            const st = getStatusBadge(v.status);
            const activeBk = activeTestBookings.find((b) => b.vehicleId === v.id);

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleFor3D(v)}
                className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer shadow-sm space-y-2 group"
                title="Click to open 5D Digital Twin Model"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                    {v.code}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${st.dot} ${v.status === 'IN_TESTING' ? 'animate-ping' : ''}`} />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-white block truncate">{v.name.split(' ')[1] || v.name}</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <BatteryCharging className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-mono text-slate-300 font-bold">{v.batterySoC}% SoC</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${st.bg}`}>
                    {st.label}
                  </span>

                  <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 font-mono">
                    3D ↗
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* R&D LEAD PARTS REQUISITION APPROVAL QUEUE (Lars -> Maria Request) */}
      {pendingPartRequisitions.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-500/80 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="text-sm font-bold text-white">
                Parts Requisitions Pending R&amp;D Approval ({pendingPartRequisitions.length})
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Lars ➔ Maria Sign-Off
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Engineering Procurement Authorization</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPartRequisitions.map((req) => {
              const currentNotes = requisitionNotes[req.id] || '';

              return (
                <div key={req.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {req.vehicleCode}
                        </span>
                        <h4 className="text-xs font-bold text-white">{req.partName}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        PN: {req.partNumber} · {req.category} · {req.allocatedBay || 'Bay 01'}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      {req.urgency.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Est. Cost: <strong className="text-white">€{req.estimatedCostEur.toLocaleString()}</strong></span>
                      <span>Lead Time: <strong className="text-cyan-300">{req.leadTimeHours} hrs</strong></span>
                      <span className="text-slate-300">By: {req.requestedBy}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/60">
                      &quot;{req.justification}&quot;
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Maria&apos;s Engineering Approval Remark:
                    </label>
                    <input
                      type="text"
                      value={currentNotes}
                      onChange={(e) => setRequisitionNotes({ ...requisitionNotes, [req.id]: e.target.value })}
                      placeholder="e.g. Approved for Autonomous L3 track test package..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                    <button
                      onClick={() => reviewPartRequisition(req.id, 'APPROVED', currentNotes)}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Approve &amp; Release Procurement</span>
                    </button>
                    <button
                      onClick={() => reviewPartRequisition(req.id, 'REJECTED', currentNotes || 'Alternative part suggested.')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* R&D LEAD WORK ORDER TRIAGE QUEUE: Driver Anomaly Reports Requiring Maria's Directives */}
      {pendingAnomalyReports.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border-2 border-rose-500/80 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
              <h3 className="text-sm font-bold text-white">
                R&amp;D Anomaly Triage &amp; Work Order Dispatch Hub ({pendingAnomalyReports.length})
              </h3>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                Step 2: Maria Directives Required
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Workflow: Driver Flag ➔ Lead Triage ➔ Lars Workshop</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingAnomalyReports.map((b) => {
              const rep = b.postSessionReport!;
              const currentDirectives = triageDirectives[b.id] ?? '';
              const currentBay = triageBays[b.id] || 'Bay 01 - Autonomous & Sensor Lab';
              const currentPriority = triagePriorities[b.id] || 'P0_CRITICAL';

              return (
                <div key={b.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3.5 shadow-md">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {b.vehicleCode}
                        </span>
                        <span className="text-xs font-bold text-white">{b.vehicleName}</span>
                        <span className="text-xs text-slate-400">· Driver: {b.driverName}</span>
                      </div>
                      <p className="text-xs text-cyan-300 font-medium mt-0.5">
                        Test Condition: <span className="text-white">{b.testConditionLabel}</span> ({rep.distanceDrivenKm} km run)
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-800 self-start">
                      ⚠ FLAGGED FOR WORKSHOP
                    </span>
                  </div>

                  {/* Telemetry & Anomalies Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Left: Driver's Findings */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Driver Observations &amp; Anomalies:
                      </span>
                      {rep.behavioralAnomalies.length > 0 ? (
                        <ul className="space-y-1">
                          {rep.behavioralAnomalies.map((anom, i) => (
                            <li key={i} className="text-rose-300 text-[11px] flex items-start space-x-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{anom}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 text-[11px] italic">Mechanical inspection requested.</p>
                      )}
                      <p className="text-slate-400 text-[11px] italic pt-1 border-t border-slate-800">
                        &quot;{rep.mechanicalNotes}&quot;
                      </p>
                    </div>

                    {/* Right: Maria's Directive Form */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-cyan-300 flex items-center space-x-1">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Maria&apos;s Engineering Directives for Lars:</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">Dispatches to Workshop Bay</span>
                      </div>

                      <textarea
                        value={currentDirectives}
                        onChange={(e) => setTriageDirectives({ ...triageDirectives, [b.id]: e.target.value })}
                        placeholder="e.g. Calibrate LiDAR sensor mounting bracket tilt +1.2°, replace front brake pads with high-friction compound, flash ECU firmware patch v4.2.1..."
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                      />

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono self-center">Quick Suggest:</span>
                        {quickDirectivePresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setTriageDirectives({
                                ...triageDirectives,
                                [b.id]: currentDirectives ? `${currentDirectives}; ${preset}` : preset,
                              })
                            }
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors truncate max-w-[210px]"
                            title={preset}
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Controls */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 text-[11px]">Assign Bay:</span>
                        <select
                          value={currentBay}
                          onChange={(e) => setTriageBays({ ...triageBays, [b.id]: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="Bay 01 - Autonomous & Sensor Lab">Bay 01 - Autonomous &amp; Sensor Lab</option>
                          <option value="Bay 02 - Heavy Rig & Powertrain">Bay 02 - Heavy Rig &amp; Powertrain</option>
                          <option value="Bay 03 - Post-Drive Intake & Diagnostics">Bay 03 - Post-Drive Intake &amp; Diagnostics</option>
                          <option value="Bay 04 - High-Voltage Megawatt Lab">Bay 04 - High-Voltage Megawatt Lab</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 text-[11px]">Priority:</span>
                        <select
                          value={currentPriority}
                          onChange={(e) => setTriagePriorities({ ...triagePriorities, [b.id]: e.target.value as any })}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-bold"
                        >
                          <option value="P0_CRITICAL">P0 - Critical Track Blocker</option>
                          <option value="P1_HIGH">P1 - High Priority</option>
                          <option value="P2_MEDIUM">P2 - Medium Priority</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAnomalyBookingFor3D(b)}
                        className="px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 text-xs font-bold transition-all shadow-glowRose flex items-center justify-center space-x-1.5"
                        title="Open 5D Digital Twin with 3D Fault Failure Highlighting"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                        <span>Inspect 3D Faults</span>
                      </button>

                      <button
                        onClick={() => handleDispatch(b.id)}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-glowAmber transition-all active:scale-95 flex items-center justify-center space-x-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Direct Dispatch to Lars</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* R&D LEAD MILESTONE SIGN-OFF QUEUE: Passed Driver Sessions */}
      {pendingSignOffBookings.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border-2 border-cyan-400/80 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                Driver Session Reports Pending R&amp;D Sign-Off ({pendingSignOffBookings.length})
              </h3>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                Action Required by Maria
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">PRD Step 7 Handshake</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSignOffBookings.map((b) => {
              const rep = b.postSessionReport!;
              return (
                <div key={b.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {b.vehicleCode}
                        </span>
                        <span className="text-xs font-bold text-white">{b.driverName}</span>
                      </div>
                      <p className="text-xs text-cyan-300 font-medium mt-1">{b.testConditionLabel}</p>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ {rep.testResult}
                    </span>
                  </div>

                  {/* Telemetry Summary */}
                  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Distance</span>
                      <span className="font-bold text-white">{rep.distanceDrivenKm} km</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Avg Speed</span>
                      <span className="font-bold text-cyan-400">{rep.averageSpeedKmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Energy</span>
                      <span className="font-bold text-slate-300">{rep.energyConsumedKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Ambient</span>
                      <span className="font-bold text-amber-400">{rep.ambientTempC}°C</span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-[11px] italic">&quot;{rep.mechanicalNotes}&quot;</p>

                  {/* Sign-off / Repeat Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
                    <button
                      onClick={() => signOffCoverageMilestone(b.vehicleId, b.testCondition, 'Approved by Maria Lindqvist (MS-3B Gate).')}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Sign Off Milestone</span>
                    </button>
                    <button
                      onClick={() => requestRepeatTest(b.id, 'Anomalies require verification run.')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                      title="Request driver to repeat test"
                    >
                      ↺ Repeat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-semibold">Condition Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">Vehicle Filter:</span>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Prototype Vehicles ({vehicles.length})</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} - {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-medium text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Complete</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span>In Testing</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>Scheduled</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span>Not Started</span>
          </span>
        </div>
      </div>

      {/* 2D Interactive Matrix Grid */}
      <div className="rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-300">
              <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] sticky left-0 z-20 bg-slate-950 min-w-[240px]">
                Test Condition / Scenario
              </th>
              {filteredVehicles.map((v) => {
                const st = getStatusBadge(v.status);
                return (
                  <th key={v.id} className="p-3 text-center min-w-[145px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="text-cyan-400 font-mono font-bold text-xs">{v.code}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-sans font-medium truncate max-w-[130px] block mx-auto">
                        {v.name.split(' ')[1] || v.name}
                      </span>
                      {/* Real-Time Live Status Pill in Header */}
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${st.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${v.status === 'IN_TESTING' ? 'animate-ping' : ''}`} />
                        <span>{st.label}</span>
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredConditions.map((cond) => {
              return (
                <tr key={cond.type} className="hover:bg-slate-800/40 transition-colors">
                  {/* Row Header */}
                  <td className="p-3.5 sticky left-0 z-10 bg-slate-900/95 border-r border-slate-800">
                    <div className="font-semibold text-white text-xs">{cond.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-mono">
                        {cond.category}
                      </span>
                      <span>·</span>
                      <span>Min {cond.minimumDurationHours}h</span>
                    </div>
                  </td>

                  {/* Matrix Cells */}
                  {filteredVehicles.map((vehicle) => {
                    const cell = coverageCells.find(
                      (c) => c.vehicleId === vehicle.id && c.conditionType === cond.type
                    ) || {
                      vehicleId: vehicle.id,
                      conditionType: cond.type,
                      status: 'NOT_STARTED',
                    };

                    const badge = getCellStatusBadge(cell, vehicle.id, cond.type);
                    const Icon = badge.icon;

                    return (
                      <td key={vehicle.id} className="p-2 text-center">
                        <button
                          onClick={() => setSelectedCell({ cell, vehicle, condition: cond })}
                          className={`w-full py-2.5 px-2 rounded-lg border transition-all flex flex-col items-center justify-center space-y-1 shadow-sm ${badge.bg}`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <Icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                            <span className="font-bold text-[11px]">{badge.label}</span>
                          </div>
                          {cell.status === 'COMPLETE' && cell.completedDate && (
                            <span className="text-[9px] font-mono text-slate-400">
                              {cell.completedDate.slice(5)}
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cell Audit & Sign-off Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedCell(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                {selectedCell.vehicle.code}
              </span>
              <h3 className="font-bold text-base text-white">{selectedCell.vehicle.name}</h3>
            </div>
            <p className="text-xs text-cyan-400 font-semibold mt-1">{selectedCell.condition.label}</p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Real-Time Vehicle State:</span>
                <span className="font-bold uppercase tracking-wider text-cyan-300">
                  {selectedCell.vehicle.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Coverage Cell Status:</span>
                <span className="font-bold uppercase tracking-wider text-white">
                  {selectedCell.cell.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Track:</span>
                <span className="text-slate-200">{selectedCell.condition.recommendedTrack}</span>
              </div>
              {selectedCell.cell.completedDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Completed Date:</span>
                  <span className="text-white font-mono">{selectedCell.cell.completedDate}</span>
                </div>
              )}
              {selectedCell.cell.completedByDriver && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Validated by Driver:</span>
                  <span className="text-white">{selectedCell.cell.completedByDriver}</span>
                </div>
              )}
              {selectedCell.cell.signOffLead && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">R&amp;D Lead / Status:</span>
                  <span className="text-emerald-400 font-semibold">{selectedCell.cell.signOffLead}</span>
                </div>
              )}
              {selectedCell.cell.notes && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-slate-400 block mb-0.5">Engineering Notes:</span>
                  <p className="italic">{selectedCell.cell.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {selectedCell.cell.status === 'NOT_STARTED' && (
                <button
                  onClick={() => {
                    const vId = selectedCell.vehicle.id;
                    setSelectedCell(null);
                    onOpenBookingModal(vId);
                  }}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Test Slot for this Condition</span>
                </button>
              )}

              {selectedCell.cell.status !== 'COMPLETE' && (
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Maria Lindqvist Sign-Off Notes (Production Gate):
                  </label>
                  <input
                    type="text"
                    value={signOffNotes}
                    onChange={(e) => setSignOffNotes(e.target.value)}
                    placeholder="e.g. Validated telemetry curves for Milestone MS-3B sign-off."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 mb-2"
                  />
                  <button
                    onClick={() => {
                      signOffCoverageMilestone(
                        selectedCell.vehicle.id,
                        selectedCell.condition.type,
                        signOffNotes
                      );
                      setSelectedCell(null);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Sign Off &amp; Approve Completion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D Vehicle Inspector for Anomaly Diagnostics & Direct Dispatch */}
      {selectedAnomalyBookingFor3D && (
        <Vehicle3DViewer
          vehicle={vehicles.find((v) => v.id === selectedAnomalyBookingFor3D.vehicleId) || vehicles[0]}
          onClose={() => setSelectedAnomalyBookingFor3D(null)}
          anomalies={selectedAnomalyBookingFor3D.postSessionReport?.behavioralAnomalies}
          bookingIdForDispatch={selectedAnomalyBookingFor3D.id}
          initialMode="FAULT_DIAGNOSTICS"
        />
      )}

      {/* 3D Model Telemetry & Sensor Inspector */}
      {selectedVehicleFor3D && (
        <Vehicle3DViewer
          vehicle={selectedVehicleFor3D}
          onClose={() => setSelectedVehicleFor3D(null)}
          onBookSlot={(vId) => onOpenBookingModal(vId)}
        />
      )}
    </div>
  );
};
