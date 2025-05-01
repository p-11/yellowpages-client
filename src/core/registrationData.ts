import { mockPqAddress, mockSigningMessage } from '@/mock-data';

class RegistrationData {
  private pqAddress: string;
  private bitcoinAddress: string;

  constructor() {
    this.pqAddress = '';
    this.bitcoinAddress = '';
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

  validateBitcoinAddress(bitcoinAddress: string) {
    // TODO: validateBitcoinAddress logic
    return bitcoinAddress.length > 3;
  }

  validateSignature(signature: string) {
    // TODO: validateSignature logic
    return signature.length > 3;
  }
}

export const registrationData = new RegistrationData();
