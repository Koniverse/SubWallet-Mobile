import { QrCode } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { Keyboard, StyleProp, View } from 'react-native';
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
import { DisabledStyle } from 'styles/sharedStyles';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { addConnection } from 'messaging/index';

export interface HeaderProps {
  rightComponent?: JSX.Element;
  disabled?: boolean;
}

const headerWrapper: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  position: 'relative',
  zIndex: 10,
};

export const Header = ({ rightComponent, disabled }: HeaderProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const navigationRoutes = navigation.getState().routes;
  const nearestPathName = navigationRoutes[navigationRoutes.length - 1].name;
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
        //TODO: need to refactor
        navigation.navigate('Drawer', {
          screen: 'TransactionAction',
          params: { screen: 'SendFund', params: { recipient: data } },
        });
      } else if (!validWalletConnectUri(data)) {
        addConnection({ uri: data })
          .then(() => {
            setError(undefined);
            setIsScanning(false);
          })
          .catch(e => {
            const errMessage = (e as Error).message;
            const message = errMessage.includes('Pairing already exists')
              ? i18n.errorMessage.connectionAlreadyExist
              : i18n.errorMessage.failToAddConnection;
            setError(message);
          });
      } else {
        setError(i18n.errorMessage.unreadableQrCode);
      }
    },
    [navigation],
  );

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ position: 'absolute', left: 16 }}>
        <Button
          style={[{ marginLeft: -8 }, disabled && DisabledStyle]}
          disabled={disabled}
          type={'ghost'}
          size={'xs'}
          icon={<SVGImages.MenuBarLogo />}
          onPress={() => {
            Keyboard.dismiss();
            drawerNavigation.openDrawer();
          }}
        />
      </View>

      <AccountSelectField
        disabled={disabled}
        onPress={() => navigation.navigate('AccountsScreen', { pathName: nearestPathName })}
      />

      <View style={{ flexDirection: 'row', position: 'absolute', right: 16 }}>
        {rightComponent || (
          <Button
            disabled={disabled}
            style={[{ marginRight: -8 }, disabled && DisabledStyle]}
            size={'xs'}
            type={'ghost'}
            icon={<Icon phosphorIcon={QrCode} weight={'bold'} />}
            onPress={onPressQrButton}
          />
        )}
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
