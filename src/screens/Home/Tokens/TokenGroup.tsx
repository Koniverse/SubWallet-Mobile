import { GradientBackgroundColorSet, ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { TokensLayout } from 'screens/Home/Tokens/shared/TokensLayout.tsx';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TokenBalanceItemType } from 'types/balance';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme.tsx';
import { useNavigation } from '@react-navigation/native';
import { CryptoNavigationProps } from 'routes/home.ts';
import { ModalRef } from 'types/modalRef.ts';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';
import useTokenGroup from 'hooks/screen/useTokenGroup.ts';
import useDebouncedValue from 'hooks/common/useDebouncedValue';
import useAccountBalance from 'screens/useAccountBalance.ts';
import { sortTokensByStandard } from 'utils/sort/token';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenGroupsUpperBlock } from 'screens/Home/Tokens/TokenGroupsUpperBlock';
import useReceiveQR from 'hooks/screen/Home/Tokens/useReceiveQR.ts';
import { AccountChainType, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import i18n from 'utils/i18n/i18n.ts';
import { useToast } from 'react-native-toast-notifications';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import {
  ClockCounterClockwiseIcon,
  FadersHorizontalIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
} from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes.ts';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { itemWrapperStyle } from 'screens/Home/Tokens/layers/shared.tsx';
import { tokenItem } from 'constants/itemHeight.ts';
import { TokenGroupBalanceItem } from 'components/common/TokenGroupBalanceItem';
import { LeftIconButton } from 'components/LeftIconButton.tsx';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { useMMKVBoolean } from 'react-native-mmkv';
import { IS_SHOW_TON_CONTRACT_VERSION_WARNING } from 'constants/localStorage';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { AccountSelector } from 'components/Modal/common/AccountSelector.tsx';
import { TonWalletContractSelectorModal } from 'components/Modal/TonWalletContractSelectorModal.tsx';
import { AccountAddressItemType } from 'types/account';
import { isTonAddress } from '@subwallet/keyring';
import { CustomizationModal } from 'screens/Home/Tokens/CustomizationModal.tsx';
import { TokenSearchModal } from 'components/Modal/TokenSearchModal.tsx';
import { SelectAccAndTokenModal } from 'components/Modal/SelectAccAndTokenModal';

export interface TokenSearchRef {
  onOpenModal: () => void;
  onCloseModal: () => void;
  isModalOpen: boolean;
}

export const TokenGroups = () => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const navigation = useNavigation<CryptoNavigationProps>();
  const tokenSearchRef = useRef<TokenSearchRef>(undefined);
  const tonAccountRef = useRef<ModalRef>(undefined);
  const chainsByAccountType = useGetChainSlugsByCurrentAccountProxy();
  const { tokenGroups, tokenGroupMap, tokenSlugs } = useTokenGroup(chainsByAccountType);
  const { tokenGroupBalanceMap, totalBalanceInfo, tokenBalanceMap } = useAccountBalance(tokenGroupMap);
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const priorityTokens = useSelector((state: RootState) => state.chainStore.priorityTokens);
  const isTotalBalanceDecrease = totalBalanceInfo.change.status === 'decrease';
  const [isCustomizationModalVisible, setCustomizationModalVisible] = useState<boolean>(false);
  const [isTonVersionSelectorVisible, setTonVersionSelectorVisible] = useState<boolean>(false);
  const { accountProxies, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const [isShowTonWarning = true, setIsShowTonWarning] = useMMKVBoolean(IS_SHOW_TON_CONTRACT_VERSION_WARNING);

  const tonAddress = useMemo(() => {
    return currentAccountProxy?.accounts.find(acc => isTonAddress(acc.address))?.address;
  }, [currentAccountProxy]);
  const [currentTonAddress, setCurrentTonAddress] = useState(isAllAccount ? undefined : tonAddress);

  const {
    accountSelectorItems,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    tokenSelectorItems,
    accountRef,
    tokenRef,
  } = useReceiveQR();
  const toast = useToast();
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('token');

  const isHaveOnlyTonSoloAcc = useMemo(() => {
    const checkValidAcc = (currentAcc: AccountProxy) => {
      return currentAcc?.accountType === AccountProxyType.SOLO && currentAcc?.chainTypes.includes(AccountChainType.TON);
    };

    if (isAllAccount) {
      return accountProxies
        .filter(a => a.accountType !== AccountProxyType.ALL_ACCOUNT)
        .every(acc => checkValidAcc(acc));
    } else {
      return currentAccountProxy && checkValidAcc(currentAccountProxy);
    }
  }, [accountProxies, currentAccountProxy, isAllAccount]);

  const tonAccountList: AccountAddressItemType[] = useMemo(() => {
    return accountProxies
      .filter(acc => acc?.accountType === AccountProxyType.SOLO && acc?.chainTypes.includes(AccountChainType.TON))
      .map(item => ({
        accountName: item.name,
        accountProxyId: item.id,
        accountProxyType: item.accountType,
        accountType: item.accounts[0].type,
        address: item.accounts[0].address,
        accountActions: item.accountActions,
      }));
  }, [accountProxies]);

  const onCloseAccountSelector = useCallback(() => {
    setIsShowTonWarning(false);
    tonAccountRef && tonAccountRef.current?.closeModal?.();
  }, [setIsShowTonWarning]);

  const onSelectAccountSelector = useCallback((item: AccountAddressItemType) => {
    setCurrentTonAddress(item.address);
    setTonVersionSelectorVisible(true);
  }, []);

  const onBackTonWalletContactModal = useCallback(() => {
    setIsShowTonWarning(false);
    setTonVersionSelectorVisible(false);
  }, [setIsShowTonWarning]);

  const onCloseTonWalletContactModal = useCallback(() => {
    setIsShowTonWarning(false);
    setTimeout(() => {
      tonAccountRef && tonAccountRef.current?.closeModal?.();
      setTonVersionSelectorVisible(false);
    }, 200);
  }, [setIsShowTonWarning]);

  const onOpenTonWalletContactModal = useCallback(() => {
    if (isAllAccount) {
      tonAccountRef && tonAccountRef.current?.onOpenModal();
    } else {
      setCurrentTonAddress(tonAddress);
      setTonVersionSelectorVisible(true);
    }
  }, [isAllAccount, tonAddress]);

  const onPressItem = useCallback(
    (item: TokenBalanceItemType) => {
      return () => {
        requestAnimationFrame(() => {
          navigation.navigate('TokenGroupsDetail', {
            slug: item.slug,
          });
        });
      };
    },
    [navigation],
  );

  const onPressSearchItem = useCallback(
    (item: TokenBalanceItemType) => {
      onPressItem(item)();
      tokenSearchRef && tokenSearchRef.current?.onCloseModal();
    },
    [onPressItem],
  );

  const debouncedTokenGroupBalanceMap = useDebouncedValue<Record<string, TokenBalanceItemType>>(
    tokenGroupBalanceMap,
    300,
  );

  const tokenGroupBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    const result: TokenBalanceItemType[] = [];
    tokenGroups.forEach(tokenGroupSlug => {
      if (debouncedTokenGroupBalanceMap[tokenGroupSlug]) {
        result.push(debouncedTokenGroupBalanceMap[tokenGroupSlug]);
      }
    });

    sortTokensByStandard(result, priorityTokens, true);

    return result;
  }, [debouncedTokenGroupBalanceMap, priorityTokens, tokenGroups]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => (
      <View key={item.slug} style={[itemWrapperStyle, { backgroundColor: theme.colorBgSecondary, height: tokenItem }]}>
        <TokenGroupBalanceItem onPress={onPressItem(item)} {...item} isShowBalance={isShowBalance} />
      </View>
    ),
    [isShowBalance, onPressItem, theme.colorBgSecondary],
  );

  const onOpenCustomizationModal = useCallback(() => {
    setCustomizationModalVisible(true);
  }, []);

  const onOpenTokenSearchModal = useCallback(() => tokenSearchRef && tokenSearchRef.current?.onOpenModal(), []);

  const onOpenHistoryScreen = useCallback(() => {
    navigation.navigate('History', {});
  }, [navigation]);

  const actionsNode = useMemo(() => {
    return (
      <View style={styles.renderActionsStyle}>
        <Typography.Title level={4} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
          {i18n.settings.tokens}
        </Typography.Title>
        <View style={{ flexDirection: 'row', marginRight: -5 }}>
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="md" phosphorIcon={MagnifyingGlassIcon} iconColor={theme['gray-5']} weight={'bold'} />}
            onPress={() => {
              onOpenTokenSearchModal();
            }}
          />
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="md" phosphorIcon={FadersHorizontalIcon} iconColor={theme['gray-5']} weight={'bold'} />}
            onPress={onOpenCustomizationModal}
          />
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="md" phosphorIcon={ClockCounterClockwiseIcon} iconColor={theme['gray-5']} weight={'bold'} />}
            onPress={onOpenHistoryScreen}
          />
        </View>
      </View>
    );
  }, [styles.renderActionsStyle, theme, onOpenCustomizationModal, onOpenHistoryScreen, onOpenTokenSearchModal]);

  const showNoti = useCallback(
    (text: string) => {
      toast.hideAll();
      toast.show(text, { textStyle: { textAlign: 'center' }, type: 'normal' });
    },
    [toast],
  );

  const _onOpenSendFund = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      showNoti(i18n.notificationMessage.watchOnlyNoti);
      return;
    }

    const filteredAccounts = accountProxies.filter(ap => !isAccountAll(ap.id));

    const isAllLedger =
      currentAccountProxy.accountType === AccountProxyType.LEDGER ||
      (filteredAccounts.length > 0 && filteredAccounts.every(ap => ap.accountType === AccountProxyType.LEDGER));

    if (isAllLedger) {
      showNoti(i18n.formatString(i18n.notificationMessage.accountTypeNoti, 'ledger') as string);
      return;
    }

    const onSuccess = () => {
      navigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: { screen: 'SendFund', params: {} },
      });
    };

    onSuccess();
  }, [accountProxies, currentAccountProxy, navigation, showNoti]);

  const _onPressSwap = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      showNoti(i18n.notificationMessage.watchOnlyNoti);
      return;
    }

    const filteredAccounts = accountProxies.filter(ap => !isAccountAll(ap.id));

    const isAllLedger =
      currentAccountProxy.accountType === AccountProxyType.LEDGER ||
      (filteredAccounts.length > 0 && filteredAccounts.every(ap => ap.accountType === AccountProxyType.LEDGER));

    if (isAllLedger) {
      showNoti(i18n.formatString(i18n.notificationMessage.accountTypeNoti, 'ledger') as string);
      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'Swap',
        params: {},
      },
    });
  }, [accountProxies, currentAccountProxy, navigation, showNoti]);

  const listHeaderNode = useMemo(() => {
    return (
      <TokenGroupsUpperBlock
        onOpenReceive={onOpenReceive}
        totalChangePercent={totalBalanceInfo.change.percent}
        totalChangeValue={totalBalanceInfo.change.value}
        totalValue={totalBalanceInfo.convertedValue}
        isPriceDecrease={isTotalBalanceDecrease}
        onOpenSendFund={_onOpenSendFund}
        onOpenSwap={_onPressSwap}
      />
    );
  }, [
    onOpenReceive,
    totalBalanceInfo.change.percent,
    totalBalanceInfo.change.value,
    totalBalanceInfo.convertedValue,
    isTotalBalanceDecrease,
    _onOpenSendFund,
    _onPressSwap,
  ]);

  const listFooterNode = useMemo(() => {
    return (
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <LeftIconButton
          icon={SlidersHorizontalIcon}
          title={i18n.buttonTitles.manageTokens}
          onPress={() => navigation.navigate('CustomTokenSetting')}
        />
      </View>
    );
  }, [navigation]);

  const BeforeListNode = useMemo(() => {
    if (isHaveOnlyTonSoloAcc && isShowTonWarning) {
      return (
        <>
          <AlertBox
            description={
              <Typography.Text>
                <Typography.Text>
                  {'TON wallets have multiple versions, each with its own wallet address and balance. '}
                </Typography.Text>
                <Typography.Text
                  style={{ color: theme.colorPrimary, textDecorationLine: 'underline' }}
                  onPress={onOpenTonWalletContactModal}>
                  {'Change versions'}
                </Typography.Text>
                <Typography.Text>{" if you don't see balances"}</Typography.Text>
              </Typography.Text>
            }
            title={'Change wallet address & version'}
            type={'warning'}
          />
          <AccountSelector
            accountSelectorRef={tonAccountRef}
            items={tonAccountList}
            selectedValueMap={{}}
            onSelectItem={onSelectAccountSelector}
            onCloseModal={onCloseAccountSelector}
          />
          {currentTonAddress && isTonVersionSelectorVisible && (
            <TonWalletContractSelectorModal
              address={currentTonAddress}
              chainSlug={'ton'}
              onCancel={onCloseTonWalletContactModal}
              setModalVisible={setTonVersionSelectorVisible}
              modalVisible={isTonVersionSelectorVisible}
              onChangeModalVisible={onBackTonWalletContactModal}
            />
          )}
        </>
      );
    }
  }, [
    currentTonAddress,
    isHaveOnlyTonSoloAcc,
    isShowTonWarning,
    isTonVersionSelectorVisible,
    onBackTonWalletContactModal,
    onCloseAccountSelector,
    onCloseTonWalletContactModal,
    onOpenTonWalletContactModal,
    onSelectAccountSelector,
    theme.colorPrimary,
    tonAccountList,
  ]);

  return (
    <ScreenContainer
      gradientBackground={isTotalBalanceDecrease ? GradientBackgroundColorSet[1] : GradientBackgroundColorSet[0]}>
      <>
        <Header />

        <TokensLayout
          items={tokenGroupBalanceItems}
          layoutHeader={listHeaderNode}
          stickyBackground={isTotalBalanceDecrease ? GradientBackgroundColorSet[1] : GradientBackgroundColorSet[0]}
          listActions={actionsNode}
          renderItem={renderItem}
          layoutFooter={listFooterNode}
          banners={banners}
          onPressBanner={onPressBanner}
          dismissBanner={dismissBanner}
          beforeListNode={BeforeListNode}
        />

        <SelectAccAndTokenModal
          accountRef={accountRef}
          tokenRef={tokenRef}
          accountItems={accountSelectorItems}
          tokenItems={tokenSelectorItems}
          openSelectAccount={openSelectAccount}
          openSelectToken={openSelectToken}
        />

        <TokenSearchModal
          tokenSearchRef={tokenSearchRef}
          onSelectItem={onPressSearchItem}
          isShowBalance={isShowBalance}
          tokenSlugs={tokenSlugs}
          tokenBalanceMap={tokenBalanceMap}
        />

        {isCustomizationModalVisible && (
          <CustomizationModal modalVisible={isCustomizationModalVisible} setVisible={setCustomizationModalVisible} />
        )}
      </>
    </ScreenContainer>
  );
}

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    renderActionsStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 40,
      marginTop: 6,
      marginBottom: 4,
    }
  })
}