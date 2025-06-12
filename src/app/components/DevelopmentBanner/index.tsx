'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';

export function DevelopmentBanner() {
  const pathname = usePathname();

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <span>
          Note, this is a development environment. Do not register a Bitcoin address with mainnet funds.
        </span>
        {pathname === '/register/step-2' && (
          <div>
            <Link href='/register/step-3' className={styles.skipStepButton}>
              Skip this step
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
