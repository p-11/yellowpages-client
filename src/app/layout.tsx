import localFont from 'next/font/local';
import { DevelopmentBanner } from './components/DevelopmentBanner';
import { ConsoleWarning } from './components/ConsoleWarning';
import './globals.css';

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  weight: '400 500 600'
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body className={geistMono.className}>
        {process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' && (
          <DevelopmentBanner />
        )}
        {children}
        <ConsoleWarning />
      </body>
    </html>
  );
}
