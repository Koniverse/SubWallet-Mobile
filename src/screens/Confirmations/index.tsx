import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AccountJson,
  AuthorizeRequest,
  MetadataRequest,
  SigningRequest,
} from '@subwallet/extension-base/background/types';
import { ConfirmationHeader } from 'components/common/ConfirmationHeader';
import { NEED_SIGN_CONFIRMATION } from 'constants/transaction';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RootStackParamList } from 'routes/index';
import { ConfirmationType } from 'stores/base/RequestState';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';
import { KeyboardAvoidingView, Platform, StyleProp, View } from 'react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ConfirmationDefinitions, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ColorMap } from 'styles/color';
import { isRawPayload } from 'utils/confirmation/request/substrate';

import {
  AddNetworkConfirmation,
  AddTokenConfirmation,
  AuthorizeConfirmation,
  EvmSignatureConfirmation,
  EvmTransactionConfirmation,
  MetadataConfirmation,
  NotSupportConfirmation,
  TransactionConfirmation,
  SignConfirmation,
} from './variants';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { WalletConnectSessionRequest } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { ConnectWalletConnectConfirmation } from 'screens/Confirmations/variants/ConnectWalletConnectConfirmation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portal } from '@gorhom/portal';
import { getSignMode } from 'utils/account';
import { AccountSignMode } from 'types/signer';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { getDevMode } from 'utils/storage';

const getConfirmationPopupWrapperStyle = (isShowSeparator: boolean): StyleProp<any> => {
  return {
    height: !isShowSeparator ? '100%' : undefined,
    maxHeight: isShowSeparator ? '80%' : undefined,
    width: '100%',
    backgroundColor: ColorMap.dark1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 8 : isShowSeparator ? 8 : STATUS_BAR_HEIGHT + 8,
  };
};

const subWalletModalSeparator: StyleProp<any> = {
  width: 70,
  height: 5,
  borderRadius: 100,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  marginBottom: 16,
};

