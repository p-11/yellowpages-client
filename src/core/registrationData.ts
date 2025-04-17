import { mockSeedPhrase, mockSigningMessage } from '@/mock-data';

class RegistrationData {
  private seedPhrase: string;
  private signingMessage: string;

  constructor() {
    this.seedPhrase = '';
    this.signingMessage = '';
  }

  generateSeedPhrase() {
    // TODO: generateSeedPhrase logic
    this.seedPhrase = mockSeedPhrase;
    return this.seedPhrase;
  }

  generateSigningMessage() {
    // TODO: generateSigningMessage logic
    this.signingMessage = mockSigningMessage;
    return this.signingMessage;
  }

  getSeedPhrase() {
    return this.seedPhrase;
  }

  clearSeedPhrase() {
    this.seedPhrase = '';
  }

  clearSigningMessage() {
    this.signingMessage = '';
  }
}

export const registrationData = new RegistrationData();
