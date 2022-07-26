import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { NetworkSelect } from 'screens/NetworkSelect';
import { TokenSelect } from 'screens/TokenSelect';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { AccountActionType, SelectionProviderProps, TokenItemType } from 'types/ui-types';
import { Article, FirstAidKit, Shuffle } from 'phosphor-react-native';
import useGenesisHashOptions, { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getGenesisOptionsByAddressType } from 'utils/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { HIDE_MODAL_DURATION } from '../../../constant';
import { useToast } from 'react-native-toast-notifications';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';

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
  } = useSelector((state: RootState) => state);
  const toast = useToast();
  const _isAccountAll = isAccountAll(currentAccountAddress);
  const navigation = useNavigation<RootNavigationProps>();
  const genesisOptions = getGenesisOptionsByAddressType(currentAccountAddress, accounts, useGenesisHashOptions());
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const [sendFundTypeModal, setSendFundTypeModal] = useState<boolean>(false);
  const [selectNetworkModal, setSelectNetworkModal] = useState<boolean>(false);
  const [selectTokenModal, setSelectTokenModal] = useState<boolean>(false);
  const [{ selectedNetworkKey, selectedNetworkPrefix }, setSelectedResult] = useState<SelectedResultType>({});
  const filteredGenesisOptions = genesisOptions.filter(opt => opt.networkKey !== 'all');
  const [{ onChange: onChangeNetworkSelect, onBack: onBackNetworkSelect }, setNetworkSelectAction] = useState<
    ModalActionType<NetworkSelectOption>
  >({});
  const [{ onChange: onChangeTokenSelect, onBack: onBackTokenSelect }, setTokenSelectAction] = useState<
    ModalActionType<TokenItemType>
  >({});

  const actionWithSetTimeout = (action: () => void) => {
    setTimeout(action, HIDE_MODAL_DURATION);
  };

  const onPressReceiveNetworkSelectBack = () => {
    setNetworkSelectAction({});
    setSelectNetworkModal(false);
  };

  const onPressTokenSelectBack = () => {
    setSelectTokenModal(false);

    // actionWithSetTimeout(() => setSendFundTypeModal(true));
  };

  const onChangeSendToken = ({ networkKey, symbol }: TokenItemType) => {
    setSelectedResult({});
    setSelectTokenModal(false);
    navigation.navigate('SendFund', {
      selectedNetworkKey: networkKey,
      selectedToken: symbol,
    });
  };

  const onClickButtonSingleChain = () => {
    setSendFundTypeModal(false);
    if (selectionProvider && selectionProvider.selectedToken) {
      const { selectedNetworkKey: _selectedNetworkKey, selectedToken: _selectedToken } = selectionProvider;
      setSelectTokenModal(false);
      navigation.navigate('SendFund', {
        selectedNetworkKey: _selectedNetworkKey,
        selectedToken: _selectedToken,
      });

      return;
    }

    setTokenSelectAction({
      onChange: onChangeSendToken,
      onBack: onPressTokenSelectBack,
    });
    actionWithSetTimeout(() => setSelectTokenModal(true));
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
    } else {
      setNetworkSelectAction({
        onChange: item => onChangeReceiveNetwork(item.networkKey, item.networkPrefix),
        onBack: onPressReceiveNetworkSelectBack,
      });
      setSelectNetworkModal(true);
    }
  };

  const onPressSwapBtn = () => {
    toast.hideAll();
    toast.show('Coming Soon');
  };

  return (
    <>
      <View style={[actionButtonWrapper, style]}>
        <ActionButton
          label={i18n.cryptoTab.receive}
          iconSize={24}
          iconName={'ReceiveIcon'}
          onPress={onPressReceiveButton}
          disabled={_isAccountAll}
        />
        <ActionButton
          label={i18n.cryptoTab.send}
          iconSize={24}
          iconName={'SendIcon'}
          onPress={onPressSendFundBtn}
          disabled={_isAccountAll}
        />
        <ActionButton
          label={i18n.cryptoTab.swap}
          iconSize={24}
          iconName={'SwapIcon'}
          onPress={onPressSwapBtn}
          disabled={_isAccountAll}
        />
      </View>

      <SelectImportAccountModal
        modalTitle={i18n.common.selectSendingMethod}
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
        filteredNetworkKey={selectionProvider ? selectionProvider.selectedNetworkKey : undefined}
      />

      <ReceiveModal
        networkKey={selectedNetworkKey || 'all'}
        networkPrefix={selectedNetworkPrefix !== undefined ? selectedNetworkPrefix : -1}
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
