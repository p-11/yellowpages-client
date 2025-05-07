import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Home'
};

export default function HomePage() {
  return (
    <main className={styles.homepage}>
      <Link href='/register/step-1'>Register</Link>
      <Link href='/search'>Check the registry</Link>
    </main>
  );
}
