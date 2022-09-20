import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import InputText from 'components/Input/InputText';
import useGetActiveEvmChains from 'hooks/screen/ImportNft/useGetActiveEvmChains';
import useFormControl from 'hooks/screen/useFormControl';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { upsertEvmToken, validateEvmToken } from '../../messaging';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { CustomEvmToken } from '@subwallet/extension-base/background/KoniTypes';
import { QrScannerScreen } from 'screens/QrScannerScreen';
import { InputAddress } from 'components/Input/InputAddress';
import { Warning } from 'components/Warning';
import { NetworkField } from 'components/Field/Network';
import { BUTTON_ACTIVE_OPACITY } from '../../constant';
import { ChainSelect } from 'screens/ImportToken/ChainSelect';
import { SubmitButton } from 'components/SubmitButton';

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
};

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  marginTop: 10,
};

const formConfig = {
  smartContract: {
    require: true,
    name: i18n.importEvmNft.smartContract,
    value: '',
  },
  chain: {
    require: true,
    name: i18n.importEvmNft.chain,
    value: '',
  },
  collectionName: {
    require: true,
    name: i18n.importEvmNft.nftCollectionName,
    value: '',
  },
};

const ImportEvmNft = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainOptions = useGetActiveEvmChains();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  const [isShowChainModal, setShowChainModal] = useState<boolean>(false);
  const onBack = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);
  const { formState, onChangeValue, onUpdateErrors } = useFormControl(formConfig, {});
  const { data: formData } = formState;
  const { chain, smartContract, collectionName } = formData;

  const handleChangeValue = useCallback(
    (key: string) => {
      return (text: string) => {
        onUpdateErrors('smartContract')(undefined);
        onChangeValue(key)(text);
      };
    },
    [onChangeValue, onUpdateErrors],
  );

  const handleAddToken = useCallback(() => {
    setLoading(true);
    const evmToken = {
      smartContract: smartContract,
      chain,
      type: 'erc721',
      isCustom: true,
    } as CustomEvmToken;

    if (collectionName) {
      evmToken.name = collectionName;
    }

    upsertEvmToken(evmToken)
      .then(resp => {
        if (resp) {
          onUpdateErrors('smartContract')(['Successfully added a NFT collection']);
          onBack();
        } else {
          onUpdateErrors('smartContract')(['An error has occurred. Please try again later']);
        }
        setLoading(false);
      })
      .catch(() => {
        onUpdateErrors('smartContract')(['An error has occurred. Please try again later']);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chain, collectionName, onBack, onUpdateErrors, smartContract]);

  useEffect(() => {
    let unamount = false;
    if (smartContract !== '') {
      if (!isEthereumAddress(smartContract)) {
        onUpdateErrors('smartContract')(['Invalid EVM contract address']);
      } else {
        setChecking(true);
        validateEvmToken({
          smartContract: smartContract,
          chain,
          type: 'erc721',
        })
          .then(resp => {
            if (unamount) {
              return;
            }
            if (resp.isExist) {
              onUpdateErrors('smartContract')(['This token has already been added']);
            } else {
              onChangeValue('collectionName')(resp.name);
              onUpdateErrors('smartContract')(undefined);
            }
          })
          .catch(() => {
            if (unamount) {
              return;
            }
            onUpdateErrors('smartContract')(['Invalid contract for the selected chain']);
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
  }, [chain, onChangeValue, onUpdateErrors, smartContract]);

  useEffect(() => {
    if (collectionName.split(' ').join('') === '') {
      setIsValidName(false);
    } else {
      setIsValidName(true);
    }
  }, [collectionName]);

  useEffect(() => {
    onChangeValue('chain')((chainOptions[0].value as string) || '');
  }, [chainOptions, onChangeValue]);

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
      title={i18n.title.importEvmNft}
      style={ContainerHeaderStyle}
      isShowPlaceHolder={false}>
      <View style={WrapperStyle}>
        <InputAddress
          containerStyle={{ marginBottom: 8 }}
          ref={formState.refs.smartContract}
          label={formState.labels.smartContract}
          value={smartContract}
          onPressQrButton={() => setShowQrModalVisible(true)}
          onChange={(output: string | null, currentValue: string) => {
            handleChangeValue('smartContract')(currentValue);
          }}
        />

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

        {!!formState.errors.smartContract.length &&
          formState.errors.smartContract.map(err => <Warning style={{ marginBottom: 8 }} isDanger message={err} />)}

        <SubmitButton
          title={i18n.importEvmNft.addNft}
          activeOpacity={BUTTON_ACTIVE_OPACITY}
          onPress={handleAddToken}
          disabled={isDisableAddNFT}
        />

        <QrScannerScreen
          qrModalVisible={isShowQrModalVisible}
          onPressCancel={() => setShowQrModalVisible(false)}
          onChangeAddress={(text: string) => onUpdateNftContractAddress(text)}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ImportEvmNft);
