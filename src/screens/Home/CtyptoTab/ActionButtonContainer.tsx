import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { SelectImportAccountModal } from 'screens/SelectImportAccountModal';
import { TokenSelect } from 'screens/TokenSelect';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { AccountActionType, SelectionProviderProps, TokenItemType } from 'types/ui-types';
import {
  ArrowFatLineDown,
  ArrowsClockwise,
  Article,
  FirstAidKit,
  PaperPlaneTilt,
  Shuffle,
} from 'phosphor-react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { HIDE_MODAL_DURATION } from '../../../constant';
import ToastContainer, { useToast } from 'react-native-toast-notifications';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import { AccountSelect } from 'screens/AccountSelect';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { ColorMap } from 'styles/color';

interface Props extends SelectionProviderProps {
  style?: StyleProp<any>;
}

type ModalActionType<T> = {
  onChange?: (item: T) => void;
  onBack?: () => void;
};

type SelectedResultType = {
  selectedAccount?: string;
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
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const { accounts, currentAccountAddress } = useSelector((state: RootState) => state.accounts);
  const toast = useToast();
  const _isAccountAll = isAccountAll(currentAccountAddress);
  const navigation = useNavigation<RootNavigationProps>();
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const [sendFundTypeModal, setSendFundTypeModal] = useState<boolean>(false);
  const [selectAccountModal, setSelectAccountModal] = useState<boolean>(false);
  const [selectTokenModal, setSelectTokenModal] = useState<boolean>(false);
  const [{ selectedAccount, selectedNetworkKey, selectedNetworkPrefix }, setSelectedResult] =
    useState<SelectedResultType>({});
  const [{ onChange: onChangeAccountSelect, onBack: onBackAccountSelect }, setAccountSelectAction] = useState<
    ModalActionType<string>
  >({});
  const [{ onChange: onChangeTokenSelect, onBack: onBackTokenSelect }, setTokenSelectAction] = useState<
    ModalActionType<TokenItemType>
  >({});
  useEffect(() => {
    const blurAction = () => {
      setReceiveModalVisible(false);
    };
    navigation.addListener('blur', blurAction);

    return () => {
      navigation.removeListener('blur', blurAction);
    };
  }, [navigation]);

  const getAccountList = () => {
    const accountListWithoutAll = accounts.filter(opt => opt.address !== 'ALL');

    if (selectionProvider) {
      if (networkMap[selectionProvider.selectedNetworkKey].isEthereum) {
        return accountListWithoutAll.filter(acc => isEthereumAddress(acc.address));
      } else {
        return accountListWithoutAll.filter(acc => !isEthereumAddress(acc.address));
      }
    } else {
      return accountListWithoutAll;
    }
  };

  const actionWithSetTimeout = (action: () => void) => {
    setTimeout(action, HIDE_MODAL_DURATION);
  };

  const onPressAccountSelectBack = () => {
    setSelectAccountModal(false);
  };

  const onPressTokenSelectBack = () => {
    setSelectTokenModal(false);
  };

  const onChangeSendAccount = (address: string) => {
    if (selectionProvider && selectionProvider.selectedToken) {
      const { selectedNetworkKey: _selectedNetworkKey, selectedToken: _selectedToken } = selectionProvider;
      setSelectAccountModal(false);
      navigation.navigate('SendFund', {
        selectedAccount: address,
        selectedNetworkKey: _selectedNetworkKey,
        selectedToken: _selectedToken,
      });
    } else {
      setSelectedResult({ selectedAccount: address });
      setTokenSelectAction({
        onChange: item => onChangeSendToken(item, address),
        onBack: onPressTokenSelectBack,
      });
      setSelectAccountModal(false);
      actionWithSetTimeout(() => setSelectTokenModal(true));
    }
  };

  const onChangeSendToken = ({ networkKey, symbol }: TokenItemType, address: string) => {
    setSelectTokenModal(false);
    navigation.navigate('SendFund', {
      selectedAccount: address || currentAccountAddress,
      selectedNetworkKey: networkKey,
      selectedToken: symbol,
    });
  };

  const onClickButtonSingleChain = () => {
    if (_isAccountAll) {
      setSendFundTypeModal(false);
      setAccountSelectAction({
        onChange: onChangeSendAccount,
        onBack: onPressAccountSelectBack,
      });
      actionWithSetTimeout(() => setSelectAccountModal(true));
    } else {
      setSendFundTypeModal(false);
      if (selectionProvider && selectionProvider.selectedToken) {
        const { selectedNetworkKey: _selectedNetworkKey, selectedToken: _selectedToken } = selectionProvider;
        setSelectTokenModal(false);
        navigation.navigate('SendFund', {
          selectedAccount: currentAccountAddress,
          selectedNetworkKey: _selectedNetworkKey,
          selectedToken: _selectedToken,
        });
      } else {
        setTokenSelectAction({
          onChange: item => onChangeSendToken(item, currentAccountAddress),
          onBack: onPressTokenSelectBack,
        });
        actionWithSetTimeout(() => setSelectTokenModal(true));
      }
    }
  };

  const onChangeReceiveAccount = (address: string) => {
    if (selectionProvider) {
      const { selectedNetworkKey: _selectedNetworkKey } = selectionProvider;
      const _selectedNetworkPrefix = networkMap[_selectedNetworkKey].ss58Format;
      setSelectedResult({
        selectedAccount: address,
        selectedNetworkKey: _selectedNetworkKey,
        selectedNetworkPrefix: _selectedNetworkPrefix,
      });
      setSelectAccountModal(false);
      actionWithSetTimeout(() => setReceiveModalVisible(true));
    } else {
      setSelectedResult({ selectedAccount: address });
      setTokenSelectAction({
        onChange: item => onChangeReceiveToken(item, address),
        onBack: onPressTokenSelectBack,
      });
      setSelectAccountModal(false);
      actionWithSetTimeout(() => setSelectTokenModal(true));
    }
  };

  const onChangeReceiveToken = ({ networkKey }: TokenItemType, address: string) => {
    setSelectedResult({
      selectedAccount: address,
      selectedNetworkKey: networkKey,
      selectedNetworkPrefix: networkMap[networkKey].ss58Format,
    });
    setSelectTokenModal(false);
    actionWithSetTimeout(() => setReceiveModalVisible(true));
  };

  const toastRef = useRef<ToastContainer>(null);
  const _onClickButton = () => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(i18n.common.comingSoon);
    }
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
      onCLickButton: _onClickButton,
    },
    {
      icon: FirstAidKit,
      title: i18n.common.charityDonate,
      onCLickButton: _onClickButton,
    },
  ];

  const onPressSendFundBtn = () => {
    setSendFundTypeModal(true);
  };

  const onPressReceiveButton = () => {
    if (_isAccountAll) {
      setAccountSelectAction({
        onChange: onChangeReceiveAccount,
        onBack: onPressAccountSelectBack,
      });
      setSelectAccountModal(true);
    } else {
      if (selectionProvider) {
        const { selectedNetworkKey: _selectedNetworkKey } = selectionProvider;
        const _selectedNetworkPrefix = networkMap[_selectedNetworkKey].ss58Format;
        setSelectedResult({ selectedNetworkKey: _selectedNetworkKey, selectedNetworkPrefix: _selectedNetworkPrefix });
        setReceiveModalVisible(true);
      } else {
        setTokenSelectAction({
          onChange: item => onChangeReceiveToken(item, currentAccountAddress),
          onBack: onPressTokenSelectBack,
        });
        actionWithSetTimeout(() => setSelectTokenModal(true));
      }
    }
  };

  const onPressSwapBtn = () => {
    toast.hideAll();
    toast.show(i18n.common.comingSoon);
  };

  const receiveIcon = <ArrowFatLineDown color={ColorMap.light} size={24} weight={'bold'} />;
  const sendIcon = <PaperPlaneTilt color={ColorMap.light} size={24} weight={'bold'} />;
  const swapIcon = <ArrowsClockwise color={ColorMap.light} size={24} weight={'bold'} />;

  return (
    <>
      <View style={[actionButtonWrapper, style]} pointerEvents="box-none">
        <ActionButton label={i18n.cryptoTab.receive} icon={receiveIcon} onPress={onPressReceiveButton} />
        <ActionButton label={i18n.cryptoTab.send} icon={sendIcon} onPress={onPressSendFundBtn} />
        <ActionButton label={i18n.cryptoTab.swap} icon={swapIcon} onPress={onPressSwapBtn} />
      </View>

      <SelectImportAccountModal
        modalTitle={i18n.common.selectSendingMethod}
        secretTypeList={SEND_FUND_TYPE}
        modalVisible={sendFundTypeModal}
        onChangeModalVisible={() => setSendFundTypeModal(false)}
        modalHeight={256}
        toastRef={toastRef}
      />

      <AccountSelect
        accountList={getAccountList()}
        onChangeAddress={onChangeAccountSelect}
        modalVisible={selectAccountModal}
        onChangeModalVisible={() => setSelectAccountModal(false)}
        onPressBack={onBackAccountSelect}
      />

      <TokenSelect
        address={selectedAccount || currentAccountAddress}
        modalVisible={selectTokenModal}
        onChangeModalVisible={() => setSelectTokenModal(false)}
        onPressBack={onBackTokenSelect}
        onChangeToken={onChangeTokenSelect}
        filteredNetworkKey={selectionProvider ? selectionProvider.selectedNetworkKey : undefined}
      />

      <ReceiveModal
        selectedAddress={selectedAccount}
        networkKey={selectedNetworkKey || 'all'}
        networkPrefix={selectedNetworkPrefix !== undefined ? selectedNetworkPrefix : -1}
        receiveModalVisible={receiveModalVisible}
        disableReselectButton={!!selectionProvider && !!selectionProvider.selectedNetworkKey}
        onChangeVisible={() => {
          setReceiveModalVisible(false);
        }}
        openChangeNetworkModal={() => {
          actionWithSetTimeout(() => setSelectTokenModal(true));
        }}
      />
    </>
  );
};
