import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { FontSemiBold } from 'styles/sharedStyles';
import { Number, Typography } from 'components/design-system-ui';
import { SwNumberProps } from 'components/design-system-ui/number';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type Props = {
  value: SwNumberProps['value'];
  symbol?: string;
  subFloatNumber?: boolean;
};

const wrapperStyle: StyleProp<any> = {
  height: 46,
};

export const BalancesVisibility = ({ value, symbol, subFloatNumber = false }: Props) => {
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const theme = useSubWalletTheme().swThemes;

  return (
    <View style={wrapperStyle}>
      {isShowBalance ? (
        <View style={{ flexDirection: 'row', gap: theme.sizeXXS }}>
          <Number
            value={value}
            decimal={0}
            size={38}
            textStyle={{ ...FontSemiBold, lineHeight: 38 }}
            subFloatNumber={subFloatNumber}
            decimalOpacity={0.45}
          />
          <Typography.Text style={{ color: theme.colorWhite, ...FontSemiBold, marginTop: -theme.sizeXS }}>
            {symbol}
          </Typography.Text>
        </View>
      ) : (
        <Text
          style={{
            ...FontSemiBold,
            fontSize: 38,
            lineHeight: 38,
            color: theme.colorTextLight1,
          }}>
          ******
        </Text>
      )}
    </View>
  );
};
