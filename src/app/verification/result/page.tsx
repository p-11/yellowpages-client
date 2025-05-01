import { VerificationResult } from '@/app/components/VerificationResult';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification Result'
};

export default function VerificationResultPage() {
  return <VerificationResult />;
}
