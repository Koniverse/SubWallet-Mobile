import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { NetworkSelect } from 'screens/NetworkSelect';
import { TokenSelect } from 'screens/TokenSelect';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { AccountActionType, SelectionProviderProps } from 'types/ui-types';
import { Article, FirstAidKit, Shuffle } from 'phosphor-react-native';
import useGenesisHashOptions, { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getGenesisOptionsByAddressType } from 'utils/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { HIDE_MODAL_DURATION } from '../../../constant';

interface Props extends SelectionProviderProps {
  style?: object;
}

type ModalActionType<T> = {
  onChange?: (item: T) => void;
  onBack?: () => void;
};

type SelectedResultType = {
  selectedNetworkKey?: string;
  selectedToken?: string;
  selectedNetworkPrefix?: number;
};

const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 36,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  paddingBottom: 25,
};

export const ActionButtonContainer = ({ style, selectionProvider }: Props) => {
  const {
    accounts: { accounts, currentAccountAddress },
    currentNetwork,
  } = useSelector((state: RootState) => state);
  const isAccountAll = currentAccountAddress === 'ALL';
  const navigation = useNavigation<RootNavigationProps>();
  const genesisOptions = getGenesisOptionsByAddressType(currentAccountAddress, accounts, useGenesisHashOptions());
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const [sendFundTypeModal, setSendFundTypeModal] = useState<boolean>(false);
  const [selectNetworkModal, setSelectNetworkModal] = useState<boolean>(false);
  const [selectTokenModal, setSelectTokenModal] = useState<boolean>(false);
  const [{ selectedNetworkKey, selectedToken, selectedNetworkPrefix }, setSelectedResult] =
    useState<SelectedResultType>({});
  const filteredGenesisOptions = genesisOptions.filter(opt => opt.networkKey !== 'all');
  const [{ onChange: onChangeNetworkSelect, onBack: onBackNetworkSelect }, setNetworkSelectAction] = useState<
    ModalActionType<NetworkSelectOption>
  >({});
  const [{ onChange: onChangeTokenSelect, onBack: onBackTokenSelect }, setTokenSelectAction] = useState<
    ModalActionType<TokenInfo>
  >({});

  const actionWithSetTimeout = (action: () => void) => {
    setTimeout(action, HIDE_MODAL_DURATION);
  };

  const onPressSendNetworkSelectBack = () => {
    setSelectNetworkModal(false);
    setSelectedResult({});
    actionWithSetTimeout(() => setSendFundTypeModal(true));
  };

  const onPressReceiveNetworkSelectBack = () => {
    setNetworkSelectAction({});
    setSelectNetworkModal(false);
  };

  const onPressTokenSelectBack = () => {
    setSelectedResult({});
    setSelectTokenModal(false);

    if (currentNetwork.networkKey === 'all') {
      actionWithSetTimeout(() => setSelectNetworkModal(true));
    } else {
      actionWithSetTimeout(() => setSendFundTypeModal(true));
    }
  };

  const onChangeSendNetwork = (item: NetworkSelectOption) => {
    setSelectNetworkModal(false);
    setSelectedResult({ selectedNetworkKey: item.networkKey });
    setTokenSelectAction({
      onChange: item1 => {
        onChangeSendToken(item1, item.networkKey);
      },
      onBack: onPressTokenSelectBack,
    });
    actionWithSetTimeout(() => setSelectTokenModal(true));
  };

  const onChangeSendToken = (item1: TokenInfo, networkKey?: string) => {
    setSelectedResult({});
    setSelectTokenModal(false);
    navigation.navigate('SendFund', {
      selectedNetwork: networkKey || currentNetwork.networkKey,
      selectedToken: item1.symbol,
    });
  };

  const onClickButtonSingleChain = () => {
    setSendFundTypeModal(false);
    if (selectionProvider) {
      const { selectedNetworkKey: _selectedNetworkKey, selectedToken: _selectedToken } = selectionProvider;
      if (_selectedToken) {
        setSelectTokenModal(false);
        navigation.navigate('SendFund', {
          selectedNetwork: _selectedNetworkKey,
          selectedToken: _selectedToken,
        });
      } else {
        setSelectedResult({ selectedNetworkKey: _selectedNetworkKey });
        setTokenSelectAction({
          onChange: item1 => onChangeSendToken(item1, _selectedNetworkKey),
          onBack: onPressTokenSelectBack,
        });
        actionWithSetTimeout(() => setSelectTokenModal(true));
      }
    } else if (currentNetwork.networkKey === 'all') {
      setNetworkSelectAction({
        onChange: item => onChangeSendNetwork(item),
        onBack: onPressSendNetworkSelectBack,
      });
      actionWithSetTimeout(() => setSelectNetworkModal(true));
    } else {
      setSelectedResult({ selectedNetworkKey: currentNetwork.networkKey });
      setTokenSelectAction({
        onChange: item1 => onChangeSendToken(item1),
        onBack: onPressTokenSelectBack,
      });
      actionWithSetTimeout(() => setSelectTokenModal(true));
    }
  };

  const onChangeReceiveNetwork = (networkKey: string, networkPrefix: number) => {
    setSelectedResult({
      selectedNetworkKey: networkKey,
      selectedNetworkPrefix: networkPrefix,
    });
    setSelectNetworkModal(false);
    actionWithSetTimeout(() => setReceiveModalVisible(true));
  };

  const SEND_FUND_TYPE: AccountActionType[] = [
    {
      icon: Article,
      title: i18n.common.singleChain,
      onCLickButton: onClickButtonSingleChain,
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

  const onPressSendFundBtn = () => {
    setSendFundTypeModal(true);
  };

  const onPressReceiveButton = () => {
    if (selectionProvider) {
      const { selectedNetworkKey: _selectedNetworkKey } = selectionProvider;
      setSelectedResult({ selectedNetworkKey: _selectedNetworkKey });
      setReceiveModalVisible(true);
    } else if (currentNetwork.networkKey === 'all') {
      setNetworkSelectAction({
        onChange: item => onChangeReceiveNetwork(item.networkKey, item.networkPrefix),
        onBack: onPressReceiveNetworkSelectBack,
      });
      setSelectNetworkModal(true);
    } else {
      setReceiveModalVisible(true);
    }
  };

  return (
    <>
      <View style={[actionButtonWrapper, style]}>
        <ActionButton
          label={i18n.cryptoTab.receive}
          iconSize={24}
          iconName={'ReceiveIcon'}
          onPress={onPressReceiveButton}
          disabled={isAccountAll}
        />
        <ActionButton
          label={i18n.cryptoTab.send}
          iconSize={24}
          iconName={'SendIcon'}
          onPress={onPressSendFundBtn}
          disabled={isAccountAll}
        />
        <ActionButton label={i18n.cryptoTab.swap} iconSize={24} iconName={'SwapIcon'} disabled={true} />
      </View>

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
        genesisOptions={filteredGenesisOptions}
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

      <ReceiveModal
        networkKey={selectedNetworkKey || currentNetwork.networkKey}
        networkPrefix={selectedNetworkPrefix !== undefined ? selectedNetworkPrefix : currentNetwork.networkPrefix}
        receiveModalVisible={receiveModalVisible}
        onChangeVisible={() => {
          setReceiveModalVisible(false);
          setSelectedResult({});
        }}
        openChangeNetworkModal={() => {
          actionWithSetTimeout(() => setSelectNetworkModal(true));
        }}
      />
    </>
  );
};
