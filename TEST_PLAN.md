# InventoryQR - 10-Step Test Plan

This test plan walks through the complete workflow of the inventory management system.

## Prerequisites

- Demo data has been seeded (`npm run seed`)
- Dev server is running (`npm run dev`)
- Login credentials: `admin@demo.com` / `demo123456`

---

## Test 1: Landing Page & Lead Capture

**Objective**: Verify public landing page and lead form submission

1. Open `http://localhost:3000`
2. Verify landing page displays:
   - Hero section with value proposition
   - Features grid (6 features)
   - How It Works section
   - Lead capture form
3. Fill out lead form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Company: "Test Corp"
   - Message: "Interested in demo"
4. Click Submit
5. **Expected**: Success message appears, form resets
6. Verify lead saved in Supabase `leads` table

**Status**: ✅ Pass / ❌ Fail

---

## Test 2: Authentication & Sign In

**Objective**: Verify user authentication flow

1. Click "Open App" or navigate to `/app`
2. **Expected**: Redirected to `/login`
3. Enter credentials:
   - Email: `admin@demo.com`
   - Password: `demo123456`
4. Click "Sign In"
5. **Expected**: Redirected to `/app` (dashboard)
6. Verify sidebar shows:
   - Logo and "InventoryQR" text
   - Navigation menu items
   - Sign Out button

**Status**: ✅ Pass / ❌ Fail

---

## Test 3: Dashboard KPIs & Alerts

**Objective**: Verify dashboard displays correct data

1. On dashboard (`/app`), verify 4 KPI cards:
   - Total Inventory Value (should show > $0)
   - Low Stock Items (should show 1+)
   - Movements Today
   - Total Items (should show 3)
2. Check "Active Alerts" section:
   - Should show at least 1 alert (low stock for Red Gadget)
   - Click "X" to dismiss an alert
   - **Expected**: Alert disappears, success toast
3. Check "Recent Movements" section:
   - Should show movements from seed data
4. Verify 3 quick action cards at bottom

**Status**: ✅ Pass / ❌ Fail

---

## Test 4: Create New Item

**Objective**: Test item creation and validation

1. Press `Alt+I` or click "Items" in sidebar
2. Click "Add Item" button
3. Fill form:
   - SKU: `TEST-001`
   - Name: `Test Item`
   - Description: `Test description`
   - Unit: `pcs`
   - Category: `Test Category`
   - Min Stock: `20`
   - Reorder Point: `20`
   - Reorder Quantity: `100`
4. Click "Create Item"
5. **Expected**: Success toast, item appears in list
6. Verify item card shows:
   - Name, SKU, category
   - Unit and min threshold
   - "Generate QR" button

**Status**: ✅ Pass / ❌ Fail

---

## Test 5: Generate & Print QR Labels

**Objective**: Test QR code generation and print functionality

1. From Items list, find "Blue Widget"
2. Click "Generate QR" button
3. **Expected**: Navigate to QR generation page
4. Verify page shows:
   - Item QR code (white background, centered)
   - Item details (name, SKU)
   - Download and Print buttons
   - Stock lot QR codes section (showing LOT-001)
5. Click "Download" on item QR
6. **Expected**: PNG file downloads
7. Click "Print All Labels"
8. **Expected**: Print dialog opens with A4 label sheet
9. Close print dialog

**Status**: ✅ Pass / ❌ Fail

---

## Test 6: Scan QR Code

**Objective**: Test camera scanner and manual entry

1. Press `Alt+S` or navigate to Scan
2. Click "Start Camera"
3. **Expected**: Browser requests camera permission
4. Allow camera access
5. **Expected**: Video feed appears
6. Position QR code (from Test 5) in front of camera
7. **Expected**: Auto-detects and redirects to item details
8. Navigate back to Scan page
9. Click "Stop Camera"
10. In "Manual Entry" section, paste:
    ```json
    {"type":"item","id":"<item-id-from-seed>"}
    ```
11. Click "Process QR Data"
12. **Expected**: Redirects to item details

**Status**: ✅ Pass / ❌ Fail

---

## Test 7: Receive Stock

**Objective**: Test inbound stock workflow

