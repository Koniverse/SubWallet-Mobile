import React, { useCallback } from 'react';
import i18n from 'utils/i18n/i18n';
import { SortFunctionInterface } from 'types/ui-types';
import { LazySectionList, SectionItem } from 'components/LazySectionList';
import { AccountProxyExtra_ } from '..';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { ImportJsonAccountItem } from 'screens/Account/RestoreJson/ImportJsonAccountSelector/ImportJsonAccountItem';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';

interface Props {
  value?: string;
  addressPrefix?: number;
  onSelect: (account: AccountProxyExtra_) => () => void;
  onClose: () => void;
  items: AccountProxyExtra_[];
  grouping: {
    renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null;
    groupBy: (item: AccountProxyExtra_) => string;
    sortSection?: SortFunctionInterface<SectionItem<AccountProxyExtra_>>;
  };
  accountProxiesSelected: string[];
}

export const ImportJsonAccountSelector = ({ grouping, items, accountProxiesSelected, onSelect }: Props) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountProxyExtra_>) => {
      const selected = accountProxiesSelected.includes(item.id);
      return <ImportJsonAccountItem key={item.id} accountProxy={item} isSelected={selected} onPress={onSelect(item)} />;
    },
    [accountProxiesSelected, onSelect],
  );

  const renderEmptyList = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

  return (
    <LazySectionList
      items={items}
      renderItem={renderItem}
      renderListEmptyComponent={renderEmptyList}
      groupBy={grouping?.groupBy}
      renderSectionHeader={grouping?.renderSectionHeader}
      estimatedItemSize={60}
      extraData={accountProxiesSelected}
    />
  );
};
