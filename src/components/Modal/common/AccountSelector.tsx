import React from 'react';
import { ListRenderItemInfo, StyleProp, TouchableOpacity, View } from 'react-native';
import { Warning } from 'components/Warning';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { Account } from 'components/Account';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { ContainerHorizontalPadding, FlatListScreenPaddingTop } from 'styles/sharedStyles';

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: AccountJson) => void;
  items: AccountJson[];
}

const itemSeparator: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 1,
  marginLeft: 56,
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={i18n.warningMessage.noAccountMessage}
      isDanger={false}
    />
  );
};

export const AccountSelector = ({ modalVisible, onCancel, onSelectItem, items }: Props) => {
  const filteredAccounts = (_items: AccountJson[], searchString: string) => {
    return _items.filter(acc => acc.name && acc.name.toLowerCase().includes(searchString.toLowerCase()));
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountJson>) => {
    return (
      <TouchableOpacity style={{ ...ContainerHorizontalPadding }} onPress={() => onSelectItem(item)}>
        <Account
          name={item.name || ''}
          address={item.address}
          showCopyBtn={false}
          showSelectedIcon={false}
          isDisabled={true}
          showSubIcon={true}
          isSelected={false}
        />
        <View style={itemSeparator} />
      </TouchableOpacity>
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        onPressBack={onCancel}
        autoFocus={false}
        items={items}
        style={FlatListScreenPaddingTop}
        title={i18n.title.selectAccount}
        renderItem={renderItem}
        searchFunction={filteredAccounts}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
