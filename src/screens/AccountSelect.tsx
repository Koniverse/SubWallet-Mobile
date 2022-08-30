import React from 'react';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import { Warning } from 'components/Warning';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { Account } from 'components/Account';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';

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
  return <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noAccountMessage} isDanger={false} />;
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

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        onPressBack={onPressBack}
        autoFocus={false}
        items={accountList}
        style={{ paddingTop: 0 }}
        title={i18n.title.selectAccount}
        renderItem={renderItem}
        filterFunction={filteredAccounts}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
