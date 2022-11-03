import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { AccountInfoByNetwork, TokenItemType } from 'types/ui-types';
import { BalanceInfo } from 'types/index';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { StyleProp, View } from 'react-native';
import useTokenBalanceKeyPriceMap from 'hooks/screen/useTokenBalanceKeyPriceMap';
import useAccountInfoByNetworkMap from 'hooks/screen/Home/Crypto/useAccountInfoByNetworkMap';
import useViewStep from 'hooks/screen/useViewStep';
import { ViewStep } from 'screens/Home/Crypto/constant';
import TokenGroupLayer from 'screens/Home/Crypto/layers/TokenGroup';
import { TokenSelect } from 'screens/TokenSelect';
import ChainDetailLayer from 'screens/Home/Crypto/layers/ChainDetail';
import TokenHistoryLayer from 'screens/Home/Crypto/layers/TokenHistory';
import { getAccountType } from 'utils/index';
import { ColorMap } from 'styles/color';

interface SelectionInfo {
  selectedNetworkInfo?: AccountInfoByNetwork;
  selectedTokenDisplayName: string;
  selectedTokenSymbol: string;
}

const viewContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
  backgroundColor: ColorMap.dark2,
};

const viewLayerStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
};

export const CryptoScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { accounts, currentAccountAddress } = useSelector((state: RootState) => state.accounts);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
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

  const onPressBack = useCallback(() => {
    toBack();
  }, [toBack]);

  const onPressChainItem = useCallback(
    (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
      setSelectionInfo(prevState => ({
        ...prevState,
        selectedNetworkInfo: info,
        selectBalanceInfo: balanceInfo,
      }));
      toNextView(ViewStep.CHAIN_DETAIL);
    },
    [toNextView],
  );

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

  const onPressSearchButton = useCallback(() => {
    setTokenSelectModal(true);
  }, []);

  const onChangeTokenSelectModalItem = useCallback(
    ({ symbol, displayedSymbol, networkKey }: TokenItemType) => {
      const _selectedNetworkInfo = accountInfoByNetworkMap[networkKey];
      handleChangeTokenItem(symbol, displayedSymbol, _selectedNetworkInfo);
      setTokenSelectModal(false);
    },
    [accountInfoByNetworkMap, handleChangeTokenItem],
  );

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
            tokenGroupMap={tokenGroupMap}
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
