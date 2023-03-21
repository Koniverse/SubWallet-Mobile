import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ImportTokenProps, RootNavigationProps } from 'routes/index';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { NetworkField } from 'components/Field/Network';
import { ChainSelect } from 'screens/ImportToken/ChainSelect';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import { TextField } from 'components/Field/Text';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { completeConfirmation, upsertCustomToken, validateCustomToken } from '../../messaging';
import { CustomToken, CustomTokenType } from '@subwallet/extension-base/background/KoniTypes';
import { Warning } from 'components/Warning';
import { InputAddress } from 'components/Input/InputAddress';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { WebRunnerContext } from 'providers/contexts';

export const ImportToken = ({ route: { params: routeParams } }: ImportTokenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainOptions = useGetContractSupportedChains();
  const { currentAccountAddress } = useSelector((state: RootState) => state.accountState);
  const [isBusy, setBusy] = useState<boolean>(false);
  const [isShowChainModal, setShowChainModal] = useState<boolean>(false);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  useHandlerHardwareBackPress(isBusy);
  const payload = routeParams?.payload;
  const tokenInfo = payload?.payload;
  const { isNetConnected, isReady } = useContext(WebRunnerContext);
  const formConfig = {
    contractAddress: {
      require: true,
      name: i18n.importToken.contractAddress,
      value: tokenInfo?.smartContract || '',
    },
    chain: {
      name: i18n.common.network,
      value: tokenInfo?.chain || chainOptions[0]?.value || '',
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
    const customToken = {
      smartContract: contractAddress,
      chain,
      decimals: parseInt(decimals),
      type: 'erc20',
      isCustom: true,
    } as CustomToken;

    if (symbol) {
      customToken.symbol = symbol;
    }

    onUpdateErrors('contractAddress')(undefined);

    if (payload) {
      completeConfirmation('addTokenRequest', { id: payload.id, isApproved: true }).catch(console.error);
    }

    if (!isNetConnected) {
      setBusy(false);
      return;
    }

    upsertCustomToken(customToken)
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
      let tokenType: CustomTokenType | undefined;
      const isValidContractCaller = isValidSubstrateAddress(currentAccountAddress);

      if (isEthereumAddress(currentContractAddress)) {
        tokenType = CustomTokenType.erc20;
      } else if (isValidSubstrateAddress(currentContractAddress)) {
        tokenType = CustomTokenType.psp22;
      }

      if (!tokenType) {
        onChangeValue('symbol')('');
        onChangeValue('decimals')('');
        onUpdateErrors('contractAddress')([i18n.errorMessage.invalidEvmContractAddress]);
      } else {
        validateCustomToken({
          smartContract: currentContractAddress,
          chain: currentChain,
          type: tokenType,
          contractCaller: isValidContractCaller ? currentContractAddress : undefined,
        })
          .then(resp => {
            if (resp.isExist) {
              onUpdateErrors('contractAddress')([i18n.errorMessage.tokenAlreadyAdded]);
            } else {
              if (resp.contractError) {
                onUpdateErrors('contractAddress')([i18n.errorMessage.invalidContractForSelectedChain]);
              } else {
                onUpdateErrors('contractAddress')(undefined);
                onChangeValue('symbol')(resp.symbol);
                if (resp.decimals) {
                  onChangeValue('decimals')(String(resp.decimals));
                }
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
  }, [currentAccountAddress, formState.data.chain, formState.data.contractAddress, onChangeValue, onUpdateErrors]);

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
    !formState.data.decimals ||
    !isNetConnected ||
    !isReady;

  return (
    <ContainerWithSubHeader onPressBack={_goBack} title={i18n.title.importToken} disabled={isBusy}>
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

          {isReady && !!formState.errors.contractAddress.length && (
            <Warning isDanger message={formState.errors.contractAddress[0]} style={{ marginBottom: 8 }} />
          )}

          <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setShowChainModal(true)}>
            <NetworkField networkKey={formState.data.chain} label={formState.labels.chain} />
          </TouchableOpacity>

          <TextField label={i18n.common.symbol} text={formState.data.symbol} />

          <TextField disabled={true} label={i18n.common.decimals} text={formState.data.decimals} />

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}

          {!isReady && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.webRunnerDeadMessage} />
          )}

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
