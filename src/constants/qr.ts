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
