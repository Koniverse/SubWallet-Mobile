// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import useGenesisHashOptions, { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { getGenesisOptionsByAddressType } from 'utils/index';
import { useMemo } from 'react';

function getShowedNetworks(genesisOptions: NetworkSelectOption[], networkKey: string): string[] {
  if (networkKey === 'all') {
    return genesisOptions.filter(i => i.networkKey && i.networkKey !== 'all').map(i => i.networkKey);
  }

  return [networkKey];
}

export default function useShowedNetworks(
  currentNetworkKey: string,
  address: string,
  accounts: AccountJson[],
): string[] {
  const genesisHashOptions = useGenesisHashOptions();
  const dep1 = JSON.stringify(accounts);
  const dep2 = JSON.stringify(genesisHashOptions);

  return useMemo<string[]>(() => {
    const genesisOptions = getGenesisOptionsByAddressType(address, accounts, genesisHashOptions);
    return getShowedNetworks(genesisOptions, currentNetworkKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetworkKey, address, dep1, dep2]);
}
