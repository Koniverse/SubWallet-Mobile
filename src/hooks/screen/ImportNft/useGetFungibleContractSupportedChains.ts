// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import {
  _isAssetHubChain,
  _isChainSupportEvmERC20,
  _isChainSupportVFT,
  _isChainSupportWasmPSP22,
} from '@subwallet/extension-base/services/chain-service/utils';
import { useMemo } from 'react';
import useChainInfoData from 'hooks/chain/useChainInfoData';

function filterNftContractTypes(chainInfoMap: Record<string, _ChainInfo>) {
  const filteredChainInfoMap: Record<string, _ChainInfo> = {};

  Object.values(chainInfoMap).forEach(chainInfo => {
    if (
      _isChainSupportEvmERC20(chainInfo) ||
      _isChainSupportWasmPSP22(chainInfo) ||
      _isChainSupportVFT(chainInfo) ||
      _isAssetHubChain(chainInfo)
    ) {
      filteredChainInfoMap[chainInfo.slug] = chainInfo;
    }
  });

  return filteredChainInfoMap;
}

export default function useGetFungibleContractSupportedChains(): Record<string, _ChainInfo> {
  const chainInfoMap = useChainInfoData().chainInfoMap;

  return useMemo(() => {
    return filterNftContractTypes(chainInfoMap);
  }, [chainInfoMap]);
}
