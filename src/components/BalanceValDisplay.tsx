import { BalanceVal, BalanceValProps, balanceValTextDefaultStyle } from 'components/BalanceVal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import Text from 'components/Text';
import React from 'react';
import { View } from 'react-native';

export const BalanceValDisplay = ({ style, ...balanceValProps }: BalanceValProps) => {
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  return (
    <View
      style={[
        {
          height:
            balanceValProps.balanceValTextStyle && balanceValProps.balanceValTextStyle.lineHeight
              ? balanceValProps.balanceValTextStyle.lineHeight
              : balanceValTextDefaultStyle.lineHeight,
        },
        style,
      ]}>
      {isShowBalance && <BalanceVal {...balanceValProps} />}
      {!isShowBalance && <Text style={[balanceValTextDefaultStyle, balanceValProps.balanceValTextStyle]}>******</Text>}
    </View>
  );
};
