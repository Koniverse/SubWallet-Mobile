import React from 'react';
import { SafeAreaView, StyleProp, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { IconButton } from 'components/IconButton';
import { ShieldSlash } from 'phosphor-react-native';

export interface ConfirmationFooterType {
  cancelButtonTitle: string;
  submitButtonTitle: string;
  onPressCancelButton?: () => void;
  onPressSubmitButton?: () => void;
  isShowBlockButton?: boolean;
  onPressBlockButton?: () => void;
  isBlockButtonDisabled?: boolean;
  isCancelButtonDisabled?: boolean;
  isSubmitButtonDisabled?: boolean;
  isBlockButtonBusy?: boolean;
  isCancelButtonBusy?: boolean;
  isSubmitButtonBusy?: boolean;
}

const cancelButtonStyle: StyleProp<any> = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: ColorMap.borderButtonColor,
  flex: 1,
  marginRight: 8,
};

const blockButtonStyle: StyleProp<any> = { backgroundColor: ColorMap.danger, borderRadius: 5, marginRight: 16 };

export const ConfirmationFooter = ({
  cancelButtonTitle,
  submitButtonTitle,
  onPressCancelButton,
  onPressSubmitButton,
  isShowBlockButton = false,
  onPressBlockButton,
  isSubmitButtonDisabled,
  isBlockButtonDisabled,
  isCancelButtonDisabled,
  isBlockButtonBusy,
  isCancelButtonBusy,
  isSubmitButtonBusy,
}: ConfirmationFooterType) => {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 16 }}>
        {/* todo: add busy prop + style to IconButton */}
        {isShowBlockButton && (
          <IconButton
            icon={ShieldSlash}
            style={blockButtonStyle}
            onPress={onPressBlockButton}
            disabled={isBlockButtonDisabled || isBlockButtonBusy}
          />
        )}
        <SubmitButton
          title={cancelButtonTitle}
          backgroundColor={ColorMap.dark2}
          style={cancelButtonStyle}
          onPress={onPressCancelButton}
          disabled={isCancelButtonDisabled}
          isBusy={isCancelButtonBusy}
        />
        <SubmitButton
          style={{ flex: 1, marginLeft: 8 }}
          title={submitButtonTitle}
          onPress={onPressSubmitButton}
          disabled={isSubmitButtonDisabled}
          isBusy={isSubmitButtonBusy}
        />
      </View>
      <SafeAreaView />
    </>
  );
};
