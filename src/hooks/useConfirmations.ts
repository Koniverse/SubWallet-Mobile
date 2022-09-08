import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback } from 'react';
import {
  approveAuthRequestV2,
  approveMetaRequest,
  approveSignPassword,
  cancelAuthRequestV2,
  cancelSignRequest,
  completeConfirmation,
  rejectAuthRequestV2,
  rejectMetaRequest,
} from '../messaging';
import { ConfirmationHookType, ConfirmationType } from 'hooks/types';
import { ConfirmationDefinitions } from '@subwallet/extension-base/background/KoniTypes';

const ConfirmationsQueueItems = [
  'addNetworkRequest',
  'addTokenRequest',
  'switchNetworkRequest',
  'evmSignatureRequest',
  'evmSignatureRequestQr',
  'evmSendTransactionRequest',
  'evmSendTransactionRequestQr',
];

type RequestMap = Record<string, Record<string, unknown>>;

function getRequestLength(requestMap: RequestMap): number {
  let counter = 0;

  Object.values(requestMap).forEach(m => {
    counter += Object.keys(m).length;
  });

  return counter;
}

export default function useConfirmations(): ConfirmationHookType {
  const confirmationRequestMap = useSelector((state: RootState) => state.confirmation.details);
  const isEmptyRequests = !getRequestLength(confirmationRequestMap);

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

  const approveRequest = useCallback((type: ConfirmationType, id: string, payload: unknown) => {
    return new Promise<void>((resolve, reject) => {
      if (type === 'authorizeRequest') {
        approveAuthRequestV2(id, payload as string[])
          .then(() => resolve)
          .catch(reject);
      } else if (type === 'metadataRequest') {
        approveMetaRequest(id)
          .then(() => resolve)
          .catch(reject);
      } else if (type === 'signingRequest') {
        const password = payload ? (payload as string) : '';

        approveSignPassword(id, false, password)
          .then(() => resolve)
          .catch(reject);
      } else if (ConfirmationsQueueItems.includes(type)) {
        const password = payload ? (payload as string) : '';

        completeConfirmation(type as keyof ConfirmationDefinitions, {
          id,
          isApproved: true,
          payload: true,
          password,
        })
          .then(() => resolve)
          .catch(reject);
      } else {
        return resolve;
      }
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
  };
}
