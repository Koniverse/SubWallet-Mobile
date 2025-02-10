import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import InputText from 'components/Input/InputText';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { upsertCustomToken, validateCustomToken } from 'messaging/index';
import { ImportNftProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { InputAddress } from 'components/Input/InputAddress';
import { Warning } from 'components/Warning';
import { NetworkField } from 'components/Field/Network';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { addLazy, isValidSubstrateAddress, removeLazy } from '@subwallet/extension-base/utils';
import { WebRunnerContext } from 'providers/contexts';
import {
  _getNftTypesSupportedByChain,
  _isChainTestNet,
  _parseMetadataForSmartContractAsset,
} from '@subwallet/extension-base/services/chain-service/utils';
import { _AssetType, _ChainInfo } from '@subwallet/chain-list/types';
import { Button, Icon } from 'components/design-system-ui';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { TokenTypeSelector } from 'components/Modal/common/TokenTypeSelector';
import { AssetTypeOption } from 'types/asset';
import { Plus, PlusCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { ModalRef } from 'types/modalRef';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { FormItem } from 'components/common/FormItem';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import useGetNftContractSupportedChains from 'hooks/screen/ImportNft/useGetNftContractSupportedChains';
import { reformatContractAddress } from 'utils/account/reformatContractAddress';

interface ImportNftFormValues extends TransactionFormValues {
  smartContract: string;
  selectedNftType: string;
  collectionName: string;
}

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
};

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  marginTop: 10,
  flex: 1,
};

function getNftTypeSupported(chainInfo: _ChainInfo) {
  if (!chainInfo) {
    return [];
  }

  const nftTypes = _getNftTypesSupportedByChain(chainInfo);
  const result: AssetTypeOption[] = [];

  nftTypes.forEach(nftType => {
    result.push({
      label: nftType.toString(),
      value: nftType,
    });
  });

  return result;
}

function getNftType(chain: string, chainInfoMap: Record<string, _ChainInfo>): string {
  if (!chain || !chainInfoMap[chain]) {
    return '';
  }

  const nftTypes = getNftTypeSupported(chainInfoMap[chain]);

  if (nftTypes.length === 1) {
    return nftTypes[0].value;
  }

  // todo: may handle case nftTypes.length > 1 in near future

  return '';
}

