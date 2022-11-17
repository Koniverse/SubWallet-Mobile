import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { CustomTokenType, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { isValidSubstrateAddress } from '@subwallet/extension-koni-base/utils';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { NetworkField } from 'components/Field/Network';
import ImagePreview from 'components/ImagePreview';
import { InputAddress } from 'components/Input/InputAddress';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { SubmitButton } from 'components/SubmitButton';
import { Warning } from 'components/Warning';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback, useContext, useMemo, useState } from 'react';
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
import { RESULTS } from 'react-native-permissions';
import { RootNavigationProps } from 'routes/index';
import { NftTransferConfirmProps } from 'routes/nft/transferAction';
import {
  ContainerHorizontalPadding,
  FontSemiBold,
  MarginBottomForSubmitButton,
  sharedStyles,
} from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { WebRunnerContext } from 'providers/contexts';
import paramsHandler from 'services/nft/paramsHandler';
import transferHandler from 'services/nft/transferHandler';
import { ColorMap } from 'styles/color';
import { SubstrateTransferParams, SUPPORTED_TRANSFER_SUBSTRATE_CHAIN, Web3TransferParams } from 'types/nft';
import { requestCameraPermission } from 'utils/validators';

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

const validateRecipientAddress = (network: NetworkJson): ((value: string) => string[]) => {
  return (value: string) => {
    const isValidCurrentRecipient = !!value && isValidRecipient(value, !!network.isEthereum);

    if (!value) {
      return [];
    } else {
      if (!isValidCurrentRecipient) {
        return [i18n.errorMessage.invalidAddress];
      } else {
        return [];
      }
    }
  };
};

const NftTransferConfirm = ({ route: { params: transferParams } }: NftTransferConfirmProps) => {
  const { nftItem, collectionImage, senderAddress } = transferParams;
  const networkKey = nftItem.chain as string;

  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  const goHome = useGoHome({ screen: 'NFT', params: { screen: 'CollectionList' } });
  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isShowQrModalVisible, setIsShowQrModalVisible] = useState(false);

  useHandlerHardwareBackPress(loading);

  const formConfig = useMemo(
    (): FormControlConfig => ({
      recipientAddress: {
        require: true,
        name: i18n.common.sendToAddress,
        value: '',
        validateFunc: validateRecipientAddress(network),
      },
    }),
    [network],
  );

  const onSubmitForm = useCallback(
    async (formState: FormState) => {
      const recipientAddress = formState.data.recipientAddress;
      if (!senderAddress) {
        setError(i18n.errorMessage.invalidAddress);
        return;
      }

      setLoading(true);
      const params = paramsHandler(nftItem, networkKey);
      const transferMeta = await transferHandler(networkKey, senderAddress, recipientAddress, params, nftItem);

      if (transferMeta !== null) {
        // @ts-ignore
        let substrateTransferParams: SubstrateTransferParams | null = null;
        let web3TransferParams: Web3TransferParams | null = null;
        if (SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.indexOf(networkKey) > -1 || nftItem.type === CustomTokenType.psp34) {
          substrateTransferParams = {
            params,
            estimatedFee: transferMeta.estimatedFee,
            balanceError: transferMeta.balanceError,
          };
        } else if (nftItem.type === CustomTokenType.erc721) {
          web3TransferParams = {
            rawTx: transferMeta.web3RawTx,
            estimatedGas: transferMeta.estimatedGas,
            balanceError: transferMeta.balanceError,
          } as Web3TransferParams;
        }
        navigation.navigate('TransferNft', {
          screen: 'NftTransferAuth',
          params: {
            web3TransferParams: web3TransferParams,
            recipientAddress: recipientAddress,
            substrateTransferParams: substrateTransferParams,
            transferParams: transferParams,
          },
        });
      } else {
        setError(i18n.errorMessage.transferNFTError);
      }

      setLoading(false);
    },
    [navigation, networkKey, nftItem, senderAddress, transferParams],
  );

  const { formState, onChangeValue } = useFormControl(formConfig, { onSubmitForm: onSubmitForm });

  const onUpdateInputAddress = useCallback(
    (text: string) => {
      formState.refs.recipientAddress.current?.onChange(text);
    },
    [formState.refs],
  );

  const onChangeReceiverAddress = useCallback(
    (receiverAddress: string | null, currentTextValue: string) => {
      onChangeValue('recipientAddress')(currentTextValue);
    },
    [onChangeValue],
  );

  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsShowQrModalVisible(true);
    }
  }, []);

  const closeQrScan = useCallback(() => {
    setIsShowQrModalVisible(false);
  }, []);

  const handleSend = useCallback(() => {
    if (Object.values(formState.isValidated).every(val => val)) {
      onSubmitForm(formState).then();
    }
  }, [formState, onSubmitForm]);

  const disableSubmit = !senderAddress || !formState.isValidated.recipientAddress || !isNetConnected;

  return (
    <ContainerWithSubHeader
      title={i18n.title.transferNft}
      onPressBack={goHome}
      disabled={loading}
      rightButtonTitle={i18n.transferNft.send}
      disableRightButton={disableSubmit}
      onPressRightIcon={handleSend}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <>
          <ScrollView style={{ ...ContainerHorizontalPadding, marginTop: 10 }}>
            <View style={ImageContainerStyle}>
              <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionImage} />
            </View>
            <Text style={NftNameTextStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>
            <InputAddress
              ref={formState.refs.recipientAddress}
              onPressQrButton={onPressQrButton}
              containerStyle={InputStyle}
              label={formState.labels.recipientAddress}
              value={formState.data.recipientAddress}
              onChange={onChangeReceiverAddress}
              isValidValue={formState.isValidated.recipientAddress}
            />
            <NetworkField label={i18n.common.network} networkKey={nftItem.chain || ''} />
            {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
            {!!error && <Warning message={error} isDanger />}
          </ScrollView>
          <View style={{ ...ContainerHorizontalPadding, marginTop: 16 }}>
            <SubmitButton
              isBusy={loading}
              disabled={disableSubmit}
              style={{ width: '100%', ...MarginBottomForSubmitButton }}
              title={i18n.transferNft.send}
              onPress={handleSend}
            />
          </View>

          <AddressScanner
            qrModalVisible={isShowQrModalVisible}
            onPressCancel={closeQrScan}
            onChangeAddress={text => onUpdateInputAddress(text)}
            networkKey={nftItem.chain}
            token={network.nativeToken}
            scanMessage={i18n.common.toSendNFT}
          />
        </>
      </TouchableWithoutFeedback>
    </ContainerWithSubHeader>
  );
};

export default React.memo(NftTransferConfirm);
