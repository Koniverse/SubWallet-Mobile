import useSetupAccounts from 'hooks/store/useSetupAccounts';
import useSetupPrice from 'hooks/store/useSetupPrice';
import useSetupChainRegistry from 'hooks/store/useSetupChainRegistry';
import useSetupNetworkMap from 'hooks/store/useSetupNetworkMap';
import useSetupBalance from 'hooks/store/useSetupBalance';
import useSetupTransactionHistory from 'hooks/store/useSetupTransactionHistory';
import useSetupSettings from 'hooks/store/useSetupSettings';

export default function useSetupStore(status?: string): void {
  const isWebRunnerReady = status === 'crypto_ready';

  useSetupAccounts(isWebRunnerReady);
  useSetupSettings(isWebRunnerReady);
  useSetupNetworkMap(isWebRunnerReady);
  useSetupChainRegistry(isWebRunnerReady);
  useSetupPrice(isWebRunnerReady);
  useSetupBalance(isWebRunnerReady);
  useSetupTransactionHistory(isWebRunnerReady);
}
