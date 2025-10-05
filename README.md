# InventoryQR - Smart Inventory Management System

A production-ready inventory management system powered by QR codes, built with Next.js, Supabase, and TypeScript.

## Features

- **QR Code Integration**: Generate and print QR labels for items and stock lots
- **Camera Scanner**: Scan QR codes using web camera with manual entry fallback
- **Stock Operations**: Receive, pick, and transfer stock with complete audit trail
- **Location Management**: Organize inventory with warehouse/aisle/rack/bin hierarchy
- **Real-time Alerts**: Low stock, expiry warnings, and negative balance prevention
- **Reports & Analytics**: On-hand inventory, movement ledger, and CSV exports
- **Role-Based Access**: Admin and staff roles with protected routes
- **Keyboard Shortcuts**: Power-user shortcuts for fast navigation (Alt+R, Alt+P, Alt+T, etc.)

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **UI**: TailwindCSS + shadcn/ui
- **QR Codes**: qrcode library
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 16+
- A Supabase account (already configured)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Environment variables are pre-configured in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Seed Demo Data

Run the seed script to populate the database with demo data:

```bash
npm run seed
```

This creates:
- Demo admin user: `admin@demo.com` / `demo123456`
- Sample items (Blue Widget, Red Gadget, USB-C Cable)
- Locations (Warehouse A with bins)
- Stock lots with quantities
- Initial movements
- Sample alerts

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Usage Guide

### Landing Page (Public)

- Visit `/` to see the product landing page
- Submit lead form to capture potential customers
- Click "Open App" to access the inventory system

### Authentication

1. **Sign Up**: Create a new account at `/signup`
   - Choose role: Admin or Staff
   - Admin has full access, Staff has limited permissions

2. **Sign In**: Log in at `/login`
   - Use demo account: `admin@demo.com` / `demo123456`

### Core Workflows

#### 1. Add New Items

- Navigate to Items (Alt+I)
- Click "Add Item"
- Fill in SKU, name, unit, min stock threshold
- Set category and reorder points

#### 2. Generate QR Labels

- Go to item details
- Click "Generate QR"
- Download individual QR codes or print label sheet
- Use A4 printer for label sheets (3 labels per row)

#### 3. Receive Stock

- Navigate to Receive (Alt+R)
- Select item and location
- Enter quantity and unit cost
- Optional: Add lot number, supplier, expiry date
- Creates stock lot and records movement

#### 4. Pick Stock (Outbound)

- Navigate to Pick (Alt+P)
- Select item and specific stock lot
- Enter quantity (validates against available stock)
- Optional: Link to customer and reference number
- Deducts from stock and logs movement

#### 5. Transfer Stock

- Navigate to Transfer (Alt+T)
- Select stock lot to move
- Choose destination location
- Records transfer movement

#### 6. Scan QR Codes

- Navigate to Scan (Alt+S)
- Click "Start Camera" (requires camera permission)
- Position QR code in view
- Auto-redirects to item/lot details
- Fallback: Manual JSON entry

### Reports

- **On-Hand Inventory**: Current stock by item, lot, location
- **Stock Movements**: Complete audit trail with timestamps
- **Valuation**: Total inventory value (FIFO-based)
- **CSV Export**: Download reports for Excel/analysis

### Keyboard Shortcuts

- `Alt+D` - Dashboard
- `Alt+I` - Items
- `Alt+R` - Receive
- `Alt+P` - Pick
- `Alt+T` - Transfer
- `Alt+S` - Scan
- `Alt+L` - Locations

## Database Schema

### Core Tables

- **profiles**: User accounts with roles (admin/staff)
- **items**: Master item catalog (SKU, name, thresholds)
- **stock_lots**: Individual batches with qty, location, expiry
- **movements**: Complete transaction log (in/out/transfer/adjust)
- **locations**: Warehouse hierarchy (warehouse > aisle > rack > bin)
- **suppliers**: Vendor information
- **customers**: Customer records
- **alerts**: System notifications (low stock, expiry)
- **leads**: Landing page lead captures

### Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for app routes
- Public access only for landing page and lead submission

## Deployment

### Deploy to Bolt Hosting

1. **Build the project**:

```bash
npm run build
```

2. **Verify build**:
   - Check for TypeScript errors
   - Ensure all environment variables are set
   - Test critical paths (login, items, receive)

3. **Publish**:
   - Use Bolt's "Publish" feature
   - Ensure Supabase connection is configured
   - Test production deployment

### Environment Setup

Required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Printing QR Labels

**Single Label**:
- Click print button on QR generation page
- Use browser print dialog
- Recommended: 10cm x 10cm labels

**Label Sheet (A4)**:
- Click "Print All Labels"
- Prints 3 labels per row
- Cut along borders
- Laminate for durability

**Camera Permissions**:
- Browser will request camera access for scanning
- Allow camera for automatic QR detection
- Use manual entry if camera unavailable

## Production Checklist

- [ ] Seed database with initial data
- [ ] Create admin user account
- [ ] Test item creation and QR generation
- [ ] Verify receive/pick/transfer workflows
- [ ] Test camera scanner (allow permissions)
- [ ] Print sample QR labels
- [ ] Check reports and exports
- [ ] Review alerts configuration
- [ ] Set up email notifications (optional)
- [ ] Configure backup strategy

## Optional Integrations

### Email Notifications

Configure SMTP or Resend for alerts:

```
SMTP_HOST=smtp.example.com
SMTP_USER=your-user
SMTP_PASS=your-password
```

### Stripe Billing

Add environment variables for subscription billing:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Development

### Project Structure

```
/app
  /app              # Protected app routes
    /items          # Item management
    /receive        # Receive workflow
    /pick           # Pick workflow
    /transfer       # Transfer workflow
    /locations      # Location management
    /scan           # QR scanner
    /reports        # Reports & exports
    /settings       # User settings
  /login            # Auth pages
  /signup
  page.tsx          # Public landing page

/components/ui      # shadcn/ui components
/lib
  supabase.ts       # Supabase client
  auth-context.tsx  # Auth context provider
  qr-utils.ts       # QR generation utilities
  utils.ts          # Utility functions

/scripts
  seed.ts           # Database seeding script
```

### Testing Workflow

1. Sign up/login with demo account
2. Navigate to Items → Add new item
3. Generate QR code → Print label
4. Scan QR code with camera
5. Receive stock → Enter quantity
6. Pick stock → Fulfill order
7. Transfer stock → Move location
8. View reports → Export CSV
9. Check alerts → Dismiss/resolve

## Support

For issues or questions:
- Check database migrations in Supabase dashboard
- Verify RLS policies are active
- Ensure camera permissions granted
- Review browser console for errors

## License

MIT

---

**Built with ❤️ for production-grade inventory management**
