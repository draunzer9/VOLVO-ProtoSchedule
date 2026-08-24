'use client';

import React from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { TEST_CONDITIONS } from '@/data/seedData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Zap,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { vehicles, bookings, coverageCells, stats, exportUtilizationCsv } = useProtoSchedule();

  // 1. Monthly Fleet Utilisation Trend Data (PRD Baseline 54% -> Target 85%+)
  const utilisationTrendData = [
    { month: 'Apr 26 (Pre-Pilot)', rate: 51, target: 85, baseline: 54 },
    { month: 'May 26 (Pre-Pilot)', rate: 54, target: 85, baseline: 54 },
    { month: 'Jun 26 (Pre-Pilot)', rate: 56, target: 85, baseline: 54 },
    { month: 'Jul 26 (Pilot W1)', rate: 71, target: 85, baseline: 54 },
    { month: 'Aug 26 (Current)', rate: stats.utilizationRate, target: 85, baseline: 54 },
  ];

  // 2. Test Condition Completion Breakdown
  const conditionBreakdownData = TEST_CONDITIONS.map((cond) => {
    const cellsForCond = coverageCells.filter((c) => c.conditionType === cond.type);
    const complete = cellsForCond.filter((c) => c.status === 'COMPLETE').length;
    const scheduled = cellsForCond.filter((c) => c.status === 'SCHEDULED' || c.status === 'IN_PROGRESS').length;
    const notStarted = cellsForCond.filter((c) => c.status === 'NOT_STARTED').length;

    return {
      name: cond.label.split(' ')[0] + ' ' + (cond.label.split(' ')[1] || ''),
      fullName: cond.label,
      Complete: complete,
      Scheduled: scheduled,
      'Not Started': notStarted,
    };
  });

  // 3. Powertrain Share in Prototype Validation Fleet
  const powertrainCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const pt = v.powertrain.replace('_', ' ');
    powertrainCounts[pt] = (powertrainCounts[pt] || 0) + 1;
  });

  const powertrainPieData = Object.keys(powertrainCounts).map((key) => ({
    name: key,
    value: powertrainCounts[key],
  }));

  const PIE_COLORS = ['#0077C8', '#10B981', '#A855F7', '#F59E0B', '#38BDF8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0A1A2E] border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-glow">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Fleet Utilisation &amp; Validation Analytics</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PRD Section 9 KPIs
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Real-time measurement against the 85%+ North Star utilisation target and test coverage velocity.
            </p>
          </div>
        </div>

        <button
          onClick={exportUtilizationCsv}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Grid of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. North Star Utilisation Trend (Area Chart) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Fleet Utilisation Rate (%) vs Target 85%+</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Targeting reduction of idle vehicle time and elimination of double-booking delays.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                Current: {stats.utilizationRate}%
              </span>
              <span className="text-[10px] text-slate-400 block">Baseline: 54%</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilisationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0077C8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0077C8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[30, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#00A3E0" strokeWidth={3} fillOpacity={1} fill="url(#utilGrad)" name="Utilisation Rate (%)" />
                <Area type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Target (85%)" />
                <Area type="monotone" dataKey="baseline" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="Spreadsheet Baseline (54%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Powertrain Distribution (Pie Chart) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Prototype Fleet by Powertrain
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active vehicles in prototype validation cycle.</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={powertrainPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {powertrainPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium text-slate-300">
            {powertrainPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Test Condition Completion Status Bar Chart */}
        <div className="lg:col-span-12 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Validation Progress by Test Condition
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Complete vs Scheduled vs Not Started across all 6 prototype vehicles.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">8 Standard Volvo Conditions</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conditionBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Complete" fill="#10B981" stackId="a" />
                <Bar dataKey="Scheduled" fill="#0077C8" stackId="a" />
                <Bar dataKey="Not Started" fill="#334155" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
