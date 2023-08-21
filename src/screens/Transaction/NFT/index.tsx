import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { isSameAddress } from '@subwallet/extension-base/utils';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
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
import ImagePreview from 'components/ImagePreview';
import i18n from 'utils/i18n/i18n';
import { NetworkField } from 'components/Field/Network';
import { ContainerHorizontalPadding, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { WebRunnerContext } from 'providers/contexts';
import { Warning } from 'components/Warning';
import { Button } from 'components/design-system-ui';
import reformatAddress from 'utils/index';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { FormState } from 'hooks/screen/useFormControl';
import { nftParamsHandler } from '../helper';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { evmNftSubmitTransaction, substrateNftSubmitTransaction } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { InputAddress } from 'components/Input/InputAddressV2';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { SendNFTProps } from 'routes/transaction/transactionAction';

const DEFAULT_ITEM: NftItem = {
  collectionId: 'unknown',
  chain: 'unknown',
  owner: 'unknown',
  id: 'unknown',
};

const DEFAULT_COLLECTION: NftCollection = {
  collectionId: 'unknown',
  chain: 'unknown',
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: 182,
  height: 182,
  borderRadius: 10,
};

const ImageContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
};

const NftNameTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginTop: 8,
  marginBottom: 16,
  textAlign: 'center',
};

const InputStyle: StyleProp<any> = {
  marginBottom: 8,
};

const SendNFT: React.FC<SendNFTProps> = ({
  route: {
    params: { chain: nftChain, collectionId, itemId, owner },
  },
}: SendNFTProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const addressPrefix = useGetChainPrefixBySlug(nftChain);
  const chainGenesisHash = chainInfoMap[nftChain]?.substrateInfo?.genesisHash || '';

  const validateRecipientAddress = (recipientAddress: string): string[] => {
    if (!recipientAddress) {
      return [];
    }

    try {
      reformatAddress(recipientAddress);
    } catch (e) {
      return [i18n.errorMessage.invalidRecipientAddress];
    }

    if (isSameAddress(recipientAddress, owner)) {
      return [i18n.errorMessage.sameAddressError];
    }

    if (isEthereumAddress(recipientAddress) !== isEthereumAddress(owner)) {
      const message = i18n.errorMessage.recipientAddressMustBeType(isEthereumAddress(owner) ? 'evm' : 'substrate');

      return [message];
    }

    return [];
  };

  const NFTFormConfig = {
    recipientAddress: {
      require: true,
      name: i18n.inputLabel.sendTo,
      value: '',
      validateFunc: validateRecipientAddress,
    },
  };

  const nftItem = useMemo(
    (): NftItem =>
      nftItems.find(
        item =>
          isSameAddress(item.owner, owner) &&
          nftChain === item.chain &&
          item.collectionId === collectionId &&
          item.id === itemId,
      ) || DEFAULT_ITEM,
    [collectionId, itemId, nftChain, nftItems, owner],
  );

  const collectionInfo = useMemo(
    (): NftCollection =>
      nftCollections.find(item => nftChain === item.chain && item.collectionId === collectionId) || DEFAULT_COLLECTION,
    [collectionId, nftChain, nftCollections],
  );

  const [loading, setLoading] = useState(false);
  const { title, formState, onChangeValue, onChangeChainValue, onDone } = useTransaction('send-nft', NFTFormConfig);
  const isFormValid = Object.values(formState.isValidated).every(val => val);

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);

  const onChangeReceiverAddress = useCallback(
    (currentTextValue: string) => {
      onChangeValue('recipientAddress')(currentTextValue);
    },
    [onChangeValue],
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const disableSubmit = useMemo(
    () => !owner || !formState.isValidated.recipientAddress || !isFormValid || !isNetConnected || loading,
    [formState.isValidated.recipientAddress, isFormValid, isNetConnected, loading, owner],
  );

  const onSubmitForm = useCallback(
    async (_formState: FormState) => {
      const isEthereumInterface = isEthereumAddress(owner);
      const recipientAddress = _formState.data.recipientAddress;
      const params = nftParamsHandler(nftItem, nftChain);
      let sendPromise: Promise<SWTransactionResponse>;

      if (isEthereumInterface) {
        // Send NFT with EVM interface
        sendPromise = evmNftSubmitTransaction({
          senderAddress: owner,
          networkKey: nftChain,
          recipientAddress,
          nftItemName: nftItem?.name,
          params,
          nftItem,
        });
      } else {
        // Send NFT with substrate interface
        sendPromise = substrateNftSubmitTransaction({
          networkKey: nftChain,
          recipientAddress,
          senderAddress: owner,
          nftItemName: nftItem?.name,
          params,
          nftItem,
        });
      }

      setLoading(true);

      setTimeout(() => {
        // Handle transfer action
        sendPromise
          .then(onSuccess)
          .catch(onError)
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    },
    [nftChain, nftItem, onError, onSuccess, owner],
  );

  const handleSend = useCallback(() => {
    if (isFormValid) {
      onSubmitForm(formState).then();
    }
  }, [formState, isFormValid, onSubmitForm]);

  useEffect(() => {
    onChangeChainValue(nftItem.chain);
  }, [nftItem.chain, onChangeChainValue]);

  return (
    <ContainerWithSubHeader
      title={title}
      isShowMainHeader={true}
      disabledMainHeader={loading}
      titleTextAlign={'left'}
      onPressBack={goBack}
      disabled={loading}
      rightButtonTitle={i18n.transferNft.send}
      disableRightButton={disableSubmit}
      onPressRightIcon={handleSend}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <>
          <ScrollView style={{ ...ContainerHorizontalPadding, marginTop: 10 }} keyboardShouldPersistTaps={'handled'}>
            <View style={ImageContainerStyle}>
              <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionInfo.image} />
            </View>
            <Text style={NftNameTextStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>
            <InputAddress
              ref={formState.refs.recipientAddress}
              containerStyle={InputStyle}
              showAddressBook
              addressPrefix={addressPrefix}
              networkGenesisHash={chainGenesisHash}
              label={formState.labels.recipientAddress}
              value={formState.data.recipientAddress}
              onChangeText={onChangeReceiverAddress}
              isValidValue={formState.isValidated.recipientAddress}
              placeholder={i18n.placeholder.accountAddress}
              onSubmitEditing={handleSend}
              disabled={loading}
            />
            {!!formState.errors.recipientAddress.length && (
              <Warning style={{ marginBottom: 8 }} message={formState.errors.recipientAddress[0]} isDanger />
            )}
            <NetworkField label={i18n.inputLabel.network} networkKey={nftItem.chain || ''} />
            {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
          </ScrollView>

          <View style={{ ...ContainerHorizontalPadding, marginTop: 16, marginBottom: 16 }}>
            <Button loading={loading} disabled={disableSubmit} onPress={handleSend}>
              {i18n.transferNft.send}
            </Button>
          </View>
        </>
      </TouchableWithoutFeedback>
    </ContainerWithSubHeader>
  );
};

export default SendNFT;
