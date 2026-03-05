# Aggressive Sync Architecture - Visual Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SKYWAY SUITES APPLICATION                          │
│                        (React + TypeScript + Supabase)                       │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌────────────────────┐          ┌────────────────────┐
        │   USER INTERFACE   │          │  DATA OPERATIONS   │
        │   (Pages/Views)    │          │  (Add/Edit/Delete) │
        └────────┬───────────┘          └──────────┬─────────┘
                 │                                 │
                 │                                 │
                 └─────────────┬───────────────────┘
                               │
                               ▼
                ┌──────────────────────────────────┐
                │   REALTIME DATA MANAGER          │
                │   (realtime-data-manager.ts)     │
                │                                  │
                │  • savePropertyRealtime()        │
                │  • deleteBookingRealtime()       │
                │  • savePaymentRealtime()         │
                │  • ALL CRUD operations           │
                └────────────┬─────────────────────┘
                             │
                             │ ← Triggers after every operation
                             ▼
                ┌──────────────────────────────────┐
                │  AGGRESSIVE SYNC MANAGER         │
                │  (aggressive-sync-manager.ts)    │
                │                                  │
                │  syncAfterOperation()            │
                │  bidirectionalSync()             │
                │  quickUploadSync()               │
                └────────────┬─────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ THROTTLE │  │  MUTEX   │  │  EVENTS  │
        │  (1 sec) │  │  LOCK    │  │  NOTIFY  │
        └──────────┘  └──────────┘  └──────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  QUICK UPLOAD    │      │   FULL SYNC      │
    │  syncToSupabase()│      │  upload+download │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             └───────────┬─────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │    DATA SERVICE          │
            │   (data-service.ts)      │
            │                          │
            │  • fetchWithAuth()       │
            │  • API calls to server   │
            └────────────┬─────────────┘
                         │
                         │ HTTP Requests
                         ▼
            ┌─────────────────────────┐
            │   SUPABASE SERVER        │
            │  (Edge Function)         │
            │                          │
            │  • /properties           │
            │  • /bookings             │
            │  • /payments             │
            │  • /customers            │
            │  • /sync/upload          │
            │  • /sync/download        │
            └────────────┬─────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │   SUPABASE DATABASE      │
            │   (KV Store)             │
            │                          │
            │  property:{id}           │
            │  booking:{id}            │
            │  payment:{id}            │
            │  customer:{id}           │
            │  app:settings            │
            │  app:categories          │
            │  app:features            │
            └──────────────────────────┘
```

## Background Sync Timer

```
┌───────────────────────────────────────────────────────────┐
│              BACKGROUND SYNC PROCESS                       │
│                                                            │
│   Started by: DataSyncWrapper on mount                    │
│   Frequency: Every 5 seconds                              │
│   Type: Full bidirectional sync                           │
│                                                            │
│   ┌──────────────────────────────────────┐               │
│   │  Timer Loop (setInterval)             │               │
│   │                                       │               │
│   │  Every 5 seconds:                     │               │
│   │    1. Check if cloud mode enabled     │               │
│   │    2. Call bidirectionalSync()        │               │
│   │    3. Upload all local data           │               │
│   │    4. Download all cloud data         │               │
│   │    5. Update local storage            │               │
│   │    6. Notify listeners (status)       │               │
│   │    7. Wait 5 seconds                  │               │
│   │    8. Repeat...                       │               │
│   │                                       │               │
│   └──────────────────────────────────────┘               │
│                                                            │
│   Benefits:                                               │
│   ✓ Keeps data fresh without user action                 │
│   ✓ Syncs changes from other devices                     │
│   ✓ Recovers from temporary network issues               │
│   ✓ Ensures data consistency                             │
└───────────────────────────────────────────────────────────┘
```

## Event Flow Diagram

```
USER ACTION
    │
    │ (e.g., "Add Property")
    ▼
┌─────────────────────┐
│ UI Component        │
│ (admin-dashboard)   │
└──────────┬──────────┘
           │
           │ calls
           ▼
┌─────────────────────┐
│ saveProperty()      │
│ (realtime-data-     │
│  manager.ts)        │
└──────────┬──────────┘
           │
           │ 1. Saves data
           │ 2. Calls syncAfterOperation()
           ▼
