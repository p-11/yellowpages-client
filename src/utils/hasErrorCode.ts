export const hasErrorCode = (e: unknown): e is { code: string | number } => {
  return typeof e === 'object' && e !== null && 'code' in e;
};
