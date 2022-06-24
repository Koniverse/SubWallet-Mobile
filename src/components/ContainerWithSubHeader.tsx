import React from 'react';
import {KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleProp, View} from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    // ...sharedStyles.container,
    backgroundColor: backgroundColor || ColorMap.dark1,
  };
};

export const ContainerWithSubHeader = ({ children, ...subHeaderProps }: ContainerWithSubHeaderProps) => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, marginBottom: 22 }}>
      <View style={{ flex: 1 }}>
        <SafeAreaView style={getContainerStyle(subHeaderProps.backgroundColor)}>
          <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
          <SubHeader {...subHeaderProps} />
        </SafeAreaView>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
};
