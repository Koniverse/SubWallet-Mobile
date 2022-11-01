import { RootState } from 'stores/index';
import { SIGN_MODE } from 'types/signer';
import { getAccountSignMode } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetCurrentAccountSignMode = (): SIGN_MODE => {
  const account = useSelector((state: RootState) => state.accounts.currentAccount);

  return useMemo((): SIGN_MODE => {
    return getAccountSignMode(account);
  }, [account]);
};

export default useGetCurrentAccountSignMode;
