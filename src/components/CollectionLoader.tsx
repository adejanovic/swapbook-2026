'use client';
import { useEffect } from 'react';
import { useCollection } from '@/lib/store/collection';
import { supabase } from '@/lib/supabase/client';

export function CollectionLoader() {
  const load = useCollection(s => s.load);
  const isLoaded = useCollection(s => s.isLoaded);

  useEffect(() => {
    if (isLoaded) return;
    supabase().auth.getUser().then(({ data: { user } }) => {
      if (user) load(user.id);
    });
  }, [load, isLoaded]);

  return null;
}
