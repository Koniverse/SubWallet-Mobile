import React, { useState } from 'react';
import { Keyboard, ScrollView, StyleProp, Text, View } from 'react-native';
import { FontMedium, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import {
  NetworkJson,
  RequestCheckCrossChainTransfer,
  RequestCheckTransfer,
  ResponseTransfer,
  TransferError,
  TransferStep,
} from '@subwallet/extension-base/background/KoniTypes';
import { AddressField } from 'components/Field/Address';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import { makeCrossChainTransfer, makeTransfer } from '../../messaging';
import { TransferResultType } from 'types/tx';
import { TransferValue } from 'components/TransferValue';
import { BalanceFormatType } from 'types/ui-types';
import { SiDef } from '@polkadot/util/types';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import PasswordModal from 'components/Modal/PasswordModal';
import { BalanceVal } from 'components/BalanceVal';
import { ColorMap } from 'styles/color';
import { getBalanceWithSi } from 'utils/index';
import { CustomField } from 'components/Field/Custom';
import { ChainSelectContainer } from 'screens/Sending/Field/ChainSelectContainer';

const balanceValTextStyle: StyleProp<any> = { ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium };

interface TransferInfoType {
  originNetworkKey: string;
  destinationNetworkKey: string;
  from: string;
  to: string;
  value?: string;
  transferAll?: boolean;
  token?: string;
}

interface Props {
  requestPayload: TransferInfoType;
  feeInfo: [string | null, number, string]; // fee, fee decimal, fee symbol
  balanceFormat: BalanceFormatType;
  onChangeResult: (txResult: TransferResultType) => void;
  isBusy: boolean;
  onChangeBusy: (isBusy: boolean) => void;
  si: SiDef;
}

function getNetworkPrefix(networkKey: string, networkMap: Record<string, NetworkJson>): number | undefined {
  if (networkMap[networkKey]) {
    return networkMap[networkKey].ss58Format;
  }

  return;
}

export const Confirmation = ({
  balanceFormat,
  requestPayload,
  onChangeResult,
  feeInfo: [fee, feeDecimals, feeSymbol],
  isBusy,
  si,
  onChangeBusy,
}: Props) => {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const originAccountPrefix = getNetworkPrefix(requestPayload.originNetworkKey, networkMap);
  const destinationAccountPrefix = getNetworkPrefix(requestPayload.destinationNetworkKey, networkMap);
  const onChainTransferRequestPayload: RequestCheckTransfer = {
    networkKey: requestPayload.originNetworkKey,
    from: requestPayload.from,
    to: requestPayload.to,
    value: requestPayload.value,
    transferAll: requestPayload.transferAll,
    token: requestPayload.token,
  };

  const crossChainTransferRequestPayload: RequestCheckCrossChainTransfer = {
    originNetworkKey: requestPayload.originNetworkKey,
    destinationNetworkKey: requestPayload.destinationNetworkKey,
    from: requestPayload.from,
    to: requestPayload.to,
    value: requestPayload.value || '0',
    transferAll: requestPayload.transferAll,
    token: requestPayload.token || '0',
  };

  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  useHandlerHardwareBackPress(isBusy);

  const assetValue = getBalanceWithSi(
    requestPayload.value || '0',
    balanceFormat[0],
    si,
    requestPayload.token || 'Token',
  )[0];

  const feeValue = getBalanceWithSi(fee || '0', feeDecimals, si, feeSymbol)[0];
  console.log('feeValue', getBalanceWithSi(fee || '0', feeDecimals, si, feeSymbol));
  const handlerCallbackResponseResult = (rs: ResponseTransfer) => {
    if (!rs.isFinalized) {
      if (rs.step === TransferStep.SUCCESS.valueOf()) {
        onChangeResult({
          isShowTxResult: true,
          isTxSuccess: rs.step === TransferStep.SUCCESS.valueOf(),
          extrinsicHash: rs.extrinsicHash,
        });
      } else if (rs.step === TransferStep.ERROR.valueOf()) {
        onChangeResult({
          isShowTxResult: true,
          isTxSuccess: rs.step === TransferStep.SUCCESS.valueOf(),
          extrinsicHash: rs.extrinsicHash,
          txError: rs.errors,
        });
      }
    }
  };

  const handlerResponseError = (errors: TransferError[]) => {
    const errorMessages = errors.map(err => err.message);
    setErrorArr(errorMessages);
    if (errorMessages && errorMessages.length) {
      onChangeBusy(false);
    }
  };

  const _doTransfer = (password: string): void => {
    Keyboard.dismiss();
    onChangeBusy(true);

    makeTransfer(
      {
        ...onChainTransferRequestPayload,
        password,
      },
      handlerCallbackResponseResult,
    )
      .then(handlerResponseError)
      .catch(e => console.log('There is problem when makeTransfer', e));
  };

  const _doXcmTransfer = (password: string): void => {
    onChangeBusy(true);
    makeCrossChainTransfer(
      {
        ...crossChainTransferRequestPayload,
        password,
      },
      handlerCallbackResponseResult,
    )
      .then(handlerResponseError)
      .catch(e => console.log('There is problem when makeTransfer', e));
  };

  return (
    <>
      <ScrollView style={{ ...sharedStyles.layoutContainer }}>
        <View style={{ flex: 1, paddingBottom: 8 }}>
          <TransferValue
            token={requestPayload.token || ''}
            value={requestPayload.value || '0'}
            si={si}
            decimals={balanceFormat[0]}
          />
          <ChainSelectContainer
            originChain={requestPayload.originNetworkKey}
            destinationChain={requestPayload.destinationNetworkKey}
            disabled={true}
          />
          <AddressField
            label={i18n.sendAssetScreen.fromAccount}
            address={requestPayload.from}
            networkPrefix={originAccountPrefix}
            showRightIcon={false}
          />
          <AddressField
            label={i18n.sendAssetScreen.toAccount}
            address={requestPayload.to}
            networkPrefix={destinationAccountPrefix}
            showRightIcon={false}
          />

          <BalanceField
            label={i18n.sendAssetScreen.originChainFee}
            value={fee || '0'}
            si={si}
            token={feeSymbol}
            decimal={feeDecimals}
          />

          <CustomField label={i18n.sendAssetScreen.total}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10 }}>
              <BalanceVal
                value={assetValue}
                balanceValTextStyle={balanceValTextStyle}
                symbol={requestPayload.token || 'Token'}
              />
              <Text style={balanceValTextStyle}> + </Text>
              <BalanceVal value={feeValue} balanceValTextStyle={balanceValTextStyle} symbol={feeSymbol} />
            </View>
          </CustomField>
        </View>

        <PasswordModal
          isBusy={isBusy}
          visible={modalVisible}
          closeModal={() => setModalVisible(false)}
          onConfirm={password => {
            if (requestPayload.originNetworkKey === requestPayload.destinationNetworkKey) {
              _doTransfer(password);
            } else {
              _doXcmTransfer(password);
            }
          }}
          errorArr={errorArr}
          setErrorArr={setErrorArr}
        />
      </ScrollView>

      <SubmitButton
        isBusy={isBusy}
        style={{ ...MarginBottomForSubmitButton, marginHorizontal: 16, marginTop: 16 }}
        title={i18n.common.send}
        onPress={() => setModalVisible(true)}
      />
    </>
  );
};
