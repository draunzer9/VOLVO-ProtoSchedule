# PRODUCT REQUIREMENTS DOCUMENT

# ProtoSchedule
## Prototype Test Drive Scheduler
**Volvo Group · Connected Services · Prototype Validation**

| Field | Details |
|---|---|
| Product Name | ProtoSchedule |
| Author | [Your Name] — Software Developer / PM Candidate |
| Version | 1.0 — MVP |
| Date | August 2026 |
| Status | Draft for Portfolio Review |
| Target Users | Test Drivers, R&D Leads, Workshop Teams |

## 1. Executive Summary

Prototype vehicles at Volvo require rigorous, varied test drives across diverse conditions — highway, off-road, gradient, cold weather, and more. Today, scheduling these test drives is managed through spreadsheets and email chains. The result: double bookings, vehicles sitting idle, test drivers waiting with no assignment, and R&D leads with no clear visibility into test coverage progress.

ProtoSchedule is an internal web application that centralises prototype vehicle scheduling, surfaces real-time vehicle availability, and tracks test completion — giving every stakeholder a single source of truth.

### Problem in Numbers (User Research)

- 67% of test drivers experienced at least one wasted trip (vehicle unavailable) in the past month
- Average prototype vehicle utilisation: 54% (target: 85%+)
- R&D leads spend ~3 hrs/week manually compiling test coverage status
- 4 of 6 double-booking incidents in last quarter caused >1 day validation delays

## 2. User Research

### 2.1 Research Methods

Research was conducted over 3 weeks using three methods:

• Interviews: 12 participants (5 test drivers, 4 R&D leads, 3 workshop technicians)

• Shadowing: Observed 3 full test scheduling cycles end-to-end

• Artifact analysis: Reviewed 6 months of booking spreadsheets and email threads

### 2.2 Key User Personas

| Test Driver — Arjun | R&D Lead — Maria | Workshop Tech — Lars |
| --- | --- | --- |
| Goal: Know which vehicle to pick up and when<br>Pain: Arrives at depot, vehicle is taken or in workshop<br>Need: Real-time vehicle status + easy booking | Goal: Ensure all test scenarios are covered on schedule<br>Pain: No live view of what's been tested vs. pending<br>Need: Test coverage dashboard + conflict alerts | Goal: Know upcoming service needs to plan workshop capacity<br>Pain: Surprised by vehicles arriving mid-schedule with no notice<br>Need: Visibility into vehicle schedule + service windows |

### 2.3 Key Research Findings

• The spreadsheet is always out of date. No one trusts it — so no one uses it correctly. (R&D Lead, Interview 2) Finding 1 — Visibility is the core gap:

• Drivers only discover a double-booking when they physically arrive. There is no pre-emptive check. Finding 2 — Conflict detection is manual:

• R&D leads have no automated way to know which test conditions have been completed; they compile this from memory and email. Finding 3 — Test coverage is invisible:

• Workshop technicians find out a vehicle needs servicing when it shows up, disrupting their planned schedule. Finding 4 — Workshop is last to know:

## 3. Problem Framing

### Problem Statement

> Prototype vehicle testing at Volvo is delayed and inefficient because there is no centralised, real-time system for scheduling test drives, tracking vehicle availability, or monitoring test coverage — forcing teams to rely on manual spreadsheets that are always out of date, creating conflicts, idle vehicles, and invisible gaps in the validation plan.

### 3.1 How Might We (HMW) Questions

• HMW make it effortless for test drivers to see which vehicles are available right now?

• HMW give R&D leads a live view of test coverage without manual compilation?

• HMW prevent double-bookings before they happen rather than discovering them on arrival?

• HMW give workshop teams enough advance notice to plan service capacity effectively?

### 3.2 Jobs To Be Done

| User | When… | I want to… | So I can… |
| --- | --- | --- | --- |
| Test Driver | I'm assigned a test session | See which vehicle is available for my time slot | Arrive prepared and not waste a trip |
| R&D Lead | I review validation progress | See which test conditions are complete vs. pending | Identify gaps and re-prioritise resources |
| Workshop Tech | I plan my week | See scheduled vehicle usage and upcoming service windows | Prepare workshop capacity in advance |
| R&D Lead | Two drivers book the same vehicle | Get an automatic conflict alert | Resolve it before anyone wastes time |

