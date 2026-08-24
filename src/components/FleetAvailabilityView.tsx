'use client';

import React, { useState, useMemo } from 'react';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import { Vehicle, VehicleStatus, Booking } from '@/types';
import { getStatusBadge, getPowertrainBadge } from '@/lib/utils';
import { Vehicle3DViewer } from '@/components/Vehicle3DViewer';
import {
  Car,
  Calendar,
  Clock,
  BatteryCharging,
  Gauge,
  Wrench,
  Search,
  Filter,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Radio,
  ChevronRight,
  ListFilter,
  SlidersHorizontal,
  Zap,
  Box,
  Eye,
  Sparkles,
} from 'lucide-react';

interface FleetAvailabilityViewProps {
  onOpenBookingModal: (vehicleId?: string) => void;
}

export const FleetAvailabilityView: React.FC<FleetAvailabilityViewProps> = ({
  onOpenBookingModal,
}) => {
  const {
    vehicles,
    bookings,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    depotFilter,
    setDepotFilter,
    powertrainFilter,
    setPowertrainFilter,
    updateVehicleStatus,
    role,
  } = useProtoSchedule();

  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedVehicleFor3D, setSelectedVehicleFor3D] = useState<Vehicle | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-24');

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        searchQuery === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.depotLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchDepot = depotFilter === 'ALL' || v.depotLocation.includes(depotFilter);
      const matchPowertrain = powertrainFilter === 'ALL' || v.powertrain === powertrainFilter;

      return matchSearch && matchStatus && matchDepot && matchPowertrain;
    });
  }, [vehicles, searchQuery, statusFilter, depotFilter, powertrainFilter]);

  // Unique lists for filter dropdowns
  const depots = ['Hällered', 'Kiruna', 'Gothenburg', 'Arizona', 'AstaZero'];
  const powertrains = ['BEV', 'FCEV', 'Autonomous_BEV', 'Diesel_Hybrid', 'Electric_Heavy'];

  // Time slots for Gantt Timeline view (07:00 to 19:00)
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  return (
    <div className="space-y-5">
      {/* Top Filter & Toolbar Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prototype (e.g. V-FH-EL01, Hydrogen, Hällered)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses ({vehicles.length})</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_TESTING">In Testing</option>
            <option value="PENDING_TRIAGE">Pending R&D Triage</option>
            <option value="IN_WORKSHOP">In Workshop</option>
            <option value="RESERVED">Reserved</option>
          </select>

          {/* Depot Filter */}
          <select
            value={depotFilter}
            onChange={(e) => setDepotFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Depots</option>
            {depots.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Powertrain Filter */}
          <select
            value={powertrainFilter}
            onChange={(e) => setPowertrainFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Powertrains</option>
            {powertrains.map((p) => (
              <option key={p} value={p}>
                {p.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* View Mode Toggle (Grid vs Timeline) */}
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'timeline' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gantt Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigator when in Timeline view */}
      {viewMode === 'timeline' && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white">Select Timeline Schedule Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
              <span>Confirmed Test Slot</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
              <span>Workshop Service Window</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
              <span>Double-Booking Conflict</span>
            </span>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const statusInfo = getStatusBadge(vehicle.status);
            const ptInfo = getPowertrainBadge(vehicle.powertrain);

            // Active or upcoming booking for this vehicle
            const activeBooking = bookings.find(
              (b) => b.vehicleId === vehicle.id && (b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED')
            );

            return (
              <div
                key={vehicle.id}
                className="group relative rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 shadow-xl overflow-hidden flex flex-col"
              >
                {/* Card Top Banner with Image & Code */}
                <div
                  onClick={() => setSelectedVehicleFor3D(vehicle)}
                  className="relative h-40 w-full overflow-hidden bg-slate-950 cursor-pointer"
                  title="Click to launch interactive 3D Vehicle Inspector"
                >
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                  {/* 3D Inspect Hover Pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <span className="px-3 py-1.5 rounded-full bg-cyan-600/90 text-white font-bold text-xs shadow-glow flex items-center space-x-1.5 animate-in zoom-in-90">
                      <Box className="w-4 h-4" />
                      <span>Launch 3D Model View</span>
                    </span>
                  </div>

                  {/* Vehicle Code Pill */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-700 text-white font-mono font-bold text-xs tracking-wider shadow-lg">
                      {vehicle.code}
                    </span>
                  </div>

                  {/* Live Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${statusInfo.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Powertrain Badge overlay bottom left */}
                  <div className="absolute bottom-2 left-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${ptInfo.color}`}>
                      {ptInfo.label}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => setSelectedVehicleFor3D(vehicle)}
                      className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors leading-tight cursor-pointer"
                    >
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vehicle.depotLocation}</span>
                    </div>
                  </div>

                  {/* Telemetry & Vital Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">SoC / Fuel</span>
                      <span className="text-xs font-bold text-cyan-400 flex items-center justify-center mt-0.5">
                        <BatteryCharging className="w-3 h-3 mr-1" />
                        {vehicle.batterySoC}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Odometer</span>
                      <span className="text-xs font-bold text-slate-200 block mt-0.5">
                        {vehicle.odometerKm.toLocaleString()} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">LiDAR Health</span>
                      <span
                        className={`text-xs font-bold block mt-0.5 ${
                          vehicle.sensorsHealth.lidar >= 95 ? 'text-emerald-400' : 'text-cyan-400'
                        }`}
                      >
                        {vehicle.sensorsHealth.lidar}%
                      </span>
                    </div>
                  </div>

                  {/* Active Allocation Context */}
                  {activeBooking ? (
                    <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/50 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-blue-300 font-semibold">
                        <span>{activeBooking.status === 'IN_PROGRESS' ? '🔴 Live Session' : '📅 Booked Slot'}</span>
                        <span className="font-mono">{activeBooking.startTime} - {activeBooking.endTime}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5 font-medium truncate">
                        {activeBooking.driverName} · {activeBooking.testConditionLabel}
                      </p>
                    </div>
                  ) : vehicle.status === 'IN_WORKSHOP' ? (
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-xs">
                      <div className="flex items-center space-x-1 text-amber-300 font-semibold text-[11px]">
                        <Wrench className="w-3 h-3" />
                        <span>Workshop Service in Progress</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">Lars Hedlund (Bay 02 Rig Inspection)</p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-xs flex items-center justify-between">
                      <span className="text-emerald-400 text-[11px] font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Ready for Instant Booking
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">No conflicts</span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
                    <button
                      onClick={() => onOpenBookingModal(vehicle.id)}
                      disabled={vehicle.status === 'IN_WORKSHOP'}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        vehicle.status === 'IN_WORKSHOP'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow hover:shadow-cyan-500/30'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{vehicle.status === 'IN_WORKSHOP' ? 'Locked (Workshop)' : 'Book Slot'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedVehicleFor3D(vehicle)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-600 text-xs font-semibold transition-all flex items-center space-x-1"
                      title="Inspect 3D Digital Twin & Sensor Telemetry"
                    >
                      <Box className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3D Model</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GANTT TIMELINE VIEW */
        <div className="rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl overflow-x-auto">
          <div className="min-w-[900px] p-4">
            {/* Timeline Header with Time Columns */}
            <div className="grid grid-cols-12 gap-1 pb-3 border-b border-slate-800 text-slate-400 text-xs font-mono">
              <div className="col-span-3 font-sans font-bold text-white">Prototype Vehicle</div>
              {timeSlots.slice(0, 9).map((time) => (
                <div key={time} className="col-span-1 text-center font-bold">
                  {time}
                </div>
              ))}
            </div>

            {/* Vehicle Schedule Rows */}
            <div className="divide-y divide-slate-800/60 mt-2">
              {filteredVehicles.map((v) => {
                const vehicleBookings = bookings.filter(
                  (b) => b.vehicleId === v.id && b.date === selectedDate && b.status !== 'CANCELLED'
                );

                return (
                  <div key={v.id} className="grid grid-cols-12 gap-1 py-3 items-center group hover:bg-slate-800/30 transition-colors">
                    {/* Vehicle Identity */}
                    <div className="col-span-3 pr-2">
                      <div className="flex items-center space-x-2">
                        <span
                          onClick={() => setSelectedVehicleFor3D(v)}
                          className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 cursor-pointer hover:border-cyan-500"
                          title="Open 3D Viewer"
                        >
                          {v.code}
                        </span>
                        <span
                          onClick={() => setSelectedVehicleFor3D(v)}
                          className="text-xs font-semibold text-white truncate max-w-[130px] cursor-pointer hover:text-cyan-300"
                        >
                          {v.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span className="capitalize">{v.status.toLowerCase().replace('_', ' ')}</span>
                        <span>·</span>
                        <span>SoC: {v.batterySoC}%</span>
                      </div>
                    </div>

                    {/* 9 Time Slot Columns */}
                    <div className="col-span-9 relative h-10 bg-slate-950/60 rounded border border-slate-800/60 flex items-center px-1">
                      {/* Grid background markers */}
                      <div className="absolute inset-0 grid grid-cols-9 divide-x divide-slate-800/40 pointer-events-none" />

                      {vehicleBookings.length === 0 ? (
                        <div
                          onClick={() => onOpenBookingModal(v.id)}
                          className="w-full h-full flex items-center justify-center text-[11px] text-slate-600 hover:text-cyan-400 hover:bg-cyan-950/20 cursor-pointer rounded transition-all font-medium"
                        >
                          + Click to book open slot on {selectedDate}
                        </div>
                      ) : (
                        vehicleBookings.map((b) => {
                          const isConflict = b.status === 'CONFLICT';
                          const isLive = b.status === 'IN_PROGRESS';
                          return (
                            <div
                              key={b.id}
                              className={`relative z-10 mx-1 px-2.5 py-1 rounded text-[11px] font-semibold truncate border shadow-md cursor-pointer transition-all hover:scale-[1.02] ${
                                isConflict
                                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
                                  : isLive
                                  ? 'bg-blue-900/80 border-blue-400 text-blue-100 animate-pulse'
                                  : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200'
                              }`}
                              title={`${b.driverName}: ${b.testConditionLabel} (${b.startTime}-${b.endTime})`}
                            >
                              <span className="font-mono mr-1">
                                {b.startTime}-{b.endTime}:
                              </span>
                              <span>
                                {b.driverName} ({b.testConditionLabel})
                              </span>
                              {isConflict && <span className="ml-1 text-rose-400 font-bold">[CONFLICT]</span>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3D Interactive Vehicle Inspector Modal */}
      {selectedVehicleFor3D && (
        <Vehicle3DViewer
          vehicle={selectedVehicleFor3D}
          onClose={() => setSelectedVehicleFor3D(null)}
          onBookSlot={(vId) => onOpenBookingModal(vId)}
        />
      )}
    </div>
  );
};
