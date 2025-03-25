import { _ChainAsset } from '@subwallet/chain-list/types';
import { CommonFeeComponent } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';

export const getCurrentCurrencyTotalFee = (
  feeComponents: CommonFeeComponent[],
  assetRegistryMap: Record<string, _ChainAsset>,
  priceMap: Record<string, number>,
) => {
  let result = BN_ZERO;

  feeComponents.forEach(feeItem => {
    const asset = assetRegistryMap[feeItem.tokenSlug];

    if (asset) {
      const { decimals, priceId } = asset;
      const price = priceMap[priceId || ''] || 0;

      result = result.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
    }
  });

  return result;
};
