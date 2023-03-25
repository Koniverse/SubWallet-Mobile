import React, { useCallback, useMemo, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
import { DotsThree, PushPinSlash } from 'phosphor-react-native';
import { MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ListRenderItemInfo } from 'react-native';
import { DAppAccessItem } from 'components/DAppAccessItem';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { changeAuthorizationAll, forgetAllSite } from '../../../../messaging';
import { updateAuthUrls } from 'stores/updater';
import i18n from 'utils/i18n/i18n';
import { EmptyList } from 'components/EmptyList';

function filterFunction(items: AuthUrlInfo[], searchString: string) {
  return items.filter(item => item.url.toLowerCase().includes(searchString.toLowerCase()));
}

function getDAppItems(authUrlMap: Record<string, AuthUrlInfo>): AuthUrlInfo[] {
  return Object.values(authUrlMap);
}

export const DAppAccessScreen = () => {
  const authUrlMap = useSelector((state: RootState) => state.authUrls.details);
  const navigation = useNavigation<RootNavigationProps>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const dAppItems = useMemo<AuthUrlInfo[]>(() => {
    return getDAppItems(authUrlMap);
  }, [authUrlMap]);

  const rightIconOption = useMemo(() => {
    return {
      icon: DotsThree,
      onPress: () => setModalVisible(true),
    };
  }, []);

  const dAppAccessMoreOptions = useMemo(() => {
    return [
      {
        name: i18n.common.forgetAll,
        onPress: () => {
          forgetAllSite(updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
      {
        name: i18n.common.disconnectAll,
        onPress: () => {
          changeAuthorizationAll(false, updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
      {
        name: i18n.common.connectAll,
        onPress: () => {
          changeAuthorizationAll(true, updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
    ];
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AuthUrlInfo>) => {
      return (
        <DAppAccessItem
          key={item.id}
          item={item}
          onPress={() => {
            navigation.navigate('DAppAccessDetail', {
              origin: item.id,
              accountAuthType: item.accountAuthType || '',
            });
          }}
        />
      );
    },
    [navigation],
  );

  return (
    <FlatListScreen
      title={i18n.title.manageDAppAccess}
      autoFocus={false}
      items={dAppItems}
      searchFunction={filterFunction}
      renderListEmptyComponent={() => <EmptyList icon={PushPinSlash} title={i18n.common.noDAppAvailable} />}
      rightIconOption={rightIconOption}
      renderItem={renderItem}
      afterListItem={
        <MoreOptionModal
          modalVisible={modalVisible}
          moreOptionList={dAppAccessMoreOptions}
          onChangeModalVisible={() => setModalVisible(false)}
        />
      }
    />
  );
};
