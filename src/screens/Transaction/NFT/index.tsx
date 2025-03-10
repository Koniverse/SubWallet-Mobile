import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ExtrinsicType, NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
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
import { InputAddress } from 'components/Input/InputAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { SendNFTProps } from 'routes/transaction/transactionAction';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { useWatch } from 'react-hook-form';
import { FormItem } from 'components/common/FormItem';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { isSameAddress, reformatAddress } from '@subwallet/extension-base/utils';
import { ActionType } from '@subwallet/extension-base/core/types';
import { findAccountByAddress } from 'utils/account';
import { validateRecipientAddress } from 'utils/core/logic-validation/recipientAddress';

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

interface SendNftFormValues extends TransactionFormValues {
  recipientAddress: string;
}

const SendNFT: React.FC<SendNFTProps> = ({
  route: {
    params: { chain: nftChain, collectionId, itemId, owner },
  },
}: SendNFTProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((state: RootState) => state.chainStore);
  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const addressPrefix = useGetChainPrefixBySlug(nftChain);
  const [isTransactionDone, setTransactionDone] = useState<boolean>(false);
  const recipientAddressRules = useMemo(
    () => ({
      validate: (_recipientAddress: string, { chain, from }: SendNftFormValues): Promise<ValidateResult> => {
        const destChainInfo = chainInfoMap[chain];
        const account = findAccountByAddress(accounts, _recipientAddress);

        return validateRecipientAddress({
          srcChain: chain,
          destChainInfo,
          fromAddress: from,
          toAddress: _recipientAddress,
          account,
          actionType: ActionType.SEND_NFT,
          autoFormatValue: false,
          allowLedgerGenerics: ledgerGenericAllowNetworks,
        });
      },
    }),
    [accounts, chainInfoMap, ledgerGenericAllowNetworks],
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
      from: owner,
      recipientAddress: '',
    },
  });

  const { recipientAddress: recipientAddressValue } = {
    ...useWatch<SendNftFormValues>({ control }),
    ...getValues(),
  };
  const fromValue = useWatch<SendNftFormValues>({ name: 'from', control });

  const onPreCheck = usePreCheckAction(fromValue);

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
      const { chain, from: _from, recipientAddress } = values;
      const isEthereumInterface = isEthereumAddress(_from);

      const from = reformatAddress(_from, addressPrefix);
      const params = nftParamsHandler(nftItem, chain);
      let sendPromise: Promise<SWTransactionResponse>;

      if (isEthereumInterface) {
        // Send NFT with EVM interface
        sendPromise = evmNftSubmitTransaction({
          senderAddress: from,
          networkKey: chain,
          recipientAddress,
          nftItemName: nftItem?.name,
          params,
          nftItem,
        });
      } else {
        // Send NFT with substrate interface
        sendPromise = substrateNftSubmitTransaction({
          networkKey: chain,
          recipientAddress,
          senderAddress: from,
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
    [addressPrefix, nftItem, onError, onSuccess],
  );

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
          onPressRightIcon={onPreCheck(handleSubmit(onSubmitForm), ExtrinsicType.SEND_NFT)}>
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
                  style={{ marginBottom: 8 }}
                  control={control}
                  rules={recipientAddressRules}
                  render={({ field: { value, ref, onChange, onBlur } }) => (
                    <InputAddress
                      ref={ref}
                      showAddressBook
                      showAvatar={false}
                      label={i18n.inputLabel.sendTo}
                      value={value}
                      onChangeText={onChange}
                      placeholder={i18n.placeholder.accountAddress}
                      onSubmitEditing={onPreCheck(handleSubmit(onSubmitForm), ExtrinsicType.SEND_NFT)}
                      disabled={loading}
                      chain={nftChain}
                      fitNetwork
                      onBlur={onBlur}
                    />
                  )}
                  name={'recipientAddress'}
                />

                <NetworkField label={i18n.inputLabel.network} networkKey={nftItem.chain || ''} />
                {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
              </ScrollView>

              <View style={{ ...ContainerHorizontalPadding, marginTop: 16, marginBottom: 16 }}>
                <Button
                  loading={loading}
                  disabled={disableSubmit}
                  onPress={onPreCheck(handleSubmit(onSubmitForm), ExtrinsicType.SEND_NFT)}>
                  {i18n.transferNft.send}
                </Button>
              </View>
            </>
          </TouchableWithoutFeedback>
        </ContainerWithSubHeader>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.SEND_NFT} />
      )}
    </>
  );
};

export default SendNFT;
