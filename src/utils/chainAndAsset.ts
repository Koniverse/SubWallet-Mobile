import { _ChainAsset } from '@subwallet/chain-list/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _isAssetFungibleToken } from '@subwallet/extension-base/services/chain-service/utils';

export function getAssetDisplayName(asset?: _ChainAsset, fallback = ''): string {
  if (!asset) {
    return fallback;
  }

  if (asset.originChain === 'bittensor' && asset.assetType === 'LOCAL' && asset.metadata?.netuid != null) {
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
