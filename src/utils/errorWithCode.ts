export class ErrorWithCode extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ErrorWithCode';
  }
}
