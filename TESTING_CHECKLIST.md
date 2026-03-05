# Aggressive Sync Testing Checklist

## ✅ Pre-Testing Setup

Before testing, ensure:
- [ ] Browser console is open (F12) to see sync logs
- [ ] Cloud Status Indicator is visible (bottom-right corner)
- [ ] Stable internet connection

## 🧪 Test Suite

### 1. Enable Cloud Mode ☁️

**Steps:**
1. Go to Settings → Database tab
2. Click "Enable Cloud Storage" button
3. Confirm the modal
4. Wait for sync to complete

**Expected Results:**
- [ ] Modal shows "Syncing to Cloud..."
- [ ] Success modal shows data counts
- [ ] Cloud indicator changes from gray to green
- [ ] Console shows sync logs:
  ```
  🔄 Starting bidirectional sync...
  ✅ Upload complete
  ✅ Download complete
  ✨ Bidirectional sync successful!
  ```
- [ ] Settings page shows "Cloud Mode Enabled"

---

### 2. Page Load Sync 📄

**Steps:**
1. With cloud mode enabled, refresh the page (F5 or Ctrl+R)
2. Watch the cloud indicator and console

**Expected Results:**
- [ ] Cloud indicator shows blue "Syncing..." with spinning icon
- [ ] Console shows:
  ```
  🚀 Syncing on page load...
  🔄 Starting bidirectional sync...
  ✅ Upload complete
  ✅ Download complete
  ✨ Bidirectional sync successful!
  ```
- [ ] Indicator changes to green "Synced!" then "Cloud Mode"
- [ ] All data loads correctly

---

### 3. Background Sync (Every 5 Seconds) ⏰

**Steps:**
1. With cloud mode enabled, wait and observe
2. Watch the cloud indicator
3. Monitor console logs

**Expected Results:**
- [ ] Every 5 seconds, indicator briefly shows "Syncing..."
- [ ] Console shows repeated sync logs:
  ```
  🔄 Starting bidirectional sync...
  ✅ Upload complete
  ✅ Download complete
  ✨ Bidirectional sync successful!
  ```
- [ ] No errors in console
- [ ] Sync runs continuously without user action

---

### 4. Add Property Sync ➕🏠

**Steps:**
1. Go to Admin Dashboard → Properties tab
2. Click "Add Property"
3. Fill in property details
4. Add some photos
5. Click "Save"
6. Watch cloud indicator

**Expected Results:**
- [ ] Property saves successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Property appears in list immediately
- [ ] Within 5 seconds, background sync runs
- [ ] No errors

---

### 5. Edit Property Sync ✏️🏠

**Steps:**
1. Go to Admin Dashboard → Properties tab
2. Click "Edit" on any property
3. Change property name or price
4. Click "Save"
5. Watch cloud indicator

**Expected Results:**
- [ ] Property updates successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Updated property appears immediately
- [ ] Background sync runs within 5 seconds

---

### 6. Delete Property Sync 🗑️🏠

**Steps:**
1. Go to Admin Dashboard → Properties tab
2. Click "Delete" on any property
3. Confirm deletion
4. Watch cloud indicator

**Expected Results:**
- [ ] Property deletes successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Property removed from list
- [ ] Background sync runs within 5 seconds

---

### 7. Add Booking Sync ➕📅

**Steps:**
1. Go to Property Details page
2. Click "Book Now"
3. Select dates and fill customer info
4. Click "Confirm Booking"
5. Watch cloud indicator

**Expected Results:**
- [ ] Booking creates successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Booking appears in admin dashboard
- [ ] Background sync runs within 5 seconds

---

### 8. Edit Booking Sync ✏️📅

**Steps:**
1. Go to Admin Dashboard → Bookings tab
2. Click on any booking
3. Change booking status (e.g., Pending → Confirmed)
4. Save changes
5. Watch cloud indicator

**Expected Results:**
- [ ] Booking updates successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Status updates immediately
- [ ] Background sync runs within 5 seconds

