import {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CheckIcon } from '@/app/icons/CheckIcon';
import { CopyIcon } from '@/app/icons/CopyIcon';

export const CopyTextToolbarButton = forwardRef(function CopyTextToolbarButton(
  {
    label = 'Copy',
    onClick
  }: {
    label?: string;
    onClick: () => void;
  },
  ref
) {
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const showSuccessIndicator = useCallback(() => {
    setIsIndicatorVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsIndicatorVisible(false);
      timeoutRef.current = null;
    }, 1000);
  }, []);

  const clickHandler = useCallback(() => {
    onClick();
    showSuccessIndicator();
  }, [onClick, showSuccessIndicator]);

  useImperativeHandle(ref, () => ({
    showSuccessIndicator
  }));

  return (
    <ToolbarButton onClick={clickHandler}>
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
