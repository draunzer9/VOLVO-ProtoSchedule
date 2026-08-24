'use client';

import React, { useState, useEffect } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { TEST_CONDITIONS } from '@/data/seedData';
import { TestConditionType, Booking } from '@/types';
import {
  Calendar,
  Clock,
  Car,
  User,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  MapPin,
  Sparkles,
  Zap,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicleId?: string;
  onOpenConflictModal?: (conflictId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialVehicleId,
  onOpenConflictModal,
}) => {
  const { vehicles, bookSlot, currentPersona, role } = useProtoSchedule();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || vehicles[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-24');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [selectedCondition, setSelectedCondition] = useState<TestConditionType>('HIGHWAY_AERO');
  const [driverName, setDriverName] = useState<string>(role === 'TEST_DRIVER' ? currentPersona.name : 'Arjun Mehta');
  const [rAndDLead, setRAndDLead] = useState<string>('Maria Lindqvist');
  const [targetMilestone, setTargetMilestone] = useState<string>('Validation Milestone MS-3B');
  const [notes, setNotes] = useState<string>('');

  const [feedback, setFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR' | null;
    message: string;
    conflictId?: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    if (initialVehicleId) {
      setSelectedVehicleId(initialVehicleId);
    }
  }, [initialVehicleId]);

  if (!isOpen) return null;

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedCondMeta = TEST_CONDITIONS.find((c) => c.type === selectedCondition);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const result = bookSlot({
      vehicleId: selectedVehicle.id,
      vehicleCode: selectedVehicle.code,
      vehicleName: selectedVehicle.name,
      driverId: 'driver-id',
      driverName,
      rAndDLead,
      date: selectedDate,
      startTime,
      endTime,
      testCondition: selectedCondition,
      testConditionLabel: selectedCondMeta?.label || selectedCondition,
      targetMilestone,
      depotLocation: selectedVehicle.depotLocation,
      notes,
    });

    if (result.success) {
      setFeedback({
        type: 'SUCCESS',
        message: result.message,
      });
      setTimeout(() => {
        onClose();
        setFeedback({ type: null, message: '' });
      }, 1500);
    } else {
      setFeedback({
        type: 'ERROR',
        message: result.message,
        conflictId: result.conflict?.id,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Book Prototype Test Slot</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Instant Conflict Check
                </span>
              </h2>
              <p className="text-xs text-slate-400">Rapid 3-Click Reservation System (PRD US-02)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.type && (
          <div
            className={`p-4 mx-6 mt-4 rounded-xl border flex items-start space-x-3 animate-in fade-in duration-200 ${
              feedback.type === 'SUCCESS'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}
          >
            {feedback.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-xs font-bold">{feedback.type === 'SUCCESS' ? 'Booking Confirmed!' : 'Conflict Flagged'}</p>
              <p className="text-xs mt-0.5 leading-snug">{feedback.message}</p>
              {feedback.conflictId && onOpenConflictModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConflictModal(feedback.conflictId!);
                  }}
                  className="mt-2 text-xs font-bold underline hover:text-rose-200"
                >
                  Open Conflict Resolution Hub →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Select Prototype Vehicle</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.status === 'IN_WORKSHOP'}>
                    {v.code} - {v.name} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Condition / Route */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Test Condition / Track Route</span>
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as TestConditionType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {TEST_CONDITIONS.map((c) => (
                  <option key={c.type} value={c.type}>
                    {c.label} ({c.minimumDurationHours}h min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Details Preview Box */}
          {selectedCondMeta && (
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">{selectedCondMeta.recommendedTrack}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Min {selectedCondMeta.minimumDurationHours} hrs</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{selectedCondMeta.description}</p>
              </div>
            </div>
          )}

          {/* Date & Time Slot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Date</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>End Time</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Driver & R&D Lead Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assigned Test Driver</span>
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>R&D Lead</span>
              </label>
              <input
                type="text"
                value={rAndDLead}
                onChange={(e) => setRAndDLead(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Target Milestone / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Test Purpose / Engineering Notes</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Battery pack cooling loop stress, high-drag winglet angle verification, brake pad temperature recording..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Zero-conflict guarantee: automated collision prevention
            </span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all active:scale-95"
              >
                Confirm Test Slot
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
