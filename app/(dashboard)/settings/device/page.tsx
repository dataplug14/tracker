import { Header } from '@/components/layout/Header';
import { DeviceLinkContent } from './DeviceLinkContent';

export default function DeviceLinkPage() {
  return (
    <>
      <Header 
        title="Desktop App" 
        subtitle="Link the VTC Tracker companion app"
      />
      <DeviceLinkContent />
    </>
  );
}
