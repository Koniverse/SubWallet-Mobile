import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNetworkMetadata from 'hooks/screen/useGetNetworkMetadata';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { ChainListScreen } from 'screens/Home/CtyptoTab/ChainList/ChainListScreen';
import { ChainDetailScreen } from 'screens/Home/CtyptoTab/ChainDetail/ChainDetailScreen';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { AccountActionType, AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../types';
import { TokenHistoryScreen } from 'screens/Home/CtyptoTab/TokenHistoryScreen';
import BigN from 'bignumber.js';
import { BN_ZERO } from 'utils/chainBalances';
import { NetWorkMetadataDef, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import reformatAddress, { getGenesisOptionsByAddressType } from 'utils/index';
import { Alert, StyleProp, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { ColorMap } from 'styles/color';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { getTotalConvertedBalanceValue } from './utils';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { Article, FirstAidKit, Shuffle } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { NetworkSelect } from 'screens/NetworkSelect';
import useGenesisHashOptions, { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { TokenSelect } from 'screens/TokenSelect';

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: ColorMap.dark2,
  paddingTop: 21,
};

const actionButtonContainerStyle: StyleProp<any> = {
  paddingTop: 25,
};

const ViewStep = {
  CHAIN_LIST: 1,
  NETWORK_DETAIL: 2,
  TOKEN_HISTORY: 3,
};

type SelectedResultType = {
  selectedNetworkKey?: string;
  selectedToken?: string;
};

interface NetworkInfo {
  selectedNetworkInfo: AccountInfoByNetwork | undefined;
  selectBalanceInfo: BalanceInfo | undefined;
  selectedTokenName: string;
  networkBalanceValue: BigN;
  tokenBalanceValue: BigN;
  tokenConvertedValue: BigN;
  selectedTokenSymbol: string;
}

type ModalActionType<T> = {
  onChange?: (item: T) => void;
  onBack?: () => void;
};

function getAccountInfoByNetwork(
  address: string,
  networkKey: string,
  networkMetadata: NetWorkMetadataDef,
): AccountInfoByNetwork {
  return {
    address,
    key: networkKey,
    networkKey,
    networkDisplayName: networkMetadata.chain,
    networkPrefix: networkMetadata.ss58Format,
    networkLogo: networkKey,
    networkIconTheme: networkMetadata.isEthereum ? 'ethereum' : networkMetadata.icon || 'polkadot',
    formattedAddress: reformatAddress(address, networkMetadata.ss58Format),
  };
}

function getAccountInfoByNetworkMap(
  address: string,
  networkKeys: string[],
  networkMetadataMap: Record<string, NetWorkMetadataDef>,
): Record<string, AccountInfoByNetwork> {
  const result: Record<string, AccountInfoByNetwork> = {};

  networkKeys.forEach(n => {
    if (networkMetadataMap[n]) {
      result[n] = getAccountInfoByNetwork(address, n, networkMetadataMap[n]);
    }
  });

  return result;
}

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    accounts: { accounts, currentAccountAddress },
    settings: { isShowBalance },
    currentNetwork,
  } = useSelector((state: RootState) => state);
  const [[, currentViewStep], setViewStep] = useState<[number, number]>([ViewStep.CHAIN_LIST, ViewStep.CHAIN_LIST]);
  const networkMetadataMap = useGetNetworkMetadata();
  const showedNetworks = useShowedNetworks(currentNetwork.networkKey, currentAccountAddress, accounts);
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const [sendFundTypeModal, setSendFundTypeModal] = useState<boolean>(false);
  const [selectNetworkModal, setSelectNetworkModal] = useState<boolean>(false);
  const [selectTokenModal, setSelectTokenModal] = useState<boolean>(false);
  const { networkBalanceMaps, totalBalanceValue } = useAccountBalance(currentNetwork.networkKey, showedNetworks);
  const [{ selectedNetworkKey, selectedToken }, setSelectedResult] = useState<SelectedResultType>({});
  const [
    {
      selectedNetworkInfo,
      selectBalanceInfo,
      selectedTokenName,
      networkBalanceValue,
      tokenBalanceValue,
      tokenConvertedValue,
      selectedTokenSymbol,
    },
    setSelectNetwork,
  ] = useState<NetworkInfo>({
    selectedNetworkInfo: undefined,
    selectBalanceInfo: undefined,
    selectedTokenName: '',
    networkBalanceValue: BN_ZERO,
    tokenBalanceValue: BN_ZERO,
    tokenConvertedValue: BN_ZERO,
    selectedTokenSymbol: '',
  });
  const deps = selectedNetworkInfo?.networkKey;
  const genesisOptions = getGenesisOptionsByAddressType(currentAccountAddress, accounts, useGenesisHashOptions());
  const [{ onChange: onChangeNetworkSelect, onBack: onBackNetworkSelect }, setNetworkSelectAction] = useState<
    ModalActionType<NetworkSelectOption>
  >({});
  const [{ onChange: onChangeTokenSelect, onBack: onBackTokenSelect }, setTokenSelectAction] = useState<
    ModalActionType<TokenInfo>
  >({});

  const SEND_FUND_TYPE: AccountActionType[] = [
    {
      icon: Article,
      title: i18n.common.singleChain,
      onCLickButton: () => {
        setSendFundTypeModal(false);
        setNetworkSelectAction({
          onChange: item => {
            setSelectNetworkModal(false);
            setSelectedResult({ selectedNetworkKey: item.networkKey });
            setTokenSelectAction({
              onChange: item1 => {
                setSelectedResult(prev => {
                  const result = {
                    ...prev,
                    selectedToken: item1.symbol,
                  };

                  Alert.alert(
                    'Send Fund',
                    `selectedNetworkKey is ${result.selectedNetworkKey}, selectedToken is ${result.selectedToken}`,
                  );

                  return {};
                });

                setSelectTokenModal(false);
              },
              onBack: () => {
                setSelectedResult(prev => ({
                  selectedNetworkKey: prev.selectedNetworkKey,
                }));
                setSelectTokenModal(false);
                setTimeout(() => {
                  setSelectNetworkModal(true);
                }, 300);
              },
            });
            setTimeout(() => {
              setSelectTokenModal(true);
            }, 300);
          },
          onBack: () => {
            setSelectNetworkModal(false);
            setSelectedResult({});
            setTimeout(() => {
              setSendFundTypeModal(true);
            }, 300);
          },
        });
        setTimeout(() => {
          setSelectNetworkModal(true);
        }, 300);
      },
    },
    {
      icon: Shuffle,
      title: i18n.common.crossChain,
      onCLickButton: () => {},
    },
    {
      icon: FirstAidKit,
      title: i18n.common.charityDonate,
      onCLickButton: () => {},
    },
  ];

  const accountInfoByNetworkMap: Record<string, AccountInfoByNetwork> = getAccountInfoByNetworkMap(
    currentAccountAddress,
    showedNetworks,
    networkMetadataMap,
  );

  const onPressChainItem = (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => {
    setSelectNetwork(prevState => ({
      ...prevState,
      networkBalanceValue: getTotalConvertedBalanceValue(balanceInfo),
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

  const onChangeNetwork = (item: NetworkSelectOption) => {
    setSelectedResult(prevState => ({
      ...prevState,
      selectedSendNetwork: item.networkKey,
    }));
    setSelectNetworkModal(false);
    // setTimeout(() => {
    //   setSelectTokenModal(true);
    // }, 400);
  };

  const onChangeToken = (item: TokenInfo) => {
    // setSendFundInfo(prevState => ({
    //   ...prevState,
    //   selectedSendToken: item.tokenBalanceSymbol,
    // }));
  };

  const onPressTokenItem = useCallback(
    (
      tokenName: string,
      balanceValue: BigN,
      convertedValue: BigN,
      tokenSymbol: string,
      info?: AccountInfoByNetwork,
      balanceInfo?: BalanceInfo,
    ) => {
      if (!info || !balanceInfo) {
        setSelectNetwork(prev => ({
          ...prev,
          selectedTokenName: tokenName,
          tokenBalanceValue: balanceValue,
          tokenConvertedValue: convertedValue,
          selectedTokenSymbol: tokenSymbol,
        }));
      } else {
        setSelectNetwork(prev => ({
          ...prev,
          selectedNetworkInfo: info,
          selectBalanceInfo: balanceInfo,
          selectedTokenName: tokenName,
          tokenBalanceValue: balanceValue,
          tokenConvertedValue: convertedValue,
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

  const onPressSendFundBtn = () => {
    setSendFundTypeModal(true);
  };

  const onPressNetworkSelectBack = () => {
    setSelectNetworkModal(false);
    setSelectedResult(prevState => ({
      ...prevState,
      selectedSendNetwork: null,
    }));
    // setTimeout(() => {
    //   setSendFundTypeModal(true);
    // }, 400);
  };

  const onPressTokenSelectBack = () => {
    setSelectTokenModal(false);
    setSelectedResult(prevState => ({
      ...prevState,
      selectedSendToken: null,
    }));
    // setTimeout(() => {
    //   setSelectNetworkModal(true);
    // }, 400);
  };

  const onPressReceiveButton = () => {
    // Alert.alert('title', '123123123123');
    // setReceiveModalVisible(true)
    if (currentNetwork.networkKey === 'all') {
      setNetworkSelectAction({
        onChange: item => {
          setSelectNetworkModal(false);
          Alert.alert('Receiver', `Network Key is ${item.networkKey}, Newwork Prefix is ${item.networkPrefix}`);
        },
        onBack: () => {
          setNetworkSelectAction({});
          setSelectNetworkModal(false);
        },
      });
      setSelectNetworkModal(true);
    } else {
      Alert.alert(
        'Receiver',
        `Network Key is ${currentNetwork.networkKey}, Newwork Prefix is ${currentNetwork.networkPrefix}`,
      );
    }
  };

  const renderBalanceContainerComponent = (
    balanceValue: BigN,
    accountButtonContainerStyle?: StyleProp<any>,
    amountToUsd?: BigN,
    isShowBalanceToUsd = false,
    startWithSymbol = true,
    symbol = '$',
  ) => {
    return () => (
      <View style={balanceContainer}>
        <BalancesVisibility value={balanceValue} symbol={symbol} startWithSymbol={startWithSymbol} />

        {isShowBalanceToUsd && amountToUsd && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={isShowBalance} />}

        <ActionButtonContainer
          onPressSendFundBtn={onPressSendFundBtn}
          openReceiveModal={onPressReceiveButton}
          style={accountButtonContainerStyle}
        />
      </View>
    );
  };

  return (
    <>
      {currentViewStep === ViewStep.CHAIN_LIST && (
        <ChainListScreen
          accountInfoByNetworkMap={accountInfoByNetworkMap}
          onPressChainItem={onPressChainItem}
          navigation={navigation}
          networkBalanceMaps={networkBalanceMaps}
          showedNetworks={showedNetworks}
          onPressTokenItem={onPressTokenItem}
          balanceBlockComponent={renderBalanceContainerComponent(totalBalanceValue)}
        />
      )}

      {currentViewStep === ViewStep.NETWORK_DETAIL && selectedNetworkInfo && selectBalanceInfo && (
        <ChainDetailScreen
          onPressBack={onPressBack}
          selectedNetworkInfo={selectedNetworkInfo}
          selectedBalanceInfo={selectBalanceInfo}
          onPressTokenItem={onPressTokenItem}
          balanceBlockComponent={renderBalanceContainerComponent(networkBalanceValue)}
        />
      )}

      {currentViewStep === ViewStep.TOKEN_HISTORY && selectedNetworkInfo && (
        <TokenHistoryScreen
          balanceBlockComponent={renderBalanceContainerComponent(
            tokenBalanceValue,
            actionButtonContainerStyle,
            tokenConvertedValue,
            true,
            false,
            selectedTokenSymbol,
          )}
          onPressBack={onPressBack}
          selectedTokenName={selectedTokenName}
          selectedNetworkInfo={selectedNetworkInfo}
        />
      )}

      <SelectImportAccountModal
        onModalHide={() => {}}
        secretTypeList={SEND_FUND_TYPE}
        modalVisible={sendFundTypeModal}
        onChangeModalVisible={() => setSendFundTypeModal(false)}
        modalHeight={256}
      />

      <NetworkSelect
        modalVisible={selectNetworkModal}
        onChangeModalVisible={() => setSelectNetworkModal(false)}
        genesisOptions={genesisOptions}
        onPressBack={onBackNetworkSelect}
        onChangeNetwork={onChangeNetworkSelect}
        selectedNetwork={selectedNetworkKey || ''}
      />

      <TokenSelect
        modalVisible={selectTokenModal}
        onChangeModalVisible={() => setSelectTokenModal(false)}
        onPressBack={onBackTokenSelect}
        onChangeToken={onChangeTokenSelect}
        selectedNetwork={selectedNetworkKey || ''}
        selectedToken={selectedToken || ''}
      />

      <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => setReceiveModalVisible(false)} />
    </>
  );
};
