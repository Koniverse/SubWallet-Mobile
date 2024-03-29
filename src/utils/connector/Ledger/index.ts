import { ConvertLedgerError } from 'types/ledger';

export const convertLedgerError = (err: Error, network: string, expandError = true): ConvertLedgerError => {
  const error = err;
  const message = error.message;
  const name = error.name;

  switch (name) {
    case 'TransportInterfaceNotAvailable':
      return {
        status: 'error',
        message: 'Please make sure that this browser tab is the only tab connecting to Ledger',
      };
  }

  if (message.includes('Locked device')) {
    return {
      status: 'warning',
      message: 'Please unlock your Ledger',
    };
  }

  if (
    message.includes('App does not seem to be open') || // App not open
    message.includes('Unknown Status Code: 28161') || // Substrate stay in dashboard
    message.includes('CLA_NOT_SUPPORTED (0x6e00)') // Evm wrong app
  ) {
    return {
      status: 'error',
      message: `Open ${network} on Ledger to connect`,
    };
  }

  // Required blind signing or sign on a not registry network
  if (message.includes('Please enable Blind signing or Contract data in the Ethereum app Settings')) {
    return {
      status: 'error',
      message: 'Please open the Ethereum app and enable Blind signing or Contract data',
    };
  }

  // Have a request in queue
  if (
    message.includes('Cannot set property message of  which has only a getter') || // EVM
    message.includes("Failed to execute 'transferIn' on 'USBDevice'") || // Substrate
    message.includes("Failed to execute 'transferOut' on 'USBDevice'") // Substrate
  ) {
    return {
      status: 'error',
      message: 'Another request is in queue. Please try again later',
    };
  }

  // User reject request
  if (
    message.includes('User rejected') || // EVM
    message.includes('Transaction rejected') // Substrate
  ) {
    return {
      status: 'error',
      message: 'Rejected by user',
    };
  }

  // App transaction version out of data
  if (message.includes('Txn version not supported')) {
    return {
      status: 'error',
      message: `${network} is out of date. Please update your device with Ledger Live`,
    };
  }

  console.warn('Unknown ledger error', { error });

  if (expandError) {
    return {
      status: 'error',
      message: message,
    };
  }

  return {
    status: 'error',
    message: 'Fail to connect. Click to retry',
  };
};
