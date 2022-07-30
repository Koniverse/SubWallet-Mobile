import React, { useContext } from 'react';
import { WebViewContext } from 'providers/contexts';

export const useRefresh = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { viewRef } = useContext(WebViewContext);
  React.useEffect(() => {
    if (viewRef && viewRef.current) {
      viewRef.current.reload();
    }
    const timer = setTimeout(() => {
      if (isRefreshing) {
        setIsRefreshing(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isRefreshing, viewRef]);

  return [
    isRefreshing,
    () => {
      setIsRefreshing(true);
    },
  ] as const;
};
