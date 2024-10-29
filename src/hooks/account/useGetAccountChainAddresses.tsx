// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { AccountProxy } from '@subwallet/extension-base/types';
import { AccountChainAddress } from 'types/account';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getChainsByAccountType } from 'utils/chain';
import { getReformatedAddressRelatedToChain } from 'utils/account';

// todo:
//  - order the result
const useGetAccountChainAddresses = (accountProxy: AccountProxy): AccountChainAddress[] => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return useMemo(() => {
    const result: AccountChainAddress[] = [];
    const chains: string[] = getChainsByAccountType(chainInfoMap, accountProxy.chainTypes, accountProxy.specialChain);

    accountProxy.accounts.forEach(a => {
      for (const chain of chains) {
        const chainInfo = chainInfoMap[chain];
        const reformatedAddress = getReformatedAddressRelatedToChain(a, chainInfo);

        if (reformatedAddress) {
          result.push({
            name: chainInfo.name,
            slug: chainInfo.slug,
            address: reformatedAddress,
            accountType: a.type,
          });
        }
      }
    });

    return result;
  }, [accountProxy, chainInfoMap]);
};

export default useGetAccountChainAddresses;
