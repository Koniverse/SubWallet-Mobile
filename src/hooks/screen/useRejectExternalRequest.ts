// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MANUAL_CANCEL_EXTERNAL_REQUEST } from 'constants/signer';
import { ExternalRequestContext } from 'providers/ExternalRequestContext';
import { QrSignerContext } from 'providers/QrSignerContext';
import { SigningContext } from 'providers/SigningContext';
import { rejectExternalRequest } from 'messaging/index';
import { useCallback, useContext } from 'react';

interface Result {
  handlerReject: (externalId: string) => Promise<void>;
}

export const useRejectExternalRequest = (): Result => {
  const { cleanQrState } = useContext(QrSignerContext);
  const { cleanExternalState } = useContext(ExternalRequestContext);
  const { cleanSigningState } = useContext(SigningContext);

  const handlerReject = useCallback(
    async (externalId: string) => {
      if (externalId) {
        await rejectExternalRequest({ id: externalId, message: MANUAL_CANCEL_EXTERNAL_REQUEST });
      }

      cleanQrState();
      cleanExternalState();
      cleanSigningState();
    },
    [cleanQrState, cleanExternalState, cleanSigningState],
  );

  return {
    handlerReject: handlerReject,
  };
};
