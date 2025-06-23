import { RegistrationsPausedNotice } from '@/app/components/RegistrationsPausedNotice';
import { RegistrationSessionProvider } from '../../providers/RegistrationSessionProvider';

export default function RegisterLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.BOT_PROTECTION_ENABLED) {
    return <RegistrationsPausedNotice />;
  }

  return <RegistrationSessionProvider>{children}</RegistrationSessionProvider>;
}
