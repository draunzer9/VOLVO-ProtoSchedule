'use client';

import React, { useState } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { Navbar } from '@/components/Navbar';
import { DashboardKpiStats } from '@/components/DashboardKpiStats';
import { FleetAvailabilityView } from '@/components/FleetAvailabilityView';
import { TestCoverageMatrix } from '@/components/TestCoverageMatrix';
import { DriverCockpit } from '@/components/DriverCockpit';
import { WorkshopCenter } from '@/components/WorkshopCenter';
import { ConflictResolutionModal } from '@/components/ConflictResolutionModal';
import { WorkflowWalkthrough } from '@/components/WorkflowWalkthrough';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { BookingModal } from '@/components/BookingModal';
import { LiveHandshakeBanner } from '@/components/LiveHandshakeBanner';
import {
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
  Car,
} from 'lucide-react';

export default function HomePage() {
  const { activeTab, setActiveTab, currentPersona, role, setRole } = useProtoSchedule();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<string | undefined>(undefined);
  const [activeConflictId, setActiveConflictId] = useState<string | undefined>(undefined);

  const handleOpenBooking = (vehicleId?: string) => {
    setSelectedVehicleForBooking(vehicleId);
    setBookingModalOpen(true);
  };

  const handleOpenConflictHub = (conflictId: string) => {
    setActiveConflictId(conflictId);
    setActiveTab('conflicts');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B111E]">
      {/* Top Fixed Header */}
      <Navbar onOpenBookingModal={handleOpenBooking} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Role Context Bar & PRD Guide */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-slate-400">Current Role Mode:</span>
            <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
              {currentPersona.name} ({currentPersona.title})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 hidden md:inline">Experience PRD Workflows:</span>
            <button
              onClick={() => {
                setRole('RD_LEAD');
                setActiveTab('coverage');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                role === 'RD_LEAD'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-glow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Maria (R&amp;D Lead)
            </button>
            <button
              onClick={() => {
                setRole('TEST_DRIVER');
                setActiveTab('cockpit');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                role === 'TEST_DRIVER'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-glow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Arjun (Driver)
            </button>
            <button
              onClick={() => {
                setRole('WORKSHOP_TECH');
                setActiveTab('workshop');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                role === 'WORKSHOP_TECH'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-glow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Lars (Workshop)
            </button>
            <button
              onClick={() => {
                setRole('OVERVIEW');
                setActiveTab('fleet');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                role === 'OVERVIEW'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-glow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Fleet Manager
            </button>
          </div>
        </div>

        {/* Executive Stats & North Star KPI Bar */}
        <DashboardKpiStats />

        {/* Dynamic Tab Views */}
        <div className="transition-all duration-300">
          {activeTab === 'fleet' && (
            <FleetAvailabilityView onOpenBookingModal={handleOpenBooking} />
          )}

          {activeTab === 'coverage' && (
            role === 'RD_LEAD' || role === 'OVERVIEW' ? (
              <TestCoverageMatrix onOpenBookingModal={handleOpenBooking} />
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">R&amp;D Expert &amp; Fleet Manager Access Restricted</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The 2D Test Coverage &amp; Milestone Sign-off Matrix is managed exclusively by R&amp;D Validation Leads (Maria Lindqvist) and Fleet Command Managers.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setRole('RD_LEAD');
                      setActiveTab('coverage');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0077C8] to-[#009FE3] text-white text-xs font-bold shadow-glow transition-all active:scale-95"
                  >
                    Switch to Maria (R&amp;D Lead) →
                  </button>
                  <button
                    onClick={() => {
                      setRole('OVERVIEW');
                      setActiveTab('coverage');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Switch to Fleet Manager →
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'cockpit' && <DriverCockpit />}

          {activeTab === 'workshop' && <WorkshopCenter />}

          {activeTab === 'conflicts' && (
            <ConflictResolutionModal initialConflictId={activeConflictId} />
          )}

          {activeTab === 'workflow' && <WorkflowWalkthrough />}

          {activeTab === 'analytics' && <AnalyticsCharts />}
        </div>
      </main>

      {/* Global Live Role Handshake Banner */}
      <LiveHandshakeBanner />

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialVehicleId={selectedVehicleForBooking}
        onOpenConflictModal={handleOpenConflictHub}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300 tracking-wider">VOLVO GROUP</span>
            <span>·</span>
            <span>Connected Services · Prototype Validation Hub</span>
          </div>
          <p className="font-mono text-[11px]">ProtoSchedule PRD v1.0 MVP Implementation</p>
        </div>
      </footer>
    </div>
  );
}
