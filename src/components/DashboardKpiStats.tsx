'use client';

import React from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import {
  TrendingUp,
  Car,
  Wrench,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Zap,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardKpiStats: React.FC = () => {
  const { stats, setActiveTab, currentPersona } = useProtoSchedule();

  const isUtilHigh = stats.utilizationRate >= stats.utilizationTarget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. North Star Metric: Fleet Utilisation Rate */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/90 to-[#0A1A2E]/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fleet Utilisation</span>
          <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>North Star</span>
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white font-mono">{stats.utilizationRate}%</span>
            <span className="text-xs text-slate-400">/ {stats.utilizationTarget}% target</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            +{(stats.utilizationRate - 54)}% vs Base
          </span>
        </div>
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isUtilHigh ? 'bg-emerald-400 shadow-glow' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${Math.min(100, stats.utilizationRate)}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Baseline: 54%</span>
          <span>Target: 85%+</span>
        </div>
      </div>

      {/* 2. Active Prototypes in Live Testing */}
      <div
        onClick={() => setActiveTab('cockpit')}
        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live On-Track</span>
          <Car className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">{stats.activeTestsCount}</span>
            <span className="text-xs text-slate-400">vehicles</span>
          </div>
          {stats.activeTestsCount > 0 && (
            <span className="flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1" />
              Live Telemetry
            </span>
          )}
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Hällered & Kiruna tracks</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>

      {/* 3. Workshop Bays & Prep Queue */}
      <div
        onClick={() => setActiveTab('workshop')}
        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workshop Load</span>
          <Wrench className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.inWorkshopCount}</span>
            <span className="text-xs text-slate-400">in bays</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
            Lars Queue
          </span>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Pre-drive prep & service</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
        </div>
      </div>

      {/* 4. Scheduling Conflict Engine */}
      <div
        onClick={() => setActiveTab('conflicts')}
        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md group ${
          stats.unresolvedConflictsCount > 0
            ? 'bg-gradient-to-br from-rose-950/40 to-slate-900/90 border-rose-500/40 hover:border-rose-400'
            : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conflict Engine</span>
          <AlertTriangle
            className={`w-4 h-4 ${
              stats.unresolvedConflictsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'
            }`}
          />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black font-mono ${
                stats.unresolvedConflictsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {stats.unresolvedConflictsCount}
            </span>
            <span className="text-xs text-slate-400">unresolved</span>
          </div>
          {stats.unresolvedConflictsCount > 0 ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
              Action Req.
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Zero Conflicts
            </span>
          )}
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{stats.unresolvedConflictsCount > 0 ? 'Collision flagged' : '100% schedule integrity'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
        </div>
      </div>

      {/* 5. Test Coverage Matrix Completion */}
      <div
        onClick={() => setActiveTab('coverage')}
        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test Coverage</span>
          <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-cyan-400 font-mono">{stats.coveragePercent}%</span>
            <span className="text-xs text-slate-400">({stats.coverageCompletedCount}/{stats.totalCoverageCells})</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            Maria Lead
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${stats.coveragePercent}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>8 Standard Conditions</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};
