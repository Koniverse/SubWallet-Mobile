import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isValidAddress } from '@subwallet/extension-koni-base/utils';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { NetworkField } from 'components/Field/Network';
import ImagePreview from 'components/ImagePreview';
import { InputAddress } from 'components/Input/InputAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { createRef, useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleProp,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { QrScannerScreen } from 'screens/QrScannerScreen';
import AuthTransaction from 'screens/TransferNft/AuthTransaction';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontSemiBold,
  MarginBottomForSubmitButton,
  sharedStyles,
} from 'styles/sharedStyles';
import { RootNavigationProps, SendNftProps } from 'types/routes';
import { SubstrateTransferParams, Web3TransferParams } from 'types/nft';
import paramsHandler from 'services/nft/paramsHandler';
import transferHandler from 'services/nft/transferHandler';
import i18n from 'utils/i18n/i18n';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import TransferResult from './TransferResult';
import { SubmitButton } from 'components/SubmitButton';
import { requestCameraPermission } from 'utils/validators';
import { RESULTS } from 'react-native-permissions';

const ImageContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: 182,
  height: 172,
  borderRadius: 10,
};

const InputStyle: StyleProp<any> = {
  marginBottom: 8,
};

const NftNameTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginTop: 8,
  marginBottom: 16,
  textAlign: 'center',
};

const isValidRecipient = (address: string, isEthereum: boolean) => {
  if (isEthereum) {
    return isEthereumAddress(address);
  } else {
    return isValidAddress(address);
  }
};

const TransferNft = ({ route: { params: transferNftParams } }: SendNftProps) => {
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

  const onPressQrButton = async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsShowQrModalVisible(true);
    }
  };

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
        collectionImage={collectionImage}
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
    <ContainerWithSubHeader
      title={i18n.title.transferNft}
      onPressBack={goBack}
      rightButtonTitle={!showTransferResult ? i18n.transferNft.send : ''}
      disableRightButton={loading}
      onPressRightIcon={handleSend}>
      <>
        {!showTransferResult && (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <>
              <ScrollView style={{ ...ContainerHorizontalPadding, marginTop: 10 }}>
                <View style={ImageContainerStyle}>
                  <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionImage} />
                </View>
                <Text style={NftNameTextStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>
                <InputAddress
                  ref={inputAddressRef}
                  onPressQrButton={onPressQrButton}
                  containerStyle={InputStyle}
                  label={i18n.common.sendToAddress}
                  value={recipientAddress}
                  onChange={onChangeReceiverAddress}
                />
                <NetworkField label={i18n.common.network} networkKey={nftItem.chain || ''} />
              </ScrollView>
              <View style={{ ...ContainerHorizontalPadding, marginTop: 16 }}>
                <SubmitButton
                  style={{ width: '100%', ...MarginBottomForSubmitButton }}
                  disabled={loading}
                  title={i18n.transferNft.send}
                  onPress={handleSend}
                />
              </View>

              <QrScannerScreen
                qrModalVisible={isShowQrModalVisible}
                onPressCancel={closeQrScan}
                onChangeAddress={text => onUpdateInputAddress(text)}
                networkKey={nftItem.chain}
                token={networkJson.nativeToken}
              />
            </>
          </TouchableWithoutFeedback>
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
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(TransferNft);
