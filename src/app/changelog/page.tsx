import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { releases } from '@/data/changelog';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'Changelog'
};

export default function ChangelogPage() {
  if (releases.length < 1) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <Link href='/'>yellowpages.xyz</Link>
      <h1 className={styles.title}>Changelog</h1>
      <div className={styles.content}>
        {releases.map(item => (
          <div key={item.version} className={styles.release}>
            <h2 className={styles.releaseHeading}>
              Version: <span>{item.version}</span>
            </h2>
            <h3 className={styles.releaseHeading}>
              Release date: <span>{item.releaseDate}</span>
            </h3>
            <div className={styles.releaseChanges}>
              <h3 className={styles.releaseHeading}>Changes:</h3>
              <ul>
                {item.changes.map(change => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
