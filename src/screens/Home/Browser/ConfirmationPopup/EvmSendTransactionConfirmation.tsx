import React, { useCallback, useRef, useState } from 'react';
import {
  ConfirmationsQueue,
  EVMTransactionArg,
  NetworkJson,
  ResponseParseEVMTransactionInput,
} from '@subwallet/extension-base/background/KoniTypes';
import { ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
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

const textStyle: StyleProp<any> = { ...sharedStyles.smallText, ...FontSize0, ...FontMedium, color: ColorMap.light };

const subTextStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled };

function getTabStyle(isSelected: boolean) {
  return {
    borderBottomWidth: isSelected ? 2 : 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderColor: ColorMap.light,
    marginBottom: 8,
  };
}

function getTabTextStyle(isSelected: boolean) {
  return {
    ...textStyle,
    ...FontSize2,
    color: isSelected ? ColorMap.light : ColorMap.disabled,
  };
}

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
  payload: { payload, url, id: confirmationId },
  network,
  cancelRequest,
  approveRequest,
}: Props) => {
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const senderAccount = accounts.find(acc => acc.address === payload.from);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
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
        <View style={{ flexDirection: 'row', width: '100%' }}>
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
        <View style={scrollViewStyle}>
          <View>
            <Text style={textStyle}>Method</Text>
            <Text style={subTextStyle}>{info.methodName}</Text>
          </View>
          <View>
            <Text style={textStyle}>{i18n.common.arguments}</Text>
            <View>{info.args.map(value => handlerRenderArg(value, '', isXcmTransaction))}</View>
          </View>
        </View>
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
          <View style={scrollViewStyle}>
            <Text style={textStyle}>{i18n.common.data}</Text>
            <Text style={subTextStyle}>{payload.data}</Text>
          </View>
        );
      case TAB_SELECTION_TYPE.BASIC:
      default:
        return (
          <View style={scrollViewStyle}>
            {payload.value && (
              <View>
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
              <View>
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
          </View>
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

  const renderTransactionData = () => {
    return (
      <ScrollView style={{ width: '100%', marginTop: 32, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
        {handleRenderTab()}
        {handleRenderContent()}
      </ScrollView>
    );
  };

  return (
    <ConfirmationBase
      headerProps={{
        title: i18n.title.sendTransaction,
        url: url,
      }}
      isShowPassword={true}
      footerProps={{
        cancelButtonTitle: i18n.common.cancel,
        submitButtonTitle: i18n.common.approve,
        onPressCancelButton: onPressCancelButton,
        onPressSubmitButton: onPressSubmitButton,
      }}
      detailModalVisible={modalVisible}
      onChangeDetailModalVisible={() => setModalVisible(false)}
      onPressViewDetail={() => setModalVisible(true)}
      renderDetailModalContent={renderTransactionData}>
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
