import React, { useState } from 'react';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { AccountNameAndPasswordArea } from 'components/AccountNameAndPasswordArea';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  ...ScrollViewStyle,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  ...MarginBottomForSubmitButton,
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
  const [pass2Dirty, setPass2Dirty] = useState<boolean>(false);
  const isSecondPasswordValid = !!(pass2 && pass2.length > 5) && pass2Dirty && pass1 !== pass2;

  const onChangeName = (text: string) => {
    setName(text);
  };

  const onChangePass1 = (curPass1: string) => {
    if (curPass1 && curPass1.length) {
      setPass1(curPass1);
    } else {
      setPass1(null);
    }
  };

  const onChangePass2 = (curPass2: string) => {
    setPass2Dirty(true);
    if (curPass2 && curPass2.length) {
      setPass2(curPass2);
    } else {
      setPass2(null);
    }
  };

  return (
    <View style={sharedStyles.layoutContainer}>
      <ScrollView style={bodyAreaStyle}>
        <Text style={titleStyle}>Name will be used only locally in this application. You can edit it later</Text>

        <AccountNameAndPasswordArea
          name={name}
          onChangeName={onChangeName}
          onChangePass1={onChangePass1}
          onChangePass2={onChangePass2}
          isSecondPasswordValid={isSecondPasswordValid}
          pass1={pass1}
          pass2={pass2}
          pass2Dirty={pass2Dirty}
          autoFocusFirstField
        />
      </ScrollView>
      <View style={footerAreaStyle}>
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
