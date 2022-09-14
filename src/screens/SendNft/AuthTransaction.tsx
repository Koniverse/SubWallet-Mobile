import { NftItem, RequestNftForceUpdate } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { PasswordField } from 'components/Field/Password';
import useFormControl from 'hooks/screen/useFormControl';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';
import { evmNftSubmitTransaction, nftForceUpdate, substrateNftSubmitTransaction } from '../../messaging';
import { SubstrateTransferParams, Web3TransferParams } from 'types/nft';
import i18n from 'utils/i18n/i18n';

interface Props {
  setShowConfirm: (val: boolean) => void;
  senderAccount: AccountJson;
  substrateTransferParams: SubstrateTransferParams | null;
  setShowResult: (val: boolean) => void;
  setExtrinsicHash: (val: string) => void;
  setIsTxSuccess: (val: boolean) => void;
  setTxError: (val: string) => void;
  nftItem: NftItem;
  collectionId: string;
  recipientAddress: string;
  chain: string;
  web3TransferParams: Web3TransferParams | null;
}

interface AddressProxy {
  isUnlockCached: boolean;
  signAddress: string | null;
  signPassword: string;
}

const AuthContainerStyle: StyleProp<ViewStyle> = {
  paddingLeft: 15,
  paddingRight: 15,
  paddingBottom: 15,
  paddingTop: 10,
};

const SubmitButtonStyle: StyleProp<ViewStyle> = {
  position: 'relative',
  borderRadius: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10,
  marginTop: 10,
};

const FeeStyle: StyleProp<TextStyle> = {
  fontSize: 16,
  marginBottom: 20,
};

const formConfig = {
  password: {
    require: true,
    name: i18n.common.passwordForThisAccount.toUpperCase(),
    value: '',
    validateFunc: validatePassword,
  },
};

