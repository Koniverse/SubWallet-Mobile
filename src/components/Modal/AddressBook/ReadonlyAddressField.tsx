import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { Avatar, Button, Field, Icon, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import React, { useCallback } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { Copy } from 'phosphor-react-native';
import createStylesheet from './style/ReadonlyAddressField';

interface Props {
  label?: string;
  address: string;
  showAvatar?: boolean;
}

export const ReadonlyAddressField = ({ address, label, showAvatar = true }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const hasLabel = !!label;
  const stylesheet = createStylesheet(theme);

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(address);
  }, [address]);

  return (
    <Field label={label}>
      <View style={stylesheet.contentBlock}>
        {showAvatar && (
          <View style={stylesheet.avatarWrapper}>
            <Avatar value={address || ''} size={hasLabel ? 20 : 24} />
          </View>
        )}
        <Typography.Text style={stylesheet.address}>{toShort(address, 9, 11)}</Typography.Text>

        <Button
          style={stylesheet.copyButton}
          size={'xs'}
          type={'ghost'}
          onPress={copyToClipboard}
          icon={<Icon phosphorIcon={Copy} size={'sm'} iconColor={theme.colorTextLight3} />}
        />
      </View>
    </Field>
  );
};
