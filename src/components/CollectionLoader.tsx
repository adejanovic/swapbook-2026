'use client';
import { useEffect } from 'react';
import { useCollection } from '@/lib/store/collection';
import { supabase } from '@/lib/supabase/client';

export function CollectionLoader() {
  const load = useCollection(s => s.load);
  const isLoaded = useCollection(s => s.isLoaded);
  const applyRealtimeChange = useCollection(s => s.applyRealtimeChange);

  useEffect(() => {
    if (isLoaded) return;

    let channel: ReturnType<ReturnType<typeof supabase>['channel']> | null = null;

    supabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      load(user.id);

      // Realtime subscription — keeps all open tabs/devices in sync
      channel = supabase()
        .channel('collection-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'collections',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const row = (payload.new && Object.keys(payload.new).length > 0
              ? payload.new
              : payload.old) as Record<string, unknown>;
            applyRealtimeChange(
              payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              row
            );
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[collection] realtime subscribed for', user.id);
          }
        });
    });

    return () => {
      if (channel) supabase().removeChannel(channel);
    };
  }, [load, isLoaded, applyRealtimeChange]);

  return null;
}
