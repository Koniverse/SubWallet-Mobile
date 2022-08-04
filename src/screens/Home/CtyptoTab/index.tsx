import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { ChainListScreen } from 'screens/Home/CtyptoTab/ChainList/ChainListScreen';
import { ChainDetailScreen } from 'screens/Home/CtyptoTab/ChainDetail/ChainDetailScreen';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { AccountInfoByNetwork, TokenItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../types';
import { TokenHistoryScreen } from 'screens/Home/CtyptoTab/TokenHistoryScreen';
import { TokenSelect } from 'screens/TokenSelect';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { BackHandler } from 'react-native';
import useTokenBalanceKeyPriceMap from 'hooks/screen/useTokenBalanceKeyPriceMap';
import useAccountInfoByNetworkMap from 'hooks/screen/Home/CtyptoTab/useAccountInfoByNetworkMap';

const ViewStep = {
  CHAIN_LIST: 1,
  NETWORK_DETAIL: 2,
  TOKEN_HISTORY: 3,
};

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
  const [[, currentViewStep], setViewStep] = useState<[number, number]>([ViewStep.CHAIN_LIST, ViewStep.CHAIN_LIST]);
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

  const handleBackButton = () => {
    return true;
  };

  // prevent Back Press event on Android for this screen
  useEffect(() => {
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

  const onPressChainItem = (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
    setSelectionInfo(prevState => ({
      ...prevState,
      selectedNetworkInfo: info,
      selectBalanceInfo: balanceInfo,
    }));
    setViewStep([ViewStep.CHAIN_LIST, ViewStep.NETWORK_DETAIL]);
  };

  const onPressBack = () => {
    setViewStep(([prevPrevStep, prevCurrentStep]) => {
      if (prevPrevStep === ViewStep.NETWORK_DETAIL) {
        return [ViewStep.CHAIN_LIST, ViewStep.NETWORK_DETAIL];
      }

      return [prevCurrentStep, prevPrevStep];
    });
  };

  const deps = selectedNetworkInfo?.networkKey;

  const onPressTokenItem = useCallback(
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

      setViewStep(([, prvCurrentStep]) => {
        return [prvCurrentStep, ViewStep.TOKEN_HISTORY];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deps],
  );

  const onChangeTokenSelectModalItem = ({ symbol, displayedSymbol, networkKey }: TokenItemType) => {
    const _selectedNetworkInfo = accountInfoByNetworkMap[networkKey];
    onPressTokenItem(symbol, displayedSymbol, _selectedNetworkInfo);
    setTokenSelectModal(false);
  };

  return (
    <>
      {currentViewStep === ViewStep.CHAIN_LIST && (
        <ChainListScreen
          onPressSearchButton={() => setTokenSelectModal(true)}
          accountInfoByNetworkMap={accountInfoByNetworkMap}
          onPressChainItem={onPressChainItem}
          navigation={navigation}
          networkBalanceMap={networkBalanceMap}
          showedNetworks={showedNetworks}
          onPressTokenItem={onPressTokenItem}
          totalBalanceValue={totalBalanceValue}
          tokenBalanceMap={tokenBalanceMap}
          tokenGroupMap={tokenGroupMap}
          tokenBalanceKeyPriceMap={tokenBalanceKeyPriceMap}
        />
      )}

      {currentViewStep === ViewStep.NETWORK_DETAIL && selectedNetworkInfo && (
        <ChainDetailScreen
          onPressBack={onPressBack}
          networkBalanceMap={networkBalanceMap}
          selectedNetworkInfo={selectedNetworkInfo}
          onPressTokenItem={onPressTokenItem}
          tokenBalanceKeyPriceMap={tokenBalanceKeyPriceMap}
        />
      )}

      {currentViewStep === ViewStep.TOKEN_HISTORY && selectedNetworkInfo && (
        <TokenHistoryScreen
          onPressBack={onPressBack}
          networkBalanceMap={networkBalanceMap}
          selectedTokenDisplayName={selectedTokenDisplayName}
          selectedTokenSymbol={selectedTokenSymbol}
          selectedNetworkInfo={selectedNetworkInfo}
        />
      )}

      <TokenSelect
        selectedNetworkKey={'all'}
        modalVisible={tokenSelectModal}
        onChangeToken={onChangeTokenSelectModalItem}
        onChangeModalVisible={() => setTokenSelectModal(false)}
        onPressBack={() => {
          setTokenSelectModal(false);
        }}
      />
    </>
  );
};