## 4. Market Research & Competitive Landscape

### 4.1 Existing Solutions Considered

| Solution | What it does | Why it doesn't fit |
| --- | --- | --- |
| Google Calendar / Outlook | Generic calendar booking | No vehicle-specific status, no test tracking, no conflict logic for shared assets |
| Fleet management tools (Samsara, Fleetio) | Commercial fleet tracking + scheduling | Built for production fleets, not prototype R&D workflows; no test coverage tracking |
| Jira / Asana | Task & project tracking | Not built for resource (vehicle) scheduling; no real-time availability view |
| Custom spreadsheets (current) | Manual tracking | No real-time sync, no conflict detection, always outdated, no coverage view |
| VEMS / internal Volvo tools | Vehicle lifecycle tracking | Tracks build milestones, not test drive scheduling |

### 4.2 Key Insight from Market Research

No off-the-shelf tool addresses the specific intersection of: prototype vehicle status + test drive booking + route/condition coverage tracking. This is a custom internal tool opportunity — and a clear gap that justifies building ProtoSchedule.

### Build vs. Buy Decision

- **Buy:** No tool covers all 3 needs (booking + status + coverage tracking) without heavy customisation
- **Build:** Core scheduling + status logic is well-understood; test coverage tracking is uniquely Volvo-specific
- **Decision:** Build MVP internally; evaluate commercial tools again at scale (>50 prototype vehicles)

## 5. Solution Overview

### 5.1 Product Vision

ProtoSchedule is the single source of truth for prototype vehicle availability and test drive scheduling at Volvo — giving every team real-time visibility, eliminating conflicts, and making test coverage gaps immediately visible.

### 5.2 Core Features — MVP

| Feature | Description | Primary User |
| --- | --- | --- |
| Vehicle Availability View | Real-time status board: Available / In Testing / In Workshop / Reserved. Filterable by vehicle type and date. | Test Driver, R&D Lead |
| Slot Booking | Test drivers book a vehicle + time slot + test route/condition. Confirms instantly if available. | Test Driver |
| Conflict Detection | System blocks double-bookings in real time and alerts if a vehicle goes into workshop during a booked slot. | All users |
| Test Coverage Tracker | Visual dashboard showing which route/condition combinations have been completed vs. pending per vehicle. | R&D Lead |
| Workshop Visibility | Workshop team sees upcoming bookings and can flag service windows that block availability. | Workshop Tech |
| Notifications | Email + in-app alerts for: booking confirmed, conflict detected, vehicle status changed, test session upcoming. | All users |

### 5.3 Out of Scope — MVP

• Mobile app (web-responsive only for MVP)

• Integration with Volvo HR systems for driver scheduling

• Automated route planning or GPS tracking during test drives

• Vehicle telemetry / sensor data integration (Phase 2)

• External stakeholder access (e.g. supplier test observers)

## 6. User Stories & Acceptance Criteria

### US-01 — Vehicle Availability View

As a test driver, I want to see which prototype vehicles are available on a given date, so I can choose one that fits my test requirements without wasting a trip.

| Acceptance Criteria<br>• Vehicle status (Available / In Testing / In Workshop / Reserved) visible on dashboard without login friction<br>• Status updates in real time — delay < 30 seconds from status change<br>• Filterable by date range, vehicle model, and test condition type<br>• Colour-coded status indicators (green/amber/red/grey) |
| --- |

### US-02 — Booking a Test Slot

As a test driver, I want to book a specific vehicle for a time slot and test route, so I have a confirmed reservation and know the vehicle will be available.

| Acceptance Criteria<br>• Booking takes < 3 clicks from vehicle availability view<br>• Confirmation shown immediately; confirmation email sent within 60 seconds<br>• System prevents booking if vehicle is unavailable for selected slot<br>• Driver can select test route type (highway / off-road / gradient / cold weather / custom)<br>• Bookings visible immediately to R&D lead and workshop team |
| --- |

### US-03 — Conflict Detection

