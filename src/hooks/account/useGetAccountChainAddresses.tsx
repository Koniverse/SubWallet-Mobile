// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@subwallet/keyring/types';

import { _ChainInfo } from '@subwallet/chain-list/types';
import {
  _BITCOIN_CHAIN_SLUG,
  _BITCOIN_TESTNET_CHAIN_SLUG,
} from '@subwallet/extension-base/services/chain-service/constants';
import { AccountProxy } from '@subwallet/extension-base/types';
import { useMemo } from 'react';
import { AccountChainAddress } from 'types/account';
import { getBitcoinAccountDetails } from 'utils/account';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useCoreCreateReformatAddress from 'hooks/common/useCoreCreateReformatAddress';
import useCoreCreateGetChainSlugsByAccountProxy from 'hooks/chain/useCoreCreateGetChainSlugsByAccountProxy';

// todo:
//  - order the result

// Helper function to create an AccountChainAddress object
const createChainAddressItem = (
  accountType: KeypairType,
  chainInfo: _ChainInfo,
  address: string,
): AccountChainAddress => {
  const isBitcoin = [_BITCOIN_CHAIN_SLUG, _BITCOIN_TESTNET_CHAIN_SLUG].includes(chainInfo.slug);

  if (isBitcoin) {
    const bitcoinInfo = getBitcoinAccountDetails(accountType);

    return {
      name: bitcoinInfo.network,
      logoKey: bitcoinInfo.logoKey,
      slug: chainInfo.slug,
      address,
      accountType,
    };
  }

  return {
    name: chainInfo.name,
    slug: chainInfo.slug,
    address,
    accountType,
  };
};

const useGetAccountChainAddresses = (accountProxy: AccountProxy): AccountChainAddress[] => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const getReformatAddress = useCoreCreateReformatAddress();
  const getChainSlugsByAccountProxy = useCoreCreateGetChainSlugsByAccountProxy();

  return useMemo(() => {
    const result: AccountChainAddress[] = [];
    const chains: string[] = getChainSlugsByAccountProxy(accountProxy);

    accountProxy.accounts.forEach(a => {
      for (const chain of chains) {
        const chainInfo = chainInfoMap[chain];
        const reformatedAddress = getReformatAddress(a, chainInfo);

        if (reformatedAddress) {
          const chainAddressItem = createChainAddressItem(a.type, chainInfo, reformatedAddress);

          result.push(chainAddressItem);
        }
      }
    });

    return result;
  }, [accountProxy, chainInfoMap, getChainSlugsByAccountProxy, getReformatAddress]);
};

export default useGetAccountChainAddresses;
