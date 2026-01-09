'use client';

import localFont from 'next/font/local';
import { DevelopmentBanner } from './components/DevelopmentBanner';
import { Alert } from './components/Alert';
import styles from './global-error.styles.module.css';
import './globals.css';

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  weight: '400 500 600'
});

export default function GlobalError() {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body className={geistMono.className}>
        {process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' && (
          <DevelopmentBanner />
        )}
        <main>
          <h1 className={styles.title}>An error has occurred</h1>
          <p>Please refresh your browser and try again.</p>
          <div className={styles.alertSection}>
            <Alert>
              If the error persists, please{' '}
              <a
                href='https://www.projecteleven.com/contact'
                target='_blank'
                className={styles.contactLink}
              >
                contact us
              </a>
              .
            </Alert>
          </div>
        </main>
      </body>
    </html>
  );
}
