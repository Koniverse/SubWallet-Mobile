import React, { useCallback, useMemo, useState } from 'react';
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
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { TokenSelector } from 'components/Modal/common/TokenSelector';
import { ReceiveModal } from 'screens/Home/Crypto/ReceiveModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useBuyToken from 'hooks/screen/Home/Crypto/useBuyToken';
import { ServiceModal } from 'screens/Home/Crypto/ServiceModal';
import { useToast } from 'react-native-toast-notifications';

type CurrentSelectToken = {
  symbol: string;
  slug: string;
};

export const TokenGroupsDetail = ({
  route: {
    params: { slug: tokenGroupSlug },
  },
}: TokenGroupsDetailProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<CryptoNavigationProps>();
  const [currentTokenInfo, setCurrentTokenInfo] = useState<CurrentSelectToken | undefined>(undefined);
  const [tokenDetailVisible, setTokenDetailVisible] = useState<boolean>(false);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const multiChainAssetMap = useSelector((state: RootState) => state.assetRegistry.multiChainAssetMap);
  const [accessBy, setAccessBy] = useState<'buy' | 'receive' | undefined>(undefined);
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
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  const {
    accountSelectorItems,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    selectedAccount,
    selectedNetwork,
    isTokenSelectorModalVisible,
    isAccountSelectorModalVisible,
    onCloseSelectAccount,
    onCloseSelectToken,
    onCloseQrModal,
    isQrModalVisible,
    tokenSelectorItems,
  } = useReceiveQR(tokenGroupSlug);

  const {
    isBuyTokenSelectorModalVisible,
    isBuyAccountSelectorModalVisible,
    isBuyServiceSelectorModalVisible,
    onOpenBuyToken,
    openSelectBuyAccount,
    openSelectBuyToken,
    onCloseSelectBuyAccount,
    onCloseSelectBuyToken,
    onCloseSelectBuyService,
    selectedBuyAccount,
    selectedBuyToken,
    buyAccountSelectorItems,
    buyTokenSelectorItems,
  } = useBuyToken(tokenGroupSlug, groupSymbol);

  const toast = useToast();

  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  const chainsByAccountType = useGetChainSlugs();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenBalanceMap, tokenGroupBalanceMap } = useAccountBalance(tokenGroupMap);

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

        return items;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return [tokenBalanceMap[tokenGroupSlug]];
      }
    }

    return [] as TokenBalanceItemType[];
  }, [tokenGroupSlug, tokenGroupMap, tokenBalanceMap]);

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

  const _onOpenReceive = useCallback(() => {
    setAccessBy('receive');
    onOpenReceive();
  }, [onOpenReceive]);

  const onPressBuyToken = useCallback(() => {
    setAccessBy('buy');
    onOpenBuyToken();
  }, [onOpenBuyToken]);

  const showNoti = useCallback(
    (text: string) => {
      toast.hideAll();
      toast.show(text, { textStyle: { textAlign: 'center' } });
    },
    [toast],
  );

  const _onOpenSendFund = useCallback(() => {
    if (currentAccount && currentAccount.isReadOnly) {
      //todo: i18n
      showNoti('The account you are using is read-only, you cannot send assets with it');
      return;
    }

    navigation.navigate('SendFund', { slug: tokenGroupSlug });
  }, [currentAccount, navigation, showNoti, tokenGroupSlug]);

  const listHeaderNode = useMemo(() => {
    return (
      <TokenGroupsDetailUpperBlock
        onOpenReceive={_onOpenReceive}
        onOpenBuyTokens={onPressBuyToken}
        onOpenSendFund={_onOpenSendFund}
        balanceValue={tokenBalanceValue}
        onClickBack={onClickBack}
        groupSymbol={groupSymbol}
      />
    );
  }, [_onOpenReceive, onPressBuyToken, _onOpenSendFund, tokenBalanceValue, onClickBack, groupSymbol]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => (
      <View key={item.slug} style={[itemWrapperStyle, { backgroundColor: theme.colorBgSecondary }]}>
        <TokenBalanceItem onPress={onClickItem(item)} {...item} isShowBalance={isShowBalance} />
      </View>
    ),
    [isShowBalance, onClickItem, theme.colorBgSecondary],
  );

  const onCloseTokenDetailModal = useCallback(() => {
    setTokenDetailVisible(false);
    setCurrentTokenInfo(undefined);
  }, []);

  return (
    <ScreenContainer gradientBackground={GradientBackgroundColorSet[2]}>
      <>
        <Header />

        <TokensLayout
          style={{ marginTop: 50 }}
          items={tokenBalanceItems}
          layoutHeader={listHeaderNode}
          renderItem={renderItem}
        />

        <TokenDetailModal
          currentTokenInfo={currentTokenInfo}
          tokenBalanceMap={tokenBalanceMap}
          modalVisible={tokenDetailVisible}
          onChangeModalVisible={onCloseTokenDetailModal}
        />

        {accessBy && (
          <AccountSelector
            modalVisible={accessBy !== 'buy' ? isAccountSelectorModalVisible : isBuyAccountSelectorModalVisible}
            onCancel={accessBy !== 'buy' ? onCloseSelectAccount : onCloseSelectBuyAccount}
            items={accessBy !== 'buy' ? accountSelectorItems : buyAccountSelectorItems}
            onSelectItem={accessBy !== 'buy' ? openSelectAccount : openSelectBuyAccount}
          />
        )}

        {accessBy && (
          <TokenSelector
            modalVisible={accessBy !== 'buy' ? isTokenSelectorModalVisible : isBuyTokenSelectorModalVisible}
            items={accessBy !== 'buy' ? tokenSelectorItems : buyTokenSelectorItems}
            onSelectItem={accessBy !== 'buy' ? openSelectToken : openSelectBuyToken}
            onCancel={accessBy !== 'buy' ? onCloseSelectToken : onCloseSelectBuyToken}
          />
        )}

        {selectedBuyAccount && selectedBuyToken && (
          <ServiceModal
            modalVisible={isBuyServiceSelectorModalVisible}
            onChangeModalVisible={onCloseSelectBuyService}
            onPressBack={onCloseSelectBuyService}
            token={selectedBuyToken}
            address={selectedBuyAccount}
          />
        )}

        <ReceiveModal
          modalVisible={isQrModalVisible}
          address={selectedAccount}
          selectedNetwork={selectedNetwork}
          onCancel={onCloseQrModal}
        />
      </>
    </ScreenContainer>
  );
};
