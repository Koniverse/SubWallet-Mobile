// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwapRequest, SwapSubmitParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types/swap';
import { sendMessage } from '..';

export async function handleSwapRequestV2(request: SwapRequest) {
  return sendMessage('pri(swapService.handleSwapRequestV2)', request);
}

export async function handleSwapStep(request: SwapSubmitParams) {
  return sendMessage('pri(swapService.handleSwapStep)', request);
}

export async function validateSwapProcess(request: ValidateSwapProcessParams) {
  return sendMessage('pri(swapService.validateSwapProcess)', request);
}
