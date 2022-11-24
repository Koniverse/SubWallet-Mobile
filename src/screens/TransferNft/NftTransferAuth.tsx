import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import {
  EvmNftSubmitTransaction,
  NftTransactionResponse,
  SubstrateNftSubmitTransaction,
} from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { NetworkField } from 'components/Field/Network';
import ImagePreview from 'components/ImagePreview';
import SigningRequest from 'components/Signing/SigningRequest';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { SigningContext } from 'providers/SigningContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { NftTransferAuthProps } from 'routes/nft/transferAction';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import {
  evmNftSubmitTransaction,
  makeTransferNftQrEvm,
  nftForceUpdate,
  substrateNftSubmitTransaction,
} from '../../messaging';
import { Warning } from 'components/Warning';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { WebRunnerContext } from 'providers/contexts';

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

const AuthTransaction = ({
  route: {
    params: { transferParams, substrateTransferParams, web3TransferParams, recipientAddress },
  },
  navigation: { goBack },
}: NftTransferAuthProps) => {
  const { collectionImage, senderAddress, nftItem, collectionId } = transferParams;
  const networkKey = nftItem.chain as string;

  const navigation = useNavigation<RootNavigationProps>();

  const {
    signingState: { isLoading },
  } = useContext(SigningContext);

  useHandlerHardwareBackPress(isLoading);

  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const senderAccount = useGetAccountByAddress(senderAddress);
  const network = useGetNetworkJson(networkKey);

  const evmParams = useMemo((): EvmNftSubmitTransaction | null => {
    return web3TransferParams?.rawTx
      ? {
          senderAddress: senderAccount?.address || senderAddress,
          recipientAddress: recipientAddress,
          networkKey: networkKey,
          rawTransaction: web3TransferParams.rawTx,
        }
      : null;
  }, [web3TransferParams?.rawTx, senderAccount?.address, senderAddress, recipientAddress, networkKey]);

  const substrateParams = useMemo((): SubstrateNftSubmitTransaction | null => {
    return substrateTransferParams?.params
      ? {
          params: substrateTransferParams.params,
          senderAddress: senderAccount?.address || senderAddress,
          recipientAddress: recipientAddress,
        }
      : null;
  }, [recipientAddress, senderAccount?.address, senderAddress, substrateTransferParams?.params]);

  const feeInfo = useMemo((): FeeInfo => {
    const raw = substrateTransferParams?.estimatedFee || web3TransferParams?.estimatedGas || '0';

    return {
      value: raw.split(' ')[0] || '0',
      symbol: raw.split(' ')[1] || 'Token',
    };
  }, [substrateTransferParams?.estimatedFee, web3TransferParams?.estimatedGas]);

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('TransferNft', {
        screen: 'NftTransferResult',
        params: {
          transferParams: transferParams,
          txParams: {
            extrinsicHash: extrinsicHash,
            txError: errors[0],
            txSuccess: false,
          },
        },
      });
    },
    [navigation, transferParams],
  );

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      navigation.navigate('TransferNft', {
        screen: 'NftTransferResult',
        params: {
          transferParams: transferParams,
          txParams: {
            extrinsicHash: extrinsicHash,
            txError: '',
            txSuccess: true,
          },
        },
      });
    },
    [navigation, transferParams],
  );

  const onAfterSuccess = useCallback(
    (res: NftTransactionResponse) => {
      nftForceUpdate({
        chain: networkKey,
        collectionId: collectionId,
        isSendingSelf: res.isSendingSelf,
        nft: nftItem,
        recipientAddress: recipientAddress,
        senderAddress: senderAccount?.address || senderAddress,
      }).catch(console.error);
    },
    [networkKey, collectionId, nftItem, recipientAddress, senderAccount?.address, senderAddress],
  );

  return (
    <ContainerWithSubHeader title={i18n.title.transferNft} onPressBack={goBack} disabled={isLoading}>
      <>
        <ScrollView style={AuthContainerStyle}>
          <View style={ImageContainerStyle}>
            <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionImage} />
          </View>
          <Text style={NftNameTextStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>
          <AddressField label={i18n.common.sendFromAddress} address={senderAddress} />
          <AddressField label={i18n.common.sendToAddress} address={recipientAddress} />
          <NetworkField label={i18n.common.network} networkKey={nftItem.chain || ''} />
          <BalanceField
            label={i18n.common.networkFee}
            value={feeInfo.value}
            token={feeInfo.symbol}
            decimal={0}
            si={formatBalance.findSi('-')}
          />
          {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
        </ScrollView>
        {substrateParams && (
          <SigningRequest
            account={senderAccount}
            network={network}
            balanceError={!!substrateTransferParams?.balanceError}
            baseProps={{}}
            handleSignPassword={substrateNftSubmitTransaction}
            message={'There is problem when transferNft'}
            onAfterSuccess={onAfterSuccess}
            onFail={onFail}
            onSuccess={onSuccess}
            params={substrateParams}
            style={ContainerHorizontalPadding}
          />
        )}
        {evmParams && (
          <SigningRequest
            account={senderAccount}
            network={network}
            balanceError={!!web3TransferParams?.balanceError}
            baseProps={{}}
            handleSignPassword={evmNftSubmitTransaction}
            handleSignQr={makeTransferNftQrEvm}
            message={'There is problem when transferNft'}
            onAfterSuccess={onAfterSuccess}
            onFail={onFail}
            onSuccess={onSuccess}
            params={evmParams}
            style={ContainerHorizontalPadding}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AuthTransaction);
