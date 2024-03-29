import { useMemo } from 'react';
import { PredefinedLedgerNetwork } from 'constants/ledger';

const useGetSupportedLedger = () => {
  return useMemo(() => [...PredefinedLedgerNetwork], []);
};

export default useGetSupportedLedger;
