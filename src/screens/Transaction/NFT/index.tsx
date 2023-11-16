import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { isSameAddress } from '@subwallet/extension-base/utils';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransactionV2';
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
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { nftParamsHandler } from '../helper';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { evmNftSubmitTransaction, substrateNftSubmitTransaction } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { InputAddress } from 'components/Input/InputAddressV2';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { SendNFTProps } from 'routes/transaction/transactionAction';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { useWatch } from 'react-hook-form';
import { FormItem } from 'components/common/FormItem';
import { ValidateResult } from 'react-hook-form/dist/types/validator';

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

interface SendNftFormValues extends TransactionFormValues {
  recipientAddress: string;
}

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
  const [isTransactionDone, setTransactionDone] = useState<boolean>(false);
  const recipientAddressRules = useMemo(
    () => ({
      validate: (_recipientAddress: string): Promise<ValidateResult> => {
        if (!isAddress(_recipientAddress)) {
          return Promise.resolve(i18n.errorMessage.invalidRecipientAddress);
        }

        if (!_recipientAddress) {
          return Promise.resolve(undefined);
        }

        if (isSameAddress(_recipientAddress, owner)) {
          return Promise.resolve(i18n.errorMessage.sameAddressError);
        }

        if (isEthereumAddress(_recipientAddress) !== isEthereumAddress(owner)) {
          const message = i18n.formatString(
            i18n.errorMessage.recipientAddressMustBeType,
            isEthereumAddress(owner) ? 'evm' : 'substrate',
          );

          return Promise.resolve(message);
        }

        return Promise.resolve(undefined);
      },
    }),
    [owner],
  );

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
  const {
    title,
    form: { getValues, control, handleSubmit },
    onChangeChainValue,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<SendNftFormValues>('send-nft', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      recipientAddress: '',
    },
  });

  const { recipientAddress: recipientAddressValue } = {
    ...useWatch<SendNftFormValues>({ control }),
    ...getValues(),
  };

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setTransactionDone);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const disableSubmit = useMemo(
    () => !owner || !isAddress(recipientAddressValue) || !isNetConnected || loading,
    [isNetConnected, loading, owner, recipientAddressValue],
  );

  const onSubmitForm = useCallback(
    async (values: SendNftFormValues) => {
      const isEthereumInterface = isEthereumAddress(owner);
      const recipientAddress = values.recipientAddress;
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

  const handleSend = useCallback(() => handleSubmit(onSubmitForm)(), [handleSubmit, onSubmitForm]);

  useEffect(() => {
    onChangeChainValue(nftItem.chain);
  }, [nftItem.chain, onChangeChainValue]);

  return (
    <>
      {!isTransactionDone ? (
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
              <ScrollView
                style={{ ...ContainerHorizontalPadding, marginTop: 10 }}
                keyboardShouldPersistTaps={'handled'}>
                <View style={ImageContainerStyle}>
                  <ImagePreview style={ImageStyle} mainUrl={nftItem.image} backupUrl={collectionInfo.image} />
                </View>
                <Text style={NftNameTextStyle}>{nftItem.name ? nftItem.name : '#' + nftItem.id}</Text>
                <FormItem
                  control={control}
                  rules={recipientAddressRules}
                  render={({ field: { value, ref, onChange, onBlur } }) => (
                    <InputAddress
                      ref={ref}
                      containerStyle={InputStyle}
                      showAddressBook
                      addressPrefix={addressPrefix}
                      networkGenesisHash={chainGenesisHash}
                      label={i18n.inputLabel.sendTo}
                      value={value}
                      onChangeText={onChange}
                      placeholder={i18n.placeholder.accountAddress}
                      onSubmitEditing={handleSend}
                      disabled={loading}
                      chain={nftChain}
                      onBlur={onBlur}
                    />
                  )}
                  name={'recipientAddress'}
                />

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
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};

export default SendNFT;
