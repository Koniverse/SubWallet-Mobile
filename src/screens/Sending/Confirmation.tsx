import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { NetworkField } from 'components/Field/Network';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { RequestCheckTransfer, TransferStep } from '@subwallet/extension-base/background/KoniTypes';
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

interface Props {
  requestPayload: RequestCheckTransfer;
  feeInfo: [string | null, number, string]; // fee, fee decimal, fee symbol
  balanceFormat: BalanceFormatType;
  onChangeResult: (txResult: TransferResultType) => void;
}

export const Confirmation = ({
  balanceFormat,
  requestPayload,
  onChangeResult,
  feeInfo: [fee, feeDecimals, feeSymbol],
}: Props) => {
  const {
    accounts: { currentAccount },
  } = useSelector((state: RootState) => state);
  const [password, setPassword] = useState<string>('');
  const [isBusy, setBusy] = useState(false);
  const [isKeyringErr, setKeyringErr] = useState<boolean>(false);
  const [errorArr, setErrorArr] = useState<string[]>([]);
  const _doTransfer = useCallback(
    (): void => {
      setBusy(true);

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
            setBusy(false);
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

  return (
    <>
      <ScrollView style={{ ...sharedStyles.layoutContainer }}>
        <View style={{ flex: 1, paddingBottom: 8 }}>
          <TransferValue
            token={requestPayload.token || ''}
            value={requestPayload.value || '0'}
            decimals={balanceFormat[0]}
          />
          <NetworkField label={'Network'} networkKey={requestPayload.networkKey} />
          <TextField label={'Account'} text={currentAccount?.name || ''} />
          <AddressField label={'Send from Address'} address={requestPayload.from} />
          <AddressField label={'Send to Address'} address={requestPayload.to} autoFormat={false} />
          <BalanceField label={'Network Fee'} value={fee || '0'} token={feeSymbol} decimal={feeDecimals} />
          <PasswordField
            label={'Password'}
            value={password}
            onChangeText={text => {
              setPassword(text);
              setKeyringErr(false);
            }}
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
        title={'Confirm'}
        onPress={_doTransfer}
      />
    </>
  );
};
