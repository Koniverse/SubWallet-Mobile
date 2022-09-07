import React from 'react';
import { SafeAreaView, StyleProp, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { IconButton } from 'components/IconButton';
import { ShieldSlash } from 'phosphor-react-native';

const cancelButtonStyle: StyleProp<any> = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: ColorMap.borderButtonColor,
  flex: 1,
  marginRight: 8,
};

const blockButtonStyle: StyleProp<any> = { backgroundColor: ColorMap.danger, borderRadius: 5, marginRight: 16 };

interface Props {
  cancelButtonTitle: string;
  submitButtonTitle: string;
  onPressCancelButton: () => void;
  onPressSubmitButton: () => void;
  isShowBlockButton?: boolean;
}

export const ConfirmationFooter = ({
  cancelButtonTitle,
  submitButtonTitle,
  onPressCancelButton,
  onPressSubmitButton,
  isShowBlockButton = false,
}: Props) => {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 16 }}>
        {isShowBlockButton && <IconButton icon={ShieldSlash} style={blockButtonStyle} />}
        <SubmitButton
          title={cancelButtonTitle}
          backgroundColor={ColorMap.dark2}
          style={cancelButtonStyle}
          onPress={onPressCancelButton}
        />
        <SubmitButton style={{ flex: 1, marginLeft: 8 }} title={submitButtonTitle} onPress={onPressSubmitButton} />
      </View>
      <SafeAreaView />
    </>
  );
};
