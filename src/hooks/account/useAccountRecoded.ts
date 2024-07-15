// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useChainInfo from 'hooks/chain/useChainInfo';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'stores/index';
import { Recoded } from 'types/ui-types';
import { recodeAddress } from 'utils/account';
import { KeypairType } from '@polkadot/util-crypto/types';

const useAccountRecoded = (
  address: string,
  genesisHash?: string | null,
  givenType: KeypairType = 'sr25519',
): Recoded => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const account = useMemo(() => accounts.find(acc => acc.address === address), [accounts, address]);
  const networkInfo = useChainInfo(undefined, account?.originGenesisHash || genesisHash || account?.genesisHash);

  return useMemo(
    () => recodeAddress(address, accounts, networkInfo, givenType),
    [accounts, address, givenType, networkInfo],
  );
};

export default useAccountRecoded;
