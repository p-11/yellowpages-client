import { VerificationProvider } from '@/app/providers/VerificationProvider';

export default function VerificationLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <VerificationProvider>{children}</VerificationProvider>;
}
