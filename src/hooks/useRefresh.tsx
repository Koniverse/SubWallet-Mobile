import React, { useCallback } from 'react';
import { hotReload } from '../messaging';

export const useRefresh = () => {
  const [isRefresh, setIsRefresh] = React.useState(false);

  const refeshWebview = useCallback(() => {
    setIsRefresh(true);
    hotReload().then(() => {
      setIsRefresh(false);
    });
  }, []);

  return [
    isRefresh,
    () => {
      setIsRefresh(true);
      refeshWebview();
    },
  ] as const;
};
