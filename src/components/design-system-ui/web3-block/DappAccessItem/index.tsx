import { Typography } from 'components/design-system-ui';
import Web3Block, { Web3BlockProps } from '../Web3Block';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import createStyle from './styles';
import { CaretRight } from 'phosphor-react-native';
import { DAppIconMap, DAppTitleMap } from '../../../../predefined/dAppSites';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { ColorMap } from 'styles/color';
import { getHostName } from 'utils/browser';

export interface DappAccessItemProps extends Omit<Web3BlockProps, 'customStyle'> {
  item: AuthUrlInfo;
  containerStyle?: StyleProp<ViewStyle>;
}

function getAccountCount(item: AuthUrlInfo): number {
  const authType = item.accountAuthType;

  if (authType === 'evm') {
    return item.isAllowedMap
      ? Object.entries(item.isAllowedMap).filter(([address, rs]) => rs && isEthereumAddress(address)).length
      : 0;
  }

  if (authType === 'substrate') {
    return item.isAllowedMap
      ? Object.entries(item.isAllowedMap).filter(([address, rs]) => rs && !isEthereumAddress(address)).length
      : 0;
  }

  return Object.values(item.isAllowedMap).filter(i => i).length;
}

export function getImageSource(hostName: string): string {
  if (DAppIconMap[hostName]) {
    return DAppIconMap[hostName];
  }

  return `https://icons.duckduckgo.com/ip2/${hostName}.ico`;
}

export function getSiteTitle(hostName: string, origin: string): string {
  if (DAppTitleMap[hostName]) {
    return DAppTitleMap[hostName];
  }

  return origin || hostName;
}

const DappAccessItem: React.FC<DappAccessItemProps> = (props: DappAccessItemProps) => {
  const { leftItem, rightItem, middleItem, item, containerStyle, ...restProps } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const hostName = getHostName(item.url);

  return (
    <Web3Block
      customStyle={{
        container: [styles.container, containerStyle],
      }}
      {...restProps}
      leftItem={leftItem || <Image source={{ uri: getImageSource(hostName), width: 28, height: 28 }} />}
      middleItem={
        middleItem || (
          <View style={{ flexDirection: 'row', alignItems: 'stretch', flex: 1 }}>
            <Typography.Text ellipsis style={[styles.itemMainTextStyle, { flex: 1 }]}>
              {getSiteTitle(hostName, item.origin)}
            </Typography.Text>
            <Typography.Text ellipsis style={[styles.itemSubTextStyle, { flex: 1 }]}>
              {item.url}
            </Typography.Text>
            <Typography.Text ellipsis style={[styles.itemMainTextStyle, { paddingRight: 10 }]}>
              {getAccountCount(item)}
            </Typography.Text>
          </View>
        )
      }
      rightItem={rightItem || <CaretRight color={ColorMap.disabled} size={20} weight={'bold'} />}
    />
  );
};

export default DappAccessItem;