const AuthTransaction = (props: Props) => {
  const {
    recipientAddress,
    substrateTransferParams,
    web3TransferParams,
    senderAccount,
    setShowResult,
    chain,
    nftItem,
    setIsTxSuccess,
    setTxError,
    setExtrinsicHash,
    collectionId,
    setShowConfirm,
  } = props;

  const { show } = useToast();

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [senderInfoSubstrate, setSenderInfoSubstrate] = useState<AddressProxy>(() => ({
    isUnlockCached: false,
    signAddress: senderAccount.address,
    signPassword: '',
  }));

  const substrateParams = substrateTransferParams !== null ? substrateTransferParams.params : null;
  const substrateGas = substrateTransferParams !== null ? substrateTransferParams.estimatedFee : null;
  const substrateBalanceError = substrateTransferParams !== null ? substrateTransferParams.balanceError : false;

  const web3Tx = web3TransferParams !== null ? web3TransferParams.rawTx : null;
  const web3Gas = web3TransferParams !== null ? web3TransferParams.estimatedGas : null;
  const web3BalanceError = web3TransferParams !== null ? web3TransferParams.balanceError : false;

  const [balanceError] = useState(substrateTransferParams !== null ? substrateBalanceError : web3BalanceError);

  const onClose = useCallback(() => {
    setShowConfirm(false);
  }, [setShowConfirm]);

  const onSendEvm = useCallback(async () => {
    if (web3Tx) {
      await evmNftSubmitTransaction(
        {
          senderAddress: senderAccount.address,
          recipientAddress,
          password: senderInfoSubstrate.signPassword,
          networkKey: chain,
          rawTransaction: web3Tx,
        },
        data => {
          if (data.passwordError) {
            setPasswordError(data.passwordError);
            setLoading(false);
          }

          if (balanceError && !data.passwordError) {
            setLoading(false);
            show('Your balance is too low to cover fees');

            return;
          }

          // if (data.callHash) {
          //   setCallHash(data.callHash);
          // }

          if (data.txError) {
            show('Encountered an error, please try again.');
            setLoading(false);

            return;
          }

          if (data.status) {
            setLoading(false);

            if (data.status) {
              setIsTxSuccess(true);
              setShowConfirm(false);
              setShowResult(true);
              setExtrinsicHash(data.transactionHash as string);
              nftForceUpdate({
                nft: nftItem,
                collectionId,
                isSendingSelf: data.isSendingSelf,
                chain,
                senderAddress: senderAccount.address,
                recipientAddress,
              } as RequestNftForceUpdate).catch(console.error);
            } else {
              setIsTxSuccess(false);
              setTxError('Error submitting transaction');
              setShowConfirm(false);
              setShowResult(true);
              setExtrinsicHash(data.transactionHash as string);
            }
          }
        },
      );
    } else {
      show('Encountered an error, please try again.');
    }
  }, [
    balanceError,
    chain,
    collectionId,
    nftItem,
    recipientAddress,
    senderAccount.address,
    senderInfoSubstrate,
    setExtrinsicHash,
    setIsTxSuccess,
    setShowConfirm,
    setShowResult,
    setTxError,
    show,
    web3Tx,
  ]);

  const onSendSubstrate = useCallback(async () => {
    await substrateNftSubmitTransaction(
      {
        params: substrateParams,
        password: senderInfoSubstrate.signPassword,
        senderAddress: senderAccount.address,
        recipientAddress,
      },
      data => {
        if (data.passwordError && data.passwordError) {
          setPasswordError(data.passwordError);
          setLoading(false);
        }

        if (balanceError && !data.passwordError) {
          setLoading(false);
          show('Your balance is too low to cover fees');

          return;
        }

        // if (data.callHash) {
        //   setCallHash(data.callHash);
        // }

        if (data.txError && data.txError) {
          show('Encountered an error, please try again.');
          setLoading(false);

          return;
        }

        if (data.status) {
          setLoading(false);

          if (data.status) {
            setIsTxSuccess(true);
            setShowConfirm(false);
            setShowResult(true);
            setExtrinsicHash(data.transactionHash as string);
            nftForceUpdate({
              nft: nftItem,
              collectionId,
              isSendingSelf: data.isSendingSelf,
              chain,
              senderAddress: senderAccount.address,
              recipientAddress,
            } as RequestNftForceUpdate).catch(console.error);
          } else {
            setIsTxSuccess(false);
            setTxError('Error submitting transaction');
            setShowConfirm(false);
            setShowResult(true);
            setExtrinsicHash(data.transactionHash as string);
          }
        }
      },
    );
  }, [
    substrateParams,
    senderInfoSubstrate.signPassword,
    senderAccount.address,
    recipientAddress,
    balanceError,
    show,
    setIsTxSuccess,
    setShowConfirm,
    setShowResult,
    setExtrinsicHash,
    nftItem,
    collectionId,
    chain,
    setTxError,
  ]);

  const handleSignAndSubmit = useCallback(() => {
    if (loading) {
      return;
    }
    Keyboard.dismiss();

    if (balanceError) {
      show('Your balance is too low to cover fees');
      return;
    }
    setLoading(true);

    setTimeout(async () => {
      if (substrateParams !== null) {
        await onSendSubstrate();
      } else if (web3Tx !== null) {
        await onSendEvm();
      }
    }, 10);
  }, [loading, balanceError, show, substrateParams, web3Tx, onSendSubstrate, onSendEvm]);

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, { onSubmitForm: handleSignAndSubmit });

  const handlerChangePassword = useCallback(
    (val: string) => {
      setSenderInfoSubstrate(old => {
        return {
          ...old,
          signPassword: val,
        };
      });
      onChangeValue('password')(val);
    },
    [onChangeValue],
  );

  useEffect((): void => {
    setPasswordError(null);
  }, [senderInfoSubstrate]);

  return (
    <ContainerWithSubHeader
      title={i18n.title.authorizeTransaction}
      onPressBack={onClose}
      style={{ width: '100%', height: '100%', top: 0 }}>
      <View style={AuthContainerStyle}>
        <Text style={FeeStyle}>Fees of {substrateGas || web3Gas} will be applied to the submission</Text>

        <AddressField label={'Sending from my account'} address={senderAccount.address} />

        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          onChangeText={handlerChangePassword}
          defaultValue={formState.data.password}
          errorMessages={formState.errors.password || [passwordError]}
          onSubmitField={onSubmitField('password')}
        />

        <TouchableOpacity
          style={[
            SubmitButtonStyle,
            {
              backgroundColor: loading ? 'rgba(0, 75, 255, 0.25)' : ColorMap.secondary,
            },
          ]}
          onPress={handleSignAndSubmit}>
          {!loading ? <Text>Sign and Submit</Text> : <ActivityIndicator animating={true} />}
        </TouchableOpacity>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AuthTransaction);
