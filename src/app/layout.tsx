import localFont from 'next/font/local';
import './globals.css';

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  weight: '300 400 500'
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
      <body className={geistMono.className}>{children}</body>
    </html>
  );
}