---

### 9. Add Payment Sync ➕💰

**Steps:**
1. Go to Admin Dashboard → Bookings tab
2. Click on a booking
3. Scroll to Payments section
4. Add a new payment
5. Click "Save"
6. Watch cloud indicator

**Expected Results:**
- [ ] Payment saves successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Payment appears in list
- [ ] Booking total updates
- [ ] Background sync runs within 5 seconds

---

### 10. Add Customer Sync ➕👤

**Steps:**
1. Go to Admin Dashboard → Customers tab
2. Click "Add Customer"
3. Fill in customer details
4. Click "Save"
5. Watch cloud indicator

**Expected Results:**
- [ ] Customer saves successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Customer appears in list
- [ ] Background sync runs within 5 seconds

---

### 11. Settings Save Sync ⚙️

**Steps:**
1. Go to Settings → General tab
2. Change company name or any setting
3. Click "Save Settings"
4. Watch cloud indicator

**Expected Results:**
- [ ] Settings save successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows FULL sync (upload + download):
  ```
  🔄 Starting bidirectional sync...
  ✅ Upload complete
  ✅ Download complete
  ✨ Bidirectional sync successful!
  ```
- [ ] Settings persist after page refresh

---

### 12. Categories/Features Sync 🏷️

**Steps:**
1. Go to Settings → Database tab
2. Scroll to Categories section
3. Add or remove a category
4. Watch cloud indicator

**Expected Results:**
- [ ] Category updates successfully
- [ ] Cloud indicator shows "Syncing..."
- [ ] Console shows sync operation
- [ ] Changes persist
- [ ] Background sync runs within 5 seconds

---

### 13. Sync Statistics Display 📊

**Steps:**
1. Go to Settings → Database tab
2. Scroll to Sync Statistics section (if cloud mode is enabled)
3. Perform several operations
4. Watch the statistics update

**Expected Results:**
- [ ] "Last Sync" shows time since last sync (e.g., "5s ago")
- [ ] "Total Syncs" increments with each sync
- [ ] "Successful" count increases
- [ ] "Errors" remains at 0 (or shows errors if any)
- [ ] Stats update in real-time

---

### 14. Manual Upload to Cloud 📤

**Steps:**
1. Go to Settings → Database tab
2. Click "Upload to Cloud" button
3. Wait for completion
4. Watch cloud indicator

**Expected Results:**
- [ ] Modal shows "Syncing..."
- [ ] Success modal shows data counts
- [ ] Cloud indicator shows "Syncing..." then "Synced!"
- [ ] Console shows sync logs
- [ ] All local data uploaded

---

### 15. Manual Download from Cloud 📥

**Steps:**
1. Go to Settings → Database tab
2. Click "Download from Cloud" button
3. Confirm page reload
4. Page refreshes

**Expected Results:**
- [ ] Modal shows "Downloading..."
- [ ] Success modal prompts for reload
- [ ] Page reloads automatically
- [ ] All cloud data downloaded
- [ ] Data matches cloud version

---

### 16. Multi-Device Sync 🔄📱💻

**Steps:**
1. Open app on Device A (e.g., desktop browser)
2. Open app on Device B (e.g., mobile or incognito)
3. Enable cloud mode on both devices
4. On Device A: Add a new property
5. Wait 5 seconds
6. On Device B: Check properties list

**Expected Results:**
- [ ] Property added on Device A
- [ ] Within 5 seconds, background sync runs on both devices
- [ ] Property appears on Device B automatically
- [ ] No manual refresh needed
- [ ] Data stays synchronized

---

### 17. Disable Cloud Mode ⏹️

**Steps:**
1. Go to Settings → Database tab
2. Click "Disable Cloud Storage" button
3. Confirm
4. Watch cloud indicator

**Expected Results:**
- [ ] Cloud indicator changes from green to gray
- [ ] Shows "Local Mode"
- [ ] Background sync stops
- [ ] Console stops showing sync logs
- [ ] Data operations work locally only

