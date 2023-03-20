import React from 'react';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceBlockType } from 'types/ui-types';
import { View } from 'react-native';
import { Number } from 'components/design-system-ui';

export const BalanceBlock = ({
  isPriceDecrease,
  totalChangeValue,
  balanceValue,
  amountToUsd,
  isShowBalanceToUsd = false,
  startWithSymbol = true,
  symbol = '$',
}: BalanceBlockType) => {
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  return (
    <>
      <BalancesVisibility value={balanceValue} symbol={symbol} startWithSymbol={startWithSymbol} />

      <View>
        <Number decimal={0} value={totalChangeValue} prefix={isPriceDecrease ? '- $' : '+ $'} />
      </View>

      {isShowBalanceToUsd && amountToUsd && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={isShowBalance} />}
    </>
  );
};
