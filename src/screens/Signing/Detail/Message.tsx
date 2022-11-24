import { isAscii, isU8a, u8aToHex, hexToString } from '@polkadot/util';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useContext, useMemo } from 'react';
import { Text, View } from 'react-native';
import { SigningStyles } from 'styles/signing';
import i18n from 'utils/i18n/i18n';
import { unwrapMessage } from 'utils/scanner/sign';

const MessageDetail = () => {
  const {
    state: { message, dataToSign, isHash, signedData },
  } = useContext(ScannerContext);

  const data = useMemo((): string => (isU8a(dataToSign) ? u8aToHex(dataToSign) : dataToSign), [dataToSign]);

  return (
    <View>
      <View style={SigningStyles.GroupContainerStyle}>
        <Text style={SigningStyles.GroupTitleStyle}>{i18n.signingAction.basic}</Text>
        <View style={SigningStyles.GroupContentStyle}>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.message}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>
              {isHash ? message : isAscii(message) ? unwrapMessage(hexToString(message)) : data}
            </Text>
          </View>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.signature}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>{signedData}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MessageDetail;
