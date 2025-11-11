import { AccountTokenAddress } from 'types/account';
import React, { useMemo } from 'react';
import { RELAY_CHAINS_TO_MIGRATE } from 'constants/chain';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import { Button, Icon, Logo, Typography } from 'components/design-system-ui';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getBitcoinAccountDetails } from 'utils/account';
import { toShort } from 'utils/index';
import { Copy, QrCode } from 'phosphor-react-native';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  item: AccountTokenAddress;
  onPress?: VoidFunction;
  onPressCopyButton?: VoidFunction;
  onPressQrButton?: VoidFunction;
}

export const AccountTokenAddressItem = ({ item, onPress, onPressCopyButton, onPressQrButton }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const isRelayChainToMigrate = useMemo(() => RELAY_CHAINS_TO_MIGRATE.includes(item.chainSlug), [item.chainSlug]);

  const leftItem = useMemo(
    () => (
      <Logo
        size={40}
        isShowSubLogo
        shape={'squircle'}
        subLogoShape={'circle'}
        subNetwork={item.chainSlug}
        token={item.tokenSlug.toLowerCase()}
      />
    ),
    [item.chainSlug, item.tokenSlug],
  );

  const middleItem = useMemo(
    () => (
      <View>
        <Typography.Text ellipsis style={styles.name}>
          {getBitcoinAccountDetails(item.accountInfo.type).name}
        </Typography.Text>
        <Typography.Text ellipsis style={styles.address}>
          {toShort(item.accountInfo.address, 4, 5)}
        </Typography.Text>
      </View>
    ),
    [item.accountInfo.address, item.accountInfo.type, styles.address, styles.name],
  );

  const rightItem = useMemo(
    () => (
      <View style={styles.rightArea}>
        <Button
          icon={<Icon phosphorIcon={QrCode} size={'sm'} iconColor={theme['gray-5']} />}
          onPress={onPressQrButton}
          size={'xs'}
          type={'ghost'}
        />
        <Button
          disabled={isRelayChainToMigrate}
          icon={<Icon phosphorIcon={Copy} size={'sm'} iconColor={theme['gray-5']} />}
          onPress={onPressCopyButton}
          size={'xs'}
          type={'ghost'}
        />
      </View>
    ),
    [isRelayChainToMigrate, onPressCopyButton, onPressQrButton, styles.rightArea, theme],
  );

  return (
    <AccountItemBase
      onPress={onPress}
      customStyle={{
        container: { paddingTop: theme.paddingSM, paddingBottom: theme.paddingSM, paddingRight: theme.paddingXXS },
      }}
      address={item.accountInfo.address}
      leftItem={leftItem}
      middleItem={middleItem}
      rightItem={rightItem}
    />
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    name: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    address: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextLight4,
    },
    rightArea: { flexDirection: 'row', alignItems: 'center' },
  });
}
