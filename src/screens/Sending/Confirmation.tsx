import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { NetworkField } from 'components/Field/Network';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { NetworkJson, RequestCheckTransfer, TransferStep } from '@subwallet/extension-base/background/KoniTypes';
import { AddressField } from 'components/Field/Address';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TextField } from 'components/Field/Text';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import { PasswordField } from 'components/Field/Password';
import { makeTransfer } from '../../messaging';
import { TransferResultType } from 'types/tx';
import { Warning } from 'components/Warning';
import { TransferValue } from 'components/TransferValue';
import { BalanceFormatType } from 'types/ui-types';
import { SiDef } from '@polkadot/util/types';
import i18n from 'utils/i18n/i18n';

interface Props {
  requestPayload: RequestCheckTransfer;
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
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const [password, setPassword] = useState<string>('');
  const [isKeyringErr, setKeyringErr] = useState<boolean>(false);
  const [errorArr, setErrorArr] = useState<string[]>([]);
  const networkPrefix = getNetworkPrefix(requestPayload.networkKey, networkMap);
  const accountName = accounts.find(acc => acc.address === requestPayload.from)?.name;
  const _doTransfer = useCallback(
    (): void => {
      onChangeBusy(true);

      makeTransfer(
        {
          ...requestPayload,
          password,
        },
        rs => {
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
        },
      )
        .then(errors => {
          const errorMessage = errors.map(err => err.message);

          if (errors.find(err => err.code === 'keyringError')) {
            setKeyringErr(true);
          }

          setErrorArr(errorMessage);

          if (errorMessage && errorMessage.length) {
            onChangeBusy(false);
          }
        })
        .catch(e => console.log('There is problem when makeTransfer', e));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      password,
      onChangeResult,
      requestPayload.networkKey,
      requestPayload.from,
      requestPayload.to,
      requestPayload.value,
      requestPayload.transferAll,
      requestPayload.token,
    ],
  );

  const renderError = () => {
    return errorArr.map(err => <Warning isDanger key={err} message={err} />);
  };

  const onChangePassword = (text: string) => {
    setPassword(text);
    setKeyringErr(false);
    setErrorArr([]);
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
          <NetworkField label={i18n.common.network} networkKey={requestPayload.networkKey} />
          <TextField label={i18n.common.account} text={accountName || ''} />
          <AddressField
            label={i18n.common.sendFromAddress}
            address={requestPayload.from}
            networkPrefix={networkPrefix}
          />
          <AddressField label={i18n.common.sendToAddress} address={requestPayload.to} />
          <BalanceField
            label={i18n.common.networkFee}
            value={fee || '0'}
            si={si}
            token={feeSymbol}
            decimal={feeDecimals}
          />
          <PasswordField
            label={i18n.common.password}
            value={password}
            onChangeText={onChangePassword}
            isBusy={isBusy}
            isError={isKeyringErr || password.length < 6}
          />

          {renderError()}
        </View>
      </ScrollView>

      <SubmitButton
        disabled={!password || password.length < 6}
        isBusy={isBusy}
        style={{ ...MarginBottomForSubmitButton, marginHorizontal: 16, marginTop: 8 }}
        title={i18n.common.send}
        onPress={_doTransfer}
      />
    </>
  );
};
