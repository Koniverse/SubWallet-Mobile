import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { MetadataDef } from '../../../../types';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ConfirmationFooter } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationFooter';
import i18n from 'utils/i18n/i18n';
import { Header } from 'screens/Home/Browser/ConfirmationPopup/Header';
import { getHostName } from 'utils/browser';

interface Props {
  request: MetadataDef;
  url: string;
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
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={metadataLabelStyle}>
        <Text style={getMetadataTextStyle(ColorMap.disabled)}>{`${label}: `}</Text>
      </View>
      <View style={metadataValueStyle}>
        <Text style={getMetadataTextStyle(ColorMap.light)}>{value}</Text>
      </View>
    </View>
  );
}

export const MetadataRequest = ({ request, url }: Props) => {
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
  return (
    <View style={{ width: '100%', flex: 1 }}>
      <Header title={i18n.common.metadataIsOutOfDate} hostName={hostName} />
      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        <Text style={metadataTextStyle}>
          {`${i18n.title.metadataTitlePart1} ${request.chain} ${i18n.title.metadataTitlePart2} ${url}`}
        </Text>

        <View style={dividerStyle} />

        {metadataInfos.map(info => renderMetadataInfo(info.label, info.value))}
      </View>

      <ConfirmationFooter
        submitButtonTitle={i18n.common.approve}
        cancelButtonTitle={i18n.common.cancel}
        onPressCancelButton={() => {}}
        onPressSubmitButton={() => {}}
      />
    </View>
  );
};
