import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import React, { createRef, useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleProp, TouchableOpacity, View } from 'react-native';
import { MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { SendFromAddressField } from 'screens/Sending/Field/SendFromAddressField';
import { InputAddress } from 'components/Input/InputAddress';
import { Warning } from 'components/Warning';
import { SubmitButton } from 'components/SubmitButton';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { DestinationChainSelect } from 'screens/DestinationChainSelect';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { checkAddress } from '@polkadot/phishing';
import { NetworkSelectField } from 'components/Field/NetworkSelect';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { TokenSelect } from 'screens/TokenSelect';
import { TokenItemType } from 'types/ui-types';
import { ChainSelectContainer } from 'screens/Sending/Field/ChainSelectContainer';
import { getNetworkPrefix } from 'screens/Sending/Confirmation';
import { WebRunnerContext } from 'providers/contexts';
import SelectNetworkModal from 'components/Modal/SelectNetworkModal';

interface Props {
  senderAddress: string;
  originChain: string;
  destinationChain: string;
  originToken: string;
  originChainOptions: { label: string; value: string }[];
  destinationChainOptions: { label: string; value: string }[];
  onChangeSenderAddress: (address: string) => void;
  onChangeToken: (tokenValueStr: string) => void;
  receiveAddress: string | null;
  currentReceiveAddress: string;
  onChangeReceiverAddress: (receiverAddress: string | null, currentTextValue: string) => void;
  onChangeOriginChain: (currentOriginChain: string) => void;
  onChangeDestinationChain: (currentDestinationChain: string) => void;
  onPressToNextStep: () => void;
  originTokenList: TokenItemType[];
}

const WarningStyle: StyleProp<any> = {
  marginBottom: 8,
};

export const ChainAndAccountSelectScreen = ({
  senderAddress,
  originChain,
  destinationChain,
  originToken,
  originChainOptions,
  destinationChainOptions,
  onChangeSenderAddress,
  receiveAddress,
  currentReceiveAddress,
  onChangeReceiverAddress,
  onChangeOriginChain,
  onChangeDestinationChain,
  onChangeToken,
  onPressToNextStep,
  originTokenList,
}: Props) => {
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const inputAddressRef = createRef();
  const originAccountPrefix = getNetworkPrefix(originChain, networkMap);
  const [originChainModalVisible, setOriginChainModalVisible] = useState<boolean>(false);
  const [destinationChainModalVisible, setDestinationChainModalVisible] = useState<boolean>(false);
  const [tokenListModalVisible, setTokenListModalVisible] = useState<boolean>(false);
  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  const [recipientPhish, setRecipientPhish] = useState<string | null>(null);
  const isSameAddress =
    !!receiveAddress && !!senderAddress && receiveAddress === senderAddress && originChain === destinationChain;
  const checkOriginChainAndSenderIdType =
    isAccountAll(senderAddress) || !!networkMap[originChain].isEthereum === isEthereumAddress(senderAddress);
  const checkDestinationChainAndReceiverIdType =
    !!receiveAddress && !!networkMap[destinationChain].isEthereum === isEthereumAddress(receiveAddress);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  const senderAccount = useGetAccountByAddress(senderAddress);

  const isReadOnly = useMemo((): boolean => {
    if (!senderAccount) {
      return false;
    } else {
      return !!senderAccount.isReadOnly;
    }
  }, [senderAccount]);

  const isValidTransferInfo =
    !isAccountAll(senderAddress) &&
    checkOriginChainAndSenderIdType &&
    checkDestinationChainAndReceiverIdType &&
    !!receiveAddress &&
    !isSameAddress &&
    !recipientPhish &&
    !isReadOnly;

  useEffect(() => {
    let isSync = true;

    if (receiveAddress) {
      checkAddress(receiveAddress)
        .then(v => {
          if (isSync) {
            setRecipientPhish(v);
          }
        })
        .catch(e => console.log('e', e));
    }

    return () => {
      isSync = false;
      setRecipientPhish(null);
    };
  }, [receiveAddress]);

  const _onChangeToken = (item: TokenItemType) => {
    onChangeToken(item.symbol);
    setTokenListModalVisible(false);
  };

  const onUpdateInputAddress = (text: string) => {
    if (inputAddressRef && inputAddressRef.current) {
      // @ts-ignore
      inputAddressRef.current.onChange(text);
    }
  };

  const onPressQrButton = async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setShowQrModalVisible(true);
    }
  };

  const _onChangeOriginChain = (chain: string) => {
    onChangeOriginChain(chain);
    setOriginChainModalVisible(false);
  };

  const _onChangeDestinationChain = (chain: string) => {
    onChangeDestinationChain(chain);
    setDestinationChainModalVisible(false);
  };

  return (
    <View style={{ ...sharedStyles.layoutContainer }}>
      <ScrollView style={{ ...ScrollViewStyle }}>
        <View style={{ flex: 1 }}>
          <ChainSelectContainer
            disabled={false}
            originChain={originChain}
            destinationChain={destinationChain}
            onPressOriginChainField={() => setOriginChainModalVisible(true)}
            onPressDestinationChainField={() => setDestinationChainModalVisible(true)}
          />

          <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setTokenListModalVisible(true)}>
            <NetworkSelectField showIcon networkKey={originChain} label={'Token'} value={originToken} />
          </TouchableOpacity>

          <SendFromAddressField
            senderAddress={senderAddress}
            onChangeAddress={onChangeSenderAddress}
            networkPrefix={originAccountPrefix}
          />

          <InputAddress
            ref={inputAddressRef}
            onPressQrButton={onPressQrButton}
            containerStyle={{ marginBottom: 8 }}
            label={i18n.sendAssetScreen.toAccount}
            value={currentReceiveAddress}
            onChange={onChangeReceiverAddress}
          />

          {isSameAddress && <Warning isDanger style={WarningStyle} message={i18n.warningMessage.isNotSameAddress} />}

          {isReadOnly && <Warning isDanger style={WarningStyle} message={i18n.warningMessage.sendReadOnly} />}

          {!checkOriginChainAndSenderIdType && (
            <Warning
              isDanger
              style={WarningStyle}
              message={`${i18n.warningMessage.originAccountMustBe}${
                networkMap[originChain].isEthereum ? 'EVM' : 'substrate'
              }${i18n.common.type}`}
            />
          )}

          {!!receiveAddress && !checkDestinationChainAndReceiverIdType && (
            <Warning
              isDanger
              style={WarningStyle}
              message={`${i18n.warningMessage.destinationAccountMustBe}${
                networkMap[destinationChain].isEthereum ? 'EVM' : 'substrate'
              }${i18n.common.type}`}
            />
          )}

          {!!recipientPhish && (
            <Warning
              style={WarningStyle}
              isDanger
              message={`${i18n.warningMessage.recipientPhish} ${recipientPhish}`}
            />
          )}

          {!isNetConnected && <Warning style={WarningStyle} isDanger message={i18n.warningMessage.noInternetMessage} />}
        </View>
      </ScrollView>

      <View style={{ marginTop: 16 }}>
        <SubmitButton
          disabled={!isValidTransferInfo || !isNetConnected}
          title={i18n.common.continue}
          style={{ width: '100%', ...MarginBottomForSubmitButton }}
          onPress={onPressToNextStep}
        />
      </View>

      <SelectNetworkModal
        onPressBack={() => setOriginChainModalVisible(false)}
        modalVisible={originChainModalVisible}
        onChangeModalVisible={() => setOriginChainModalVisible(false)}
        networkOptions={originChainOptions}
        selectedNetworkKey={originChain}
        onChangeNetwork={_onChangeOriginChain}
        title={i18n.sendAssetScreen.originChain}
      />

      <DestinationChainSelect
        onPressBack={() => setDestinationChainModalVisible(false)}
        modalVisible={destinationChainModalVisible}
        onChangeModalVisible={() => setDestinationChainModalVisible(false)}
        networkOptions={destinationChainOptions}
        selectedNetworkKey={destinationChain}
        onChangeNetwork={_onChangeDestinationChain}
      />

      <TokenSelect
        filteredNetworkKey={originChain}
        selectedToken={originToken}
        selectedNetworkKey={originChain}
        onChangeToken={_onChangeToken}
        onPressBack={() => setTokenListModalVisible(false)}
        address={senderAddress}
        modalVisible={tokenListModalVisible}
        onChangeModalVisible={() => setTokenListModalVisible(false)}
        externalTokenOptions={originTokenList}
      />

      <AddressScanner
        networkKey={destinationChain}
        token={originToken}
        qrModalVisible={isShowQrModalVisible}
        onPressCancel={() => setShowQrModalVisible(false)}
        onChangeAddress={text => onUpdateInputAddress(text)}
        scanMessage={i18n.common.toSendAsset}
      />
    </View>
  );
};
