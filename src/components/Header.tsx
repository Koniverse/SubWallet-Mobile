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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsScanning(true);
    }
  }, []);

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ position: 'absolute', left: 16 }}>
        <Button
          style={{ marginLeft: -8 }}
          type={'ghost'}
          size={'xs'}
          icon={<SVGImages.MenuBarLogo />}
          onPress={() => {
            navigation.navigate('Settings');
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
        onPressCancel={() => setIsScanning(false)}
        onChangeAddress={data => navigation.navigate('SendFund', { recipient: data })}
      />
    </View>
  );
};
