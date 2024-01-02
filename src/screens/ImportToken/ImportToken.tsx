import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ImportTokenProps, RootNavigationProps } from 'routes/index';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { NetworkField } from 'components/Field/Network';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import { TextField } from 'components/Field/Text';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { completeConfirmation, upsertCustomToken, validateCustomToken } from 'messaging/index';
import { Warning } from 'components/Warning';
import { InputAddress } from 'components/Input/InputAddress';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { addLazy, isValidSubstrateAddress, removeLazy } from '@subwallet/extension-base/utils';
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
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { Plus } from 'phosphor-react-native';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { ModalRef } from 'types/modalRef';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { FormItem } from 'components/common/FormItem';
import reformatAddress from 'utils/index';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';

interface ImportTokenFormValues extends TransactionFormValues {
  selectedTokenType: string;
  symbol: string;
  decimals: string;
  tokenName: string;
  contractAddress: string;
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

  if (tokenTypes.length === 1) {
    return tokenTypes[0].value;
  }

  // todo: may handle case nftTypes.length > 1 in near future

  return '';
}

export const ImportToken = ({ route: { params: routeParams } }: ImportTokenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useGetContractSupportedChains();
  const [isBusy, setBusy] = useState<boolean>(false);
  const toast = useToast();
  useHandlerHardwareBackPress(isBusy);
  const payload = routeParams?.payload;
  const tokenInfo = payload?.payload;
  const { isNetConnected, isReady } = useContext(WebRunnerContext);
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [isValidContract, setIsValidContract] = useState<boolean>(true);
  const {
    title,
    form: {
      control,
      getValues,
      setValue,
      formState: { errors, dirtyFields },
      trigger,
    },
    onChangeChainValue: setChain,
    showPopupEnableChain,
    checkChainConnected,
  } = useTransaction<ImportTokenFormValues>('import-token', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      chain: tokenInfo?.originChain || '',
      selectedTokenType: getTokenType(tokenInfo?.originChain || '', chainInfoMap),
      symbol: tokenInfo?.symbol || '',
      decimals: tokenInfo ? String(tokenInfo?.decimals) : '',
      tokenName: tokenInfo ? String(tokenInfo?.name) : '',
      contractAddress: tokenInfo?.contractAddress || '',
    },
  });

  const {
    chain,
    selectedTokenType: selectedTokenTypeData,
    contractAddress,
    symbol,
    decimals,
    tokenName,
  } = {
    ...useWatch<ImportTokenFormValues>({ control }),
    ...getValues(),
  };

  const onSubmit = () => {
    if (!contractAddress || !chain || !decimals || !symbol || !selectedTokenTypeData) {
      return;
    }

    setBusy(true);

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
      name: tokenName,
      symbol,
      decimals: parseInt(decimals),
      priceId: null,
      minAmount: null,
      assetType: selectedTokenTypeData as _AssetType,
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
          toast.show(i18n.errorMessage.occurredError, { type: 'danger' });
          setBusy(false);
        }
      })
      .catch(() => {
        toast.show(i18n.errorMessage.occurredError, { type: 'danger' });
        setBusy(false);
      });
  };

  const tokenTypeRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();
  const tokenTypeOptions = useMemo(() => {
    return getTokenTypeSupported(chainInfoMap[chain]);
  }, [chainInfoMap, chain]);
  const chainNetworkPrefix = useGetChainPrefixBySlug(chain);

  const contractAddressRules = useMemo(
    () => ({
      validate: (value: string): Promise<ValidateResult> => {
        const isValidEvmContract =
          [_AssetType.ERC20].includes(selectedTokenTypeData as _AssetType) && isEthereumAddress(value);
        const isValidWasmContract =
          [_AssetType.PSP22].includes(selectedTokenTypeData as _AssetType) && isValidSubstrateAddress(value);
        const reformattedAddress = reformatAddress(value, chainNetworkPrefix);
        if (value !== '') {
          if (isValidEvmContract || isValidWasmContract) {
            return validateCustomToken({
              contractAddress: reformattedAddress,
              originChain: chain,
              type: selectedTokenTypeData as _AssetType,
            })
              .then(resp => {
                if (resp.isExist) {
                  setIsValidContract(false);
                  return Promise.resolve(i18n.errorMessage.tokenAlreadyAdded);
                }

                if (resp.contractError) {
                  setIsValidContract(false);
                  return Promise.resolve(i18n.errorMessage.invalidContractForSelectedChain);
                }

                if (!resp.isExist && !resp.contractError) {
                  setValue('symbol', resp.symbol);
                  setValue('decimals', String(resp.decimals));
                  setValue('tokenName', resp.name);
                  setIsValidContract(true);
                  return Promise.resolve(undefined);
                }
              })
              .catch(() => {
                setValue('symbol', '');
                setValue('decimals', '');
                setValue('tokenName', '');
                setIsValidContract(false);
                return Promise.resolve(i18n.errorMessage.invalidContractForSelectedChain);
              });
          } else {
            setValue('symbol', '');
            setValue('decimals', '');
            setValue('tokenName', '');
            setIsValidContract(false);
            return Promise.resolve(i18n.errorMessage.invalidContractForSelectedChain);
          }
        } else {
          setValue('symbol', '');
          setValue('decimals', '');
          setValue('tokenName', '');
          setIsValidContract(false);
          return Promise.resolve(i18n.warningMessage.requireMessage);
        }
      },
    }),
    [selectedTokenTypeData, chainNetworkPrefix, chain, setValue],
  );

  const onSelectTokenType = useCallback(
    (item: AssetTypeOption) => {
      setValue('selectedTokenType', item.value);
      tokenTypeRef && tokenTypeRef.current?.onCloseModal();
    },
    [setValue],
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

  useEffect(() => {
    if (chain && dirtyFields.contractAddress) {
      addLazy(
        'trigger-validate-import-token',
        () => {
          trigger('contractAddress');
        },
        100,
      );
    }

    return () => {
      removeLazy('trigger-validate-import-token');
    };
  }, [chain, dirtyFields.contractAddress, trigger]);

  const reValidate = () => trigger('contractAddress');

  const addTokenButtonDisabled =
    !contractAddress || !!errors.contractAddress || !symbol || !decimals || !isNetConnected || !isReady || isBusy;

  return (
    <ContainerWithSubHeader onPressBack={_goBack} title={title} disabled={isBusy}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding, paddingTop: 16 }}>
        <ScrollView style={{ width: '100%', flex: 1 }} keyboardShouldPersistTaps={'handled'}>
          <ChainSelector
            items={Object.values(chainInfoMap)}
            selectedValueMap={{ [chain]: true }}
            chainSelectorRef={chainSelectorRef}
            onSelectItem={item => {
              setChain(item.slug);
              setValue('selectedTokenType', getTokenType(item.slug, chainInfoMap));
              setValue('tokenName', '');
              chainSelectorRef && chainSelectorRef.current?.onCloseModal();
            }}
            renderSelected={() => (
              <NetworkField
                networkKey={chain}
                label={i18n.common.network}
                placeholder={i18n.placeholder.searchNetwork}
                showIcon
              />
            )}
          />

          <TokenTypeSelector
            disabled={!!chain || !tokenTypeOptions.length}
            items={tokenTypeOptions}
            onSelectItem={onSelectTokenType}
            selectedValueMap={selectedTokenTypeData ? { [selectedTokenTypeData]: true } : {}}
            tokenTypeRef={tokenTypeRef}
            renderSelected={() => <TokenTypeSelectField value={selectedTokenTypeData} showIcon />}
          />

          <FormItem
            style={{ marginBottom: 8 }}
            control={control}
            rules={contractAddressRules}
            render={({ field: { value, onChange, ref, onBlur } }) => (
              <InputAddress
                ref={ref}
                label={i18n.importToken.contractAddress}
                value={value}
                onChangeText={onChange}
                placeholder={i18n.placeholder.typeOrPasteContractAddress}
                disabled={!chain}
                isValidValue={isValidContract}
                reValidate={reValidate}
                onSideEffectChange={onBlur}
              />
            )}
            name={'contractAddress'}
          />

          <View style={styles.row}>
            <TextField outerStyle={{ flex: 1, marginBottom: 0 }} placeholder={i18n.placeholder.symbol} text={symbol} />

            <TextField
              outerStyle={{ flex: 1, marginBottom: 0 }}
              placeholder={i18n.placeholder.decimals}
              disabled={true}
              text={decimals}
            />
          </View>

          <TextField placeholder={'Token name'} disabled={true} text={tokenName} />

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}

          {!isReady && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.webRunnerDeadMessage} />
          )}

          {chain && !checkChainConnected(chain) && (
            <>
              <AlertBox
                type={'warning'}
                title={i18n.warningTitle.updateNetwork}
                description={i18n.warningMessage.enableNetworkMessage}
              />

              <Button
                icon={iconColor => <Icon phosphorIcon={Plus} size={'lg'} iconColor={iconColor} weight={'bold'} />}
                style={{ marginTop: 8 }}
                onPress={() => showPopupEnableChain(chain)}
                type={'ghost'}>
                {i18n.buttonTitles.enableNetwork}
              </Button>
            </>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', paddingTop: 27, ...MarginBottomForSubmitButton }}>
          <Button disabled={isBusy} type={'secondary'} style={{ flex: 1, marginRight: 6 }} onPress={_goBack}>
            {i18n.common.cancel}
          </Button>
          <Button
            disabled={addTokenButtonDisabled}
            loading={isBusy}
            style={{ flex: 1, marginLeft: 6 }}
            onPress={onSubmit}>
            {i18n.common.addToken}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.sizeSM,
      marginBottom: theme.marginXS,
    },
  });
}
