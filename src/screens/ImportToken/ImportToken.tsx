import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ImportTokenProps, RootNavigationProps } from 'routes/index';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { NetworkField } from 'components/Field/Network';
import { TextField } from 'components/Field/Text';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { completeConfirmation, upsertCustomToken, validateCustomToken } from 'messaging/index';
import { Warning } from 'components/Warning';
import { InputAddress } from 'components/Input/InputAddress';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { addLazy, isValidSubstrateAddress, reformatAddress, removeLazy } from '@subwallet/extension-base/utils';
import { WebRunnerContext } from 'providers/contexts';
import { _AssetType, _ChainInfo } from '@subwallet/chain-list/types';
import {
  _getTokenTypesSupportedByChain,
  _isChainTestNet,
  _parseMetadataForAssetId,
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
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import InputText from 'components/Input/InputText';
import useGetFungibleContractSupportedChains from 'hooks/screen/ImportNft/useGetFungibleContractSupportedChains';
import { reformatContractAddress } from 'utils/account/reformatContractAddress';

export interface ImportTokenFormValues extends TransactionFormValues {
  selectedTokenType: string;
  symbol: string;
  decimals: string;
  tokenName: string;
  priceId: string;
  contractAddress: string;
  assetId?: string;
}

interface TokenTypeOption {
  label: string;
  value: _AssetType;
}

function isAssetHubChain(chainslug: string) {
  return ['statemint', 'statemine'].includes(chainslug);
}

function getTokenTypeSupported(chainInfo: _ChainInfo) {
  if (!chainInfo) {
    return [];
  }

  const tokenTypes = _getTokenTypesSupportedByChain(chainInfo);
  const result: TokenTypeOption[] = [];

  tokenTypes.forEach(tokenType => {
    if (tokenType !== _AssetType.GRC20) {
      result.push({
        label: tokenType.toString(),
        value: tokenType,
      });
    }
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
  const chainInfoMap = useGetFungibleContractSupportedChains();
  const [isBusy, setBusy] = useState<boolean>(false);
  const toast = useToast();
  useHandlerHardwareBackPress(isBusy);
  const payload = routeParams?.payload;
  const tokenInfo = payload?.payload;
  const { isNetConnected, isReady } = useContext(WebRunnerContext);
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [isValidContract, setIsValidContract] = useState<boolean>(true);
  const [isValidAssetId, setIsValidAssetId] = useState<boolean>(true);
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
      priceId: '',
    },
  });

  const {
    chain,
    selectedTokenType: selectedTokenTypeData,
    contractAddress,
    symbol,
    decimals,
    tokenName,
    priceId,
    assetId,
  } = {
    ...useWatch<ImportTokenFormValues>({ control }),
    ...getValues(),
  };

  const onSubmit = () => {
    if (!contractAddress || !chain || !decimals || !symbol || !selectedTokenTypeData) {
      return;
    }

    const reformattedAddress =
      selectedTokenTypeData === _AssetType.VFT ? contractAddress : reformatAddress(contractAddress, chainNetworkPrefix);

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
      priceId: priceId,
      minAmount: null,
      assetType: selectedTokenTypeData as _AssetType,
      metadata: _parseMetadataForSmartContractAsset(reformattedAddress),
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

  const onSubmitAssetHub = () => {
    if (assetId) {
      setBusy(true);

      upsertCustomToken({
        originChain: chain,
        slug: '',
        name: tokenName || symbol,
        symbol,
        decimals: parseInt(decimals),
        priceId: priceId || null,
        minAmount: null,
        assetType: selectedTokenTypeData as _AssetType,
        metadata: _parseMetadataForAssetId(assetId),
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
    }
  };

  const tokenTypeRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();
  const tokenTypeOptions = useMemo(() => {
    return getTokenTypeSupported(chainInfoMap[chain]);
  }, [chainInfoMap, chain]);
  const chainNetworkPrefix = useGetChainPrefixBySlug(chain);

  const isSelectGearToken = useMemo(() => {
    return selectedTokenTypeData === _AssetType.VFT;
  }, [selectedTokenTypeData]);

  const contractAddressRules = useMemo(
    () => ({
      onChange: (event: { target: { value: string } }) => {
        const transformValue = reformatContractAddress(chain, event.target.value);
        setValue('contractAddress', transformValue);
      },
      validate: (value: string): Promise<ValidateResult> => {
        const isValidEvmContract =
          [_AssetType.ERC20].includes(selectedTokenTypeData as _AssetType) && isEthereumAddress(value);
        const isValidWasmContract =
          [_AssetType.PSP22].includes(selectedTokenTypeData as _AssetType) && isValidSubstrateAddress(value);
        const isValidGearContract =
          [_AssetType.VFT].includes(selectedTokenTypeData as _AssetType) && isValidSubstrateAddress(value);
        const reformattedAddress = isValidGearContract ? value : reformatAddress(value, chainNetworkPrefix);

        if (value !== '') {
          if (isValidEvmContract || isValidWasmContract || isValidGearContract) {
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

  const assetIdRules = useMemo(
    () => ({
      validate: (value: string): Promise<ValidateResult> => {
        return validateCustomToken({
          originChain: chain,
          type: selectedTokenTypeData as _AssetType,
          assetId: value,
        })
          .then(resp => {
            if (resp.isExist) {
              setIsValidAssetId(false);
              return Promise.resolve('Existed token');
            }

            if (resp.contractError) {
              setIsValidAssetId(false);
              return Promise.resolve('Invalid asset ID');
            }

            if (!resp.isExist && !resp.contractError) {
              setValue('tokenName', resp.name);
              setValue('decimals', String(resp.decimals));
              setValue('symbol', resp.symbol);
              setIsValidAssetId(true);
              return Promise.resolve(undefined);
            }
          })
          .catch(() => {
            setIsValidAssetId(false);
            return Promise.resolve('Error validating this token');
          });
      },
    }),
    [chain, selectedTokenTypeData, setValue],
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
    if (chain) {
      if (!isAssetHubChain(chain)) {
        dirtyFields.contractAddress &&
          addLazy(
            'trigger-validate-import-token',
            () => {
              trigger('contractAddress');
            },
            100,
          );
      } else {
        dirtyFields.assetId &&
          addLazy(
            'trigger-validate-import-token',
            () => {
              trigger('assetId');
            },
            100,
          );
      }
    }

    return () => {
      removeLazy('trigger-validate-import-token');
    };
  }, [chain, dirtyFields.assetId, dirtyFields.contractAddress, trigger]);

  const reValidateContractAddress = () => trigger('contractAddress');
  const reValidateAssetId = () => trigger('assetId');

  const addTokenButtonDisabled = useMemo(() => {
    if (isAssetHubChain(chain)) {
      return !symbol || !decimals || !isNetConnected || !isReady || isBusy || !!errors.assetId;
    } else {
      return (
        !contractAddress ||
        !!errors.contractAddress ||
        !symbol ||
        !decimals ||
        !isNetConnected ||
        !isReady ||
        isBusy ||
        !!errors.assetId
      );
    }
  }, [
    chain,
    contractAddress,
    decimals,
    errors.assetId,
    errors.contractAddress,
    isBusy,
    isNetConnected,
    isReady,
    symbol,
  ]);

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
              setValue('assetId', '');
              setValue('contractAddress', '');
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

          {!isAssetHubChain(chain) && (
            <FormItem
              style={{ marginBottom: 8 }}
              control={control}
              rules={contractAddressRules}
              render={({ field: { value, onChange, ref, onBlur } }) => (
                <InputAddress
                  ref={ref}
                  label={isSelectGearToken ? 'Program ID' : i18n.importToken.contractAddress}
                  value={value}
                  onChangeText={onChange}
                  placeholder={i18n.placeholder.typeOrPasteContractAddress}
                  disabled={!chain}
                  isValidValue={isValidContract}
                  reValidate={reValidateContractAddress}
                  onSideEffectChange={onBlur}
                />
              )}
              name={'contractAddress'}
            />
          )}

          {isAssetHubChain(chain) && (
            <FormItem
              style={{ marginBottom: 8 }}
              control={control}
              rules={assetIdRules}
              render={({ field: { value, onChange, ref, onBlur } }) => (
                <InputAddress
                  ref={ref}
                  label={'Asset ID'}
                  value={value}
                  onChangeText={onChange}
                  placeholder={'Please type or paste an asset'}
                  disabled={!selectedTokenTypeData}
                  isValidValue={isValidAssetId}
                  reValidate={reValidateAssetId}
                  onSideEffectChange={onBlur}
                />
              )}
              name={'assetId'}
            />
          )}

          <View style={styles.row}>
            <TextField outerStyle={{ flex: 1, marginBottom: 0 }} placeholder={i18n.placeholder.symbol} text={symbol} />

            <TextField
              outerStyle={{ flex: 1, marginBottom: 0 }}
              placeholder={i18n.placeholder.decimals}
              disabled={true}
              text={decimals === '-1' ? '' : decimals}
            />
          </View>

          <TextField placeholder={'Token name'} disabled={true} text={tokenName} />

          <FormItem
            style={{ marginBottom: 8 }}
            control={control}
            render={({ field: { value, onChange, ref } }) => (
              <InputText
                isBusy={addTokenButtonDisabled}
                containerStyle={{ flex: 1, marginRight: 6 }}
                placeholder={i18n.placeholder.priceId}
                ref={ref}
                value={value}
                onSubmitField={!addTokenButtonDisabled ? onSubmit : undefined}
                onChangeText={onChange}
                readonly
              />
            )}
            name={'priceId'}
          />

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
            onPress={!isAssetHubChain(chain) ? onSubmit : onSubmitAssetHub}>
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
