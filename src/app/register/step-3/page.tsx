import { RegistrationStep3 } from '@/app/components/RegistrationStep3';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Step 3'
};

export default function RegistrationStep3Page() {
  return <RegistrationStep3 />;
}
