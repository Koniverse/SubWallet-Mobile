import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleProp, View } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { Account } from 'components/Account';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ColorMap } from 'styles/color';

interface Props {
  modalVisible: boolean;
  onPressBack?: () => void;
  onChangeAddress?: (address: string) => void;
  onChangeModalVisible: () => void;
  accountList: AccountJson[];
}

const itemSeparator: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 1,
  marginLeft: 56,
};

export const AccountSelect = ({
  accountList,
  onPressBack,
  modalVisible,
  onChangeModalVisible,
  onChangeAddress,
}: Props) => {
  const [searchString, setSearchString] = useState('');
  const [filteredGenesisOptions, setFilteredGenesisOption] = useState<AccountJson[]>(accountList);

  const dep = accountList.toString();

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredGenesisOption(
        accountList.filter(acc => acc.name && acc.name.toLowerCase().includes(lowerCaseSearchString)),
      );
    } else {
      setFilteredGenesisOption(accountList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  const renderItem = ({ item }: ListRenderItemInfo<AccountJson>) => {
    return (
      <View>
        <Account
          name={item.name || ''}
          address={item.address}
          showCopyBtn={false}
          showSelectedIcon={false}
          selectAccount={onChangeAddress}
        />
        <View style={itemSeparator} />
      </View>
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={"There's no account at the moment"} isDanger={false} />;
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <SelectScreen
        style={{ paddingTop: 0 }}
        onPressBack={onPressBack || (() => {})}
        title={'Select Account'}
        searchString={searchString}
        onChangeSearchText={setSearchString}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={filteredGenesisOptions}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.address}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
