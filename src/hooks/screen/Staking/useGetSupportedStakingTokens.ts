import { _ChainInfo } from '@subwallet/chain-list/types';
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
import useChainAssets from 'hooks/chain/useChainAssets';
import { BN_ZERO } from '@polkadot/util';
import { TokenItemType } from 'components/Modal/common/TokenSelector';

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
): TokenItemType[] {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistryMap = useChainAssets().chainAssetRegistry;
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const { balanceMap } = useSelector((root: RootState) => root.balance);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);
  return useMemo(() => {
    const result: TokenItemType[] = [];
    const accBalanceMap = currentAccount ? balanceMap[currentAccount.address] : undefined;

    if (type === StakingType.NOMINATED) {
      Object.values(chainInfoMap).forEach(chainInfo => {
        if (_isChainSupportSubstrateStaking(chainInfo)) {
          const nativeTokenSlug = _getChainNativeTokenSlug(chainInfo);

          if (
            assetRegistryMap[nativeTokenSlug] &&
            isChainTypeValid(chainInfo, accounts, address) &&
            (!chain || chain === ALL_KEY || chain === chainInfo.slug)
          ) {
            const item = assetRegistryMap[nativeTokenSlug];
            const freeBalance = accBalanceMap[item.slug]?.free || BN_ZERO;
            result.push({
              ...item,
              price: item.priceId ? priceMap[item.priceId] : 0,
              free: accBalanceMap ? freeBalance : BN_ZERO,
              decimals: item.decimals || undefined,
            });
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
            const item = assetRegistryMap[nativeTokenSlug];
            const freeBalance = accBalanceMap[item.slug]?.free || BN_ZERO;
            result.push({
              ...item,
              price: item.priceId ? priceMap[item.priceId] : 0,
              free: accBalanceMap ? freeBalance : BN_ZERO,
              decimals: item.decimals || undefined,
            });
          }
        }
      });
    }

    return result;
  }, [currentAccount, balanceMap, type, chainInfoMap, assetRegistryMap, accounts, address, chain, priceMap]);
}
