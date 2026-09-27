# Osteofides Performance Monitor: design contract

## Product boundary

This is a course prototype of the **monitoring and analytics interface** around a future Osteofides safety system. It does not detect hazards, control a robot, or ingest real surgical telemetry. Every included record is synthetic.

## Contract

**Input:** a simulated safety-event record associated with a procedure case.

**Authoritative state:** the configured Supabase `public.safety_events` table. Until Supabase is configured, browser local storage is the explicitly labeled demo store.

**Output:** a filterable event log and metrics derived from the records currently loaded from that store.

## Record invariants

- Every event has a case ID, procedure, event type, severity, system response, outcome, and status.
- Severity is exactly `High`, `Medium`, or `Low`.
- Status is exactly `Active` or `Resolved`.
- A missing response time is represented as `null`; a supplied response time is a non-negative integer in milliseconds.
- The dashboard derives case count from distinct case IDs, event totals from loaded records, high-severity count from severity, successful response rate from recorded outcomes, and resolution rate from status.
- Editing, resolving/reopening, and deleting an event affect the same record represented in the log and in the derived metrics.
- If Supabase is configured and a request fails, the UI reports the failure; it does not claim a cloud write succeeded or silently switch data stores.

## Acceptance checks

1. App opens in demo mode and clearly identifies the records as synthetic.
2. Create a valid event; it appears in the log and changes the relevant metrics.
3. Edit the event; updated values appear after reload.
4. Resolve and reopen the event; active/resolved counts and resolution rate respond.
5. Delete the event; it disappears and the counts update.
6. Search and severity/status filters narrow the visible rows without changing aggregate totals.
7. Export produces a CSV of the currently filtered rows.
8. With valid Supabase setup, the same CRUD actions operate on the `safety_events` table. With invalid setup, an explicit connection error is shown.

## Deliberate limits

- No authentication is included because this assignment prototype contains synthetic engineering records only.
- Public anonymous CRUD policies are included solely to make the synthetic-data classroom demo simple. They are not suitable for clinical or production use.
- No patient identifiers, protected health information, or real procedure records belong in this app.
