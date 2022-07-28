import React, { useContext } from 'react';
import { WebViewContext } from 'providers/contexts';

export const useRefresh = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { viewRef } = useContext(WebViewContext);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isRefreshing) {
        setIsRefreshing(false);
        if (viewRef && viewRef.current) {
          viewRef.current.reload();
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isRefreshing]);

  return [
    isRefreshing,
    () => {
      setIsRefreshing(true);
    },
  ] as const;
};
