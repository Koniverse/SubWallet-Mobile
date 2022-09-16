import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Dropdown } from 'components/Dropdown';
import InputText from 'components/Input/InputText';
import useGetActiveEvmChains from 'hooks/screen/ImportNft/useGetActiveEvmChains';
import useFormControl from 'hooks/screen/useFormControl';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { ButtonStyle, TextButtonStyle } from 'styles/sharedStyles';
import { upsertEvmToken, validateEvmToken } from '../../messaging';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';
import { CustomEvmToken } from '@subwallet/extension-base/background/KoniTypes';

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
};

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 20,
  marginTop: 10,
};

const InputContainerStyle: StyleProp<ViewStyle> = {
  marginBottom: 8,
};

const WarningStyle: StyleProp<TextStyle> = {
  color: ColorMap.iconWarningColor,
  marginBottom: 10,
  flex: 1,
  textAlign: 'center',
};

const AddTokenContainerStyle: StyleProp<ViewStyle> = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const _ButtonStyle: StyleProp<any> = {
  ...ButtonStyle,
  paddingHorizontal: 10,
  paddingVertical: 10,
  flex: 1,
};

const PrimaryButtonStyle: StyleProp<ViewStyle> = {
  ..._ButtonStyle,
  backgroundColor: ColorMap.secondary,
};

const PrimaryTextStyle: StyleProp<TextStyle> = {
  ...TextButtonStyle,
  color: ColorMap.light,
};

const formConfig = {
  smartContract: {
    require: true,
    name: i18n.importEvmNft.smartContract.toUpperCase(),
    value: '',
  },
  chain: {
    require: true,
    name: i18n.importEvmNft.chain.toUpperCase(),
    value: '',
  },
  collectionName: {
    require: true,
    name: i18n.importEvmNft.nftCollectionName.toUpperCase(),
    value: '',
  },
};

const ImportEvmNft = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const chainOptions = useGetActiveEvmChains();

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [isValidContract, setIsValidContract] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [warning, setWarning] = useState('');

  const onBack = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const { formState, onChangeValue } = useFormControl(formConfig, {});

  const { data: formData } = formState;
  const { chain, smartContract, collectionName } = formData;

  const handleChangeValue = useCallback(
    (key: string) => {
      return (text: string) => {
        setWarning('');
        onChangeValue(key)(text);
      };
    },
    [onChangeValue],
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
          setWarning('Successfully added a NFT collection');
          onBack();
        } else {
          setWarning('An error has occurred. Please try again later');
        }
      })
      .catch(() => {
        setWarning('An error has occurred. Please try again later');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chain, collectionName, onBack, smartContract]);

  useEffect(() => {
    let unamount = false;
    if (smartContract !== '') {
      if (!isEthereumAddress(smartContract)) {
        setIsValidContract(false);
        setWarning('Invalid EVM contract address');
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
              setWarning('This token has already been added');
              setIsValidContract(false);
            } else {
              onChangeValue('collectionName')(resp.name);
              setIsValidContract(true);
            }
          })
          .catch(() => {
            if (unamount) {
              return;
            }
            setWarning('Invalid contract for the selected chain');
            setIsValidContract(false);
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
  }, [chain, smartContract, onChangeValue]);

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

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={onBack}
      title={i18n.title.importEvmNft}
      style={ContainerHeaderStyle}
      isShowPlaceHolder={false}>
      <View style={WrapperStyle}>
        <InputText
          ref={formState.refs.smartContract}
          label={formState.labels.smartContract}
          onChangeText={handleChangeValue('smartContract')}
          errorMessages={formState.errors.smartContract}
          value={smartContract}
        />
        <View style={InputContainerStyle}>
          <Dropdown
            items={chainOptions}
            label={formState.labels.chain}
            onValueChange={handleChangeValue('chain')}
            value={formState.data.chain}
          />
        </View>
        <InputText
          ref={formState.refs.collectionName}
          label={formState.labels.collectionName}
          onChangeText={handleChangeValue('collectionName')}
          errorMessages={formState.errors.collectionName}
          value={collectionName}
        />
        <Text style={WarningStyle}>{warning}</Text>
        <View style={AddTokenContainerStyle}>
          <TouchableOpacity
            style={PrimaryButtonStyle}
            disabled={
              !isValidContract ||
              !isValidName ||
              smartContract === '' ||
              collectionName === '' ||
              chainOptions.length === 0 ||
              checking ||
              loading
            }
            onPress={handleAddToken}>
            <Text style={PrimaryTextStyle}>{i18n.importEvmNft.addNft}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ImportEvmNft);
