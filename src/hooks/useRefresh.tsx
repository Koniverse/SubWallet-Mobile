import React, { useCallback, useContext } from 'react';
import { WebViewContext } from 'providers/contexts';

export const useRefresh = () => {
  const [isRefresh, setIsRefresh] = React.useState(false);
  const { viewRef, status } = useContext(WebViewContext);

  const refeshWebview = useCallback(() => {
    viewRef?.current?.reload();
  }, [viewRef]);

  React.useEffect(() => {
    setIsRefresh(status !== 'crypto_ready');
  }, [status]);

  return [
    isRefresh,
    () => {
      setIsRefresh(true);
      refeshWebview();
    },
  ] as const;
};
