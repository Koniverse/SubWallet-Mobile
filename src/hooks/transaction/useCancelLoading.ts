import { useContext, useEffect, useRef } from 'react';
import { WebRunnerContext } from 'providers/contexts';

export const useCancelLoading = (setLoading: (value: boolean) => void) => {
  const isSubmit = useRef<boolean>(false);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  useEffect(() => {
    if (isSubmit.current && isNetConnected) {
      setLoading(false);
      isSubmit.current = false;
    }
  }, [isNetConnected, setLoading]);

  return { isSubmit };
};
