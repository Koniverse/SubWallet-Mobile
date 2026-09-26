import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import {
  _isChainBitcoinCompatible,
  _isChainCardanoCompatible,
  _isChainEvmCompatible,
  _isNativeToken,
} from '@subwallet/extension-base/services/chain-service/utils';
import { _isPolygonChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { _isPosChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';

export function shouldHideMaxButton(
  chain: string,
  destChain: string,
  assetInfo: _ChainAsset | undefined,
  chainInfoMap: Record<string, _ChainInfo>,
): boolean {
  const chainInfo = chainInfoMap[chain];

  if (_isPolygonChainBridge(chain, destChain) || _isPosChainBridge(chain, destChain)) {
    return true;
  }

  return (
    !!chainInfo &&
    !!assetInfo &&
    destChain === chain &&
    _isNativeToken(assetInfo) &&
    (_isChainEvmCompatible(chainInfo) ||
      _isChainCardanoCompatible(chainInfo) ||
      _isChainBitcoinCompatible(chainInfo))
  );
}
