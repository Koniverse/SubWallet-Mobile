import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { ConfirmationsQueue } from '@subwallet/extension-base/background/KoniTypes';
import { getHostName } from 'utils/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Divider } from 'components/Divider';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { ConfirmationHookType } from 'hooks/types';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import { renderTargetAccount } from 'screens/Home/Browser/ConfirmationPopup/shared';

interface Props {
  payload: ConfirmationsQueue['evmSignatureRequest'][0];
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

interface SignTypedDataObjectV1 {
  type: string;
  name: string;
  value: any;
}

function getNodeStyle(isLeaf: boolean): StyleProp<any> {
  return {
    position: 'relative',
    marginLeft: 16,
    flexDirection: isLeaf ? 'row' : 'column',
    flexWrap: 'wrap',
  };
}

const labelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const valueStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const CONFIRMATION_TYPE = 'evmSignatureRequest';

export const EvmSignConfirmation = ({
  payload: { payload, url, id: confirmationId },
  cancelRequest,
  approveRequest,
}: Props) => {
  const hostName = getHostName(url);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const [signMethod, setSignMethod] = useState<string>('');
  const [rawData, setRawData] = useState<string | object>('');
  const account = accounts.find(acc => acc.address === payload.address);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (payload.type === 'eth_sign') {
      setWarning(i18n.warningMessage.ethSignWarningMessage);
      setSignMethod('ETH Sign');
    } else if (payload.type === 'personal_sign') {
      setSignMethod('Personal Sign');
    } else if (payload.type === 'eth_signTypedData') {
      setSignMethod('Sign Typed Data');
    } else if (payload.type === 'eth_signTypedData_v1') {
      setSignMethod('Sign Typed Data V1');
    } else if (payload.type === 'eth_signTypedData_v3') {
      setSignMethod('Sign Typed Data V3');
    } else if (payload.type === 'eth_signTypedData_v4') {
      setSignMethod('Sign Typed Data V4');
    }

    const raw =
      typeof payload.payload === 'string' ? payload.payload : (JSON.parse(JSON.stringify(payload.payload)) as object);

    setRawData(raw);
  }, [payload.payload, payload.type]);

  const renderData = useCallback((data: any, needFilter?: boolean) => {
    if (typeof data !== 'object') {
      return (
        <View>
          <Text style={valueStyle}>{data as string}</Text>
        </View>
      );
    } else {
      return (
        <>
          {Object.entries(data as object).map(([key, datum], index) => {
            const isLeaf = typeof datum !== 'object';

            if (needFilter && key.toLowerCase() !== 'message') {
              return null;
            }

            return (
              <View style={getNodeStyle(isLeaf)} key={index}>
                <Text style={labelStyle}>{key}: </Text>
                {renderData(datum)}
              </View>
            );
          })}
        </>
      );
    }
  }, []);

  const handlerRenderV1 = useCallback((data: SignTypedDataObjectV1[]) => {
    return (
      <View>
        {data.map((value, index) => {
          return (
            <View key={index}>
              <Text style={labelStyle}>{value.name}:</Text>
              <Text style={valueStyle}>{value.value}</Text>
            </View>
          );
        })}
      </View>
    );
  }, []);

  const handlerRenderContent = useCallback(() => {
    if (!rawData) {
      return null;
    }

    switch (payload.type) {
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return renderData(rawData, true);
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData':
        return handlerRenderV1(rawData as unknown as SignTypedDataObjectV1[]);
      default:
        return renderData(rawData);
    }
  }, [handlerRenderV1, payload.type, rawData, renderData]);

  const onPressCancelButton = () => {
    return cancelRequest(CONFIRMATION_TYPE, confirmationId);
  };

  const onPressSubmitButton = (password: string) => {
    return approveRequest(CONFIRMATION_TYPE, confirmationId, { password });
  };

  return (
    <ConfirmationBase
      headerProps={{ title: 'request to sign message with', hostName }}
      isShowPassword={true}
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: 'Sign',
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}>
      <>
        <View style={{ paddingTop: 16 }}>{account && renderTargetAccount(account.address, account.name)}</View>

        <Divider style={{ marginVertical: 16 }} />

        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
          <Text>
            <Text style={labelStyle}>Sign Method: </Text>
            <Text style={valueStyle}>{signMethod}</Text>
          </Text>

          {warning && <Warning message={warning} />}

          <View>
            <Text style={labelStyle}>Raw Data: </Text>
            {handlerRenderContent()}
          </View>
        </ScrollView>
      </>
    </ConfirmationBase>
  );
};
