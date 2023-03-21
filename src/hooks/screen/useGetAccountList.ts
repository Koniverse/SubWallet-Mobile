import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useMemo } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';

export default function useGetAccountList(networkKey?: string) {
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const accountListWithoutAll = accounts.filter(opt => opt.address !== 'ALL');

  return useMemo((): AccountJson[] => {
    if (!networkKey) {
      return accountListWithoutAll;
    } else {
      if (networkMap[networkKey].isEthereum) {
        return accountListWithoutAll.filter(acc => isEthereumAddress(acc.address));
      } else {
        return accountListWithoutAll.filter(acc => !isEthereumAddress(acc.address));
      }
    }
  }, [accountListWithoutAll, networkKey, networkMap]);
}
