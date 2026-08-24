'use client';

import React from 'react';
import { useProtoSchedule, PERSONAS } from '@/context/ProtoScheduleContext';
import {
  Sparkles,
  ArrowRight,
  X,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const LiveHandshakeBanner: React.FC = () => {
  const { liveHandshake, dismissHandshake, setRole, setActiveTab, role } = useProtoSchedule();

  if (!liveHandshake) return null;

  const targetPersona = PERSONAS[liveHandshake.targetRole];
  const sourcePersona = PERSONAS[liveHandshake.sourceRole];

  const handleAction = () => {
    setRole(liveHandshake.targetRole);
    setActiveTab(liveHandshake.targetTab);
    dismissHandshake();
  };

  return (
    <aside
      aria-label="Workflow Handshake Alert"
      className="fixed bottom-5 right-5 z-50 max-w-lg w-full p-4 rounded-2xl bg-gradient-to-r from-[#003057] via-slate-900 to-slate-950 border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,119,200,0.4)] animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-400 shrink-0 mt-0.5">
            <img src={targetPersona.avatar} alt={targetPersona.name} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-1 ring-black animate-ping" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Live Handshake
              </span>
              <span className="text-xs font-bold text-white">{liveHandshake.title}</span>
            </div>
            <p className="text-xs text-slate-200 leading-snug">{liveHandshake.message}</p>
            <div className="text-[10px] text-cyan-300 font-mono pt-0.5">
              Target: <span className="font-bold text-white">{targetPersona.name}</span> ({targetPersona.badge})
            </div>
          </div>
        </div>

        <button
          onClick={dismissHandshake}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">Sync latency &lt;30ms (Broadcast Engine)</span>

        <button
          onClick={handleAction}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white text-xs font-bold shadow-glow transition-all active:scale-95 flex items-center space-x-1.5"
        >
          <span>{liveHandshake.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
