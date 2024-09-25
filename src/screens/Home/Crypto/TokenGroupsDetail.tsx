import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { CryptoNavigationProps, TokenGroupsDetailProps } from 'routes/home';
import { SwNumberProps } from 'components/design-system-ui/number';
import { TokenBalanceItemType } from 'types/balance';
import { GradientBackgroundColorSet, ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { TokensLayout } from 'screens/Home/Crypto/shared/TokensLayout';
import { itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokenBalanceItem } from 'components/common/TokenBalanceItem';
import { TokenGroupsDetailUpperBlock } from 'screens/Home/Crypto/TokenGroupsDetailUpperBlock';
import { useNavigation } from '@react-navigation/native';
import { TokenDetailModal } from 'screens/Home/Crypto/TokenDetailModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useReceiveQR from 'hooks/screen/Home/Crypto/useReceiveQR';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import { SelectAccAndTokenModal } from 'screens/Home/Crypto/shared/SelectAccAndTokenModal';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { AccountChainType, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { useMMKVBoolean } from 'react-native-mmkv';
import { IS_SHOW_TON_CONTRACT_VERSION_WARNING } from 'constants/localStorage';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { Typography } from 'components/design-system-ui';
import { TonWalletContractSelectorModal } from 'components/Modal/TonWalletContractSelectorModal';
import { ModalRef } from 'types/modalRef';
import { AccountAddressItemType } from 'types/account';
import { KeypairType } from '@subwallet/keyring/types';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { isTonAddress } from '@subwallet/keyring';
import { sortTokensByStandard } from 'utils/sort/token';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';

type CurrentSelectToken = {
  symbol: string;
  slug: string;
};

export const TokenGroupsDetail = ({
  route: {
    params: { slug: tokenGroupSlug },
  },
}: TokenGroupsDetailProps) => {
  const tonAccountRef = useRef<ModalRef>();
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<CryptoNavigationProps>();
  const priorityTokens = useSelector((root: RootState) => root.chainStore.priorityTokens);
  const [currentTokenInfo, setCurrentTokenInfo] = useState<CurrentSelectToken | undefined>(undefined);
  const [tokenDetailVisible, setTokenDetailVisible] = useState<boolean>(false);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const multiChainAssetMap = useSelector((state: RootState) => state.assetRegistry.multiChainAssetMap);
  const { banners, dismissBanner, onPressBanner } = useGetBannerByScreen('token_detail', tokenGroupSlug);
  const { accountProxies, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const [isShowTonWarning = true, setIsShowTonWarning] = useMMKVBoolean(IS_SHOW_TON_CONTRACT_VERSION_WARNING);
  const [isTonVersionSelectorVisible, setTonVersionSelectorVisible] = useState<boolean>(false);
  const tonAddress = useMemo(() => {
    return currentAccountProxy?.accounts.find(acc => isTonAddress(acc.address))?.address;
  }, [currentAccountProxy]);
  const [currentTonAddress, setCurrentTonAddress] = useState(isAllAccount ? undefined : tonAddress);
  const groupSymbol = useMemo<string>(() => {
    if (tokenGroupSlug) {
      if (multiChainAssetMap[tokenGroupSlug]) {
        return multiChainAssetMap[tokenGroupSlug].symbol;
      }

      if (assetRegistryMap[tokenGroupSlug]) {
        return assetRegistryMap[tokenGroupSlug].symbol;
      }
    }

    return '';
  }, [tokenGroupSlug, assetRegistryMap, multiChainAssetMap]);

  const filteredAccountList: AccountAddressItemType[] = useMemo(() => {
    return accountProxies
      .filter(acc => {
        const isTonSoloAcc = acc.accountType === AccountProxyType.SOLO && acc.chainTypes.includes(AccountChainType.TON);

        return acc.accountType === AccountProxyType.UNIFIED || isTonSoloAcc;
      })
      .map(item => {
        const tonAcc = item.accounts.find(a => isTonAddress(a.address));

        return {
          accountName: item.name,
          accountProxyId: item.id,
          accountProxyType: item.accountType,
          accountType: tonAcc?.type as KeypairType,
          address: tonAcc?.address || '',
          accountActions: item.accountActions,
        };
      });
  }, [accountProxies]);

  const {
    accountSelectorItems,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    tokenSelectorItems,
    accountRef,
    tokenRef,
  } = useReceiveQR(tokenGroupSlug);

  const toast = useToast();

  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  const chainsByAccountType = useGetChainSlugsByAccount();
  const { tokenGroupMap, isComputing: isTokenGroupComputing } = useTokenGroup(chainsByAccountType, true);
  const {
    tokenBalanceMap,
    tokenGroupBalanceMap,
    isComputing: isAccountBalanceComputing,
  } = useAccountBalance(tokenGroupMap, true);
  const [isLoadingData, setLoadingData] = useState(true);
  const tokenBalanceValue = useMemo<SwNumberProps['value']>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupBalanceMap[tokenGroupSlug]) {
        return tokenGroupBalanceMap[tokenGroupSlug].total.convertedValue;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return tokenBalanceMap[tokenGroupSlug].total.convertedValue;
      }
    }

    return '0';
  }, [tokenGroupSlug, tokenBalanceMap, tokenGroupBalanceMap]);

  const tokenBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupMap[tokenGroupSlug]) {
        const items: TokenBalanceItemType[] = [];

        tokenGroupMap[tokenGroupSlug].forEach(tokenSlug => {
          if (tokenBalanceMap[tokenSlug]) {
            items.push(tokenBalanceMap[tokenSlug]);
          }
        });

        sortTokensByStandard(items, priorityTokens);

        return items;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return [tokenBalanceMap[tokenGroupSlug]];
      }
    }

    return [] as TokenBalanceItemType[];
  }, [tokenGroupSlug, tokenGroupMap, tokenBalanceMap, priorityTokens]);

  const onClickItem = useCallback((item: TokenBalanceItemType) => {
    return () => {
      setCurrentTokenInfo({
        slug: item.slug,
        symbol: item.symbol,
      });
      setTokenDetailVisible(true);
    };
  }, []);

  const onClickBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

  const isReadonlyAccount = useMemo(() => {
    return currentAccountProxy && currentAccountProxy.accountType === AccountProxyType.READ_ONLY;
  }, [currentAccountProxy]);

  const isIncludesTonToken = useMemo(() => {
    return !!TON_CHAINS.length && tokenBalanceItems.some(item => item.chain && TON_CHAINS.includes(item.chain));
  }, [tokenBalanceItems]);

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

  const onCloseAccountSelector = useCallback(() => {
    setIsShowTonWarning(false);
    tonAccountRef && tonAccountRef.current?.closeModal?.();
  }, [setIsShowTonWarning]);

  const onSelectAccountSelector = useCallback((item: AccountAddressItemType) => {
    setCurrentTonAddress(item.address);
    setTonVersionSelectorVisible(true);
  }, []);

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

    if (currentAccountProxy.accountType === AccountProxyType.LEDGER) {
      showNoti(i18n.formatString(i18n.notificationMessage.accountTypeNoti, 'ledger') as string);
      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'SendFund', params: { slug: tokenGroupSlug } },
    });
  }, [currentAccountProxy, navigation, showNoti, tokenGroupSlug]);

  const _onOpenSwap = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      showNoti(i18n.notificationMessage.watchOnlyNoti);
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.LEDGER) {
      showNoti(i18n.formatString(i18n.notificationMessage.accountTypeNoti, 'ledger') as string);
      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: { screen: 'Swap', params: { slug: tokenGroupSlug } },
    });
  }, [currentAccountProxy, navigation, showNoti, tokenGroupSlug]);

  const listHeaderNode = useMemo(() => {
    return (
      <TokenGroupsDetailUpperBlock
        onOpenReceive={onOpenReceive}
        onOpenSendFund={_onOpenSendFund}
        onOpenSwap={_onOpenSwap}
        balanceValue={tokenBalanceValue}
        onClickBack={onClickBack}
        groupSymbol={groupSymbol}
        tokenGroupSlug={tokenGroupSlug}
        tokenGroupMap={tokenGroupMap}
      />
    );
  }, [
    onOpenReceive,
    _onOpenSendFund,
    _onOpenSwap,
    tokenBalanceValue,
    onClickBack,
    groupSymbol,
    tokenGroupSlug,
    tokenGroupMap,
  ]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => (
      <View key={item.slug} style={[itemWrapperStyle, { backgroundColor: theme.colorBgSecondary }]}>
        <TokenBalanceItem onPress={onClickItem(item)} {...item} isShowBalance={isShowBalance} />
      </View>
    ),
    [isShowBalance, onClickItem, theme.colorBgSecondary],
  );

  // delay hide loading screen 300ms for smooth experience
  useEffect(() => {
    if (!isTokenGroupComputing && !isAccountBalanceComputing) {
      setTimeout(() => setLoadingData(false), 200);
    }
  }, [isAccountBalanceComputing, isTokenGroupComputing]);

  return (
    <ScreenContainer gradientBackground={GradientBackgroundColorSet[2]}>
      <>
        <Header />

        <TokensLayout
          loading={isLoadingData}
          items={tokenBalanceItems}
          layoutHeader={listHeaderNode}
          renderItem={renderItem}
          banners={banners}
          dismissBanner={dismissBanner}
          onPressBanner={onPressBanner}
          beforeListNode={
            <>
              {!isHaveOnlyTonSoloAcc && !isReadonlyAccount && isIncludesTonToken && isShowTonWarning && (
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
                  {!!filteredAccountList.length && (
                    <AccountSelector
                      accountSelectorRef={tonAccountRef}
                      items={filteredAccountList}
                      selectedValueMap={{}}
                      onSelectItem={onSelectAccountSelector}
                      onCloseModal={onCloseAccountSelector}
                    />
                  )}
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
              )}
            </>
          }
        />

        <TokenDetailModal
          currentTokenInfo={currentTokenInfo}
          tokenBalanceMap={tokenBalanceMap}
          modalVisible={tokenDetailVisible}
          setVisible={setTokenDetailVisible}
        />

        <SelectAccAndTokenModal
          accountRef={accountRef}
          tokenRef={tokenRef}
          accountItems={accountSelectorItems}
          tokenItems={tokenSelectorItems}
          openSelectAccount={openSelectAccount}
          openSelectToken={openSelectToken}
        />
      </>
    </ScreenContainer>
  );
};
