import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback } from 'react';
import {
  approveAuthRequestV2,
  approveMetaRequest,
  cancelAuthRequestV2,
  rejectAuthRequestV2,
  rejectMetaRequest
} from '../messaging';
import useCheckEmptyConfirmationRequests from 'hooks/useCheckEmptyConfirmationRequests';
import { ConfirmationHookType, ConfirmationType } from 'hooks/types';

export default function useConfirmations(): ConfirmationHookType {
  const confirmationRequestMap = useSelector((state: RootState) => state.confirmation.details);
  const isEmptyRequests = useCheckEmptyConfirmationRequests();

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
