import React, { useCallback, useMemo } from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { Keyboard, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { AccountGroupLabel, AccountGroupType, AccountProxyItem } from 'screens/Account/AccountsScreen';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

interface Props {
  items: AccountProxy[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: AccountProxyItem) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.Ref<any>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<AccountProxyItem>) => JSX.Element;
  onCloseModal?: VoidFunction;
}

export const AccountProxySelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  disabled,
  renderSelected,
  accountSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  renderCustomItem,
  onCloseModal,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStyle(theme);

  const listItems = useMemo<AccountProxyItem[]>(() => {
    let accountAll: AccountProxyItem | undefined;
    const result: AccountProxyItem[] = [];
    const masterAccounts: AccountProxyItem[] = [];
    const qrSignerAccounts: AccountProxyItem[] = [];
    const watchOnlyAccounts: AccountProxyItem[] = [];
    const ledgerAccounts: AccountProxyItem[] = [];
    const injectedAccounts: AccountProxyItem[] = [];
    const unknownAccounts: AccountProxyItem[] = [];

    items.forEach(ap => {
      if (isAccountAll(ap.id) || ap.accountType === AccountProxyType.ALL_ACCOUNT) {
        accountAll = { ...ap, group: AccountGroupType.ALL_ACCOUNT };

        return;
      }

      if (ap.accountType === AccountProxyType.SOLO || ap.accountType === AccountProxyType.UNIFIED) {
        masterAccounts.push({ ...ap, group: AccountGroupType.MASTER_ACCOUNT });
      } else if (ap.accountType === AccountProxyType.QR) {
        qrSignerAccounts.push({ ...ap, group: AccountGroupType.QR });
      } else if (ap.accountType === AccountProxyType.READ_ONLY) {
        watchOnlyAccounts.push({ ...ap, group: AccountGroupType.READ_ONLY });
      } else if (ap.accountType === AccountProxyType.LEDGER) {
        ledgerAccounts.push({ ...ap, group: AccountGroupType.LEDGER });
      } else if (ap.accountType === AccountProxyType.INJECTED) {
        injectedAccounts.push({ ...ap, group: AccountGroupType.INJECTED });
      } else if (ap.accountType === AccountProxyType.UNKNOWN) {
        unknownAccounts.push({ ...ap, group: AccountGroupType.UNKNOWN });
      }
    });

    if (masterAccounts.length) {
      result.push(...masterAccounts);
    }

    if (qrSignerAccounts.length) {
      result.push(...qrSignerAccounts);
    }

    if (watchOnlyAccounts.length) {
      result.push(...watchOnlyAccounts);
    }

    if (ledgerAccounts.length) {
      result.push(...ledgerAccounts);
    }

    if (injectedAccounts.length) {
      result.push(...ledgerAccounts);
    }

    if (unknownAccounts.length) {
      result.push(...unknownAccounts);
    }

    if (result.length > 1 && accountAll) {
      result.unshift(accountAll);
    }

    return result;
  }, [items]);

  const groupBy = useCallback((item: AccountProxyItem) => {
    return `${AccountGroupLabel[item.group]}`;
  }, []);

  const renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null = useCallback(
    (item: string) => {
      if (
        item.split('|')[0] === AccountGroupLabel[AccountGroupType.ALL_ACCOUNT] ||
        item.split('|')[0] === AccountGroupLabel[AccountGroupType.MASTER_ACCOUNT]
      ) {
        return <></>;
      }

      return (
        <View key={item} style={stylesheet.sectionHeaderContainer}>
          <Typography.Text size={'sm'} style={stylesheet.sectionHeaderTitle}>
            {`${item.split('|')[0]} `}
          </Typography.Text>
        </View>
      );
    },
    [stylesheet.sectionHeaderContainer, stylesheet.sectionHeaderTitle],
  );

  const grouping = useMemo(() => {
    return { groupBy, sortSection: undefined, renderSectionHeader };
  }, [groupBy, renderSectionHeader]);

  const _onSelectItem = (item: AccountProxyItem) => {
    Keyboard.dismiss();
    delayActionAfterDismissKeyboard(() => onSelectItem && onSelectItem(item));
  };

  const searchFunc = useCallback((_items: AccountProxyItem[], searchString: string) => {
    const lowerCaseSearchString = searchString.toLowerCase();

    return _items.filter(acc => {
      const isValidSearchByAddress = acc.accounts.some(ac => {
        return ac.address.toLowerCase().includes(searchString.toLowerCase());
      });

      return (acc.name && acc.name.toLowerCase().includes(lowerCaseSearchString)) || isValidSearchByAddress;
    });
  }, []);

  return (
    <FullSizeSelectModal
      items={listItems}
      selectedValueMap={selectedValueMap}
      onSelectItem={_onSelectItem}
      selectModalType={'single'}
      selectModalItemType={'account-proxy'}
      searchFunc={searchFunc}
      disabled={disabled}
      renderSelected={renderSelected}
      placeholder={i18n.placeholder.accountName}
      title={i18n.header.selectAccount}
      ref={accountSelectorRef}
      closeModalAfterSelect={closeModalAfterSelect}
      isShowContent={isShowContent}
      renderCustomItem={renderCustomItem}
      estimatedItemSize={60}
      onCloseModal={onCloseModal}
      grouping={grouping}
      isShowInput={isShowInput}>
      {children}
    </FullSizeSelectModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    sectionHeaderContainer: {
      paddingBottom: theme.sizeXS,
      backgroundColor: theme.colorBgDefault,
      paddingHorizontal: theme.padding,
    },
    sectionHeaderTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      textTransform: 'uppercase',
    },
  });
}
