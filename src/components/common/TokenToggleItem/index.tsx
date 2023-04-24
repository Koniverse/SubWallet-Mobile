import React from 'react';
import { Switch, Text, View } from 'react-native';
import { PencilSimpleLine } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { Divider } from 'components/Divider';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { Button, Icon, Logo as SWLogo } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import TokenToggleItemStyles from './style';

interface Props {
  item: _ChainAsset;
  onPress: () => void;
  isEnabled: boolean;
  onValueChange: () => void;
  isDisableSwitching?: boolean;
}

export const TokenToggleItem = ({ item, onPress, isEnabled, onValueChange, isDisableSwitching }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = TokenToggleItemStyles(theme);

  return (
    <>
      <View style={_style.container}>
        <View style={_style.leftContentWrapperStyle}>
          <SWLogo
            token={item.symbol.toLowerCase()}
            subNetwork={item.originChain}
            defaultLogoKey={'default'}
            size={36}
            isShowSubLogo
          />
          <Text numberOfLines={1} style={_style.itemTextStyle}>
            {item.symbol || ''}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Switch
            disabled={isDisableSwitching}
            ios_backgroundColor={ColorMap.switchInactiveButtonColor}
            value={isEnabled}
            onValueChange={onValueChange}
          />
          <Button
            onPress={onPress}
            icon={<Icon phosphorIcon={PencilSimpleLine} iconColor={theme.colorTextLight3} size={'sm'} />}
            size={'xs'}
            type={'ghost'}
          />
        </View>
      </View>
      <Divider style={{ paddingLeft: 64, paddingRight: 12 }} color={ColorMap.dark2} />
    </>
  );
};
