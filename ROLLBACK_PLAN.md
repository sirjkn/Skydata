# 🔄 Rollback Plan: Skyway Suites Migration

**Emergency Rollback Procedures**  
**Last Updated**: March 8, 2026

---

## ⚠️ When to Rollback

Consider rolling back if you experience:

- 🔴 **Critical**: Database connection failures (>5 minutes)
- 🔴 **Critical**: Authentication completely broken (users cannot login)
- 🔴 **Critical**: Data loss or corruption detected
- 🟡 **Major**: Performance worse than before migration
- 🟡 **Major**: Images not loading (>50% failure rate)
- 🟡 **Major**: API errors (>10% error rate)

**Do NOT rollback for:**
- 🟢 Minor bugs that don't affect core functionality
- 🟢 Cosmetic issues
- 🟢 Individual user issues (check their browser/cache first)

---

## 🚨 Emergency Contacts

Before rolling back, contact:

1. **Database Issues**: Neon Support (support@neon.tech)
2. **API Issues**: Vercel Support (https://vercel.com/help)
3. **Image Issues**: Cloudinary Support (support@cloudinary.com)
4. **General**: Review troubleshooting section in `/NEON_MIGRATION_GUIDE.md`

---

## 📋 Rollback Scenarios

### Scenario 1: Database Connection Failures

**Symptoms:**
- API returns 500 errors
- "Database connection timeout" errors
- No data loading in frontend

**Quick Fix (Try First):**
1. Check Neon dashboard: https://console.neon.tech
2. Verify database is running (not suspended)
3. Check connection string in Vercel env vars
4. Restart Vercel deployment

**Rollback Steps:**
1. Update frontend API URL back to Supabase:
   ```typescript
   // In .env.local or API config
   VITE_API_URL=https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6a712830
   ```

2. Revert auth changes:
   ```bash
   git checkout main src/app/lib/auth.ts
   ```

3. Revert API calls to use Supabase client
4. Redeploy frontend

**Data Concerns:**
- If data was migrated: Export from Neon first
- If no migration: No data loss risk

**Time Required**: 30 minutes

---

### Scenario 2: Authentication Failures

**Symptoms:**
- Users cannot login
- "Unauthorized" errors on all protected routes
- JWT token errors

**Quick Fix (Try First):**
1. Verify JWT_SECRET is set in Vercel env vars
2. Check admin account exists in Neon:
   ```sql
   SELECT * FROM skyway_auth_user WHERE email = 'admin@skywaysuites.com';
   ```
3. Test login with curl:
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@skywaysuites.com","password":"yourpassword"}'
   ```

**Rollback Steps:**
1. Revert to Supabase Auth:
   ```typescript
   // Restore original auth.ts
   git checkout main src/app/lib/auth.ts
   ```

2. Update login/signup pages to use Supabase:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   ```

3. Remove JWT token handling
4. Redeploy frontend

**Time Required**: 20 minutes

---

### Scenario 3: Image Upload Failures

**Symptoms:**
- Image uploads fail
- Cloudinary errors in console
- Images not displaying

**Quick Fix (Try First):**
1. Check Cloudinary dashboard: https://cloudinary.com/console
2. Verify account is active
3. Check upload quota not exceeded (25GB free)
4. Test upload directly in Cloudinary console

**Rollback Steps:**
1. Revert to Supabase Storage:
   ```typescript
   // Remove Cloudinary imports
   import { uploadImage } from './lib/cloudinary'; // DELETE
   
   // Restore Supabase storage
   const { data, error } = await supabase.storage
     .from('skyway-images')
     .upload(`properties/${filename}`, file);
   ```

2. Update image upload components
3. Redeploy frontend

**Data Concerns:**
- New images won't be in Supabase bucket
- May need to re-upload images

**Time Required**: 30 minutes

---

### Scenario 4: Complete Rollback (Nuclear Option)

**Use only if multiple critical issues occur**

#### Step 1: Disable New Backend (5 min)

1. Go to Vercel Dashboard
2. Pause deployments or set maintenance page
3. This stops new traffic to Neon API

#### Step 2: Restore Supabase Configuration (15 min)

1. **Environment Variables:**
   ```bash
   # In .env.local
   VITE_API_URL=https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6a712830
   ```

2. **Restore Supabase Client:**
   ```typescript
   // src/lib/supabase.ts (should still exist)
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(
     'https://YOUR_PROJECT.supabase.co',
     'YOUR_ANON_KEY'
   );
   ```

3. **Revert Auth:**
   ```bash
   git checkout main src/app/lib/auth.ts
   git checkout main src/app/pages/login.tsx
   git checkout main src/app/pages/signup.tsx
   ```

4. **Revert Data Layer:**
   ```bash
   # Keep old Supabase data files
   # They should still exist in your repo
   ```

#### Step 3: Revert API Calls (30 min)

Find all files using new API client:
```bash
grep -r "from './lib/api'" src/
grep -r "from './lib/auth-jwt'" src/
```

Replace with old Supabase calls:
```typescript
// OLD (restore this)
import { fetchProperties } from './lib/supabaseData';
const properties = await fetchProperties();

// NEW (remove this)
import api from './lib/api';
const { properties } = await api.properties.getAll();
```

#### Step 4: Restore Image Uploads (15 min)

```typescript
// Remove Cloudinary
import { uploadImage } from './lib/cloudinary'; // DELETE

// Restore Supabase Storage
const { data, error } = await supabase.storage
  .from('skyway-images')
  .upload('path', file);

const { data: { publicUrl } } = supabase.storage
  .from('skyway-images')
  .getPublicUrl('path');
```

#### Step 5: Test Everything (30 min)

- [ ] Login works
- [ ] Properties load
- [ ] Bookings work
- [ ] Images upload
- [ ] All pages functional

#### Step 6: Deploy Rollback (10 min)

```bash
# Commit rollback changes
git add .
git commit -m "ROLLBACK: Revert to Supabase"
git push origin main

# Or manually deploy via Vercel dashboard
```

#### Step 7: Verify Production (15 min)

- [ ] Production site loads
- [ ] Authentication works
- [ ] Data displays correctly
- [ ] Images load
- [ ] No console errors

**Total Rollback Time**: 2 hours

---

## 📊 Data Recovery

### If Data Was Migrated to Neon

#### Scenario: Need to recover data from Neon to Supabase

1. **Export from Neon:**
   ```bash
   # Use pg_dump to export
   pg_dump "postgresql://neondb_owner:...:neondb" > neon_backup.sql
   ```

2. **Import to Supabase:**
   ```bash
   # Use psql to import
   psql "postgresql://postgres:...@db.PROJECT.supabase.co:5432/postgres" < neon_backup.sql
   ```

3. **Verify data:**
   ```sql
   SELECT COUNT(*) FROM skyway_properties;
   SELECT COUNT(*) FROM skyway_bookings;
   SELECT COUNT(*) FROM skyway_customers;
   ```

### If Images Were Uploaded to Cloudinary

#### Scenario: Need images back in Supabase Storage

**Option 1: Manual download & re-upload**
1. Download images from Cloudinary
2. Upload to Supabase Storage manually

**Option 2: Script migration**
```javascript
// Download from Cloudinary, upload to Supabase
const cloudinaryUrls = await getCloudinaryImages();

for (const url of cloudinaryUrls) {
  const response = await fetch(url);
  const blob = await response.blob();
  
  await supabase.storage
    .from('skyway-images')
    .upload(filename, blob);
}
```

---

## 🔍 Pre-Rollback Checklist

Before executing rollback, verify:

- [ ] Issue is critical and cannot be fixed quickly
- [ ] Attempted quick fixes (see scenarios above)
- [ ] Contacted support if needed
- [ ] Backed up any new data in Neon
- [ ] Backed up any new images in Cloudinary
- [ ] Documented the issue for future reference
- [ ] Notified stakeholders of rollback decision
- [ ] Have Supabase credentials ready
- [ ] Have backup of current code state

---

## 📝 Post-Rollback Actions

After successful rollback:

1. **Document the Issue:**
   - What went wrong?
   - When did it occur?
   - What symptoms appeared?
   - Why did we rollback?

2. **Preserve Diagnostics:**
   - Save error logs
   - Save Vercel deployment logs
   - Save Neon query logs
   - Screenshot any errors

3. **Analyze Root Cause:**
   - Was it a configuration issue?
   - Was it a code bug?
   - Was it a service outage?
   - Was it a data issue?

4. **Plan Fix:**
   - What needs to change?
   - How to test before retry?
   - Additional safeguards needed?

5. **Schedule Retry:**
   - When to attempt migration again?
   - What additional prep is needed?
   - Who needs to be involved?

---

## 🛡️ Prevention (For Future Migrations)

### Testing Checklist (Do Before Production)
- [ ] Test on staging environment first
- [ ] Load test with realistic data volumes
- [ ] Test all authentication flows
- [ ] Test all CRUD operations
- [ ] Test image uploads/downloads
- [ ] Test with poor network conditions
- [ ] Test error handling
- [ ] Verify rollback procedures work

### Gradual Migration Strategy
Instead of all-at-once:
1. Migrate read-only features first
2. Run both systems in parallel
3. Gradually shift traffic
4. Monitor closely at each step
5. Only proceed if metrics are good

### Monitoring Setup
Before migration:
- [ ] Set up Vercel error alerts
- [ ] Set up Neon performance monitoring
- [ ] Set up Cloudinary usage alerts
- [ ] Set up uptime monitoring (UptimeRobot, etc.)

---

## 📞 Emergency Contact Numbers

| Service | Contact | SLA | Support Link |
|---------|---------|-----|--------------|
| Neon | support@neon.tech | 24-48h | https://neon.tech/docs/introduction/support |
| Vercel | vercel.com/help | 24h (Pro) | https://vercel.com/support |
| Cloudinary | support@cloudinary.com | 24-48h | https://support.cloudinary.com |

---

## 🎯 Decision Tree

```
Issue Detected
     │
     ├─ Is it critical? (database down, auth broken, data loss)
     │   ├─ YES → Try quick fix (15 min)
     │   │   ├─ Fixed? → Monitor closely
     │   │   └─ Not fixed? → ROLLBACK
     │   │
     │   └─ NO → Is it major? (performance issues, partial failures)
     │       ├─ YES → Contact support, investigate (2 hours)
     │       │   ├─ Can be fixed? → Fix and monitor
     │       │   └─ Cannot be fixed quickly? → Consider rollback
     │       │
     │       └─ NO → Minor issue, fix in normal development cycle
```

---

## ✅ Rollback Verification Checklist

After rollback, verify:

- [ ] Site is accessible
- [ ] Login works (test with admin account)
- [ ] Logout works
- [ ] Properties page loads
- [ ] Bookings page loads
- [ ] Customers page loads
- [ ] Settings page loads
- [ ] Images load correctly
- [ ] Can create new property
- [ ] Can create new booking
- [ ] Can upload images
- [ ] No console errors
- [ ] API responses are normal
- [ ] Database queries work
- [ ] All features functional
- [ ] Performance is acceptable
- [ ] Mobile version works

---

## 📊 Rollback Success Metrics

After rollback, monitor for 24 hours:

| Metric | Target | Actual |
|--------|--------|--------|
| Error rate | <1% | _____ |
| API response time | <500ms | _____ |
| Page load time | <2s | _____ |
| Login success rate | >99% | _____ |
| Image load success | >95% | _____ |
| User complaints | 0 | _____ |

---

**Remember**: Rollback is a safety mechanism, not a failure. Sometimes it's better to rollback, analyze, and retry with better preparation.

---

## 🔄 After Rollback: Planning Next Attempt

1. **Root Cause Analysis**: What went wrong?
2. **Fix Issues**: Address the problems
3. **Better Testing**: More comprehensive tests
4. **Gradual Migration**: Consider phased approach
5. **Better Monitoring**: Enhanced observability
6. **Clear Success Criteria**: Define what "success" looks like
7. **Retry**: When ready, try again with improvements

---

**Last Updated**: March 8, 2026  
**Review Schedule**: Before each deployment  
**Owner**: Development Team

---

*Having a rollback plan doesn't mean you'll need it. It means you're prepared!*
