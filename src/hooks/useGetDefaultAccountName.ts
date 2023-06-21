import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from '@subwallet/extension-base/utils';

const useGetDefaultAccountName = () => {
  const { accounts } = useSelector((state: RootState) => state.accountState);

  return useMemo(() => {
    const filtered = accounts.filter(account => !isAccountAll(account.address));

    return `Account ${filtered.length + 1}`;
  }, [accounts]);
};

export default useGetDefaultAccountName;
