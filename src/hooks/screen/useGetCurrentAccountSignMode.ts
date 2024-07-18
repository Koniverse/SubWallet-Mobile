import { RootState } from 'stores/index';
import { AccountSignMode } from 'types/signer';
import { getSignMode } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetCurrentAccountSignMode = (): AccountSignMode => {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  return useMemo((): AccountSignMode => {
    return getSignMode(currentAccount);
  }, [currentAccount]);
};

export default useGetCurrentAccountSignMode;
