import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { StyleProp, Text, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import React from 'react';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, FontSize2, sharedStyles } from 'styles/sharedStyles';
import { getIcon } from 'utils/index';
import { TransferResultType } from 'types/tx';
import { ColorMap } from 'styles/color';

interface Props {
  txResult: TransferResultType;
}

const bodyAreaStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  alignItems: 'center',
  flex: 1,
  paddingTop: 100,
};

const footerAreaStyle: StyleProp<any> = {};

const imageStyle: StyleProp<any> = {
  marginBottom: 24,
};

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginBottom: 8,
};

const subtitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSize2,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
};

const submitButton1Style: StyleProp<any> = {

};

const submitButton2Style: StyleProp<any> = {
  marginTop: 16,
};

export const SendFundResult = ({ txResult: { extrinsicHash, isTxSuccess, txError } }: Props) => {
  return (
    <ContainerWithSubHeader onPressBack={() => {
    }} title={isTxSuccess ? 'Success' : 'Failed' }>
      <View style={sharedStyles.layoutContainer}>
        <View style={bodyAreaStyle}>
          {isTxSuccess && (
            <>
              {getIcon('SuccessStatus', 200, undefined, imageStyle)}

              <Text style={titleStyle}>Transaction Successful</Text>
              <Text style={subtitleStyle}>
                Your request has been confirmed. You can track its progress on the Transaction History page.
              </Text>
            </>
          )}
          {!isTxSuccess && (
            <>
              {getIcon('FailStatus', 200, undefined, imageStyle)}

              <Text style={titleStyle}>Transaction Fail</Text>
              <Text style={subtitleStyle}>
                There was a problem with your request. You can track its progress on the Transaction History page.
              </Text>
            </>
          )}
        </View>

        <View style={footerAreaStyle}>
          {isTxSuccess && (
            <>
              <SubmitButton
                title={'Back to Home'}
                backgroundColor={ColorMap.dark2}
                style={submitButton1Style}
                onPress={() => {}}
              />
              <SubmitButton title={'View in Explorer'} style={submitButton2Style} onPress={() => {}} />
            </>
          )}
          {!isTxSuccess && (
            <>
              <SubmitButton
                title={'Resend'}
                backgroundColor={ColorMap.dark2}
                style={submitButton1Style}
                onPress={() => {}}
              />
            </>
          )}
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
