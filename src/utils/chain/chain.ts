import { _ChainInfo } from '@subwallet/chain-list/types';
import {
  _getSubstrateGenesisHash,
  _isChainBitcoinCompatible,
  _isChainCardanoCompatible,
  _isChainEvmCompatible,
  _isChainTonCompatible,
  _isPureSubstrateChain,
} from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType } from '@subwallet/extension-base/types';

export const findChainInfoByGenesisHash = (
  chainMap: Record<string, _ChainInfo>,
  genesisHash?: string,
): _ChainInfo | null => {
  if (!genesisHash) {
    return null;
  }

  for (const chainInfo of Object.values(chainMap)) {
    if (_getSubstrateGenesisHash(chainInfo)?.toLowerCase() === genesisHash.toLowerCase()) {
      return chainInfo;
    }
  }

  return null;
};

export const findChainInfoByChainId = (chainMap: Record<string, _ChainInfo>, chainId?: number): _ChainInfo | null => {
  if (!chainId) {
    return null;
  }

  for (const chainInfo of Object.values(chainMap)) {
    if (chainInfo.evmInfo?.evmChainId === chainId) {
      return chainInfo;
    }
  }

  return null;
};
/**
 * @deprecated Use `_isChainInfoCompatibleWithAccountInfo` instead.
 */
export const isChainInfoAccordantAccountChainType = (chainInfo: _ChainInfo, chainType: AccountChainType): boolean => {
  if (chainType === AccountChainType.SUBSTRATE) {
    return _isPureSubstrateChain(chainInfo);
  }

  if (chainType === AccountChainType.ETHEREUM) {
    return _isChainEvmCompatible(chainInfo);
  }

  if (chainType === AccountChainType.TON) {
    return _isChainTonCompatible(chainInfo);
  }

  if (chainType === AccountChainType.BITCOIN) {
    return _isChainBitcoinCompatible(chainInfo);
  }

  if (chainType === AccountChainType.CARDANO) {
    return _isChainCardanoCompatible(chainInfo);
  }

  return false;
};
