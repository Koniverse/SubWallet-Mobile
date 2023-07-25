import React, { useMemo } from 'react';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { StyleProp, View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import Text from 'components/Text';
import { Icon } from 'components/design-system-ui';
import { WarningCircle } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  item: WalletConnectChainInfo;
  selectedValueMap: Record<string, boolean>;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  height: 52,
  paddingLeft: 12,
  paddingRight: 12,
  alignItems: 'center',
  backgroundColor: '#1A1A1A',
  borderRadius: 8,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 8,
  color: ColorMap.light,
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
};

const logoWrapperStyle: StyleProp<any> = {
  backgroundColor: 'transparent',
  borderRadius: 28,
};

export const WCNetworkItem = ({ item, selectedValueMap }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const isSupported = useMemo(() => {
    return selectedValueMap[item.slug];
  }, [item.slug, selectedValueMap]);
  return (
    <>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <View style={logoWrapperStyle}>{getNetworkLogo(item.slug, 28)}</View>
          <Text style={itemTextStyle}>{item.chainInfo?.name || ''}</Text>
        </View>

        {!isSupported && (
          <View style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', marginRight: -8 }}>
            <Icon phosphorIcon={WarningCircle} size={'sm'} weight={'fill'} iconColor={theme.colorWarning} />
          </View>
        )}
      </View>
    </>
  );
};
