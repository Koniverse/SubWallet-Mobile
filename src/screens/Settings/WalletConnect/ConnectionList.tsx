import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ConnectListProps, RootNavigationProps } from 'routes/index';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { GlobeHemisphereWest } from 'phosphor-react-native';
import { SessionTypes } from '@walletconnect/types';
import { stripUrl } from '@subwallet/extension-base/utils';
import { Button } from 'components/design-system-ui';
import { SVGImages } from 'assets/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ConnectionItem } from 'components/WalletConnect/ConnectionItem';
import { ListRenderItemInfo } from 'react-native';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { addConnection } from 'messaging/index';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';

const searchFunc = (items: SessionTypes.Struct[], searchString: string) => {
  const searchTextLowerCase = searchString.toLowerCase();

  return items.filter(item => {
    const metadata = item.peer.metadata;
    let id: string;

    try {
      id = stripUrl(metadata.url);
    } catch (e) {
      id = metadata.url;
    }
    const name = metadata.name;

    return id.toLowerCase().includes(searchTextLowerCase) || name.toLowerCase().includes(searchTextLowerCase);
  });
};

export const ConnectionList = ({
  route: {
    params: { isDelete },
  },
}: ConnectListProps) => {
  const theme = useSubWalletTheme().swThemes;
  const { sessions } = useSelector((state: RootState) => state.walletConnect);
  const items = useMemo(() => Object.values(sessions), [sessions]);
  const navigation = useNavigation<RootNavigationProps>();
  const [isScanning, setIsScanning] = useState<boolean>(!(items?.length || isDelete));
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!items.length) {
      async function checkPermission() {
        const result = await requestCameraPermission(() => navigation.goBack());

        if (result !== RESULTS.GRANTED) {
          setIsScanning(false);
        }
      }

      checkPermission();
    }
  }, [items.length, navigation]);

  const renderEmptyList = () => {
    return (
      <EmptyList
        title={i18n.emptyScreen.manageDAppEmptyTitle}
        message={i18n.emptyScreen.manageDAppEmptyMessage}
        icon={GlobeHemisphereWest}
      />
    );
  };

  const onPressItem = useCallback(
    (topic: string) => navigation.navigate('ConnectDetail', { topic: topic }),
    [navigation],
  );

  const renderItem = ({ item }: ListRenderItemInfo<SessionTypes.Struct>) => (
    <ConnectionItem session={item} onPress={onPressItem} />
  );

  const onScanAddress = (data: string) => {
    if (!validWalletConnectUri(data)) {
      addConnection({ uri: data })
        .then(() => {
          setIsScanning(false);
          navigation.dispatch(DrawerActions.closeDrawer());
          navigation.goBack();
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
  };

  return (
    <>
      {(items?.length || isDelete) && (
        <FlatListScreen
          title={i18n.header.walletConnect}
          items={items}
          onPressBack={() => navigation.goBack()}
          flatListStyle={{ gap: 8 }}
          renderItem={renderItem}
          autoFocus={false}
          renderListEmptyComponent={renderEmptyList}
          searchFunction={searchFunc}
          afterListItem={
            <Button
              style={{ marginHorizontal: 16, marginBottom: 16 }}
              onPress={async () => {
                const result = await requestCameraPermission();

                if (result === RESULTS.GRANTED) {
                  setIsScanning(true);
                }
              }}
              icon={<SVGImages.WalletConnect width={24} height={24} color={theme.colorWhite} />}>
              {i18n.buttonTitles.newConnection}
            </Button>
          }
        />
      )}

      <AddressScanner
        qrModalVisible={isScanning}
        onPressCancel={() => {
          setError(undefined);
          setIsScanning(false);
          !(items?.length || isDelete) && navigation.goBack();
        }}
        onChangeAddress={onScanAddress}
        error={error}
        isShowError={true}
      />
    </>
  );
};