export const Confirmations = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { confirmationQueue, numberOfConfirmations } = useConfirmationsInfo();
  const { transactionRequest } = useSelector((state: RootState) => state.requestState);
  const [index, setIndex] = useState(0);
  const confirmation = confirmationQueue[index] || null;
  useHandlerHardwareBackPress(true);
  const isDevMode = getDevMode();
  const titleMap = useMemo(
    () => ({
      addNetworkRequest: i18n.header.addNetworkRequest,
      addTokenRequest: i18n.header.addTokenRequest,
      authorizeRequest: i18n.header.connectWithSubwallet,
      evmSendTransactionRequest: i18n.header.transactionRequest,
      evmSignatureRequest: i18n.header.signatureRequest,
      metadataRequest: i18n.header.updateMetadata,
      signingRequest: i18n.header.signatureRequest,
      switchNetworkRequest: i18n.header.addNetworkRequest,
      connectWCRequest: i18n.header.walletConnect,
    }),
    [],
  ) as Record<ConfirmationType, string>;

  const nextConfirmation = useCallback(() => {
    setIndex(val => Math.min(val + 1, numberOfConfirmations - 1));
  }, [numberOfConfirmations]);

  const prevConfirmation = useCallback(() => {
    setIndex(val => Math.max(0, val - 1));
  }, []);

  const headerTitle = useMemo((): string => {
    if (!confirmation) {
      return '';
    }

    if (confirmation.item.isInternal) {
      const transaction = transactionRequest[confirmation.item.id];

      if (!transaction) {
        return titleMap[confirmation.type] || '';
      }

      switch (transaction.extrinsicType) {
        case ExtrinsicType.TRANSFER_BALANCE:
        case ExtrinsicType.TRANSFER_TOKEN:
        case ExtrinsicType.TRANSFER_XCM:
          return i18n.header.transferConfirmation;
        case ExtrinsicType.SEND_NFT:
          return i18n.header.nftTransferConfirmation;
        case ExtrinsicType.STAKING_JOIN_POOL:
        case ExtrinsicType.STAKING_BOND:
          return i18n.header.addToBondConfirm;
        case ExtrinsicType.STAKING_LEAVE_POOL:
        case ExtrinsicType.STAKING_UNBOND:
          return i18n.header.unbondConfirmation;
        case ExtrinsicType.STAKING_WITHDRAW:
          return i18n.header.withdrawalConfirm;
        case ExtrinsicType.STAKING_CLAIM_REWARD:
          return i18n.header.claimRewardsConfirmation;
        case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
          return i18n.header.cancelUnstakeConfirmation;
        case ExtrinsicType.MINT_VDOT:
          return i18n.header.mintVDOTTransaction;
        case ExtrinsicType.MINT_VMANTA:
          return i18n.header.mintVMANTATransaction;
        case ExtrinsicType.MINT_LDOT:
          return i18n.header.mintLDOTTransaction;
        case ExtrinsicType.MINT_SDOT:
          return i18n.header.mintSDOTTransaction;
        case ExtrinsicType.MINT_QDOT:
          return i18n.header.mintQDOTTransaction;
        case ExtrinsicType.MINT_STDOT:
          return i18n.header.mintSTDOTTransaction;
        case ExtrinsicType.REDEEM_VDOT:
          return i18n.header.redeemVDOTTransaction;
        case ExtrinsicType.REDEEM_VMANTA:
          return i18n.header.redeemVMANTATransaction;
        case ExtrinsicType.REDEEM_LDOT:
          return i18n.header.redeemLDOTTransaction;
        case ExtrinsicType.REDEEM_SDOT:
          return i18n.header.redeemSDOTTransaction;
        case ExtrinsicType.REDEEM_QDOT:
          return i18n.header.redeemQDOTTransaction;
        case ExtrinsicType.REDEEM_STDOT:
          return i18n.header.redeemSTDOTTransaction;
        case ExtrinsicType.UNSTAKE_VDOT:
          return i18n.header.unstakeVDOTTransaction;
        case ExtrinsicType.UNSTAKE_VMANTA:
          return i18n.header.unstakeVMANTATransaction;
        case ExtrinsicType.UNSTAKE_LDOT:
          return i18n.header.unstakeLDOTTransaction;
        case ExtrinsicType.UNSTAKE_SDOT:
          return i18n.header.unstakeSDOTTransaction;
        case ExtrinsicType.UNSTAKE_STDOT:
          return i18n.header.unstakeSTDOTTransaction;
        case ExtrinsicType.UNSTAKE_QDOT:
          return i18n.header.unstakeQDOTTransaction;
        case ExtrinsicType.TOKEN_SPENDING_APPROVAL:
          return i18n.header.tokenApprove;
        case ExtrinsicType.SWAP:
          return 'Swap confirmation';
        default:
          return i18n.header.transactionConfirmation;
      }
    } else {
      return titleMap[confirmation.type] || '';
    }
  }, [confirmation, titleMap, transactionRequest]);

  const content = useMemo((): React.ReactNode => {
    if (!confirmation) {
      return null;
    }

    if (NEED_SIGN_CONFIRMATION.includes(confirmation.type)) {
      let account: AccountJson | undefined;
      let canSign = true;
      let isMessage = false;

      if (confirmation.type === 'signingRequest') {
        const request = confirmation.item as SigningRequest;
        const _isMessage = isRawPayload(request.request.payload);

        account = request.account;
        canSign = !_isMessage || !account.isHardware;
        isMessage = _isMessage;
      } else if (confirmation.type === 'evmSignatureRequest' || confirmation.type === 'evmSendTransactionRequest') {
        const request = confirmation.item as ConfirmationDefinitions[
          | 'evmSignatureRequest'
          | 'evmSendTransactionRequest'][0];

        account = request.payload.account;
        canSign = request.payload.canSign;
        isMessage = confirmation.type === 'evmSignatureRequest';
      }

      const signMode = getSignMode(account);
      const isEvm = isEthereumAddress(account?.address);
      const notSupport =
        signMode === AccountSignMode.READ_ONLY ||
        signMode === AccountSignMode.LEDGER ||
        signMode === AccountSignMode.GENERIC_LEDGER ||
        signMode === AccountSignMode.LEGACY_LEDGER ||
        signMode === AccountSignMode.UNKNOWN ||
        (signMode === AccountSignMode.QR && isEvm && !isDevMode) ||
        !canSign;

      if (notSupport) {
        return (
          <NotSupportConfirmation
            account={account}
            isMessage={isMessage}
            request={confirmation.item}
            type={confirmation.type}
          />
        );
      }
    }

    if (confirmation.item.isInternal && confirmation.type !== 'connectWCRequest') {
      return <TransactionConfirmation confirmation={confirmation} navigation={navigation} />;
    }

    switch (confirmation.type) {
      case 'addNetworkRequest':
        return (
          <AddNetworkConfirmation request={confirmation.item as ConfirmationDefinitions['addNetworkRequest'][0]} />
        );
      case 'addTokenRequest':
        return <AddTokenConfirmation request={confirmation.item as ConfirmationDefinitions['addTokenRequest'][0]} />;
      case 'evmSignatureRequest':
        return (
          <EvmSignatureConfirmation
            request={confirmation.item as ConfirmationDefinitions['evmSignatureRequest'][0]}
            type={confirmation.type}
            navigation={navigation}
          />
        );
      case 'evmSendTransactionRequest':
        return (
          <EvmTransactionConfirmation
            request={confirmation.item as ConfirmationDefinitions['evmSendTransactionRequest'][0]}
            type={confirmation.type}
            navigation={navigation}
          />
        );
      case 'authorizeRequest':
        return <AuthorizeConfirmation request={confirmation.item as AuthorizeRequest} navigation={navigation} />;
      case 'metadataRequest':
        return <MetadataConfirmation request={confirmation.item as MetadataRequest} />;
      case 'signingRequest':
        return <SignConfirmation request={confirmation.item as SigningRequest} navigation={navigation} />;
      case 'connectWCRequest':
        return (
          <ConnectWalletConnectConfirmation
            request={confirmation.item as WalletConnectSessionRequest}
            navigation={navigation}
          />
        );
    }

    return null;
  }, [confirmation, isDevMode, navigation]);

  useEffect(() => {
    if (numberOfConfirmations) {
      if (index >= numberOfConfirmations) {
        setIndex(numberOfConfirmations - 1);
      }
    }
  }, [index, numberOfConfirmations]);

  useEffect(() => {
    if (!confirmation && navigation.isFocused()) {
      const state = navigation.getState();
      const confirmationRoute = state.routes.find(route => route.name === 'Confirmations');
      if (!confirmationRoute) {
        navigation.goBack();
      } else {
        navigation.pop(state.index - state.routes.indexOf(confirmationRoute) + 1);
      }
    }
  }, [confirmation, navigation]);

  const renderMainContent = () => (
    <View
      style={[
        { flex: 1, flexDirection: 'column', justifyContent: 'flex-end' },
        Platform.OS === 'android' && { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 },
      ]}>
      <View style={getConfirmationPopupWrapperStyle(!confirmation || !confirmation.item.isInternal)}>
        {(!confirmation || !confirmation.item.isInternal) && <View style={subWalletModalSeparator} />}
        <ConfirmationHeader
          index={index}
          numberOfConfirmations={numberOfConfirmations}
          title={headerTitle}
          onPressPrev={prevConfirmation}
          onPressNext={nextConfirmation}
          isFullHeight={confirmation && confirmation.item.isInternal}
        />
        {content}
        <SafeAreaView edges={['bottom']} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {Platform.OS === 'android' ? <Portal>{renderMainContent()}</Portal> : renderMainContent()}
    </KeyboardAvoidingView>
  );
};