1. Press `Alt+R` or navigate to Receive
2. Fill receive form:
   - Item: Select "Test Item" (from Test 4)
   - Quantity: `50`
   - Unit Cost: `10.00`
   - Location: Select "A-1-1-A"
   - Supplier: Select "Acme Corp"
   - Lot Number: `TEST-LOT-001`
   - Expiry Date: (30 days from today)
3. Click "Receive Stock"
4. **Expected**: Success toast
5. Navigate to Items → Test Item details
6. **Expected**:
   - Total On Hand shows 50
   - Stock lot appears with TEST-LOT-001
   - Recent movement shows "IN" entry

**Status**: ✅ Pass / ❌ Fail

---

## Test 8: Pick Stock

**Objective**: Test outbound stock workflow

1. Press `Alt+P` or navigate to Pick
2. Fill pick form:
   - Item: Select "Blue Widget"
   - Stock Lot: Select "LOT-001" (should show 150 available)
   - Quantity: `25`
   - Customer: Select "Tech Store"
   - Reference Number: `SO-001`
   - Notes: `Test order fulfillment`
3. Click "Pick Stock"
4. **Expected**: Success toast
5. Navigate to Items → Blue Widget details
6. **Expected**:
   - Total On Hand reduced to 125
   - Stock lot LOT-001 shows 125 quantity
   - Recent movement shows "OUT" entry with -25

**Status**: ✅ Pass / ❌ Fail

---

## Test 9: Transfer Stock & Check Movements

**Objective**: Test stock transfer between locations

1. Press `Alt+T` or navigate to Transfer
2. Fill transfer form:
   - Stock Lot: Select "USB-C Cable - LOT-003" (200 available at A-2-1-A)
   - Quantity: `50`
   - To Location: Select "A-1-1-B"
   - Notes: `Relocating for easier access`
3. Click "Transfer Stock"
4. **Expected**: Success toast
5. Navigate to Items → USB-C Cable details
6. **Expected**:
   - Stock lot now shows location "A-1-1-B"
   - Recent movement shows "TRANSFER" entry
7. Navigate to Reports (keyboard shortcut or sidebar)
8. Go to "Stock Movements" tab
9. **Expected**: Transfer movement appears in ledger

**Status**: ✅ Pass / ❌ Fail

---

## Test 10: Reports & CSV Export

**Objective**: Test reporting and data export

1. Navigate to Reports
2. On "On-Hand Inventory" tab:
   - **Expected**: Table shows all stock lots with:
     - SKU, Item, Lot, Quantity, Location, Value
   - Verify calculations are correct
3. Click "Export CSV"
4. **Expected**: CSV file downloads
5. Open CSV file
6. **Expected**: Data matches table, proper formatting
7. Switch to "Stock Movements" tab
8. **Expected**: Shows all movements (receive, pick, transfer)
9. Export movements CSV
10. Switch to "Valuation" tab
11. **Expected**: Shows total inventory value
12. Verify value matches sum of (quantity × unit_cost) from on-hand

**Status**: ✅ Pass / ❌ Fail

---

## Bonus Tests

### Keyboard Shortcuts
- Test all shortcuts: Alt+D, Alt+I, Alt+R, Alt+P, Alt+T, Alt+L, Alt+S
- **Expected**: Fast navigation between pages

### Locations Management
1. Navigate to Locations (Alt+L)
2. Click "Add Location"
3. Create location: "B-1-1-A" (type: Bin)
4. **Expected**: Location appears in list
5. Verify location available in Receive/Transfer dropdowns

### Settings Page
1. Navigate to Settings
2. **Expected**: Profile info displays correctly
3. Verify keyboard shortcuts reference

### Sign Out
1. Click "Sign Out" in sidebar
2. **Expected**: Redirected to landing page
3. Try accessing `/app`
4. **Expected**: Redirected to `/login`

---

## Test Results Summary

- Total Tests: 10 core + 4 bonus
- Passed: ___
- Failed: ___
- Notes: ___________

---

## Common Issues & Solutions

**Camera not working**:
- Ensure HTTPS or localhost
- Check browser permissions
- Use manual entry fallback

**Supabase errors**:
- Verify `.env` variables
- Check RLS policies in Supabase dashboard
- Ensure demo data seeded

**Build fails**:
- Run `npm install`
- Clear `.next` folder
- Check TypeScript errors with `npm run typecheck`

---

**Test Completed By**: ___________
**Date**: ___________
**Environment**: Dev / Staging / Production
