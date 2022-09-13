import React, { useState } from 'react';
import { ListRenderItemInfo, Switch, TouchableOpacity, View } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyListScreen } from 'screens/Settings/Security/DAppAccess/EmptyListScreen';
import { DotsThree } from 'phosphor-react-native';
import { MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppAccessDetailProps } from 'types/routes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { Account } from 'components/Account';
import { Divider } from 'components/Divider';
import { ColorMap } from 'styles/color';

const filterFunction = (items: AccountJson[], searchString: string) => {
  return items.filter(item => item.name?.toLowerCase().includes(searchString.toLowerCase()));
};

const dAppAccessDetailMoreOptions = [
  {
    name: 'Block',
    onPress: () => {},
  },
  {
    name: 'Forget Site',
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

export const DAppAccessDetailScreen = ({
  route: {
    params: { origin, accountAuthType },
  },
}: DAppAccessDetailProps) => {
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const getAccountList = () => {
    const accountListWithoutAll = accounts.filter(opt => opt.address !== 'ALL');

    if (accountAuthType === 'substrate') {
      return accountListWithoutAll.filter(acc => !isEthereumAddress(acc.address));
    } else if (accountAuthType === 'evm') {
      return accountListWithoutAll.filter(acc => isEthereumAddress(acc.address));
    } else {
      return accountListWithoutAll;
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountJson>) => {
    return (
      <TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Account
            name={item.name || ''}
            address={item.address}
            showCopyBtn={false}
            showSelectedIcon={false}
            isDisabled={true}
          />
          <Switch ios_backgroundColor="rgba(120,120,128,0.32)" value={false} onValueChange={() => {}} />
        </View>
        <Divider style={{ paddingLeft: 56 }} color={ColorMap.dark2} />
      </TouchableOpacity>
    );
  };

  return (
    <FlatListScreen
      title={'Accounts'}
      autoFocus={false}
      items={getAccountList()}
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
          moreOptionList={dAppAccessDetailMoreOptions}
          onChangeModalVisible={() => setModalVisible(false)}
        />
      }
    />
  );
};