As an R&D lead, I want the system to automatically detect and alert me to scheduling conflicts, so no two drivers show up for the same vehicle at the same time.

| Acceptance Criteria<br>• Double-booking attempt blocked in real time with clear error message<br>• If vehicle enters workshop during a booked slot, both driver and R&D lead are notified within 5 minutes<br>• Conflict log visible to R&D lead with resolution options (reassign / cancel / reschedule)<br>• Zero silent conflicts — every conflict surfaces as a notification |
| --- |

### US-04 — Test Coverage Dashboard

As an R&D lead, I want to see which test route/condition combinations have been completed for each prototype vehicle, so I can identify coverage gaps and re-prioritise.

| Acceptance Criteria<br>• Coverage matrix: rows = test conditions, columns = vehicles; cells show Complete / Scheduled / Not Started<br>• Exportable to CSV for reporting<br>• Filters by vehicle, date range, test condition type<br>• Updates automatically when a test drive booking is marked complete |
| --- |

### 6.1 Full Responsibility Map — All 3 Roles

| Action | R&D Lead | Workshop Tech | Test Driver |
| --- | --- | --- | --- |
| Define test plan & conditions | Decides | — | — |
| Assign driver to vehicle + route | Decides | — | — |
| Prepare / service vehicle | — | Executes | — |
| Drive the vehicle in test | — | — | Executes |
| Report vehicle anomalies | — | Mechanical | Behavioural |
| Update vehicle status in app | — | Executes | Session start/end |
| Flag safety concern | Final call | Raises | Raises |
| Sign off test completion | Decides | — | — |
| Submit post-session report | — | — | Executes |

### 6.2 End-to-End Test Drive Workflow

1. **R&D Lead creates test plan**
2. **R&D Lead assigns vehicle + route + time slot to Test Driver**
3. **Workshop Tech receives prep instructions → prepares vehicle → marks "Ready"**
4. **Test Driver sees assignment → confirms → picks up vehicle → starts session**
5. **Test Driver completes drive → submits session report → returns vehicle**
6. **Workshop Tech receives vehicle → checks condition → marks "Available" or "In Service"**
7. **R&D Lead reviews session report → marks test condition as "Complete" or "Repeat"**

## 7. Prioritisation

### 7.1 Framework — Impact vs. Effort

Features were prioritised using a 2x2 Impact vs. Effort matrix, scored with input from R&D leads and test drivers during research sessions.

| Feature | User Impact | Effort | Priority | Release |
| --- | --- | --- | --- | --- |
| Vehicle Availability View | High | Low | P0 | MVP |
| Slot Booking | High | Medium | P0 | MVP |
| Conflict Detection | High | Medium | P0 | MVP |
| Notifications (conflict + booking) | High | Low | P0 | MVP |
| Test Coverage Dashboard | High | Medium | P1 | MVP |
| Workshop Visibility | Medium | Low | P1 | MVP |
| Mobile App | Medium | High | P2 | Phase 2 |
| GPS tracking during test | Low | Very High | P3 | Phase 3 |
| HR system integration | Low | High | P3 | Phase 3 |

### 7.2 MoSCoW Summary

| Priority | Features |
| --- | --- |
| Must Have | Vehicle availability view, slot booking, conflict detection, notifications |
| Should Have | Test coverage dashboard, workshop visibility panel |
| Could Have | CSV export, advanced filters, booking history |
| Won't Have (MVP) | Mobile app, GPS tracking, HR integration, external access |

## 8. Key Trade-offs & Decisions

### Trade-off 1 — Real-time vs. Near-real-time Vehicle Status

- • Option A: True real-time (WebSocket push) — always up to date, higher infrastructure complexity
• Option B: Poll every 30 seconds — simpler to build, acceptable latency for this use case
• Decision: Option B for MVP. A 30-second delay is tolerable when booking is done hours/days ahead. Revisit for live depot view in Phase 2.

### Trade-off 2 — Build Custom vs. Extend Existing Lifecycle App

- • Option A: Build ProtoSchedule as a standalone web app — cleaner UX, independent deployment, but another tool for users to learn
• Option B: Extend existing vehicle lifecycle app with scheduling module — lower adoption friction, but adds complexity to a production system
• Decision: Standalone MVP. Proved in research that users prefer a focused tool. Plan integration with lifecycle app post-MVP validation.

