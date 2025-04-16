import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Home'
};

export default function HomePage() {
  return (
    <main>
      <Link href='/register/step-1'>Register</Link>
    </main>
  );
}
