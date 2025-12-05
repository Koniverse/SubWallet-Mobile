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
import { AnalyzeAddress, AnalyzedGroup } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import useChainInfo from 'hooks/chain/useChainInfo';
import useCoreCreateReformatAddress from 'hooks/common/useCoreCreateReformatAddress';
import { sortFuncAnalyzeAddress } from 'utils/sort/address';

interface Props {
  modalVisible: boolean;
  value?: string;
  onSelect: (val: string) => void;
  chainSlug?: string;
  setVisible: (arg: boolean) => void;
}

function searchFunction(items: AnalyzeAddress[], searchText: string) {
  if (!searchText) {
    return items;
  }

  const searchTextLowerCase = searchText.toLowerCase();

  return items.filter(item => {
    return (
      item.formatedAddress.toLowerCase().includes(searchTextLowerCase) ||
      (item.displayName ? item.displayName.toLowerCase().includes(searchTextLowerCase) : false)
    );
  });
}

const filterFunction = (items: AnalyzeAddress[], filters: string[]) => {
  const filteredItems: AnalyzeAddress[] = [];

  if (!filters.length) {
    return items;
  }

  items.forEach(item => {
    for (const filter of filters) {
      switch (filter) {
        case AnalyzedGroup.WALLET:
          if (item.analyzedGroup === AnalyzedGroup.WALLET) {
            filteredItems.push(item);
          }
          break;
        case AnalyzedGroup.CONTACT:
          if (item.analyzedGroup === AnalyzedGroup.CONTACT) {
            filteredItems.push(item);
          }
          break;
        case AnalyzedGroup.RECENT:
          if (item.analyzedGroup === AnalyzedGroup.RECENT) {
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

const sortSection = (a: SectionItem<AnalyzeAddress>, b: SectionItem<AnalyzeAddress>) => {
  return b.title.localeCompare(a.title);
};

const sortFunction = (a: AnalyzeAddress, b: AnalyzeAddress) => {
  if (b.displayName && a.displayName) {
    return b.displayName.localeCompare(a.displayName);
  }

  return b.address.localeCompare(a.address);
};

const getGroupPriority = (item: AnalyzeAddress): number => {
  switch (item.analyzedGroup) {
    case AnalyzedGroup.WALLET:
      return 2;
    case AnalyzedGroup.CONTACT:
      return 1;
    case AnalyzedGroup.RECENT:
    default:
      return 0;
  }
};

export const AddressBookModal = ({ chainSlug, modalVisible, onSelect, value = '', setVisible }: Props) => {
  const { accountProxies, contacts, recent } = useSelector((state: RootState) => state.accountState);
  const chainInfo = useChainInfo(chainSlug);
  const getReformatAddress = useCoreCreateReformatAddress();
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const onClose = useCallback(() => modalBaseV2Ref?.current?.close(), []);
  const AnalyzedGroupNameMap = useMemo(
    () => ({
      [AnalyzedGroup.WALLET]: i18n.addressBook.typeWallet,
      [AnalyzedGroup.CONTACT]: i18n.addressBook.typeContact,
      [AnalyzedGroup.RECENT]: i18n.addressBook.typeRecent,
      [AnalyzedGroup.DOMAIN]: 'Domain',
    }),
    [],
  );
  const groupBy = useCallback(
    (item: AnalyzeAddress) => {
      let priority;

      if (item.analyzedGroup === AnalyzedGroup.WALLET) {
        priority = '2';
      } else if (item.analyzedGroup === AnalyzedGroup.CONTACT) {
        priority = '1';
      } else {
        priority = '0';
      }

      return `${priority}|${AnalyzedGroupNameMap[item.analyzedGroup]}|${item.analyzedGroup}`;
    },
    [AnalyzedGroupNameMap],
  );

  const FILTER_OPTIONS = [AnalyzedGroup.WALLET, AnalyzedGroup.CONTACT, AnalyzedGroup.RECENT].map(valueItem => ({
    value: valueItem,
    label: AnalyzedGroupNameMap[valueItem],
  }));

  const items = useMemo((): AnalyzeAddress[] => {
    if (!chainInfo) {
      return [];
    }

    const result: AnalyzeAddress[] = [];

    recent.forEach(acc => {
      const chains = acc.recentChainSlugs || [];

      if (chainSlug && chains.includes(chainSlug)) {
        result.push({
          ...acc,
          address: acc.address,
          formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
          analyzedGroup: AnalyzedGroup.RECENT,
        });
      }
    });

    contacts.forEach(acc => {
      result.push({
        ...acc,
        address: acc.address,
        formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
        analyzedGroup: AnalyzedGroup.CONTACT,
      });
    });

    accountProxies.forEach(ap => {
      if (isAccountAll(ap.id)) {
        return;
      }

      // todo: recheck with ledger

      ap.accounts.forEach(acc => {
        const formatedAddress = getReformatAddress(acc, chainInfo);

        if (formatedAddress) {
          result.push({
            displayName: acc.name,
            formatedAddress,
            address: acc.address,
            analyzedGroup: AnalyzedGroup.WALLET,
            proxyId: ap.id,
          });
        }
      });
    });

    return result.sort(sortFuncAnalyzeAddress).sort((a, b) => getGroupPriority(b) - getGroupPriority(a));
  }, [accountProxies, chainInfo, chainSlug, contacts, getReformatAddress, recent]);

  const onSelectItem = useCallback(
    (item: AnalyzeAddress) => {
      return () => {
        onSelect(item.formatedAddress);
        onClose();
      };
    },
    [onClose, onSelect],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AnalyzeAddress>) => {
      const isRecent = item.analyzedGroup === AnalyzedGroup.RECENT;

      return (
        <AccountItemWithName
          key={`${item.displayName}-${item.formatedAddress}`}
          accountName={item.displayName}
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
