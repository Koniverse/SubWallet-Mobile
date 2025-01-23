import { BellRinging, QrCode } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, StyleProp, View } from 'react-native';
import { SpaceStyle } from 'styles/space';
import { Badge, Button, Icon } from 'components/design-system-ui';
import AccountSelectField from 'components/common/Account/AccountSelectField';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SVGImages } from 'assets/index';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import i18n from 'utils/i18n/i18n';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DisabledStyle } from 'styles/sharedStyles';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { addConnection } from 'messaging/index';
import useCheckCamera from 'hooks/common/useCheckCamera';
import { isAddress } from '@subwallet/keyring';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';

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
  const { currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const {
    notificationSetup: { isEnabled: notiEnable },
  } = useSelector((state: RootState) => state.settings);
  const { unreadNotificationCountMap } = useSelector((state: RootState) => state.notification);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const navigationRoutes = navigation.getState().routes;
  const nearestPathName = navigationRoutes[navigationRoutes.length - 1].name;
  const checkCamera = useCheckCamera();
  const onPressQrButton = useCallback(async () => {
    const openScannerScreen = () => {
      setIsScanning(true);
    };

    checkCamera(undefined, openScannerScreen)();
  }, [checkCamera]);

  const onPressNotificationBtn = useCallback(() => {
    navigation.navigate('Notification');
  }, [navigation]);

  const unreadNotificationCount = useMemo(() => {
    if (!currentAccountProxy || !unreadNotificationCountMap) {
      return 0;
    }

    return isAllAccount
      ? Object.values(unreadNotificationCountMap).reduce((acc, val) => acc + val, 0)
      : unreadNotificationCountMap[currentAccountProxy.id] || 0;
  }, [currentAccountProxy, isAllAccount, unreadNotificationCountMap]);

  const onScanAddress = useCallback(
    (data: string) => {
      if (isAddress(data)) {
        setError(undefined);
        setIsScanning(false);
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
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Button
                disabled={disabled}
                style={[disabled && DisabledStyle]}
                size={'xs'}
                type={'ghost'}
                icon={<Icon phosphorIcon={BellRinging} weight={'bold'} size={'md'} />}
                onPress={onPressNotificationBtn}
              />
              {notiEnable && !!unreadNotificationCount && (
                <Badge
                  value={unreadNotificationCount}
                  containerStyle={{ height: 12, paddingHorizontal: 2, position: 'absolute', bottom: 8, right: 8 }}
                  textStyle={{ fontSize: 7, lineHeight: 12, fontWeight: '600' }}
                />
              )}
            </View>

            <Button
              disabled={disabled}
              style={[{ marginRight: -8 }, disabled && DisabledStyle]}
              size={'xs'}
              type={'ghost'}
              icon={<Icon phosphorIcon={QrCode} weight={'bold'} size={'md'} />}
              onPress={onPressQrButton}
            />
          </View>
        )}
      </View>

      <AddressScanner
        qrModalVisible={isScanning}
        onPressCancel={() => {
          setError(undefined);
          setIsScanning(false);
        }}
        setQrModalVisible={setIsScanning}
        onChangeAddress={onScanAddress}
        error={error}
        isShowError={true}
      />
    </View>
  );
};
