import { FlatListScreen } from 'components/FlatListScreen';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useMemo, useRef } from 'react';
import { EmptyList } from 'components/EmptyList';
import { SectionItem } from 'components/LazySectionList';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import Typography from '../../design-system-ui/typography';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from 'utils/accountAll';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import createStylesheet from './style/AddressBookModal';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AbstractAddressJson } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import { getReformatedAddressRelatedToChain } from 'utils/account';
import useChainInfo from 'hooks/chain/useChainInfo';

interface Props {
  modalVisible: boolean;
  value?: string;
  onSelect: (val: string) => void;
  chainSlug?: string;
  setVisible: (arg: boolean) => void;
}

enum AccountGroup {
  WALLET = 'wallet',
  CONTACT = 'contact',
  RECENT = 'recent',
}

interface AccountItem extends AbstractAddressJson {
  group: AccountGroup;
  formatedAddress: string;
  proxyId?: string;
}

function searchFunction(items: AccountItem[], searchText: string) {
  if (!searchText) {
    return items;
  }

  const searchTextLowerCase = searchText.toLowerCase();

  return items.filter(item => {
    return (
      item.formatedAddress.toLowerCase().includes(searchTextLowerCase) ||
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

export const AddressBookModal = ({ chainSlug, modalVisible, onSelect, value = '', setVisible }: Props) => {
  const { accountProxies, contacts, recent } = useSelector((state: RootState) => state.accountState);
  const chainInfo = useChainInfo(chainSlug);
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

      return `${priority}|${AccountGroupNameMap[item.group]}|${item.group}`;
    },
    [AccountGroupNameMap],
  );

  const FILTER_OPTIONS = [AccountGroup.WALLET, AccountGroup.CONTACT, AccountGroup.RECENT].map(valueItem => ({
    value: valueItem,
    label: AccountGroupNameMap[valueItem],
  }));

  const items = useMemo((): AccountItem[] => {
    if (!chainInfo) {
      return [];
    }

    const result: AccountItem[] = [];

    recent.forEach(acc => {
      const chains = acc.recentChainSlugs || [];

      if (chainSlug && chains.includes(chainSlug)) {
        result.push({
          ...acc,
          address: acc.address,
          formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
          group: AccountGroup.RECENT,
        });
      }
    });

    contacts.forEach(acc => {
      result.push({
        ...acc,
        address: acc.address,
        formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
        group: AccountGroup.CONTACT,
      });
    });

    accountProxies.forEach(ap => {
      if (isAccountAll(ap.id)) {
        return;
      }

      // todo: recheck with ledger

      ap.accounts.forEach(acc => {
        const formatedAddress = getReformatedAddressRelatedToChain(acc, chainInfo);

        if (formatedAddress) {
          result.push({ ...acc, address: acc.address, formatedAddress, proxyId: ap.id, group: AccountGroup.WALLET });
        }
      });
    });

    return result;
  }, [accountProxies, chainInfo, chainSlug, contacts, recent]);

  const onSelectItem = useCallback(
    (item: AccountItem) => {
      return () => {
        onSelect(item.formatedAddress);
        onClose();
      };
    },
    [onClose, onSelect],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountItem>) => {
      const isRecent = item.group === AccountGroup.RECENT;

      return (
        <AccountItemWithName
          key={`${item.name}-${item.formatedAddress}`}
          accountName={item.name}
          avatarValue={item.proxyId || item.address}
          address={item.formatedAddress}
          addressPreLength={isRecent ? 9 : 4}
          addressSufLength={isRecent ? 9 : 4}
          avatarSize={theme.sizeLG}
          fallbackName={false}
          onPress={onSelectItem(item)}
          isSelected={value.toLowerCase() === item.formatedAddress.toLowerCase()}
          customStyle={{ container: { marginHorizontal: theme.margin, marginBottom: theme.marginXS } }}
        />
      );
    },
    [onSelectItem, theme.margin, theme.marginXS, theme.sizeLG, value],
  );

  const renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null = useCallback(
    (item, itemLength = 0) => {
      return (
        <View style={stylesheet.sectionHeaderContainer}>
          <Typography.Text size={'sm'} style={stylesheet.sectionHeaderTitle}>
            {`${item.split('|')[1]} `}

            <Typography.Text size={'sm'} style={stylesheet.sectionHeaderCounter}>
              ({itemLength})
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
        estimatedItemSize={60}
      />
    </SwFullSizeModal>
  );
};
