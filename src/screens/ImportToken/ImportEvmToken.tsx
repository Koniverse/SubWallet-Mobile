import React, { useCallback, useEffect, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ImportEvmTokenProps, RootNavigationProps } from 'routes/index';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { NetworkField } from 'components/Field/Network';
import { ChainSelect } from 'screens/ImportToken/ChainSelect';
import useGetActiveEvmChains from 'hooks/screen/ImportNft/useGetActiveEvmChains';
import { TextField } from 'components/Field/Text';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { completeConfirmation, upsertEvmToken, validateEvmToken } from '../../messaging';
import { CustomEvmToken } from '@subwallet/extension-base/background/KoniTypes';
import { Warning } from 'components/Warning';
import { InputAddress } from 'components/Input/InputAddress';
import { requestCameraPermission } from 'utils/validators';
import { RESULTS } from 'react-native-permissions';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';

export const ImportEvmToken = ({
  route: {
    params: { payload },
  },
}: ImportEvmTokenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainOptions = useGetActiveEvmChains();
  const [isBusy, setBusy] = useState<boolean>(false);
  const [isShowChainModal, setShowChainModal] = useState<boolean>(false);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  useHandlerHardwareBackPress(isBusy);
  const tokenInfo = payload?.payload;
  const formConfig = {
    contractAddress: {
      require: true,
      name: i18n.importEvmToken.contractAddress,
      value: tokenInfo?.smartContract || '',
    },
    chain: {
      name: i18n.common.network,
      value: tokenInfo?.chain || chainOptions[0].value || '',
    },
    symbol: {
      name: i18n.common.symbol,
      value: tokenInfo?.symbol || '',
    },
    decimals: {
      name: i18n.common.decimals,
      value: tokenInfo ? String(tokenInfo?.decimals) : '',
    },
  };

  const onSubmit = (formState: FormState) => {
    setBusy(true);
    const { contractAddress, chain, decimals, symbol } = formState.data;
    const evmToken = {
      smartContract: contractAddress,
      chain,
      decimals: parseInt(decimals),
      type: 'erc20',
      isCustom: true,
    } as CustomEvmToken;

    if (symbol) {
      evmToken.symbol = symbol;
    }

    onUpdateErrors('contractAddress')(undefined);

    if (payload) {
      completeConfirmation('addTokenRequest', { id: payload.id, isApproved: true }).catch(console.error);
    }

    upsertEvmToken(evmToken)
      .then(resp => {
        if (resp) {
          _goBack();
        } else {
          onUpdateErrors('contractAddress')([i18n.errorMessage.occurredError]);
          setBusy(false);
        }
      })
      .catch(() => {
        onUpdateErrors('contractAddress')([i18n.errorMessage.occurredError]);
        setBusy(false);
      });
  };

  const { formState, onChangeValue, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });
  useEffect(() => {
    const currentContractAddress = formState.data.contractAddress;
    const currentChain = formState.data.chain;
    if (currentContractAddress !== '') {
      if (!isEthereumAddress(currentContractAddress)) {
        onChangeValue('symbol')('');
        onChangeValue('decimals')('');
        onUpdateErrors('contractAddress')([i18n.errorMessage.invalidEvmContractAddress]);
      } else {
        validateEvmToken({
          smartContract: currentContractAddress,
          chain: currentChain,
          type: 'erc20',
        })
          .then(resp => {
            if (resp.isExist) {
              onUpdateErrors('contractAddress')([i18n.errorMessage.tokenAlreadyAdded]);
            } else {
              onUpdateErrors('contractAddress')(undefined);
              onChangeValue('symbol')(resp.symbol);
              if (resp.decimals) {
                onChangeValue('decimals')(String(resp.decimals));
              }
            }
          })
          .catch(() => {
            onChangeValue('symbol')('');
            onChangeValue('decimals')('');
            onUpdateErrors('contractAddress')([i18n.errorMessage.invalidContractForSelectedChain]);
          });
      }
    }
  }, [formState.data.chain, formState.data.contractAddress, onChangeValue, onUpdateErrors]);

  const onUpdateContractAddress = (text: string) => {
    if (formState.refs.contractAddress && formState.refs.contractAddress.current) {
      // @ts-ignore
      formState.refs.contractAddress.current.onChange(text);
    }
  };

  const handleChangeValue = useCallback(
    (key: string) => {
      return (text: string) => {
        onUpdateErrors(key)(undefined);
        onChangeValue(key)(text);
      };
    },
    [onChangeValue, onUpdateErrors],
  );

  const _goBack = () => {
    if (payload) {
      completeConfirmation('addTokenRequest', { id: payload.id, isApproved: false }).catch(console.error);
    }

    navigation.canGoBack() && navigation.goBack();
  };

  const onPressQrButton = async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setShowQrModalVisible(true);
    }
  };

  const addTokenButtonDisabled =
    !formState.data.contractAddress ||
    !!formState.errors.contractAddress.length ||
    !formState.data.symbol ||
    !formState.data.decimals;

  return (
    <ContainerWithSubHeader onPressBack={_goBack} title={i18n.title.importEvmToken} disabled={isBusy}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        <ScrollView style={{ width: '100%', flex: 1 }}>
          <InputAddress
            containerStyle={{ marginBottom: 8 }}
            ref={formState.refs.contractAddress}
            label={formState.labels.contractAddress}
            value={formState.data.contractAddress}
            onChange={(output: string | null, currentValue: string) => {
              onChangeValue('contractAddress')(currentValue);
            }}
            onPressQrButton={onPressQrButton}
          />

          {!!formState.errors.contractAddress.length && (
            <Warning isDanger message={formState.errors.contractAddress[0]} style={{ marginBottom: 8 }} />
          )}

          <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setShowChainModal(true)}>
            <NetworkField networkKey={formState.data.chain} label={formState.labels.chain} />
          </TouchableOpacity>

          <TextField label={i18n.common.symbol} text={formState.data.symbol} />

          <TextField disabled={true} label={i18n.common.decimals} text={formState.data.decimals} />

          <AddressScanner
            qrModalVisible={isShowQrModalVisible}
            onPressCancel={() => setShowQrModalVisible(false)}
            onChangeAddress={(text: string) => onUpdateContractAddress(text)}
            networkKey={formState.data.chain || 'default'}
            token={'contract'}
            scanMessage={i18n.common.toImportToken}
          />
        </ScrollView>
        <View style={{ flexDirection: 'row', paddingTop: 27, ...MarginBottomForSubmitButton }}>
          <SubmitButton
            disabled={isBusy}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            title={i18n.common.cancel}
            backgroundColor={ColorMap.dark2}
            style={{ flex: 1, marginRight: 8 }}
            onPress={_goBack}
          />
          <SubmitButton
            disabled={addTokenButtonDisabled}
            isBusy={isBusy}
            style={{ flex: 1, marginLeft: 8 }}
            title={i18n.common.addToken}
            onPress={() => onSubmit(formState)}
          />
        </View>
        <ChainSelect
          items={chainOptions}
          modalVisible={isShowChainModal}
          onChangeModalVisible={() => setShowChainModal(false)}
          onChangeValue={(text: string) => {
            handleChangeValue('chain')(text);
            setShowChainModal(false);
          }}
          selectedItem={formState.data.chain}
        />
      </View>
    </ContainerWithSubHeader>
  );
};
