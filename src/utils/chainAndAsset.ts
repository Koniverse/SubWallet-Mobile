import { _ChainAsset } from '@subwallet/chain-list/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { _BALANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _isAssetFungibleToken, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';

// Mirrors the extension's getAssetDisplayName (utils/chain/chainAndAsset.ts): Bittensor
// subnet (alpha) tokens are labelled "SN<netuid> | <name> <symbol>", everything else keeps
// the fallback. The chain group covers the testnet too, which a bare 'bittensor' check missed.
export function getAssetDisplayName(asset?: _ChainAsset, fallback = ''): string {
  if (!asset) {
    return fallback;
  }

  if (
    _BALANCE_CHAIN_GROUP.bittensor.includes(asset.originChain) &&
    !_isNativeToken(asset) &&
    asset.metadata?.netuid != null
  ) {
    return `SN${asset.metadata.netuid} | ${asset.name} ${asset.symbol}`;
  }

  return fallback || asset.symbol;
}

export function isTokenAvailable(
  chainAsset: _ChainAsset,
  assetSettingMap: Record<string, AssetSetting>,
  chainStateMap: Record<string, _ChainState>,
  filterActiveChain: boolean,
  ledgerNetwork?: string,
): boolean {
  const assetSetting = assetSettingMap[chainAsset.slug];

  const isAssetVisible = assetSetting && assetSetting.visible;
  const isAssetFungible = _isAssetFungibleToken(chainAsset);
  const isOriginChainActive = chainStateMap[chainAsset.originChain]?.active;
  const isValidLedger = ledgerNetwork ? ledgerNetwork === chainAsset.originChain : true; // Check if have ledger network

  if (filterActiveChain) {
    return isAssetVisible && isAssetFungible && isOriginChainActive && isValidLedger;
  }

  return isAssetVisible && isAssetFungible && isValidLedger;
}
