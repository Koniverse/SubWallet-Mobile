import { AuthorizeRequest } from '@subwallet/extension-base/background/types';
import { ConfirmationHeader } from 'components/common/ConfirmationHeader';
import { SwModal } from 'components/design-system-ui';
import { ScreenContainer } from 'components/ScreenContainer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmationType } from 'stores/base/RequestState';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';
import { TransactionConfirmation } from 'screens/Confirmations/variants/Transaction';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleProp, View } from 'react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ColorMap } from 'styles/color';

import { AuthorizeConfirmation } from './variants';

const confirmationPopupWrapper: StyleProp<any> = {
  maxHeight: '90%',
  width: '100%',
  backgroundColor: ColorMap.dark1,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  alignItems: 'center',
  paddingTop: 8,
};

const titleMap: Record<ConfirmationType, string> = {
  addNetworkRequest: 'Add Network Request',
  addTokenRequest: 'Add Token Request',
  authorizeRequest: 'Connect to SubWallet',
  evmSendTransactionRequest: 'Transaction Request',
  evmSignatureRequest: 'Signature request',
  metadataRequest: 'Update Metadata',
  signingRequest: 'Signature request',
  switchNetworkRequest: 'Add Network Request',
} as Record<ConfirmationType, string>;

export const Confirmations = () => {
  const { confirmationQueue, numberOfConfirmations } = useConfirmationsInfo();
  const { transactionRequest } = useSelector((state: RootState) => state.requestState);
  const [index, setIndex] = useState(0);
  const confirmation = confirmationQueue[index] || null;

  const nextConfirmation = useCallback(() => {
    setIndex(val => Math.min(val + 1, numberOfConfirmations - 1));
  }, [numberOfConfirmations]);

  const prevConfirmation = useCallback(() => {
    setIndex(val => Math.max(0, val - 1));
  }, []);

  const headerTitle = useMemo((): string => {
    // TODO: i18n
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
          return 'Transfer confirmation';
        case ExtrinsicType.SEND_NFT:
          return 'NFT Transfer confirmation';
        case ExtrinsicType.STAKING_JOIN_POOL:
        case ExtrinsicType.STAKING_BOND:
          return 'Add to bond confirm';
        case ExtrinsicType.STAKING_LEAVE_POOL:
        case ExtrinsicType.STAKING_UNBOND:
          return 'Unbond confirmation';
        case ExtrinsicType.STAKING_WITHDRAW:
          return 'Withdraw confirm';
        case ExtrinsicType.STAKING_CLAIM_REWARD:
          return 'Claim reward confirm';
        case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
          return 'Cancel unstake confirm';
        default:
          return 'Transaction confirm';
      }
    } else {
      return titleMap[confirmation.type] || '';
    }
  }, [confirmation, transactionRequest]);

  const content = useMemo((): React.ReactNode => {
    if (!confirmation) {
      return null;
    }

    if (!confirmation) {
      return null;
    }

    // if (NEED_SIGN_CONFIRMATION.includes(confirmation.type)) {
    //   let account: AccountJson | undefined;
    //   let canSign = true;
    //   let isMessage = false;
    //
    //   if (confirmation.type === 'signingRequest') {
    //     const request = confirmation.item as SigningRequest;
    //     const _isMessage = isRawPayload(request.request.payload);
    //
    //     account = request.account;
    //     canSign = !_isMessage || !account.isHardware;
    //     isMessage = _isMessage;
    //   } else if (confirmation.type === 'evmSignatureRequest' || confirmation.type === 'evmSendTransactionRequest') {
    //     const request = confirmation.item as ConfirmationDefinitions['evmSignatureRequest' | 'evmSendTransactionRequest'][0];
    //
    //     account = request.payload.account;
    //     canSign = request.payload.canSign;
    //     isMessage = confirmation.type === 'evmSignatureRequest';
    //   }
    //
    //   if (account?.isReadOnly || !canSign) {
    //     return (
    //       <NotSupportConfirmation
    //         account={account}
    //         isMessage={isMessage}
    //         request={confirmation.item}
    //         type={confirmation.type}
    //       />
    //     );
    //   }
    // }

    if (confirmation.item.isInternal) {
      return <TransactionConfirmation confirmation={confirmation} />;
    }

    switch (confirmation.type) {
      case 'addNetworkRequest':
      // return <AddNetworkConfirmation request={confirmation.item as ConfirmationDefinitions['addNetworkRequest'][0]} />;
      case 'addTokenRequest':
      // return <AddTokenConfirmation request={confirmation.item as ConfirmationDefinitions['addTokenRequest'][0]} />;
      case 'evmSignatureRequest':
      // return (
      // <EvmSignatureConfirmation
      //   request={confirmation.item as ConfirmationDefinitions['evmSignatureRequest'][0]}
      //   type={confirmation.type}
      // />
      // );
      case 'evmSendTransactionRequest':
      // return (
      // <EvmTransactionConfirmation
      //   request={confirmation.item as ConfirmationDefinitions['evmSendTransactionRequest'][0]}
      //   type={confirmation.type}
      // />
      // );
      case 'authorizeRequest':
        return <AuthorizeConfirmation request={confirmation.item as AuthorizeRequest} />;
      case 'metadataRequest':
      // return (
      // <MetadataConfirmation request={confirmation.item as MetadataRequest} />
      // );
      case 'signingRequest':
      // return (
      // <SignConfirmation request={confirmation.item as SigningRequest} />
      // );
    }

    return null;
  }, [confirmation]);

  useEffect(() => {
    if (numberOfConfirmations) {
      if (index >= numberOfConfirmations) {
        setIndex(numberOfConfirmations - 1);
      }
    }
  }, [index, numberOfConfirmations]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
        <View style={confirmationPopupWrapper}>
          <ConfirmationHeader
            index={index}
            numberOfConfirmations={numberOfConfirmations}
            title={headerTitle}
            onPressPrev={prevConfirmation}
            onPressNext={nextConfirmation}
          />
          {content}
          <SafeAreaView />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
