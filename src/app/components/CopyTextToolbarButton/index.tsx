import { useCallback, useRef, useState } from 'react';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CheckIcon } from '@/app/icons/CheckIcon';
import { CopyIcon } from '@/app/icons/CopyIcon';

export function CopyTextToolbarButton({ onClick }: { onClick: () => void }) {
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
    <ToolbarButton onClick={clickHandler}>
      {isIndicatorVisible ? (
        <>
          <CheckIcon stroke='#7fd17f' />
          Copied
        </>
      ) : (
        <>
          <CopyIcon />
          Copy
        </>
      )}
    </ToolbarButton>
  );
}
