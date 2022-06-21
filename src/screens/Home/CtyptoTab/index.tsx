import React, { useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import ActionButton from 'components/ActionButton';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/TokensTab';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import useGetNetworkMetadata from 'hooks/screen/useGetNetworkMetadata';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { getNetworkLogo } from 'utils/index';
import { SlidersHorizontal } from 'phosphor-react-native';
import { ChainListScreen } from 'screens/Home/CtyptoTab/ChainListScreen';
import useAccountBalance from 'hooks/screen/useAccountBalance';

const ROUTES = [
  { key: 'chains', title: 'Chains' },
  { key: 'tokens', title: 'Tokens' },
];

const cryptoTabContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#222222',
  paddingBottom: 22,
};
const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 36,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
};

interface ActionButtonProps {
  openReceiveModal: () => void;
}

const ViewStep = {
  CHAIN_LIST: 1,
  NETWORK_DETAIL: 2,
  TOKEN_DETAIL: 3,
};

const ActionButtonContainer = ({ openReceiveModal }: ActionButtonProps) => {
  return (
    <View style={actionButtonWrapper}>
      <ActionButton label="Receive" iconSize={24} iconName={'ReceiveIcon'} onPress={openReceiveModal} />
      <ActionButton label="Send" iconSize={24} iconName={'SendIcon'} />
      <ActionButton label="Swap" iconSize={24} iconName={'SwapIcon'} />
    </View>
  );
};

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
  const [selectNetwork, setSelectNetwork] = useState<string>('polkadot');
  const { networkBalanceMaps, totalBalanceValue } = useAccountBalance(currentNetwork.networkKey, showedNetworks);

  const onPressBack = () => {
    if (currentViewStep === ViewStep.NETWORK_DETAIL) {
      setCurrentViewStep(ViewStep.CHAIN_LIST);
    } else if (currentViewStep === ViewStep.TOKEN_DETAIL) {
      setCurrentViewStep(ViewStep.NETWORK_DETAIL);
    }
  };

  const renderHeaderContent = () => {
    return (
      <View>
        {getNetworkLogo('polkadot', 20)}
        <Text>{selectNetwork}</Text>
      </View>
    );
  };

  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'chains':
        return (
          <ChainsTab
            address={currentAccountAddress}
            networkKeys={showedNetworks}
            networkMetadataMap={networkMetadataMap}
          />
        );
      case 'tokens':
        return <TokensTab />;
      default:
        return (
          <ChainsTab
            address={currentAccountAddress}
            networkKeys={showedNetworks}
            networkMetadataMap={networkMetadataMap}
          />
        );
    }
  };

  return (
    <>
      {currentViewStep === ViewStep.CHAIN_LIST && (
        <ChainListScreen
          currentAccountAddress={currentAccountAddress}
          navigation={navigation}
          onShoHideReceiveModal={setReceiveModalVisible}
          receiveModalVisible={receiveModalVisible}
          networkMetadataMap={networkMetadataMap}
          showedNetworks={showedNetworks}
          totalValue={totalBalanceValue}
        />
      )}

      {currentViewStep === ViewStep.NETWORK_DETAIL && (
        <>
          <ContainerWithSubHeader
            onPressBack={onPressBack}
            title={''}
            headerContent={renderHeaderContent}
            showRightBtn
            rightIcon={SlidersHorizontal}
            onPressRightIcon={() => {}}>
            <>
              <View style={cryptoTabContainer}>
                <BalancesVisibility symbol={'$'} value={'1000'} />
              </View>

              <ActionButtonContainer openReceiveModal={() => setReceiveModalVisible(true)} />

              <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

              <ReceiveModal
                receiveModalVisible={receiveModalVisible}
                onChangeVisible={() => setReceiveModalVisible(false)}
              />
            </>
          </ContainerWithSubHeader>
        </>
      )}
      {currentViewStep === ViewStep.TOKEN_DETAIL && <></>}
    </>
  );
};
