import { isAccountAll } from '@subwallet/extension-base/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useIsAccountAll(): boolean {
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccountAddress);

  return useMemo((): boolean => {
    return isAccountAll(currentAccountAddress);
  }, [currentAccountAddress]);
}
