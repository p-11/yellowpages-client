export function CheckIcon({ stroke }: { stroke?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke={stroke ?? 'currentColor'}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ width: '16px' }}
    >
      <path d='M20 6 9 17l-5-5' />
    </svg>
  );
}
