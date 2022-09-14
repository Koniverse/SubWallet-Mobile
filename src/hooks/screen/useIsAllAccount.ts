import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useIsAccountAll(): boolean {
  const {
    accounts: { currentAccount: account },
  } = useSelector((state: RootState) => state);

  if (!account) {
    return false;
  } else {
    return isAccountAll(account.address);
  }
}