┌─────────────────────┐
│ syncAfterOperation()│
│ (aggressive-sync-   │
│  manager.ts)        │
└──────────┬──────────┘
           │
           │ Triggers
           ▼
┌─────────────────────┐
│ quickUploadSync()   │
│                     │
│ • Uploads to cloud  │
│ • Fast operation    │
└──────────┬──────────┘
           │
           │ HTTP POST
           ▼
┌─────────────────────┐
│ Supabase Server     │
│ /sync/upload        │
│                     │
│ Saves to KV Store   │
└──────────┬──────────┘
           │
           │ Success
           ▼
┌─────────────────────┐
│ Sync Listeners      │
│ Notified            │
│                     │
│ • Cloud indicator   │
│ • Sync stats        │
│ • Toast (optional)  │
└─────────────────────┘
           │
           │ Visual feedback
           ▼
┌─────────────────────┐
│ User sees:          │
│ • Spinning icon     │
│ • "Syncing..."      │
│ • Then "Synced!"    │
└─────────────────────┘
```

## Component Hierarchy

```
App.tsx
  │
  ├─ DataSyncWrapper
  │    │
  │    ├─ syncOnLoad() ← Page load sync
  │    ├─ startBackgroundSync() ← Every 5 sec
  │    └─ Event listeners
  │
  ├─ RouterProvider
  │    │
  │    ├─ HomePage
  │    ├─ PropertyDetails
  │    ├─ AdminDashboard
  │    │    │
  │    │    └─ Uses realtime-data-manager
  │    │         │
  │    │         └─ Triggers syncAfterOperation()
  │    │
  │    └─ Settings
  │         │
  │         ├─ SyncStatsDisplay ← Shows sync stats
  │         └─ Cloud mode toggle
  │
  ├─ CloudStatusIndicator ← Visual sync feedback
  │    │
  │    └─ Listens to sync events
  │
  ├─ Toaster (sonner)
  │
  └─ SyncToastNotifier (optional)
       │
       └─ Shows toast notifications
```

## Data Flow: Adding a Booking

```
Step 1: USER CLICKS "Add Booking"
         │
         ▼
Step 2: Form data submitted
         │
         ▼
Step 3: saveBookingRealtime(bookingData)
         │
         ├─ If cloud mode:
         │   └─ POST /bookings → Supabase
         │
         ├─ If local mode:
         │   └─ localStorage.setItem()
         │
         └─ syncAfterOperation() ← TRIGGERED
              │
              ▼
Step 4: quickUploadSync()
         │
         └─ POST /sync/upload
              │
              └─ All local data → Supabase
                   │
                   ▼
Step 5: Supabase saves to KV Store
         │
         └─ booking:{id} stored
              │
              ▼
Step 6: Sync listeners notified
         │
         ├─ CloudStatusIndicator → Shows "Syncing..."
         ├─ SyncStatsDisplay → Increments count
         └─ Console → Logs sync info
              │
              ▼
Step 7: Success callback
         │
         └─ CloudStatusIndicator → Shows "Synced!"
              │
              ▼
Step 8: 5 seconds later...
         │
         └─ Background sync runs
              │
              └─ Full bidirectional sync
                   │
                   ├─ Upload all data
                   └─ Download all data
                        │
                        └─ Ensures perfect consistency
```

## Sync State Machine

```
┌─────────────────┐
│  INITIAL STATE  │
│   (App Start)   │
└────────┬────────┘
         │
         │ Page load
         ▼
┌─────────────────┐
│   SYNCING       │ ◄──────────────┐
│   (Blue icon)   │                │
└────────┬────────┘                │
         │                         │
         │ Success                 │
         ▼                         │
┌─────────────────┐                │
│   SYNCED        │                │
│   (Green icon)  │                │
└────────┬────────┘                │
         │                         │
         │ After 2 seconds         │
         ▼                         │
┌─────────────────┐                │
│   IDLE          │                │
│   (Green icon)  │                │
│   "Cloud Mode"  │                │
└────────┬────────┘                │
         │                         │
         │ Triggered by:           │
         │ • User action           │
         │ • Background timer (5s) │
         │ • Page refresh          │
         │ • Settings save         │
         └─────────────────────────┘

