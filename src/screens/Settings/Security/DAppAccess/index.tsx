import React, { useState } from 'react';
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

function filterFunction(items: AuthUrlInfo[], searchString: string) {
  return items.filter(item => item.url.toLowerCase().includes(searchString.toLowerCase()));
}

const dappAccessMoreOptions = [
  {
    name: 'Forget All',
    onPress: () => {},
  },
  {
    name: 'Disconnect All',
    onPress: () => {},
  },
  {
    name: 'Connect All',
    onPress: () => {},
  },
];

export const DAppAccessScreen = () => {
  const authUrls = useSelector((state: RootState) => state.authUrls.details);
  const navigation = useNavigation<RootNavigationProps>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const renderItem = ({ item }: ListRenderItemInfo<AuthUrlInfo>) => {
    return (
      <DAppAccessItem
        key={item.id}
        item={item}
        onPress={() =>
          navigation.navigate('DAppAccessDetail', { origin: item.origin, accountAuthType: item.accountAuthType || '' })
        }
      />
    );
  };

  return (
    <FlatListScreen
      title={'Manage DApp Access'}
      autoFocus={false}
      items={Object.values(authUrls)}
      filterFunction={filterFunction}
      renderListEmptyComponent={EmptyListScreen}
      rightIconOption={{
        icon: DotsThree,
        onPress: () => setModalVisible(true),
      }}
      renderItem={renderItem}
      afterListItem={
        <MoreOptionModal
          modalVisible={modalVisible}
          moreOptionList={dappAccessMoreOptions}
          onChangeModalVisible={() => setModalVisible(false)}
        />
      }
    />
  );
};
