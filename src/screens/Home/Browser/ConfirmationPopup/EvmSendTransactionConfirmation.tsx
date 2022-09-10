import React, { useCallback, useRef, useState } from 'react';
import {
  ConfirmationsQueue,
  EVMTransactionArg,
  NetworkJson,
  ResponseParseEVMTransactionInput,
} from '@subwallet/extension-base/background/KoniTypes';
import { getHostName } from 'utils/browser';
import { ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { ColorMap } from 'styles/color';
import { toShort } from 'utils/index';
import { FontMedium, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { Divider } from 'components/Divider';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import useGetEvmTransactionInfos from 'hooks/screen/Home/Browser/ConfirmationPopup/useGetEvmTransactionInfos';
import { AccountJson } from '@subwallet/extension-base/background/types';
import i18n from 'utils/i18n/i18n';
import FormatBalance from 'components/FormatBalance';
import { BN } from '@polkadot/util';
import { ConfirmationBase } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase';
import { ConfirmationHookType } from 'hooks/types';
import { renderCurrentChain, renderTargetAccount } from 'screens/Home/Browser/ConfirmationPopup/shared';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-notifications';
import { deviceHeight } from '../../../../constant';
import ToastContainer from 'react-native-toast-notifications';

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 80;
enum TAB_SELECTION_TYPE {
  BASIC,
  HEX,
  DETAIL,
}

export const XCM_METHOD = 'transfer(address,uint256,(uint8,bytes[]),uint64)';
export const XCM_ARGS = ['currency_address', 'amount'];

interface Props {
  network?: NetworkJson;
  payload: ConfirmationsQueue['evmSendTransactionRequest'][0];
  cancelRequest: ConfirmationHookType['cancelRequest'];
  approveRequest: ConfirmationHookType['approveRequest'];
}

interface TabOptionProps {
  key: TAB_SELECTION_TYPE;
  label: string;
}

const CONFIRMATION_TYPE = 'evmSendTransactionRequest';

const textStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontMedium, color: ColorMap.light };

const subTextStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled };

function getTabStyle(isSelected: boolean) {
  return {
    borderBottomWidth: isSelected ? 2 : 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderColor: ColorMap.light,
  };
}

function getTabTextStyle(isSelected: boolean) {
  return {
    ...textStyle,
    color: isSelected ? ColorMap.light : ColorMap.disabled,
  };
}

const receiveAccountWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
};

const valueWrapperStyle: StyleProp<any> = { flexDirection: 'row', alignItems: 'center' };

const scrollViewStyle: StyleProp<any> = { maxHeight: 200, marginVertical: 16, width: '100%', paddingHorizontal: 16 };

const renderReceiveAccount = (receiveAddress: string, onPressCopyButton: (text: string) => void) => {
  return (
    <View style={receiveAccountWrapperStyle}>
      <View style={valueWrapperStyle}>
        <SubWalletAvatar address={receiveAddress} size={20} />
        <View style={{ paddingLeft: 8 }}>
          <Text style={textStyle}>{i18n.common.defaultReceiveAccountName}</Text>
          <Text style={subTextStyle}>{toShort(receiveAddress, 12, 12)}</Text>
        </View>
      </View>
      <IconButton icon={CopySimple} onPress={() => onPressCopyButton(receiveAddress)} />
    </View>
  );
};

const renderSenderAccountAndTransactionFrom = (chain?: string, networkKey?: string, senderAccount?: AccountJson) => {
  return (
    <View style={{ alignItems: 'center', paddingTop: 16, flexDirection: 'row' }}>
      {senderAccount && renderTargetAccount(senderAccount.address, senderAccount.name)}

      <Text style={[textStyle, { paddingHorizontal: 8 }]}>on</Text>
      {networkKey && renderCurrentChain(networkKey, chain)}
    </View>
  );
};

