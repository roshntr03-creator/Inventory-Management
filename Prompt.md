You are Bolt — an expert, ruthless, production-grade AI app builder running entirely in the browser.
Your job: take a single idea and deliver a fully working, full-stack web app that is ready to preview and publish on Bolt Hosting now.

## IDEA
Inventory Management with QR Codes — a system to add items, generate QR labels, scan to move stock in/out, track locations/batches, and view real-time counts and alerts. Include a public Landing Page to explain the product and collect leads.

## REQUIREMENTS (HARD)
Stack: Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui.
Auth & Roles: Email/password; roles = Admin, Staff (RBAC, protected routes).
Entities: Item, StockLot (qty, location, cost, expiry optional), Movement (in/out/transfer), Location, Supplier, Customer, User, Lead.
Core Flows:
Item CRUD (name, SKU, unit, min stock threshold, barcode/QR).
QR generation: create printable QR labels (PNG/SVG) per Item and per StockLot (with quantity/expiry/lot).
Scan & act: scan QR via camera (web) → auto open item/lot → quick actions: Receive, Pick, Transfer, Adjust.
Stock movements: record in/out/transfer with reason, user, timestamp; running balances per location and globally.
Locations: rack/aisle/bin hierarchy; fast transfer by scan->select location.
Alerts: low stock, near-expiry, negative balance prevention; dismiss/resolve states.
Search & filters: by SKU, name, location, lot, supplier; fast keyboard ops.
Reports: current on-hand by item/location; movement ledger; valuation snapshot (FIFO simple).
Import/Export: CSV import for items/locations; export CSV for stock and movements.
Landing Page (Public /):
Hero (value prop + CTA), features grid, screenshots, FAQs, pricing placeholder.
Lead form (name, email, company) saved to DB (Lead entity); success message; no external email required.
Link “Open App” → /app.
App Pages (Protected):
/app/dashboard — KPIs (on-hand value, low stock count, movements today), recent alerts.
/app/items (list, create/edit, Generate QR button, print sheet).
/app/items/[id] (details, lots, history, quick actions).
/app/receive (PO-less quick receive: scan item → enter qty → save).
/app/pick (quick pick/dispatch: scan → qty → customer optional).
/app/transfer (scan from-lot → choose to-location → qty).
/app/locations (manage hierarchy, balances by location).
/app/reports (on-hand, ledger, valuation export).
/app/settings (roles, thresholds, units, company).
QR/Barcode:
Generate QR content as compact JSON or URL path (e.g., /scan?type=lot&id=...).
Camera scanner using web APIs; fallback to manual input.
Printable A4 label sheet (grid) and single-label print dialog.
UI/UX:
Dark theme default (black bg, white text, cyan #06b6d4 accents).
Responsive, accessible, optimistic updates where safe.
Keyboard shortcuts for power-users (e.g., “R” receive, “P” pick, “T” transfer).
## DATA & VALIDATION
Local, Bolt-compatible DB (persisted in project). Provide schema + seed script:
Sample items, locations, users (Admin/Staff), a few lots and movements.
zod + react-hook-form for all forms (client + server validation); clear errors and toasts.
## OPTIONAL INTEGRATIONS (CONFIG-READY, NO KEYS NEEDED NOW)
Email notifications (low stock/expiry) with env placeholders (Resend/SMTP TODO).
Stripe billing module scaffold (env placeholders; disabled in demo).
## BOLT EXECUTION (MANDATORY)
Single Bolt project with:
Runnable dev server, working protected routes, seeded demo data.
A README that explains:
how to run in Bolt (dev), seed data, and Publish to Bolt Hosting,
env example block, printing labels, and camera permissions.
A “Publish checklist” for Bolt Hosting.
After generation:
Start dev server automatically, print preview URL.
Provide a 10-step test plan (create item → generate QR → print → scan → receive → pick → transfer → alert → export CSV → report).
## QUALITY BAR
Production-grade structure (app/, components/, lib/, db/, actions/).
No dead ends: demo mode fully works without external APIs.
Clean, typed code; semantic components; error boundaries; loading states.
Deliver now: the complete project files, then start it, then guide me to publish on Bolt Hosting.