import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useIsAccountAll(): boolean {
  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);

  if (!currentAccount) {
    return false;
  } else {
    return isAccountAll(currentAccount.address);
  }
}
