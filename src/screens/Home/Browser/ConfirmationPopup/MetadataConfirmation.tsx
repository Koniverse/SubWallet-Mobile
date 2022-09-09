import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { getHostName } from 'utils/browser';
import { MetadataRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHookType } from 'hooks/types';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';

interface Props {
  payload: MetadataRequest;
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

const dividerStyle: StyleProp<any> = {
  height: 1,
  width: '100%',
  backgroundColor: ColorMap.disabled,
  marginVertical: 48,
};

const metadataLabelStyle: StyleProp<any> = {
  flex: 4,
  alignItems: 'flex-end',
};

const metadataValueStyle: StyleProp<any> = {
  flex: 6,
  alignItems: 'flex-start',
};

const metadataTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  paddingTop: 16,
  textAlign: 'center',
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
    <View key={label} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={metadataLabelStyle}>
        <Text style={getMetadataTextStyle(ColorMap.disabled)}>{`${label}: `}</Text>
      </View>
      <View style={metadataValueStyle}>
        <Text style={getMetadataTextStyle(ColorMap.light)}>{value}</Text>
      </View>
    </View>
  );
}

const CONFIRMATION_TYPE = 'metadataRequest';

export const MetadataConfirmation = ({
  payload: { request, id: confirmationId, url },
  cancelRequest,
  approveRequest,
}: Props) => {
  const hostName = getHostName(url);
  const metadataInfos = [
    {
      label: 'Symbol',
      value: request.tokenSymbol,
    },
    {
      label: 'Decimals',
      value: request.tokenDecimals,
    },
  ];

  const onPressCancelButton = () => {
    cancelRequest(CONFIRMATION_TYPE, confirmationId);
  };

  const onPressSubmitButton = () => {
    approveRequest(CONFIRMATION_TYPE, confirmationId, undefined);
  };

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.common.metadataIsOutOfDate,
        hostName,
      }}
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}>
      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        <Text style={metadataTextStyle}>
          {`${i18n.title.metadataTitlePart1} ${request.chain} ${i18n.title.metadataTitlePart2} ${url}`}
        </Text>

        <View style={dividerStyle} />

        {metadataInfos.map(info => renderMetadataInfo(info.label, info.value))}
      </View>
    </ConfirmationBase>
  );
};
