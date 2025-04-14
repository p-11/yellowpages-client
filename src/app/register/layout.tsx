import { RegistrationProvider } from '@/app/providers/RegistrationProvider';

export default function RegisterLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
