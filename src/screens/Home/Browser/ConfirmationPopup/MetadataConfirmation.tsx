import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { MetadataRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHookType } from 'hooks/types';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';

interface Props {
  payload: MetadataRequest;
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

const metadataInfosWrapperStyle: StyleProp<any> = {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'center',
  paddingBottom: 32,
  paddingTop: 16,
};

const metadataTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  paddingTop: 16,
  textAlign: 'center',
  paddingHorizontal: 16,
};

function getMetadataTextStyle(color: string): StyleProp<any> {
  return {
    ...sharedStyles.mainText,
    ...FontMedium,
    color: color,
  };
}

function renderMetadataInfo(label: string, value: string | number) {
  return (
    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
      <Text style={getMetadataTextStyle(ColorMap.disabled)}>{`${label}: `}</Text>
      <Text style={getMetadataTextStyle(ColorMap.light)}>{value}</Text>
    </View>
  );
}

const CONFIRMATION_TYPE = 'metadataRequest';

export const MetadataConfirmation = ({
  payload: { request, id: confirmationId, url },
  cancelRequest,
  approveRequest,
}: Props) => {
  const metadataInfos = [
    {
      label: i18n.common.symbol,
      value: request.tokenSymbol,
    },
    {
      label: i18n.common.decimals,
      value: request.tokenDecimals,
    },
  ];

  const onPressCancelButton = () => {
    return cancelRequest(CONFIRMATION_TYPE, confirmationId);
  };

  const onPressSubmitButton = () => {
    return approveRequest(CONFIRMATION_TYPE, confirmationId);
  };

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.common.metadataIsOutOfDate,
        url,
      }}
      isShowViewDetailButton={false}
      footerProps={{
        cancelButtonTitle: i18n.common.reject,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}>
      <>
        <Text style={metadataTextStyle}>
          {`${i18n.title.metadataTitlePart1} ${request.chain} ${i18n.title.metadataTitlePart2} ${url}`}
        </Text>

        <View style={metadataInfosWrapperStyle}>
          {metadataInfos.map(info => renderMetadataInfo(info.label, info.value))}
        </View>
      </>
    </ConfirmationBase>
  );
};
