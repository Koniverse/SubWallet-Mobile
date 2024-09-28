import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TokenBalanceItemType } from 'types/balance';
import { CryptoNavigationProps } from 'routes/home';
import { TokensLayout } from 'screens/Home/Crypto/shared/TokensLayout';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import { itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokenGroupBalanceItem } from 'components/common/TokenGroupBalanceItem';
import { LeftIconButton } from 'components/LeftIconButton';
import { ClockCounterClockwise, FadersHorizontal, MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { TokenGroupsUpperBlock } from 'screens/Home/Crypto/TokenGroupsUpperBlock';
import { Header } from 'components/Header';
import { GradientBackgroundColorSet, ScreenContainer } from 'components/ScreenContainer';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ReceiveModal } from 'screens/Home/Crypto/ReceiveModal';
import useReceiveQR from 'hooks/screen/Home/Crypto/useReceiveQR';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { CustomizationModal } from 'screens/Home/Crypto/CustomizationModal';
import { useToast } from 'react-native-toast-notifications';
import { TokenSearchModal } from 'screens/Home/Crypto/TokenSearchModal';
import { SelectAccAndTokenModal } from 'screens/Home/Crypto/shared/SelectAccAndTokenModal';
import { tokenItem } from 'constants/itemHeight';
import { sortTokenByValue } from 'utils/sort/token';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';

const renderActionsStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  height: 40,
  marginTop: 6,
  marginBottom: 4,
};

export interface TokenSearchRef {
  onOpenModal: () => void;
  onCloseModal: () => void;
  isModalOpen: boolean;
}

export const TokenGroups = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<CryptoNavigationProps>();
  const tokenSearchRef = useRef<TokenSearchRef>();
  const chainsByAccountType = useGetChainSlugs();
  const { sortedTokenGroups, tokenGroupMap, sortedTokenSlugs } = useTokenGroup(chainsByAccountType);
  const { tokenGroupBalanceMap, totalBalanceInfo, tokenBalanceMap } = useAccountBalance(tokenGroupMap);
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const isTotalBalanceDecrease = totalBalanceInfo.change.status === 'decrease';
  const [isCustomizationModalVisible, setCustomizationModalVisible] = useState<boolean>(false);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const {
    accountSelectorItems,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    selectedAccount,
    selectedNetwork,
    setQrModalVisible,
    isQrModalVisible,
    tokenSelectorItems,
    accountRef,
    tokenRef,
    selectedAccountMap,
  } = useReceiveQR();
  const toast = useToast();
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('token');
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

  const tokenGroupBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    const result: TokenBalanceItemType[] = [];

    sortedTokenGroups.forEach(tokenGroupSlug => {
      if (tokenGroupBalanceMap[tokenGroupSlug]) {
        result.push(tokenGroupBalanceMap[tokenGroupSlug]);
      }
    });

    return result.sort(sortTokenByValue);
  }, [sortedTokenGroups, tokenGroupBalanceMap]);

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
      <View style={renderActionsStyle}>
        <Typography.Title level={4} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
          {i18n.settings.tokens}
        </Typography.Title>
        <View style={{ flexDirection: 'row', marginRight: -5 }}>
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="md" phosphorIcon={MagnifyingGlass} iconColor={theme['gray-5']} weight={'bold'} />}
            onPress={onOpenTokenSearchModal}
          />
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="md" phosphorIcon={FadersHorizontal} iconColor={theme['gray-5']} weight={'bold'} />}
            onPress={onOpenCustomizationModal}
          />
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="md" phosphorIcon={ClockCounterClockwise} iconColor={theme['gray-5']} weight={'bold'} />}
            onPress={onOpenHistoryScreen}
          />
        </View>
      </View>
    );
  }, [onOpenHistoryScreen, onOpenCustomizationModal, onOpenTokenSearchModal, theme]);

  const showNoti = useCallback(
    (text: string) => {
      toast.hideAll();
      toast.show(text, { textStyle: { textAlign: 'center' }, type: 'normal' });
    },
    [toast],
  );

  const _onOpenSendFund = useCallback(() => {
    if (currentAccount && currentAccount.isReadOnly) {
      showNoti(i18n.notificationMessage.watchOnlyNoti);
      return;
    }

    if (currentAccount && currentAccount.isHardware && currentAccount.hardwareType === 'ledger') {
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
  }, [currentAccount, navigation, showNoti]);

  const listHeaderNode = useMemo(() => {
    return (
      <TokenGroupsUpperBlock
        onOpenReceive={onOpenReceive}
        totalChangePercent={totalBalanceInfo.change.percent}
        totalChangeValue={totalBalanceInfo.change.value}
        totalValue={totalBalanceInfo.convertedValue}
        isPriceDecrease={isTotalBalanceDecrease}
        onOpenSendFund={_onOpenSendFund}
      />
    );
  }, [
    onOpenReceive,
    totalBalanceInfo.change.percent,
    totalBalanceInfo.change.value,
    totalBalanceInfo.convertedValue,
    isTotalBalanceDecrease,
    _onOpenSendFund,
  ]);

  const listFooterNode = useMemo(() => {
    return (
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <LeftIconButton
          icon={SlidersHorizontal}
          title={i18n.buttonTitles.manageTokens}
          onPress={() => navigation.navigate('CustomTokenSetting')}
        />
      </View>
    );
  }, [navigation]);

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
        />

        <SelectAccAndTokenModal
          accountRef={accountRef}
          tokenRef={tokenRef}
          accountItems={accountSelectorItems}
          tokenItems={tokenSelectorItems}
          openSelectAccount={openSelectAccount}
          openSelectToken={openSelectToken}
          selectedValueMap={selectedAccountMap}
        />

        <ReceiveModal
          modalVisible={isQrModalVisible}
          address={selectedAccount}
          selectedNetwork={selectedNetwork}
          setModalVisible={setQrModalVisible}
        />

        <TokenSearchModal
          tokenSearchRef={tokenSearchRef}
          onSelectItem={onPressSearchItem}
          isShowBalance={isShowBalance}
          sortedTokenSlugs={sortedTokenSlugs}
          tokenBalanceMap={tokenBalanceMap}
        />

        {isCustomizationModalVisible && (
          <CustomizationModal modalVisible={isCustomizationModalVisible} setVisible={setCustomizationModalVisible} />
        )}
      </>
    </ScreenContainer>
  );
};
