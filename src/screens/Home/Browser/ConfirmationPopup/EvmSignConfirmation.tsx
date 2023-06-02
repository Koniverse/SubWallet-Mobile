import { u8aToU8a } from '@polkadot/util';
import {
  ConfirmationDefinitions,
  ConfirmationsQueue,
  EvmSignatureRequestExternal,
} from '@subwallet/extension-base/background/KoniTypes';
import { AccountInfoField } from 'components/Field/AccountInfo';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { ConfirmationHookType } from 'hooks/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { AccountSignMode } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';

interface Props {
  payload: ConfirmationsQueue['evmSignatureRequest'][0] | ConfirmationsQueue['evmSignatureRequestExternal'][0];
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
  requestType: keyof Pick<ConfirmationDefinitions, 'evmSignatureRequest' | 'evmSignatureRequestExternal'>;
}

interface SignTypedDataObjectV1 {
  type: string;
  name: string;
  value: any;
}

const warningTextStyle: StyleProp<any> = {
  color: ColorMap.danger,
  ...sharedStyles.mainText,
  ...FontMedium,
  marginBottom: 8,
};

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

export const EvmSignConfirmation = ({
  payload: { payload, url, id: confirmationId, address },
  cancelRequest,
  approveRequest,
  requestType,
}: Props) => {
  const [signMethod, setSignMethod] = useState<string>('');
  const [rawData, setRawData] = useState<string | object>('');
  const account = useGetAccountByAddress(payload.address);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const signMode = useGetAccountSignModeByAddress(address);

  const hashPayload = useMemo(
    (): string | undefined => (payload as EvmSignatureRequestExternal).hashPayload,
    [payload],
  );

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

  const signDataContent = useMemo(() => {
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

  const onPressCancelButton = useCallback(() => {
    return cancelRequest(requestType, confirmationId);
  }, [cancelRequest, confirmationId, requestType]);

  const onPressSubmitButton = useCallback(
    (password: string) => {
      return approveRequest(requestType, confirmationId, { password });
    },
    [approveRequest, confirmationId, requestType],
  );

  const onScanSignature = useCallback(
    (signature: `0x${string}`) => {
      return approveRequest(requestType, confirmationId, { signature });
    },
    [approveRequest, confirmationId, requestType],
  );

  const detailModalContent = useMemo(() => {
    return (
      <ScrollView style={{ width: '100%', marginTop: 32, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 8 }}>
          <Text style={labelStyle}>{i18n.common.signMethod}: </Text>
          <Text style={valueStyle}>{signMethod}</Text>
        </View>

        {warning && <Text style={warningTextStyle}>{warning}</Text>}

        <View>
          <Text style={labelStyle}>{i18n.common.rawData}: </Text>
          {signDataContent}
        </View>
      </ScrollView>
    );
  }, [signDataContent, signMethod, warning]);

  return (
    <ConfirmationBase
      headerProps={{ title: i18n.title.authorizeRequestTitle, url }}
      address={address}
      externalInfo={
        hashPayload
          ? {
              hashPayload: u8aToU8a(hashPayload),
              address: address || '',
              isHash: false,
              genesisHash: '',
              isEthereum: true,
              isMessage: true,
            }
          : undefined
      }
      isNeedSignature={true}
      footerProps={{
        cancelButtonTitle: i18n.common.reject,
        submitButtonTitle: i18n.common.approve,
        onScanSignature: onScanSignature,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
        isSubmitButtonDisabled: account?.isReadOnly,
      }}
      detailModalVisible={modalVisible}
      onPressViewDetail={() => setModalVisible(true)}
      onChangeDetailModalVisible={() => setModalVisible(false)}
      detailModalContent={detailModalContent}>
      <View style={{ width: '100%', paddingHorizontal: 16 }}>
        <Text
          style={{
            ...sharedStyles.mainText,
            ...FontMedium,
            color: ColorMap.disabled,
            paddingVertical: 16,
            textAlign: 'center',
          }}>
          {signMode === AccountSignMode.QR ? i18n.common.useHardWalletToScan : i18n.common.approveRequestMessage}
        </Text>
        <AccountInfoField name={account?.name || ''} address={account?.address || ''} />
        {signMode === AccountSignMode.QR && !hashPayload && (
          <Warning
            style={{ marginTop: 8, paddingHorizontal: 62 }}
            message={i18n.warningMessage.featureIsNotAvailable}
          />
        )}
      </View>
    </ConfirmationBase>
  );
};
