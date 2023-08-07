import { RootState } from 'stores/index';
import { AccountSignMode } from 'types/signer';
import { getAccountSignMode } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetCurrentAccountSignMode = (): AccountSignMode => {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  return useMemo((): AccountSignMode => {
    return getAccountSignMode(currentAccount);
  }, [currentAccount]);
};

export default useGetCurrentAccountSignMode;
