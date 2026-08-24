import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VehicleStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusBadge(status: VehicleStatus) {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: 'Available',
        bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
        color: '#10B981',
      };
    case 'IN_TESTING':
      return {
        label: 'In Testing',
        bg: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
        dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse',
        color: '#0077C8',
      };
    case 'PENDING_TRIAGE':
      return {
        label: 'Pending R&D Triage',
        bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
        dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-ping',
        color: '#F43F5E',
      };
    case 'IN_WORKSHOP':
      return {
        label: 'In Workshop',
        bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
        color: '#F59E0B',
      };
    case 'RESERVED':
      return {
        label: 'Reserved',
        bg: 'bg-purple-500/15 border-purple-500/40 text-purple-400',
        dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
        color: '#A855F7',
      };
    case 'OFFLINE':
    default:
      return {
        label: 'Offline',
        bg: 'bg-slate-500/15 border-slate-500/40 text-slate-400',
        dot: 'bg-slate-400',
        color: '#64748B',
      };
  }
}

export function getPowertrainBadge(powertrain: string) {
  switch (powertrain) {
    case 'BEV':
      return { label: '100% Electric (BEV)', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60' };
    case 'FCEV':
      return { label: 'Hydrogen Fuel Cell (FCEV)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
    case 'Autonomous_BEV':
      return { label: 'Autonomous L3 Electric', color: 'text-purple-400 bg-purple-950/60 border-purple-800/60' };
    case 'Diesel_Hybrid':
      return { label: 'Diesel Hybrid Class 8', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
    case 'Electric_Heavy':
      return { label: 'Heavy Electric (350kW+)', color: 'text-blue-400 bg-blue-950/60 border-blue-800/60' };
    default:
      return { label: powertrain, color: 'text-slate-300 bg-slate-800 border-slate-700' };
  }
}
