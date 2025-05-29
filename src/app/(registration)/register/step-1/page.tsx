import { Metadata } from 'next';
import { RegistrationStep1 } from '@/app/components/RegistrationStep1';

export const metadata: Metadata = {
  title: 'Register - Step 1'
};

export default function RegistrationStep1Page() {
  return <RegistrationStep1 />;
}
