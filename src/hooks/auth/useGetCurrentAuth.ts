import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export const useGetCurrentAuth = (currentUrl?: string) => {
  const authUrls = useSelector((state: RootState) => state.settings.authUrls);

  return useMemo((): AuthUrlInfo | undefined => {
    let rs: AuthUrlInfo | undefined;

    if (currentUrl) {
      for (const auth of Object.values(authUrls)) {
        if (currentUrl.includes(auth.id)) {
          rs = auth;
          break;
        }
      }
    }

    return rs;
  }, [currentUrl, authUrls]);
};
