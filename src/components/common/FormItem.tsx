import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { Control, UseControllerReturn } from 'react-hook-form/dist/types';
import React from 'react';
import { Warning } from 'components/Warning';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

type Props<P extends FieldValues> = {
  style?: StyleProp<ViewStyle>;
  name: FieldPath<P>;
  render: (controllerReturn: UseControllerReturn<P>) => React.ReactNode;
  rules?: UseControllerProps<P>['rules'];
  control: Control<P>;
  showError?: boolean;
};

export const FormItem = <P extends FieldValues = FieldValues>({
  style,
  name,
  render,
  rules,
  control,
  showError = true,
}: Props<P>) => {
  const controllerReturn = useController({ name, control, rules });
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);

  const renderErrorMessage = (_controllerReturn: UseControllerReturn<P>) => {
    if (_controllerReturn.fieldState.error && _controllerReturn.fieldState.error.message) {
      return <Warning isDanger message={_controllerReturn.fieldState.error.message} style={styleSheet.errorMessage} />;
    }

    return null;
  };

  return (
    <View style={[style]}>
      {render(controllerReturn)}
      {showError && renderErrorMessage(controllerReturn)}
    </View>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    errorMessage: {
      marginTop: theme.sizeXS,
    },
  });
}