### Trade-off 3 — Open Booking vs. R&D Lead Approval Flow

- • Option A: Test drivers book freely (self-serve) — faster, less friction, but R&D leads lose control over test prioritisation
• Option B: All bookings require R&D lead approval — full control, but adds latency and creates a bottleneck
• Option C: Self-serve booking with R&D lead visibility and override ability — balances speed and control
• Decision: Option C. Drivers book freely; R&D leads get instant notification and can cancel/reassign with one click.

### Trade-off 4 — How to Handle Workshop Conflicts

- • Option A: Hard block — workshop service automatically cancels test bookings. Simple but disrupts drivers with no notice.
• Option B: Soft alert — workshop flags a service window; system warns driver and R&D lead but doesn't auto-cancel
• Decision: Option B for MVP. Keeps humans in the loop for vehicle decisions. Hard block added in Phase 2 once trust in the system is established.

## 9. Success Metrics & Outcomes

### 9.1 North Star Metric

• North Star: Prototype vehicle utilisation rate — target 85%+ (up from 54% baseline)

### 9.2 KPIs by User Group

| Metric | Baseline | MVP Target | Measured By |
| --- | --- | --- | --- |
| Vehicle utilisation rate | 54% | ≥ 85% | Booked hours / available hours per vehicle |
| Double-booking incidents/month | 4 | 0 | Conflict log in system |
| Wasted driver trips/month | ~8 | ≤ 1 | Reported via post-session feedback |
| R&D test coverage report time | ~3 hrs/week | < 15 min | Self-reported by R&D leads |
| User adoption (DAU/MAU) | — | ≥ 70% | App analytics |
| Booking completion rate | — | ≥ 90% | Bookings marked complete / total bookings |

### 9.3 Launch Guardrails

• Zero undetected double-bookings in first 30 days post-launch

• No P0 bugs causing data loss or incorrect vehicle status

• System uptime ≥ 99% during business hours

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Low adoption — teams revert to spreadsheets | Medium | High | Run change management sessions; seed with R&D lead champions; deprecate shared spreadsheet post-pilot |
| Vehicle status inaccurate if not updated | High | High | Make status update the default action when returning a vehicle; add workshop-side status update flow |
| Workshop conflicts not flagged in time | Medium | Medium | Workshop team required to log service windows 24hrs ahead; system alerts if not done |
| Scope creep from HR/GPS requests | High | Medium | PRD explicitly marks these as Phase 3; PM to hold the line at steering reviews |
| Single point of failure (standalone app) | Low | High | Cloud-hosted with 99% SLA; daily data backups |

## 11. Roadmap & Timeline

| Phase | Timeline | Deliverables |
| --- | --- | --- |
| Discovery & Design | Weeks 1–3 | User research complete, wireframes validated with 3 test drivers and 2 R&D leads |
| MVP Build | Weeks 4–9 | Vehicle availability view, booking, conflict detection, notifications, coverage dashboard |
| Pilot Launch | Week 10 | Rollout to 1 prototype team (5 drivers, 2 R&D leads, 1 workshop tech) |
| Pilot Review | Weeks 11–12 | Measure KPIs, gather feedback, fix P0/P1 bugs |
| Full Launch | Week 13 | Rollout to all active prototype validation teams |
| Phase 2 Planning | Week 14+ | Mobile app, lifecycle app integration, hard workshop conflict blocks |

## 12. Open Questions

• Who owns vehicle status updates when both workshop and test teams have access — is there a single owner per vehicle?

• Should cancelled bookings be visible in history for audit purposes, or deleted?

• What is the policy when a vehicle goes into unplanned emergency service mid-booking? Who has authority to cancel?

• Will the system need to support multiple depot locations in Phase 1 or is a single depot sufficient for MVP?

• Should test drivers be able to book on behalf of other drivers, or is booking always self-serve?

---

ProtoSchedule PRD v1.0  •  [Your Name]  •  [your.email@email.com]  •  Volvo Group, Connected Services
