import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ConfirmationSlice } from 'stores/types';
import { useCallback } from 'react';
import { approveAuthRequestV2, cancelAuthRequestV2, rejectAuthRequestV2 } from '../messaging';

export type ConfirmationType = keyof ConfirmationSlice['details'];

interface ConfirmationRs {
  confirmationRequests: ConfirmationSlice['details'];
  cancelRequest: (type: ConfirmationType, id: string) => Promise<() => void>;
  approveRequest: (type: ConfirmationType, id: string, payload: unknown) => Promise<() => void>;
  rejectRequest: (type: ConfirmationType, id: string) => Promise<() => void>;
}

export default function useConfirmations(): ConfirmationRs {
  const confirmationRequests = useSelector((state: RootState) => state.confirmation.details);

  const cancelRequest = useCallback((type: ConfirmationType, id: string) => {
    if (type === 'authorizeRequest') {
      return new Promise<() => void>((resolve, reject) => {
        cancelAuthRequestV2(id)
          .then(() => resolve)
          .catch(reject);
      });
    }

    return new Promise<() => void>(resolve => resolve);
  }, []);

  const approveRequest = useCallback((type: ConfirmationType, id: string, payload: unknown) => {
    if (type === 'authorizeRequest') {
      return new Promise<() => void>((resolve, reject) => {
        approveAuthRequestV2(id, payload as string[])
          .then(() => resolve)
          .catch(reject);
      });
    }
    //
    return new Promise<() => void>(resolve => resolve);
  }, []);

  const rejectRequest = useCallback((type: ConfirmationType, id: string) => {
    if (type === 'authorizeRequest') {
      return new Promise<() => void>((resolve, reject) => {
        rejectAuthRequestV2(id)
          .then(() => resolve)
          .catch(reject);
      });
    }

    return new Promise<() => void>(resolve => resolve);
  }, []);

  return {
    confirmationRequests,
    cancelRequest,
    approveRequest,
    rejectRequest,
  };
}
