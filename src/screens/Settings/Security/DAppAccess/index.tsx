import React, { useCallback, useMemo, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
import { EmptyListScreen } from 'screens/Settings/Security/DAppAccess/EmptyListScreen';
import { DotsThree } from 'phosphor-react-native';
import { MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ListRenderItemInfo } from 'react-native';
import { DAppAccessItem } from 'components/DAppAccessItem';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { changeAuthorizationAll, forgetAllSite } from '../../../../messaging';
import { updateAuthUrls } from 'stores/updater';

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

  // todo: i18n
  const dAppAccessMoreOptions = useMemo(() => {
    return [
      {
        name: 'Forget All',
        onPress: () => {
          forgetAllSite(updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
      {
        name: 'Disconnect All',
        onPress: () => {
          changeAuthorizationAll(false, updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
      {
        name: 'Connect All',
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
              origin: item.origin,
              accountAuthType: item.accountAuthType || '',
            });
          }}
        />
      );
    },
    [navigation],
  );

  // todo: i18n Manage DApp Access
  return (
    <FlatListScreen
      title={'Manage DApp Access'}
      autoFocus={false}
      items={dAppItems}
      filterFunction={filterFunction}
      renderListEmptyComponent={EmptyListScreen}
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
