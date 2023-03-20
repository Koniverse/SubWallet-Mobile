import React, { useCallback } from 'react';

export const useRefresh = () => {
  const [isRefresh, setIsRefresh] = React.useState(false);

  const refeshWebview = useCallback((reloadPromise: Promise<unknown>) => {
    setIsRefresh(true);
    reloadPromise.then(() => {
      setIsRefresh(false);
    });
  }, []);

  return [isRefresh, refeshWebview] as const;
};
