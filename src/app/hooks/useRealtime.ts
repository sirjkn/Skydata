import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getSupabaseClient } from '../lib/supabase';

const supabase = getSupabaseClient();

interface UseRealtimeOptions {
  table: string;
  prefix?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeKV<T>(prefix: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log(`🔄 Setting up realtime for prefix: ${prefix}`);
    
    // Initial fetch
    fetchData();

    // Set up realtime subscription
    const channel = supabase
      .channel(`kv_store_${prefix}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kv_store_6a712830',
          filter: `key=like.${prefix}%`,
        },
        (payload) => {
          console.log(`✨ Realtime ${prefix} change:`, payload.eventType, payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newValue = payload.new.value;
            console.log(`💾 ${payload.eventType} data:`, newValue);
            
            setData((prev) => {
              const existingIndex = prev.findIndex(
                (item: any) => item.id === newValue.id
              );
              if (existingIndex >= 0) {
                // Update existing item
                const updated = [...prev];
                updated[existingIndex] = newValue;
                console.log(`✏️ Updated existing ${prefix}:`, newValue.id);
                return updated;
              } else {
                // Add new item
                console.log(`➕ Added new ${prefix}:`, newValue.id);
                return [...prev, newValue];
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedKey = payload.old.key;
            const deletedId = deletedKey.replace(`${prefix}`, '');
            console.log(`🗑️ Deleted ${prefix}:`, deletedId);
            setData((prev) => prev.filter((item: any) => item.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Realtime subscription status for ${prefix}:`, status);
      });

    return () => {
      console.log(`🔌 Cleaning up realtime channel for ${prefix}`);
      supabase.removeChannel(channel);
    };
  }, [prefix]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log(`📥 Fetching initial data for ${prefix}...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/properties`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (prefix === 'property:') {
          setData(result.properties || []);
          console.log(`✅ Loaded ${result.properties?.length || 0} properties`);
        } else if (prefix === 'booking:') {
          setData(result.bookings || []);
          console.log(`✅ Loaded ${result.bookings?.length || 0} bookings`);
        }
      } else {
        console.error(`❌ Failed to fetch ${prefix}:`, response.status);
      }
    } catch (err) {
      console.error(`❌ Error fetching ${prefix}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    console.log(`🔄 Manually refreshing ${prefix}...`);
    fetchData();
  };

  return { data, loading, error, refresh };
}

export function useRealtimeProperties() {
  return useRealtimeKV<any>('property:');
}

export function useRealtimeBookings(accessToken?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken || accessToken === '') {
      console.log('⏳ Waiting for access token...');
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up realtime for bookings...');

    // Initial fetch
    fetchData();

    // Set up realtime subscription
    const channel = supabase
      .channel('kv_store_booking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kv_store_6a712830',
          filter: 'key=like.booking:%',
        },
        (payload) => {
          console.log('✨ Realtime booking change:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newValue = payload.new.value;
            console.log('💾 Booking data:', newValue);
            
            setData((prev) => {
              const existingIndex = prev.findIndex(
                (item: any) => item.id === newValue.id
              );
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newValue;
                console.log('✏️ Updated booking:', newValue.id);
                return updated;
              } else {
                console.log('➕ Added new booking:', newValue.id);
                return [...prev, newValue];
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedKey = payload.old.key;
            const deletedId = deletedKey.replace('booking:', '');
            console.log('🗑️ Deleted booking:', deletedId);
            setData((prev) => prev.filter((item: any) => item.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Booking subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up booking channel');
      supabase.removeChannel(channel);
    };
  }, [accessToken]);

  const fetchData = async () => {
    if (!accessToken || accessToken === '') {
      console.log('⏳ Cannot fetch bookings: no access token');
      return;
    }

    try {
      setLoading(true);
      console.log('📥 Fetching bookings with token...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/bookings`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.bookings || []);
        console.log(`✅ Loaded ${result.bookings?.length || 0} bookings`);
      } else {
        console.error('❌ Failed to fetch bookings:', response.status);
        if (response.status === 401) {
          console.error('❌ Authentication error - invalid or expired token');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    console.log('🔄 Manually refreshing bookings...');
    fetchData();
  };

  return { data, loading, error, refresh };
}

export function useRealtimeCustomers(accessToken?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken || accessToken === '') {
      console.log('⏳ Waiting for access token...');
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up realtime for customers...');

    // Initial fetch
    fetchData();

    // Set up realtime subscription
    const channel = supabase
      .channel('kv_store_customer')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kv_store_6a712830',
          filter: 'key=like.customer:%',
        },
        (payload) => {
          console.log('✨ Realtime customer change:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newValue = payload.new.value;
            console.log('💾 Customer data:', newValue);
            
            setData((prev) => {
              const existingIndex = prev.findIndex(
                (item: any) => item.id === newValue.id
              );
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newValue;
                console.log('✏️ Updated customer:', newValue.id);
                return updated;
              } else {
                console.log('➕ Added new customer:', newValue.id);
                return [...prev, newValue];
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedKey = payload.old.key;
            const deletedId = deletedKey.replace('customer:', '');
            console.log('🗑️ Deleted customer:', deletedId);
            setData((prev) => prev.filter((item: any) => item.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Customer subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up customer channel');
      supabase.removeChannel(channel);
    };
  }, [accessToken]);

  const fetchData = async () => {
    if (!accessToken || accessToken === '') {
      console.log('⏳ Cannot fetch customers: no access token');
      return;
    }

    try {
      setLoading(true);
      console.log('📥 Fetching customers with token...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/customers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.customers || []);
        console.log(`✅ Loaded ${result.customers?.length || 0} customers`);
      } else {
        console.error('❌ Failed to fetch customers:', response.status);
        if (response.status === 401) {
          console.error('❌ Authentication error - invalid or expired token');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    console.log('🔄 Manually refreshing customers...');
    fetchData();
  };

  return { data, loading, error, refresh };
}