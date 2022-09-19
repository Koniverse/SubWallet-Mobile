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
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
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
import { ButtonStyle, FontSemiBold, sharedStyles, TextButtonStyle } from 'styles/sharedStyles';
import { SubstrateTransferParams, Web3TransferParams } from 'types/nft';
import i18n from 'utils/i18n/i18n';
import { evmNftSubmitTransaction, nftForceUpdate, substrateNftSubmitTransaction } from '../../messaging';

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
  paddingLeft: 15,
  paddingRight: 15,
  paddingBottom: 15,
  paddingTop: 10,
};

const ImageContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: 200,
  height: 200,
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

const SubmitButtonStyle: StyleProp<ViewStyle> = {
  ...ButtonStyle,
  marginTop: 16,
};

const SubmitButtonTextStyle: StyleProp<TextStyle> = {
  ...TextButtonStyle,
  color: ColorMap.light,
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

  const nftName = useMemo((): string => {
    return nftItem.name ? nftItem.name : '#' + nftItem.id;
  }, [nftItem.id, nftItem.name]);

  const [balanceError] = useState(substrateTransferParams !== null ? substrateBalanceError : web3BalanceError);

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
    <ContainerWithSubHeader title={nftName} onPressBack={onClose}>
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
          errorMessages={formState.errors.password || [passwordError]}
          onSubmitField={onSubmitField('password')}
          autoFocus={true}
        />

        <TouchableOpacity
          style={[
            SubmitButtonStyle,
            {
              backgroundColor: loading ? 'rgba(0, 75, 255, 0.25)' : ColorMap.secondary,
            },
          ]}
          disabled={loading}
          onPress={handleSignAndSubmit}>
          {!loading ? (
            <Text style={SubmitButtonTextStyle}>{i18n.transferNft.signAndSubmit}</Text>
          ) : (
            <ActivityIndicator animating={true} />
          )}
        </TouchableOpacity>
      </ScrollView>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AuthTransaction);
