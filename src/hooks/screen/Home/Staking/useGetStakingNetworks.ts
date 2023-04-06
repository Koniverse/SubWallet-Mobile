import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from '@subwallet/extension-base/utils';
import useGetActiveNetwork from 'hooks/screen/useGetActiveChains';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const filterAllAccount = (network: NetworkJson): boolean => {
  return !!network.supportBonding;
};

const filterEthereumAccount = (network: NetworkJson): boolean => {
  return !!network.supportBonding && !!network.isEthereum;
};

const filterSubstrateAccount = (network: NetworkJson): boolean => {
  return !!network.supportBonding && !network.isEthereum;
};

const SEPARATOR = '___';

export default function useGetStakingNetworks(): NetworkJson[] {
  const activeNetworkMap = useGetActiveNetwork();

  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  const activeList = useMemo((): string => {
    return activeNetworkMap.map(network => network.key).join(SEPARATOR);
  }, [activeNetworkMap]);

  return useMemo((): NetworkJson[] => {
    const isEthAccount = isEthereumAddress(currentAccount?.address);
    const isAllAccount = isAccountAll(currentAccount?.address);

    const filterFunction = isAllAccount
      ? filterAllAccount
      : isEthAccount
      ? filterEthereumAccount
      : filterSubstrateAccount;

    return activeNetworkMap.filter(filterFunction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeList, currentAccount?.address]);
}
