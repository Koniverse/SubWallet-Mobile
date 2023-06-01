import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Icon, Number } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { DotsThree } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingPoolItemStyle from './style';
import { isEthereumAddress } from '@polkadot/util-crypto';
import i18n from 'utils/i18n/i18n';

interface Props {
  address: string;
  name?: string;
  id: number;
  symbol?: string;
  decimals: number;
  bondedAmount: string;
  onPress?: () => void;
  onPressRightButton?: () => void;
}

export const StakingPoolItem = ({
  address,
  name,
  id,
  bondedAmount,
  symbol,
  decimals,
  onPress,
  onPressRightButton,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingPoolItemStyle(theme);
  return (
    <TouchableOpacity style={_style.container} onPress={onPress}>
      <View style={_style.avatarWrapper}>
        <Avatar value={address} size={40} theme={isEthereumAddress(address) ? 'ethereum' : 'polkadot'} />
      </View>

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={_style.poolNameTextStyle}>
          {name || i18n.message.poolId(id)}
        </Text>
        <View style={_style.contentWrapper}>
          <Text style={_style.bondedAmountLabelTextStyle}>{i18n.message.bonded}</Text>
          <Number
            decimal={decimals}
            suffix={symbol}
            size={12}
            value={bondedAmount}
            textStyle={{ ...FontMedium }}
            decimalOpacity={0.45}
            intOpacity={0.45}
            unitOpacity={0.45}
          />
        </View>
      </View>
      <Button
        type={'ghost'}
        size={'xs'}
        icon={<Icon phosphorIcon={DotsThree} size={'sm'} iconColor={theme.colorTextLight3} />}
        onPress={onPressRightButton}
      />
    </TouchableOpacity>
  );
};
