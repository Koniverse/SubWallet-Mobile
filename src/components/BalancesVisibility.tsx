import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { FontSemiBold } from 'styles/sharedStyles';
import { Number } from 'components/design-system-ui';
import { SwNumberProps } from 'components/design-system-ui/number';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type Props = {
  value: SwNumberProps['value'];
  symbol?: string;
  startWithSymbol?: boolean;
  subFloatNumber?: boolean;
  /** Font size of the balance. Defaults to the large display size. */
  size?: number;
};

export const BalancesVisibility = ({
  value,
  symbol,
  startWithSymbol = true,
  subFloatNumber = false,
  size = 38,
}: Props) => {
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const theme = useSubWalletTheme().swThemes;
  const wrapperStyle: StyleProp<any> = { height: size + 4 };
  // The currency symbol rides above the digits, so scale it with them rather than
  // pinning it to the sizes that only suit the large display.
  const unitFontSize = Math.round((size * theme.fontSizeXL) / 38);

  return (
    <View style={wrapperStyle}>
      {isShowBalance ? (
        <Number
          value={value}
          decimal={0}
          prefix={startWithSymbol ? symbol : undefined}
          size={size}
          subFloatUnit={true}
          subFloatUnitFontSize={unitFontSize}
          subFloatUnitStyle={{
            lineHeight: unitFontSize,
            height: size + 2,
            paddingRight: theme.paddingXXS,
            ...FontSemiBold,
          }}
          textStyle={{ ...FontSemiBold, lineHeight: size }}
          subFloatNumber={subFloatNumber}
          decimalOpacity={0.45}
        />
      ) : (
        <Text
          style={{
            ...FontSemiBold,
            fontSize: size,
            lineHeight: size,
            color: theme.colorTextLight1,
          }}>
          ******
        </Text>
      )}
    </View>
  );
};
