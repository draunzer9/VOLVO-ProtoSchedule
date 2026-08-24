export type UserRole = 'RD_LEAD' | 'TEST_DRIVER' | 'WORKSHOP_TECH' | 'OVERVIEW';

export type VehicleStatus = 'AVAILABLE' | 'IN_TESTING' | 'PENDING_TRIAGE' | 'IN_WORKSHOP' | 'RESERVED' | 'OFFLINE';

export type PowertrainType = 
  | 'BEV' 
  | 'FCEV' 
  | 'Diesel_Hybrid' 
  | 'Autonomous_BEV' 
  | 'Electric_Heavy';

export type TestConditionType =
  | 'HIGHWAY_AERO'
  | 'OFF_ROAD_DURABILITY'
  | 'GRADIENT_15'
  | 'COLD_WEATHER_ARCTIC'
  | 'WET_SKIDPAD'
  | 'HIGH_ALTITUDE'
  | 'BATTERY_THERMAL_STRESS'
  | 'AUTONOMOUS_L3_SENSORS';

export interface Vehicle {
  id: string;
  code: string;
  name: string;
  model: string;
  category: string;
  powertrain: PowertrainType;
  status: VehicleStatus;
  depotLocation: string;
  batterySoC: number;
  odometerKm: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  activeIssuesCount: number;
  nextServiceKm: number;
  imageUrl: string;
  sensorsHealth: {
    lidar: number; // 0 - 100%
    radar: number;
    cameras: number;
    telemetry: boolean;
  };
  workshopPrepCompleted: boolean;
  activeSlotId?: string;
  lastUpdated: string;
}

export interface PostSessionReport {
  distanceDrivenKm: number;
  averageSpeedKmh: number;
  energyConsumedKwh: number;
  ambientTempC: number;
  behavioralAnomalies: string[];
  mechanicalNotes: string;
  driverRating: number;
  testResult: 'PASSED' | 'REPEAT_REQUIRED' | 'FLAGGED_FOR_WORKSHOP';
  submittedAt: string;
  signedOffByLead: boolean;
  leadNotes?: string;
  rAndDDirectiveNotes?: string;
  dispatchedToWorkshopAt?: string;
  dispatchedBay?: string;
  repairPriority?: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM';
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleCode: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  rAndDLead: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  testCondition: TestConditionType;
  testConditionLabel: string;
  targetMilestone: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CONFLICT';
  depotLocation: string;
  notes?: string;
  createdAt: string;
  postSessionReport?: PostSessionReport;
}

export interface CoverageCell {
  vehicleId: string;
  conditionType: TestConditionType;
  status: 'NOT_STARTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETE';
  completedDate?: string;
  completedByDriver?: string;
  signOffLead?: string;
  notes?: string;
  bookingId?: string;
}

export interface ConflictAlert {
  id: string;
  type: 'DOUBLE_BOOKING' | 'WORKSHOP_COLLISION' | 'SAFETY_RECALL' | 'UNSCHEDULED_SERVICE';
  severity: 'CRITICAL' | 'WARNING';
  vehicleId: string;
  vehicleCode: string;
  vehicleName: string;
  conflictingBookingIds: string[];
  detectedAt: string;
  description: string;
  suggestedAction: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionType?: 'REASSIGN' | 'RESCHEDULE' | 'CANCEL' | 'OVERRIDE';
  resolutionNotes?: string;
}

export interface WorkshopPrepChecklist {
  tirePressureChecked: boolean;
  telemetryLoggerMounted: boolean;
  ballastCalibrated: boolean;
  highVoltageSafetyVerified: boolean;
  firmwareFlashed: boolean;
  brakesInspected: boolean;
}

export interface WorkshopServiceWindow {
  id: string;
  vehicleId: string;
  vehicleCode: string;
  vehicleName: string;
  bayNumber: string;
  technicianName: string;
  serviceType: 'PRE_DRIVE_PREP' | 'SCHEDULED_SERVICE' | 'POST_DRIVE_INSPECTION' | 'EMERGENCY_REPAIR';
  date: string;
  startTime: string;
  endTime: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'READY_FOR_TEST' | 'COMPLETED';
  checklist: WorkshopPrepChecklist;
  findingsNotes?: string;
  rAndDDirectives?: string;
  dispatchedBy?: string;
  priority?: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM';
  reportedByDriverId?: string;
  reportedByDriverName?: string;
  originalBookingId?: string;
  loggedAt: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  read: boolean;
  category: 'BOOKING' | 'CONFLICT' | 'WORKSHOP' | 'COVERAGE' | 'TELEMETRY';
  actionLabel?: string;
  actionTab?: string;
}

export interface TestConditionMeta {
  type: TestConditionType;
  label: string;
  category: string;
  recommendedTrack: string;
  minimumDurationHours: number;
  description: string;
  badgeColor: string;
}

export interface PartRequisition {
  id: string;
  vehicleId: string;
  vehicleCode: string;
  vehicleName: string;
  partName: string;
  partNumber: string;
  category: 'BRAKES' | 'SENSORS_ADAS' | 'POWERTRAIN_HV' | 'SUSPENSION_STEERING' | 'FIRMWARE_ELECTRONICS' | 'OTHER';
  estimatedCostEur: number;
  leadTimeHours: number;
  urgency: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_ROUTINE';
  justification: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  approvalNotes?: string;
  allocatedBay?: string;
}

