import React, { useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { PasswordInput } from 'components/PasswordInput';
import { SubmitButton } from 'components/SubmitButton';

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  marginBottom: 8,
};

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  textAlign: 'center',
  paddingHorizontal: 20,
  ...FontMedium,
  paddingBottom: 26,
};

interface Props {
  isBusy?: boolean;
  onCreateAccount: (curName: string, password: string) => void;
}

export const AccountNamePasswordCreation = ({ isBusy, onCreateAccount }: Props) => {
  const [name, setName] = useState<string>('');
  const [pass1, setPass1] = useState<string | null>(null);
  const [pass2, setPass2] = useState<string | null>(null);

  return (
    <View style={sharedStyles.layoutContainer}>
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
          containerStyle={containerStyle}
        />

        <PasswordInput
          label={'Repeat Wallet Password'}
          onChangeText={curPass2 => setPass2(curPass2)}
          containerStyle={containerStyle}
        />
      </View>
      <View>
        <SubmitButton
          disabled={!pass1 || !pass2 || pass1 !== pass2}
          isBusy={isBusy}
          title={'Finish'}
          onPress={() => {
            pass1 && onCreateAccount(name, pass1);
          }}
        />
      </View>
    </View>
  );
};
