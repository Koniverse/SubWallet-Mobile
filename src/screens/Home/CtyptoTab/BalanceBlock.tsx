import React from 'react';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceBlockType } from 'types/ui-types';

export const BalanceBlock = ({
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

      {isShowBalanceToUsd && amountToUsd && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={isShowBalance} />}
    </>
  );
};
