import {
  ArgInfo,
  ResponseParseTransactionSubstrate,
  ResponseQrParseRLP,
} from '@subwallet/extension-base/background/KoniTypes';
import { ActivityLoading } from 'components/ActivityLoading';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { Text, View } from 'react-native';
import { SigningStyles } from 'styles/signing';
import i18n from 'utils/i18n/i18n';
import { isString, u8aToHex, isArray } from '@polkadot/util';

const isTransactionSubstrate = (
  tx: ResponseQrParseRLP | ResponseParseTransactionSubstrate,
): tx is ResponseParseTransactionSubstrate => {
  return 'era' in tx;
};

const SubstrateTransactionDetail = () => {
  const {
    state: { signedData, rawPayload, parsedTx },
  } = useContext(ScannerContext);

  const payloadDetail = useMemo((): ResponseParseTransactionSubstrate | null => {
    return !parsedTx || !isTransactionSubstrate(parsedTx) ? null : parsedTx;
  }, [parsedTx]);

  const handlerRenderArg = useCallback((args?: ArgInfo[]): JSX.Element | JSX.Element[] => {
    if (!args) {
      return <></>;
    }

    return args.map(({ argName, argValue }, index) => (
      <View style={SigningStyles.ColumnContentContainerStyle} key={`${argName}_${index}`}>
        <Text style={SigningStyles.ColumnContentTitleStyle}>{argName}:</Text>
        <Text style={SigningStyles.ColumnContentValueStyle}>
          {argValue && isArray(argValue) ? argValue.join(', ') : argValue}
        </Text>
      </View>
    ));
  }, []);

  const handlerRenderDetail = useCallback(() => {
    const methods = payloadDetail?.method;

    if (!methods) {
      return <></>;
    }

    if (isString(methods)) {
      return null;
    }

    return (
      <View style={SigningStyles.GroupContainerStyle}>
        <Text style={SigningStyles.GroupTitleStyle}>{i18n.signingAction.detail}</Text>
        {methods.map(({ args, methodName }, index) => (
          <View style={SigningStyles.GroupContentStyle} key={`${methodName}_${index}`}>
            <View style={SigningStyles.ColumnContentContainerStyle}>
              <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.method}:</Text>
              <Text style={SigningStyles.ColumnContentValueStyle}>{methodName}</Text>
            </View>
            {handlerRenderArg(args)}
          </View>
        ))}
      </View>
    );
  }, [handlerRenderArg, payloadDetail?.method]);

  if (!payloadDetail) {
    return <ActivityLoading />;
  }

  return (
    <View>
      <View style={SigningStyles.GroupContainerStyle}>
        <Text style={SigningStyles.GroupTitleStyle}>{i18n.signingAction.basic}</Text>
        <View style={SigningStyles.GroupContentStyle}>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.method}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>
              {isString(rawPayload) ? rawPayload : u8aToHex(rawPayload)}
            </Text>
          </View>
          {typeof payloadDetail.era === 'string' ? (
            <View style={SigningStyles.RowContentContainerStyle}>
              <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.era}:</Text>
              <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.era}</Text>
            </View>
          ) : (
            <View style={SigningStyles.RowContentContainerStyle}>
              <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.phase}:</Text>
              <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.era.phase}</Text>
              <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.period}:</Text>
              <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.era.period}</Text>
            </View>
          )}
          <View style={SigningStyles.RowContentContainerStyle}>
            <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.nonce}:</Text>
            <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.nonce}</Text>
            <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.tip}:</Text>
            <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.tip}</Text>
          </View>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.signature}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>{signedData}</Text>
          </View>
        </View>
      </View>
      {handlerRenderDetail()}
    </View>
  );
};

export default SubstrateTransactionDetail;
