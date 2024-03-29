import { SwFullSizeModal, Typography } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { FontMedium } from 'styles/sharedStyles';
import React, { useRef, useState } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { BluetoothDevice } from 'hooks/ledger/useBluetoothDevices';
import { ListRenderItemInfo } from 'react-native';
import { LedgerDeviceItem } from 'components/Ledger/LedgerDeviceItem';

interface Props {
  devices: BluetoothDevice[];
  deviceModalVisible: boolean;
  setDeviceModalVisible: (value: boolean) => void;
  networkName: string;
  onPressItem: (deviceId?: string) => Promise<void>;
}

export const DeviceSelectorModal = ({
  deviceModalVisible,
  setDeviceModalVisible,
  devices,
  networkName,
  onPressItem,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const renderItem = ({ item }: ListRenderItemInfo<BluetoothDevice>) => {
    return (
      <LedgerDeviceItem
        loading={loading}
        device={item}
        onPress={() => {
          setLoading(true);
          onPressItem(item.id)
            .then(() => {
              setDeviceModalVisible(false);
            })
            .catch()
            .finally(() => setLoading(false));
        }}
      />
    );
  };

  return (
    <SwFullSizeModal
      setVisible={setDeviceModalVisible}
      modalVisible={deviceModalVisible}
      modalBaseV2Ref={modalBaseV2Ref}>
      <FlatListScreen
        loading={!devices.length}
        onPressBack={() => setDeviceModalVisible(false)}
        title={'Select your Ledger device'}
        items={devices}
        withSearchInput={false}
        beforeListItem={
          <Typography.Text
            style={{
              color: theme.colorTextLight4,
              paddingHorizontal: theme.padding,
              paddingVertical: theme.padding,
              ...FontMedium,
            }}>{`Please, enable Bluetooth in your phone settings and Ledger device. Unlock your Ledger device and open the ${networkName} app`}</Typography.Text>
        }
        renderListEmptyComponent={() => <></>}
        renderItem={renderItem}
        flatListStyle={{ paddingHorizontal: theme.padding }}
      />
    </SwFullSizeModal>
  );
};
