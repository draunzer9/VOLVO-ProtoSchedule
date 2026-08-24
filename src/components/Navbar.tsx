'use client';

import React, { useState, useEffect } from 'react';
import { useProtoSchedule, PERSONAS } from '@/context/ProtoScheduleContext';
import { UserRole } from '@/types';
import {
  Calendar,
  Layers,
  Gauge,
  Wrench,
  AlertTriangle,
  GitBranch,
  BarChart3,
  Bell,
  Plus,
  RefreshCw,
  Download,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  MapPin,
  Clock,
  Car,
  Search,
} from 'lucide-react';

interface NavbarProps {
  onOpenBookingModal: (preselectedVehicleId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBookingModal }) => {
  const {
    role,
    setRole,
    currentPersona,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetToDefaultData,
    exportCoverageCsv,
    exportUtilizationCsv,
    stats,
  } = useProtoSchedule();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/Stockholm',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'fleet', label: 'Fleet Board', icon: Car, roles: ['RD_LEAD', 'TEST_DRIVER', 'WORKSHOP_TECH', 'OVERVIEW'] },
    { id: 'coverage', label: 'Coverage Matrix', icon: Layers, roles: ['RD_LEAD', 'OVERVIEW'], badge: `${stats.coveragePercent}%` },
    { id: 'cockpit', label: 'Driver Cockpit', icon: Gauge, roles: ['TEST_DRIVER', 'OVERVIEW'], badge: stats.activeTestsCount > 0 ? 'Live' : undefined },
    { id: 'workshop', label: 'Workshop Center', icon: Wrench, roles: ['WORKSHOP_TECH', 'OVERVIEW'], badge: stats.inWorkshopCount > 0 ? `${stats.inWorkshopCount} Bay` : undefined },
    { id: 'conflicts', label: 'Conflict Hub', icon: AlertTriangle, roles: ['RD_LEAD', 'TEST_DRIVER', 'WORKSHOP_TECH', 'OVERVIEW'], badge: stats.unresolvedConflictsCount > 0 ? `${stats.unresolvedConflictsCount}` : undefined, badgeAlert: stats.unresolvedConflictsCount > 0 },
    { id: 'workflow', label: '7-Step Workflow', icon: GitBranch, roles: ['RD_LEAD', 'TEST_DRIVER', 'WORKSHOP_TECH', 'OVERVIEW'] },
    { id: 'analytics', label: 'Utilisation KPIs', icon: BarChart3, roles: ['RD_LEAD', 'OVERVIEW'] },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B111E]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Top Banner with Volvo Branding & Persona Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/50">
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#003057] to-[#0077C8] border border-cyan-500/30 shadow-glow shrink-0 overflow-hidden">
              <svg width="24" height="24" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18" />
                <path d="M3 12h18" />
                <path d="m18 6 3-3m0 0h-4m4 0v4" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-white text-base uppercase">VOLVO</span>
                <span className="text-cyan-400 font-light text-base">| ProtoSchedule</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                  MVP v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Connected Services · Prototype Validation Hub</p>
            </div>
          </div>

          {/* Center Info: Depot & Live Proving Ground Time */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Primary Depot:</span>
              <span className="font-semibold text-white">Hällered Proving Ground</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-400">Gothenburg Time:</span>
              <span className="text-cyan-300 font-bold">{currentTime || '12:00:00'} CET</span>
            </div>
          </div>

          {/* Right Actions: Persona Switcher, Notifications, Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 transition-all text-left group shadow-sm"
                title="Switch persona to test role-specific workflows"
              >
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/50"
                />
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {currentPersona.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                      {currentPersona.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{currentPersona.title}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
              </button>

              {/* Persona Selector Menu */}
              {showRoleDropdown && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowRoleDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Switch Persona (PRD Roles)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">3 Core Personas</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Test ProtoSchedule through each role&apos;s tailored cockpit.</p>
                  </div>
                  <div className="space-y-1 mt-1">
                    {(Object.keys(PERSONAS) as UserRole[]).map((rKey) => {
                      const p = PERSONAS[rKey];
                      const isSelected = role === rKey;
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            setRole(rKey);
                            setShowRoleDropdown(false);
                            if (rKey === 'TEST_DRIVER') setActiveTab('cockpit');
                            else if (rKey === 'WORKSHOP_TECH') setActiveTab('workshop');
                            else if (rKey === 'RD_LEAD') setActiveTab('coverage');
                          }}
                          className={`w-full flex items-start space-x-3 p-2.5 rounded-lg text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/50 border border-cyan-500/40 text-white'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover mt-0.5 ring-1 ring-slate-600" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{p.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {p.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-cyan-400/90 font-medium">{p.title}</p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{p.description}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
                title="System Notifications & Conflict Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-glowRose animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Live System Feed</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.actionTab) setActiveTab(n.actionTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800/70 ${
                            !n.read ? 'bg-slate-800/40 border-l-2 border-cyan-400' : 'opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between space-x-2">
                            <span
                              className={`text-xs font-bold ${
                                n.type === 'CRITICAL'
                                  ? 'text-rose-400'
                                  : n.type === 'WARNING'
                                  ? 'text-amber-400'
                                  : n.type === 'SUCCESS'
                                  ? 'text-emerald-400'
                                  : 'text-cyan-400'
                              }`}
                            >
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-snug">{n.message}</p>
                          {n.actionLabel && (
                            <div className="mt-2 flex items-center justify-end">
                              <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 hover:bg-cyan-900 transition-colors">
                                {n.actionLabel} →
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Primary Action: Book Test Slot */}
            <button
              onClick={() => onOpenBookingModal()}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Book Test Slot</span>
            </button>

            {/* Export & Reset Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
                title="Export reports & Demo reset"
              >
                <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Reports & Tools
                  </div>
                  <button
                    onClick={() => {
                      exportCoverageCsv();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Coverage Matrix (CSV)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportUtilizationCsv();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Fleet Utilisation (CSV)</span>
                  </button>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      if (confirm('Reset prototype fleet and test schedule back to initial PRD seed state?')) {
                        resetToDefaultData();
                        setShowExportMenu(false);
                      }
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-950/50 flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset Demo Seed Data</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Tabs (Filtered by Role Permissions) */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      item.badgeAlert
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
