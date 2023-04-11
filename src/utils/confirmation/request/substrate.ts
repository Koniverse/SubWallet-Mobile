import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';

export const isRawPayload = (payload: SignerPayloadJSON | SignerPayloadRaw): payload is SignerPayloadRaw => {
  return !!(payload as SignerPayloadRaw).data;
};
