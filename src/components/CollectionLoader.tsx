'use client';
import { useEffect } from 'react';
import { useCollection } from '@/lib/store/collection';
import { supabase } from '@/lib/supabase/client';

export function CollectionLoader() {
  const load = useCollection(s => s.load);
  const isLoaded = useCollection(s => s.isLoaded);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase().auth.getUser();
      load(user?.id);
    };
    if (!isLoaded) init();
  }, [load, isLoaded]);

  return null;
}
