import React, { useEffect, useState } from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { TokenSelect } from 'screens/TokenSelect';
import { ReceiveModal } from 'screens/Home/Crypto/ReceiveModal';
import { SelectionProviderProps, TokenItemType } from 'types/ui-types';
import { ArrowFatLineDown, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { AccountSelect } from 'screens/AccountSelect';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { ColorMap } from 'styles/color';
import { ServiceModal } from 'screens/Home/Crypto/ServiceModal';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { useToast } from 'react-native-toast-notifications';

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
  const [selectAccountModal, setSelectAccountModal] = useState<boolean>(false);
  const [selectServicesModalVisible, setSelectServicesModal] = useState<boolean>(false);
  const [isSelectBuyButton, setSelectBuyButton] = useState(false);
  const [selectTokenModal, setSelectTokenModal] = useState<boolean>(false);
  const [{ selectedAccount, selectedNetworkKey, selectedNetworkPrefix }, setSelectedResult] =
    useState<SelectedResultType>({});
  const showedNetworks = useShowedNetworks(currentAccountAddress, accounts);
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

  const onPressReceiveButton = () => {
    setSelectedResult({});
    setSelectBuyButton(false);
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

  const onPressSendButton = () => {
    if (showedNetworks && showedNetworks.length) {
      navigation.navigate('SendFund', {
        selectedNetworkKey: selectionProvider?.selectedNetworkKey,
        selectedToken: selectionProvider?.selectedToken,
      });
    } else {
      toast.hideAll();
      toast.show(i18n.warningMessage.enableNetworkToContinue);
    }
  };

  const onChangeBuyAccount = (address: string) => {
    if (selectionProvider) {
      const { selectedNetworkKey: _selectedNetworkKey } = selectionProvider;
      const _selectedNetworkPrefix = networkMap[_selectedNetworkKey].ss58Format;
      setSelectedResult({
        selectedAccount: address,
        selectedNetworkKey: _selectedNetworkKey,
        selectedNetworkPrefix: _selectedNetworkPrefix,
      });
      setSelectAccountModal(false);
      actionWithSetTimeout(() => setSelectServicesModal(true));
    } else {
      setSelectedResult({ selectedAccount: address });
      setSelectAccountModal(false);
      setTokenSelectAction({
        onChange: onChangeBuyToken,
        onBack: onPressBuyTokenBack,
      });
      actionWithSetTimeout(() => setSelectTokenModal(true));
    }
  };

  const onPressBuyAccountSelectBack = () => {
    setSelectAccountModal(false);
  };

  const onChangeBuyToken = (item: TokenItemType) => {
    const _selectedNetworkPrefix = networkMap[item.networkKey].ss58Format;
    setSelectedResult(prevState => ({
      ...prevState,
      selectedNetworkKey: item.networkKey,
      selectedNetworkPrefix: _selectedNetworkPrefix,
      selectedToken: item.symbol,
    }));
    setSelectTokenModal(false);
    actionWithSetTimeout(() => setSelectServicesModal(true));
  };

  const onPressBuyTokenBack = () => {
    setSelectTokenModal(false);
  };

  // const onPressSwapBtn = () => {
  //   toast.hideAll();
  //   toast.show(i18n.common.comingSoon);
  // };

  const onPressBuyBtn = () => {
    setSelectedResult({});
    setSelectBuyButton(true);
    if (_isAccountAll) {
      setAccountSelectAction({
        onChange: onChangeBuyAccount,
        onBack: onPressBuyAccountSelectBack,
      });

      setSelectAccountModal(true);
    } else {
      if (selectionProvider) {
        const { selectedNetworkKey: _selectedNetworkKey } = selectionProvider;
        const _selectedNetworkPrefix = networkMap[_selectedNetworkKey].ss58Format;
        setSelectedResult({ selectedNetworkKey: _selectedNetworkKey, selectedNetworkPrefix: _selectedNetworkPrefix });
        setSelectServicesModal(true);
      } else {
        setTokenSelectAction({
          onChange: onChangeBuyToken,
          onBack: onPressTokenSelectBack,
        });
        setSelectTokenModal(true);
      }
    }
  };

  const receiveIcon = <ArrowFatLineDown color={ColorMap.light} size={24} weight={'bold'} />;
  const sendIcon = <PaperPlaneTilt color={ColorMap.light} size={24} weight={'bold'} />;
  // const swapIcon = <ArrowsClockwise color={ColorMap.light} size={24} weight={'bold'} />;
  const buyIcon = <ShoppingCartSimple color={ColorMap.light} size={24} weight={'bold'} />;

  return (
    <>
      <View style={[actionButtonWrapper, style]} pointerEvents="box-none">
        <ActionButton label={i18n.cryptoScreen.receive} icon={receiveIcon} onPress={onPressReceiveButton} />
        <ActionButton label={i18n.cryptoScreen.send} icon={sendIcon} onPress={onPressSendButton} />
        {/*<ActionButton label={i18n.cryptoScreen.swap} icon={swapIcon} onPress={onPressSwapBtn} />*/}
        <ActionButton label={i18n.cryptoScreen.buy} icon={buyIcon} onPress={onPressBuyBtn} />
      </View>

      <AccountSelect
        accountList={getAccountList()}
        onChangeAddress={onChangeAccountSelect}
        modalVisible={selectAccountModal}
        onChangeModalVisible={() => setSelectAccountModal(false)}
        onPressBack={onBackAccountSelect}
      />

      <TokenSelect
        title={i18n.title.selectToken}
        isOnlyShowMainToken={isSelectBuyButton}
        address={selectedAccount || currentAccountAddress}
        modalVisible={selectTokenModal}
        onChangeModalVisible={() => setSelectTokenModal(false)}
        onPressBack={onBackTokenSelect}
        onChangeToken={onChangeTokenSelect}
        filteredNetworkKey={selectionProvider ? selectionProvider.selectedNetworkKey : undefined}
      />

      <ServiceModal
        modalVisible={selectServicesModalVisible}
        onChangeModalVisible={() => setSelectServicesModal(false)}
        onPressBack={() => {
          setSelectServicesModal(false);
        }}
        token={selectionProvider?.selectedToken}
        networkKey={selectedNetworkKey || ''}
        networkPrefix={selectedNetworkPrefix !== undefined ? selectedNetworkPrefix : -1}
        address={_isAccountAll ? selectedAccount || '' : currentAccountAddress}
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
