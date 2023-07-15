import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import InputText from 'components/Input/InputText';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import { FormState } from 'hooks/screen/useFormControl';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { upsertCustomToken, validateCustomToken } from 'messaging/index';
import { ImportNftProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { InputAddress } from 'components/Input/InputAddress';
import { Warning } from 'components/Warning';
import { NetworkField } from 'components/Field/Network';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
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
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import AlertBox from 'components/design-system-ui/alert-box';
import { ModalRef } from 'types/modalRef';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { ChainSelector } from 'components/Modal/common/ChainSelector';

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

const ImportNft = ({ route: { params: routeParams } }: ImportNftProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useGetContractSupportedChains();
  const payload = routeParams?.payload;
  const nftInfo = payload?.payload;
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const tokenTypeRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();
  useHandlerHardwareBackPress(loading);
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const { isNetConnected, isReady } = useContext(WebRunnerContext);
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

  const formConfig = {
    smartContract: {
      require: true,
      name: i18n.inputLabel.contractAddress,
      value: nftInfo?.contractAddress || '',
    },
    chain: {
      require: true,
      name: i18n.inputLabel.network,
      value: nftInfo?.originChain || '',
    },
    selectedNftType: {
      name: i18n.importEvmNft.nftType,
      value: getNftType(nftInfo?.originChain || '', chainInfoMap),
    },
    collectionName: {
      require: true,
      name: i18n.inputLabel.nftCollectionName,
      value: nftInfo?.name || '',
    },
  };

  const handleAddToken = (formState: FormState) => {
    const { chain, smartContract, collectionName, selectedNftType } = formState.data;
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
          toast.hideAll();
          toast.show(i18n.common.addNftSuccess, { type: 'success' });
          onBack();
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

  const {
    formState,
    onChangeValue,
    onChangeChainValue,
    onUpdateErrors,
    onSubmitField,
    showPopupEnableChain,
    checkChainConnected,
  } = useTransaction('import-nft', formConfig, {
    onSubmitForm: handleAddToken,
  });

  const { data: formData } = formState;
  const { chain, smartContract, collectionName, selectedNftType } = formData;

  const nftTypeOptions = useMemo(() => {
    return getNftTypeSupported(chainInfoMap[chain]);
  }, [chainInfoMap, chain]);

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

  const onPressQrButton = async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setShowQrModalVisible(true);
    }
  };

  useEffect(() => {
    let unamount = false;
    if (smartContract !== '') {
      const isValidEvmContract =
        [_AssetType.ERC721].includes(selectedNftType as _AssetType) && isEthereumAddress(smartContract);
      const isValidWasmContract =
        [_AssetType.PSP34].includes(selectedNftType as _AssetType) && isValidSubstrateAddress(smartContract);

      if (!(isValidEvmContract || isValidWasmContract)) {
        onUpdateErrors('smartContract')([i18n.errorMessage.invalidContractForSelectedChain]);
      } else {
        setChecking(true);
        validateCustomToken({
          contractAddress: smartContract,
          originChain: chain,
          type: selectedNftType as _AssetType,
        })
          .then(resp => {
            if (unamount) {
              return;
            }
            if (resp.isExist) {
              onUpdateErrors('smartContract')([i18n.errorMessage.tokenAlreadyAdded]);
            } else {
              if (resp.contractError) {
                onUpdateErrors('smartContract')([i18n.errorMessage.invalidContractForSelectedChain]);
              } else {
                resp.name && onChangeValue('collectionName')(resp.name);
                onUpdateErrors('smartContract')(undefined);
                setSymbol(resp.symbol);
              }
            }
          })
          .catch(() => {
            if (unamount) {
              return;
            }
            onUpdateErrors('smartContract')([i18n.errorMessage.invalidContractForSelectedChain]);
          })
          .finally(() => {
            if (unamount) {
              return;
            }
            setChecking(false);
          });
      }
    }

    return () => {
      unamount = true;
    };
  }, [chain, onChangeValue, onUpdateErrors, selectedNftType, smartContract]);

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
    !!(formState.errors.smartContract && formState.errors.smartContract.length);

  const onUpdateNftContractAddress = useCallback(
    (text: string) => {
      if (formState.refs.smartContract && formState.refs.smartContract.current) {
        // @ts-ignore
        formState.refs.smartContract.current.onChange(text);
      }
    },
    [formState.refs.smartContract],
  );

  const onSelectNFTType = useCallback(
    (item: AssetTypeOption) => {
      onChangeValue('selectedNftType')(item.value);
      tokenTypeRef && tokenTypeRef.current?.onCloseModal();
    },
    [onChangeValue],
  );

  const getSubmitIconBtn = (color: string) => {
    return <Icon phosphorIcon={PlusCircle} size={'lg'} weight={'fill'} iconColor={color} />;
  };

  const onScanContractAddress = useCallback(
    (data: string) => {
      if (isAddress(data)) {
        setError(undefined);
        setShowQrModalVisible(false);
        onUpdateNftContractAddress(data);
      } else {
        setError(i18n.errorMessage.isNotContractAddress);
      }
    },
    [onUpdateNftContractAddress],
  );

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={onBack}
      disabled={loading}
      title={i18n.title.importNft}
      style={ContainerHeaderStyle}>
      <ScrollView style={WrapperStyle} keyboardShouldPersistTaps={'handled'}>
        <ChainSelector
          items={Object.values(chainInfoMap)}
          selectedValueMap={{ [formState.data.chain]: true }}
          chainSelectorRef={chainSelectorRef}
          renderSelected={() => (
            <NetworkField
              networkKey={formState.data.chain}
              label={formState.labels.chain}
              placeholder={i18n.placeholder.selectNetwork}
              showIcon
            />
          )}
          onSelectItem={item => {
            handleChangeValue('chain')(item.slug);
            handleChangeValue('selectedNftType')(getNftType(item.slug, chainInfoMap));
            chainSelectorRef && chainSelectorRef.current?.onCloseModal();
          }}
        />

        <TokenTypeSelector
          disabled={!formState.data.chain || !nftTypeOptions.length}
          items={nftTypeOptions}
          onSelectItem={onSelectNFTType}
          selectedValueMap={selectedNftType ? { [selectedNftType]: true } : {}}
          tokenTypeRef={tokenTypeRef}
          renderSelected={() => <TokenTypeSelectField value={selectedNftType} showIcon />}
        />

        <InputAddress
          disabled={!formState.data.chain}
          containerStyle={{ marginBottom: 8 }}
          ref={formState.refs.smartContract}
          label={formState.labels.smartContract}
          value={smartContract}
          onPressQrButton={onPressQrButton}
          onChange={(output: string | null, currentValue: string) => {
            handleChangeValue('smartContract')(currentValue);
          }}
          placeholder={i18n.placeholder.enterOrPasteAnAddress}
        />

        {isReady &&
          !!formState.errors.smartContract.length &&
          formState.errors.smartContract.map(err => (
            <Warning key={err} style={{ marginBottom: 8 }} isDanger message={err} />
          ))}

        <InputText
          ref={formState.refs.collectionName}
          label={formState.labels.collectionName}
          onChangeText={handleChangeValue('collectionName')}
          errorMessages={formState.errors.collectionName}
          value={collectionName}
          onSubmitField={
            formState.isValidated.smartContract ? onSubmitField('collectionName') : () => Keyboard.dismiss()
          }
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

      <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, paddingTop: 16 }}>
        <Button
          icon={getSubmitIconBtn(
            isDisableAddNFT || !isNetConnected || !isReady || loading ? theme.colorTextLight5 : theme.colorWhite,
          )}
          loading={loading}
          onPress={() => handleAddToken(formState)}
          disabled={isDisableAddNFT || !isNetConnected || !isReady || loading}>
          {i18n.importEvmNft.importNft}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ImportNft);
