// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmitButton } from 'components/SubmitButton';
import { Warning } from 'components/Warning';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { BaseSignProps } from 'types/signer';
import i18n from 'utils/i18n/i18n';

interface Props extends BaseSignProps {}

const ErrorStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 16,
  marginTop: 16,
};

const getWrapperStyle = (canCancel: boolean): StyleProp<ViewStyle> => {
  return {
    ...MarginBottomForSubmitButton,
    marginHorizontal: canCancel ? -4 : 0,
    marginTop: 16,
  };
};

const getButtonStyle = (canCancel: boolean): StyleProp<ViewStyle> => {
  return {
    marginHorizontal: canCancel ? 4 : 0,
  };
};

const UnknownRequest = ({ baseProps: { onCancel, cancelText, buttonText } }: Props) => {
  return (
    <>
      <Warning style={ErrorStyle} message={i18n.warningMessage.unSupportSigning} isDanger />
      <View style={getWrapperStyle(!!onCancel)}>
        {onCancel && (
          <SubmitButton
            backgroundColor={ColorMap.dark2}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            style={getButtonStyle(!!onCancel)}
            title={cancelText ? cancelText : i18n.common.cancel}
            onPress={onCancel}
          />
        )}
        <SubmitButton
          style={getButtonStyle(!!onCancel)}
          disabled={true}
          title={buttonText ? buttonText : i18n.buttonTitles.approve}
        />
      </View>
    </>
  );
};

export default React.memo(UnknownRequest);
