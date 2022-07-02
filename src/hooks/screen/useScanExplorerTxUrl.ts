import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getScanExplorerTransactionHistoryUrl } from 'utils/index';

export default function useScanExplorerTxUrl(networkKey: string, hash?: string) {
  const { networkMap } = useSelector((state: RootState) => state);

  if (!hash) {
    return '';
  }

  const blockExplorer = networkMap[networkKey]?.blockExplorer;

  if (blockExplorer) {
    return `${blockExplorer}/extrinsic/${hash}`;
  } else {
    return getScanExplorerTransactionHistoryUrl(networkKey, hash);
  }
}
