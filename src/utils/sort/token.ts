import { TokenBalanceItemType } from 'types/balance';

export const sortTokenByValue = (a: TokenBalanceItemType, b: TokenBalanceItemType): number => {
  const convertValue = b.total.convertedValue.minus(a.total.convertedValue).toNumber();

  if (convertValue) {
    return convertValue;
  } else {
    return b.total.value.minus(a.total.value).toNumber();
  }
};
