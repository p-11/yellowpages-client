import { RegistrationProvider } from '../providers/RegistrationProvider';

export default function RegistrationLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
