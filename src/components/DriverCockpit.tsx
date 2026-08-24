'use client';

import React, { useState, useEffect } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { Booking, PostSessionReport } from '@/types';
import {
  Gauge,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  Car,
  Clock,
  BatteryCharging,
  Zap,
  Activity,
  MapPin,
  Star,
  FileCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Eye,
  ArrowRight,
  UserCheck,
  Lock,
} from 'lucide-react';

export const DriverCockpit: React.FC = () => {
  const {
    bookings,
    vehicles,
    startTestDrive,
    completeTestDrive,
    currentPersona,
    role,
    setRole,
  } = useProtoSchedule();

  const isDriverRole = role === 'TEST_DRIVER';
  const activeBooking = bookings.find((b) => b.status === 'IN_PROGRESS');
  const activeVehicle = vehicles.find((v) => v.id === activeBooking?.vehicleId);

  // Simulated live telemetry state
  const [liveSpeed, setLiveSpeed] = useState<number>(84);
  const [liveDistance, setLiveDistance] = useState<number>(48.2);
  const [liveMotorTemp, setLiveMotorTemp] = useState<number>(76);
  const [livePowerDraw, setLivePowerDraw] = useState<number>(142);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(45);

  // Post-drive modal state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportingBooking, setReportingBooking] = useState<Booking | null>(null);

  // Post-drive report form
  const [distanceDriven, setDistanceDriven] = useState<number>(128.5);
  const [averageSpeed, setAverageSpeed] = useState<number>(82.4);
  const [energyConsumed, setEnergyConsumed] = useState<number>(164.2);
  const [ambientTemp, setAmbientTemp] = useState<number>(18.5);
  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>([]);
  const [mechanicalNotes, setMechanicalNotes] = useState<string>('');
  const [driverRating, setDriverRating] = useState<number>(5);
  const [testResult, setTestResult] = useState<PostSessionReport['testResult']>('PASSED');

  useEffect(() => {
    if (!activeBooking) return;
    const interval = setInterval(() => {
      setLiveSpeed(80 + Math.floor(Math.random() * 8));
      setLiveDistance((prev) => +(prev + 0.05).toFixed(2));
      setLiveMotorTemp(74 + Math.floor(Math.random() * 5));
      setLivePowerDraw(135 + Math.floor(Math.random() * 20));
      setElapsedMinutes((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeBooking]);

  const commonAnomalies = [
    'Regenerative braking step-jerk at <10 km/h',
    'Minor steering oscillation on Belgian pave',
    'Lidar point cloud noise in dense spray',
    'Cabin HVAC compressor acoustic resonance',
    'Battery thermal limiter warning on steep grade',
  ];

  const toggleAnomaly = (anomaly: string) => {
    if (selectedAnomalies.includes(anomaly)) {
      setSelectedAnomalies(selectedAnomalies.filter((a) => a !== anomaly));
    } else {
      setSelectedAnomalies([...selectedAnomalies, anomaly]);
    }
  };

  const handleOpenReportModal = (booking: Booking) => {
    if (!isDriverRole) return;
    setReportingBooking(booking);
    setDistanceDriven(liveDistance > 10 ? liveDistance : 115.4);
    setShowReportModal(true);
  };

  const handlePostReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingBooking || !isDriverRole) return;

    completeTestDrive(reportingBooking.id, {
      distanceDrivenKm: Number(distanceDriven),
      averageSpeedKmh: Number(averageSpeed),
      energyConsumedKwh: Number(energyConsumed),
      ambientTempC: Number(ambientTemp),
      behavioralAnomalies: selectedAnomalies,
      mechanicalNotes: mechanicalNotes || 'Test completed within nominal vehicle engineering parameters.',
      driverRating,
      testResult,
      submittedAt: new Date().toISOString(),
      signedOffByLead: false,
    });

    setShowReportModal(false);
    setReportingBooking(null);
  };

  const myBookings = bookings.filter((b) => b.driverName.includes('Arjun') || role !== 'TEST_DRIVER');
  const retestQueue = bookings.filter(
    (b) =>
      b.status === 'CONFIRMED' &&
      (b.testConditionLabel.toLowerCase().includes('re-test') ||
        b.notes?.includes('Re-Test') ||
        b.notes?.includes('workshop repairs'))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-glow">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Driver Cockpit &amp; Live Telemetry (Arjun)</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                PRD US-02 &amp; Section 6.1
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isDriverRole
                ? 'Active driver cockpit — execute track sessions and log post-session validation reports.'
                : `Live Telemetry Observer Stream · Viewing as ${currentPersona.name} (${currentPersona.badge}). Drive execution restricted to Arjun Mehta.`}
            </p>
          </div>
        </div>

        {activeBooking && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>SESSION LIVE ON TRACK</span>
          </div>
        )}
      </div>

      {/* RE-TEST VERIFICATION QUEUE: Released Vehicles from Workshop */}
      {retestQueue.length > 0 && !activeBooking && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/80 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                Re-Test Verification Queue: Vehicles Released from Workshop ({retestQueue.length})
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                Ready for Driver Re-Test
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Step 5 Handshake</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {retestQueue.map((retest) => {
              const v = vehicles.find((veh) => veh.id === retest.vehicleId);

              return (
                <div key={retest.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {retest.vehicleCode}
                        </span>
                        <h4 className="text-xs font-bold text-white">{retest.vehicleName}</h4>
                      </div>
                      <p className="text-xs text-cyan-300 font-medium mt-1">
                        {retest.testConditionLabel} · <span className="text-white font-semibold">Assigned to: {retest.driverName} (Original Reporter)</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ PREPPED BY LARS
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    &quot;{retest.notes}&quot;
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Location: {retest.depotLocation.split(' ')[0]}
                    </span>

                    {isDriverRole ? (
                      <button
                        onClick={() => startTestDrive(retest.id)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Re-Test Track Session ({retest.driverName.split(' ')[0]})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setRole('TEST_DRIVER')}
                        className="text-xs text-cyan-300 font-bold hover:underline"
                      >
                        Switch to Arjun to Drive →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIVE DRIVE TELEMETRY SIMULATOR */}
      {activeBooking ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0B1A2F] border border-blue-500/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                  {activeBooking.vehicleCode}
                </span>
                <h3 className="text-base font-bold text-white">{activeBooking.vehicleName}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Active Scenario: <span className="text-white font-semibold">{activeBooking.testConditionLabel}</span> ·{' '}
                {activeBooking.depotLocation}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right text-xs font-mono">
                <span className="text-slate-400 block text-[10px]">Session Elapsed</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m
                </span>
              </div>

              {/* RBAC Action Button: Only Arjun (TEST_DRIVER) can complete and submit the report */}
              {isDriverRole ? (
                <button
                  onClick={() => handleOpenReportModal(activeBooking)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-glowRose transition-all active:scale-95 flex items-center space-x-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Complete Drive &amp; Submit Report</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-right">
                    <span className="text-[10px] font-mono text-cyan-400 block font-semibold flex items-center justify-end space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>R&amp;D Observer Stream</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Driver: Arjun Mehta</span>
                  </div>
                  <button
                    onClick={() => setRole('TEST_DRIVER')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                    title="Switch to Arjun Mehta to submit report"
                  >
                    <span>Switch to Arjun to Complete →</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Gauge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase">Real-Time Speed</span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-black text-cyan-400">{liveSpeed}</span>
                <span className="text-xs text-slate-400 font-sans">km/h</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">Cruise Speed Nominal</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase">Track Distance</span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-black text-white">{liveDistance}</span>
                <span className="text-xs text-slate-400 font-sans">km</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Target: 120.0 km</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase">Inverter Temp</span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-black text-amber-400">{liveMotorTemp}</span>
                <span className="text-xs text-slate-400 font-sans">°C</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">Safe Limit (&lt;95°C)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase">Power Output</span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-black text-blue-400">{livePowerDraw}</span>
                <span className="text-xs text-slate-400 font-sans">kW</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Dual Motor Draw 48%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Car className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Test Drive Currently In Progress</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isDriverRole
              ? 'Select an assigned confirmed booking below to start your test drive session at the proving ground.'
              : 'Switch to Arjun Mehta (Test Driver) to start an assigned track session.'}
          </p>
        </div>
      )}

      {/* Driver's Bookings & Sessions Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Test Drive Assignments &amp; History ({myBookings.length})
          </h3>
          <span className="text-xs text-slate-400">Driver: Arjun Mehta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBookings.map((booking) => {
            const isConfirmed = booking.status === 'CONFIRMED';
            const isLive = booking.status === 'IN_PROGRESS';
            const isDone = booking.status === 'COMPLETED';
            const veh = vehicles.find((v) => v.id === booking.vehicleId);

            return (
              <div
                key={booking.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        {booking.vehicleCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLive
                            ? 'bg-blue-950 text-blue-300 border border-blue-800 animate-pulse'
                            : isDone
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1.5">{booking.vehicleName}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{booking.testConditionLabel}</p>
                  </div>
                </div>

                {/* Lars Workshop Prep Status Indicator */}
                {veh && (
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Workshop Prep (Lars):</span>
                    </span>
                    <span className={`font-bold ${veh.workshopPrepCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {veh.workshopPrepCompleted ? '✓ Certified Ready for Track' : 'Pending Safety Prep'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{booking.date} ({booking.startTime} - {booking.endTime})</span>
                  </span>
                  <span>{booking.depotLocation.split(' ')[0]}</span>
                </div>

                {booking.postSessionReport && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Logged Distance:</span>
                      <span className="text-white font-mono font-bold">{booking.postSessionReport.distanceDrivenKm} km</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Session Status:</span>
                      <span
                        className={
                          booking.postSessionReport.testResult === 'FLAGGED_FOR_WORKSHOP'
                            ? 'text-amber-400 font-bold'
                            : booking.postSessionReport.testResult === 'REPEAT_REQUIRED'
                            ? 'text-rose-400 font-bold'
                            : booking.postSessionReport.signedOffByLead
                            ? 'text-emerald-400 font-bold'
                            : 'text-cyan-300 font-medium'
                        }
                      >
                        {booking.postSessionReport.testResult === 'FLAGGED_FOR_WORKSHOP'
                          ? '⚠ In Workshop Intake (Lars Queue)'
                          : booking.postSessionReport.testResult === 'REPEAT_REQUIRED'
                          ? '↺ Repeat Required'
                          : booking.postSessionReport.signedOffByLead
                          ? '✓ Signed Off (Maria)'
                          : 'Pending Maria Sign-Off'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Start Button: Only Driver can start session */}
                {isConfirmed && !activeBooking && (
                  isDriverRole ? (
                    <button
                      onClick={() => startTestDrive(booking.id)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center space-x-2 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Live Track Session</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Driver Action: Arjun Mehta</span>
                      </span>
                      <button
                        onClick={() => setRole('TEST_DRIVER')}
                        className="text-[11px] text-cyan-300 font-bold hover:underline flex items-center space-x-1"
                      >
                        <span>Switch to Arjun →</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* POST-SESSION ANOMALY REPORTING MODAL */}
      {showReportModal && reportingBooking && isDriverRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Post-Session Drive Report (PRD Step 5)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Vehicle: <span className="text-white font-semibold">{reportingBooking.vehicleCode}</span> · Scenario:{' '}
              <span className="text-cyan-300 font-semibold">{reportingBooking.testConditionLabel}</span>
            </p>

            <form onSubmit={handlePostReportSubmit} className="mt-5 space-y-4 text-xs">
              {/* Telemetry Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceDriven}
                    onChange={(e) => setDistanceDriven(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Avg Speed (km/h)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={averageSpeed}
                    onChange={(e) => setAverageSpeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Energy (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={energyConsumed}
                    onChange={(e) => setEnergyConsumed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Track Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ambientTemp}
                    onChange={(e) => setAmbientTemp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Behavioral Anomalies Checklist */}
              <div>
                <label className="block font-semibold text-slate-300 mb-2">
                  Behavioral Anomalies Observed (Flag for Lars / Maria):
                </label>
                <div className="space-y-1.5">
                  {commonAnomalies.map((anomaly) => {
                    const isChecked = selectedAnomalies.includes(anomaly);
                    return (
                      <button
                        type="button"
                        key={anomaly}
                        onClick={() => toggleAnomaly(anomaly)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                          isChecked
                            ? 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs">{isChecked ? '☒' : '☐'}</span>
                        <span className="text-[11px]">{anomaly}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mechanical & Driver Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Detailed Technical Observations</label>
                <textarea
                  value={mechanicalNotes}
                  onChange={(e) => setMechanicalNotes(e.target.value)}
                  placeholder="e.g. Steering response crisp, minor brake fade noticed on 5th repeat lap..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500"
                />
              </div>

              {/* Outcome Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Validation Result Recommendation</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestResult('PASSED')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                      testResult === 'PASSED'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✓ Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestResult('REPEAT_REQUIRED')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                      testResult === 'REPEAT_REQUIRED'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ↺ Repeat Req.
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestResult('FLAGGED_FOR_WORKSHOP')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                      testResult === 'FLAGGED_FOR_WORKSHOP'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ⚠ Send to Workshop
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Validation Report (Handshake to Maria &amp; Lars)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
