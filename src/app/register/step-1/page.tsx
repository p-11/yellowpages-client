import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';

export default function RegistrationStep1Page() {
  return (
    <main>
      <RegistrationProgressIndicator activeStep='Step 1' />
      <RegistrationStepTitle>
        Make a backup of your Post-Quantum seed phrase
      </RegistrationStepTitle>
    </main>
  );
}
