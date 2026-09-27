# Life Black Box

A Turkish Expo companion app for a Deneyap Kart 1A health emergency wearable, with live vitals, demo BLE telemetry, emergency contacts, alerts, and local event history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/life-black-box/app/` — Expo Router screens for the dashboard, history, contacts, settings, and emergency modal
- `artifacts/life-black-box/context/AppContext.tsx` — shared telemetry, persistence, connection, and emergency state
- `artifacts/life-black-box/services/` — BLE protocol, AsyncStorage, SMS, and first-aid speech
- `artifacts/life-black-box/constants/` — thresholds and the dark/light Life Black Box palette
- `artifacts/life-black-box/README.md` — run instructions and BLE protocol reference

## Architecture decisions

- Demo telemetry is enabled by default so the entire emergency flow can be exercised without hardware.
- AsyncStorage is the source of truth for contacts, events, settings, and the local user profile; events are capped at 200 records.
- BLE is lazy-loaded and isolated behind the Nordic UART service so Expo Go/web previews remain usable while hardware builds can disable demo mode.
- Emergency SMS falls back to clipboard when SMS is unavailable, and first-aid guidance uses Turkish device speech when no audio asset is bundled.

## Product

The app monitors heart rate, SpO2, acceleration, temperature, humidity, and CO; shows a live heart-rate trend; provides a 10-second confirmation countdown; sends emergency SMS to up to five contacts; logs full sensor snapshots; and supports 112 call handoff.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
