import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';

export const handleBasicTxResponse = (
  data: BasicTxResponse,
  balanceError: boolean,
  setError: (val: string[] | undefined) => void,
  setLoading: (val: boolean) => void,
): boolean => {
  if (balanceError) {
    setError([i18n.warningMessage.balanceTooLow]);
    setLoading(false);
    return true;
  }

  if (data.passwordError) {
    setError([data.passwordError]);
    setLoading(false);
    return true;
  }

  if (data.txError) {
    setError([i18n.errorMessage.unknownError]);
    setLoading(false);
    return true;
  }

  return false;
};
