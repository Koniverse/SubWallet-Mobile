import { RootState } from 'stores/index';
import { SIGN_MODE } from 'types/signer';
import { getAccountSignMode } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetCurrentAccountSignMode = (): SIGN_MODE => {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  return useMemo((): SIGN_MODE => {
    return getAccountSignMode(currentAccount);
  }, [currentAccount]);
};

export default useGetCurrentAccountSignMode;
