import { useCallback, useState, forwardRef, useRef } from 'react';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CheckIcon } from '@/app/icons/CheckIcon';
import { CopyIcon } from '@/app/icons/CopyIcon';

export const CopyTextToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    label?: string;
    onClick: () => void;
  }
>(function CopyTextToolbarButton({ label = 'Copy', onClick }, ref) {
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const clickHandler = useCallback(() => {
    onClick();

    setIsIndicatorVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsIndicatorVisible(false);
      timeoutRef.current = null;
    }, 1000);
  }, [onClick]);

  return (
    <ToolbarButton ref={ref} onClick={clickHandler}>
      {isIndicatorVisible ? (
        <>
          <CheckIcon />
          Copied
        </>
      ) : (
        <>
          <CopyIcon />
          {label}
        </>
      )}
    </ToolbarButton>
  );
});
