import React from 'react';
import { ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { AccountJson } from '@subwallet/extension-base/background/types';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop, FontSemiBold } from 'styles/sharedStyles';
import { EmptyList } from 'components/EmptyList';
import { CheckCircle, MagnifyingGlass } from 'phosphor-react-native';
import { Avatar, Icon, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: AccountJson) => void;
  items: AccountJson[];
  selectedValue?: string;
}

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={'No results found'}
      message={'Please change your search criteria try again'}
    />
  );
};

export const AccountSelector = ({ modalVisible, onCancel, onSelectItem, items, selectedValue }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const filteredAccounts = (_items: AccountJson[], searchString: string) => {
    return _items.filter(
      acc =>
        (acc.name && acc.name.toLowerCase().includes(searchString.toLowerCase())) ||
        acc.address.toLowerCase().includes(searchString.toLowerCase()),
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountJson>) => {
    return (
      <TouchableOpacity onPress={() => onSelectItem(item)}>
        <View
          style={{
            height: 52,
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: theme.colorBgSecondary,
            paddingHorizontal: theme.paddingSM,
            marginHorizontal: theme.margin,
            borderRadius: theme.borderRadiusLG,
            marginBottom: theme.marginXS,
          }}>
          <Avatar value={item.address} size={24} />
          <View style={{ flexDirection: 'row', flex: 1, paddingLeft: theme.paddingSM }}>
            <Typography.Text
              style={{
                fontSize: theme.fontSize,
                lineHeight: theme.fontSize * theme.lineHeight,
                ...FontSemiBold,
                color: theme.colorWhite,
                maxWidth: 120,
              }}
              ellipsis>
              {item.name || ''}
            </Typography.Text>
            <Text
              style={{
                fontSize: theme.fontSize,
                lineHeight: theme.fontSize * theme.lineHeight,
                ...FontSemiBold,
                color: theme.colorTextTertiary,
              }}>{` (${toShort(item.address, 4, 4)})`}</Text>
          </View>
          {!!selectedValue && item.address === selectedValue && (
            <View
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: -theme.marginXXS,
              }}>
              <Icon phosphorIcon={CheckCircle} weight={'fill'} size={'sm'} iconColor={theme.colorSuccess} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        onPressBack={onCancel}
        autoFocus={true}
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
