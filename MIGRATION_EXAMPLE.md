# Migration Example: localStorage → Supabase

## Pattern to Follow

This document shows the exact changes needed to migrate from localStorage to Supabase.

## Example 1: Loading Data

### ❌ OLD CODE (localStorage)
```typescript
import { useState, useEffect } from 'react';

export function HomePage() {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Load from localStorage
  useEffect(() => {
    const loadedProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
    const loadedBookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
    setProperties(loadedProperties);
    setBookings(loadedBookings);
  }, []);
  
  return <div>...</div>;
}
```

### ✅ NEW CODE (Supabase)
```typescript
import { useState, useEffect } from 'react';
import { fetchProperties, fetchBookings } from '../../lib/supabaseData';
import { checkConnection } from '../../lib/connectionStatus';

export function HomePage() {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load from Supabase
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    if (!checkConnection()) {
      console.error('No internet connection');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [propertiesData, bookingsData] = await Promise.all([
        fetchProperties(),
        fetchBookings()
      ]);
      setProperties(propertiesData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return <div>...</div>;
}
```

## Example 2: Creating Data

### ❌ OLD CODE (localStorage)
```typescript
const handleCreateProperty = () => {
  const existingProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  
  const newProperty = {
    id: String(Date.now()),
    propertyName: 'New Property',
    location: 'Nairobi',
    price: 85000,
    isAvailable: true,
    photos: [],
    features: []
  };
  
  existingProperties.push(newProperty);
  localStorage.setItem('skyway_properties', JSON.stringify(existingProperties));
  setProperties(existingProperties);
  
  showModal('success', 'Property created successfully');
};
```

### ✅ NEW CODE (Supabase)
```typescript
import { createProperty } from '../../lib/supabaseData';

const handleCreateProperty = async () => {
  if (!checkConnection()) {
    showModal('error', 'No internet connection');
    return;
  }
  
  try {
    const newProperty = await createProperty({
      property_name: 'New Property', // Note: property_name not propertyName
      category_id: 1,
      location: 'Nairobi',
      no_of_beds: 2,
      bathrooms: 2,
      area_sqft: 1200,
      description: 'Description here',
      price_per_month: 85000,
      security_deposit: 85000,
      photos: JSON.stringify([]), // Must be JSON string
      features: JSON.stringify([]), // Must be JSON string
      is_available: true,
      is_featured: false,
      view_count: 0
    });
    
    // Refresh the list
    await loadData();
    
    showModal('success', 'Property created successfully');
  } catch (error) {
    console.error('Error creating property:', error);
    showModal('error', 'Failed to create property');
  }
};
```

## Example 3: Updating Data

### ❌ OLD CODE (localStorage)
```typescript
const handleUpdateProperty = (propertyId) => {
  const existingProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  
  const updatedProperties = existingProperties.map(p => 
    p.id === propertyId 
      ? { ...p, isAvailable: false, location: 'Updated Location' }
      : p
  );
  
  localStorage.setItem('skyway_properties', JSON.stringify(updatedProperties));
  setProperties(updatedProperties);
};
```

### ✅ NEW CODE (Supabase)
```typescript
import { updateProperty } from '../../lib/supabaseData';

const handleUpdateProperty = async (propertyId: number) => {
  if (!checkConnection()) {
    showModal('error', 'No internet connection');
    return;
  }
  
  try {
    await updateProperty(propertyId, {
      is_available: false,
      location: 'Updated Location'
    });
    
    // Refresh the list
    await loadData();
    
    showModal('success', 'Property updated successfully');
  } catch (error) {
    console.error('Error updating property:', error);
    showModal('error', 'Failed to update property');
  }
};
```

## Example 4: Deleting Data

### ❌ OLD CODE (localStorage)
```typescript
const handleDeleteProperty = (propertyId) => {
  const existingProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const updatedProperties = existingProperties.filter(p => p.id !== propertyId);
  
  localStorage.setItem('skyway_properties', JSON.stringify(updatedProperties));
  setProperties(updatedProperties);
};
```

### ✅ NEW CODE (Supabase)
```typescript
import { deleteProperty } from '../../lib/supabaseData';

const handleDeleteProperty = async (propertyId: number) => {
  if (!checkConnection()) {
    showModal('error', 'No internet connection');
    return;
  }
  
  try {
    await deleteProperty(propertyId);
    
    // Refresh the list
    await loadData();
    
    showModal('success', 'Property deleted successfully');
  } catch (error) {
    console.error('Error deleting property:', error);
    showModal('error', 'Failed to delete property');
  }
};
```

## Example 5: Field Name Mapping

### localStorage (camelCase) → Supabase (snake_case)

| localStorage      | Supabase           |
|-------------------|--------------------| 
| `id`              | `property_id`      |
| `propertyName`    | `property_name`    |
| `noOfBeds`        | `no_of_beds`       |
| `pricePerMonth`   | `price_per_month`  |
| `isAvailable`     | `is_available`     |
| `isFeatured`      | `is_featured`      |
| `viewCount`       | `view_count`       |
| `checkIn`         | `check_in_date`    |
| `checkOut`        | `check_out_date`   |
| `customerId`      | `customer_id`      |
| `customerName`    | `customer_name`    |
| `paymentStatus`   | `payment_status`   |
| `bookingStatus`   | `booking_status`   |

## Example 6: JSON Fields

Some fields store arrays as JSON strings:

```typescript
// ✅ Storing
const property = await createProperty({
  // ...other fields
  photos: JSON.stringify(['url1.jpg', 'url2.jpg']),
  features: JSON.stringify([1, 2, 3, 4]) // Feature IDs
});

// ✅ Reading
const photos = JSON.parse(property.photos || '[]');
const featureIds = JSON.parse(property.features || '[]');
```

## Example 7: Adding Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSave = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await createProperty(data);
    showModal('success', 'Saved successfully');
  } catch (err: any) {
    setError(err.message);
    showModal('error', 'Failed to save');
  } finally {
    setLoading(false);
  }
};

return (
  <Button disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
  </Button>
);
```

## Checklist for Each Page

- [ ] Import required functions from `/src/lib/supabaseData`
- [ ] Import `checkConnection` from `/src/lib/connectionStatus`
- [ ] Remove `localStorage.getItem()` calls
- [ ] Remove `localStorage.setItem()` calls
- [ ] Change sync functions to `async` functions
- [ ] Add `await` before all Supabase calls
- [ ] Add try-catch error handling
- [ ] Add loading states
- [ ] Update field names (camelCase → snake_case)
- [ ] Convert ID strings to numbers where needed
- [ ] Stringify JSON fields (photos, features)
- [ ] Test all CRUD operations

## Files That Need Updates

1. `/src/app/pages/home.tsx` - Load properties and bookings
2. `/src/app/pages/property-details.tsx` - Load property details, create bookings
3. `/src/app/pages/admin-dashboard.tsx` - All admin CRUD operations
4. `/src/app/components/header.tsx` - Load menu items
5. `/src/app/pages/settings.tsx` - Load/save settings
6. `/src/app/pages/menu-pages-manager.tsx` - Manage menu pages
7. `/src/app/pages/activity-log.tsx` - Load activity logs

## Testing

After updating each file:

1. ✅ Check browser console for errors
2. ✅ Verify data loads on page load
3. ✅ Test create operations
4. ✅ Test update operations
5. ✅ Test delete operations
6. ✅ Test with internet disconnected (should show error)
7. ✅ Check Supabase dashboard to verify data is saved
