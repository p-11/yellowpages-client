import { RegistrationProgressProvider } from '@/app/providers/RegistrationProgressProvider';

export default function RegisterLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RegistrationProgressProvider>{children}</RegistrationProgressProvider>
  );
}
