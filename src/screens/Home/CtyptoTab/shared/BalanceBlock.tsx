import React from 'react';
import { StyleProp, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { ColorMap } from 'styles/color';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceContainerType } from 'types/ui-types';

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: ColorMap.dark2,
  paddingTop: 21,
};

export const BalanceBlock = ({
  balanceValue,
  actionButtonContainerStyle,
  amountToUsd,
  isShowBalanceToUsd = false,
  startWithSymbol = true,
  symbol = '$',
  selectionProvider,
}: BalanceContainerType) => {
  const {
    settings: { isShowBalance },
  } = useSelector((state: RootState) => state);

  return (
    <View style={balanceContainer} pointerEvents="box-none">
      <BalancesVisibility value={balanceValue} symbol={symbol} startWithSymbol={startWithSymbol} />

      {isShowBalanceToUsd && amountToUsd && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={isShowBalance} />}

      <ActionButtonContainer style={actionButtonContainerStyle} selectionProvider={selectionProvider} />
    </View>
  );
};
