import { _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import {
  _getSubstrateGenesisHash,
  _isChainBitcoinCompatible,
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

  return false;
};

export const isChainCompatibleWithAccountChainTypes = (
  chainInfo: _ChainInfo,
  chainTypes: AccountChainType[],
): boolean => {
  return chainTypes.some(chainType => isChainInfoAccordantAccountChainType(chainInfo, chainType));
};

export const getChainsByAccountType = (
  _chainInfoMap: Record<string, _ChainInfo>,
  chainTypes: AccountChainType[],
  specialChain?: string,
): string[] => {
  const chainInfoMap = Object.fromEntries(
    Object.entries(_chainInfoMap).filter(([, chainInfo]) => chainInfo.chainStatus === _ChainStatus.ACTIVE),
  );

  if (specialChain) {
    return Object.keys(chainInfoMap).filter(chain => specialChain === chain);
  } else {
    const result: string[] = [];

    for (const chainInfo of Object.values(chainInfoMap)) {
      if (isChainCompatibleWithAccountChainTypes(chainInfo, chainTypes)) {
        result.push(chainInfo.slug);
      }
    }

    return result;
  }
};
