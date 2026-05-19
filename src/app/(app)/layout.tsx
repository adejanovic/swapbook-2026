import { BottomNav } from '@/components/BottomNav';
import { CollectionLoader } from '@/components/CollectionLoader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 50, paddingBottom: 100, minHeight: '100dvh', overflowX: 'hidden', maxWidth: '100vw' }}>
      <CollectionLoader />
      {children}
      <BottomNav />
    </div>
  );
}
