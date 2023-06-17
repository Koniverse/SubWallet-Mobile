import { QrCode } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { StyleProp, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { SpaceStyle } from 'styles/space';
import { requestCameraPermission } from 'utils/permission/camera';
import { Button, Icon } from 'components/design-system-ui';
import AccountSelectField from 'components/common/Account/AccountSelectField';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SVGImages } from 'assets/index';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { isAddress } from '@polkadot/util-crypto';
import i18n from 'utils/i18n/i18n';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export interface HeaderProps {}

const headerWrapper: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  position: 'relative',
  zIndex: 10,
};

export const Header = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsScanning(true);
    }
  }, []);

  const onScanAddress = useCallback(
    (data: string) => {
      if (isAddress(data)) {
        setError(undefined);
        setIsScanning(false);
        navigation.navigate('Drawer', {
          screen: 'TransactionAction',
          params: { screen: 'SendFund', params: { recipient: data } },
        });
      } else {
        setError(i18n.errorMessage.isNotAnAddress);
      }
    },
    [navigation],
  );

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ position: 'absolute', left: 16 }}>
        <Button
          style={{ marginLeft: -8 }}
          type={'ghost'}
          size={'xs'}
          icon={<SVGImages.MenuBarLogo />}
          onPress={() => {
            drawerNavigation.openDrawer();
          }}
        />
      </View>

      <AccountSelectField onPress={() => navigation.navigate('AccountsScreen')} />

      <View style={{ flexDirection: 'row', position: 'absolute', right: 16 }}>
        <Button
          style={{ marginRight: -8 }}
          size={'xs'}
          type={'ghost'}
          icon={<Icon phosphorIcon={QrCode} weight={'bold'} />}
          onPress={onPressQrButton}
        />
      </View>

      <AddressScanner
        qrModalVisible={isScanning}
        onPressCancel={() => {
          setError(undefined);
          setIsScanning(false);
        }}
        onChangeAddress={onScanAddress}
        error={error}
        isShowError={true}
      />
    </View>
  );
};
