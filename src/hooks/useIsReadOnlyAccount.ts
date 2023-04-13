import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findAccountByAddress } from 'utils/account';

const useIsReadOnlyAccount = (address?: string): boolean => {
  const { accounts } = useSelector((state: RootState) => state.accountState);

  return useMemo(() => {
    const account = findAccountByAddress(accounts, address);

    return !!account?.isReadOnly;
  }, [accounts, address]);
};

export default useIsReadOnlyAccount;
