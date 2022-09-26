import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useIsAccountAll(): boolean {
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  return useMemo((): boolean => {
    return isAccountAll(currentAccountAddress);
  }, [currentAccountAddress]);
}
