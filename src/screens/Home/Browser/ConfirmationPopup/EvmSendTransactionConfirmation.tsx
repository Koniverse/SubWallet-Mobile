import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ConfirmationDefinitions,
  ConfirmationsQueue,
  EvmSendTransactionRequestExternal,
  EVMTransactionArg,
  NetworkJson,
  ResponseParseEVMContractInput,
} from '@subwallet/extension-base/background/KoniTypes';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { SIGN_MODE } from 'types/signer';
import { toShort } from 'utils/index';
import { FontMedium, FontSize0, FontSize2, sharedStyles } from 'styles/sharedStyles';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import useGetEvmTransactionInfos from 'hooks/screen/Home/Browser/ConfirmationPopup/useGetEvmTransactionInfos';
import i18n from 'utils/i18n/i18n';
import FormatBalance from 'components/FormatBalance';
import { BN, hexToU8a } from '@polkadot/util';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import { ConfirmationHookType } from 'hooks/types';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import { AccountInfoField } from 'components/Field/AccountInfo';
import { TOAST_DURATION } from 'constants/index';

export const XCM_METHOD = 'transfer(address,uint256,(uint8,bytes[]),uint64)';
export const XCM_ARGS = ['currency_address', 'amount'];

interface Props {
  network?: NetworkJson;
  payload:
    | ConfirmationsQueue['evmSendTransactionRequest'][0]
    | ConfirmationsQueue['evmSendTransactionRequestExternal'][0];
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
  requestType: keyof Pick<ConfirmationDefinitions, 'evmSendTransactionRequest' | 'evmSendTransactionRequestExternal'>;
}

const itemMarginBottomStyle: StyleProp<any> = {
  marginBottom: 8,
};

const textStyle: StyleProp<any> = { ...sharedStyles.smallText, ...FontSize0, ...FontMedium, color: ColorMap.light };

const subTextStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled };

const valueWrapperStyle: StyleProp<any> = { flexDirection: 'row', alignItems: 'center' };

const scrollViewStyle: StyleProp<any> = { width: '100%' };

const itemWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  paddingHorizontal: 16,
  paddingTop: 4,
  paddingBottom: 10,
  borderRadius: 5,
  marginBottom: 8,
};

const renderReceiveAccount = (receiveAddress: string, onPressCopyButton: (text: string) => void) => {
  return (
    <View style={[itemWrapperStyle, { position: 'relative', marginTop: 8, marginBottom: 0 }]}>
      <Text style={textStyle}>{i18n.common.defaultReceiveAccountName}</Text>
      <View style={valueWrapperStyle}>
        <Text style={subTextStyle}>{toShort(receiveAddress, 12, 12)}</Text>
        <IconButton
          color={ColorMap.disabled}
          icon={CopySimple}
          onPress={() => onPressCopyButton(receiveAddress)}
          style={{ position: 'absolute', right: -10, bottom: -8 }}
        />
      </View>
    </View>
  );
};

