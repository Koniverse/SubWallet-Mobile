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

const ViewStep = {
  CHAIN_LIST: 1,
  NETWORK_DETAIL: 2,
  TOKEN_DETAIL: 3,
};

interface NetworkInfo {
  selectNetworkInfo: AccountInfoByNetwork | undefined;
  selectBalanceInfo: BalanceInfo | undefined;
}

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.CHAIN_LIST);
  const {
    accounts: { accounts, currentAccountAddress },
    currentNetwork,
  } = useSelector((state: RootState) => state);
  const networkMetadataMap = useGetNetworkMetadata();
  const showedNetworks = useShowedNetworks(currentNetwork.networkKey, currentAccountAddress, accounts);
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const { networkBalanceMaps, totalBalanceValue } = useAccountBalance(currentNetwork.networkKey, showedNetworks);
  const [{ selectNetworkInfo, selectBalanceInfo }, setSelectNetwork] = useState<NetworkInfo>({
    selectNetworkInfo: undefined,
    selectBalanceInfo: undefined,
  });

  const onPressChainItem = (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
    setSelectNetwork({ selectNetworkInfo: info, selectBalanceInfo: balanceInfo });
    setCurrentViewStep(ViewStep.NETWORK_DETAIL);
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.NETWORK_DETAIL) {
      setCurrentViewStep(ViewStep.CHAIN_LIST);
    } else if (currentViewStep === ViewStep.TOKEN_DETAIL) {
      setCurrentViewStep(ViewStep.NETWORK_DETAIL);
    }
  };

  return (
    <>
      {currentViewStep === ViewStep.CHAIN_LIST && (
        <ChainListScreen
          onPressChainItem={onPressChainItem}
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

      {currentViewStep === ViewStep.NETWORK_DETAIL && selectNetworkInfo && selectBalanceInfo && (
        <ChainDetailScreen
          onPressBack={onPressBack}
          onShoHideReceiveModal={setReceiveModalVisible}
          receiveModalVisible={receiveModalVisible}
          selectNetworkInfo={selectNetworkInfo}
          selectBalanceInfo={selectBalanceInfo}
        />
      )}
      {currentViewStep === ViewStep.TOKEN_DETAIL && <></>}
    </>
  );
};
