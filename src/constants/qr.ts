export const SUBSTRATE_PREFIX = 'substrate';
export const ETHEREUM_PREFIX = 'ethereum';
export const SECRET_PREFIX = 'secret';

export enum SCAN_TYPE {
  SECRET = 'SECRET',
  QR_SIGNER = 'QR_SIGNER',
  READONLY = 'READONLY',
  TEXT = 'TEXT',
}

export enum SCANNER_QR_STEP {
  SCAN_STEP = 'SCAN_STEP',
  CONFIRM_STEP = 'CONFIRM_STEP',
  FINAL_STEP = 'FINAL_STEP',
}

export const ETHEREUM_ID = new Uint8Array([0x45]);
export const SUBSTRATE_ID = new Uint8Array([0x53]);
export const CRYPTO_SR25519 = new Uint8Array([0x01]);
export const CRYPTO_ETHEREUM = new Uint8Array([0x03]);
export const CMD = {
  ETHEREUM: {
    SIGN_HASH: 0,
    SIGN_TRANSACTION: 1,
    SIGN_MESSAGE: 2,
  },
  SUBSTRATE: {
    SIGN_MORTAL: 0,
    SIGN_HASH: 1,
    SIGN_IMMORTAL: 2,
    SIGN_MSG: 3,
  },
};
