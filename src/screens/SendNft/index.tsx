import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isValidAddress } from '@subwallet/extension-koni-base/utils';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import ImagePreview from 'components/ImagePreview';
import { InputAddress } from 'components/Input/InputAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { createRef, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { QrScannerScreen } from 'screens/QrScannerScreen';
import AuthTransaction from 'screens/SendNft/AuthTransaction';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { RootNavigationProps, SendNftProps } from 'types/routes';
import { SubstrateTransferParams, Web3TransferParams } from 'types/nft';
import paramsHandler from 'services/nft/paramsHandler';
import transferHandler from 'services/nft/transferHandler';
import i18n from 'utils/i18n/i18n';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import TransferResult from './TransferResult';

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 20,
  paddingBottom: 15,
  paddingTop: 25,
};

const ImageContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 20,
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: 200,
  height: 200,
  borderRadius: 10,
};

const InputAddressStyle: StyleProp<any> = {
  marginBottom: 20,
};

const TransferMetaStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  borderStyle: 'dashed',
  borderWidth: 2,
  borderColor: ColorMap.borderNftMeta,
  borderRadius: 8,
  padding: 10,
  marginTop: 20,
};

const MetaTitleStyle: StyleProp<TextStyle> = {
  fontSize: 14,
  color: ColorMap.iconNeutralColor,
};

const MetaValueStyle: StyleProp<TextStyle> = {
  textAlign: 'right',
  fontSize: 14,
};

const SendButtonStyle: StyleProp<ViewStyle> = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
  marginTop: 40,
  backgroundColor: ColorMap.secondary,
  borderRadius: 8,
};

const isValidRecipient = (address: string, isEthereum: boolean) => {
  if (isEthereum) {
    return isEthereumAddress(address);
  } else {
    return isValidAddress(address);
  }
};

