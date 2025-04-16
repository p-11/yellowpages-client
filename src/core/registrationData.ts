import { mockSeedPhrase } from '@/mock-data';

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

  getSeedPhrase() {
    return this.seedPhrase;
  }

  clearSeedPhrase() {
    this.seedPhrase = '';
  }
}

export const registrationData = new RegistrationData();
