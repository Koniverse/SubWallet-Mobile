import { useSelector } from 'react-redux';
import { RootState } from 'stores/index.ts';
import { AccountState } from 'stores/types.ts';

function comparor(prev: AccountState, next: AccountState): boolean {
  if (next.isReady) {
    if ((prev.accounts.length && !next.accounts.length) || (!prev.accounts.length && next.accounts.length)) {
      return false;
    }
  }

  return true;
}

export default function useCheckEmptyAccounts(): boolean {
  const { accounts } = useSelector((state: RootState) => state.accountState, comparor);

  return !accounts.length;
}