Error path:
┌─────────────────┐
│   SYNCING       │
└────────┬────────┘
         │
         │ Error
         ▼
┌─────────────────┐
│   ERROR         │
│   (Red icon)    │
│   "Sync Error"  │
└────────┬────────┘
         │
         │ After 2 seconds
         ▼
┌─────────────────┐
│   IDLE          │
│   (Returns to   │
│    green)       │
└─────────────────┘
```

## Throttling Mechanism

```
Time: 0ms    1000ms   2000ms   3000ms   4000ms   5000ms   6000ms
      │       │        │        │        │        │        │
      ▼       ▼        ▼        ▼        ▼        ▼        ▼
Sync  ✓       ✗        ✗        ✓        ✗        ✓        ✗
      │                         │                 │
      └─ Allowed                └─ Allowed        └─ Allowed
              └─ Throttled ─────┘                 
                (1 sec min)
                
Legend:
✓ = Sync allowed (more than 1 second since last sync)
✗ = Sync blocked (throttled - less than 1 second since last)

Why throttle?
• Prevents sync storms from rapid user actions
• Reduces server load
• Improves performance
• Background sync still runs every 5 seconds
```

## Multi-Device Sync Scenario

```
Device A                    Supabase Cloud                Device B
(Desktop)                   (Database)                    (Mobile)

  │                              │                           │
  │ Add Property                 │                           │
  │ "Beach Villa"                │                           │
  ├──────────────────────────────►                           │
  │ POST /properties             │                           │
  │                              │                           │
  │                         Save to KV                       │
  │                     property:12345                       │
  │                              │                           │
  │                              │                           │
  │                              │    ◄──────────────────────┤
  │                              │    Background sync (5s)   │
  │                              │                           │
  │                              │    GET /sync/download     │
  │                              ├──────────────────────────►│
  │                              │                           │
  │                              │  Return all properties    │
  │                              │  (including "Beach Villa")│
  │                              │                           │
  │                              │                           ├─ Receives
  │                              │                           │  "Beach Villa"
  │                              │                           │
  │                              │                           ├─ UI updates
  │                              │                           │  automatically
  │                              │                           │
  │                              │                           │
  │ Background sync (5s)         │                           │
  ├──────────────────────────────►                           │
  │ POST /sync/upload            │                           │
  │                              │                           │
  │                              │                           │
  │ GET /sync/download           │                           │
  ├──────────────────────────────►                           │
  │                              │                           │
  │ ◄────────────────────────────┤                           │
  │ Returns fresh data           │                           │
  │                              │                           │

Result: Both devices stay synchronized within 5 seconds!
```

## Sync Performance Profile

```
Operation Type          Speed       Network      User Impact
─────────────────────────────────────────────────────────────
Quick Upload (CRUD)     ~100-300ms  1 request    Instant
Full Sync (Load)        ~300-800ms  2 requests   Slight delay
Background Sync (5s)    ~300-800ms  2 requests   Invisible
Settings Save           ~300-800ms  2 requests   Brief pause

Network Bandwidth (estimated):
• Quick Upload: ~10-50 KB
• Full Sync: ~50-500 KB (depends on data size)
• Background: ~50-500 KB every 5 seconds

Server Load:
• Quick Upload: 1 POST request
• Full Sync: 1 POST + 1 GET request
• Background: 2 requests per device every 5 seconds

Optimization Notes:
✓ Throttling reduces duplicate syncs
✓ Mutex lock prevents concurrent syncs
✓ Quick upload faster than full sync
✓ Background sync happens in the background (non-blocking)
```

---

## Summary

The aggressive sync architecture ensures that:

1. **Every action syncs** - Add/Edit/Delete operations trigger immediate upload
2. **Every event syncs** - Page load, refresh, settings save trigger full sync
3. **Background syncs continuously** - Every 5 seconds, full bidirectional sync
4. **Visual feedback** - Users always know the sync status
5. **Performance optimized** - Throttling and smart triggering prevent issues
6. **Multi-device ready** - Changes propagate to all devices within seconds

This creates a **seamless, real-time, cloud-based experience** for Skyway Suites users!
