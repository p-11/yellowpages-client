import { ErrorWithCode } from './errorWithCode';

export const hasErrorCode = (e: unknown): e is ErrorWithCode => {
  return e instanceof ErrorWithCode;
};
