import { mockSigningMessage } from '@/mock-data';

class RegistrationData {
  generateSigningMessage() {
    // TODO: generateSigningMessage logic
    return mockSigningMessage;
  }
}

export const registrationData = new RegistrationData();
