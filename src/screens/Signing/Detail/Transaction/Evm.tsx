import {
  EVMTransactionArg,
  ParseEVMTransactionData,
  ResponseParseTransactionSubstrate,
  ResponseQrParseRLP,
} from '@subwallet/extension-base/background/KoniTypes';
import { ActivityLoading } from 'components/ActivityLoading';
import useGetAccountAndNetworkScanned from 'hooks/screen/Signing/useGetAccountAndNetworkScanned';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { Text, View } from 'react-native';
import { SigningStyles } from 'styles/signing';
import i18n from 'utils/i18n/i18n';
import { convertToSimpleNumber } from 'utils/number';

const isTransactionEVM = (tx: ResponseQrParseRLP | ResponseParseTransactionSubstrate): tx is ResponseQrParseRLP => {
  return 'to' in tx;
};

const EvmTransactionDetail = () => {
  const {
    state: { signedData, recipientAddress, parsedTx },
  } = useContext(ScannerContext);
  const { network } = useGetAccountAndNetworkScanned();

  const payloadDetail = useMemo((): ResponseQrParseRLP | null => {
    return !parsedTx || !isTransactionEVM(parsedTx) ? null : parsedTx;
  }, [parsedTx]);

  const convertNumber = useCallback(
    (val: number) => {
      return `${convertToSimpleNumber(val, network?.decimals || 18)}${network?.nativeToken || 'token'}`;
    },
    [network?.decimals, network?.nativeToken],
  );

  const handlerRenderArg = useCallback((_data: EVMTransactionArg, parentName: string): JSX.Element => {
    const { children, name, value } = _data;
    const _name = (parentName ? `${parentName}.` : '') + name;

    const _value: string = value;

    if (children) {
      return <React.Fragment key={parentName}>{children.map(child => handlerRenderArg(child, name))}</React.Fragment>;
    }

    return (
      <View style={SigningStyles.ColumnContentContainerStyle} key={_name}>
        <Text style={SigningStyles.ColumnContentTitleStyle}>{_name}:</Text>
        <Text style={SigningStyles.ColumnContentValueStyle}>{_value}</Text>
      </View>
    );
  }, []);

  const handlerRenderInputInfo = useCallback(
    (info: string | ParseEVMTransactionData): JSX.Element => {
      if (typeof info === 'string') {
        return <></>;
      }

      return (
        <View style={SigningStyles.GroupContainerStyle}>
          <Text style={SigningStyles.GroupTitleStyle}>{i18n.signingAction.detail}</Text>
          <View style={SigningStyles.GroupContentStyle}>
            <View style={SigningStyles.ColumnContentContainerStyle}>
              <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.method}:</Text>
              <Text style={SigningStyles.ColumnContentValueStyle}>{info.methodName}</Text>
            </View>
            {info.args.map(value => handlerRenderArg(value, ''))}
          </View>
        </View>
      );
    },
    [handlerRenderArg],
  );

  if (!payloadDetail) {
    return <ActivityLoading />;
  }

  return (
    <View>
      <View style={SigningStyles.GroupContainerStyle}>
        <Text style={SigningStyles.GroupTitleStyle}>{i18n.signingAction.basic}</Text>
        <View style={SigningStyles.GroupContentStyle}>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.to}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>{recipientAddress}</Text>
          </View>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.data}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>
              {payloadDetail.input.length <= 2 ? '' : payloadDetail.input}
            </Text>
          </View>
          <View style={SigningStyles.RowContentContainerStyle}>
            <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.nonce}:</Text>
            <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.nonce}</Text>
            <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.value}:</Text>
            <Text style={SigningStyles.RowContentValueStyle}>{convertNumber(payloadDetail.value)}</Text>
          </View>
          <View style={SigningStyles.RowContentContainerStyle}>
            <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.gas}:</Text>
            <Text style={SigningStyles.RowContentValueStyle}>{payloadDetail.gas}</Text>
            <Text style={SigningStyles.RowContentTitleStyle}>{i18n.signingAction.gasPrice}:</Text>
            <Text style={SigningStyles.RowContentValueStyle}>{convertNumber(payloadDetail.gasPrice)}</Text>
          </View>
          <View style={SigningStyles.ColumnContentContainerStyle}>
            <Text style={SigningStyles.ColumnContentTitleStyle}>{i18n.signingAction.signature}:</Text>
            <Text style={SigningStyles.ColumnContentValueStyle}>{signedData}</Text>
          </View>
        </View>
      </View>
      {handlerRenderInputInfo(payloadDetail.data)}
    </View>
  );
};

export default EvmTransactionDetail;
