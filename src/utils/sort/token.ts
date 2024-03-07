import { TokenBalanceItemType } from 'types/balance';
import { BN_ZERO } from '@subwallet/extension-base/utils';

export const sortTokenByValue = (a: TokenBalanceItemType, b: TokenBalanceItemType): number => {
  const convertValue = (b?.total?.convertedValue || BN_ZERO).minus(a?.total?.convertedValue || BN_ZERO).toNumber();

  if (convertValue) {
    return convertValue;
  } else {
    return (b?.total?.value || BN_ZERO).minus(a?.total?.value || BN_ZERO).toNumber();
  }
};
