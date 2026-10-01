import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ListRenderItemInfo } from '@shopify/flash-list';
import {
  EyeIcon,
  GitCommitIcon,
  MagnifyingGlassIcon,
  NeedleIcon,
  PlusCircleIcon,
  QrCodeIcon,
  QuestionIcon,
  StrategyIcon,
  SwatchesIcon,
  UserSwitchIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { AccountProxyType, AccountSignMode } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { isSubstrateAddress } from '@subwallet/keyring';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { PhosphorIcon } from 'utils/campaign';
import { Button, Icon, SwFullSizeModal, Typography } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { EmptyList } from 'components/EmptyList';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { RootState } from 'stores/index';
import { FlatListScreenPaddingTop, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { isAccountAll } from 'utils/accountAll';
import i18n from 'utils/i18n/i18n';

export interface SignerData {
  address: string;
  displayName?: string;
  proxyId?: string;
  formatedAddress: string;
}

interface SignerItem extends SignerData {
  accountType: AccountProxyType;
}

const ACCOUNT_TYPE_GROUP_LABEL: Record<AccountProxyType, string> = {
  [AccountProxyType.ALL_ACCOUNT]: i18n.common.allAccounts,
  [AccountProxyType.UNIFIED]: 'Unified account',
  [AccountProxyType.SOLO]: 'Solo account',
  [AccountProxyType.QR]: 'QR signer account',
  [AccountProxyType.READ_ONLY]: 'Watch-only account',
  [AccountProxyType.LEDGER]: 'Ledger account',
  [AccountProxyType.INJECTED]: 'Injected account',
  [AccountProxyType.MULTISIG]: i18n.multisig.multisigAccount,
  [AccountProxyType.UNKNOWN]: 'Unknown account',
};

type AccountTypeBadge = { icon: PhosphorIcon; color?: string };

const ACCOUNT_TYPE_BADGE: Record<AccountProxyType, AccountTypeBadge | undefined> = {
  [AccountProxyType.ALL_ACCOUNT]: undefined,
  [AccountProxyType.UNIFIED]: { icon: StrategyIcon, color: 'colorSuccess' },
  [AccountProxyType.SOLO]: { icon: GitCommitIcon, color: 'blue-9' },
  [AccountProxyType.QR]: { icon: QrCodeIcon },
  [AccountProxyType.READ_ONLY]: { icon: EyeIcon },
  [AccountProxyType.LEDGER]: { icon: SwatchesIcon },
  [AccountProxyType.INJECTED]: { icon: NeedleIcon },
  [AccountProxyType.MULTISIG]: { icon: UserSwitchIcon, color: 'geekblue-9' },
  [AccountProxyType.UNKNOWN]: { icon: QuestionIcon },
};

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedSigners?: SignerData[];
  onConfirm: (selectedItems: SignerData[]) => void;
}

function searchFunction(items: SignerItem[], searchText: string) {
  if (!searchText) {
    return items;
  }

  const lower = searchText.toLowerCase();

  return items.filter(
    item =>
      item.formatedAddress.toLowerCase().includes(lower) ||
      (item.displayName ? item.displayName.toLowerCase().includes(lower) : false),
  );
}

const renderEmpty = () => (
  <EmptyList
    icon={MagnifyingGlassIcon}
    title={i18n.emptyScreen.selectorEmptyTitle}
    message={i18n.emptyScreen.selectorEmptyMessage}
  />
);

/**
 * Picks accounts from this wallet to become signatories of a new multisig account.
 * Only Substrate addresses qualify, and Ledger accounts must be on the generic app —
 * legacy and ECDSA Ledger accounts cannot produce a valid multisig signature.
 */
export const AddSignerMultisigModal = ({ modalVisible, onConfirm, selectedSigners = [], setModalVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const modalBaseV2Ref = useRef<SWModalRefProps | null>(null);
  const { accountProxies } = useSelector((state: RootState) => state.accountState);
  const [checkedSigners, setCheckedSigners] = useState<SignerData[]>([]);

  const disabledAddressList = useMemo(() => selectedSigners.map(s => s.address), [selectedSigners]);

  const onClose = useCallback(() => modalBaseV2Ref.current?.close(), []);

  const items = useMemo((): SignerItem[] => {
    const result: SignerItem[] = [];

    accountProxies.forEach(ap => {
      if (isAccountAll(ap.id)) {
        return;
      }

      if (ap.accountType === AccountProxyType.LEDGER) {
        const account = ap.accounts[0];

        if (account?.signMode !== AccountSignMode.GENERIC_LEDGER) {
          return;
        }
      }

      ap.accounts.forEach(acc => {
        const formatedAddress = reformatAddress(acc.address);

        if (isSubstrateAddress(formatedAddress)) {
          result.push({
            displayName: ap.name || acc.name,
            formatedAddress,
            address: acc.address,
            accountType: ap.accountType,
            proxyId: ap.id,
          });
        }
      });
    });

    return result.sort((a, b) => {
      const groupCompare = a.accountType.localeCompare(b.accountType);

      if (groupCompare !== 0) {
        return groupCompare;
      }

      return (a.displayName || a.formatedAddress).localeCompare(b.displayName || b.formatedAddress);
    });
  }, [accountProxies]);

  const onClickItem = useCallback(
    (item: SignerItem) => () => {
      if (disabledAddressList.includes(item.address)) {
        return;
      }

      setCheckedSigners(prev => {
        if (prev.some(s => s.address === item.address)) {
          return prev.filter(s => s.address !== item.address);
        }

        return [
          ...prev,
          {
            address: item.address,
            displayName: item.displayName,
            proxyId: item.proxyId,
            formatedAddress: item.formatedAddress,
          },
        ];
      });
    },
    [disabledAddressList],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SignerItem>) => {
      const isChecked = checkedSigners.some(s => s.address === item.address);
      const isDisabled = disabledAddressList.includes(item.address);

      const badge = ACCOUNT_TYPE_BADGE[item.accountType];

      return (
        <AccountItemWithName
          address={item.formatedAddress}
          avatarValue={item.proxyId || item.formatedAddress}
          accountName={item.displayName}
          avatarSize={theme.sizeLG}
          isSelected={isChecked || isDisabled}
          showUnselectIcon
          onPress={onClickItem(item)}
          customStyle={{ container: isDisabled ? styles.disabledItemSpaced : styles.item }}
          // The extension overlays the account-type badge on the avatar here; passing a
          // custom leftItem keeps it anchored to the avatar instead of the row padding.
          leftItem={
            <View style={styles.avatarWrapper}>
              <AccountProxyAvatar value={item.proxyId || item.formatedAddress} size={theme.sizeLG} />
              {!!badge && (
                <View style={styles.avatarBadge}>
                  <Icon
                    phosphorIcon={badge.icon}
                    customSize={10}
                    weight={'fill'}
                    iconColor={badge.color ? theme[badge.color as keyof ThemeTypes] as string : theme.colorWhite}
                  />
                </View>
              )}
            </View>
          }
        />
      );
    },
    [
      checkedSigners,
      disabledAddressList,
      onClickItem,
      styles.avatarBadge,
      styles.avatarWrapper,
      styles.disabledItemSpaced,
      styles.item,
      theme,
    ],
  );

  const groupBy = useCallback((item: SignerItem) => ACCOUNT_TYPE_GROUP_LABEL[item.accountType], []);

  const renderSectionHeader = useCallback(
    (item: string) => (
      <View key={item} style={styles.sectionHeaderContainer}>
        <Typography.Text size={'sm'} style={styles.sectionHeaderTitle}>
          {item.split('|')[0]}
        </Typography.Text>
      </View>
    ),
    [styles.sectionHeaderContainer, styles.sectionHeaderTitle],
  );

  const grouping = useMemo(
    () => ({ groupBy, sortSection: undefined, renderSectionHeader }),
    [groupBy, renderSectionHeader],
  );

  const onAddSigner = useCallback(() => {
    onConfirm(checkedSigners);
    onClose();
  }, [checkedSigners, onClose, onConfirm]);

  // Start from a clean selection each time the modal opens.
  useEffect(() => {
    if (modalVisible) {
      setCheckedSigners([]);
    }
  }, [modalVisible]);

  return (
    <SwFullSizeModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      onBackButtonPress={onClose}>
      <View style={styles.container}>
        <FlatListScreen
          autoFocus={false}
          searchMarginBottom={theme.sizeXS}
          items={items}
          style={FlatListScreenPaddingTop}
          title={i18n.multisig.selectAccount}
          searchFunction={searchFunction}
          renderItem={renderItem}
          renderListEmptyComponent={renderEmpty}
          grouping={grouping}
          onPressBack={onClose}
          keyExtractor={item => item.address}
          afterListItem={
            <View style={styles.footer}>
              <Button
                style={styles.footerButton}
                type={'secondary'}
                icon={<Icon phosphorIcon={XCircleIcon} weight={'fill'} size={'lg'} iconColor={theme.colorWhite} />}
                onPress={onClose}>
                {i18n.buttonTitles.cancel}
              </Button>
              <Button
                style={styles.footerButton}
                disabled={!checkedSigners.length}
                icon={
                  <Icon
                    phosphorIcon={PlusCircleIcon}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={checkedSigners.length ? theme.colorWhite : theme.colorTextLight5}
                  />
                }
                onPress={onAddSigner}>
                {i18n.multisig.addSigner}
              </Button>
            </View>
          }
        />
      </View>
    </SwFullSizeModal>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    // The extension spaces every neighbour pair - row/row, header/row, row/header -
    // by sizeXS; the section header already carries the gap below itself.
    item: {
      marginBottom: theme.sizeXS,
      marginHorizontal: theme.padding,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatarBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabledItemSpaced: {
      marginBottom: theme.sizeXS,
      marginHorizontal: theme.padding,
      opacity: 0.4,
    },
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
    footer: {
      flexDirection: 'row',
      gap: 4,
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
      ...MarginBottomForSubmitButton,
    },
    footerButton: {
      flex: 1,
    },
  });
}

export default AddSignerMultisigModal;
