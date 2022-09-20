import { formatBalance } from '@polkadot/util';
import { NftItem, RequestNftForceUpdate } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { NetworkField } from 'components/Field/Network';
import { PasswordField } from 'components/Field/Password';
import ImagePreview from 'components/ImagePreview';
import useFormControl from 'hooks/screen/useFormControl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontSemiBold,
  MarginBottomForSubmitButton,
  sharedStyles,
} from 'styles/sharedStyles';
import { SubstrateTransferParams, Web3TransferParams } from 'types/nft';
import i18n from 'utils/i18n/i18n';
import { evmNftSubmitTransaction, nftForceUpdate, substrateNftSubmitTransaction } from '../../messaging';
import { SubmitButton } from 'components/SubmitButton';
import { Warning } from 'components/Warning';

interface Props {
  setShowConfirm: (val: boolean) => void;
  senderAccount: AccountJson;
  substrateTransferParams: SubstrateTransferParams | null;
  collectionImage?: string;
  setShowResult: (val: boolean) => void;
  setExtrinsicHash: (val: string) => void;
  setIsTxSuccess: (val: boolean) => void;
  setTxError: (val: string) => void;
  nftItem: NftItem;
  collectionId: string;
  recipientAddress: string;
  chain: string;
  web3TransferParams: Web3TransferParams | null;
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

interface AddressProxy {
  isUnlockCached: boolean;
  signAddress: string | null;
  signPassword: string;
}

interface FeeInfo {
  value: string;
  symbol: string;
}

const AuthContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  marginTop: 10,
};

const ImageContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: 182,
  height: 182,
  borderRadius: 10,
};

const NftNameTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginTop: 8,
  marginBottom: 16,
  textAlign: 'center',
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
    collectionImage,
    chain,
    nftItem,
    setIsTxSuccess,
    setTxError,
    setExtrinsicHash,
    collectionId,
    setShowConfirm,
    loading,
    setLoading,
  } = props;
  const [passwordError, setPasswordError] = useState<string | null>(null);
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

  const balanceError = substrateTransferParams !== null ? substrateBalanceError : web3BalanceError;

  const [error, setError] = useState<string>('');

  const feeInfo = useMemo((): FeeInfo => {
    const raw = substrateGas || web3Gas || '0';

    return {
      value: raw.split(' ')[0] || '0',
      symbol: raw.split(' ')[1] || 'Token',
    };
  }, [substrateGas, web3Gas]);

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
            return;
          }

          if (balanceError && !data.passwordError) {
            setLoading(false);
            setError(i18n.errorMessage.transferNFTBalanceError);

            return;
          }

          // if (data.callHash) {
          //   setCallHash(data.callHash);
          // }

          if (data.txError) {
            setError(i18n.errorMessage.transferNFTTxError);
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
      setError(i18n.errorMessage.transferNFTTxError);
    }
  }, [
    balanceError,
    chain,
    collectionId,
    nftItem,
    recipientAddress,
    senderAccount.address,
    senderInfoSubstrate.signPassword,
    setExtrinsicHash,
    setIsTxSuccess,
    setLoading,
    setShowConfirm,
    setShowResult,
    setTxError,
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
          setError(i18n.errorMessage.transferNFTBalanceError);

          return;
        }

        // if (data.callHash) {
        //   setCallHash(data.callHash);
        // }

        if (data.txError && data.txError) {
          setError(i18n.errorMessage.transferNFTTxError);
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
    setLoading,
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

    setLoading(true);
    Keyboard.dismiss();
    setTimeout(async () => {
      if (substrateParams !== null) {
        await onSendSubstrate();
      } else if (web3Tx !== null) {
        await onSendEvm();
      }
    }, 10);
  }, [loading, setLoading, substrateParams, web3Tx, onSendSubstrate, onSendEvm]);

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

  const errorMessages = [
    ...(formState.errors.password ? formState.errors.password : []),
    ...(passwordError ? [passwordError] : []),
  ];

  return (
    <ContainerWithSubHeader title={i18n.title.transferNft} onPressBack={onClose} disabled={loading}>
      <>
        <ScrollView style={AuthContainerStyle}>
          <View style={ImageContainerStyle}>
            <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionImage} />
          </View>
          <Text style={NftNameTextStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>

          <AddressField label={i18n.common.sendFromAddress} address={senderAccount.address} />
          <AddressField label={i18n.common.sendToAddress} address={recipientAddress} />
          <NetworkField label={i18n.common.network} networkKey={nftItem.chain || ''} />
          <BalanceField
            label={i18n.common.networkFee}
            value={feeInfo.value}
            token={feeInfo.symbol}
            decimal={0}
            si={formatBalance.findSi('-')}
          />

          <PasswordField
            ref={formState.refs.password}
            label={formState.labels.password}
            onChangeText={handlerChangePassword}
            defaultValue={formState.data.password}
            errorMessages={errorMessages}
            onSubmitField={onSubmitField('password')}
            autoFocus={true}
          />

          {!!error && <Warning message={error} isDanger />}
        </ScrollView>
        <View style={{ ...ContainerHorizontalPadding, marginTop: 16 }}>
          <SubmitButton
            style={{ width: '100%', ...MarginBottomForSubmitButton }}
            title={i18n.common.confirm}
            onPress={handleSignAndSubmit}
            isBusy={loading}
            disabled={!formState.data.password || errorMessages.length > 0}
          />
        </View>
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AuthTransaction);
