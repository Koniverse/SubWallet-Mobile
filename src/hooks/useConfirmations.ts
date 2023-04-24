import { useSelector } from 'react-redux';
import { CONFIRMATIONS_FIELDS } from 'stores/base/RequestState';
import { RootState } from 'stores/index';
import { useCallback, useMemo } from 'react';
import {
  approveAuthRequestV2,
  approveMetaRequest,
  approveSignPassword,
  approveSignSignature,
  cancelAuthRequestV2,
  cancelSignRequest,
  completeConfirmation,
  rejectAuthRequestV2,
  rejectMetaRequest,
} from 'messaging/index';
import { ConfirmationHookType, ConfirmationItem, ConfirmationType } from 'hooks/types';
import { ConfirmationDefinitions } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationSlice } from 'stores/types';
import { toggleConfirmationDisplayState } from 'stores/updater';

const ConfirmationsQueueItems = [
  'addNetworkRequest',
  'addTokenRequest',
  'switchNetworkRequest',
  'evmSignatureRequest',
  'evmSignatureRequestExternal',
  'evmSendTransactionRequest',
  'evmSendTransactionRequestExternal',
];

const ExternalConfirmationsQueueItems = ['evmSignatureRequestExternal', 'evmSendTransactionRequestExternal'];

function getConfirmationItems(confirmationRequestMap: ConfirmationSlice['details']): ConfirmationItem[] {
  const items: ConfirmationItem[] = [];

  Object.keys(confirmationRequestMap).forEach(type => {
    if (CONFIRMATIONS_FIELDS.includes(type)) {
      // @ts-ignore
      Object.values(confirmationRequestMap[type]).forEach(payload => {
        items.push({
          type: type as keyof ConfirmationSlice['details'],
          payload,
        });
      });
    }
  });

  return items;
}

export default function useConfirmations(): ConfirmationHookType {
  const confirmationRequestMap = useSelector((state: RootState) => state.requestState);
  const isDisplayConfirmation = useSelector((state: RootState) => state.appState.isDisplayConfirmation);
  const confirmationItems = useMemo<ConfirmationItem[]>(() => {
    return getConfirmationItems(confirmationRequestMap);
  }, [confirmationRequestMap]);
  const confirmationItemsLength = confirmationItems.length;
  const isEmptyRequests = !confirmationItemsLength;

  const cancelRequest = useCallback((type: ConfirmationType, id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (type === 'authorizeRequest') {
        cancelAuthRequestV2(id)
          .then(() => resolve)
          .catch(reject);
      } else if (type === 'metadataRequest') {
        rejectMetaRequest(id)
          .then(() => resolve)
          .catch(reject);
      } else if (type === 'signingRequest') {
        cancelSignRequest(id)
          .then(() => resolve)
          .catch(reject);
      } else if (ConfirmationsQueueItems.includes(type)) {
        completeConfirmation(type as keyof ConfirmationDefinitions, {
          id,
          isApproved: false,
          payload: false,
        })
          .then(() => resolve)
          .catch(reject);
      } else {
        return resolve;
      }
    });
  }, []);

  const approveRequest = useCallback<ConfirmationHookType['approveRequest']>((type, id, payload) => {
    return new Promise<void>((resolve, reject) => {
      const password = (payload && payload.password) || '';
      const signature = (payload && payload.signature) || '0x';
      if (type === 'authorizeRequest') {
        if (payload && payload.data) {
          approveAuthRequestV2(id, payload.data as string[])
            .then(() => resolve)
            .catch(reject);
        }
      } else if (type === 'metadataRequest') {
        approveMetaRequest(id)
          .then(() => resolve)
          .catch(reject);
      } else if (type === 'signingRequest') {
        if (password) {
          approveSignPassword(id, false, password)
            .then(() => resolve)
            .catch(reject);
        }

        if (signature.length > 2) {
          approveSignSignature(id, signature)
            .then(() => resolve)
            .catch(reject);
        }
      } else if (ConfirmationsQueueItems.includes(type)) {
        const isExternal = ExternalConfirmationsQueueItems.includes(type);
        completeConfirmation(type as keyof ConfirmationDefinitions, {
          id,
          isApproved: true,
          payload: true,
          password: !isExternal ? password : '',
          signature: isExternal ? signature : '0x',
        })
          .then(() => resolve)
          .catch(reject);
      } else {
        return resolve;
      }
      return resolve;
    });
  }, []);

  const rejectRequest = useCallback((type: ConfirmationType, id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (type === 'authorizeRequest') {
        rejectAuthRequestV2(id)
          .then(() => resolve)
          .catch(reject);
      } else {
        return resolve;
      }
    });
  }, []);

  return {
    confirmationRequestMap,
    cancelRequest,
    approveRequest,
    rejectRequest,
    isEmptyRequests,
    confirmationItems,
    confirmationItemsLength,
    isDisplayConfirmation,
    toggleConfirmation: toggleConfirmationDisplayState,
  };
}
