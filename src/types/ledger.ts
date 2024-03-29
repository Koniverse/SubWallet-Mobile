import { AccountOptions, LedgerAddress, LedgerSignature, LedgerVersion } from '@polkadot/hw-ledger/types';

export type LedgerTypes = 'hid' | 'webusb' | 'bluetooth';

export abstract class Ledger {
  abstract getAddress(
    confirm?: boolean,
    accountOffset?: number,
    addressOffset?: number,
    accountOptions?: Partial<AccountOptions>,
  ): Promise<LedgerAddress>;

  abstract getVersion(): Promise<LedgerVersion>;

  abstract signTransaction(
    message: Uint8Array,
    accountOffset?: number,
    addressOffset?: number,
    accountOptions?: Partial<AccountOptions>,
  ): Promise<LedgerSignature>;
  abstract signMessage(
    message: Uint8Array,
    accountOffset?: number,
    addressOffset?: number,
    accountOptions?: Partial<AccountOptions>,
  ): Promise<LedgerSignature>;
  abstract disconnect(): Promise<void>;
}

export type LedgerErrorStatus = 'warning' | 'error';

export interface ConvertLedgerError {
  status: LedgerErrorStatus;
  message: string;
}
