import { ConfirmationHeader, ConfirmationHeaderType } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationHeader';
import { ConfirmationFooter, ConfirmationFooterType } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationFooter';
import { StyleProp, View } from 'react-native';
import React, { ForwardedRef, forwardRef, useImperativeHandle } from 'react';

interface Props {
  headerProps: ConfirmationHeaderType;
  footerProps: ConfirmationFooterType;
  children?: JSX.Element;
  isShowPassword?: boolean;
}

export interface ConfirmationBaseRef {
  onPasswordError: (e: Error) => void;
}

const containerStyle: StyleProp<any> = {
  width: '100%',
  flex: 1,
};

const Component = ({ headerProps, footerProps, children }: Props, ref: ForwardedRef<ConfirmationBaseRef>) => {
  useImperativeHandle(ref, () => ({
    onPasswordError: (e: Error) => {},
  }));

  return (
    <View style={containerStyle}>
      <ConfirmationHeader {...headerProps} />
      {children}

      {/* todo: add password here  */}
      <ConfirmationFooter {...footerProps} />
    </View>
  );
};

export const ConfirmationBase = forwardRef(Component);
