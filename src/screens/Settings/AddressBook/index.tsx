import { FlatListScreen } from 'components/FlatListScreen';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useMemo, useState } from 'react';
import { AddressJson } from '@subwallet/extension-base/background/types';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import { Keyboard, ListRenderItemInfo, View } from 'react-native';
import Typography from '../../../components/design-system-ui/typography';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SectionItem } from 'components/LazySectionList';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass, PencilSimpleLine, Plus } from 'phosphor-react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import reformatAddress from 'utils/index';
import { isAddress } from '@polkadot/util-crypto';
import { AddContactModal } from 'components/Modal/AddressBook/AddContactModal';
import { EditContactModal } from 'components/Modal/AddressBook/EditContactModal';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import { Icon } from 'components/design-system-ui';
import createStylesheet from './style';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

enum AccountGroup {
  CONTACT = 'contact',
  RECENT = 'recent',
}

interface AccountItem extends AddressJson {
  group: AccountGroup;
}

function searchFunction(items: AccountItem[], searchText: string) {
  if (!searchText) {
    return items;
  }

  const searchTextLowerCase = searchText.toLowerCase();

  return items.filter(item => {
    return (
      item.address.toLowerCase().includes(searchTextLowerCase) ||
      (item.name ? item.name.toLowerCase().includes(searchTextLowerCase) : false)
    );
  });
}

const filterFunction = (items: AccountItem[], filters: string[]) => {
  const filteredItems: AccountItem[] = [];

  if (!filters.length) {
    return items;
  }

  items.forEach(item => {
    for (const filter of filters) {
      switch (filter) {
        case AccountGroup.CONTACT:
          if (item.group === AccountGroup.CONTACT) {
            filteredItems.push(item);
          }
          break;
        case AccountGroup.RECENT:
          if (item.group === AccountGroup.RECENT) {
            filteredItems.push(item);
          }
      }
    }
  });

  return filteredItems;
};

const emptyList = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
    />
  );
};

const sortSection = (a: SectionItem<AccountItem>, b: SectionItem<AccountItem>) => {
  return b.title.localeCompare(a.title);
};

const sortFunction = (a: AccountItem, b: AccountItem) => {
  if (b.name && a.name) {
    return b.name.localeCompare(a.name);
  }

  return b.address.localeCompare(a.address);
};

export const ManageAddressBook = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const { contacts, recent } = useSelector((state: RootState) => state.accountState);
  const [isShowAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [isShowEditContactModal, setShowEditContactModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<AddressJson | undefined>();
  const stylesheet = createStylesheet(theme);
  const AccountGroupNameMap = useMemo(
    () => ({
      [AccountGroup.CONTACT]: i18n.addressBook.typeContact,
      [AccountGroup.RECENT]: i18n.addressBook.typeRecent,
    }),
    [],
  );
  const groupBy = useMemo(
    () => (item: AccountItem) => {
      const priority = item.group === AccountGroup.RECENT ? '1' : '0';

      return `${priority}|${AccountGroupNameMap[item.group]}`;
    },
    [AccountGroupNameMap],
  );

  const FILTER_OPTIONS = [AccountGroup.RECENT, AccountGroup.CONTACT].map(value => ({
    value,
    label: AccountGroupNameMap[value],
  }));

  const items = useMemo((): AccountItem[] => {
    const result: AccountItem[] = [];

    recent.forEach(acc => {
      const address = isAddress(acc.address) ? reformatAddress(acc.address) : acc.address;

      result.push({ ...acc, address: address, group: AccountGroup.RECENT });
    });

    contacts.forEach(acc => {
      const address = isAddress(acc.address) ? reformatAddress(acc.address) : acc.address;

      result.push({ ...acc, address: address, group: AccountGroup.CONTACT });
    });

    return result;
  }, [contacts, recent]);

  const renderSectionHeader: (info: { section: SectionListData<AccountItem> }) => React.ReactElement | null =
    useCallback(
      (info: { section: SectionListData<AccountItem> }) => {
        return (
          <View style={stylesheet.sectionHeaderContainer}>
            <Typography.Text size={'sm'} style={stylesheet.sectionHeaderTitle}>
              {`${info.section.title.split('|')[1]} `}

              <Typography.Text size={'sm'} style={stylesheet.sectionHeaderCounter}>
                ({info.section.data.length.toString().padStart(2, '0')})
              </Typography.Text>
            </Typography.Text>
          </View>
        );
      },
      [stylesheet.sectionHeaderContainer, stylesheet.sectionHeaderCounter, stylesheet.sectionHeaderTitle],
    );

  const grouping = useMemo(() => {
    return { groupBy, sortSection, renderSectionHeader };
  }, [groupBy, renderSectionHeader]);

  const ItemRightIcon = useMemo(
    () => (
      <View style={stylesheet.itemRightIconWrapper}>
        <Icon iconColor={theme.colorTextLight3} phosphorIcon={PencilSimpleLine} size="sm" type="phosphor" />
      </View>
    ),
    [stylesheet.itemRightIconWrapper, theme.colorTextLight3],
  );

  const BeforeListItem = useMemo(() => <View style={stylesheet.beforeListBlock} />, [stylesheet.beforeListBlock]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountItem>) => {
      if (item.group === AccountGroup.RECENT) {
        return (
          <AccountItemBase
            key={`${item.name}-${item.address}`}
            address={item.address}
            avatarSize={theme.sizeLG}
            addressPreLength={9}
            addressSufLength={11}
            onPress={() => {
              Keyboard.dismiss();
              setSelectedItem(item);
              setTimeout(() => setShowEditContactModal(true), 100);
            }}
            customStyle={{ address: { ...FontSemiBold, color: theme.colorTextLight4 } }}
            rightItem={ItemRightIcon}
          />
        );
      }

      return (
        <AccountItemWithName
          key={`${item.name}-${item.address}`}
          accountName={item.name}
          address={item.address}
          avatarSize={theme.sizeLG}
          onPress={() => {
            Keyboard.dismiss();
            setSelectedItem(item);
            setTimeout(() => setShowEditContactModal(true), 100);
          }}
          rightItem={ItemRightIcon}
        />
      );
    },
    [ItemRightIcon, theme.colorTextLight4, theme.sizeLG],
  );

  const listRightIconOption = useMemo(() => {
    return {
      icon: Plus,
      onPress: () => {
        setShowAddContactModal(true);
      },
    };
  }, []);

  return (
    <>
      <FlatListScreen
        autoFocus={false}
        showLeftBtn={true}
        items={items}
        rightIconOption={listRightIconOption}
        beforeListItem={BeforeListItem}
        title={i18n.header.manageAddressBook}
        placeholder={i18n.placeholder.searchAddressBook}
        searchFunction={searchFunction}
        renderItem={renderItem}
        isShowFilterBtn
        renderListEmptyComponent={emptyList}
        grouping={grouping}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        sortFunction={sortFunction}
        searchMarginBottom={theme.sizeXS}
        flatListStyle={stylesheet.flatListStyle}
        onPressBack={() => navigation.goBack()}
      />

      <AddContactModal modalVisible={isShowAddContactModal} setModalVisible={setShowAddContactModal} />

      {selectedItem && (
        <EditContactModal
          addressJson={selectedItem}
          modalVisible={isShowEditContactModal}
          setModalVisible={setShowEditContactModal}
        />
      )}
    </>
  );
};
