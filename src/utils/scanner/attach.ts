import { isEthereumAddress } from '@polkadot/util-crypto';
import { isHex } from '@polkadot/util';
import { ETHEREUM_PREFIX, SCAN_TYPE, SECRET_PREFIX, SUBSTRATE_PREFIX } from 'constants/qr';
import { QrAccount } from 'types/qr/attach';
import { reformatAddress } from 'utils/account/account';

export const qrSignerScan = (data: string): QrAccount | null => {
  const arr: string[] = data.split(':');

  let prefix = arr[0];
  let content = '';
  let genesisHash = '';
  let name: string[] = [];
  let isEthereum = false;

  if (prefix === SUBSTRATE_PREFIX) {
    [content, genesisHash, ...name] = arr.slice(1);
  } else if (prefix === ETHEREUM_PREFIX) {
    [content, ...name] = arr.slice(1);
    genesisHash = content.split('@')[1] || '';
    content = content.substring(0, 42);
    isEthereum = true;
  } else {
    return null;
  }

  return {
    content,
    genesisHash,
    isAddress: true,
    isEthereum,
    name: name.length ? name.join(':') : undefined,
    isReadOnly: false,
  };
};

export const importQrScan = (data: string): QrAccount | null => {
  const arr: string[] = data.split(':');

  let prefix = arr[0];
  let content = '';
  let genesisHash = '';
  let name: string[] = [];
  let isEthereum = false;

  if (prefix === SECRET_PREFIX) {
    [content, genesisHash, ...name] = arr.slice(1);
  } else {
    return null;
  }

  return {
    content,
    genesisHash,
    isAddress: false,
    isEthereum,
    name: name.length ? name.join(':') : undefined,
    isReadOnly: false,
  };
};

export const readOnlyScan = (data: string): QrAccount | null => {
  if (!data) {
    return null;
  }

  if (isEthereumAddress(data)) {
    return {
      content: data,
      genesisHash: data,
      isAddress: true,
      isEthereum: true,
      name: undefined,
      isReadOnly: true,
    };
  }

  try {
    if (isHex(data)) {
      return null;
    }

    const address = reformatAddress(data);
    return {
      content: address,
      genesisHash: data,
      isAddress: true,
      isEthereum: false,
      name: undefined,
      isReadOnly: true,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getFunctionScan = (type: SCAN_TYPE): ((data: string) => QrAccount | null) => {
  switch (type) {
    case SCAN_TYPE.READONLY:
      return readOnlyScan;
    case SCAN_TYPE.SECRET:
      return importQrScan;
    case SCAN_TYPE.QR_SIGNER:
    default:
      return qrSignerScan;
  }
};