export const ImportNft = ({ route: { params: routeParams } }: ImportNftProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useGetNftContractSupportedChains();
  const payload = routeParams?.payload;
  const nftInfo = payload?.payload;
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isValidContract, setIsValidContract] = useState<boolean>(true);
  const tokenTypeRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();
  useHandlerHardwareBackPress(loading);
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const { isNetConnected, isReady, reload } = useContext(WebRunnerContext);
  const onBack = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);
  const chainOptions = useMemo(() => {
    return Object.values(chainInfoMap).map(item => ({
      value: item.slug,
      label: item.name,
    }));
  }, [chainInfoMap]);
  const [symbol, setSymbol] = useState<string>('');
  const symbolRef = useRef<string>('');

  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  const {
    title,
    form: {
      control,
      getValues,
      setValue,
      trigger,
      formState: { errors, dirtyFields },
    },
    onChangeChainValue: setChain,
    showPopupEnableChain,
    checkChainConnected,
  } = useTransaction<ImportNftFormValues>('import-nft', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      smartContract: nftInfo?.contractAddress || '',
      chain: nftInfo?.originChain || '',
      selectedNftType: getNftType(nftInfo?.originChain || '', chainInfoMap),
      collectionName: nftInfo?.name || '',
    },
  });

  const { chain, smartContract, collectionName, selectedNftType } = {
    ...useWatch<ImportNftFormValues>({ control }),
    ...getValues(),
  };

  const handleAddToken = () => {
    const _symbol = symbolRef.current;
    setLoading(true);
    if (!isNetConnected) {
      setLoading(false);
      return;
    }

    const formattedCollectionName = collectionName.replace(/ /g, '').toUpperCase();

    upsertCustomToken({
      originChain: chain,
      slug: '',
      name: collectionName,
      symbol: _symbol !== '' ? _symbol : formattedCollectionName,
      decimals: null,
      priceId: null,
      minAmount: null,
      assetType: selectedNftType as _AssetType,
      metadata: _parseMetadataForSmartContractAsset(smartContract),
      multiChainAsset: null,
      hasValue: _isChainTestNet(chainInfoMap[chain]),
      icon: '',
    })
      .then(resp => {
        if (resp) {
          if (resp.error === 'incompatibleNFT') {
            toast.hideAll();
            toast.show('Failed to import. Incompatible NFT', { type: 'danger' });
          } else if (resp.success) {
            toast.hideAll();
            toast.show(i18n.common.addNftSuccess, { type: 'success' });
            onBack();
            if (reload) {
              reload();
            }
          } else {
            toast.hideAll();
            toast.show(i18n.errorMessage.occurredError, { type: 'danger' });
          }
        } else {
          toast.hideAll();
          toast.show(i18n.errorMessage.occurredError, { type: 'danger' });
        }
        setLoading(false);
      })
      .catch(() => {
        toast.hideAll();
        toast.show(i18n.errorMessage.occurredError, { type: 'danger' });
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const nftTypeOptions = useMemo(() => {
    return getNftTypeSupported(chainInfoMap[chain]);
  }, [chainInfoMap, chain]);

  const smartContractInputRules = useMemo(
    () => ({
      onChange: (event: { target: { value: string } }) => {
        const transformValue = reformatContractAddress(chain, event.target.value);
        setValue('smartContract', transformValue);
      },
      validate: (value: string): Promise<ValidateResult> => {
        if (value !== '') {
          if (!isAddress(value)) {
            return Promise.resolve(i18n.errorMessage.invalidContractAddress);
          }

          const isValidEvmContract =
            [_AssetType.ERC721].includes(selectedNftType as _AssetType) && isEthereumAddress(value);
          const isValidWasmContract =
            [_AssetType.PSP34].includes(selectedNftType as _AssetType) && isValidSubstrateAddress(value);

          if (!(isValidEvmContract || isValidWasmContract)) {
            return Promise.resolve(i18n.errorMessage.invalidContractForSelectedChain);
          } else {
            setChecking(true);
            return validateCustomToken({
              contractAddress: value,
              originChain: chain,
              type: selectedNftType as _AssetType,
            })
              .then(resp => {
                if (resp.isExist) {
                  setIsValidContract(false);
                  return Promise.resolve(i18n.errorMessage.tokenAlreadyAdded);
                } else {
                  if (resp.contractError) {
                    setIsValidContract(false);
                    return Promise.resolve(i18n.errorMessage.invalidContractForSelectedChain);
                  } else {
                    resp.name && setValue('collectionName', resp.name);
                    setSymbol(resp.symbol);
                    setIsValidContract(true);
                    return Promise.resolve(undefined);
                  }
                }
              })
              .catch(() => {
                setIsValidContract(false);
                return Promise.resolve(i18n.errorMessage.invalidContractForSelectedChain);
              })
              .finally(() => {
                setChecking(false);
              });
          }
        } else {
          return Promise.resolve(i18n.warningMessage.requireMessage);
        }
      },
    }),
    [chain, selectedNftType, setValue],
  );

  useEffect(() => {
    if (collectionName.split(' ').join('') === '') {
      setIsValidName(false);
    } else {
      setIsValidName(true);
    }
  }, [collectionName]);

  const isDisableAddNFT =
    !isValidName ||
    smartContract === '' ||
    collectionName === '' ||
    chainOptions.length === 0 ||
    checking ||
    loading ||
    !!errors.smartContract;

  const onSelectNFTType = useCallback(
    (item: AssetTypeOption) => {
      setValue('selectedNftType', item.value);
      tokenTypeRef && tokenTypeRef.current?.onCloseModal();
    },
    [setValue],
  );

  const getSubmitIconBtn = (color: string) => {
    return <Icon phosphorIcon={PlusCircle} size={'lg'} weight={'fill'} iconColor={color} />;
  };

  useEffect(() => {
    if (chain && dirtyFields.smartContract) {
      addLazy(
        'trigger-validate-import-nft',
        () => {
          trigger('smartContract');
        },
        100,
      );
    }

    return () => {
      removeLazy('trigger-validate-import-nft');
    };
  }, [chain, dirtyFields.smartContract, trigger]);

  const reValidate = () => trigger('smartContract');

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={onBack}
      disabled={loading}
      title={title}
      style={ContainerHeaderStyle}>
      <ScrollView style={WrapperStyle} keyboardShouldPersistTaps={'handled'}>
        <ChainSelector
          items={Object.values(chainInfoMap)}
          selectedValueMap={{ [chain]: true }}
          chainSelectorRef={chainSelectorRef}
          renderSelected={() => (
            <NetworkField
              networkKey={chain}
              label={i18n.inputLabel.network}
              placeholder={i18n.placeholder.selectNetwork}
              showIcon
            />
          )}
          onSelectItem={item => {
            setChain(item.slug);
            setValue('selectedNftType', getNftType(item.slug, chainInfoMap));
            chainSelectorRef && chainSelectorRef.current?.onCloseModal();
          }}
        />

        <TokenTypeSelector
          disabled={!chain || !nftTypeOptions.length}
          items={nftTypeOptions}
          onSelectItem={onSelectNFTType}
          selectedValueMap={selectedNftType ? { [selectedNftType]: true } : {}}
          tokenTypeRef={tokenTypeRef}
          renderSelected={() => <TokenTypeSelectField value={selectedNftType} showIcon />}
        />

        <FormItem
          style={{ marginBottom: 8 }}
          control={control}
          showError
          rules={smartContractInputRules}
          render={({ field: { value, onChange, ref, onBlur } }) => (
            <InputAddress
              ref={ref}
              label={i18n.inputLabel.contractAddress}
              value={value}
              onChangeText={onChange}
              placeholder={i18n.placeholder.enterOrPasteAnAddress}
              disabled={!chain}
              isValidValue={isValidContract}
              reValidate={reValidate}
              onSideEffectChange={onBlur}
            />
          )}
          name={'smartContract'}
        />

        <FormItem
          control={control}
          render={({ field: { value, ref, onChange } }) => (
            <InputText ref={ref} label={i18n.inputLabel.nftCollectionName} onChangeText={onChange} value={value} />
          )}
          name={'collectionName'}
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

      <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, paddingTop: 16 }}>
        <Button
          icon={getSubmitIconBtn(
            isDisableAddNFT || !isNetConnected || !isReady || loading ? theme.colorTextLight5 : theme.colorWhite,
          )}
          loading={loading}
          onPress={handleAddToken}
          disabled={isDisableAddNFT || !isNetConnected || !isReady || loading}>
          {i18n.importEvmNft.importNft}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};
