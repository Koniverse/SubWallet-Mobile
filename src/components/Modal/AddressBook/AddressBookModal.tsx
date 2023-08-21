import { FlatListScreen } from 'components/FlatListScreen';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useMemo, useRef } from 'react';
import { EmptyList } from 'components/EmptyList';
import { SectionItem } from 'components/LazySectionList';
import { AbstractAddressJson, AccountJson } from '@subwallet/extension-base/background/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import { ListRenderItemInfo, View } from 'react-native';
import Typography from '../../design-system-ui/typography';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { isAddress } from '@polkadot/util-crypto';
import reformatAddress, { toShort } from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from 'utils/accountAll';
import useFormatAddress from 'hooks/account/useFormatAddress';
import { isSameAddress } from '@subwallet/extension-base/utils';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import createStylesheet from './style/AddressBookModal';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  modalVisible: boolean;
  value?: string;
  addressPrefix?: number;
  onSelect: (val: string) => void;
  networkGenesisHash?: string;
  setVisible: (arg: boolean) => void;
}

enum AccountGroup {
  WALLET = 'wallet',
  CONTACT = 'contact',
  RECENT = 'recent',
}

interface AccountItem extends AbstractAddressJson {
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
        case AccountGroup.WALLET:
          if (item.group === AccountGroup.WALLET) {
            filteredItems.push(item);
          }
          break;
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

const checkLedger = (account: AccountJson, networkGenesisHash?: string): boolean => {
  return !networkGenesisHash || !account.isHardware || account.originGenesisHash === networkGenesisHash;
};

export const AddressBookModal = ({
  addressPrefix,
  networkGenesisHash,
  modalVisible,
  onSelect,
  value = '',
  setVisible,
}: Props) => {
  const { accounts, contacts, recent } = useSelector((state: RootState) => state.accountState);
  const formatAddress = useFormatAddress(addressPrefix);
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const onClose = useCallback(() => modalBaseV2Ref?.current?.close(), []);
  const AccountGroupNameMap = useMemo(
    () => ({
      [AccountGroup.WALLET]: i18n.addressBook.typeWallet,
      [AccountGroup.CONTACT]: i18n.addressBook.typeContact,
      [AccountGroup.RECENT]: i18n.addressBook.typeRecent,
    }),
    [],
  );
  const groupBy = useCallback(
    (item: AccountItem) => {
      let priority;

      if (item.group === AccountGroup.WALLET) {
        priority = '2';
      } else if (item.group === AccountGroup.CONTACT) {
        priority = '1';
      } else {
        priority = '0';
      }

      return `${priority}|${AccountGroupNameMap[item.group]}`;
    },
    [AccountGroupNameMap],
  );

  const FILTER_OPTIONS = [AccountGroup.WALLET, AccountGroup.CONTACT, AccountGroup.RECENT].map(valueItem => ({
    value: valueItem,
    label: AccountGroupNameMap[valueItem],
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

    accounts
      .filter(acc => !isAccountAll(acc.address))
      .forEach(acc => {
        const address = isAddress(acc.address) ? reformatAddress(acc.address) : acc.address;

        if (checkLedger(acc, networkGenesisHash)) {
          result.push({ ...acc, address: address, group: AccountGroup.WALLET });
        }
      });

    return result;
  }, [accounts, contacts, networkGenesisHash, recent]);

  const onSelectItem = useCallback(
    (item: AccountItem) => {
      return () => {
        onSelect(item.address);
        onClose();
      };
    },
    [onClose, onSelect],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountItem>) => {
      const address = formatAddress(item);
      const selected = value ? isSameAddress(address, value) : false;

      return (
        <AccountItemWithName
          key={`${item.name}-${item.address}`}
          accountName={item.name || toShort(item.address, 4, 4)}
          address={address}
          avatarSize={theme.sizeLG}
          onPress={onSelectItem(item)}
          isSelected={selected}
        />
      );
    },
    [formatAddress, onSelectItem, theme.sizeLG, value],
  );

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

  const BeforeListItem = useMemo(() => <View style={stylesheet.beforeListBlock} />, [stylesheet.beforeListBlock]);

  return (
    <SwFullSizeModal
      setVisible={setVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      modalVisible={modalVisible}
      onBackButtonPress={onClose}>
      <FlatListScreen
        style={FlatListScreenPaddingTop}
        autoFocus
        showLeftBtn={true}
        items={items}
        beforeListItem={BeforeListItem}
        onPressBack={onClose}
        title={i18n.header.addressBook}
        placeholder={i18n.placeholder.searchAddressBook}
        searchFunction={searchFunction}
        renderItem={renderItem}
        isShowFilterBtn
        renderListEmptyComponent={emptyList}
        grouping={grouping}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        sortFunction={sortFunction}
        isShowMainHeader={false}
        searchMarginBottom={theme.sizeXS}
        flatListStyle={stylesheet.flatListStyle}
      />
    </SwFullSizeModal>
  );
};
