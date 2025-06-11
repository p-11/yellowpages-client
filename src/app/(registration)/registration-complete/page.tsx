import { Metadata } from 'next';
import { RegistrationComplete } from '@/app/components/RegistrationComplete';

export const metadata: Metadata = {
  title: 'Registration Complete'
};

export default function RegistrationCompletePage() {
  return <RegistrationComplete />;
}
