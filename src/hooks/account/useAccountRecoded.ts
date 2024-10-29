// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'stores/index';
import { Recoded } from 'types/ui-types';

const useAccountRecoded = (address: string): Recoded => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const account = useMemo(() => accounts.find(acc => acc.address === address), [accounts, address]);

  return useMemo(
    () => ({
      account: account,
      genesisHash: account?.genesisHash,
      prefix: 42,
      formatted: address,
      originGenesisHash: account?.originGenesisHash,
      isEthereum: false,
    }),
    [account, address],
  );
  // check this
};

export default useAccountRecoded;
