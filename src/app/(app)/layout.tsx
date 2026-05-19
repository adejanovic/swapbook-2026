import { BottomNav } from '@/components/BottomNav';
import { CollectionLoader } from '@/components/CollectionLoader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 50, paddingBottom: 96, minHeight: '100dvh' }}>
      <CollectionLoader />
      {children}
      <BottomNav />
    </div>
  );
}
