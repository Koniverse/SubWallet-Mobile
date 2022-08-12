import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { AccountInfoByNetwork, TokenItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../types';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { BackHandler, StyleProp, View } from 'react-native';
import useTokenBalanceKeyPriceMap from 'hooks/screen/useTokenBalanceKeyPriceMap';
import useAccountInfoByNetworkMap from 'hooks/screen/Home/CtyptoTab/useAccountInfoByNetworkMap';
import useViewStep from 'hooks/screen/useViewStep';
import { ViewStep } from 'screens/Home/CtyptoTab/constant';
import TokenGroupLayer from 'screens/Home/CtyptoTab/layers/TokenGroup';
import { TokenSelect } from 'screens/TokenSelect';
import ChainDetailLayer from 'screens/Home/CtyptoTab/layers/ChainDetail';
import TokenHistoryLayer from 'screens/Home/CtyptoTab/layers/TokenHistory';
import { getAccountType } from 'utils/index';

interface SelectionInfo {
  selectedNetworkInfo?: AccountInfoByNetwork;
  selectedTokenDisplayName: string;
  selectedTokenSymbol: string;
}

const viewContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
};

const viewLayerStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
};

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    accounts: { accounts, currentAccountAddress },
    networkMap,
  } = useSelector((state: RootState) => state);
  const accountType = getAccountType(currentAccountAddress);
  const { currentView, views: viewsLog, toNextView, toBack } = useViewStep(ViewStep.TOKEN_GROUP);
  const showedNetworks = useShowedNetworks(currentAccountAddress, accounts);
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

  const onPressBack = () => {
    toBack();
  };

  const onPressChainItem = (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
    setSelectionInfo(prevState => ({
      ...prevState,
      selectedNetworkInfo: info,
      selectBalanceInfo: balanceInfo,
    }));
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

  return (
    <View style={viewContainerStyle}>
      <TokenGroupLayer
        navigation={navigation}
        accountInfoByNetworkMap={accountInfoByNetworkMap}
        onPressChainItem={onPressChainItem}
        tokenGroupMap={tokenGroupMap}
        tokenBalanceKeyPriceMap={tokenBalanceKeyPriceMap}
        tokenBalanceMap={tokenBalanceMap}
        showedNetworks={showedNetworks}
        networkBalanceMap={networkBalanceMap}
        onPressSearchButton={onPressSearchButton}
        handleChangeTokenItem={handleChangeTokenItem}
        totalBalanceValue={totalBalanceValue}
        accountType={accountType}
      />

      {viewsLog.includes(ViewStep.CHAIN_DETAIL) && selectedNetworkInfo && (
        <View style={viewLayerStyle}>
          <ChainDetailLayer
            handleChangeTokenItem={handleChangeTokenItem}
            tokenBalanceKeyPriceMap={tokenBalanceKeyPriceMap}
            networkBalanceMap={networkBalanceMap}
            selectedNetworkInfo={selectedNetworkInfo}
            accountType={accountType}
            onPressBack={onPressBack}
          />
        </View>
      )}

      {currentView === ViewStep.TOKEN_HISTORY && selectedNetworkInfo && (
        <View style={viewLayerStyle}>
          <TokenHistoryLayer
            onPressBack={onPressBack}
            selectedNetworkInfo={selectedNetworkInfo}
            selectedTokenDisplayName={selectedTokenDisplayName}
            selectedTokenSymbol={selectedTokenSymbol}
            tokenBalanceMap={tokenBalanceMap}
          />
        </View>
      )}

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
    </View>
  );
};
