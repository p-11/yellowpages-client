import { Metadata } from 'next';
import { Verification } from '../components/Verification';

export const metadata: Metadata = {
  title: 'Verification'
};

export default function VerificationPage() {
  return <Verification />;
}
