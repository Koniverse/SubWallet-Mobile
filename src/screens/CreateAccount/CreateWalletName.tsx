import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { PasswordInput } from 'components/PasswordInput';
import { createAccountSuriV2, createSeedV2, validateSeedV2 } from '../../messaging';
import { SUBSTRATE_ACCOUNT_TYPE } from '../../constant';
import { SubmitButton } from 'components/SubmitButton';
import { Formik, Field } from 'formik';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  paddingTop: 8,
};

const footerAreaStyle: StyleProp<any> = {
  paddingTop: 12,
  paddingBottom: 22,
};

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  textAlign: 'center',
  paddingHorizontal: 20,
  ...FontMedium,
  paddingBottom: 26,
};

export const CreateWalletName = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [name, setName] = useState<string>('');
  const [isBusy, setBusy] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [pass1, setPass1] = useState<string | null>(null);
  const [pass2, setPass2] = useState<string | null>(null);
  const [seed, setSeed] = useState<null | string>(null);

  useEffect((): void => {
    createSeedV2(undefined, undefined, [SUBSTRATE_ACCOUNT_TYPE])
      .then((response): void => {
        setAddress(response.addressMap[SUBSTRATE_ACCOUNT_TYPE]);
        setSeed(response.seed);
      })
      .catch(console.error);
  }, []);

  useEffect((): void => {
    if (seed) {
      validateSeedV2(seed, [SUBSTRATE_ACCOUNT_TYPE])
        .then(({ addressMap }) => {
          setAddress(addressMap[SUBSTRATE_ACCOUNT_TYPE]);
        })
        .catch(console.error);
    }
  }, [seed]);

  const _onCreate = useCallback(
    (curName: string, password: string): void => {
      if (curName && password && seed) {
        setBusy(true);
        createAccountSuriV2(curName, password, seed, true, [SUBSTRATE_ACCOUNT_TYPE], '')
          .then(() => {
            navigation.navigate('Home');
          })
          .catch(e => {
            setBusy(false);
            console.error(e);
          });
      }
    },
    [navigation, seed],
  );

  return (
    <SubScreenContainer navigation={navigation} title={'Create Wallet Name'}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 22 }}>
        <View style={bodyAreaStyle}>
          <Text style={titleStyle}>Name will be used only locally in this application. You can edit it later</Text>

          <EditAccountInputText
            label={'Wallet Name'}
            inputValue={name}
            onChangeText={text => setName(text)}
            editAccountInputStyle={{ marginBottom: 8 }}
          />
          <PasswordInput
            label={'Wallet Password'}
            onChangeText={curPass1 => setPass1(curPass1)}
            containerStyle={{ backgroundColor: ColorMap.dark2, marginBottom: 8 }}
          />

          <PasswordInput
            label={'Repeat Wallet Password'}
            onChangeText={curPass2 => setPass2(curPass2)}
            containerStyle={{ backgroundColor: ColorMap.dark2, marginBottom: 8 }}
          />
        </View>
        <View style={footerAreaStyle}>
          <SubmitButton
            disabled={!pass1 || !pass2 || pass1 !== pass2}
            isBusy={isBusy}
            title={'Finish'}
            onPress={() => {
              pass1 && _onCreate(name, pass1);
            }}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
