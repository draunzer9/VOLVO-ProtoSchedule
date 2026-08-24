'use client';

import React, { useState } from 'react';
import { useProtoSchedule, PERSONAS } from '@/context/ProtoScheduleContext';
import {
  GitBranch,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  User,
  Wrench,
  Gauge,
  Layers,
  Sparkles,
  Car,
  Play,
  RotateCcw,
} from 'lucide-react';

interface WorkflowStep {
  step: number;
  title: string;
  actor: 'Maria (R&D Lead)' | 'Lars (Workshop Tech)' | 'Arjun (Test Driver)';
  actorRole: 'RD_LEAD' | 'WORKSHOP_TECH' | 'TEST_DRIVER';
  action: string;
  systemOutcome: string;
  targetTab: string;
  buttonLabel: string;
}

export const WorkflowWalkthrough: React.FC = () => {
  const { setRole, setActiveTab, resetToDefaultData, role } = useProtoSchedule();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const workflowSteps: WorkflowStep[] = [
    {
      step: 1,
      title: 'Step 1 — R&D Lead Defines Test Plan & Conditions',
      actor: 'Maria (R&D Lead)',
      actorRole: 'RD_LEAD',
      action: 'Identifies unvalidated scenarios (e.g. Arctic Cold, 15% Grade) across prototype vehicles in the Coverage Matrix.',
      systemOutcome: 'Coverage Matrix surfaces validation gaps; uncompleted cells highlighted for scheduling.',
      targetTab: 'coverage',
      buttonLabel: 'Switch to Maria & View Coverage Matrix',
    },
    {
      step: 2,
      title: 'Step 2 — R&D Lead Assigns Vehicle & Slot to Test Driver',
      actor: 'Maria (R&D Lead)',
      actorRole: 'RD_LEAD',
      action: 'Books prototype slot in <3 clicks. Real-time engine guarantees zero double-bookings or workshop clashes.',
      systemOutcome: 'Booking confirmed; automated alerts sent to Driver Arjun and Workshop Tech Lars within 30 seconds.',
      targetTab: 'fleet',
      buttonLabel: 'Open Fleet Board & Booking Engine',
    },
    {
      step: 3,
      title: 'Step 3 — Workshop Tech Receives Prep Instructions & Marks "Ready"',
      actor: 'Lars (Workshop Tech)',
      actorRole: 'WORKSHOP_TECH',
      action: 'Mounts 5G telemetry logger, calibrates gross payload ballast, verifies 800V HV safety, flashes TCU firmware.',
      systemOutcome: 'Vehicle status updated to "Ready for Test"; driver notified vehicle is staged at track paddock.',
      targetTab: 'workshop',
      buttonLabel: 'Switch to Lars & Open Workshop Checklist',
    },
    {
      step: 4,
      title: 'Step 4 — Test Driver Picks Up Vehicle & Executes Live Test Drive',
      actor: 'Arjun (Test Driver)',
      actorRole: 'TEST_DRIVER',
      action: 'Picks up vehicle at Hällered depot paddock, starts active session, monitors real-time telemetry gauges.',
      systemOutcome: 'Live drive timer & speed/temp telemetry active; prototype status broadcasts "IN_TESTING" across fleet.',
      targetTab: 'cockpit',
      buttonLabel: 'Switch to Arjun & View Live Cockpit',
    },
    {
      step: 5,
      title: 'Step 5 — Driver Submits Post-Session Report & Returns Vehicle',
      actor: 'Arjun (Test Driver)',
      actorRole: 'TEST_DRIVER',
      action: 'Logs completed mileage, energy kWh, ambient weather, and flags behavioral anomalies (e.g. steering vibration).',
      systemOutcome: 'Session data persisted; intake ticket instantly routed to Lars; prototype returned to workshop bay.',
      targetTab: 'cockpit',
      buttonLabel: 'Inspect Post-Session Report Form',
    },
    {
      step: 6,
      title: 'Step 6 — Workshop Tech Inspects Condition & Releases Vehicle',
      actor: 'Lars (Workshop Tech)',
      actorRole: 'WORKSHOP_TECH',
      action: 'Inspects brake wear, reviews driver anomalies, and releases prototype as "Available" or holds "In Service".',
      systemOutcome: 'Fleet availability board updates in real time (<30s); vehicle ready for next booking cycle.',
      targetTab: 'workshop',
      buttonLabel: 'Open Workshop Intake & Sign-Off',
    },
    {
      step: 7,
      title: 'Step 7 — R&D Lead Signs Off Milestone in Coverage Matrix',
      actor: 'Maria (R&D Lead)',
      actorRole: 'RD_LEAD',
      action: 'Reviews driver telemetry report & Lars workshop notes, signs off milestone cell in Coverage Matrix.',
      systemOutcome: '2D Coverage Matrix marks cell "Complete"; fleet utilization KPIs & CSV audit reports updated.',
      targetTab: 'coverage',
      buttonLabel: 'Switch to Maria & Sign Off Milestone',
    },
  ];

  const currentStep = workflowSteps[activeStepIndex];

  const handleJumpToStep = (step: WorkflowStep) => {
    setRole(step.actorRole);
    setActiveTab(step.targetTab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-glow">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">End-to-End Test Drive Lifecycle (PRD Section 6.2)</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Interactive Walkthrough
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate the 7-step collaborative workflow between R&amp;D Leads, Workshop Technicians, and Test Drivers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveStepIndex(0)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Step 1</span>
        </button>
      </div>

      {/* 7-Step Stepper Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {workflowSteps.map((s, idx) => {
          const isActive = idx === activeStepIndex;
          const isDone = idx < activeStepIndex;

          return (
            <button
              key={s.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-glow text-white'
                  : isDone
                  ? 'bg-slate-900/90 border-emerald-500/40 text-slate-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">STEP {s.step}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                )}
              </div>
              <p className="text-xs font-bold mt-1 line-clamp-1">{s.actor.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{s.title.split('—')[1]}</p>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Active Stage {currentStep.step} of 7
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{currentStep.title}</h3>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Primary Actor:</span>
            <span className="text-xs font-bold text-white">{currentStep.actor}</span>
          </div>
        </div>

        {/* Action vs Outcome Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Actor Workflow Action
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">{currentStep.action}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              ProtoSchedule System Outcome
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">{currentStep.systemOutcome}</p>
          </div>
        </div>

        {/* Step Navigation Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => handleJumpToStep(currentStep)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{currentStep.buttonLabel} →</span>
          </button>

          <div className="flex items-center space-x-2 justify-end">
            {activeStepIndex > 0 && (
              <button
                onClick={() => setActiveStepIndex((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                ← Previous Step
              </button>
            )}
            {activeStepIndex < workflowSteps.length - 1 && (
              <button
                onClick={() => setActiveStepIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                <span>Next Step {activeStepIndex + 2}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
