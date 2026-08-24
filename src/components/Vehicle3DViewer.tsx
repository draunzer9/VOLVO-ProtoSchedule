'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Vehicle } from '@/types';
import { getStatusBadge, getPowertrainBadge } from '@/lib/utils';
import { useProtoSchedule } from '@/context/ProtoScheduleContext';
import {
  RotateCcw,
  Zap,
  ShieldCheck,
  Eye,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  BatteryCharging,
  Gauge,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Wind,
  Radio,
  Camera,
  Activity,
  Play,
  Pause,
  Focus,
  CornerUpRight,
  Sun,
  Moon,
  Send,
  FileText,
  Crosshair,
  AlertOctagon,
} from 'lucide-react';

export type SimulationMode = 'STUDIO' | 'FAULT_DIAGNOSTICS' | 'WIND_TUNNEL' | 'LIDAR_RAYCAST' | 'XRAY_POWERTRAIN' | 'EXPLODED';

interface Vehicle3DViewerProps {
  vehicle: Vehicle;
  onClose: () => void;
  onBookSlot?: (vehicleId: string) => void;
  anomalies?: string[];
  bookingIdForDispatch?: string;
  initialMode?: SimulationMode;
}

export const Vehicle3DViewer: React.FC<Vehicle3DViewerProps> = ({
  vehicle,
  onClose,
  onBookSlot,
  anomalies = [],
  bookingIdForDispatch,
  initialMode = 'STUDIO',
}) => {
  const { dispatchWorkshopWorkOrder, role } = useProtoSchedule();
  const mountRef = useRef<HTMLDivElement>(null);
  const [simMode, setSimMode] = useState<SimulationMode>(initialMode || (anomalies.length > 0 ? 'FAULT_DIAGNOSTICS' : 'STUDIO'));
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<'ORBIT' | 'FRONT' | 'SIDE' | 'ROOF' | 'UNDERBODY' | 'BRAKES' | 'LIDAR'>('ORBIT');
  const [selectedFaultPart, setSelectedFaultPart] = useState<string | null>(null);

  // Dispatch form inside 3D viewer for Maria
  const [directivesText, setDirectivesText] = useState<string>('');
  const [assignedBay, setAssignedBay] = useState<string>('Bay 01 - Autonomous & Sensor Lab');
  const [assignedPriority, setAssignedPriority] = useState<'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM'>('P0_CRITICAL');

  const statusInfo = getStatusBadge(vehicle.status);
  const ptInfo = getPowertrainBadge(vehicle.powertrain);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playProceduralSound = (type: 'EV_START' | 'LIDAR_SCAN' | 'AIR_PNEUMATIC' | 'FAULT_ALERT' | 'CLICK') => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      if (type === 'FAULT_ALERT') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        osc.frequency.setValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'EV_START') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 1.0);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
      } else if (type === 'AIR_PNEUMATIC') {
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'LIDAR_SCAN') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  const handleQuickDispatch = () => {
    if (!bookingIdForDispatch) return;
    const directives = directivesText || 'Inspect highlighted 3D mechanism anomalies, perform hardware recalibration, and verify safe for track.';
    dispatchWorkshopWorkOrder(bookingIdForDispatch, directives, assignedBay, assignedPriority);
    onClose();
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const rect = currentMount.getBoundingClientRect();
    const width = rect.width || currentMount.clientWidth || 800;
    const height = rect.height || currentMount.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b16);
    scene.fog = new THREE.FogExp2(0x060b16, 0.032);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(7.8, 3.8, 8.8);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    while (currentMount.firstChild) {
      currentMount.removeChild(currentMount.firstChild);
    }
    currentMount.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(6, 14, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const blueRimLight = new THREE.DirectionalLight(0x0077c8, 3.2);
    blueRimLight.position.set(-10, 6, -8);
    scene.add(blueRimLight);

    const faultWarningLight = new THREE.PointLight(0xf43f5e, 0, 15);
    faultWarningLight.position.set(0, 2.0, 1.5);
    scene.add(faultWarningLight);

    // Floor & Grid
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a101f, roughness: 0.18, metalness: 0.85 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(26, 26, 0x0077c8, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Vehicle Group
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    const baseColor =
      vehicle.powertrain === 'FCEV'
        ? 0x0284c7
        : vehicle.powertrain === 'Autonomous_BEV'
        ? 0x1e293b
        : vehicle.category.includes('Mining')
        ? 0xd97706
        : 0x004075;

    const paintMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      metalness: 0.86,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    });

    const darkAccentMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.35 });
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, transmission: 0.9, transparent: true, opacity: 0.75 });
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.9 });
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });

    // Diagnostic Materials
    const brakeCalipersMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.9,
    });
    const batteryPackMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      metalness: 0.85,
    });
    const lidarPodMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.4 });
    const steeringLinkageMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const thorsHammerLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const explodedParts: { mesh: THREE.Object3D; originY: number; targetOffset: number }[] = [];
    const windParticlesGroup = new THREE.Group();
    scene.add(windParticlesGroup);

    const lidarRaysGroup = new THREE.Group();
    scene.add(lidarRaysGroup);

    const faultRingsGroup = new THREE.Group();
    vehicleGroup.add(faultRingsGroup);

    const createWheel = (x: number, y: number, z: number, radius = 0.56, width = 0.4) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 28), tireMaterial);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      g.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.03, 20), rimMaterial);
      rim.rotation.z = Math.PI / 2;
      g.add(rim);

      // Brake Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.25), brakeCalipersMaterial);
      caliper.position.set(x > 0 ? -0.12 : 0.12, 0.22, 0.15);
      g.add(caliper);

      return g;
    };

    if (vehicle.category.includes('Heavy') || vehicle.code.includes('FH') || vehicle.code.includes('VNL')) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.45, 2.55, 2.8), paintMaterial);
      cab.position.set(0, 2.35, 0.6);
      cab.castShadow = true;
      vehicleGroup.add(cab);
      explodedParts.push({ mesh: cab, originY: 2.35, targetOffset: 1.2 });

      const aero = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.85, 2.6), paintMaterial);
      aero.position.set(0, 3.95, 0.5);
      vehicleGroup.add(aero);
      explodedParts.push({ mesh: aero, originY: 3.95, targetOffset: 2.2 });

      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.25, 0.06), glassMaterial);
      windshield.position.set(0, 2.75, 2.02);
      windshield.rotation.x = -0.2;
      vehicleGroup.add(windshield);

      const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.7, 1.1), darkAccentMaterial);
      bumper.position.set(0, 0.9, 2.0);
      vehicleGroup.add(bumper);

      const tLeft = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.05), thorsHammerLedMat);
      tLeft.position.set(-0.9, 1.0, 2.56);
      const tRight = tLeft.clone();
      tRight.position.x = 0.9;
      vehicleGroup.add(tLeft, tRight);

      // Chassis Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.38, 6.4), darkAccentMaterial);
      frame.position.set(0, 0.85, -1.1);
      vehicleGroup.add(frame);
      explodedParts.push({ mesh: frame, originY: 0.85, targetOffset: -0.3 });

      // Steering Tie-Rod Linkage Assembly
      const steeringRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 16), steeringLinkageMaterial);
      steeringRod.rotation.z = Math.PI / 2;
      steeringRod.position.set(0, 0.56, 1.3);
      vehicleGroup.add(steeringRod);

      // 800V Battery Saddles
      const batLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 2.6), batteryPackMaterial);
      batLeft.position.set(-1.2, 0.85, -0.65);
      const batRight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 2.6), batteryPackMaterial);
      batRight.position.set(1.2, 0.85, -0.65);
      vehicleGroup.add(batLeft, batRight);

      // Dual e-Motors
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16), batteryPackMaterial);
      motor.rotation.z = Math.PI / 2;
      motor.position.set(0, 0.65, -2.4);
      vehicleGroup.add(motor);

      // Wheels
      vehicleGroup.add(createWheel(-1.18, 0.56, 1.3));
      vehicleGroup.add(createWheel(1.18, 0.56, 1.3));
      vehicleGroup.add(createWheel(-1.18, 0.56, -1.8));
      vehicleGroup.add(createWheel(1.18, 0.56, -1.8));
      vehicleGroup.add(createWheel(-1.18, 0.56, -3.1));
      vehicleGroup.add(createWheel(1.18, 0.56, -3.1));

      // Roof LiDAR Pod
      const lidarPod = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.35), lidarPodMaterial);
      lidarPod.position.set(0, 3.75, 1.65);
      vehicleGroup.add(lidarPod);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, 4.5), paintMaterial);
      body.position.set(0, 0.95, 0);
      vehicleGroup.add(body);
      explodedParts.push({ mesh: body, originY: 0.95, targetOffset: 0.8 });

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.8, 2.6), glassMaterial);
      cabin.position.set(0, 1.8, -0.2);
      vehicleGroup.add(cabin);
      explodedParts.push({ mesh: cabin, originY: 1.8, targetOffset: 1.6 });

      const bat = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.28, 3.2), batteryPackMaterial);
      bat.position.set(0, 0.38, 0);
      vehicleGroup.add(bat);

      vehicleGroup.add(createWheel(-1.08, 0.48, 1.4, 0.48, 0.32));
      vehicleGroup.add(createWheel(1.08, 0.48, 1.4, 0.48, 0.32));
      vehicleGroup.add(createWheel(-1.08, 0.48, -1.4, 0.48, 0.32));
      vehicleGroup.add(createWheel(1.08, 0.48, -1.4, 0.48, 0.32));

      const lidarPod = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.28), lidarPodMaterial);
      lidarPod.position.set(0, 2.25, 0.9);
      vehicleGroup.add(lidarPod);
    }

    // 3D Fault Hazard Callout Rings
    const createFaultMarker = (x: number, y: number, z: number, color = 0xf43f5e) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.04, 16, 32),
        new THREE.MeshBasicMaterial({ color, wireframe: true })
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
      return g;
    };

    const brakeFaultMarker = createFaultMarker(-1.18, 0.6, 1.3, 0xf43f5e);
    const lidarFaultMarker = createFaultMarker(0, 3.85, 1.65, 0xe11d48);
    const steeringFaultMarker = createFaultMarker(0, 0.58, 1.3, 0xf59e0b);
    const batteryFaultMarker = createFaultMarker(1.2, 0.85, -0.65, 0xf97316);

    faultRingsGroup.add(brakeFaultMarker, lidarFaultMarker, steeringFaultMarker, batteryFaultMarker);

    // Wind particles & LiDAR rays
    const windCount = 90;
    const windGeo = new THREE.BufferGeometry();
    const windPositions = new Float32Array(windCount * 3);
    const windSpeeds = new Float32Array(windCount);
    for (let i = 0; i < windCount; i++) {
      windPositions[i * 3] = (Math.random() - 0.5) * 4.2;
      windPositions[i * 3 + 1] = Math.random() * 4.0 + 0.4;
      windPositions[i * 3 + 2] = Math.random() * 14 - 7;
      windSpeeds[i] = 0.22 + Math.random() * 0.25;
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));
    const windPoints = new THREE.Points(windGeo, new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.12, transparent: true, opacity: 0.85 }));
    windParticlesGroup.add(windPoints);

    const rayCount = 16;
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 2;
      const pts = [new THREE.Vector3(0, 3.7, 1.6), new THREE.Vector3(Math.cos(angle) * 7.0, 0.1, Math.sin(angle) * 7.0 + 1.8)];
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 }));
      lidarRaysGroup.add(line);
    }

    // Drag controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      vehicleGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.2, Math.min(8.5, camera.position.y - deltaY * 0.015));
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.006;
      camera.position.z = Math.max(4.5, Math.min(16.0, camera.position.z + zoomFactor));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        vehicleGroup.rotation.y += 0.006;
      }

      // DIAGNOSTIC FAULT HIGHLIGHTING
      if (simMode === 'FAULT_DIAGNOSTICS') {
        faultRingsGroup.visible = true;
        faultWarningLight.intensity = 2.5 + Math.sin(elapsedTime * 8) * 1.5;

        // Pulsate brake calipers
        const brakePulsate = 0.6 + Math.sin(elapsedTime * 6) * 0.5;
        brakeCalipersMaterial.color.setHex(0xf43f5e);
        brakeCalipersMaterial.emissive.setHex(0xf43f5e);
        brakeCalipersMaterial.emissiveIntensity = brakePulsate * 1.8;

        // Pulsate LiDAR pod
        const lidarPulsate = 0.5 + Math.cos(elapsedTime * 7) * 0.5;
        lidarPodMaterial.color.setHex(0xe11d48);
        lidarPodMaterial.emissive.setHex(0xe11d48);
        lidarPodMaterial.emissiveIntensity = lidarPulsate * 1.6;

        // Steering linkage pulsation
        steeringLinkageMaterial.color.setHex(0xf59e0b);
        steeringLinkageMaterial.emissive.setHex(0xf59e0b);
        steeringLinkageMaterial.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 5) * 0.6;

        // Rotate hazard markers
        brakeFaultMarker.rotation.z = elapsedTime * 2.0;
        lidarFaultMarker.rotation.z = -elapsedTime * 2.5;
        steeringFaultMarker.rotation.y = elapsedTime * 3.0;
        batteryFaultMarker.rotation.z = elapsedTime * 1.8;
      } else {
        faultRingsGroup.visible = false;
        faultWarningLight.intensity = 0;
        brakeCalipersMaterial.color.setHex(0x0284c7);
        brakeCalipersMaterial.emissive.setHex(0x0284c7);
        brakeCalipersMaterial.emissiveIntensity = 0.4;
        lidarPodMaterial.color.setHex(0x10b981);
        lidarPodMaterial.emissive.setHex(0x10b981);
        lidarPodMaterial.emissiveIntensity = 0.4;
        steeringLinkageMaterial.color.setHex(0x475569);
        steeringLinkageMaterial.emissive.setHex(0x000000);
      }

      if (simMode === 'WIND_TUNNEL') {
        windParticlesGroup.visible = true;
        const pos = windGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < windCount; i++) {
          pos[i * 3 + 2] -= windSpeeds[i];
          if (pos[i * 3 + 2] < -7) {
            pos[i * 3 + 2] = 7;
            pos[i * 3] = (Math.random() - 0.5) * 4.2;
            pos[i * 3 + 1] = Math.random() * 4.0 + 0.4;
          }
        }
        windGeo.attributes.position.needsUpdate = true;
      } else {
        windParticlesGroup.visible = false;
      }

      if (simMode === 'LIDAR_RAYCAST') {
        lidarRaysGroup.visible = true;
        lidarRaysGroup.rotation.y = elapsedTime * 3.2;
      } else {
        lidarRaysGroup.visible = false;
      }

      explodedParts.forEach((part) => {
        const targetY = simMode === 'EXPLODED' ? part.originY + part.targetOffset : part.originY;
        part.mesh.position.y += (targetY - part.mesh.position.y) * 0.1;
      });

      if (simMode === 'XRAY_POWERTRAIN' || simMode === 'FAULT_DIAGNOSTICS') {
        paintMaterial.opacity = simMode === 'FAULT_DIAGNOSTICS' ? 0.65 : 0.25;
        paintMaterial.transparent = true;
        batteryPackMaterial.emissiveIntensity = 1.3 + 0.3 * Math.sin(elapsedTime * 4);
      } else {
        paintMaterial.opacity = 1.0;
        paintMaterial.transparent = false;
        batteryPackMaterial.emissiveIntensity = 0.65;
      }

      thorsHammerLedMat.color.setHex(headlightsOn ? 0x38bdf8 : 0x1e293b);

      renderer.render(scene, camera);
    };

    animate();

    // Camera presets
    if (cameraView === 'FRONT') {
      camera.position.set(0, 2.0, 8.5);
      camera.lookAt(0, 1.3, 0);
    } else if (cameraView === 'SIDE') {
      camera.position.set(9.5, 2.2, 0);
      camera.lookAt(0, 1.3, 0);
    } else if (cameraView === 'ROOF' || cameraView === 'LIDAR') {
      camera.position.set(0, 7.5, 3.2);
      camera.lookAt(0, 3.5, 1.6);
    } else if (cameraView === 'BRAKES') {
      camera.position.set(-3.5, 1.2, 2.5);
      camera.lookAt(-1.18, 0.56, 1.3);
    } else if (cameraView === 'UNDERBODY') {
      camera.position.set(4.8, 0.9, 4.8);
      camera.lookAt(0, 0.6, 0);
    }

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(currentMount);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      if (currentMount.contains(domEl)) {
        currentMount.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, [vehicle, autoRotate, simMode, headlightsOn, cameraView]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in zoom-in-95">
      <div className="w-full max-w-7xl h-[92vh] max-h-[860px] rounded-2xl bg-[#070D18] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,119,200,0.25)] flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#003057] to-[#0077C8] border border-cyan-400 shadow-glow shrink-0">
              <svg width="22" height="22" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18" />
                <path d="M3 12h18" />
                <path d="m18 6 3-3m0 0h-4m4 0v4" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700">
                  {vehicle.code}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-white">{vehicle.name}</h2>
                <span className={`hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold border ${ptInfo.color}`}>
                  {ptInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Volvo 5D Digital Twin Diagnostic Inspector · {vehicle.depotLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) playProceduralSound('EV_START');
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all ${
                audioEnabled
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 shadow-glow'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden md:inline text-[11px]">Audio: {audioEnabled ? 'ON' : 'MUTED'}</span>
            </button>

            <span className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              <span>{statusInfo.label}</span>
            </span>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Body Layout */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: 3D Viewport (65% width on desktop) */}
          <div className="w-full lg:w-[65%] h-[48vh] lg:h-full relative overflow-hidden bg-[#050914] flex flex-col">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Diagnostic Overlay HUD when in FAULT_DIAGNOSTICS mode */}
            {simMode === 'FAULT_DIAGNOSTICS' && (
              <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-500/70 shadow-glowRose pointer-events-auto">
                <div className="flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    3D Mechanism Failure Highlighting Active
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-[10px] font-mono">
                  <button
                    onClick={() => {
                      setCameraView('BRAKES');
                      setSelectedFaultPart('Braking Calipers');
                      playProceduralSound('FAULT_ALERT');
                    }}
                    className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700"
                  >
                    Focus Brakes
                  </button>
                  <button
                    onClick={() => {
                      setCameraView('LIDAR');
                      setSelectedFaultPart('Roof LiDAR');
                      playProceduralSound('FAULT_ALERT');
                    }}
                    className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700"
                  >
                    Focus LiDAR
                  </button>
                  <button
                    onClick={() => {
                      setCameraView('UNDERBODY');
                      setSelectedFaultPart('HV Battery & Steering');
                      playProceduralSound('FAULT_ALERT');
                    }}
                    className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700"
                  >
                    Focus Chassis
                  </button>
                </div>
              </div>
            )}

            {/* Camera Presets Top Right (if not in fault banner) */}
            {simMode !== 'FAULT_DIAGNOSTICS' && (
              <div className="absolute top-3 right-3 flex items-center space-x-1 p-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-800">
                {(['ORBIT', 'FRONT', 'SIDE', 'ROOF', 'UNDERBODY'] as const).map((cam) => (
                  <button
                    key={cam}
                    onClick={() => {
                      setCameraView(cam);
                      playProceduralSound('CLICK');
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                      cameraView === cam
                        ? 'bg-cyan-600 text-white shadow-glow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cam}
                  </button>
                ))}
              </div>
            )}

            {/* 5D Simulation Modes Bottom Toolbar */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800">
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <button
                  onClick={() => {
                    setSimMode('FAULT_DIAGNOSTICS');
                    playProceduralSound('FAULT_ALERT');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                    simMode === 'FAULT_DIAGNOSTICS' ? 'bg-rose-600 text-white shadow-glowRose animate-pulse' : 'text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Fault Diagnostics</span>
                </button>

                <button
                  onClick={() => {
                    setSimMode('STUDIO');
                    playProceduralSound('CLICK');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                    simMode === 'STUDIO' ? 'bg-cyan-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Showroom</span>
                </button>

                <button
                  onClick={() => {
                    setSimMode('WIND_TUNNEL');
                    playProceduralSound('AIR_PNEUMATIC');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                    simMode === 'WIND_TUNNEL' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wind className="w-3 h-3 text-cyan-300" />
                  <span>Aero Streamlines</span>
                </button>

                <button
                  onClick={() => {
                    setSimMode('LIDAR_RAYCAST');
                    playProceduralSound('LIDAR_SCAN');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                    simMode === 'LIDAR_RAYCAST' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3 h-3 text-emerald-300" />
                  <span>LiDAR Scan</span>
                </button>

                <button
                  onClick={() => {
                    setSimMode('XRAY_POWERTRAIN');
                    playProceduralSound('EV_START');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                    simMode === 'XRAY_POWERTRAIN' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3 text-purple-300" />
                  <span>800V X-Ray</span>
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setHeadlightsOn(!headlightsOn)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    headlightsOn ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-500'
                  }`}
                >
                  LEDs: {headlightsOn ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    autoRotate ? 'bg-slate-800 text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  Spin: {autoRotate ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: R&D Directives & Work Order Dispatch Panel (35% width on desktop) */}
          <div className="w-full lg:w-[35%] h-auto lg:h-full bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 space-y-3.5 overflow-y-auto">
            {/* If opening to triage & dispatch a work order */}
            {bookingIdForDispatch ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Crosshair className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      R&amp;D Work Order Dispatch
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400">Step 2 of 3</span>
                </div>

                {/* Highlighted Driver Anomalies */}
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold text-rose-300 uppercase block">
                    Reported Mechanical Failures:
                  </span>
                  {anomalies.length > 0 ? (
                    <ul className="space-y-1">
                      {anomalies.map((a, i) => (
                        <li key={i} className="text-white text-[11px] flex items-start space-x-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-300 text-[11px] italic">Driver requested post-session workshop inspection.</p>
                  )}
                </div>

                {/* Maria's Directives Input */}
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-cyan-300 block">
                    Maria&apos;s Technical Directives for Lars (Technician):
                  </label>
                  <textarea
                    value={directivesText}
                    onChange={(e) => setDirectivesText(e.target.value)}
                    placeholder="e.g. Inspect front brake caliper thermal fade, replace pads with high-friction track compound, recalibrate LiDAR tilt by +1.2°..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />

                  {/* Preset Suggestions */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Calibrate LiDAR mounting bracket tilt (+1.2°)',
                      'Replace front brake pads with track compound & bleed lines',
                      'Flash ECU/TCU firmware patch v4.2.1 for regen torque curve',
                    ].map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDirectivesText(directivesText ? `${directivesText}; ${sugg}` : sugg)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bay & Priority Selection */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Target Bay</label>
                    <select
                      value={assignedBay}
                      onChange={(e) => setAssignedBay(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    >
                      <option value="Bay 01 - Autonomous & Sensor Lab">Bay 01 - Sensor Lab</option>
                      <option value="Bay 02 - Heavy Rig & Powertrain">Bay 02 - Heavy Rig</option>
                      <option value="Bay 03 - Post-Drive Intake">Bay 03 - Intake</option>
                      <option value="Bay 04 - High-Voltage Lab">Bay 04 - HV Lab</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Repair Priority</label>
                    <select
                      value={assignedPriority}
                      onChange={(e) => setAssignedPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-amber-400 font-bold"
                    >
                      <option value="P0_CRITICAL">P0 - Track Blocker</option>
                      <option value="P1_HIGH">P1 - High Priority</option>
                      <option value="P2_MEDIUM">P2 - Medium</option>
                    </select>
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="pt-2">
                  <button
                    onClick={handleQuickDispatch}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-glowAmber transition-all active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Work Order to Lars Directly</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Telemetry View */
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Calibration Telemetry</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● 5G CAN Bus</span>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Pack SoC</span>
                    <span className="text-sm font-bold text-cyan-400 flex items-center mt-0.5">
                      <BatteryCharging className="w-3.5 h-3.5 mr-1" />
                      {vehicle.batterySoC}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Odometer</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {vehicle.odometerKm.toLocaleString()} km
                    </span>
                  </div>
                </div>

                {/* ADAS Multi-Sensor Health */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-1">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ADAS Sensor Array</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">ASIL-D</span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-0.5">
                        <span className="text-slate-400">Roof LiDAR (1550nm)</span>
                        <span className="text-emerald-400 font-mono font-bold">{vehicle.sensorsHealth.lidar}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full shadow-glow" style={{ width: `${vehicle.sensorsHealth.lidar}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-0.5">
                        <span className="text-slate-400">4D Imaging Radar (77 GHz)</span>
                        <span className="text-cyan-400 font-mono font-bold">{vehicle.sensorsHealth.radar}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${vehicle.sensorsHealth.radar}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Slot Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      if (onBookSlot) onBookSlot(vehicle.id);
                    }}
                    disabled={vehicle.status === 'IN_WORKSHOP'}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-glow transition-all flex items-center justify-center space-x-2 ${
                      vehicle.status === 'IN_WORKSHOP'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-[#0077C8] to-[#009FE3] hover:from-[#008AE0] hover:to-[#00B4FF] text-white active:scale-95'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{vehicle.status === 'IN_WORKSHOP' ? 'Locked (In Workshop)' : 'Book Prototype Test Slot'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
