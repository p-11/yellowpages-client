import { mockSeedPhrase, mockSigningMessage } from '@/mock-data';

class RegistrationData {
  private seedPhrase: string;

  constructor() {
    this.seedPhrase = '';
  }

  generateSeedPhrase() {
    // TODO: generateSeedPhrase logic
    this.seedPhrase = mockSeedPhrase;
    return this.seedPhrase;
  }

  generateSigningMessage() {
    // TODO: generateSigningMessage logic
    return mockSigningMessage;
  }

  getSeedPhrase() {
    return this.seedPhrase;
  }

  clearSeedPhrase() {
    this.seedPhrase = '';
  }
}

export const registrationData = new RegistrationData();
