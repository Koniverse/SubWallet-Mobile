import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ConfirmationSlice } from 'stores/types';
import { useCallback } from 'react';

export type ConfirmationType = keyof ConfirmationSlice['details'];

interface ConfirmationRs {
  confirmationRequests: ConfirmationSlice['details'];
  cancel: (type: ConfirmationType, id: string) => void;
  approve: (type: ConfirmationType, id: string, payload: any) => void;
  reject: (type: ConfirmationType, id: string) => void;
}

export default function useConfirmations(): ConfirmationRs {
  const confirmationRequests = useSelector((state: RootState) => state.confirmation.details);

  const cancel = useCallback((type: ConfirmationType, id: string) => {}, []);

  const approve = useCallback((type: ConfirmationType, id: string, payload: any) => {}, []);

  const reject = useCallback((type: ConfirmationType, id: string) => {}, []);

  return {
    confirmationRequests,
    cancel,
    approve,
    reject,
  };
}
