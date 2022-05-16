// Copyright 2015-2020 Parity Technologies (UK) Ltd.
// Modifications Copyright (c) 2021-2022 Thibaut Sardan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// import {SubstrateNetworkParams} from '../types/networkTypes';
import {
  EthereumParsedData,
  ParsedData,
  SubstrateCompletedParsedData,
  SubstrateMultiParsedData,
} from '../types/scannerTypes';
import {blake2b} from './native';

import {
  compactFromU8a,
  hexStripPrefix,
  hexToU8a,
  u8aToHex,
} from '@polkadot/util';
import {encodeAddress} from '@polkadot/util-crypto';

// from https://github.com/maciejhirsz/uos#substrate-payload
const CRYPTO_ED25519 = '00';
const CRYPTO_SR25519 = '01';
const CMD_SIGN_MORTAL = '00';
const CMD_SIGN_HASH = '01';
const CMD_SIGN_IMMORTAL = '02';
const CMD_SIGN_MSG = '03';

const strings = {
  ERROR_ADDRESS_MESSAGE:
    'QR code not supported, please make sure you are scanning a transaction from a supported software.',
  ERROR_NO_NETWORK:
    'Stylo does not currently recognize a chain with genesis hash, please add the network first',
  ERROR_NO_RAW_DATA: 'There is no raw data from the request',
  ERROR_NO_SENDER_FOUND: 'There is no related account in the app',
  ERROR_NO_SENDER_IDENTITY: 'There is no related identity in the app',
  ERROR_TITLE: 'Unable to parse QR data',
  ERROR_WRONG_RAW:
    'Frames number is too big, the QR seems not to be a recognized extrinsic raw data',
  INFO_ETH_TX: 'You are about to send the following amount',
  INFO_MULTI_PART:
    'You are about to send the following extrinsic. We will sign the hash of the payload as it is oversized.',
  SUCCESS_ADD_NETWORK: 'Successfully updated new network: ',
  SUCCESS_TITLE: 'Success',
};

/*
 * @return strippedData: the rawBytes from react-native-camera, stripped of the ec11 padding to fill the frame size. See: decoders.js
 * N.B. Substrate oversized/multipart payloads will already be hashed at this point.
 */
export function rawDataToU8A(rawData: string): Uint8Array | null {
  if (!rawData) {
    return null;
  }

  // Strip filler bytes padding at the end
  if (rawData.substr(-2) === 'ec') {
    rawData = rawData.substr(0, rawData.length - 2);
  }

  while (rawData.substr(-4) === 'ec11') {
    rawData = rawData.substr(0, rawData.length - 4);
  }

  // Verify that the QR encoding is binary and it's ending with a proper terminator
  if (rawData.substr(0, 1) !== '4' || rawData.substr(-1) !== '0') {
    return null;
  }

  // Strip the encoding indicator and terminator for ease of reading
  rawData = rawData.substr(1, rawData.length - 2);

  const length8 = parseInt(rawData.substr(0, 2), 16) || 0;
  const length16 = parseInt(rawData.substr(0, 4), 16) || 0;
  let length = 0;

  // Strip length prefix
  if (length8 * 2 + 2 === rawData.length) {
    rawData = rawData.substr(2);
    length = length8;
  } else if (length16 * 2 + 4 === rawData.length) {
    rawData = rawData.substr(4);
    length = length16;
  } else {
    return null;
  }

  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = parseInt(rawData.substr(i * 2, 2), 16);
  }

  return bytes;
}

/*
  Example Full Raw Data
  ---
  4 // indicates binary
  37 // indicates data length
  --- UOS Specific Data
  00 + // is it multipart?
  0001 + // how many parts in total?
  0000 +  // which frame are we on?
  53 // indicates payload is for Substrate
  01 // crypto: sr25519
  00 // indicates action: signData
  f4cd755672a8f9542ca9da4fbf2182e79135d94304002e6a09ffc96fef6e6c4c // public key
  544849532049532053504152544121 // actual payload to sign (should be SCALE or utf8)
  91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3 // genesis hash
  0 // terminator
  --- SQRC Filler Bytes
  ec11ec11ec11ec // SQRC filler bytes
  */

