import { RegistrationSessionProvider } from '../../providers/RegistrationSessionProvider';

export default function RegisterLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RegistrationSessionProvider>{children}</RegistrationSessionProvider>;
}
