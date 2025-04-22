import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { VoidFunction } from 'types/index';
import { Button, Icon, Logo, Tag, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { Copy, QrCode } from 'phosphor-react-native';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  onPress?: VoidFunction;
  tokenSlug: string;
  chainName: string;
  address: string;
  isNewFormat?: boolean;
  onPressCopyButton?: VoidFunction;
  onPressQrButton?: VoidFunction;
}

const AccountChainAddressWithStatusItem: React.FC<Props> = ({
  address,
  chainName,
  isNewFormat,
  onPress,
  onPressQrButton,
  onPressCopyButton,
  tokenSlug,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Logo network={tokenSlug.toLowerCase()} size={40} />
      <View style={{ flex: 1 }}>
        <View style={styles.contentUpperBlock}>
          <Typography.Text size={'md'} style={styles.name}>
            {chainName}
          </Typography.Text>
          <Tag bgType={'default'} color={isNewFormat ? 'success' : 'gold'}>
            {isNewFormat ? 'New' : 'Legacy'}
          </Tag>
        </View>
        <Typography.Text size={'sm'} style={styles.address}>
          {toShort(address, 9, 9)}
        </Typography.Text>
      </View>
      <View style={styles.rightPart}>
        <Button
          icon={<Icon phosphorIcon={QrCode} size={'sm'} />}
          onPress={onPressQrButton}
          size={'xs'}
          type={'ghost'}
        />
        <Button
          icon={<Icon phosphorIcon={Copy} size={'sm'} />}
          onPress={onPressCopyButton}
          size={'xs'}
          type={'ghost'}
        />
      </View>
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
      gap: theme.sizeXS,
      paddingVertical: theme.padding - 2,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
    },
    contentUpperBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    name: {
      color: theme.colorWhite,
      ...FontSemiBold,
    },
    address: {
      color: theme.colorTextTertiary,
    },
    rightPart: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}

export default AccountChainAddressWithStatusItem;
