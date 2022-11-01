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

export const AccountSelect = ({
  accountList,
  onPressBack,
  modalVisible,
  onChangeModalVisible,
  onChangeAddress,
}: Props) => {
  const filteredAccounts = (items: AccountJson[], searchString: string) => {
    return items.filter(acc => acc.name && acc.name.toLowerCase().includes(searchString.toLowerCase()));
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountJson>) => {
    return (
      <TouchableOpacity
        style={{ ...ContainerHorizontalPadding }}
        onPress={() => onChangeAddress && onChangeAddress(item.address)}>
        <Account
          name={item.name || ''}
          address={item.address}
          showCopyBtn={false}
          showSelectedIcon={false}
          selectAccount={onChangeAddress}
          isDisabled={true}
        />
        <View style={itemSeparator} />
      </TouchableOpacity>
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        onPressBack={onPressBack}
        autoFocus={false}
        items={accountList}
        style={FlatListScreenPaddingTop}
        title={i18n.title.selectAccount}
        renderItem={renderItem}
        filterFunction={filteredAccounts}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