export const EvmSendTransactionConfirmation = ({
  payload: { networkKey, payload, url, id: confirmationId },
  network,
  cancelRequest,
  approveRequest,
}: Props) => {
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const senderAccount = accounts.find(acc => acc.address === payload.from);
  const [selectedTab, setSelectedTab] = useState<TAB_SELECTION_TYPE>(TAB_SELECTION_TYPE.BASIC);
  const { inputInfo, XCMToken } = useGetEvmTransactionInfos(payload, network);
  const handleChangeTab = (tabIndex: TAB_SELECTION_TYPE) => setSelectedTab(tabIndex);
  const toastRef = useRef<ToastContainer>(null);
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (toastRef.current) {
      toastRef.current.hideAll();
      toastRef.current.show(i18n.common.copiedToClipboard);
    }
  };

  const handleRenderTab = useCallback(() => {
    const arr: TabOptionProps[] = [
      {
        key: TAB_SELECTION_TYPE.BASIC,
        label: i18n.common.info,
      },
    ];

    if (payload.data) {
      arr.push({
        key: TAB_SELECTION_TYPE.HEX,
        label: i18n.common.hexData,
      });
    }

    if (inputInfo && typeof inputInfo.result !== 'string') {
      arr.push({
        key: TAB_SELECTION_TYPE.DETAIL,
        label: i18n.common.detail,
      });
    }

    if (arr.length > 1) {
      return (
        <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 16 }}>
          {arr.map(item => {
            const isSelected = selectedTab === item.key;

            return (
              <TouchableOpacity
                activeOpacity={1}
                key={item.key}
                onPress={() => handleChangeTab(item.key)}
                style={getTabStyle(isSelected)}>
                <Text style={getTabTextStyle(isSelected)}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    } else {
      return null;
    }
  }, [inputInfo, selectedTab, payload.data]);

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
        <View key={_name}>
          <Text style={textStyle}>{_name}:</Text>
          <Text style={subTextStyle}>{_value}</Text>
        </View>
      );
    },
    [XCMToken],
  );

  const handleRenderInputInfo = useCallback(
    (response: ResponseParseEVMTransactionInput) => {
      const info = response.result;
      if (typeof info === 'string') {
        return (
          <Text>
            <Text style={textStyle}>{i18n.common.data}</Text>
            <Text style={subTextStyle}>{info}</Text>
          </Text>
        );
      }

      const argName = info.args.map(i => i.name);
      const isXcmTransaction = XCM_METHOD === info.methodName && XCM_ARGS.every(s => argName.includes(s));

      return (
        <ScrollView showsVerticalScrollIndicator={false} style={scrollViewStyle}>
          <View>
            <Text style={textStyle}>Method</Text>
            <Text style={subTextStyle}>{info.methodName}</Text>
          </View>
          <View>
            <Text style={textStyle}>{i18n.common.arguments}</Text>
            <View>{info.args.map(value => handlerRenderArg(value, '', isXcmTransaction))}</View>
          </View>
        </ScrollView>
      );
    },
    [handlerRenderArg],
  );

  const handleRenderContent = useCallback(() => {
    switch (selectedTab) {
      case TAB_SELECTION_TYPE.DETAIL:
        if (!inputInfo || typeof inputInfo.result === 'string') {
          return null;
        }

        return handleRenderInputInfo(inputInfo);
      case TAB_SELECTION_TYPE.HEX:
        if (!payload.data) {
          return null;
        }

        return (
          <ScrollView showsVerticalScrollIndicator={false} style={scrollViewStyle}>
            <Text style={textStyle}>{i18n.common.data}</Text>
            <Text style={subTextStyle}>{payload.data}</Text>
          </ScrollView>
        );
      case TAB_SELECTION_TYPE.BASIC:
      default:
        return (
          <ScrollView showsVerticalScrollIndicator={false} style={scrollViewStyle}>
            {payload.value && (
              <View>
                <Text style={textStyle}>{i18n.common.amount}</Text>
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
              <View>
                <Text style={textStyle}>{i18n.common.estimateGas}</Text>
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
          </ScrollView>
        );
    }
  }, [
    selectedTab,
    inputInfo,
    handleRenderInputInfo,
    payload.data,
    payload.value,
    payload.estimateGas,
    network?.decimals,
    network?.nativeToken,
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
        title: 'request to send payload from',
        hostName: getHostName(url),
      }}
      isShowPassword={true}
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}>
      <>
        {renderSenderAccountAndTransactionFrom(network?.chain, networkKey, senderAccount)}
        <Divider style={{ marginVertical: 24, paddingHorizontal: 16 }} />

        {payload.to && renderReceiveAccount(payload.to, copyToClipboard)}

        {handleRenderTab()}
        {handleRenderContent()}

        {
          <Toast
            duration={1500}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={OFFSET_BOTTOM}
          />
        }
      </>
    </ConfirmationBase>
  );
};
