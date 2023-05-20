import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import InputText from 'components/Input/InputText';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { upsertCustomToken, validateCustomToken } from 'messaging/index';
import { ImportNftProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { InputAddress } from 'components/Input/InputAddress';
import { Warning } from 'components/Warning';
import { NetworkField } from 'components/Field/Network';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { ChainSelect } from 'screens/ImportToken/ChainSelect';
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
import { Button } from 'components/design-system-ui';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { TokenTypeSelector } from 'components/Modal/common/TokenTypeSelector';

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
};

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  marginTop: 10,
  flex: 1,
};

export interface NftTypeOption {
  label: string;
  value: _AssetType;
}

function getNftTypeSupported(chainInfo: _ChainInfo) {
  if (!chainInfo) {
    return [];
  }

  const nftTypes = _getNftTypesSupportedByChain(chainInfo);
  const result: NftTypeOption[] = [];

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
  const [isShowChainModal, setShowChainModal] = useState<boolean>(false);
  const [isShowTokenTypeModal, setShowTokenTypeModal] = useState<boolean>(false);
  useHandlerHardwareBackPress(loading);
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
      name: i18n.importEvmNft.smartContract,
      value: nftInfo?.contractAddress || '',
    },
    chain: {
      require: true,
      name: i18n.common.network,
      value: nftInfo?.originChain || '',
    },
    selectedNftType: {
      name: i18n.importEvmNft.nftType,
      value: getNftType(nftInfo?.originChain || '', chainInfoMap),
    },
    collectionName: {
      require: true,
      name: i18n.importEvmNft.nftCollectionName,
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
          onUpdateErrors('smartContract')([i18n.common.addNftSuccess]);
          onBack();
        } else {
          onUpdateErrors('smartContract')([i18n.errorMessage.occurredError]);
        }
        setLoading(false);
      })
      .catch(() => {
        onUpdateErrors('smartContract')([i18n.errorMessage.occurredError]);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const { formState, onChangeValue, onUpdateErrors, onSubmitField } = useFormControl(formConfig, {
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
        onChangeValue(key)(text);
      };
    },
    [onChangeValue, onUpdateErrors],
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

  const onUpdateNftContractAddress = (text: string) => {
    if (formState.refs.smartContract && formState.refs.smartContract.current) {
      // @ts-ignore
      formState.refs.smartContract.current.onChange(text);
    }
  };

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={onBack}
      disabled={loading}
      title={i18n.title.importNft}
      style={ContainerHeaderStyle}>
      <ScrollView style={WrapperStyle}>
        <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setShowChainModal(true)}>
          <NetworkField
            networkKey={formState.data.chain}
            label={formState.labels.chain}
            placeholder={'Select network'}
            showIcon
          />
        </TouchableOpacity>

        <TokenTypeSelector
          modalVisible={isShowTokenTypeModal}
          items={nftTypeOptions}
          selectedValue={selectedNftType}
          onPress={() => setShowTokenTypeModal(true)}
          onChangeModalVisible={() => setShowTokenTypeModal(false)}
        />

        <InputAddress
          containerStyle={{ marginBottom: 8 }}
          ref={formState.refs.smartContract}
          label={formState.labels.smartContract}
          value={smartContract}
          onPressQrButton={onPressQrButton}
          onChange={(output: string | null, currentValue: string) => {
            handleChangeValue('smartContract')(currentValue);
          }}
          placeholder={'Please type or paste an address'}
        />

        {isReady &&
          !!formState.errors.smartContract.length &&
          formState.errors.smartContract.map(err => (
            <Warning key={err} style={{ marginBottom: 8 }} isDanger message={err} />
          ))}

        <ChainSelect
          items={chainOptions}
          modalVisible={isShowChainModal}
          onChangeModalVisible={() => setShowChainModal(false)}
          onChangeValue={(text: string) => {
            handleChangeValue('chain')(text);
            handleChangeValue('selectedNftType')(getNftType(text, chainInfoMap));
            setShowChainModal(false);
          }}
          selectedItem={formState.data.chain}
        />

        <InputText
          ref={formState.refs.collectionName}
          label={formState.labels.collectionName}
          onChangeText={handleChangeValue('collectionName')}
          errorMessages={formState.errors.collectionName}
          value={collectionName}
          onSubmitField={onSubmitField('collectionName')}
        />

        {!isNetConnected && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
        )}

        {!isReady && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.webRunnerDeadMessage} />
        )}

        <AddressScanner
          qrModalVisible={isShowQrModalVisible}
          onPressCancel={() => setShowQrModalVisible(false)}
          onChangeAddress={(text: string) => onUpdateNftContractAddress(text)}
          networkKey={chain || 'default'}
          token={'contract'}
          scanMessage={i18n.common.toImportNFT}
        />
      </ScrollView>

      <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, paddingTop: 16 }}>
        <Button
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
