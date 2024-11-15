import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React, { useMemo } from 'react';
import { toShort } from 'utils/index';
import { StyleSheet, View } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { IconProps, Info } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { AccountProxyAvatar } from '../design-system-ui/avatar/account-proxy-avatar';
import { reformatAddress } from 'utils/account/account';

interface Props extends FieldBaseProps {
  address: string;
  name?: string;
  networkPrefix?: number;
  showRightIcon?: boolean;
  showAvatar?: boolean;
  onPressRightIcon?: () => void;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  placeholder?: string;
  disableRightIcon?: boolean;
  disableText?: boolean;
}

export const AddressField = ({
  address,
  networkPrefix,
  onPressRightIcon,
  showRightIcon = true,
  showAvatar = true,
  disableText = false,
  rightIcon: RightIcon,
  placeholder,
  name,
  label,
  disableRightIcon,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const formattedAddress = networkPrefix !== undefined ? reformatAddress(address, networkPrefix) : address;
  const textLength = name ? 6 : 10;
  const textColor = showRightIcon
    ? disableText
      ? theme.colorTextLight4
      : theme.colorTextLight2
    : theme.colorTextLight4;

  return (
    <FieldBase {...fieldBase} label={label}>
      <View style={styles.blockContent}>
        {!!showAvatar && (
          <View style={styles.logoWrapper}>
            <AccountProxyAvatar value={address} size={label ? 20 : 24} />
          </View>
        )}
        {!!placeholder && <Typography.Text style={styles.text}>{placeholder}</Typography.Text>}
        {!placeholder && (
          <View style={{ flexDirection: 'row', flex: 1, paddingRight: 16 }}>
            {!!name && (
              <Typography.Text ellipsis style={{ ...styles.text, maxWidth: 70, color: textColor }}>
                {name}
              </Typography.Text>
            )}
            {!!name && <Typography.Text style={{ ...styles.text, color: textColor }}> (</Typography.Text>}
            <Typography.Text style={{ ...styles.text, color: textColor }}>
              {toShort(formattedAddress, textLength, textLength)}
            </Typography.Text>
            {!!name && <Typography.Text style={{ ...styles.text, color: textColor }}>)</Typography.Text>}
          </View>
        )}
        {showRightIcon && (
          <Button
            size={'xs'}
            style={styles.button}
            type={'ghost'}
            icon={<Icon size={'sm'} iconColor={theme['gray-5']} phosphorIcon={RightIcon || Info} />}
            onPress={onPressRightIcon}
            disabled={disableRightIcon}
          />
        )}
      </View>
    </FieldBase>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    text: {
      ...FontMedium,
    },
    blockContent: { flexDirection: 'row', height: 48, alignItems: 'center' },
    logoWrapper: {
      paddingLeft: theme.sizeSM,
      paddingRight: theme.sizeXS,
    },
    button: {
      marginRight: theme.sizeXXS,
    },
  });
}
