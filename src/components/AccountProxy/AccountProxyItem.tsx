import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountChainType, AccountProxy } from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import { Icon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { AccountChainTypeLogos } from 'components/AccountProxy/AccountChainTypeLogos';
import { ThemeTypes } from 'styles/themes';
import { DisabledStyle, FontSemiBold } from 'styles/sharedStyles';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';

interface Props {
  accountProxy: AccountProxy;
  isSelected?: boolean;
  showUnselectIcon?: boolean;
  renderRightPart?: (checkedIconNode: React.ReactNode) => React.ReactNode;
  chainTypes?: AccountChainType[];
  rightPartNode?: React.ReactNode;
  leftPartNode?: React.ReactNode;
  onPress?: VoidFunction;
  accountProxyName?: string;
  disabled?: boolean;
}

export const AccountProxyItem = (props: Props) => {
  const {
    accountProxy,
    accountProxyName,
    chainTypes,
    isSelected,
    leftPartNode,
    onPress,
    renderRightPart,
    rightPartNode,
    showUnselectIcon,
    disabled,
  } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  const checkedIconNode = (showUnselectIcon || isSelected) && (
    <Icon
      iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
      phosphorIcon={CheckCircle}
      size={'sm'}
      weight={'fill'}
    />
  );

  return (
    <AccountItemBase
      {...props}
      onPress={onPress}
      address={accountProxy.id}
      customStyle={{ container: disabled && DisabledStyle }}
      leftItem={leftPartNode || <AccountProxyAvatar size={24} value={accountProxy.id} />}
      middleItem={
        <View style={{ flex: 1 }}>
          <Typography.Text style={styles.accountName}>{accountProxyName || accountProxy.name}</Typography.Text>
          {!!chainTypes?.length && <AccountChainTypeLogos chainTypes={chainTypes} />}
        </View>
      }
      rightItem={rightPartNode || (renderRightPart ? renderRightPart(checkedIconNode) : checkedIconNode)}
    />
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    accountName: {
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
  });
}
