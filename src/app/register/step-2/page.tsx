import { Metadata } from 'next';
import { RegistrationStep2 } from '@/app/components/RegistrationStep2';

export const metadata: Metadata = {
  title: 'Step 2'
};

export default function RegistrationStep2Page() {
  return <RegistrationStep2 />;
}
