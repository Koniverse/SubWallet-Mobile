import { RootState } from 'stores/index';
import { AccountSignType } from 'types/account';
import { getAccountSignType } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetCurrentAccountSignType = (): AccountSignType => {
  const account = useSelector((state: RootState) => state.accounts.currentAccount);

  return useMemo((): AccountSignType => {
    return getAccountSignType(account);
  }, [account]);
};

export default useGetCurrentAccountSignType;
