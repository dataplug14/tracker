import { Header } from '@/components/layout/Header';
import { NewTrailerForm } from './NewTrailerForm';

export default function NewTrailerPage() {
  return (
    <>
      <Header 
        title="Add Trailer" 
        subtitle="Register a new trailer to your fleet"
      />
      <NewTrailerForm />
    </>
  );
}
