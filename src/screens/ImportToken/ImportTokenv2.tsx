import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ImportTokenProps, RootNavigationProps } from 'routes/index';
import { ScrollView, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { NetworkField } from 'components/Field/Network';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import { TextField } from 'components/Field/Text';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { completeConfirmation, upsertCustomToken, validateCustomToken } from 'messaging/index';
import { Warning } from 'components/Warning';
import { InputAddress } from 'components/Input/InputAddressV2';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
import { WebRunnerContext } from 'providers/contexts';
import { _AssetType, _ChainInfo } from '@subwallet/chain-list/types';
import {
  _getTokenTypesSupportedByChain,
  _isChainTestNet,
  _parseMetadataForSmartContractAsset,
} from '@subwallet/extension-base/services/chain-service/utils';
import { Button, Icon, Input } from 'components/design-system-ui';
import { ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { useToast } from 'react-native-toast-notifications';
import { TokenTypeSelector } from 'components/Modal/common/TokenTypeSelector';
import AlertBox from 'components/design-system-ui/alert-box';
import { Plus } from 'phosphor-react-native';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { ValidateStatus } from '@subwallet/react-ui/es/form/FormItem';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransactionV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './style/ImportToken';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { ModalRef } from 'types/modalRef';
import { ChainInfo } from 'types/index';
import { useWatch } from 'react-hook-form';
import { FormItem } from 'components/common/FormItem';
import { AssetTypeOption } from 'types/asset';

interface FormValues extends TransactionFormValues {
  contractAddress: string;
  type: string;
  priceId: string;
}

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

  if (tokenTypes.length) {
    return tokenTypes[0].value;
  }

  return '';
}

const ButtonIcon = (color: string) => {
  return <Icon phosphorIcon={Plus} size={'lg'} iconColor={color} weight={'bold'} />;
};

export const ImportToken = ({ route: { params: routeParams } }: ImportTokenProps) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();

  const payload = routeParams?.payload;
  const tokenInfo = payload?.payload;

  const { isNetConnected, isReady } = useContext(WebRunnerContext);

  const chainInfoMap = useGetContractSupportedChains();
  const [contractValidationStatus, setContractValidationStatus] = useState<ValidateStatus>('');
  const [loading, setLoading] = useState(false);
  useHandlerHardwareBackPress(loading);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(-1);

  const tokenTypeRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();

  const {
    form: { setValue, resetField, getValues, control, handleSubmit },
    onChangeChainValue,
    showPopupEnableChain,
    checkChainConnected,
  } = useTransaction<FormValues>('import-token', {
    defaultValues: {
      chain: tokenInfo?.originChain || '',
      type: getTokenType(tokenInfo?.originChain || '', chainInfoMap),
      contractAddress: tokenInfo?.contractAddress || '',
    },
  });

  const { chain: selectedChain, type: selectedTokenType } = {
    ...useWatch<FormValues>({ control }),
    ...getValues(),
  };

  const tokenTypeOptions = useMemo(() => {
    return getTokenTypeSupported(chainInfoMap[selectedChain]);
  }, [chainInfoMap, selectedChain]);

  const goBack = useCallback(() => {
    if (payload) {
      completeConfirmation('addTokenRequest', {
        id: payload.id,
        isApproved: false,
      } as ConfirmationResult<boolean>).catch(console.error);
    }

    navigation.canGoBack() && navigation.goBack();
  }, [navigation, payload]);

  const onSubmit = useCallback(
    (formValues: FormValues) => {
      setLoading(true);

      upsertCustomToken({
        originChain: formValues.chain,
        slug: '',
        name,
        symbol,
        decimals,
        priceId: formValues.priceId || null,
        minAmount: null,
        assetType: formValues.type as _AssetType,
        metadata: _parseMetadataForSmartContractAsset(formValues.contractAddress),
        multiChainAsset: null,
        hasValue: _isChainTestNet(chainInfoMap[formValues.chain]),
        icon: 'default.png',
      })
        .then(result => {
          setLoading(false);

          if (result) {
            toast.show(i18n.notificationMessage.addTokenSuccessfully);
            goBack();
          } else {
            toast.show(i18n.errorMessage.occurredError);
          }
        })
        .catch(() => {
          setLoading(false);
          toast.show(i18n.errorMessage.occurredError);
        });
    },
    [name, symbol, decimals, chainInfoMap, toast, goBack],
  );

  const isSubmitDisabled = useMemo(() => {
    return loading || contractValidationStatus === '' || contractValidationStatus === 'error';
  }, [contractValidationStatus, loading]);

  const contractAddressRules = useMemo(
    () => ({
      validate: (contractAddress: string, { chain, type }: FormValues): Promise<ValidateResult> => {
        return new Promise(resolve => {
          const isValidEvmContract =
            [_AssetType.ERC20].includes(type as _AssetType) && isEthereumAddress(contractAddress);
          const isValidWasmContract =
            [_AssetType.PSP22].includes(type as _AssetType) && isValidSubstrateAddress(contractAddress);

          if (isValidEvmContract || isValidWasmContract) {
            setLoading(true);
            validateCustomToken({
              contractAddress,
              originChain: chain,
              type: type as _AssetType,
            })
              .then(validationResult => {
                setLoading(false);

                if (validationResult.isExist) {
                  setContractValidationStatus('error');
                  resolve(i18n.errorMessage.tokenAlreadyAdded);
                }

                if (validationResult.contractError) {
                  setContractValidationStatus('error');
                  resolve(i18n.errorMessage.errorValidatingThisToken);
                }

                if (!validationResult.isExist && !validationResult.contractError) {
                  setContractValidationStatus('success');
                  setSymbol(validationResult.symbol);
                  setDecimals(validationResult.decimals);
                  setName(validationResult.name);
                  resolve(undefined);
                }
              })
              .catch(() => {
                setLoading(false);
                setContractValidationStatus('error');
                resolve(i18n.errorMessage.errorValidatingThisToken);
              });
          } else {
            setContractValidationStatus('error');
            resolve(i18n.errorMessage.invalidContractAddress);
          }
        });
      },
    }),
    [],
  );

  const onChangeChain = useCallback(
    ({ slug: value }: ChainInfo) => {
      onChangeChainValue(value);
      const tokenTypes = getTokenTypeSupported(chainInfoMap[value]);

      if (tokenTypes.length === 1) {
        setValue('type', tokenTypes[0].value);
      } else {
        resetField('type');
      }

      resetField('contractAddress');
      setSymbol('');
      setDecimals(-1);
      setName('');
      setContractValidationStatus('');

      chainSelectorRef && chainSelectorRef.current?.onCloseModal();
    },
    [chainInfoMap, onChangeChainValue, resetField, setValue],
  );

  const onChangeTokenType = useCallback(
    ({ value }: AssetTypeOption) => {
      const _selectedTokenType = getValues('type');

      if (_selectedTokenType !== value) {
        resetField('contractAddress');
        setSymbol('');
        setDecimals(-1);
        setName('');
      }

      setValue('type', value);

      tokenTypeRef && tokenTypeRef.current?.onCloseModal();
    },
    [getValues, resetField, setValue],
  );

  return (
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.header.importToken} disabled={loading}>
      <ScrollView
        style={stylesheet.scrollView}
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={stylesheet.scrollViewContentContainer}>
        <FormItem
          control={control}
          render={({ field: { value } }) => (
            <ChainSelector
              items={Object.values(chainInfoMap)}
              selectedValueMap={{ [value]: true }}
              chainSelectorRef={chainSelectorRef}
              onSelectItem={onChangeChain}
              renderSelected={() => (
                <NetworkField
                  outerStyle={stylesheet.generalFieldBaseComponentStyle}
                  networkKey={value}
                  label={i18n.common.network}
                  placeholder={i18n.placeholder.searchNetwork}
                  showIcon
                />
              )}
            />
          )}
          name="chain"
        />

        <FormItem
          control={control}
          render={({ field: { value } }) => (
            <TokenTypeSelector
              disabled={!selectedChain || !tokenTypeOptions.length}
              items={tokenTypeOptions}
              onSelectItem={onChangeTokenType}
              selectedValueMap={value ? { [value]: true } : {}}
              tokenTypeRef={tokenTypeRef}
              renderSelected={() => (
                <TokenTypeSelectField outerStyle={stylesheet.generalFieldBaseComponentStyle} value={value} showIcon />
              )}
            />
          )}
          name="type"
        />

        <FormItem
          control={control}
          showError={isReady}
          rules={contractAddressRules}
          render={({ field: { value, ref, onChange } }) => (
            <InputAddress
              ref={ref}
              label={i18n.importToken.contractAddress}
              value={value}
              onChangeText={onChange}
              placeholder={i18n.placeholder.typeOrPasteContractAddress}
              disabled={!selectedChain}
              saveAddress={false}
            />
          )}
          name="contractAddress"
        />

        <View style={stylesheet.row}>
          <View style={stylesheet.flex1}>
            <TextField
              placeholder={i18n.placeholder.symbol}
              text={symbol}
              disabled={true}
              outerStyle={stylesheet.generalFieldBaseComponentStyle}
            />
          </View>

          <View style={stylesheet.flex1}>
            <TextField
              outerStyle={stylesheet.generalFieldBaseComponentStyle}
              placeholder={i18n.placeholder.decimals}
              disabled={true}
              text={`${decimals === -1 ? '' : decimals}`}
            />
          </View>
        </View>

        <View>
          <FormItem
            control={control}
            render={({ field: { value, ref, onChange } }) => (
              <Input
                disabled={selectedTokenType === ''}
                placeholder={i18n.placeholder.priceId}
                ref={ref}
                value={value}
                onChangeText={onChange}
              />
            )}
            name="priceId"
          />

          {!isNetConnected && (
            <Warning
              style={stylesheet.generalFormErrorMessage}
              isDanger
              message={i18n.warningMessage.noInternetMessage}
            />
          )}

          {!isReady && (
            <Warning
              style={stylesheet.generalFormErrorMessage}
              isDanger
              message={i18n.warningMessage.webRunnerDeadMessage}
            />
          )}
        </View>

        {selectedChain && !checkChainConnected(selectedChain) && (
          <>
            <AlertBox
              type={'warning'}
              title={i18n.warningTitle.updateNetwork}
              description={i18n.warningMessage.enableNetworkMessage}
            />

            <Button
              icon={ButtonIcon}
              style={stylesheet.enableNetworkButton}
              onPress={() => showPopupEnableChain(selectedChain)}
              type={'ghost'}>
              {i18n.buttonTitles.enableNetwork}
            </Button>
          </>
        )}
      </ScrollView>

      <View style={stylesheet.footer}>
        <Button disabled={loading} type={'secondary'} style={stylesheet.footerButton} onPress={goBack}>
          {i18n.common.cancel}
        </Button>
        <Button
          disabled={isSubmitDisabled}
          loading={loading}
          style={stylesheet.footerButton}
          onPress={handleSubmit(onSubmit)}>
          {i18n.common.addToken}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};
