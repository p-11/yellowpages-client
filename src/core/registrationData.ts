import { mockPqAddress, mockSeedPhrase, mockSigningMessage } from '@/mock-data';

class RegistrationData {
  private seedPhrase: string;
  private pqAddress: string;
  private bitcoinAddress: string;

  constructor() {
    this.seedPhrase = '';
    this.pqAddress = '';
    this.bitcoinAddress = '';
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

  generateSigningMessage() {
    // TODO: generateSigningMessage logic
    return mockSigningMessage;
  }

  generatePqAddress() {
    // TODO: generatePqAddress logic
    this.pqAddress = mockPqAddress;
    return this.pqAddress;
  }

  getPqAddress() {
    return this.pqAddress;
  }

  clearPqAddress() {
    this.pqAddress = '';
  }

  setBitcoinAddress(bitcoinAddress: string) {
    this.bitcoinAddress = bitcoinAddress;
  }

  getBitcoinAddress() {
    return this.bitcoinAddress;
  }

  clearBitcoinAddress() {
    this.bitcoinAddress = '';
  }
}

export const registrationData = new RegistrationData();
