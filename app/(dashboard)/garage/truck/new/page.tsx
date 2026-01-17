import { Header } from '@/components/layout/Header';
import { NewTruckForm } from './NewTruckForm';

export default function NewTruckPage() {
  return (
    <>
      <Header 
        title="Add New Truck" 
        subtitle="Add a truck to your fleet"
      />
      <NewTruckForm />
    </>
  );
}
