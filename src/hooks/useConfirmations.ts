import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ConfirmationSlice } from 'stores/types';
import { useCallback } from 'react';
import { approveAuthRequestV2, cancelAuthRequestV2, rejectAuthRequestV2 } from '../messaging';
import useCheckEmptyConfirmationRequests from 'hooks/useCheckEmptyConfirmationRequests';

export type ConfirmationType = keyof ConfirmationSlice['details'];

interface ConfirmationRs {
  confirmationRequests: ConfirmationSlice['details'];
  cancelRequest: (type: ConfirmationType, id: string) => Promise<void>;
  approveRequest: (type: ConfirmationType, id: string, payload: unknown) => Promise<void>;
  rejectRequest: (type: ConfirmationType, id: string) => Promise<void>;
  isEmptyRequests: boolean;
}

export default function useConfirmations(): ConfirmationRs {
  const confirmationRequests = useSelector((state: RootState) => state.confirmation.details);
  const isEmptyRequests = useCheckEmptyConfirmationRequests();

  const cancelRequest = useCallback((type: ConfirmationType, id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (type === 'authorizeRequest') {
        cancelAuthRequestV2(id)
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
    confirmationRequests,
    cancelRequest,
    approveRequest,
    rejectRequest,
    isEmptyRequests,
  };
}
