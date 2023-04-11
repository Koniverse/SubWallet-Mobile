import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmationType } from 'stores/base/RequestState';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';
import { TransactionConfirmation } from 'screens/Confirmations/Transaction';
import { ScreenContainer } from 'components/ScreenContainer';
import { ConfirmationHeader } from 'components/common/ConfirmationHeader';
import {SafeAreaView, View} from 'react-native';

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
  const [index, setIndex] = useState(0);
  const confirmation = confirmationQueue[index] || null;

  const nextConfirmation = useCallback(() => {
    setIndex(val => Math.min(val + 1, numberOfConfirmations - 1));
  }, [numberOfConfirmations]);

  const prevConfirmation = useCallback(() => {
    setIndex(val => Math.max(0, val - 1));
  }, []);

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
            title={titleMap[confirmation?.type]}
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
