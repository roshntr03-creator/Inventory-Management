# Deployment Guide - InventoryQR

Complete guide for deploying InventoryQR to production.

## Pre-Deployment Checklist

- [x] Database schema created via Supabase migrations
- [x] Demo data seeded (optional for production)
- [x] Build passes without errors
- [x] All tests completed (see TEST_PLAN.md)
- [ ] Production environment variables configured
- [ ] Admin user account created
- [ ] Backup strategy in place

## Deployment Options

### Option 1: Bolt Hosting (Recommended for Bolt Projects)

Bolt provides seamless hosting for Next.js applications with automatic deployments.

#### Steps:

1. **Prepare the Build**
   ```bash
   npm run build
   ```

2. **Use Bolt's Publish Feature**
   - Click the "Publish" button in Bolt interface
   - Bolt automatically detects Next.js configuration
   - Environment variables are preserved from `.env`

3. **Post-Deployment**
   - Test the deployment URL
   - Verify Supabase connection works
   - Create production admin account
   - Test critical workflows (see TEST_PLAN.md)

#### Bolt Hosting Benefits:
- Zero configuration required
- Automatic SSL certificates
- Environment variables managed
- Instant rollback capability

---

### Option 2: Vercel (Next.js Native Platform)

#### Prerequisites:
- Vercel account
- GitHub repository (optional but recommended)

#### Steps:

1. **Install Vercel CLI** (if not using GitHub integration)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

### Option 3: Self-Hosted (VPS/Cloud)

#### Prerequisites:
- Node.js 16+ installed
- Process manager (PM2 recommended)
- Reverse proxy (nginx/Caddy)

#### Steps:

1. **Build the Application**
   ```bash
   npm run build
   npm run start
   ```

2. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "inventory-qr" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx** (example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL** with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Environment Configuration

### Production Environment Variables

Create or update `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Optional: Email notifications
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com

# Optional: Stripe integration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Security Considerations

1. **Never commit secrets** to version control
2. **Use different Supabase projects** for dev/staging/prod
3. **Enable RLS** on all Supabase tables (already configured)
4. **Review Supabase policies** for production data access
5. **Set up Supabase backups** (automatic in paid plans)

---

## Post-Deployment Setup

### 1. Create Admin Account

**Option A**: Via signup page
- Navigate to `/signup`
- Create account with role: Admin
- Use secure password

**Option B**: Via Supabase dashboard
- Go to Authentication → Users
- Create new user
- Add profile entry in `profiles` table with `role = 'admin'`

### 2. Initial Data Setup

**Production Approach** (recommended):
1. Create suppliers and customers
2. Create locations (warehouse hierarchy)
3. Add real inventory items
4. Generate QR labels for items
5. Perform initial stock receive

**Demo Data** (for testing only):
```bash
npm run seed
```

### 3. Configure Alerts

Update alert thresholds in Settings (future feature) or directly in Supabase:
- Low stock thresholds per item
- Expiry warning days (default: 30 days)
- Email notification recipients

---

## Monitoring & Maintenance

### Health Checks

Create a simple health check endpoint (future enhancement):

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Database Backups

**Supabase**:
- Automatic daily backups on Pro plan
- Manual backups via Supabase dashboard
- Export to CSV from Reports page

### Performance Monitoring

**Recommended Tools**:
- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- LogRocket for session replay
- Uptime monitoring (UptimeRobot, Pingdom)

---

## Scaling Considerations

### Database Performance

**As data grows**:
1. Add indexes on frequently queried fields (already included)
2. Archive old movements to separate table
3. Consider read replicas for reporting
4. Use Supabase Edge Functions for complex queries

### Application Performance

**Optimization strategies**:
1. Enable Next.js caching where appropriate
2. Use React.memo for expensive components
3. Implement pagination for large lists
4. Consider CDN for static assets

### Cost Optimization

**Supabase**:
- Free tier: 500MB database, 2GB bandwidth
- Pro tier: $25/mo for production workloads
- Monitor usage in Supabase dashboard

**Hosting**:
- Bolt: Check Bolt pricing plans
- Vercel: Free for hobby, Pro from $20/mo
- Self-hosted: VPS from $5/mo (DigitalOcean, Linode)

---

## Troubleshooting

### Common Deployment Issues

**Build Fails**:
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Environment Variables Not Loading**:
- Verify variables in deployment platform dashboard
- Check variable names (must start with `NEXT_PUBLIC_` for client-side)
- Restart/redeploy after adding variables

**Supabase Connection Errors**:
- Verify Supabase project is active
- Check RLS policies allow authenticated access
- Ensure anon key matches project

**Camera Scanner Not Working**:
- Requires HTTPS in production (HTTP only works on localhost)
- Browser permissions needed
- Provide manual entry fallback

---

## Rollback Procedure

### Bolt Hosting
- Use Bolt's built-in rollback feature
- Select previous deployment from history

### Vercel
```bash
vercel rollback
```

### Self-Hosted
```bash
git checkout <previous-commit>
npm run build
pm2 restart inventory-qr
```

---

## Support & Resources

**Documentation**:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

**Community**:
- Create GitHub issues for bugs
- Check Supabase Discord for database help
- Next.js Discord for framework questions

---

## Production Checklist

Before going live:

- [ ] Build completes successfully
- [ ] All tests pass (TEST_PLAN.md)
- [ ] Environment variables configured
- [ ] Admin account created
- [ ] SSL certificate active (HTTPS)
- [ ] Database backups configured
- [ ] Initial data seeded (real inventory)
- [ ] QR labels printed for existing inventory
- [ ] Staff accounts created
- [ ] Mobile camera tested
- [ ] Print functionality tested
- [ ] CSV exports working
- [ ] Alerts configured
- [ ] Monitoring set up
- [ ] Documentation shared with team
- [ ] Training completed for staff

---

**Deployed By**: ___________
**Date**: ___________
**Environment**: ___________
**Deployment URL**: ___________
