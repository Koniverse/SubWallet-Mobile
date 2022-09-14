import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import InputText from 'components/Field/InputText';
import { TextField } from 'components/Field/Text';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import React, { useCallback } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';
import { exportAccount } from '../../messaging';

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
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
};

const ImportEvmNft = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const onBack = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const onSubmit = useCallback((formState: FormState) => {

  },[]);

  const { formState, onChangeValue } = useFormControl(formConfig, { onSubmitForm: onSubmit });

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={onBack}
      title={i18n.title.importEvmNft}
      style={ContainerHeaderStyle}
      isShowPlaceHolder={false}>
      <View>
        <View>
          <InputText
            ref={formState.refs.smartContract}
            label={formState.labels.smartContract}
            onChangeText={onChangeValue('smartContract')}
            errorMessages={formState.errors.smartContract}
          />
        </View>
        <View>
          <InputText
            ref={formState.refs.chain}
            label={formState.labels.chain}
            onChangeText={onChangeValue('chain')}
            errorMessages={formState.errors.chain}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ImportEvmNft);
