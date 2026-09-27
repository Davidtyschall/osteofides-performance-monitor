# Osteofides Performance Monitor

A course prototype dashboard for reviewing simulated safety-system events across autonomous surgical procedure cases. It represents the downstream monitoring and analytics layer around Osteofides. It does not connect to a robot, detect hazards, or ingest clinical telemetry.

**All included records are synthetic. Do not enter patient information or use this prototype for clinical decisions.**

- **Live application:** _Pending deployment_
- **Public GitHub repository:** _Pending repository creation_
- **Unlisted demo video:** _Pending recording_

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

1. Create a free Supabase project.
2. In its SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the `safety_events` table, row-level-security policies, and three synthetic seed events.
3. In Supabase Project Settings → API, copy the Project URL and the anon/publishable key. **Never use a service-role key in the browser.**
4. In the dashboard, select **Data connection** and enter those two values.
5. Confirm that the connection badge says **Supabase connected**, then create, edit, resolve/reopen, and delete a test event. Refresh the page to verify cloud persistence.

The assignment prototype intentionally allows anonymous CRUD so the synthetic-data workflow is easy to demonstrate. Anyone with the project URL and anon key can access data allowed by these policies. Use only synthetic records. A real clinical or production system would require authentication, user-specific authorization, security review, audit controls, and a different deployment model.

To return to browser-only data, choose **Use local demo data** in Data connection.

## Project structure

```text
.
├── index.html              # Application structure and dialogs
├── styles.css              # Responsive visual system
├── app.js                  # State, rendering, CRUD, filters, export, and Supabase REST calls
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

## 3–5 minute demo outline

1. **0:00–0:30 — Purpose:** Introduce Osteofides Performance Monitor as a prototype analytics layer and state that the records are synthetic.
2. **0:30–1:10 — Dashboard:** Show case/event totals, severity count, response percentage, event patterns, and open-event status.
3. **1:10–2:25 — CRUD:** Record a test event, edit it, resolve and reopen it, then delete it. Show the dashboard metrics and filtered log responding.
4. **2:25–3:10 — Database:** In Supabase, show the `safety_events` table and the test record changes. Return to the deployed app and refresh to demonstrate persistence.
5. **3:10–4:15 — Code walkthrough:** Show `index.html`, `styles.css`, `app.js`, and `supabase/schema.sql`. Explain the table contract, row-level security choices, and why local demo mode is separate from connected mode.
6. **4:15–4:30 — Close:** Restate the prototype boundary and where the app could fit in the larger safety-system workflow.

Record against the deployed URL, not localhost, and set YouTube visibility to **Unlisted** before adding its link above.
- [ ] Deploy the completed app and use the deployed URL in the 3–5 minute demo video.

## Assignment deliverables still to complete

- Publish this project in a **public GitHub repository** with meaningful commits.
- Deploy the finished app (Netlify is suggested in the assignment).
- Record an **unlisted 3–5 minute YouTube demo** of the deployed app, database CRUD, and project structure; link it here.

These external account actions require the owner's GitHub, Supabase, Netlify, and YouTube accounts. The source and database setup are prepared here; add the final repository, deployment, and video links after publishing.
