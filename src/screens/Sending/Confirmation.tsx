import SigningRequest from 'components/Signing/SigningRequest';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { SigningContext } from 'providers/SigningContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import {
  NetworkJson,
  RequestCheckCrossChainTransfer,
  RequestCheckTransfer,
} from '@subwallet/extension-base/background/KoniTypes';
import { AddressField } from 'components/Field/Address';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceField } from 'components/Field/Balance';
import { makeCrossChainTransfer, makeCrossChainTransferQr, makeTransfer, makeTransferQr } from '../../messaging';
import { TransferResultType } from 'types/tx';
import { TransferValue } from 'components/TransferValue';
import { BalanceFormatType } from 'types/ui-types';
import { SiDef } from '@polkadot/util/types';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { BalanceVal } from 'components/BalanceVal';
import { ColorMap } from 'styles/color';
import { getBalanceWithSi } from 'utils/index';
import { CustomField } from 'components/Field/Custom';
import { ChainSelectContainer } from 'screens/Sending/Field/ChainSelectContainer';
import { SendFromAddressField } from 'screens/Sending/Field/SendFromAddressField';
import { noop } from 'utils/function';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';

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
  si: SiDef;
}

export function getNetworkPrefix(networkKey: string, networkMap: Record<string, NetworkJson>): number | undefined {
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
  si,
}: Props) => {
  const {
    signingState: { isCreating, isSubmitting },
  } = useContext(SigningContext);
  useHandlerHardwareBackPress(isCreating || isSubmitting);

  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const originAccountPrefix = getNetworkPrefix(requestPayload.originNetworkKey, networkMap);
  const destinationAccountPrefix = getNetworkPrefix(requestPayload.destinationNetworkKey, networkMap);

  const onChainTransferRequestPayload = useMemo(
    (): RequestCheckTransfer => ({
      networkKey: requestPayload.originNetworkKey,
      from: requestPayload.from,
      to: requestPayload.to,
      value: requestPayload.value,
      transferAll: requestPayload.transferAll,
      token: requestPayload.token,
    }),
    [requestPayload],
  );

  const crossChainTransferRequestPayload = useMemo(
    (): RequestCheckCrossChainTransfer => ({
      originNetworkKey: requestPayload.originNetworkKey,
      destinationNetworkKey: requestPayload.destinationNetworkKey,
      from: requestPayload.from,
      to: requestPayload.to,
      value: requestPayload.value || '0',
      transferAll: requestPayload.transferAll,
      token: requestPayload.token || '0',
    }),
    [requestPayload],
  );

  const sender = useGetAccountByAddress(requestPayload.from);
  const network = useGetNetworkJson(requestPayload.originNetworkKey);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      onChangeResult({
        isShowTxResult: true,
        isTxSuccess: false,
        extrinsicHash: extrinsicHash,
        txError: errors,
      });
    },
    [onChangeResult],
  );

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      onChangeResult({
        isShowTxResult: true,
        isTxSuccess: true,
        extrinsicHash: extrinsicHash,
      });
    },
    [onChangeResult],
  );

  const assetValue = getBalanceWithSi(
    requestPayload.value || '0',
    balanceFormat[0],
    si,
    requestPayload.token || 'Token',
  )[0];

  const feeValue = getBalanceWithSi(fee || '0', feeDecimals, si, feeSymbol)[0];

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
          <SendFromAddressField
            senderAddress={requestPayload.from}
            onChangeAddress={noop}
            disabled={true}
            networkPrefix={originAccountPrefix}
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

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}
        </View>
      </ScrollView>
      {requestPayload.originNetworkKey === requestPayload.destinationNetworkKey ? (
        <SigningRequest
          account={sender}
          baseProps={{
            buttonText: i18n.common.send,
            submitText: i18n.common.sending,
          }}
          detailError={true}
          handleSignPassword={makeTransfer}
          handleSignQr={makeTransferQr}
          message={'There is problem when makeTransfer'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={onChainTransferRequestPayload}
          style={ContainerHorizontalPadding}
        />
      ) : (
        <SigningRequest
          account={sender}
          baseProps={{
            buttonText: i18n.common.send,
            submitText: i18n.common.sending,
          }}
          detailError={true}
          handleSignPassword={makeCrossChainTransfer}
          handleSignQr={makeCrossChainTransferQr}
          message={'There is problem when xcmTransfer'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={crossChainTransferRequestPayload}
          style={ContainerHorizontalPadding}
        />
      )}
    </>
  );
};
