import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { PinCodeField } from 'components/PinCodeField';

const bottomAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  paddingHorizontal: 16,
  paddingBottom: 18,
  paddingTop: 118,
};

const cancelButtonStyle: StyleProp<any> = { flex: 1, marginRight: 4, backgroundColor: ColorMap.dark2 };
const continueButtonStyle: StyleProp<any> = { flex: 1, marginLeft: 4 };
interface Props {
  title: string;
  pinCode: string;
  onChangePinCode: (text: string) => void;
  onPressBack: () => void;
  onPressContinue: () => void;
  isPinCodeValid?: boolean;
}

export const PinCode = ({ title, pinCode, onChangePinCode, onPressBack, onPressContinue, isPinCodeValid }: Props) => {
  return (
    <ContainerWithSubHeader title={title} onPressBack={onPressBack}>
      <>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <PinCodeField value={pinCode} setValue={onChangePinCode} isPinCodeValid={isPinCodeValid} />
        </View>
        <View style={bottomAreaStyle}>
          <SubmitButton title={'Cancel'} style={cancelButtonStyle} onPress={onPressBack} />
          <SubmitButton
            disabled={!pinCode || pinCode.length < 6 || !isPinCodeValid}
            title={'Continue'}
            style={continueButtonStyle}
            onPress={onPressContinue}
          />
        </View>
      </>
    </ContainerWithSubHeader>
  );
};
