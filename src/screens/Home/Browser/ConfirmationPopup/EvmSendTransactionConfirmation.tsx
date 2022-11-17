import { Warning } from 'components/Warning';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ConfirmationsQueue,
  EVMTransactionArg,
  NetworkJson,
  ResponseParseEVMContractInput,
} from '@subwallet/extension-base/background/KoniTypes';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { toShort } from 'utils/index';
import { FontMedium, FontSize0, FontSize2, sharedStyles } from 'styles/sharedStyles';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import useGetEvmTransactionInfos from 'hooks/screen/Home/Browser/ConfirmationPopup/useGetEvmTransactionInfos';
import i18n from 'utils/i18n/i18n';
import FormatBalance from 'components/FormatBalance';
import { BN } from '@polkadot/util';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import { ConfirmationHookType } from 'hooks/types';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import { AccountInfoField } from 'components/Field/AccountInfo';

export const XCM_METHOD = 'transfer(address,uint256,(uint8,bytes[]),uint64)';
export const XCM_ARGS = ['currency_address', 'amount'];

interface Props {
  network?: NetworkJson;
  payload: ConfirmationsQueue['evmSendTransactionRequest'][0];
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

const CONFIRMATION_TYPE = 'evmSendTransactionRequest';

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

const WarningStyle: StyleProp<any> = {
  marginVertical: 8,
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
  payload: { payload, url, id: confirmationId },
  network,
  cancelRequest,
  approveRequest,
}: Props) => {
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const senderAccount = accounts.find(
    acc => payload.from && typeof payload.from === 'string' && acc.address.toLowerCase() === payload.from.toLowerCase(),
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

  const onPressCancelButton = () => {
    return cancelRequest(CONFIRMATION_TYPE, confirmationId);
  };

  const onPressSubmitButton = (password: string) => {
    return approveRequest(CONFIRMATION_TYPE, confirmationId, { password });
  };

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.title.sendTransaction,
        url: url,
      }}
      isShowPassword={!senderAccount?.isReadOnly}
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
        isSubmitButtonDisabled: senderAccount?.isReadOnly,
      }}
      detailModalVisible={modalVisible}
      onChangeDetailModalVisible={() => setModalVisible(false)}
      onPressViewDetail={() => setModalVisible(true)}
      detailModalContent={detailModalContent}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, paddingVertical: 16 }}>
          {i18n.common.approveTransactionMessage}
        </Text>
        <AccountInfoField
          name={senderAccount?.name || ''}
          address={senderAccount?.address || ''}
          networkKey={network?.key}
          networkPrefix={network?.ss58Format}
        />

        {payload.to && renderReceiveAccount(payload.to, copyToClipboard)}

        {!!senderAccount?.isReadOnly && (
          <Warning isDanger style={WarningStyle} message={i18n.warningMessage.readOnly} />
        )}

        {
          <Toast
            duration={1500}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={200}
          />
        }
      </View>
    </ConfirmationBase>
  );
};
