import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import {
  _getChainNativeTokenSlug,
  _getSubstrateGenesisHash,
  _isChainEvmCompatible,
  _isChainSupportSubstrateStaking,
} from '@subwallet/extension-base/services/chain-service/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ALL_KEY } from 'constants/index';
import { AccountAddressType } from 'types/index';
import { findAccountByAddress, getAccountAddressType } from 'utils/account';

const isChainTypeValid = (chainInfo: _ChainInfo, accounts: AccountJson[], address?: string): boolean => {
  const addressType = getAccountAddressType(address);
  const isEvmChain = _isChainEvmCompatible(chainInfo);
  const genesisHash = _getSubstrateGenesisHash(chainInfo);
  const account = findAccountByAddress(accounts, address);

  if (account?.originGenesisHash && account.originGenesisHash !== genesisHash) {
    return false;
  }

  switch (addressType) {
    case AccountAddressType.ALL:
      return true;
    case AccountAddressType.ETHEREUM:
      return isEvmChain;
    case AccountAddressType.SUBSTRATE:
      return !isEvmChain;
    default:
      return false;
  }
};

export default function useGetSupportedStakingTokens(
  type: StakingType,
  address?: string,
  chain?: string,
): _ChainAsset[] {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  return useMemo(() => {
    const result: _ChainAsset[] = [];

    if (type === StakingType.NOMINATED) {
      Object.values(chainInfoMap).forEach(chainInfo => {
        if (_isChainSupportSubstrateStaking(chainInfo)) {
          const nativeTokenSlug = _getChainNativeTokenSlug(chainInfo);

          if (
            assetRegistryMap[nativeTokenSlug] &&
            isChainTypeValid(chainInfo, accounts, address) &&
            (!chain || chain === ALL_KEY || chain === chainInfo.slug)
          ) {
            result.push(assetRegistryMap[nativeTokenSlug]);
          }
        }
      });
    } else {
      Object.values(chainInfoMap).forEach(chainInfo => {
        if (
          _isChainSupportSubstrateStaking(chainInfo) &&
          _STAKING_CHAIN_GROUP.nominationPool.includes(chainInfo.slug)
        ) {
          const nativeTokenSlug = _getChainNativeTokenSlug(chainInfo);

          if (
            assetRegistryMap[nativeTokenSlug] &&
            isChainTypeValid(chainInfo, accounts, address) &&
            (!chain || chain === ALL_KEY || chain === chainInfo.slug)
          ) {
            result.push(assetRegistryMap[nativeTokenSlug]);
          }
        }
      });
    }

    return result;
  }, [accounts, type, chainInfoMap, assetRegistryMap, address, chain]);
}
