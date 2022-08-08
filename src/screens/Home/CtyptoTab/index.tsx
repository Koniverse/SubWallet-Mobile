import React, { createRef, useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { AccountInfoByNetwork, TokenBalanceItemType, TokenItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../types';
import { TokenSelect } from 'screens/TokenSelect';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { BackHandler } from 'react-native';
import useTokenBalanceKeyPriceMap from 'hooks/screen/useTokenBalanceKeyPriceMap';
import useAccountInfoByNetworkMap from 'hooks/screen/Home/CtyptoTab/useAccountInfoByNetworkMap';
import Header from 'screens/Home/CtyptoTab/Header';
import useViewStep from 'hooks/screen/useViewStep';
import { ViewStep } from 'screens/Home/CtyptoTab/constant';
import { ScreenContainer } from 'components/ScreenContainer';
import TabsContainer from 'screens/Home/CtyptoTab/TabsContainer';

interface SelectionInfo {
  selectedNetworkInfo?: AccountInfoByNetwork;
  selectedTokenDisplayName: string;
  selectedTokenSymbol: string;
}

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    accounts: { accounts, currentAccountAddress },
    networkMap,
  } = useSelector((state: RootState) => state);
  const { currentView, toNextView, toBack } = useViewStep(ViewStep.TOKEN_GROUPS);
  const showedNetworks = useShowedNetworks('all', currentAccountAddress, accounts);
  const tokenGroupMap = useTokenGroup(showedNetworks);
  const tokenBalanceKeyPriceMap = useTokenBalanceKeyPriceMap(tokenGroupMap);
  const { networkBalanceMap, totalBalanceValue, tokenBalanceMap } = useAccountBalance(
    showedNetworks,
    tokenBalanceKeyPriceMap,
  );
  const [tokenSelectModal, setTokenSelectModal] = useState<boolean>(false);
  const [{ selectedNetworkInfo, selectedTokenDisplayName, selectedTokenSymbol }, setSelectionInfo] =
    useState<SelectionInfo>({
      selectedTokenDisplayName: '',
      selectedTokenSymbol: '',
    });
  const accountInfoByNetworkMap: Record<string, AccountInfoByNetwork> = useAccountInfoByNetworkMap(
    currentAccountAddress,
    showedNetworks,
    networkMap,
  );
  const [currentTgKey, setCurrentTgKey] = useState<string>('');
  const tabsContainerRef = createRef();

  // prevent Back Press event on Android for this screen
  useEffect(() => {
    const handleBackButton = () => {
      return true;
    };

    const unsubscribeFocusScreen = navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    });

    const unsubscribeBlurScreen = navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    });

    return () => {
      unsubscribeFocusScreen();
      unsubscribeBlurScreen();
    };
  }, [navigation]);

  const jumToTab = (tabId: string) => {
    if (tabsContainerRef.current) {
      // @ts-ignore
      tabsContainerRef.current.jumpToTab(tabId);
    }
  };

  const onPressBack = () => {
    if (currentView === ViewStep.CHAIN_DETAIL) {
      jumToTab('two');
    }

    toBack();
  };

  const onPressChainItem = (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
    setSelectionInfo(prevState => ({
      ...prevState,
      selectedNetworkInfo: info,
      selectBalanceInfo: balanceInfo,
    }));
    jumToTab('one');
    toNextView(ViewStep.CHAIN_DETAIL);
  };

  const deps = selectedNetworkInfo?.networkKey;

  const handleChangeTokenItem = useCallback(
    (tokenSymbol: string, tokenDisplayName: string, info?: AccountInfoByNetwork) => {
      if (!info) {
        setSelectionInfo(prev => ({
          ...prev,
          selectedTokenDisplayName: tokenDisplayName,
          selectedTokenSymbol: tokenSymbol,
        }));
      } else {
        setSelectionInfo(prev => ({
          ...prev,
          selectedNetworkInfo: info,
          selectedTokenDisplayName: tokenDisplayName,
          selectedTokenSymbol: tokenSymbol,
        }));
      }

      toNextView(ViewStep.TOKEN_HISTORY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deps, toNextView],
  );

  const onPressSearchButton = () => {
    setTokenSelectModal(true);
  };

  const onChangeTokenSelectModalItem = ({ symbol, displayedSymbol, networkKey }: TokenItemType) => {
    const _selectedNetworkInfo = accountInfoByNetworkMap[networkKey];
    handleChangeTokenItem(symbol, displayedSymbol, _selectedNetworkInfo);
    setTokenSelectModal(false);
  };

  const onPressTokenBalanceItem = (item: TokenBalanceItemType, info?: AccountInfoByNetwork) => {
    if (currentView === ViewStep.TOKEN_GROUPS) {
      setCurrentTgKey(item.id);
      toNextView(ViewStep.TOKEN_GROUP_DETAIL);
    } else if (currentView === ViewStep.TOKEN_GROUP_DETAIL) {
      handleChangeTokenItem(item.symbol, item.displayedSymbol, info);
    } else if (currentView === ViewStep.CHAIN_DETAIL) {
      handleChangeTokenItem(item.symbol, item.displayedSymbol);
    }
  };

  return (
    <ScreenContainer>
      <>
        <Header
          currentView={currentView}
          navigation={navigation}
          onPressBack={onPressBack}
          currentTgKey={currentTgKey}
          selectedNetworkInfo={selectedNetworkInfo}
          selectedTokenDisplayName={selectedTokenDisplayName}
          onPressSearchButton={onPressSearchButton}
        />

        <TabsContainer
          ref={tabsContainerRef}
          currentView={currentView}
          currentTgKey={currentTgKey}
          totalBalanceValue={totalBalanceValue}
          tokenGroupMap={tokenGroupMap}
          tokenBalanceMap={tokenBalanceMap}
          networkBalanceMap={networkBalanceMap}
          selectedNetworkInfo={selectedNetworkInfo}
          selectedTokenSymbol={selectedTokenSymbol}
          selectedTokenDisplayName={selectedTokenDisplayName}
          showedNetworks={showedNetworks}
          accountInfoByNetworkMap={accountInfoByNetworkMap}
          tokenBalanceKeyPriceMap={tokenBalanceKeyPriceMap}
          onPressChainItem={onPressChainItem}
          onPressTokenBalanceItem={onPressTokenBalanceItem}
        />

        <TokenSelect
          address={currentAccountAddress}
          selectedNetworkKey={'all'}
          modalVisible={tokenSelectModal}
          onChangeToken={onChangeTokenSelectModalItem}
          onChangeModalVisible={() => setTokenSelectModal(false)}
          onPressBack={() => {
            setTokenSelectModal(false);
          }}
        />
      </>
    </ScreenContainer>
  );
};
