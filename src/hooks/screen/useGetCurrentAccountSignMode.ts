import { RootState } from 'stores/index';
import { getSignMode } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AccountSignMode } from '@subwallet/extension-base/types';

const useGetCurrentAccountSignMode = (): AccountSignMode => {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  return useMemo((): AccountSignMode => {
    return getSignMode(currentAccount);
  }, [currentAccount]);
};

export default useGetCurrentAccountSignMode;
