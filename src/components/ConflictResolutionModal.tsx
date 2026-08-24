'use client';

import React, { useState } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { ConflictAlert } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  Car,
  Clock,
  ArrowRight,
  ShieldAlert,
  Calendar,
  XCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface ConflictResolutionModalProps {
  initialConflictId?: string;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  initialConflictId,
}) => {
  const { conflicts, vehicles, bookings, resolveConflict, role } = useProtoSchedule();

  const [selectedConflictId, setSelectedConflictId] = useState<string>(
    initialConflictId || conflicts.find((c) => !c.resolved)?.id || conflicts[0]?.id || ''
  );

  const [reassignVehicleId, setReassignVehicleId] = useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<string>('2026-08-25');
  const [rescheduleStart, setRescheduleStart] = useState<string>('09:00');
  const [rescheduleEnd, setRescheduleEnd] = useState<string>('13:00');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [activeAction, setActiveAction] = useState<'REASSIGN' | 'RESCHEDULE' | 'CANCEL' | 'OVERRIDE'>('REASSIGN');

  const activeConflict = conflicts.find((c) => c.id === selectedConflictId);
  const unresolvedConflicts = conflicts.filter((c) => !c.resolved);
  const resolvedConflicts = conflicts.filter((c) => c.resolved);

  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE' && v.id !== activeConflict?.vehicleId);

  const handleExecuteResolution = () => {
    if (!activeConflict) return;

    if (activeAction === 'REASSIGN') {
      const targetId = reassignVehicleId || availableVehicles[0]?.id;
      if (!targetId) {
        alert('Please select an available vehicle to reassign.');
        return;
      }
      resolveConflict(activeConflict.id, 'REASSIGN', { newVehicleId: targetId, notes: resolutionNotes });
    } else if (activeAction === 'RESCHEDULE') {
      resolveConflict(activeConflict.id, 'RESCHEDULE', {
        newDate: rescheduleDate,
        newStartTime: rescheduleStart,
        newEndTime: rescheduleEnd,
        notes: resolutionNotes,
      });
    } else if (activeAction === 'CANCEL') {
      resolveConflict(activeConflict.id, 'CANCEL', { notes: resolutionNotes });
    } else if (activeAction === 'OVERRIDE') {
      resolveConflict(activeConflict.id, 'OVERRIDE', { notes: resolutionNotes });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-glowRose">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Conflict Resolution Hub</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Zero Silent Conflicts
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated detection of double-bookings & workshop collisions with 1-click resolution actions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">Unresolved</span>
            <span className="text-rose-400 font-bold text-sm">{unresolvedConflicts.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">Resolved</span>
            <span className="text-emerald-400 font-bold text-sm">{resolvedConflicts.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Conflict Queue List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Conflict Incidents ({conflicts.length})
          </h3>

          <div className="space-y-2">
            {conflicts.map((conflict) => {
              const isSelected = conflict.id === selectedConflictId;
              return (
                <div
                  key={conflict.id}
                  onClick={() => setSelectedConflictId(conflict.id)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-glow'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-white border border-slate-700">
                        {conflict.vehicleCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          conflict.type === 'DOUBLE_BOOKING'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {conflict.type.replace('_', ' ')}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        conflict.resolved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      }`}
                    >
                      {conflict.resolved ? '✓ Resolved' : 'Action Required'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">{conflict.description}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{new Date(conflict.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-cyan-400 font-semibold">{isSelected ? 'Active Selection' : 'Inspect →'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Resolution Console */}
        <div className="lg:col-span-7">
          {activeConflict ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-5">
              {/* Conflict Details Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Collision Details</span>
                    <span className="font-mono text-xs text-slate-400">ID: {activeConflict.id}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Detected: {new Date(activeConflict.detectedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-white leading-relaxed">{activeConflict.description}</p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Recommendation: </span>
                    <span>{activeConflict.suggestedAction}</span>
                  </div>
                </div>
              </div>

              {activeConflict.resolved ? (
                /* Already Resolved Card */
                <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-sm text-white">Conflict Successfully Resolved</h4>
                  <p className="text-xs text-emerald-200/90 font-medium">
                    Resolution Applied: <span className="font-bold uppercase">{activeConflict.resolutionType}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">{activeConflict.resolutionNotes}</p>
                </div>
              ) : (
                /* Resolution Action Workspace */
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Resolution Strategy (PRD Section 8.3 & 8.4)
                  </h4>

                  {/* Strategy Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => setActiveAction('REASSIGN')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                        activeAction === 'REASSIGN'
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      1. Reassign Peer
                    </button>
                    <button
                      onClick={() => setActiveAction('RESCHEDULE')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                        activeAction === 'RESCHEDULE'
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      2. Reschedule Slot
                    </button>
                    <button
                      onClick={() => setActiveAction('CANCEL')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                        activeAction === 'CANCEL'
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      3. Cancel & Free
                    </button>
                    <button
                      onClick={() => setActiveAction('OVERRIDE')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                        activeAction === 'OVERRIDE'
                          ? 'bg-amber-600 text-white border-amber-400 shadow-glow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      4. Lead Override
                    </button>
                  </div>

                  {/* Strategy Form Content */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    {activeAction === 'REASSIGN' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                          <Car className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Select Available Prototype for Instant Reassignment</span>
                        </label>
                        {availableVehicles.length === 0 ? (
                          <p className="text-xs text-amber-400">No other vehicles currently Available in depot.</p>
                        ) : (
                          <select
                            value={reassignVehicleId || availableVehicles[0]?.id}
                            onChange={(e) => setReassignVehicleId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            {availableVehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.code} - {v.name} ({v.powertrain}) [Available at {v.depotLocation}]
                              </option>
                            ))}
                          </select>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1.5">
                          The driver reservation will be updated seamlessly without losing their booked time slot.
                        </p>
                      </div>
                    )}

                    {activeAction === 'RESCHEDULE' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">New Date</label>
                            <input
                              type="date"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={rescheduleStart}
                              onChange={(e) => setRescheduleStart(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">End Time</label>
                            <input
                              type="time"
                              value={rescheduleEnd}
                              onChange={(e) => setRescheduleEnd(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeAction === 'CANCEL' && (
                      <div className="text-xs text-slate-300">
                        <p className="font-semibold text-rose-400">Cancel Conflicting Booking</p>
                        <p className="mt-1 text-slate-400">
                          Releases any locked resources and triggers an automated cancellation alert to the driver with priority re-booking allowance.
                        </p>
                      </div>
                    )}

                    {activeAction === 'OVERRIDE' && (
                      <div className="text-xs text-amber-300">
                        <p className="font-semibold text-amber-400">R&D Lead Override Authority (Maria)</p>
                        <p className="mt-1 text-slate-300">
                          Forces booking confirmation ahead of workshop maintenance windows when urgent milestone gate validation is critical. Soft alerts will remain logged for workshop safety compliance.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Audit Notes / Rationale</label>
                      <input
                        type="text"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="e.g. Reassigned by Maria Lindqvist to maintain MS-3B validation timeline"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Execution Button */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={handleExecuteResolution}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all active:scale-95 flex items-center space-x-2"
                    >
                      <span>Apply Resolution ({activeAction})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              Select a conflict from the left column to inspect and resolve.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