export async function constructDataFromBytes(
  bytes: Uint8Array,
  multipartComplete = false,
  networks: Record<string, number>,
): Promise<ParsedData> {
  const frameInfo = hexStripPrefix(u8aToHex(bytes.slice(0, 5)));
  const frameCount = parseInt(frameInfo.substr(2, 4), 16);
  const isMultipart = frameCount > 1; // for simplicity, even single frame payloads are marked as multipart.

  if (frameCount > 50) {
    throw new Error(strings.ERROR_WRONG_RAW);
  }
  const currentFrame = parseInt(frameInfo.substr(6, 4), 16);
  const uosAfterFrames = hexStripPrefix(u8aToHex(bytes.slice(5)));

  // UOS after frames can be metadata json
  if (isMultipart && !multipartComplete) {
    const partData: SubstrateMultiParsedData = {
      currentFrame,
      frameCount,
      isMultipart,
      partData: uosAfterFrames,
    };

    return partData;
  }

  const zerothByte = uosAfterFrames.substr(0, 2);
  const firstByte = uosAfterFrames.substr(2, 2);
  const secondByte = uosAfterFrames.substr(4, 2);

  let action;

  try {
    // decode payload appropriately via UOS
    switch (zerothByte) {
      case '45': {
        // Ethereum UOS payload
        // for consistency with legacy data format.
        const data = {data: {}} as EthereumParsedData;

        action =
          firstByte === '00' || firstByte === '01'
            ? 'signData'
            : firstByte === '01'
            ? 'signTransaction'
            : null;
        const address = uosAfterFrames.substr(4, 44);

        data.action = action;
        data.data.account = address;

        if (action === 'signData') {
          data.data.rlp = uosAfterFrames[13];
        } else if (action === 'signTransaction') {
          data.data.data = uosAfterFrames[13];
        } else {
          console.error('Could not determine action type.');
          throw new Error();
        }

        return data;
      }

      case '53': {
        // Substrate UOS payload
        // for consistency with legacy data format.
        const data = {data: {}} as SubstrateCompletedParsedData;

        try {
          data.data.crypto =
            firstByte === CRYPTO_ED25519
              ? 'ed25519'
              : firstByte === CRYPTO_SR25519
              ? 'sr25519'
              : null;
          const pubKeyHex = uosAfterFrames.substr(6, 64);
          const publicKeyAsBytes = hexToU8a('0x' + pubKeyHex);
          const hexEncodedData = '0x' + uosAfterFrames.slice(70);
          const hexPayload = hexEncodedData.slice(0, -64);
          const specVersion = parseInt(hexEncodedData.substr(-70, -64), 10);
          const genesisHash = `0x${hexEncodedData.substr(-64)}`;
          const rawPayload = hexToU8a(hexPayload);

          console.debug('What read from QR: ', pubKeyHex, hexEncodedData, hexPayload, specVersion, genesisHash)

          data.data.specVersion = specVersion;

          data.data.genesisHash = genesisHash;
          const isOversized = rawPayload.length > 256;
          const prefix = networks[genesisHash];

          if (!prefix) {
            console.error(strings.ERROR_NO_NETWORK);
            throw new Error();
          }

          // switch (secondByte) {
          //   case CMD_SIGN_MORTAL:
          //   case CMD_SIGN_IMMORTAL:
          //     data.action = 'signTransaction';
          //     data.oversized = isOversized;
          //     data.isHash = isOversized;
          //     const [offset] = compactFromU8a(rawPayload);
          //     const payload = rawPayload.subarray(offset);
          //
          //     data.data.rawPayload = rawPayload;
          //     data.data.data = isOversized
          //       ? await blake2b(u8aToHex(payload, -1, false))
          //       : rawPayload;
          //     // encode to the prefix;
          //     data.data.account = encodeAddress(publicKeyAsBytes, prefix);
          //
          //     break;
          //   case CMD_SIGN_HASH:
          //   case CMD_SIGN_MSG:
          //     data.action = 'signData';
          //     data.oversized = false;
          //     data.isHash = secondByte === CMD_SIGN_HASH ? true : false;
          //     data.data.data = hexPayload;
          //     data.data.account = encodeAddress(publicKeyAsBytes, prefix); // default to Kusama
          //     break;
          //   default:
          //     break;
          // }
        } catch (e) {
          console.log(e);
          throw new Error(
            'Something went wrong decoding the Substrate UOS payload: ' +
              uosAfterFrames,
          );
        }

        return data;
      }

      default:
        throw new Error('Payload is not formated correctly: ' + bytes);
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error('unknown error :(');
    }
  }
}

export function decodeToString(message: Uint8Array): string {
  const encodedString = String.fromCharCode.apply(null, Array.from(message));

  return decodeURIComponent(escape(encodedString));
}

export function asciiToHex(message: string): string {
  const result = [];

  for (let i = 0; i < message.length; i++) {
    const hex = Number(message.charCodeAt(i)).toString(16);

    result.push(hex);
  }

  return result.join('');
}

export function isJsonString(str: any): boolean {
  if (!str) {
    return false;
  }

  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
}

export function isAddressString(str: string): boolean {
  if (!str) {
    return false;
  }

  return (
    str.substr(0, 2) === '0x' ||
    str.substr(0, 9) === 'ethereum:' ||
    str.substr(0, 10) === 'substrate:'
  );
}

export function encodeNumber(value: number): Uint8Array {
  return new Uint8Array([value >> 8, value & 0xff]);
}
