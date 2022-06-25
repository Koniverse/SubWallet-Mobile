import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNetworkMetadata from 'hooks/screen/useGetNetworkMetadata';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { ChainListScreen } from 'screens/Home/CtyptoTab/ChainList/ChainListScreen';
import { ChainDetailScreen } from 'screens/Home/CtyptoTab/ChainDetail/ChainDetailScreen';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../types';
import { TokenHistoryScreen } from 'screens/Home/CtyptoTab/TokenHistoryScreen';
import BigN from 'bignumber.js';
import { BN_ZERO } from 'utils/chainBalances';

const ViewStep = {
  CHAIN_LIST: 1,
  NETWORK_DETAIL: 2,
  TOKEN_HISTORY: 3,
};

interface NetworkInfo {
  selectedNetworkInfo: AccountInfoByNetwork | undefined;
  selectBalanceInfo: BalanceInfo | undefined;
  selectedTokenName: string;
  tokenBalanceValue: BigN;
  tokenConvertedValue: BigN;
  selectedTokenSymbol: string;
}

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    accounts: { accounts, currentAccountAddress },
    currentNetwork,
  } = useSelector((state: RootState) => state);
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.CHAIN_LIST);
  const networkMetadataMap = useGetNetworkMetadata();
  const showedNetworks = useShowedNetworks(currentNetwork.networkKey, currentAccountAddress, accounts);
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const { networkBalanceMaps, totalBalanceValue } = useAccountBalance(currentNetwork.networkKey, showedNetworks);
  const [
    {
      selectedNetworkInfo,
      selectBalanceInfo,
      selectedTokenName,
      tokenBalanceValue,
      tokenConvertedValue,
      selectedTokenSymbol,
    },
    setSelectNetwork,
  ] = useState<NetworkInfo>({
    selectedNetworkInfo: undefined,
    selectBalanceInfo: undefined,
    selectedTokenName: '',
    tokenBalanceValue: BN_ZERO,
    tokenConvertedValue: BN_ZERO,
    selectedTokenSymbol: '',
  });

  const onPressChainItem = (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
    setSelectNetwork(prevState => ({
      ...prevState,
      selectedNetworkInfo: info,
      selectBalanceInfo: balanceInfo,
    }));
    setCurrentViewStep(ViewStep.NETWORK_DETAIL);
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.NETWORK_DETAIL) {
      setCurrentViewStep(ViewStep.CHAIN_LIST);
    } else if (currentViewStep === ViewStep.TOKEN_HISTORY) {
      setCurrentViewStep(ViewStep.NETWORK_DETAIL);
    }
  };

  const onPressTokenItem = (tokenName: string, balanceValue: BigN, convertedValue: BigN, tokenSymbol: string) => {
    setSelectNetwork(prev => ({
      ...prev,
      selectedTokenName: tokenName,
      tokenBalanceValue: balanceValue,
      tokenConvertedValue: convertedValue,
      selectedTokenSymbol: tokenSymbol,
    }));
    setCurrentViewStep(ViewStep.TOKEN_HISTORY);
  };

  const onPressSendFundBtn = () => {
    navigation.navigate('SendFund');
  };

  return (
    <>
      {currentViewStep === ViewStep.CHAIN_LIST && (
        <ChainListScreen
          onPressChainItem={onPressChainItem}
          onPressSendFundBtn={onPressSendFundBtn}
          currentAccountAddress={currentAccountAddress}
          navigation={navigation}
          onShoHideReceiveModal={setReceiveModalVisible}
          receiveModalVisible={receiveModalVisible}
          networkBalanceMaps={networkBalanceMaps}
          networkMetadataMap={networkMetadataMap}
          showedNetworks={showedNetworks}
          totalValue={totalBalanceValue}
        />
      )}

      {currentViewStep === ViewStep.NETWORK_DETAIL && selectedNetworkInfo && selectBalanceInfo && (
        <ChainDetailScreen
          onPressBack={onPressBack}
          onShoHideReceiveModal={setReceiveModalVisible}
          receiveModalVisible={receiveModalVisible}
          onPressSendFundBtn={onPressSendFundBtn}
          selectedNetworkInfo={selectedNetworkInfo}
          selectedBalanceInfo={selectBalanceInfo}
          onPressTokenItem={onPressTokenItem}
        />
      )}
      {currentViewStep === ViewStep.TOKEN_HISTORY && selectedNetworkInfo && (
        <TokenHistoryScreen
          onPressBack={onPressBack}
          onShoHideReceiveModal={setReceiveModalVisible}
          receiveModalVisible={receiveModalVisible}
          selectedTokenName={selectedTokenName}
          onPressSendFundBtn={onPressSendFundBtn}
          tokenBalanceValue={tokenBalanceValue}
          tokenConvertedValue={tokenConvertedValue}
          tokenHistorySymbol={selectedTokenSymbol}
          selectedNetworkInfo={selectedNetworkInfo}
        />
      )}
    </>
  );
};
