import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AccountType } from 'types/ui-types';
import {
  _getMultiChainAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';

export function getAccountTypeByTokenGroup(
  tokenGroupSlug: string,
  assetRegistryMap: Record<string, _ChainAsset>,
  chainInfoMap: Record<string, _ChainInfo>,
): AccountType {
  // case tokenGroupSlug is token slug
  if (assetRegistryMap[tokenGroupSlug]) {
    const chainSlug = assetRegistryMap[tokenGroupSlug].originChain;

    if (_isChainEvmCompatible(chainInfoMap[chainSlug])) {
      return 'ETHEREUM';
    } else {
      return 'SUBSTRATE';
    }
  }

  // case tokenGroupSlug is multiChainAsset slug

  const assetRegistryItems: _ChainAsset[] = Object.values(assetRegistryMap);

  const typesCheck: AccountType[] = [];

  for (const assetItem of assetRegistryItems) {
    if (!_isAssetFungibleToken(assetItem) || _getMultiChainAsset(assetItem) !== tokenGroupSlug) {
      continue;
    }

    const chainSlug = assetRegistryMap[assetItem.slug].originChain;

    const currentType = _isChainEvmCompatible(chainInfoMap[chainSlug]) ? 'ETHEREUM' : 'SUBSTRATE';

    if (!typesCheck.includes(currentType)) {
      typesCheck.push(currentType);
    }

    if (typesCheck.length === 2) {
      break;
    }
  }

  if (!typesCheck.length || typesCheck.length === 2) {
    return 'ALL';
  }

  return typesCheck[0];
}
