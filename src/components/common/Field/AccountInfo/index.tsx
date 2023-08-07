import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { toShort } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AccountInfoFieldStyle from './style';
import { Avatar } from 'components/design-system-ui';

interface Props {
  address: string;
  name: string;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const textStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const AccountInfoField = ({ address, name, rightIcon, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = AccountInfoFieldStyle(theme);

  return (
    <View style={[_style.container, style]}>
      <View style={_style.accountInfoFieldLeftPart}>
        <Avatar value={address} size={24} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 12 }}>
          <Text numberOfLines={1} style={[textStyle, { maxWidth: 100, color: theme.colorTextLight1 }]}>
            {name}
          </Text>
          <Text style={textStyle}>{` (${toShort(address, 5, 5)})`}</Text>
        </View>
      </View>

      {rightIcon}
    </View>
  );
};

export default AccountInfoField;