const SendNft = ({ route: { params: transferNftParams } }: SendNftProps) => {
  const { show } = useToast();
  const navigation = useNavigation<RootNavigationProps>();

  const _currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);

  const { nftItem, collectionImage, collectionId } = transferNftParams;

  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [addressError, setAddressError] = useState(true);
  const [currentAccount] = useState<AccountJson | undefined>(_currentAccount);
  const networkKey = nftItem.chain as string;
  const networkJson = useGetNetworkJson(networkKey);
  const [isShowQrModalVisible, setIsShowQrModalVisible] = useState(false);

  const inputAddressRef = createRef();

  // for substrate-based chains
  const [substrateTransferParams, setSubstrateTransferParams] = useState<SubstrateTransferParams | null>(null);

  // for evm-based chains
  const [web3TransferParams, setWeb3TransferParams] = useState<Web3TransferParams | null>(null);
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showTransferResult, setShowTransferResult] = useState(false);

  const [extrinsicHash, setExtrinsicHash] = useState('');
  const [isTxSuccess, setIsTxSuccess] = useState(false);
  const [txError, setTxError] = useState('');

  const openQrScan = useCallback(() => {
    setIsShowQrModalVisible(true);
  }, []);

  const closeQrScan = useCallback(() => {
    setIsShowQrModalVisible(false);
  }, []);

  const handleResend = useCallback(() => {
    setExtrinsicHash('');
    setIsTxSuccess(false);
    setTxError('');
    setShowTransferResult(false);
    setShowConfirm(true);
  }, []);

  const goBack = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const onUpdateInputAddress = useCallback(
    (text: string) => {
      if (inputAddressRef && inputAddressRef.current) {
        // @ts-ignore
        inputAddressRef.current.onChange(text);
      }
    },
    [inputAddressRef],
  );

  const onChangeReceiverAddress = useCallback((receiverAddress: string | null, currentTextValue: string) => {
    setRecipientAddress(currentTextValue);
  }, []);

  const handleSend = useCallback(async () => {
    if (addressError || !currentAccount?.address) {
      show(i18n.errorMessage.invalidAddress);
      return;
    }

    setLoading(true);
    const senderAddress = currentAccount.address;
    const params = paramsHandler(nftItem, networkKey, networkJson);
    const transferMeta = await transferHandler(
      networkKey,
      senderAddress,
      recipientAddress as string,
      params,
      networkJson,
    );

    if (transferMeta !== null) {
      // @ts-ignore
      if (SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.indexOf(networkKey) > -1) {
        setSubstrateTransferParams({
          params,
          estimatedFee: transferMeta.estimatedFee,
          balanceError: transferMeta.balanceError,
        } as SubstrateTransferParams);
        // @ts-ignore
      } else if (networkJson.isEthereum && networkJson.isEthereum) {
        setWeb3TransferParams({
          rawTx: transferMeta.web3RawTx,
          estimatedGas: transferMeta.estimatedGas,
          balanceError: transferMeta.balanceError,
        } as Web3TransferParams);
      }

      setShowConfirm(true);
    } else {
      show('Some error occurred. Please try again later.');
    }

    setLoading(false);
  }, [addressError, currentAccount?.address, networkJson, networkKey, nftItem, recipientAddress, show]);

  useEffect(() => {
    if (networkJson.isEthereum) {
      setAddressError(!isValidRecipient(recipientAddress as string, true));
    } else {
      setAddressError(!isValidRecipient(recipientAddress as string, false));
    }
  }, [networkJson.isEthereum, recipientAddress]);

  useEffect(() => {
    // handle user change account during sending process
    if (currentAccount?.address !== _currentAccount?.address) {
      navigation.navigate('Home');
    }
  }, [_currentAccount?.address, currentAccount?.address, navigation]);

  if (showConfirm && currentAccount && (substrateTransferParams || web3TransferParams)) {
    return (
      <AuthTransaction
        chain={nftItem.chain as string}
        nftItem={nftItem}
        setShowConfirm={setShowConfirm}
        senderAccount={currentAccount}
        recipientAddress={recipientAddress}
        collectionId={collectionId}
        setExtrinsicHash={setExtrinsicHash}
        setIsTxSuccess={setIsTxSuccess}
        setShowResult={setShowTransferResult}
        setTxError={setTxError}
        substrateTransferParams={substrateTransferParams}
        web3TransferParams={web3TransferParams}
      />
    );
  }

  return (
    <ContainerWithSubHeader title={i18n.title.sendNft} onPressBack={goBack}>
      <View style={WrapperStyle}>
        {!showTransferResult && (
          <View>
            <View style={ImageContainerStyle}>
              <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionImage} />
            </View>
            <InputAddress
              ref={inputAddressRef}
              onPressQrButton={openQrScan}
              containerStyle={InputAddressStyle}
              label={i18n.common.sendToAddress}
              value={recipientAddress}
              onChange={onChangeReceiverAddress}
            />

            <View style={TransferMetaStyle}>
              <View>
                <Text style={MetaTitleStyle}>{i18n.sendNft.nft}</Text>
                <Text style={MetaTitleStyle}>{i18n.sendNft.chain}</Text>
              </View>

              <View>
                <Text style={MetaValueStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>
                <Text style={[MetaValueStyle, { textTransform: 'capitalize' }]}>{networkJson?.chain}</Text>
              </View>
            </View>

            <TouchableOpacity style={SendButtonStyle} onPress={handleSend}>
              {!loading ? (
                <Text style={{ color: ColorMap.light }}>{i18n.sendNft.send}</Text>
              ) : (
                <ActivityIndicator animating={true} />
              )}
            </TouchableOpacity>

            <QrScannerScreen
              qrModalVisible={isShowQrModalVisible}
              onPressCancel={closeQrScan}
              onChangeAddress={text => onUpdateInputAddress(text)}
            />
          </View>
        )}
        {showTransferResult && (
          <TransferResult
            networkKey={nftItem.chain as string}
            extrinsicHash={extrinsicHash}
            isTxSuccess={isTxSuccess}
            txError={txError}
            handleResend={handleResend}
            backToHome={goBack}
          />
        )}
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(SendNft);
