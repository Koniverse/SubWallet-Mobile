import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmationType } from 'stores/base/RequestState';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';
import { TransactionConfirmation } from 'screens/Confirmations/Transaction';
import { ScreenContainer } from 'components/ScreenContainer';
import { ConfirmationHeader } from 'components/common/ConfirmationHeader';
import { SafeAreaView, View } from 'react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

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

  const content = useMemo(() => {
    if (!confirmation) {
      return null;
    }

    if (confirmation.item.isInternal) {
      return <TransactionConfirmation confirmation={confirmation} />;
    }
  }, [confirmation]);

  useEffect(() => {
    if (numberOfConfirmations) {
      if (index >= numberOfConfirmations) {
        setIndex(numberOfConfirmations - 1);
      }
    }
  }, [index, numberOfConfirmations]);

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <ScreenContainer backgroundColor={'#0C0C0C'}>
        <>
          <ConfirmationHeader
            index={index}
            numberOfConfirmations={numberOfConfirmations}
            title={headerTitle}
            onPressPrev={prevConfirmation}
            onPressNext={nextConfirmation}
          />

          {content}
          <SafeAreaView />
        </>
      </ScreenContainer>
    </View>
  );
};
