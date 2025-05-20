import { Metadata } from 'next';
import { SessionExpired } from '@/app/components/SessionExpired';

export const metadata: Metadata = {
  title: 'Session Expired'
};

export default function SessionExpiredPage() {
  return <SessionExpired />;
}