export const EvmSendTransactionConfirmation = ({
  payload: { payload, url, id: confirmationId, address },
  network,
  cancelRequest,
  approveRequest,
  requestType,
}: Props) => {
  const senderAccount = useGetAccountByAddress(address);
  const signMode = useGetAccountSignModeByAddress(address);

  const hashPayload = useMemo(
    (): string | undefined => (payload as EvmSendTransactionRequestExternal).hashPayload,
    [payload],
  );

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { inputInfo, XCMToken } = useGetEvmTransactionInfos(payload, network);
  const toastRef = useRef<ToastContainer>(null);
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (toastRef.current) {
      toastRef.current.hideAll();
      toastRef.current.show(i18n.common.copiedToClipboard);
    }
  };

  const handlerRenderArg = useCallback(
    (data: EVMTransactionArg, parentName: string, isXcmTransaction: boolean): JSX.Element => {
      const { children, name, value } = data;
      const _name = (parentName ? `${parentName}.` : '') + name;

      let _value: string = value;

      if (children) {
        return (
          <React.Fragment key={parentName}>
            {children.map(child => handlerRenderArg(child, name, false))}
          </React.Fragment>
        );
      }

      if (isXcmTransaction && XCMToken && XCMToken.decimals) {
        if (name === 'amount') {
          _value = `${parseInt(value) / 10 ** XCMToken.decimals} (${XCMToken.symbol})`;
        } else if (name === 'currency_address') {
          _value = `${value} (${XCMToken.symbol})`;
        }
      }

      return (
        <View key={_name} style={{ ...itemMarginBottomStyle, paddingLeft: 16 }}>
          <Text style={[textStyle, { ...FontSize2 }]}>{_name}:</Text>
          <Text style={subTextStyle}>{_value}</Text>
        </View>
      );
    },
    [XCMToken],
  );

  const handleRenderInputInfo = useCallback(
    (response: ResponseParseEVMContractInput) => {
      const info = response.result;
      if (typeof info === 'string') {
        return (
          <Text style={itemMarginBottomStyle}>
            <Text style={[textStyle, { ...FontSize2 }]}>{i18n.common.data}</Text>
            <Text style={subTextStyle}>{info}</Text>
          </Text>
        );
      }

      const argName = info.args.map(i => i.name);
      const isXcmTransaction = XCM_METHOD === info.methodName && XCM_ARGS.every(s => argName.includes(s));

      return (
        <View style={scrollViewStyle}>
          <View style={itemMarginBottomStyle}>
            <Text style={[textStyle, { ...FontSize2 }]}>{i18n.common.method}</Text>
            <Text style={subTextStyle}>{info.methodName}</Text>
          </View>
          <View>
            <Text style={[textStyle, { ...FontSize2 }]}>{i18n.common.arguments}</Text>
            <View>{info.args.map(value => handlerRenderArg(value, '', isXcmTransaction))}</View>
          </View>
        </View>
      );
    },
    [handlerRenderArg],
  );

  const detailModalContent = useMemo(() => {
    return (
      <ScrollView style={{ width: '100%', marginTop: 32, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
        {payload.value && (
          <View style={itemMarginBottomStyle}>
            <Text style={[textStyle, { ...FontSize2 }]}>{i18n.common.amount}</Text>
            <View style={valueWrapperStyle}>
              <FormatBalance
                format={[network?.decimals || 18, '', undefined]}
                value={new BN(payload.value || '0')}
                valueColor={ColorMap.disabled}
              />
              <Text style={subTextStyle}>{network?.nativeToken}</Text>
            </View>
          </View>
        )}
        {payload.estimateGas && (
          <View style={itemMarginBottomStyle}>
            <Text style={[textStyle, { ...FontSize2 }]}>{i18n.common.estimateGas}</Text>
            <View style={valueWrapperStyle}>
              <FormatBalance
                format={[(network?.decimals || 18) - 3, '', undefined]}
                value={new BN(payload?.estimateGas || '0')}
                valueColor={ColorMap.disabled}
              />
              <Text style={subTextStyle}>{network?.nativeToken && `mili${network?.nativeToken}`}</Text>
            </View>
          </View>
        )}
        {!!inputInfo && typeof inputInfo.result !== 'string' && handleRenderInputInfo(inputInfo)}
        {!!payload.data && (
          <View style={scrollViewStyle}>
            <Text style={[textStyle, { ...FontSize2 }]}>{i18n.common.hexData}</Text>
            <Text style={subTextStyle}>{payload.data}</Text>
          </View>
        )}
      </ScrollView>
    );
  }, [
    handleRenderInputInfo,
    inputInfo,
    network?.decimals,
    network?.nativeToken,
    payload.data,
    payload.estimateGas,
    payload.value,
  ]);

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

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.title.sendTransaction,
        url: url,
      }}
      address={address}
      externalInfo={
        hashPayload
          ? {
              hashPayload: hexToU8a(hashPayload),
              address: address || '',
              isHash: false,
              genesisHash: '',
              isEthereum: true,
              isMessage: false,
            }
          : undefined
      }
      isNeedSignature={true}
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
        onScanSignature: onScanSignature,
      }}
      detailModalVisible={modalVisible}
      onChangeDetailModalVisible={() => setModalVisible(false)}
      onPressViewDetail={() => setModalVisible(true)}
      detailModalContent={detailModalContent}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={{
            ...sharedStyles.mainText,
            ...FontMedium,
            color: ColorMap.disabled,
            paddingVertical: 16,
            textAlign: 'center',
          }}>
          {signMode === SIGN_MODE.QR ? i18n.common.useHardWalletToScan : i18n.common.approveTransactionMessage}
        </Text>
        <AccountInfoField
          name={senderAccount?.name || ''}
          address={senderAccount?.address || ''}
          networkKey={network?.key}
          networkPrefix={network?.ss58Format}
        />

        {payload.to && renderReceiveAccount(payload.to, copyToClipboard)}

        <Toast
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={200}
        />
      </View>
    </ConfirmationBase>
  );
};
