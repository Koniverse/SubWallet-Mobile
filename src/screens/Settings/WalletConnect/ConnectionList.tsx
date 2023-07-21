import React, { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
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

export const ConnectionList = () => {
  const theme = useSubWalletTheme().swThemes;
  const { sessions } = useSelector((state: RootState) => state.walletConnect);
  const items = useMemo(() => Object.values(sessions), [sessions]);
  const navigation = useNavigation<RootNavigationProps>();

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

  return (
    <FlatListScreen
      title={i18n.header.walletConnect}
      items={items}
      onPressBack={() => navigation.goBack()}
      renderItem={renderItem}
      renderListEmptyComponent={renderEmptyList}
      searchFunction={searchFunc}
      afterListItem={
        <Button
          style={{ marginHorizontal: 16, marginBottom: 16 }}
          onPress={() => navigation.navigate('ConnectWalletConnect')}
          icon={<SVGImages.WalletConnect width={24} height={24} color={theme.colorWhite} />}>
          {i18n.buttonTitles.newConnection}
        </Button>
      }
    />
  );
};
