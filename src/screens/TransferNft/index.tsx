import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { isValidSubstrateAddress } from '@subwallet/extension-koni-base/utils';
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
import { useSelector } from 'react-redux';
import { HomeNavigationProps } from 'routes/home';
import { QrScannerScreen } from 'screens/QrScannerScreen';
import AuthTransaction from 'screens/TransferNft/AuthTransaction';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontSemiBold,
  sharedStyles,
  MarginBottomForSubmitButton,
} from 'styles/sharedStyles';
import { TransferNftProps } from 'routes/index';
import { SubstrateTransferParams, Web3TransferParams } from 'types/nft';
import paramsHandler from 'services/nft/paramsHandler';
import transferHandler from 'services/nft/transferHandler';
import i18n from 'utils/i18n/i18n';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import reformatAddress from 'utils/index';
import TransferResult from './TransferResult';
import { SubmitButton } from 'components/SubmitButton';
import { requestCameraPermission } from 'utils/validators';
import { RESULTS } from 'react-native-permissions';
import { Warning } from 'components/Warning';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { CustomTokenType } from '@subwallet/extension-base/background/KoniTypes';

const ImageContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: 182,
  height: 182,
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
    return isValidSubstrateAddress(address);
  }
};

const TransferNft = ({ route: { params: transferNftParams } }: TransferNftProps) => {
  // const { show } = useToast();
  const navigation = useNavigation<HomeNavigationProps>();

  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  const { nftItem, collectionImage, collectionId, senderAddress } = transferNftParams;

  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [addressError, setAddressError] = useState(true);
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
  const [error, setError] = useState<string | undefined>(undefined);
  const [extrinsicHash, setExtrinsicHash] = useState('');
  const [isTxSuccess, setIsTxSuccess] = useState(false);
  const [txError, setTxError] = useState('');
  useHandlerHardwareBackPress(loading);
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
    navigation.goBack();
  }, [navigation]);

  const goHome = useCallback(() => {
    navigation.navigate('NFT', {
      screen: 'CollectionList',
    });
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
    setAddressError(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (addressError || !senderAddress) {
      setError(i18n.errorMessage.invalidAddress);
      return;
    }
    setError(undefined);
    setLoading(true);
    const params = paramsHandler(nftItem, networkKey);
    const transferMeta = await transferHandler(networkKey, senderAddress, recipientAddress as string, params, nftItem);

    if (transferMeta !== null) {
      // @ts-ignore
      if (SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.indexOf(networkKey) > -1 || nftItem.type === CustomTokenType.psp34) {
        setSubstrateTransferParams({
          params,
          estimatedFee: transferMeta.estimatedFee,
          balanceError: transferMeta.balanceError,
        } as SubstrateTransferParams);
        // @ts-ignore
      } else if (nftItem.type === CustomTokenType.erc721) {
        setWeb3TransferParams({
          rawTx: transferMeta.web3RawTx,
          estimatedGas: transferMeta.estimatedGas,
          balanceError: transferMeta.balanceError,
        } as Web3TransferParams);
      }

      setShowConfirm(true);
    } else {
      setError(i18n.errorMessage.transferNFTError);
    }

    setLoading(false);
  }, [addressError, networkKey, nftItem, recipientAddress, senderAddress]);

  useEffect(() => {
    const isValidCurrentRecipient =
      !!recipientAddress && isValidRecipient(recipientAddress as string, !!networkJson.isEthereum);

    if (!recipientAddress) {
      return;
    } else {
      if (!isValidCurrentRecipient) {
        setAddressError(true);
        setError(i18n.errorMessage.invalidAddress);
      } else {
        setAddressError(false);
        setError(undefined);
      }
    }
  }, [networkJson.isEthereum, recipientAddress]);

  useEffect(() => {
    // handle user change account during sending process
    const addressList = accounts.map(acc => acc.address);
    if (!senderAddress || !addressList.includes(reformatAddress(senderAddress, 42, false))) {
      navigation.navigate('NFT', {
        screen: 'CollectionList',
      });
    }
  }, [accounts, navigation, senderAddress]);

  if (showConfirm && senderAddress && (substrateTransferParams || web3TransferParams)) {
    return (
      <AuthTransaction
        chain={nftItem.chain as string}
        nftItem={nftItem}
        collectionImage={collectionImage}
        setShowConfirm={setShowConfirm}
        senderAddress={senderAddress}
        recipientAddress={recipientAddress}
        collectionId={collectionId}
        setExtrinsicHash={setExtrinsicHash}
        setIsTxSuccess={setIsTxSuccess}
        setShowResult={setShowTransferResult}
        setTxError={setTxError}
        substrateTransferParams={substrateTransferParams}
        web3TransferParams={web3TransferParams}
        loading={loading}
        setLoading={(isLoading: boolean) => setLoading(isLoading)}
      />
    );
  }

  return (
    <ContainerWithSubHeader
      title={i18n.title.transferNft}
      onPressBack={!showTransferResult ? goBack : goHome}
      disabled={loading}
      rightButtonTitle={!showTransferResult ? i18n.transferNft.send : undefined}
      disableRightButton={loading || !recipientAddress || addressError}
      onPressRightIcon={!showTransferResult ? handleSend : undefined}>
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
                  isValidValue={!addressError}
                />
                <NetworkField label={i18n.common.network} networkKey={nftItem.chain || ''} />

                {!!error && <Warning message={error} isDanger />}
              </ScrollView>
              <View style={{ ...ContainerHorizontalPadding, marginTop: 16 }}>
                <SubmitButton
                  isBusy={loading}
                  disabled={!recipientAddress || addressError}
                  style={{ width: '100%', ...MarginBottomForSubmitButton }}
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
                scanMessage={i18n.common.toSendNFT}
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
            backToHome={goHome}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(TransferNft);
