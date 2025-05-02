import { mockPqAddress, mockSigningMessage } from '@/mock-data';

class RegistrationData {
  private pqAddress: string;

  constructor() {
    this.pqAddress = '';
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

  validateSignature(signature: string) {
    // TODO: validateSignature logic
    return signature.length > 3;
  }
}

export const registrationData = new RegistrationData();
