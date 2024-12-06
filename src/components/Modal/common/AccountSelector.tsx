import React, { useCallback, useMemo } from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { Keyboard, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { ModalRef } from 'types/modalRef';
import { AccountAddressItemType } from 'types/account';
import { VoidFunction } from 'types/index';
import { Typography } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountGroupLabel, AccountGroupType } from 'screens/Account/AccountsScreen';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountProxyType } from '@subwallet/extension-base/types';

interface Props {
  items: AccountAddressItemType[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: AccountAddressItemType) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<AccountAddressItemType>) => JSX.Element;
  onCloseModal?: VoidFunction;
}

export interface AccountAddressItemExtraType extends AccountAddressItemType {
  group: AccountGroupType;
}

export const AccountSelector = ({
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
  const styles = createStyle(theme);

  const listItems = useMemo<AccountAddressItemExtraType[]>(() => {
    let accountAll: AccountAddressItemExtraType | undefined;
    const result: AccountAddressItemExtraType[] = [];
    const masterAccounts: AccountAddressItemExtraType[] = [];
    const qrSignerAccounts: AccountAddressItemExtraType[] = [];
    const watchOnlyAccounts: AccountAddressItemExtraType[] = [];
    const ledgerAccounts: AccountAddressItemExtraType[] = [];
    const injectedAccounts: AccountAddressItemExtraType[] = [];
    const unknownAccounts: AccountAddressItemExtraType[] = [];

    items.forEach(ap => {
      if (isAccountAll(ap.accountProxyId) || ap.accountProxyType === AccountProxyType.ALL_ACCOUNT) {
        accountAll = { ...ap, group: AccountGroupType.ALL_ACCOUNT };

        return;
      }

      if (ap.accountProxyType === AccountProxyType.SOLO || ap.accountProxyType === AccountProxyType.UNIFIED) {
        masterAccounts.push({ ...ap, group: AccountGroupType.MASTER_ACCOUNT });
      } else if (ap.accountProxyType === AccountProxyType.QR) {
        qrSignerAccounts.push({ ...ap, group: AccountGroupType.QR });
      } else if (ap.accountProxyType === AccountProxyType.READ_ONLY) {
        watchOnlyAccounts.push({ ...ap, group: AccountGroupType.READ_ONLY });
      } else if (ap.accountProxyType === AccountProxyType.LEDGER) {
        ledgerAccounts.push({ ...ap, group: AccountGroupType.LEDGER });
      } else if (ap.accountProxyType === AccountProxyType.INJECTED) {
        injectedAccounts.push({ ...ap, group: AccountGroupType.INJECTED });
      } else if (ap.accountProxyType === AccountProxyType.UNKNOWN) {
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

    if (result.length && accountAll) {
      result.unshift(accountAll);
    }

    return result;
  }, [items]);

  const _onSelectItem = (item: AccountAddressItemExtraType) => {
    Keyboard.dismiss();
    onSelectItem && onSelectItem(item);
  };

  const groupBy = useCallback((item: AccountAddressItemExtraType) => {
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
        <View key={item} style={styles.sectionHeaderContainer}>
          <Typography.Text size={'sm'} style={styles.sectionHeaderTitle}>
            {`${item.split('|')[0]} `}
          </Typography.Text>
        </View>
      );
    },
    [styles.sectionHeaderContainer, styles.sectionHeaderTitle],
  );

  const grouping = useMemo(() => {
    return { groupBy, sortSection: undefined, renderSectionHeader };
  }, [groupBy, renderSectionHeader]);

  return (
    <FullSizeSelectModal
      items={listItems}
      selectedValueMap={selectedValueMap}
      onSelectItem={_onSelectItem}
      selectModalType={'single'}
      selectModalItemType={'account'}
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