---

### 18. Re-enable Cloud Mode 🔄☁️

**Steps:**
1. With cloud mode disabled, make some local changes
2. Go to Settings → Database tab
3. Click "Enable Cloud Storage" button
4. Confirm sync

**Expected Results:**
- [ ] Modal shows syncing process
- [ ] All local changes upload to cloud
- [ ] Cloud data downloads to local
- [ ] Data merges correctly
- [ ] Cloud indicator turns green
- [ ] Background sync resumes

---

### 19. Error Handling - Network Failure 🚫

**Steps:**
1. Enable cloud mode
2. Disconnect internet
3. Try to add a property
4. Watch cloud indicator

**Expected Results:**
- [ ] Property saves to localStorage
- [ ] Cloud sync attempts and fails
- [ ] Cloud indicator shows red "Sync Error"
- [ ] Console shows error message
- [ ] After 2 seconds, indicator returns to green
- [ ] When internet returns, next sync recovers

---

### 20. Throttling Test ⏱️

**Steps:**
1. Enable cloud mode
2. Rapidly add multiple properties (5+ within 5 seconds)
3. Watch console logs carefully

**Expected Results:**
- [ ] Properties save successfully
- [ ] Sync operations are throttled (min 1 second apart)
- [ ] Console shows some sync calls being skipped
- [ ] No duplicate syncs
- [ ] Background sync catches up after 5 seconds
- [ ] All properties eventually sync

---

## 🎯 Success Criteria

### All tests should pass with:
- ✅ No JavaScript errors in console
- ✅ Sync operations complete successfully
- ✅ Visual feedback shows correct status
- ✅ Data persists after page refresh
- ✅ Background sync runs every 5 seconds
- ✅ Multi-device sync works within 5 seconds
- ✅ Error handling works gracefully
- ✅ Throttling prevents sync storms

---

## 📝 Console Commands for Testing

### Check Current Sync Status
```javascript
// Check if cloud mode is enabled
const settings = JSON.parse(localStorage.getItem('skyway_settings') || '{}');
console.log('Cloud Mode:', settings.useSupabase ? 'ENABLED' : 'DISABLED');
```

### Manually Trigger Full Sync
```javascript
window.dispatchEvent(new CustomEvent('triggerFullSync'));
```

### Check Last Sync Time
```javascript
// Watch for sync events
window.addEventListener('triggerFullSync', () => {
  console.log('🔔 Full sync triggered!');
});
```

### Monitor All Sync Operations
```javascript
// Already logged automatically - just watch the console!
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Sync Not Triggering
**Solution:** Check cloud mode is enabled in Settings

### Issue 2: Background Sync Not Running
**Solution:** Refresh page to restart DataSyncWrapper

### Issue 3: Sync Errors
**Solution:** Check internet connection and Supabase credentials

### Issue 4: Data Not Appearing
**Solution:** Wait 5 seconds for background sync or manually refresh

### Issue 5: Too Many Sync Requests
**Solution:** Throttling should prevent this - check console for errors

---

## 📊 Performance Benchmarks

Expected performance:
- **Quick Upload**: 100-300ms
- **Full Sync**: 300-800ms
- **Background Sync**: Runs every 5 seconds
- **Throttle**: Minimum 1 second between syncs
- **Network Bandwidth**: ~50-500KB per sync

---

## ✨ Final Verification

After completing all tests:

- [ ] All 20 tests passed
- [ ] No console errors
- [ ] Cloud indicator works correctly
- [ ] Sync statistics update properly
- [ ] Multi-device sync verified
- [ ] Background sync runs continuously
- [ ] Data persists correctly
- [ ] Error handling works

**Status: READY FOR PRODUCTION** ✅

---

## 📞 Support

If any tests fail:
1. Check browser console for errors
2. Verify Supabase credentials in `/utils/supabase/info.tsx`
3. Ensure internet connection is stable
4. Review documentation in `/AGGRESSIVE_SYNC_DOCUMENTATION.md`

