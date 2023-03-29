import React from 'react';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { BalanceBlockType } from 'types/ui-types';
import { View } from 'react-native';
import { Number, Tag } from 'components/design-system-ui';

export const BalanceBlock = ({
  isPriceDecrease,
  totalChangeValue,
  totalValue,
  totalChangePercent,
}: BalanceBlockType) => {
  return (
    <>
      <BalancesVisibility value={totalValue} startWithSymbol subFloatNumber />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Number size={14} decimal={0} value={totalChangeValue} prefix={isPriceDecrease ? '- $' : '+ $'} />
        <Tag style={{ marginLeft: 8 }} color={isPriceDecrease ? 'error' : 'success'} shape={'round'} closable={false}>
          <Number size={10} value={totalChangePercent} decimal={0} prefix={isPriceDecrease ? '-' : '+'} suffix={'%'} />
        </Tag>
      </View>
    </>
  );
};
