import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ImportTokenProps, RootNavigationProps } from 'routes/index';
import { ScrollView, View } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { FormState } from 'hooks/screen/useFormControl';
import { NetworkField } from 'components/Field/Network';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import { TextField } from 'components/Field/Text';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { completeConfirmation, upsertCustomToken, validateCustomToken } from 'messaging/index';
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
import { _AssetType, _ChainInfo } from '@subwallet/chain-list/types';
import {
  _getTokenTypesSupportedByChain,
  _isChainTestNet,
  _parseMetadataForSmartContractAsset,
} from '@subwallet/extension-base/services/chain-service/utils';
import { Button, Icon } from 'components/design-system-ui';
import { ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { useToast } from 'react-native-toast-notifications';
import { TokenTypeSelector } from 'components/Modal/common/TokenTypeSelector';
import { AssetTypeOption } from 'types/asset';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import AlertBox from 'components/design-system-ui/alert-box';
import { Plus } from 'phosphor-react-native';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { ModalRef } from 'types/modalRef';
import { ChainSelector } from 'components/Modal/common/ChainSelector';

interface TokenTypeOption {
  label: string;
  value: _AssetType;
}

function getTokenTypeSupported(chainInfo: _ChainInfo) {
  if (!chainInfo) {
    return [];
  }

  const tokenTypes = _getTokenTypesSupportedByChain(chainInfo);
  const result: TokenTypeOption[] = [];

  tokenTypes.forEach(tokenType => {
    result.push({
      label: tokenType.toString(),
      value: tokenType,
    });
  });

  return result;
}

function getTokenType(chain: string, chainInfoMap: Record<string, _ChainInfo>): string {
  if (!chain || !chainInfoMap[chain]) {
    return '';
  }

  const tokenTypes = getTokenTypeSupported(chainInfoMap[chain]);

  if (tokenTypes.length === 1) {
    return tokenTypes[0].value;
  }

  // todo: may handle case nftTypes.length > 1 in near future

  return '';
}

export const ImportToken = ({ route: { params: routeParams } }: ImportTokenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useGetContractSupportedChains();
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const [isBusy, setBusy] = useState<boolean>(false);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  const toast = useToast();
  useHandlerHardwareBackPress(isBusy);
  const payload = routeParams?.payload;
  const tokenInfo = payload?.payload;
  const { isNetConnected, isReady } = useContext(WebRunnerContext);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const formConfig = {
    chain: {
      name: i18n.common.network,
      value: tokenInfo?.originChain || '',
    },
    selectedTokenType: {
      name: i18n.common.network,
      value: getTokenType(tokenInfo?.originChain || '', chainInfoMap),
    },
    symbol: {
      name: i18n.common.symbol,
      value: tokenInfo?.symbol || '',
    },
    decimals: {
      name: i18n.common.decimals,
      value: tokenInfo ? String(tokenInfo?.decimals) : '',
    },
    contractAddress: {
      require: true,
      name: i18n.importToken.contractAddress,
      value: tokenInfo?.contractAddress || '',
    },
  };

  const onSubmit = (formState: FormState) => {
    const { contractAddress, chain, decimals, symbol, selectedTokenType } = formState.data;

    if (!contractAddress || !chain || !decimals || !symbol || !selectedTokenType) {
      return;
    }

    setBusy(true);

    onUpdateErrors('contractAddress')(undefined);

    if (payload) {
      completeConfirmation('addTokenRequest', {
        id: payload.id,
        isApproved: true,
      } as ConfirmationResult<boolean>).catch(console.error);
    }

    if (!isNetConnected) {
      setBusy(false);
      return;
    }

    upsertCustomToken({
      originChain: chain,
      slug: '',
      name,
      symbol,
      decimals: parseInt(decimals),
      priceId: null,
      minAmount: null,
      assetType: selectedTokenType as _AssetType,
      metadata: _parseMetadataForSmartContractAsset(contractAddress),
      multiChainAsset: null,
      hasValue: _isChainTestNet(chainInfoMap[chain]),
      icon: '',
    })
      .then(resp => {
        if (resp) {
          toast.show(i18n.notificationMessage.addTokenSuccessfully, { type: 'success' });
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

  const {
    formState,
    onChangeValue,
    onChangeChainValue,
    onUpdateErrors,
    onSubmitField,
    showPopupEnableChain,
    checkChainConnected,
  } = useTransaction('import-token', formConfig, {
    onSubmitForm: onSubmit,
  });
  const tokenTypeRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();
  const { selectedTokenType: selectedTokenTypeData } = formState.data;

  const tokenTypeOptions = useMemo(() => {
    return getTokenTypeSupported(chainInfoMap[formState.data.chain]);
  }, [chainInfoMap, formState.data.chain]);

  useEffect(() => {
    const currentContractAddress = formState.data.contractAddress;
    const currentChain = formState.data.chain;
    if (currentContractAddress !== '') {
      let tokenType: _AssetType | undefined;
      const isValidContractCaller = isValidSubstrateAddress(currentAccount?.address || '');

      if (isEthereumAddress(currentContractAddress)) {
        tokenType = _AssetType.ERC20;
      } else if (isValidSubstrateAddress(currentContractAddress)) {
        tokenType = _AssetType.PSP22;
      }

      if (!tokenType) {
        onChangeValue('symbol')('');
        onChangeValue('decimals')('');
        onUpdateErrors('contractAddress')([i18n.errorMessage.invalidContractForSelectedChain]);
      } else {
        validateCustomToken({
          contractAddress: currentContractAddress,
          originChain: currentChain,
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
                setName(resp.name);
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
  }, [currentAccount?.address, formState.data.chain, formState.data.contractAddress, onChangeValue, onUpdateErrors]);

  const onUpdateContractAddress = useCallback(
    (text: string) => {
      if (formState.refs.contractAddress && formState.refs.contractAddress.current) {
        // @ts-ignore
        formState.refs.contractAddress.current.onChange(text);
      }
    },
    [formState.refs.contractAddress],
  );

  const handleChangeValue = useCallback(
    (key: string) => {
      return (text: string) => {
        onUpdateErrors(key)(undefined);
        if (key === 'chain') {
          onChangeChainValue(text);
          return;
        }
        onChangeValue(key)(text);
      };
    },
    [onChangeChainValue, onChangeValue, onUpdateErrors],
  );

  const onScanContractAddress = useCallback(
    (data: string) => {
      if (isAddress(data)) {
        setError(undefined);
        setShowQrModalVisible(false);
        onUpdateContractAddress(data);
      } else {
        setError(i18n.errorMessage.isNotContractAddress);
      }
    },
    [onUpdateContractAddress],
  );

  const onSelectTokenType = useCallback(
    (item: AssetTypeOption) => {
      onChangeValue('selectedTokenType')(item.value);
      tokenTypeRef && tokenTypeRef.current?.onCloseModal();
    },
    [onChangeValue],
  );

  const _goBack = () => {
    if (payload) {
      completeConfirmation('addTokenRequest', {
        id: payload.id,
        isApproved: false,
      } as ConfirmationResult<boolean>).catch(console.error);
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
    !isReady ||
    isBusy;

  return (
    <ContainerWithSubHeader onPressBack={_goBack} title={i18n.header.importToken} disabled={isBusy}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        <ScrollView style={{ width: '100%', flex: 1 }} keyboardShouldPersistTaps={'handled'}>
          <ChainSelector
            items={Object.values(chainInfoMap)}
            selectedValueMap={{ [formState.data.chain]: true }}
            chainSelectorRef={chainSelectorRef}
            onSelectItem={item => {
              handleChangeValue('chain')(item.slug);
              handleChangeValue('selectedTokenType')(getTokenType(item.slug, chainInfoMap));
              setName('');
              chainSelectorRef && chainSelectorRef.current?.onCloseModal();
            }}
            renderSelected={() => (
              <NetworkField
                networkKey={formState.data.chain}
                label={formState.labels.chain}
                placeholder={i18n.placeholder.searchNetwork}
                showIcon
              />
            )}
          />

          <TokenTypeSelector
            disabled={!formState.data.chain || !tokenTypeOptions.length}
            items={tokenTypeOptions}
            onSelectItem={onSelectTokenType}
            selectedValueMap={selectedTokenTypeData ? { [selectedTokenTypeData]: true } : {}}
            tokenTypeRef={tokenTypeRef}
            renderSelected={() => <TokenTypeSelectField value={selectedTokenTypeData} showIcon />}
          />

          <InputAddress
            containerStyle={{ marginBottom: 8 }}
            disabled={!formState.data.chain}
            ref={formState.refs.contractAddress}
            label={formState.labels.contractAddress}
            value={formState.data.contractAddress}
            onChange={(output: string | null, currentValue: string) => {
              onChangeValue('contractAddress')(currentValue);
            }}
            placeholder={i18n.placeholder.typeOrPasteContractAddress}
            onPressQrButton={onPressQrButton}
            onSubmitField={addTokenButtonDisabled ? undefined : onSubmitField('contractAddress')}
          />

          {isReady && !!formState.errors.contractAddress.length && (
            <Warning isDanger message={formState.errors.contractAddress[0]} style={{ marginBottom: 8 }} />
          )}

          <TextField placeholder={i18n.placeholder.symbol} text={formState.data.symbol} />

          <TextField placeholder={i18n.placeholder.decimals} disabled={true} text={formState.data.decimals} />

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}

          {!isReady && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.webRunnerDeadMessage} />
          )}

          {formState.data.chain && !checkChainConnected(formState.data.chain) && (
            <>
              <AlertBox
                type={'warning'}
                title={i18n.warningTitle.updateNetwork}
                description={i18n.warningMessage.enableNetworkMessage}
              />

              <Button
                icon={iconColor => <Icon phosphorIcon={Plus} size={'lg'} iconColor={iconColor} weight={'bold'} />}
                style={{ marginTop: 8 }}
                onPress={() => showPopupEnableChain(formState.data.chain)}
                type={'ghost'}>
                {i18n.buttonTitles.enableNetwork}
              </Button>
            </>
          )}

          <AddressScanner
            qrModalVisible={isShowQrModalVisible}
            onPressCancel={() => {
              setError(undefined);
              setShowQrModalVisible(false);
            }}
            onChangeAddress={onScanContractAddress}
            isShowError
            error={error}
          />
        </ScrollView>

        <View style={{ flexDirection: 'row', paddingTop: 27, ...MarginBottomForSubmitButton }}>
          <Button disabled={isBusy} type={'secondary'} style={{ flex: 1, marginRight: 6 }} onPress={_goBack}>
            {i18n.common.cancel}
          </Button>
          <Button
            disabled={addTokenButtonDisabled}
            loading={isBusy}
            style={{ flex: 1, marginLeft: 6 }}
            onPress={() => onSubmit(formState)}>
            {i18n.common.addToken}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
