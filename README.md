# Osteofides Performance Monitor

A course prototype dashboard for reviewing simulated safety-system events across autonomous surgical procedure cases. It represents the downstream monitoring and analytics layer around Osteofides. It does not connect to a robot, detect hazards, or ingest clinical telemetry. This is a sub-application to the overarching product development of a Stryker Robotics funded project within an Engineering Design course series at Florida Atlantic University, 2026. 

## About

A performance-monitoring dashboard for clinicians and robotic engineers to review how the Osteofides safety system performed across multiple surgical cases. The underlying safety system audits procedural activity, detects and logs safety-relevant events, and records its responses. Those records are then aggregated into the dashboard so users can analyze performance over time, inspect individual events, and identify trends or recurring failure modes.

**All included records are synthetic. Do not enter patient information or use this prototype for clinical decisions.**

- **Live application:** osteofides-performance-monitor.netlify.app
- **Public GitHub repository:** _Pending repository creation_
- **Unlisted demo video:** _Pending recording_

## Data Flow

Surgical procedure → Osteofides safety system → event/performance logs → database → analytics dashboard.

## Data Output

TOTAL CASES          
SAFETY EVENTS        
HIGH-SEVERITY        
SUCCESSFUL RESPONSE  
ACTIVE EVENTS 

## Features

- Summary of procedure cases, safety events, high-severity events, successful responses, and open/resolved events
- Event pattern counts derived from the records
- Search and severity/status filters
- Full CRUD for safety-event records, including resolve/reopen actions
- CSV export of the filtered event log
- Local demo mode that works without an account or setup
- Optional Supabase persistence using the REST API

## Technologies

- HTML, CSS, and vanilla JavaScript
- Supabase Postgres REST API (optional live persistence)
- Browser local storage for the explicitly labeled demo mode

## AI-assisted workflow

The implementation was developed with an AI coding assistant from a written product boundary and data contract. The contract and acceptance checks were established before the UI and data operations. Core behavior was then smoke-checked for seeded metrics, create, edit, resolve/reopen, delete, and filtering. Review the generated code and test the deployed Supabase flow yourself before submitting; do not describe the simulated dashboard as a validated clinical system.

## Run locally

No package installation or build step is needed. From this directory, run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The app opens with simulated demo records. Changes in demo mode are stored in this browser only.

## Connect Supabase


The assignment prototype intentionally allows anonymous CRUD so the synthetic-data workflow is easy to demonstrate. Anyone with the deployed app can access data allowed by these policies. Use only synthetic records. A real clinical or production system would require authentication, user-specific authorization, security review, audit controls, and a different deployment model.

To return to browser-only data, choose **Use local demo data** in Data connection.

## Project structure

```text
.
├── index.html              # Application structure and dialogs
├── styles.css              # Responsive visual system
├── app.js                  # State, rendering, CRUD, filters, export, and Supabase REST calls
├── config.js               # Public Supabase URL and publishable key for fresh visitors
├── supabase/schema.sql     # Table, constraints, RLS policies, and synthetic seed data
└── DESIGN_CONTRACT.md      # Product boundary, invariants, and acceptance checks
```

## Validation checklist

- [ ] Create an event and confirm its appearance and metric updates.
- [ ] Edit it and confirm the changed data appears.
- [ ] Resolve, reopen, and delete it.
- [ ] Search and filter the log; confirm aggregate metrics still describe all loaded events.
- [ ] Export a filtered CSV.
- [ ] In connected mode, refresh and confirm changes persisted in Supabase.
