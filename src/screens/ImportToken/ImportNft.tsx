import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import InputText from 'components/Input/InputText';
import useGetContractSupportedChains from 'hooks/screen/ImportNft/useGetContractSupportedChains';
import useFormControl from 'hooks/screen/useFormControl';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { upsertCustomToken, validateCustomToken } from '../../messaging';
import { ImportNftProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { CustomToken, CustomTokenType } from '@subwallet/extension-base/background/KoniTypes';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { InputAddress } from 'components/Input/InputAddress';
import { Warning } from 'components/Warning';
import { NetworkField } from 'components/Field/Network';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { ChainSelect } from 'screens/ImportToken/ChainSelect';
import { SubmitButton } from 'components/SubmitButton';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { WebRunnerContext } from 'providers/contexts';

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
};

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  marginTop: 10,
};

const ImportNft = ({ route: { params: routeParams } }: ImportNftProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const { currentAccountAddress } = useSelector((state: RootState) => state.accountState);
  const chainOptions = useGetContractSupportedChains();
  const payload = routeParams?.payload;
  const nftInfo = payload?.payload;
  const formConfig = {
    smartContract: {
      require: true,
      name: i18n.importEvmNft.smartContract,
      value: nftInfo?.smartContract || '',
    },
    chain: {
      require: true,
      name: i18n.common.network,
      value: nftInfo?.chain || chainOptions[0]?.value || '',
    },
    collectionName: {
      require: true,
      name: i18n.importEvmNft.nftCollectionName,
      value: nftInfo?.name || '',
    },
  };
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  const [isShowChainModal, setShowChainModal] = useState<boolean>(false);
  useHandlerHardwareBackPress(loading);
  const { isNetConnected, isReady } = useContext(WebRunnerContext);
  const onBack = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);
  const { formState, onChangeValue, onUpdateErrors } = useFormControl(formConfig, {});
  const { data: formData } = formState;
  const { chain, smartContract, collectionName } = formData;
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

  const handleAddToken = useCallback(() => {
    setLoading(true);
    const customToken = {
      smartContract: smartContract,
      chain,
      type: 'erc721',
      isCustom: true,
    } as CustomToken;

    if (collectionName) {
      customToken.name = collectionName;
    }

    if (!isNetConnected) {
      setLoading(false);
      return;
    }
    upsertCustomToken(customToken)
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
  }, [chain, collectionName, isNetConnected, onBack, onUpdateErrors, smartContract]);

  useEffect(() => {
    let unamount = false;
    if (smartContract !== '') {
      let tokenType: CustomTokenType | undefined; // set token type
      const isValidContractCaller = isValidSubstrateAddress(currentAccountAddress);

      if (isEthereumAddress(smartContract)) {
        tokenType = CustomTokenType.erc721;
      } else if (isValidSubstrateAddress(smartContract)) {
        tokenType = CustomTokenType.psp34;
      }

      if (!tokenType) {
        onUpdateErrors('smartContract')([i18n.errorMessage.invalidEvmContractAddress]);
      } else {
        setChecking(true);
        validateCustomToken({
          smartContract: smartContract,
          chain,
          type: tokenType,
          contractCaller: isValidContractCaller ? currentAccountAddress : undefined,
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
                onChangeValue('collectionName')(resp.name);
                onUpdateErrors('smartContract')(undefined);
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
  }, [chain, currentAccountAddress, onChangeValue, onUpdateErrors, smartContract]);

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
      style={ContainerHeaderStyle}
      isShowPlaceHolder={false}>
      <View style={WrapperStyle}>
        <InputAddress
          containerStyle={{ marginBottom: 8 }}
          ref={formState.refs.smartContract}
          label={formState.labels.smartContract}
          value={smartContract}
          onPressQrButton={onPressQrButton}
          onChange={(output: string | null, currentValue: string) => {
            handleChangeValue('smartContract')(currentValue);
          }}
        />

        {isReady &&
          !!formState.errors.smartContract.length &&
          formState.errors.smartContract.map(err => (
            <Warning key={err} style={{ marginBottom: 8 }} isDanger message={err} />
          ))}

        <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setShowChainModal(true)}>
          <NetworkField networkKey={formState.data.chain} label={formState.labels.chain} />
        </TouchableOpacity>

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

        <InputText
          ref={formState.refs.collectionName}
          label={formState.labels.collectionName}
          onChangeText={handleChangeValue('collectionName')}
          errorMessages={formState.errors.collectionName}
          value={collectionName}
        />

        {!isNetConnected && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
        )}

        {!isReady && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.webRunnerDeadMessage} />
        )}

        <SubmitButton
          isBusy={loading}
          title={i18n.importEvmNft.importNft}
          activeOpacity={BUTTON_ACTIVE_OPACITY}
          onPress={handleAddToken}
          disabled={isDisableAddNFT || !isNetConnected || !isReady}
        />

        <AddressScanner
          qrModalVisible={isShowQrModalVisible}
          onPressCancel={() => setShowQrModalVisible(false)}
          onChangeAddress={(text: string) => onUpdateNftContractAddress(text)}
          networkKey={chain || 'default'}
          token={'contract'}
          scanMessage={i18n.common.toImportNFT}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ImportNft);
