// Copyright 2017-2024 @polkadot/hw-ledger authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubstrateApp } from '@zondax/ledger-substrate';
import type { AccountOptions, LedgerAddress, LedgerSignature, LedgerVersion } from '@polkadot/hw-ledger/types.js';

import { newSubstrateApp } from '@zondax/ledger-substrate';
import { hexAddPrefix, u8aToBuffer, u8aToHex, u8aWrapBytes } from '@polkadot/util';

import { ledgerApps } from '@polkadot/hw-ledger/defaults';
import { LEDGER_DEFAULT_ACCOUNT, LEDGER_DEFAULT_CHANGE, LEDGER_DEFAULT_INDEX } from '@polkadot/hw-ledger/constants';
import { Ledger } from 'types/ledger';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { hexToStr } from '@subwallet/extension-base/utils';

type Chain = keyof typeof ledgerApps;

type WrappedResult = Awaited<ReturnType<SubstrateApp['getAddress' | 'getVersion' | 'sign']>>;

const mappingError = (error: string): string => {
  if (error.includes('(0x6511)')) {
    return 'App does not seem to be open';
  }

  if (error.includes('(0x6985)')) {
    return 'User rejected';
  }

  if (error.includes('(0x6b0c)') || error.includes('(0x5515)')) {
    return 'Your ledger is locked';
  }

  return error;
};

/** @internal Wraps a SubstrateApp call, checking the result for any errors which result in a rejection */
async function wrapError<T extends WrappedResult>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    const error = e as Error;

    error.message = mappingError(error.message);

    throw error;
  }
}

/** @internal Wraps a sign/signRaw call and returns the associated signature */
function sign(
  method: 'sign' | 'signRaw',
  message: Uint8Array,
  accountOffset = 0,
  addressOffset = 0,
  {
    account = LEDGER_DEFAULT_ACCOUNT,
    addressIndex = LEDGER_DEFAULT_INDEX,
    change = LEDGER_DEFAULT_CHANGE,
  }: Partial<AccountOptions> = {},
): (app: SubstrateApp) => Promise<LedgerSignature> {
  return async (app: SubstrateApp): Promise<LedgerSignature> => {
    const { signature } = await wrapError(
      app[method](account + accountOffset, change, addressIndex + addressOffset, u8aToBuffer(message)),
    );

    return {
      signature: hexAddPrefix(signature.toString('hex')),
    };
  };
}

/**
 * @name Ledger
 *
 * @description
 * A very basic wrapper for a ledger app -
 *   - it connects automatically on use, creating an underlying interface as required
 *   - Promises reject with errors (unwrapped errors from @zondax/ledger-substrate)
 */
export class SubstrateLedger extends Ledger {
  readonly #ledgerName: string;
  readonly #transport: TransportBLE;

  #app: SubstrateApp | null = null;

  constructor(transport: TransportBLE, chain: Chain) {
    super();
    const ledgerName = ledgerApps[chain];

    if (!ledgerName) {
      throw new Error(`Unsupported Ledger chain ${chain}`);
    } else if (!transport) {
      throw new Error(`Unsupported Ledger transport ${transport}`);
    }

    this.#ledgerName = ledgerName;
    this.#transport = transport;
  }

  /**
   * Returns the address associated with a specific account & address offset. Optionally
   * asks for on-device confirmation
   */
  getAddress(
    confirm = false,
    accountOffset = 0,
    addressOffset = 0,
    {
      account = LEDGER_DEFAULT_ACCOUNT,
      addressIndex = LEDGER_DEFAULT_INDEX,
      change = LEDGER_DEFAULT_CHANGE,
    }: Partial<AccountOptions> = {},
  ): Promise<LedgerAddress> {
    return this.withApp(async (app: SubstrateApp): Promise<LedgerAddress> => {
      const { address, pubKey } = await wrapError(
        app.getAddress(account + accountOffset, change, addressIndex + addressOffset, confirm),
      );

      const transformAddress = new Uint8Array(address.split(',').map(a => parseInt(a)));
      const transformPubKey = new Uint8Array(pubKey.split(',').map(p => parseInt(p)));

      return {
        address: hexToStr(u8aToHex(transformAddress)),
        publicKey: hexAddPrefix(hexToStr(u8aToHex(transformPubKey))),
      };
    });
  }

  /**
   * Returns the version of the Ledger application on the device
   */
  public async getVersion(): Promise<LedgerVersion> {
    return this.withApp(async (app: SubstrateApp): Promise<LedgerVersion> => {
      const { device_locked: isLocked, major, minor, patch, test_mode: isTestMode } = await wrapError(app.getVersion());

      return {
        isLocked,
        isTestMode,
        version: [major, minor, patch],
      };
    });
  }

  /**
   * Signs a transaction on the Ledger device
   */
  public async signTransaction(
    message: Uint8Array,
    accountOffset?: number,
    addressOffset?: number,
    options?: Partial<AccountOptions>,
  ): Promise<LedgerSignature> {
    return this.withApp(sign('sign', message, accountOffset, addressOffset, options));
  }

  /**
   * Signs a message (non-transactional) on the Ledger device
   */
  public async signMessage(
    message: Uint8Array,
    accountOffset?: number,
    addressOffset?: number,
    options?: Partial<AccountOptions>,
  ): Promise<LedgerSignature> {
    return this.withApp(sign('signRaw', u8aWrapBytes(message), accountOffset, addressOffset, options));
  }

  /**
   * @internal
   *
   * Returns a created SubstrateApp to perform operations against. Generally
   * this is only used internally, to ensure consistent bahavior.
   */
  withApp = async <T>(fn: (app: SubstrateApp) => Promise<T>): Promise<T> => {
    try {
      if (!this.#app) {
        this.#app = newSubstrateApp(this.#transport as any, this.#ledgerName);
      }

      return await fn(this.#app);
    } catch (error) {
      this.#app = null;

      throw error;
    }
  };

  disconnect(): Promise<void> {
    return this.withApp(async app => {
      await app.transport.close();
    });
  }
}
