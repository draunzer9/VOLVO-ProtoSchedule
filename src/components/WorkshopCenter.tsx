'use client';

import React, { useState } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { WorkshopServiceWindow, Vehicle, PartRequisition } from '@/types';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  Plus,
  ShieldCheck,
  ClipboardList,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Activity,
  Radio,
  FileText,
  UserCheck,
  Zap,
  Package,
  Send,
  Truck,
  Check,
  X,
} from 'lucide-react';

export const WorkshopCenter: React.FC = () => {
  const {
    vehicles,
    workshopWindows,
    partRequisitions,
    createPartRequisition,
    updateWorkshopChecklist,
    markVehicleReadyForTest,
    submitWorkshopInspection,
    addWorkshopServiceWindow,
    updateVehicleStatus,
    role,
    currentPersona,
  } = useProtoSchedule();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    workshopWindows[0]?.id || ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);

  // New Service Window state
  const [newVehicleId, setNewVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [newBay, setNewBay] = useState<string>('Bay 01 - Autonomous & Sensor Lab');
  const [newServiceType, setNewServiceType] = useState<WorkshopServiceWindow['serviceType']>('PRE_DRIVE_PREP');
  const [newDate, setNewDate] = useState<string>('2026-08-24');
  const [newStart, setNewStart] = useState<string>('08:00');
  const [newEnd, setNewEnd] = useState<string>('12:00');
  const [newNotes, setNewNotes] = useState<string>('');

  // Part Requisition State
  const [partVehicleId, setPartVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [partName, setPartName] = useState<string>('');
  const [partNumber, setPartNumber] = useState<string>('');
  const [partCategory, setPartCategory] = useState<PartRequisition['category']>('BRAKES');
  const [partCost, setPartCost] = useState<number>(1250);
  const [partLeadTime, setPartLeadTime] = useState<number>(2);
  const [partUrgency, setPartUrgency] = useState<PartRequisition['urgency']>('P0_CRITICAL');
  const [partJustification, setPartJustification] = useState<string>('');
  const [partBay, setPartBay] = useState<string>('Bay 01 - Autonomous & Sensor Lab');

  const [inspectionNotes, setInspectionNotes] = useState<string>('');

  const activeService = workshopWindows.find((w) => w.id === selectedServiceId) || workshopWindows[0];
  const targetVehicle = vehicles.find((v) => v.id === activeService?.vehicleId);

  // Filter urgent post-drive returns / anomaly tickets
  const postDriveIntakeTickets = workshopWindows.filter(
    (w) => w.serviceType === 'POST_DRIVE_INSPECTION' && w.status !== 'COMPLETED'
  );

  const quickPartPresets = [
    {
      name: 'Brembo High-Temp Track Caliper & Rotor Kit',
      number: 'VOLVO-OEM-BRK-992-FC',
      cat: 'BRAKES' as const,
      cost: 1850,
      lead: 2,
      urgency: 'P0_CRITICAL' as const,
      just: 'Thermal degradation and pad glaze observed during high-speed payload braking. Track-spec friction required.',
    },
    {
      name: 'Luminar Iris 1550nm LiDAR Sensor Pod Bracket V2',
      number: 'VOLVO-AUTON-LID-1550',
      cat: 'SENSORS_ADAS' as const,
      cost: 3200,
      lead: 4,
      urgency: 'P1_HIGH' as const,
      just: 'Vibration damping mount upgrade to eliminate point cloud noise during wet spray high-speed runs.',
    },
    {
      name: '800V High-Voltage Pyro-Fuse Module & Isolation Contactor',
      number: 'VOLVO-HV-PYRO-800V',
      cat: 'POWERTRAIN_HV' as const,
      cost: 2100,
      lead: 3,
      urgency: 'P0_CRITICAL' as const,
      just: 'Preventative high-voltage pack safety replacement following high thermal delta validation test.',
    },
    {
      name: 'Heavy-Duty Steering Tie-Rod End Ball Joints',
      number: 'VOLVO-STEER-TR-440',
      cat: 'SUSPENSION_STEERING' as const,
      cost: 650,
      lead: 1,
      urgency: 'P1_HIGH' as const,
      just: 'Eliminates mechanical oscillation observed by driver on Belgian pavé rough road test surface.',
    },
  ];

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((veh) => veh.id === newVehicleId);
    if (!v) return;

    addWorkshopServiceWindow({
      vehicleId: v.id,
      vehicleCode: v.code,
      vehicleName: v.name,
      bayNumber: newBay,
      technicianName: 'Lars Hedlund',
      serviceType: newServiceType,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      checklist: {
        tirePressureChecked: false,
        telemetryLoggerMounted: false,
        ballastCalibrated: false,
        highVoltageSafetyVerified: false,
        firmwareFlashed: false,
        brakesInspected: false,
      },
      findingsNotes: newNotes,
    });

    setShowAddModal(false);
  };

  const handleCreatePartRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((veh) => veh.id === partVehicleId);
    if (!v) return;

    createPartRequisition({
      vehicleId: v.id,
      vehicleCode: v.code,
      vehicleName: v.name,
      partName: partName || 'Custom Prototype Replacement Part',
      partNumber: partNumber || 'VOLVO-PROTO-PART-OEM',
      category: partCategory,
      estimatedCostEur: partCost,
      leadTimeHours: partLeadTime,
      urgency: partUrgency,
      justification: partJustification || 'Technician inspection determined hardware replacement is required for safety.',
      requestedBy: 'Lars Hedlund (Workshop Tech)',
      allocatedBay: partBay,
    });

    setShowPartModal(false);
    // Reset form
    setPartName('');
    setPartNumber('');
    setPartJustification('');
  };

  const openPartModalForVehicle = (vId: string, prefilledBay?: string) => {
    setPartVehicleId(vId);
    if (prefilledBay) setPartBay(prefilledBay);
    setShowPartModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-glowAmber">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Workshop &amp; Rig Center (Lars Cockpit)</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                PRD Section 6.1 &amp; 6.2
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Execute R&amp;D work orders dispatched by Maria, order replacement parts for R&amp;D approval, and certify vehicles ready for test.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPartModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 text-xs font-bold shadow-glowRose transition-all active:scale-95"
          >
            <Package className="w-4 h-4 text-rose-400" />
            <span>Request Parts &amp; Approval</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-glowAmber transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Service Window</span>
          </button>
        </div>
      </div>

      {/* LARS PARTS REQUISITION & APPROVAL TRACKER (Lars -> Maria Handshake) */}
      {partRequisitions.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#0A1E38] border border-cyan-500/40 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Parts Requisitions &amp; R&amp;D Approvals ({partRequisitions.length})
              </h3>
              <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
                Lars ➔ Maria Handshake
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {partRequisitions.filter((r) => r.status === 'PENDING_APPROVAL').length} Pending Maria Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {partRequisitions.map((req) => {
              const isPending = req.status === 'PENDING_APPROVAL';
              const isApproved = req.status === 'APPROVED';

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border space-y-2.5 shadow-md ${
                    isPending
                      ? 'bg-slate-950/90 border-amber-500/50'
                      : isApproved
                      ? 'bg-slate-950/90 border-emerald-500/50'
                      : 'bg-slate-950/90 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {req.vehicleCode}
                        </span>
                        <span className="text-xs font-bold text-white">{req.partName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        PN: {req.partNumber} · {req.category} · {req.allocatedBay || 'Bay 01'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isPending
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : isApproved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isPending ? '⏳ PENDING MARIA' : isApproved ? '✓ APPROVED' : '✕ REJECTED'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Est. Cost: <strong className="text-white">€{req.estimatedCostEur.toLocaleString()}</strong></span>
                      <span>Lead Time: <strong className="text-cyan-300">{req.leadTimeHours} hrs</strong></span>
                      <span className="text-amber-400 font-bold">{req.urgency.replace('_', ' ')}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/60">
                      &quot;{req.justification}&quot;
                    </p>
                  </div>

                  {req.approvalNotes && (
                    <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200">
                      <span className="font-bold text-cyan-400">Maria Lindqvist Note: </span>
                      {req.approvalNotes}
                    </div>
                  )}

                  {isApproved && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Procurement Released · Ready to Install in Bay</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LARS DISPATCHED WORK ORDERS & ANOMALY INTAKE */}
      {postDriveIntakeTickets.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-500/80 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="text-sm font-bold text-white">
                Active R&amp;D Work Orders &amp; Dispatched Repairs ({postDriveIntakeTickets.length})
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Step 3: Lars Execution Queue
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Dispatched by Maria Lindqvist</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {postDriveIntakeTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {ticket.vehicleCode}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {ticket.priority?.replace('_', ' ') || 'P0 CRITICAL'}
                      </span>
                      {ticket.status === 'IN_PROGRESS' && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          HOLD IN BAY (In Progress)
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{ticket.vehicleName}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{ticket.bayNumber}</span>
                </div>

                {/* Maria's Engineering Directives Card */}
                {ticket.rAndDDirectives && (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs space-y-1">
                    <span className="font-bold text-cyan-300 text-[11px] flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>R&amp;D Engineering Directives (Maria):</span>
                    </span>
                    <p className="text-white italic text-[11px]">&quot;{ticket.rAndDDirectives}&quot;</p>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300">
                  <span className="font-bold block text-[11px] text-slate-300">Driver Anomaly Findings:</span>
                  <p className="italic mt-0.5">{ticket.findingsNotes}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => openPartModalForVehicle(ticket.vehicleId, ticket.bayNumber)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Order Part</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => submitWorkshopInspection(ticket.id, 'IN_WORKSHOP', 'Parts awaiting replacement in Bay.')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-bold border border-amber-500/40"
                    >
                      Hold In Bay
                    </button>
                    <button
                      onClick={() => submitWorkshopInspection(ticket.id, 'AVAILABLE', 'R&D Directives executed: Hardware calibrated & certified safe for track.')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certify &amp; Release</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workshop Queue & Inspection Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Service Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Workshop Bay Queue ({workshopWindows.length})
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">Hällered Rig Facility</span>
          </div>

          <div className="space-y-2.5">
            {workshopWindows.map((service) => {
              const isSelected = service.id === selectedServiceId;
              const isReady = service.status === 'READY_FOR_TEST';
              const isDone = service.status === 'COMPLETED';

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-glowAmber'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-white border border-slate-700">
                          {service.vehicleCode}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{service.serviceType.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-1">{service.vehicleName}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isReady
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isDone
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      }`}
                    >
                      {service.status.replace('_', ' ')}
                    </span>
                  </div>

                  {service.rAndDDirectives && (
                    <p className="text-[11px] text-cyan-300 mt-2 line-clamp-1 italic">
                      Directive: &quot;{service.rAndDDirectives}&quot;
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{service.bayNumber}</span>
                    <span>
                      {service.date} ({service.startTime}-{service.endTime})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection & Checklist Station */}
        <div className="lg:col-span-7">
          {activeService ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-5">
              {/* Active Service Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                      {activeService.vehicleCode}
                    </span>
                    <h3 className="font-bold text-sm text-white">{activeService.vehicleName}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{activeService.bayNumber}</span>
                </div>

                {activeService.rAndDDirectives && (
                  <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-500/50 text-xs">
                    <span className="font-bold text-cyan-300 block mb-1">Maria&apos;s Engineering Directives:</span>
                    <p className="text-white italic">&quot;{activeService.rAndDDirectives}&quot;</p>
                  </div>
                )}

                {activeService.findingsNotes && (
                  <p className="text-xs text-slate-300 p-2.5 rounded bg-slate-900 border border-slate-800 italic">
                    &quot;{activeService.findingsNotes}&quot;
                  </p>
                )}
              </div>

              {/* Safety Checklist (PRD Step 3: Vehicle Prep) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pre-Flight Technical Checklist (Lars)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Volvo Safety Standard ISO-26262</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'tirePressureChecked', label: 'Tire Pressure & Torque Check' },
                    { key: 'telemetryLoggerMounted', label: '5G Telemetry Logger Mounted' },
                    { key: 'ballastCalibrated', label: 'Gross Weight Ballast Calibrated' },
                    { key: 'highVoltageSafetyVerified', label: '800V High-Voltage Safety Check' },
                    { key: 'firmwareFlashed', label: 'ECU/TCU Validation Firmware Flashed' },
                    { key: 'brakesInspected', label: 'Brake Linings & ESP Calibrated' },
                  ].map((item) => {
                    const isChecked = activeService.checklist[item.key as keyof typeof activeService.checklist];
                    return (
                      <button
                        key={item.key}
                        onClick={() =>
                          updateWorkshopChecklist(activeService.id, {
                            [item.key]: !isChecked,
                          })
                        }
                        className={`p-2.5 rounded-lg border text-left text-xs font-medium flex items-center space-x-2.5 transition-all ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={isChecked ? 'text-white font-semibold' : ''}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Lars */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => markVehicleReadyForTest(activeService.id)}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark All Verified &amp; &quot;Ready for Test&quot; (Handshake to Driver)</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openPartModalForVehicle(activeService.vehicleId, activeService.bayNumber)}
                      className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Request Parts</span>
                    </button>

                    <button
                      onClick={() => submitWorkshopInspection(activeService.id, 'IN_WORKSHOP', inspectionNotes || 'Held in bay for active repair')}
                      className="px-4 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors"
                    >
                      Hold In Bay
                    </button>

                    <button
                      onClick={() => submitWorkshopInspection(activeService.id, 'AVAILABLE', inspectionNotes || 'Inspected and certified available')}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                    >
                      Release as Available
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              Select a workshop bay entry to inspect checklist and sign-offs.
            </div>
          )}
        </div>
      </div>

      {/* Parts Requisition & Procurement Modal (Lars -> Maria) */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 space-y-4">
            <button
              onClick={() => setShowPartModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Order Parts &amp; Engineering Requisition</h3>
                <p className="text-xs text-slate-400">Submits an official procurement request to Maria Lindqvist (R&amp;D Lead) for approval.</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Volvo OEM Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickPartPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPartName(preset.name);
                      setPartNumber(preset.number);
                      setPartCategory(preset.cat);
                      setPartCost(preset.cost);
                      setPartLeadTime(preset.lead);
                      setPartUrgency(preset.urgency);
                      setPartJustification(preset.just);
                    }}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-cyan-300 block truncate">{preset.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">€{preset.cost} · {preset.lead}h lead</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreatePartRequisition} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prototype Vehicle</label>
                  <select
                    value={partVehicleId}
                    onChange={(e) => setPartVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code} - {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Component Category</label>
                  <select
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="BRAKES">Brakes &amp; Hydraulics</option>
                    <option value="SENSORS_ADAS">Sensors &amp; LiDAR/Radar</option>
                    <option value="POWERTRAIN_HV">800V Powertrain &amp; Battery</option>
                    <option value="SUSPENSION_STEERING">Suspension &amp; Steering</option>
                    <option value="FIRMWARE_ELECTRONICS">ECU Firmware &amp; Electronics</option>
                    <option value="OTHER">Other Rig Hardware</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Part Name</label>
                  <input
                    type="text"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. High-Temp Brembo Brake Caliper"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Part Number</label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="e.g. VOLVO-OEM-BRK-992"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Est. Cost (€)</label>
                  <input
                    type="number"
                    value={partCost}
                    onChange={(e) => setPartCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Lead Time (hrs)</label>
                  <input
                    type="number"
                    value={partLeadTime}
                    onChange={(e) => setPartLeadTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Urgency</label>
                  <select
                    value={partUrgency}
                    onChange={(e) => setPartUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-amber-400 font-bold"
                  >
                    <option value="P0_CRITICAL">P0 Critical</option>
                    <option value="P1_HIGH">P1 High</option>
                    <option value="P2_ROUTINE">P2 Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Engineering Justification / Defect Notes for Maria
                </label>
                <textarea
                  value={partJustification}
                  onChange={(e) => setPartJustification(e.target.value)}
                  placeholder="Explain why this part replacement is needed for track safety certification..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-glowRose flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Requisition to Maria for Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Window Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono font-bold"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white mb-1">Log Workshop Service Window</h3>
            <p className="text-xs text-slate-400 mb-4">
              Reserves a workshop bay and triggers automatic soft conflict checks against test drive schedules.
            </p>

            <form onSubmit={handleCreateService} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prototype Vehicle</label>
                <select
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workshop Bay</label>
                <select
                  value={newBay}
                  onChange={(e) => setNewBay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Bay 01 - Autonomous & Sensor Lab">Bay 01 - Autonomous &amp; Sensor Lab</option>
                  <option value="Bay 02 - Heavy Rig & Powertrain">Bay 02 - Heavy Rig &amp; Powertrain</option>
                  <option value="Bay 03 - Post-Drive Intake & Diagnostics">Bay 03 - Post-Drive Intake &amp; Diagnostics</option>
                  <option value="Bay 04 - High-Voltage Megawatt Lab">Bay 04 - High-Voltage Megawatt Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Service Type</label>
                <select
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value as WorkshopServiceWindow['serviceType'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="PRE_DRIVE_PREP">Pre-Drive Safety Prep</option>
                  <option value="SCHEDULED_SERVICE">Scheduled 10k Maintenance</option>
                  <option value="POST_DRIVE_INSPECTION">Post-Drive Condition Intake</option>
                  <option value="EMERGENCY_REPAIR">Emergency Repair / Sensor Fix</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Start</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">End</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Description / Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Brake pad wear inspection, calibration of LiDAR mounting bracket..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
                >
                  Add Service Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
