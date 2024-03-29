import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ActivityIndicator, Icon, Typography } from 'components/design-system-ui';
import { CaretRight } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Device } from '@ledgerhq/react-native-hw-transport-ble/lib-es/types';

interface Props {
  device: string | Device;
  onPress: (device: Device) => void;
  loading: boolean;
}

export const LedgerDeviceItem = ({ onPress, device, loading }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        paddingHorizontal: theme.paddingSM,
        paddingVertical: theme.padding,
        flex: 1,
        justifyContent: 'space-between',
        borderRadius: theme.borderRadiusLG,
        backgroundColor: theme.colorBgSecondary,
      }}
      onPress={onPress}>
      <Typography.Text style={{ color: theme.colorWhite }}>{device.name}</Typography.Text>
      {loading ? <ActivityIndicator size={12} /> : <Icon phosphorIcon={CaretRight} size={'sm'} />}
    </TouchableOpacity>
  );
};
